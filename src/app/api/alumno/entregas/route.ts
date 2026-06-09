/**
 * GET /api/alumno/entregas
 *   El alumno ve las fechas tope que sus docentes le han asignado.
 *   Incluye:
 *     - Entregas asignadas DIRECTAMENTE a su vínculo.
 *     - Entregas GLOBALES (vinculo_id IS NULL) de docentes a los que está vinculado.
 *
 *   Auto-marca como `vencida` las que ya pasaron y siguen en estado programada.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";

export async function GET() {
  try {
    const { user } = await requireAuth();
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ entregas: [] });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;

    // 1) Vínculos del alumno (no archivados).
    const { data: vinculos } = await sb
      .from("docente_alumno_vinculos")
      .select("id, docente_id")
      .eq("alumno_id", user.id)
      .eq("archivado", false);

    const docenteIds = Array.from(new Set((vinculos ?? []).map((v: { docente_id: string }) => v.docente_id))) as string[];
    const vinculoIds = (vinculos ?? []).map((v: { id: string }) => v.id) as string[];

    if (docenteIds.length === 0) {
      return NextResponse.json({ entregas: [] });
    }

    // 2) Entregas asignadas directamente a sus vínculos
    //    O entregas globales (vinculo_id IS NULL) de los docentes a los que está vinculado.
    const q = sb
      .from("docente_entregas")
      .select("*")
      .in("docente_id", docenteIds)
      .or(`vinculo_id.is.null,vinculo_id.in.(${vinculoIds.map((v) => `"${v}"`).join(",")})`)
      .order("fecha_tope", { ascending: true });
    const { data: entregas, error } = await q;
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

    const ahora = Date.now();
    // Auto-marca vencidas las que están programadas y la fecha pasó.
    const lista = (entregas ?? []) as Array<{ id: string; estado: string; fecha_tope: string; docente_id: string }>;
    const aMarcarVencidas: string[] = [];
    for (const e of lista) {
      if (e.estado === "programada" && new Date(e.fecha_tope).getTime() < ahora) {
        aMarcarVencidas.push(e.id);
      }
    }
    if (aMarcarVencidas.length > 0) {
      // No await — fire-and-forget; el cliente puede refrescar.
      sb.from("docente_entregas")
        .update({ estado: "vencida" })
        .in("id", aMarcarVencidas)
        .then(() => undefined, () => undefined);
    }

    // Resolver nombres de docentes
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
      } catch { /* ignore */ }
    }

    const enriquecidas = lista.map((e) => ({
      ...e,
      // Si auto-marcamos vencida arriba pero la DB todavía no refleja, reflejarlo en el output.
      estado: aMarcarVencidas.includes(e.id) ? "vencida" : e.estado,
      docente_nombre: nombresDoc[e.docente_id] ?? "Tu docente",
    }));

    return NextResponse.json({ entregas: enriquecidas });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
