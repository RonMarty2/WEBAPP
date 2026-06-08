/**
 * GET /api/alumno/observaciones
 *   El alumno ve TODAS las observaciones que sus docentes le han dejado.
 *   Opcional ?estado=pendiente para filtrar las que aún debe atender.
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
    return NextResponse.json({ observaciones: data ?? [] });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
