/**
 * GET   /api/admin/payments         — Listar todas las solicitudes
 * PATCH /api/admin/payments/[id]    — Aprobar o rechazar
 * PUT   /api/admin/payments/config  — Guardar configuración de métodos de pago
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import {
  dbListAllSolicitudes,
  dbGetSolicitudPago,
  dbUpdateSolicitudPago,
  dbGetPaymentConfig,
  dbSavePaymentConfig,
} from "@/lib/db/payments";
import { dbActivateUser } from "@/lib/db";
import { slugAUserPlan } from "@/lib/pago/catalogo";

export async function GET() {
  try {
    const { user } = await requireAuth();
    if (user.role !== "admin") return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const solicitudes = dbListAllSolicitudes();
    const config = dbGetPaymentConfig();
    return NextResponse.json({ ok: true, solicitudes, config });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { user } = await requireAuth();
    if (user.role !== "admin") return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const body = await req.json().catch(() => ({})) as {
      id?: string;
      accion?: "aprobar" | "rechazar";
      notas_admin?: string;
    };

    const { id, accion, notas_admin } = body;
    if (!id || !accion) return NextResponse.json({ error: "id y accion requeridos" }, { status: 400 });

    const solicitud = dbGetSolicitudPago(id);
    if (!solicitud) return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    if (solicitud.estado !== "pendiente") {
      return NextResponse.json({ error: "La solicitud ya fue procesada" }, { status: 409 });
    }

    if (accion === "aprobar") {
      // Mapea el slug comercial (mono-basico, pg-plus, etc.) al UserPlan
      // interno (estandar/pro/elite) que es lo que el resto del SaaS usa
      // para gatear features.
      const userPlan = slugAUserPlan(solicitud.plan);
      await dbActivateUser(solicitud.usuario_id, "estudiante", userPlan);
      dbUpdateSolicitudPago(id, {
        estado: "aprobado",
        aprobado_por: user.id,
        aprobado_at: new Date().toISOString(),
        notas_admin: notas_admin?.trim() || undefined,
      });
      return NextResponse.json({ ok: true, mensaje: `Plan ${solicitud.plan} activado para ${solicitud.usuario_email}` });
    }

    if (accion === "rechazar") {
      dbUpdateSolicitudPago(id, {
        estado: "rechazado",
        notas_admin: notas_admin?.trim() || "Rechazado por el administrador",
      });
      return NextResponse.json({ ok: true, mensaje: "Solicitud rechazada" });
    }

    return NextResponse.json({ error: "Accion inválida" }, { status: 400 });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { user } = await requireAuth();
    if (user.role !== "admin") return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const config = await req.json().catch(() => ({}));
    const saved = dbSavePaymentConfig(config);
    return NextResponse.json({ ok: true, config: saved });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
