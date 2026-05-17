/**
 * POST /api/projects/[id]/observaciones-banco/[obsId]/aplicada
 *
 * Marca una observación del banco como aplicada (guarda contenido_despues y
 * aplicado_at). Llamada fire-and-forget desde el frontend cuando el usuario
 * aprueba el diff propuesto.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import { dbMarcarObservacionAplicada } from "@/lib/db/observacionesBanco";

type Params = { params: Promise<{ id: string; obsId: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id: proyectoId, obsId } = await params;

    const proyecto = await dbGetProyecto(proyectoId);
    if (!proyecto || (proyecto.usuario_id !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    const body = (await req.json().catch(() => ({}))) as { contenido_despues?: string };
    const contenidoDespues = typeof body.contenido_despues === "string" ? body.contenido_despues : "";

    await dbMarcarObservacionAplicada(obsId, contenidoDespues);

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
