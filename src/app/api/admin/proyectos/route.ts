/**
 * GET /api/admin/proyectos          - Lista todos los proyectos
 * GET /api/admin/proyectos?id=xxx   - Detalle completo con contenido de fases
 * DELETE /api/admin/proyectos?id=xx - Elimina definitivamente un proyecto
 * Solo accesible por admin.
 */
import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  getProyecto,
  proyectosStore,
  purgeProyecto,
  restoreProyecto,
} from "@/lib/memoryStore";
import { loadFromDisk } from "@/lib/persistence";

function mergeProjectWithMemory<T extends { id: string }>(project: T) {
  const memory = getProyecto(project.id);
  return memory
    ? {
        ...project,
        ...memory,
      }
    : project;
}

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      let proyecto = getProyecto(id);

      if (!proyecto && isSupabaseConfigured()) {
        const db = createAdminClient();
        const { data } = await db
          .from("proyectos_fases")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (data) {
          proyecto = mergeProjectWithMemory(data);
        }
      }

      if (!proyecto) {
        return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
      }

      return NextResponse.json({ proyecto });
    }

    try {
      const disk = loadFromDisk();
      if (disk.proyectos) {
        for (const [key, value] of Object.entries(disk.proyectos)) {
          if (!proyectosStore.has(key)) {
            proyectosStore.set(key, value as Parameters<typeof proyectosStore.set>[1]);
          }
        }
      }
    } catch {
      // ignore disk sync failures here; the in-memory state is still usable
    }

    const memProyectos = [...proyectosStore.values()].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        proyectos: memProyectos.map((project) => ({
          ...project,
          servicios: { id: project.servicio_id, nombre: "Monografia Academica" },
        })),
      });
    }

    const db = createAdminClient();
    const { data } = await db
      .from("proyectos_fases")
      .select(
        "id, usuario_id, tema_aprobado, titulo_provisional, estado_fase, completado, created_at, updated_at, servicios ( id, nombre )"
      )
      .order("created_at", { ascending: false });

    const memoryById = new Map(memProyectos.map((project) => [project.id, project]));
    const merged = (data ?? [])
      .map((project) => {
        const memory = memoryById.get(project.id);
        return memory
          ? {
              ...project,
              ...memory,
              servicios: project.servicios,
            }
          : project;
      })
      .concat(
        memProyectos
          .filter((project) => !(data ?? []).some((item) => item.id === project.id))
          .map((project) => ({
            ...project,
            servicios: { id: project.servicio_id, nombre: "Monografia Academica" },
          }))
      )
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return NextResponse.json({ proyectos: merged });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Falta el id del proyecto" }, { status: 400 });
    }

    let removedFromSupabase = false;

    if (isSupabaseConfigured()) {
      const db = createAdminClient();
      const { error } = await db.from("proyectos_fases").delete().eq("id", id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      removedFromSupabase = true;
    }

    const removedFromMemory = purgeProyecto(id);

    if (!removedFromSupabase && !removedFromMemory) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      removed: {
        supabase: removedFromSupabase,
        memory: removedFromMemory,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();

    const body = (await req.json().catch(() => null)) as
      | { id?: string; action?: string }
      | null;
    const id = body?.id;
    const action = body?.action;

    if (!id) {
      return NextResponse.json({ error: "Falta el id del proyecto" }, { status: 400 });
    }

    if (action !== "restore") {
      return NextResponse.json({ error: "Accion no soportada" }, { status: 400 });
    }

    const restored = restoreProyecto(id);

    if (restored) {
      return NextResponse.json({ success: true, proyecto: restored, source: "memory" });
    }

    if (isSupabaseConfigured()) {
      const db = createAdminClient();
      const { data, error } = await db
        .from("proyectos_fases")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (data) {
        return NextResponse.json({
          success: true,
          proyecto: data,
          source: "supabase",
        });
      }
    }

    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
