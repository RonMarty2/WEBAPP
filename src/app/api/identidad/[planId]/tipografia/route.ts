/**
 * GET /api/identidad/[planId]/tipografia?personalidades=moderna,amigable
 *   Devuelve las 3 mejores combinaciones tipográficas recomendadas según
 *   las personalidades dadas (o las 3 más versátiles si no se pasa).
 *   No persiste nada; el alumno elige y luego POSTea su selección.
 *
 * POST /api/identidad/[planId]/tipografia
 *   Persiste la combinación elegida.
 *   Body: { combinacionId: string } | { principal: {familia,peso}, secundaria: {familia,peso}, justificacion?: string }
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";
import { COMBINACIONES_TIPOGRAFICAS, recomendarTipografias, type PersonalidadFuente } from "@/lib/identidad/tipografia";
import type { PesoTipografia } from "@/types/identidad";

const PESOS_VALIDOS: PesoTipografia[] = ["300", "400", "500", "600", "700", "800", "900"];

async function esDuenoDelPlan(planId: string, userId: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  const { data } = await sb
    .from("marketing_planes")
    .select("id")
    .eq("id", planId)
    .eq("estudiante_id", userId)
    .maybeSingle();
  return !!data;
}

export async function GET(req: Request) {
  try {
    await requireAuth();
    const url = new URL(req.url);
    const personalidadesRaw = url.searchParams.get("personalidades") ?? "";
    const personalidades = personalidadesRaw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean) as PersonalidadFuente[];

    const recomendaciones = recomendarTipografias(personalidades);
    return NextResponse.json({
      recomendaciones,
      catalogo_completo: COMBINACIONES_TIPOGRAFICAS,
    });
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
    if (!await esDuenoDelPlan(planId, user.id)) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));

    let principalFamilia: string;
    let principalPeso: PesoTipografia;
    let secundariaFamilia: string;
    let secundariaPeso: PesoTipografia;
    let justificacion: string;

    if (typeof body.combinacionId === "string") {
      const c = COMBINACIONES_TIPOGRAFICAS.find((x) => x.id === body.combinacionId);
      if (!c) return NextResponse.json({ error: "combinacionId no encontrado" }, { status: 400 });
      principalFamilia = c.principal.familia;
      principalPeso = c.principal.peso;
      secundariaFamilia = c.secundaria.familia;
      secundariaPeso = c.secundaria.peso;
      justificacion = c.notas;
    } else if (body.principal && body.secundaria) {
      principalFamilia = String(body.principal.familia ?? "").trim();
      const pPeso = String(body.principal.peso ?? "400");
      principalPeso = PESOS_VALIDOS.includes(pPeso as PesoTipografia) ? pPeso as PesoTipografia : "400";
      secundariaFamilia = String(body.secundaria.familia ?? "").trim();
      const sPeso = String(body.secundaria.peso ?? "400");
      secundariaPeso = PESOS_VALIDOS.includes(sPeso as PesoTipografia) ? sPeso as PesoTipografia : "400";
      justificacion = typeof body.justificacion === "string" ? body.justificacion.trim() : "";
      if (!principalFamilia || !secundariaFamilia) {
        return NextResponse.json({ error: "Debes especificar familia principal y secundaria" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Envía combinacionId o {principal, secundaria}" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    const { data, error } = await sb
      .from("identidad_visuales")
      .upsert(
        {
          plan_id: planId,
          estudiante_id: user.id,
          tipo_principal_familia: principalFamilia,
          tipo_principal_peso: principalPeso,
          tipo_secundaria_familia: secundariaFamilia,
          tipo_secundaria_peso: secundariaPeso,
          tipo_justificacion: justificacion,
          estado: "tipografia",
        },
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
