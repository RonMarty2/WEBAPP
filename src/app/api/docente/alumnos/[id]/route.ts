/**
 * PATCH /api/docente/alumnos/[id]
 *   Archivar/desarchivar un alumno, o editar la nota privada del docente.
 *   Body: { archivado?: boolean, nota_docente?: string }
 *
 * DELETE /api/docente/alumnos/[id]
 *   Borra el vínculo (hard-delete). El alumno puede volver a vincularse
 *   con el mismo código mientras esté activo.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";

const ROLES_PERMITIDOS = new Set(["docente", "admin"]);

const CAMPOS = new Set(["archivado", "nota_docente"]);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth();
    if (!ROLES_PERMITIDOS.has(user.role)) {
      return NextResponse.json({ error: "Solo docentes" }, { status: 403 });
    }
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) if (CAMPOS.has(k)) updates[k] = v;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
    }
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "sin_db" }, { status: 500 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    const { data, error } = await sb
      .from("docente_alumno_vinculos")
      .update(updates)
      .eq("id", id)
      .eq("docente_id", user.id) // solo modifica vínculos propios
      .select()
      .single();
    if (error) return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, vinculo: data });
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
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "sin_db" }, { status: 500 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    const { error } = await sb
      .from("docente_alumno_vinculos")
      .delete()
      .eq("id", id)
      .eq("docente_id", user.id);
    if (error) return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
