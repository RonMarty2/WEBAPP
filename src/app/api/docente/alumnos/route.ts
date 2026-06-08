/**
 * GET /api/docente/alumnos
 *   Devuelve la lista de alumnos vinculados al docente logueado (no
 *   archivados). Cada item incluye nombre, email, universidad,
 *   código por el que se vinculó y fecha.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";

const ROLES_PERMITIDOS = new Set(["docente", "admin"]);

export async function GET() {
  try {
    const { user } = await requireAuth();
    if (!ROLES_PERMITIDOS.has(user.role)) {
      return NextResponse.json({ error: "Solo docentes" }, { status: 403 });
    }
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ alumnos: [] });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    const { data, error } = await sb
      .from("docente_alumno_vinculos")
      .select("id, alumno_id, alumno_nombre, alumno_email, alumno_universidad, codigo_usado, vinculado_en, nota_docente")
      .eq("docente_id", user.id)
      .eq("archivado", false)
      .order("vinculado_en", { ascending: false });
    if (error) return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
    return NextResponse.json({ alumnos: data ?? [] });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
