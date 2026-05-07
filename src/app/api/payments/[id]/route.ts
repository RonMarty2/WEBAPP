/**
 * PATCH /api/payments/[id]  — Subir comprobante de pago
 * DELETE /api/payments/[id] — Cancelar solicitud pendiente
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetSolicitudPago, dbUpdateSolicitudPago } from "@/lib/db/payments";

type Params = Promise<{ id: string }>;

const MAX_B64_CHARS = 2_200_000; // ~1.6MB imagen

export async function PATCH(req: Request, { params }: { params: Params }) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const solicitud = dbGetSolicitudPago(id);
    if (!solicitud || solicitud.usuario_id !== user.id) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }
    if (solicitud.estado !== "pendiente") {
      return NextResponse.json({ error: "Esta solicitud ya fue procesada" }, { status: 409 });
    }

    const body = await req.json().catch(() => ({})) as {
      comprobante_b64?: string;
      comprobante_tipo?: string;
      notas_usuario?: string;
    };

    if (body.comprobante_b64 && body.comprobante_b64.length > MAX_B64_CHARS) {
      return NextResponse.json({ error: "El comprobante excede el tamaño máximo (1.6 MB)" }, { status: 413 });
    }

    const updated = dbUpdateSolicitudPago(id, {
      comprobante_b64: body.comprobante_b64 ?? solicitud.comprobante_b64,
      comprobante_tipo: body.comprobante_tipo ?? solicitud.comprobante_tipo,
      notas_usuario: body.notas_usuario ?? solicitud.notas_usuario,
    });

    return NextResponse.json({ ok: true, solicitud: updated });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const solicitud = dbGetSolicitudPago(id);
    if (!solicitud || solicitud.usuario_id !== user.id) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }
    if (solicitud.estado !== "pendiente") {
      return NextResponse.json({ error: "Solo se pueden cancelar solicitudes pendientes" }, { status: 409 });
    }

    dbUpdateSolicitudPago(id, { estado: "rechazado", notas_admin: "Cancelado por el usuario" });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
