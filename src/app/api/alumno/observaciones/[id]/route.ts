/**
 * PATCH /api/alumno/observaciones/[id]
 *   El alumno responde una observación de su docente. Puede:
 *     - Marcarla como atendida (estado=atendida)
 *     - Agregar/editar su respuesta_alumno
 *   NO puede cambiar el cuerpo de la observación ni el docente_id.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";

const CAMPOS = new Set(["respuesta_alumno", "estado"]);
// El alumno solo puede mover entre 'pendiente' y 'atendida'.
// 'descartada' es decisión del docente.
const ESTADOS_ALUMNO = new Set(["pendiente", "atendida"]);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const updates: Record<string, unknown> = { actualizada_en: new Date().toISOString() };
    for (const [k, v] of Object.entries(body)) {
      if (!CAMPOS.has(k)) continue;
      if (k === "estado" && typeof v === "string" && !ESTADOS_ALUMNO.has(v)) continue;
      if (k === "respuesta_alumno" && typeof v === "string" && v.length > 4000) continue;
      updates[k] = v;
    }
    if (Object.keys(updates).length === 1) {
      return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
    }
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "sin_db" }, { status: 500 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    const { data, error } = await sb
      .from("docente_observaciones")
      .update(updates)
      .eq("id", id)
      .eq("alumno_id", user.id) // solo MIS observaciones
      .select()
      .single();
    if (error) return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, observacion: data });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
