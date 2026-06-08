/**
 * DELETE /api/docente/codigos/[codigo]
 *   Revoca (soft-delete) un código del docente logueado. No borra el
 *   registro para mantener el FK desde docente_alumno_vinculos.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";

const ROLES_PERMITIDOS = new Set(["docente", "admin"]);

export async function DELETE(_req: Request, { params }: { params: Promise<{ codigo: string }> }) {
  try {
    const { user } = await requireAuth();
    if (!ROLES_PERMITIDOS.has(user.role)) {
      return NextResponse.json({ error: "Solo docentes" }, { status: 403 });
    }
    const { codigo } = await params;
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "sin_db" }, { status: 500 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    const { error } = await sb
      .from("docente_codigos")
      .update({ activo: false, revocado_en: new Date().toISOString() })
      .eq("codigo", codigo)
      .eq("docente_id", user.id); // sólo puede revocar SUS códigos
    if (error) return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
