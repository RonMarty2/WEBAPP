/**
 * PATCH/DELETE /api/docente/entregas/[id]
 *   PATCH  → cambiar estado/fecha/prioridad/título.
 *   DELETE → eliminar (no soft-delete; las entregas son efímeras por diseño).
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";
import type { EstadoEntrega, PrioridadEntrega } from "@/types/docente-wave4";

const ROLES_PERMITIDOS = new Set(["docente", "admin"]);
const ESTADOS: EstadoEntrega[] = ["programada","vencida","cumplida","cancelada"];
const PRIORIDADES: PrioridadEntrega[] = ["baja","media","alta"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth();
    if (!ROLES_PERMITIDOS.has(user.role)) {
      return NextResponse.json({ error: "Solo docentes" }, { status: 403 });
    }
    const { id } = await params;
    if (!isSupabaseConfigured()) return NextResponse.json({ error: "sin_db" }, { status: 500 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;

    const body = await req.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};

    if (typeof body.titulo === "string") {
      const v = body.titulo.trim();
      if (!v || v.length > 200) return NextResponse.json({ error: "Título inválido" }, { status: 400 });
      updates.titulo = v;
    }
    if (typeof body.descripcion === "string") {
      updates.descripcion = body.descripcion.trim() || null;
    }
    if (typeof body.fecha_tope === "string") {
      const f = new Date(body.fecha_tope);
      if (isNaN(f.getTime())) return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
      updates.fecha_tope = f.toISOString();
    }
    if (typeof body.estado === "string") {
      if (!ESTADOS.includes(body.estado as EstadoEntrega)) {
        return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
      }
      updates.estado = body.estado;
    }
    if (typeof body.prioridad === "string") {
      if (!PRIORIDADES.includes(body.prioridad as PrioridadEntrega)) {
        return NextResponse.json({ error: "Prioridad inválida" }, { status: 400 });
      }
      updates.prioridad = body.prioridad;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
    }

    const { data, error } = await sb
      .from("docente_entregas")
      .update(updates)
      .eq("id", id)
      .eq("docente_id", user.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    return NextResponse.json({ entrega: data });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth();
    if (!ROLES_PERMITIDOS.has(user.role)) {
      return NextResponse.json({ error: "Solo docentes" }, { status: 403 });
    }
    const { id } = await params;
    if (!isSupabaseConfigured()) return NextResponse.json({ error: "sin_db" }, { status: 500 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    const { error } = await sb
      .from("docente_entregas")
      .delete()
      .eq("id", id)
      .eq("docente_id", user.id);
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
