/**
 * GET  /api/projects  — Lista los proyectos del usuario autenticado
 * POST /api/projects  — Crea un nuevo proyecto vinculado a un servicio
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbCreateProyecto, dbListProyectos } from "@/lib/db";
import { completedPhaseIndexForProject, serviceIdForProjectType, projectTypeIdForService } from "@/lib/projectTypePhases";

// ── GET ───────────────────────────────────────────────────────

export async function GET() {
  try {
    const { user } = await requireAuth();
    const proyectos = await dbListProyectos(user.id);

    return NextResponse.json({
      proyectos: proyectos.map(p => {
        const ctx = (p.academic_context ?? {}) as Record<string, unknown>;
        const defensa = ctx.defensa_materiales as { estado?: string; notificado_at?: string } | undefined;
        return {
          ...p,
          estado_fase: completedPhaseIndexForProject(p),
          servicios: { id: p.servicio_id, nombre: "Monografía Académica", audiencia_id: "local" },
          defensa_lista: defensa?.estado === "listo",
          defensa_notificado_at: defensa?.notificado_at ?? null,
        };
      }),
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ── POST ──────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { user } = await requireAuth();
    const body = await req.json();

    const {
      tipo_proyecto_id,
      universidad_id,
      tema_aprobado,
      titulo_provisional,
      modalidad_creacion,
      // 🎓 Modalidad de titulación universidad-específica.
      // Hoy solo lo usa UNIFRANZ Cochabamba para distinguir entre sus
      // 5 modalidades oficiales (Tesis, PG-PreFact, PG-MejoraOrg,
      // PG-Artefacto, Trabajo Dirigido). Otras universidades lo dejan vacío.
      modalidad_titulacion,
    } = body;
    const academic_context = body.academic_context && typeof body.academic_context === "object"
      ? body.academic_context as Record<string, unknown>
      : {};
    const servicio_id = body.servicio_id || serviceIdForProjectType(tipo_proyecto_id);
    const resolvedTipoProyectoId = tipo_proyecto_id || projectTypeIdForService(servicio_id);

    if (!servicio_id) {
      return NextResponse.json({ error: "servicio_id es requerido" }, { status: 400 });
    }

    const proyecto = await dbCreateProyecto({
      usuario_id: user.id,
      servicio_id,
      tipo_proyecto_id: resolvedTipoProyectoId,
      universidad_id: universidad_id ?? undefined,
      modalidad_titulacion: typeof modalidad_titulacion === "string" && modalidad_titulacion.trim()
        ? modalidad_titulacion.trim()
        : null,
      modalidad_creacion: modalidad_creacion ?? "directa",
      tema_aprobado: tema_aprobado ?? null,
      titulo_provisional: titulo_provisional ?? null,
      estado_fase: 0,
      completado: false,
      oculto_por_usuario: false,
      academic_context,
      academic_memory: {},
      final_document: null,
      final_document_validation: {},
    });

    return NextResponse.json({ proyecto }, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
