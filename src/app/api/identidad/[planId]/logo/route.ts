/**
 * POST /api/identidad/[planId]/logo
 *   Genera un logo con la IA disponible y agrega a logo_alternativas.
 *   Body: { conceptoExtra?: string, modeloPreferido?: ModeloLogoIA }
 *
 *   COSTO: cada llamada cuesta tokens reales ($0.04-0.10 según modelo).
 *   El alumno con plan Estandar tiene tope de 3 generaciones por
 *   identidad; Pro tiene 10; Elite ilimitado. (Implementado en el handler).
 *
 * PATCH /api/identidad/[planId]/logo
 *   Marca una alternativa como "logo principal".
 *   Body: { url: string }
 *
 *   Solo persiste, no llama a IA.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";
import { generarLogo, aLogoAlternativa, modelosDisponibles } from "@/lib/identidad/logo";
import type { LogoAlternativa, ModeloLogoIA, IdentidadVisual } from "@/types/identidad";

const TOPES_POR_PLAN: Record<string, number> = {
  estandar: 3,
  pro: 10,
  elite: 999,
};

async function cargarIdentidadDuena(planId: string, userId: string): Promise<IdentidadVisual | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  // Valida ownership del plan + trae la fila de identidad
  const { data: plan } = await sb
    .from("marketing_planes")
    .select("id")
    .eq("id", planId)
    .eq("estudiante_id", userId)
    .maybeSingle();
  if (!plan) return null;

  const { data: identidad } = await sb
    .from("identidad_visuales")
    .select("*")
    .eq("plan_id", planId)
    .maybeSingle();
  return (identidad ?? null) as IdentidadVisual | null;
}

export async function POST(req: Request, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const { user } = await requireAuth();
    const { planId } = await params;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "sin_db" }, { status: 500 });
    }

    const identidad = await cargarIdentidadDuena(planId, user.id);
    if (!identidad) {
      return NextResponse.json({ error: "Plan o identidad no encontrados" }, { status: 404 });
    }

    // Tope por plan
    const plan = user.plan ?? "estandar";
    const tope = TOPES_POR_PLAN[plan] ?? TOPES_POR_PLAN.estandar;
    const alternativas = identidad.logo_alternativas ?? [];
    if (alternativas.length >= tope) {
      return NextResponse.json({
        error: `Llegaste al tope de generaciones de logo para tu plan (${tope}). Sube a Pro o Elite para más, o elige una de las alternativas existentes como logo principal.`,
      }, { status: 402 });
    }

    // Requisito: brief con nombre y sector
    if (!identidad.brief?.nombre) {
      return NextResponse.json({ error: "Falta el nombre de la marca en el brief" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const conceptoExtra = typeof body.conceptoExtra === "string" ? body.conceptoExtra.trim().slice(0, 500) : undefined;
    const modeloPreferido = typeof body.modeloPreferido === "string"
      ? body.modeloPreferido as ModeloLogoIA
      : undefined;

    // Paleta para el contexto (puede ser null si aún no se generó)
    const paleta = identidad.paleta_primario ? {
      primario: identidad.paleta_primario,
      secundario: identidad.paleta_secundario ?? identidad.paleta_primario,
      acento: identidad.paleta_acento ?? identidad.paleta_primario,
    } : null;

    let resultado;
    try {
      resultado = await generarLogo({ brief: identidad.brief, paleta, conceptoExtra }, modeloPreferido);
    } catch (err) {
      return NextResponse.json({
        error: `Falló la generación: ${(err as Error).message}`,
        modelos_disponibles: modelosDisponibles(),
      }, { status: 502 });
    }

    const nuevaAlternativa = aLogoAlternativa(resultado);
    const alternativasNuevas: LogoAlternativa[] = [...alternativas, nuevaAlternativa];

    // Persistir
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    const updates: Record<string, unknown> = {
      logo_alternativas: alternativasNuevas,
      logo_prompt_usado: resultado.prompt,
      estado: identidad.estado === "completo" ? "completo" : "logo",
    };
    // Si es la primera, marcar como principal automáticamente
    if (!identidad.logo_principal_url) {
      updates.logo_principal_url = resultado.url;
      updates.logo_concepto = conceptoExtra || identidad.logo_concepto || identidad.brief?.esencia || "";
    }

    const { data, error } = await sb
      .from("identidad_visuales")
      .update(updates)
      .eq("plan_id", planId)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({
      identidad: data,
      generada: nuevaAlternativa,
      generaciones_restantes: tope - alternativasNuevas.length,
    });
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

    const identidad = await cargarIdentidadDuena(planId, user.id);
    if (!identidad) {
      return NextResponse.json({ error: "Plan o identidad no encontrados" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const url = typeof body.url === "string" ? body.url : "";
    if (!url) return NextResponse.json({ error: "url requerida" }, { status: 400 });

    // Verifica que la url corresponde a una alternativa existente
    const alts = identidad.logo_alternativas ?? [];
    const alt = alts.find((a) => a.url === url);
    if (!alt) {
      return NextResponse.json({ error: "Esa URL no está entre tus alternativas" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    const { data, error } = await sb
      .from("identidad_visuales")
      .update({ logo_principal_url: url, logo_prompt_usado: alt.prompt })
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
