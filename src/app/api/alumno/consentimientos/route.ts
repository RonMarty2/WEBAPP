/**
 * /api/alumno/consentimientos
 *   GET → lista los consentimientos del alumno (por docente).
 *   POST → upsert: cambia `permitir_ver_contenido` para un docente
 *         específico.
 *
 * Por defecto, si no hay fila, el consentimiento se trata como FALSE.
 * Los docentes verán SOLO metadatos hasta que el alumno active el
 * toggle "permitir ver contenido" para ese docente concreto.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";

export async function GET() {
  try {
    const { user } = await requireAuth();
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ consentimientos: [] });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    const { data, error } = await sb
      .from("docente_consentimientos")
      .select("id, docente_id, permitir_ver_contenido, actualizado_en")
      .eq("alumno_id", user.id);
    if (error) return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
    return NextResponse.json({ consentimientos: data ?? [] });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const docenteId = typeof body.docente_id === "string" ? body.docente_id : "";
    const permitir = typeof body.permitir_ver_contenido === "boolean" ? body.permitir_ver_contenido : null;
    if (!docenteId || permitir === null) {
      return NextResponse.json({ error: "Faltan campos: docente_id (string), permitir_ver_contenido (boolean)" }, { status: 400 });
    }
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "sin_db" }, { status: 500 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;

    // Validar que el docente realmente está vinculado al alumno. Sino,
    // un alumno podría dar consentimiento a cualquier docente.
    const { data: vinculo } = await sb
      .from("docente_alumno_vinculos")
      .select("id")
      .eq("docente_id", docenteId)
      .eq("alumno_id", user.id)
      .maybeSingle();
    if (!vinculo) {
      return NextResponse.json({ error: "No estás vinculado a este docente" }, { status: 404 });
    }

    const { data, error } = await sb
      .from("docente_consentimientos")
      .upsert(
        {
          alumno_id: user.id,
          docente_id: docenteId,
          permitir_ver_contenido: permitir,
          actualizado_en: new Date().toISOString(),
        },
        { onConflict: "alumno_id,docente_id" },
      )
      .select()
      .single();
    if (error) return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, consentimiento: data });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
