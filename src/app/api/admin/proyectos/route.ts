/**
 * GET /api/admin/proyectos          - Lista todos los proyectos
 * GET /api/admin/proyectos?id=xxx   - Detalle completo con contenido de fases
 * DELETE /api/admin/proyectos?id=xx - Elimina definitivamente un proyecto
 * Solo accesible por admin.
 */
import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import { dbGetProyecto, dbListAllProyectos, dbDeleteProyecto } from "@/lib/db";
import { restoreProyecto } from "@/lib/memoryStore";

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const proyecto = await dbGetProyecto(id);
      if (!proyecto) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
      return NextResponse.json({ proyecto });
    }

    const proyectos = await dbListAllProyectos();
    return NextResponse.json({
      proyectos: proyectos.map(p => ({
        ...p,
        servicios: { id: p.servicio_id, nombre: "Monografía Académica" },
      })),
    });
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

    const removed = await dbDeleteProyecto(id);
    if (!removed) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    return NextResponse.json({ success: true });
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

    const restored = restoreProyecto(id) ?? await dbGetProyecto(id);
    if (!restored) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    return NextResponse.json({ success: true, proyecto: restored });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
