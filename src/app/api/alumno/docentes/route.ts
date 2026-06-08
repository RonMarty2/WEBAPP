/**
 * GET /api/alumno/docentes
 *   Lista los docentes a los que el alumno logueado está vinculado.
 *   Cualquier usuario logueado puede llamar (no es solo para alumnos —
 *   un docente también puede ser alumno de otro).
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";

export async function GET() {
  try {
    const { user } = await requireAuth();
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ docentes: [] });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;

    // Trae los vínculos del alumno
    const { data: vinculos, error } = await sb
      .from("docente_alumno_vinculos")
      .select("id, docente_id, codigo_usado, vinculado_en")
      .eq("alumno_id", user.id)
      .eq("archivado", false)
      .order("vinculado_en", { ascending: false });
    if (error) return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });

    // No hay tabla "usuarios" central (cada módulo guarda su propio
    // perfil), entonces para mostrar el nombre del docente usamos el
    // perfil del módulo Idea como mejor aproximación (es el primer
    // módulo que ven los estudiantes y casi todos crean perfil ahí).
    // Si no existe, dejamos solo el id.
    const docenteIds = (vinculos ?? []).map((v: { docente_id: string }) => v.docente_id);
    const nombres: Record<string, string> = {};
    if (docenteIds.length > 0) {
      const { data: perfiles } = await sb
        .from("idea_perfiles")
        .select("id, nombre, apellido")
        .in("id", docenteIds);
      for (const p of (perfiles ?? []) as Array<{ id: string; nombre: string; apellido: string }>) {
        nombres[p.id] = `${p.nombre} ${p.apellido || ""}`.trim();
      }
    }

    const docentes = (vinculos ?? []).map((v: { id: string; docente_id: string; codigo_usado: string; vinculado_en: string }) => ({
      id: v.id,
      docente_id: v.docente_id,
      docente_nombre: nombres[v.docente_id] ?? "Docente",
      codigo_usado: v.codigo_usado,
      vinculado_en: v.vinculado_en,
    }));
    return NextResponse.json({ docentes });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
