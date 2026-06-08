/**
 * GET /api/alumno/observaciones
 *   El alumno ve TODAS las observaciones que sus docentes le han dejado.
 *   Opcional ?estado=pendiente para filtrar las que aún debe atender.
 *
 *   Enriquece cada observación con `docente_nombre` (snapshot del perfil
 *   del módulo Idea como mejor aproximación) — antes solo devolvía el
 *   docente_id, y la UI no podía mostrar quién había escrito qué.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { user } = await requireAuth();
    const url = new URL(req.url);
    const estado = url.searchParams.get("estado");
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ observaciones: [] });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    let q = sb.from("docente_observaciones")
      .select("id, docente_id, modulo, proyecto_id, proyecto_titulo, observacion, estado, respuesta_alumno, creada_en")
      .eq("alumno_id", user.id);
    if (estado) q = q.eq("estado", estado);
    q = q.order("creada_en", { ascending: false });
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });

    const obs = (data ?? []) as Array<{ docente_id: string }>;

    // Resolver nombres de docentes en una sola query (set único de ids).
    const docenteIds = Array.from(new Set(obs.map((o) => o.docente_id)));
    const nombresPorId: Record<string, string> = {};
    if (docenteIds.length > 0) {
      try {
        const { data: perfiles } = await sb
          .from("idea_perfiles")
          .select("id, nombre, apellido")
          .in("id", docenteIds);
        for (const p of (perfiles ?? []) as Array<{ id: string; nombre: string; apellido: string }>) {
          nombresPorId[p.id] = `${p.nombre} ${p.apellido || ""}`.trim();
        }
      } catch { /* tabla puede no existir */ }
    }

    const enriquecidas = obs.map((o) => ({
      ...o,
      docente_nombre: nombresPorId[o.docente_id] ?? "Docente",
    }));

    return NextResponse.json({ observaciones: enriquecidas });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
