/**
 * PATCH/DELETE /api/docente/calificaciones/[id]
 *   PATCH  → cambiar estado (borrador↔publicada) o editar comentario_general.
 *           Para editar notas, usar POST a /api/docente/calificaciones que
 *           hace upsert.
 *   DELETE → eliminar la calificación.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";

const ROLES_PERMITIDOS = new Set(["docente", "admin"]);

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

    if (typeof body.estado === "string") {
      if (!["borrador", "publicada"].includes(body.estado)) {
        return NextResponse.json({ error: "estado inválido" }, { status: 400 });
      }
      updates.estado = body.estado;
      if (body.estado === "publicada") {
        updates.publicada_en = new Date().toISOString();
      } else {
        updates.publicada_en = null;
      }
    }
    if (typeof body.comentario_general === "string") {
      updates.comentario_general = body.comentario_general.trim() || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
    }

    const { data, error } = await sb
      .from("docente_calificaciones")
      .update(updates)
      .eq("id", id)
      .eq("docente_id", user.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    return NextResponse.json({ calificacion: data });
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
      .from("docente_calificaciones")
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
