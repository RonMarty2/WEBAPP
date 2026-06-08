/**
 * /api/identidad/[planId]
 *   GET   → trae la identidad visual asociada al plan (o null si no existe).
 *   POST  → upsert del brief de marca (crea la identidad si no existe).
 *   PATCH → actualización parcial (cualquier campo).
 *
 * planId = id del plan de marketing dueño de esta identidad.
 *
 * Seguridad: el usuario debe ser dueño del plan. Verificación 2-step:
 *   1) requireAuth() → user.id
 *   2) marketing_planes.estudiante_id === user.id
 *
 * Si no es dueño, 404 (sin filtrar diferencia con "plan no existe").
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";

const CAMPOS_PATCH = new Set([
  "brief",
  "paleta_primario", "paleta_secundario", "paleta_acento",
  "paleta_neutro_claro", "paleta_neutro_oscuro",
  "paleta_esquema", "paleta_justificacion",
  "tipo_principal_familia", "tipo_principal_peso",
  "tipo_secundaria_familia", "tipo_secundaria_peso",
  "tipo_justificacion",
  "logo_concepto", "logo_principal_url", "logo_prompt_usado",
  "logo_alternativas",
  "mockups",
  "estado",
]);

async function asegurarDuenoDelPlan(planId: string, userId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  const { data: plan } = await sb
    .from("marketing_planes")
    .select("id, estudiante_id")
    .eq("id", planId)
    .eq("estudiante_id", userId)
    .maybeSingle();
  return !!plan;
}

export async function GET(_req: Request, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const { user } = await requireAuth();
    const { planId } = await params;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ identidad: null });
    }
    if (!await asegurarDuenoDelPlan(planId, user.id)) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    const { data, error } = await sb
      .from("identidad_visuales")
      .select("*")
      .eq("plan_id", planId)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ identidad: data ?? null });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const { user } = await requireAuth();
    const { planId } = await params;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "sin_db" }, { status: 500 });
    }
    if (!await asegurarDuenoDelPlan(planId, user.id)) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const brief = (typeof body.brief === "object" && body.brief !== null) ? body.brief : {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    const { data, error } = await sb
      .from("identidad_visuales")
      .upsert(
        { plan_id: planId, estudiante_id: user.id, brief, estado: "brief" },
        { onConflict: "plan_id" },
      )
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ identidad: data });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const { user } = await requireAuth();
    const { planId } = await params;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "sin_db" }, { status: 500 });
    }
    if (!await asegurarDuenoDelPlan(planId, user.id)) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) {
      if (CAMPOS_PATCH.has(k)) updates[k] = v;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    const { data, error } = await sb
      .from("identidad_visuales")
      .update(updates)
      .eq("plan_id", planId)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ identidad: data });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
