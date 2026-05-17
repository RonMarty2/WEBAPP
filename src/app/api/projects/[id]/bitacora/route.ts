/**
 * GET /api/projects/[id]/bitacora
 *
 * Devuelve todas las observaciones analizadas del proyecto (banco), en orden
 * cronológico inverso. Cada fila incluye decisión, análisis IA y, si aplica,
 * la justificación lista para entregar al tutor.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import { dbListObservacionesBancoProyecto } from "@/lib/db/observacionesBanco";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const proyecto = await dbGetProyecto(id);
    if (!proyecto || (proyecto.usuario_id !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    const observaciones = await dbListObservacionesBancoProyecto(id);

    return NextResponse.json({
      ok: true,
      total: observaciones.length,
      observaciones,
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
