/**
 * GET  /api/payments  — Listar solicitudes del usuario autenticado
 * POST /api/payments  — Crear nueva solicitud de pago
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbCreateSolicitudPago, dbListSolicitudesByUser, dbGetPaymentConfig } from "@/lib/db/payments";
import { dbGetUser } from "@/lib/db";

const PRECIOS: Record<string, number> = { estandar: 150, pro: 300 };
const METODOS_VALIDOS = ["tigo_money", "qr_bancario", "transferencia"];

export async function GET() {
  try {
    const { user } = await requireAuth();
    const solicitudes = dbListSolicitudesByUser(user.id);
    const config = dbGetPaymentConfig();
    return NextResponse.json({ ok: true, solicitudes, payment_config: config });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await requireAuth();
    const body = await req.json().catch(() => ({})) as {
      plan?: string;
      metodo?: string;
      notas_usuario?: string;
    };

    const { plan, metodo, notas_usuario } = body;

    if (!plan || !PRECIOS[plan]) {
      return NextResponse.json({ error: "Plan inválido (estandar | pro)" }, { status: 400 });
    }
    if (!metodo || !METODOS_VALIDOS.includes(metodo)) {
      return NextResponse.json({ error: "Método inválido" }, { status: 400 });
    }

    // Solo una solicitud pendiente por vez
    const existentes = dbListSolicitudesByUser(user.id);
    const pendiente = existentes.find(s => s.estado === "pendiente");
    if (pendiente) {
      return NextResponse.json({ error: "Ya tienes una solicitud pendiente", solicitud_id: pendiente.id }, { status: 409 });
    }

    const dbUser = await dbGetUser(user.id);

    const solicitud = dbCreateSolicitudPago({
      usuario_id: user.id,
      usuario_email: dbUser?.email ?? user.email,
      usuario_nombre: dbUser?.name ?? user.name,
      plan: plan as "estandar" | "pro",
      monto_bs: PRECIOS[plan],
      metodo: metodo as "tigo_money" | "qr_bancario" | "transferencia",
      estado: "pendiente",
      notas_usuario: notas_usuario?.trim() || undefined,
    });

    return NextResponse.json({ ok: true, solicitud });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
