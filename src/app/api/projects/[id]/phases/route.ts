/**
 * GET /api/projects/[id]/phases
 *
 * Endpoint público para el workspace del estudiante.
 * Retorna SOLO metadata de las fases (id, label, short_label, orden).
 * NUNCA expone el campo `prompt` — los megaprompts son IP del negocio
 * y solo el endpoint admin (con requireAdmin) puede leerlos.
 *
 * El estudiante necesita esta lista para:
 *  - Renderizar la barra de fases del workspace
 *  - Saber qué fase está activa, completada, pendiente
 *  - Disparar generación vía /api/projects/generate-phase
 *    (que lee el prompt internamente en el servidor sin exponerlo)
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import { phaseDefinitionsForProject } from "@/lib/projectTypePhases";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await requireAuth();
    const { id: proyectoId } = await context.params;

    // Verifica que el proyecto pertenece al usuario (o es admin)
    const proyecto = await dbGetProyecto(proyectoId);
    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }
    if (proyecto.usuario_id !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Resolución universal de fases (Scribe / PG genérico / PG UNIFRANZ por
    // modalidad). El resolver se encarga de elegir el camino correcto según
    // universidad_id + modalidad_titulacion + servicio_id del proyecto.
    const url = new URL(req.url);
    const servicioOverride = url.searchParams.get("servicio_id");
    const phases = phaseDefinitionsForProject({
      servicioId: servicioOverride || proyecto.servicio_id || "mono-001",
      tipoProyectoId: proyecto.tipo_proyecto_id,
      universidadId: proyecto.universidad_id,
      modalidadTitulacion: proyecto.modalidad_titulacion,
    });

    // ⚠️ STRIP del prompt — NUNCA lo enviamos al cliente
    const phasesPublic = phases.map((p) => ({
      id: p.id,
      label: p.label,
      short_label: p.short_label,
      orden: p.orden,
    }));

    return NextResponse.json({ phases: phasesPublic });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
