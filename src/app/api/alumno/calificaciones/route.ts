/**
 * GET /api/alumno/calificaciones
 *   El alumno ve TODAS sus calificaciones PUBLICADAS (no las borradores).
 *   Enriquece con el nombre del docente y los criterios de la rúbrica.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";

export async function GET() {
  try {
    const { user } = await requireAuth();
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ calificaciones: [] });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;

    const { data: califs, error } = await sb
      .from("docente_calificaciones")
      .select("*")
      .eq("alumno_id", user.id)
      .eq("estado", "publicada")
      .order("publicada_en", { ascending: false });
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

    const calificaciones = (califs ?? []) as Array<{ docente_id: string; rubrica_id: string }>;

    // Resolver nombres de docentes (idea_perfiles como aproximación).
    const docenteIds = Array.from(new Set(calificaciones.map((c) => c.docente_id)));
    const nombresDoc: Record<string, string> = {};
    if (docenteIds.length > 0) {
      try {
        const { data: perfiles } = await sb
          .from("idea_perfiles")
          .select("id, nombre, apellido")
          .in("id", docenteIds);
        for (const p of (perfiles ?? []) as Array<{ id: string; nombre: string; apellido: string }>) {
          nombresDoc[p.id] = `${p.nombre} ${p.apellido || ""}`.trim();
        }
      } catch { /* tabla puede no existir */ }
    }

    // Resolver criterios de las rúbricas usadas.
    const rubricaIds = Array.from(new Set(calificaciones.map((c) => c.rubrica_id)));
    const rubricasMap: Record<string, { nombre: string; criterios: Array<{ id: string; nombre: string; peso_pct: number }>; escala_max: number }> = {};
    if (rubricaIds.length > 0) {
      const { data: rubricas } = await sb
        .from("docente_rubricas")
        .select("id, nombre, criterios, escala_max")
        .in("id", rubricaIds);
      for (const r of (rubricas ?? []) as Array<{ id: string; nombre: string; criterios: Array<{ id: string; nombre: string; peso_pct: number }>; escala_max: number }>) {
        rubricasMap[r.id] = { nombre: r.nombre, criterios: r.criterios ?? [], escala_max: r.escala_max ?? 100 };
      }
    }

    const enriquecidas = calificaciones.map((c) => ({
      ...c,
      docente_nombre: nombresDoc[c.docente_id] ?? "Tu docente",
      rubrica: rubricasMap[c.rubrica_id] ?? null,
    }));

    return NextResponse.json({ calificaciones: enriquecidas });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
