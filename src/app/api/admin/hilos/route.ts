/**
 * GET /api/admin/hilos  — Lista todos los hilos conductores
 * PUT /api/admin/hilos  — Crea o actualiza un hilo conductor
 *
 * Protegido: solo rol 'admin'.
 */

import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase";

// ── GET ───────────────────────────────────────────────────────

export async function GET() {
  try {
    await requireAdmin();
    const db = createAdminClient();

    const { data, error } = await db
      .from("hilos_conductores")
      .select(`
        id, servicio_id, regla_inmutable, descripcion, orden, created_at,
        servicios ( id, nombre )
      `)
      .order("orden");

    if (error) {
      return NextResponse.json({ error: "Error al obtener hilos" }, { status: 500 });
    }

    return NextResponse.json({ hilos: data ?? [] });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ── PUT ───────────────────────────────────────────────────────

export async function PUT(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { id, servicio_id, regla_inmutable, descripcion, orden } = body;

    if (!regla_inmutable || !servicio_id) {
      return NextResponse.json(
        { error: "servicio_id y regla_inmutable son requeridos" },
        { status: 400 }
      );
    }

    const db = createAdminClient();

    if (id) {
      // Actualizar regla existente
      const { data, error } = await db
        .from("hilos_conductores")
        .update({
          regla_inmutable,
          descripcion: descripcion ?? null,
          orden: orden ?? 0,
        })
        .eq("id", id)
        .select()
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Error al actualizar hilo" }, { status: 500 });
      }
      return NextResponse.json({ hilo: data });
    } else {
      // Crear nueva regla
      const { data, error } = await db
        .from("hilos_conductores")
        .insert({
          servicio_id,
          regla_inmutable,
          descripcion: descripcion ?? null,
          orden: orden ?? 0,
        })
        .select()
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Error al crear hilo" }, { status: 500 });
      }
      return NextResponse.json({ hilo: data }, { status: 201 });
    }
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
