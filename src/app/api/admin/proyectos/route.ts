/**
 * GET /api/admin/proyectos          - Lista todos los proyectos enriquecidos
 *                                     (usuario, programa, universidad, progreso)
 * GET /api/admin/proyectos?id=xxx   - Detalle completo con contenido de fases
 * DELETE /api/admin/proyectos?id=xx - Elimina definitivamente un proyecto
 * Solo accesible por admin.
 */
import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import { dbGetProyecto, dbListAllProyectos, dbDeleteProyecto, dbListUsers } from "@/lib/db";
import { restoreProyecto } from "@/lib/memoryStore";
import { DEFAULT_UNIVERSITIES } from "@/lib/data";

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

    // Lista enriquecida con datos derivados para filtros y dashboard
    const [proyectos, usuarios] = await Promise.all([
      dbListAllProyectos(),
      dbListUsers(),
    ]);

    const usuariosById = new Map(usuarios.map(u => [u.id, u]));
    const univById = new Map(DEFAULT_UNIVERSITIES.map(u => [u.id, u.name]));

    const enriched = proyectos.map(p => {
      const usuario = p.usuario_id ? usuariosById.get(p.usuario_id) : null;
      const ctx = ((p as { academic_context?: Record<string, unknown> }).academic_context ?? {}) as Record<string, unknown>;
      const ctxIni = (ctx.contexto_inicial ?? {}) as Record<string, unknown>;
      const phaseContents = (p.phase_contents ?? {}) as Record<string, string | null | undefined>;

      // Contar fases completas (que tengan contenido en phase_contents).
      const totalFasesCompletas = Object.entries(phaseContents)
        .filter(([key, value]) =>
          !key.includes("_borrador") &&
          !key.startsWith("__") &&
          typeof value === "string" &&
          value.trim().length > 100,
        ).length;

      // Estado: completo / en curso / abandonado (sin actividad >30 días)
      const ultimaAct = (p as { updated_at?: string }).updated_at
        ?? (p as { created_at?: string }).created_at
        ?? null;
      const diasInactivo = ultimaAct
        ? Math.floor((Date.now() - new Date(ultimaAct).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      const estado = p.completado
        ? "completo"
        : diasInactivo > 30 && totalFasesCompletas < 6
          ? "abandonado"
          : "en_curso";

      return {
        ...p,
        servicios: { id: p.servicio_id, nombre: "Monografía Académica" },
        // Datos enriquecidos para la UI
        _meta: {
          usuario_email: usuario?.email ?? null,
          usuario_name: usuario?.name ?? null,
          usuario_plan: usuario?.plan ?? null,
          programa: String(ctxIni.programa ?? ""),
          modulos: String(ctxIni.modulos ?? ""),
          contexto_laboral: String(ctxIni.contexto_laboral ?? ctxIni.intereses_y_contexto ?? ""),
          universidad_nombre: p.universidad_id ? univById.get(p.universidad_id) ?? null : null,
          fases_completas: totalFasesCompletas,
          dias_inactivo: diasInactivo,
          estado,
          ultima_actividad: ultimaAct,
        },
      };
    });

    return NextResponse.json({ proyectos: enriched });
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
