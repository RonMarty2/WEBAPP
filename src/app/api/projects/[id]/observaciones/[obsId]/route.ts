/**
 * PATCH  /api/projects/[id]/observaciones/[obsId]  — Actualizar estado/notas
 * DELETE /api/projects/[id]/observaciones/[obsId]  — Eliminar
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import { dbGetObservacion, dbUpdateObservacion, dbDeleteObservacion } from "@/lib/db/observaciones";

type Params = Promise<{ id: string; obsId: string }>;

export async function PATCH(req: Request, { params }: { params: Params }) {
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

    const body = await req.json().catch(() => ({})) as {
      estado?: "pendiente" | "atendida" | "descartada";
      notas_usuario?: string;
      respuesta_ia?: string;
    };

    const patch: Parameters<typeof dbUpdateObservacion>[1] = {};
    if (body.estado) {
      patch.estado = body.estado;
      if (body.estado === "atendida") patch.atendida_at = new Date().toISOString();
    }
    if (body.notas_usuario !== undefined) patch.notas_usuario = body.notas_usuario;
    if (body.respuesta_ia !== undefined) patch.respuesta_ia = body.respuesta_ia;

    const updated = dbUpdateObservacion(obsId, patch);
    return NextResponse.json({ ok: true, observacion: updated });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
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

    dbDeleteObservacion(obsId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
