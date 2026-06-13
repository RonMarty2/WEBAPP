/**
 * POST /api/projects/[id]/observaciones/[obsId]/aplicar
 *
 * Recibe el texto nuevo aprobado por el estudiante (proveniente de
 * /regenerar) y lo escribe en phase_contents[capitulo_afectado]. Marca
 * la observación como atendida.
 *
 * Solo el dueño del proyecto (o admin) puede aplicar.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto, dbUpdateProyecto } from "@/lib/db";
import { dbGetObservacion, dbUpdateObservacion } from "@/lib/db/observaciones";

type Params = Promise<{ id: string; obsId: string }>;

export async function POST(req: Request, { params }: { params: Params }) {
  try {
    const { user } = await requireAuth();
    const { id, obsId } = await params;

    const proyecto = await dbGetProyecto(id);
    if (!proyecto || (proyecto.usuario_id !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    const obs = dbGetObservacion(obsId);
    if (!obs || obs.proyecto_id !== id) {
      return NextResponse.json({ error: "Observación no encontrada" }, { status: 404 });
    }

    if (!obs.capitulo_afectado) {
      return NextResponse.json(
        { error: "Esta observación no tiene capítulo asignado." },
        { status: 400 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as { texto_nuevo?: string };
    if (!body.texto_nuevo || !body.texto_nuevo.trim()) {
      return NextResponse.json({ error: "Falta texto_nuevo" }, { status: 400 });
    }

    const phaseContentsActual =
      ((proyecto as unknown as Record<string, unknown>).phase_contents as
        | Record<string, string>
        | undefined) ?? {};

    const phaseContentsNuevo = {
      ...phaseContentsActual,
      [obs.capitulo_afectado]: body.texto_nuevo.trim(),
    };

    await dbUpdateProyecto(id, {
      phase_contents: phaseContentsNuevo,
      // El documento final compilado deja de ser válido si reescribimos un cap.
      final_document: null,
      final_document_validation: {},
    });

    const obsActualizada = dbUpdateObservacion(obsId, {
      estado: "atendida",
      respuesta_ia: body.texto_nuevo.slice(0, 500) + (body.texto_nuevo.length > 500 ? "…" : ""),
    });

    return NextResponse.json({
      ok: true,
      capitulo: obs.capitulo_afectado,
      observacion: obsActualizada,
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[aplicar-obs]", e);
    return NextResponse.json({ error: (e as Error).message ?? "Error interno" }, { status: 500 });
  }
}
