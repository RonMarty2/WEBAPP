/**
 * POST /api/identidad/[planId]/paleta
 *   Genera una paleta desde un color seed + esquema y la persiste.
 *   Body: { seed: hex, esquema: 'monocromatica'|'analoga'|'complementaria'|'triada'|'tetrada'|'libre', justificacion?: string }
 *
 * GET /api/identidad/[planId]/paleta
 *   Devuelve la paleta vigente (alias práctico de GET /api/identidad/[planId]
 *   pero solo con campos paleta_*).
 *
 * Sin llamada a IA — todo el cálculo es local con teoría del color.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";
import { generarPaleta, esHexValido, normalizarHex } from "@/lib/identidad/paleta";
import type { EsquemaPaleta } from "@/types/identidad";

const ESQUEMAS: EsquemaPaleta[] = ["monocromatica", "analoga", "complementaria", "triada", "tetrada", "libre"];

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

export async function POST(req: Request, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const { user } = await requireAuth();
    const { planId } = await params;

    const body = await req.json().catch(() => ({}));
    const seedRaw = typeof body.seed === "string" ? body.seed : "";
    const esquema = typeof body.esquema === "string" ? body.esquema as EsquemaPaleta : "analoga";
    const justExtra = typeof body.justificacion === "string" ? body.justificacion.trim() : "";

    if (!esHexValido(seedRaw)) {
      return NextResponse.json({ error: "Color seed inválido (formato #rrggbb)" }, { status: 400 });
    }
    if (!ESQUEMAS.includes(esquema)) {
      return NextResponse.json({ error: "Esquema cromático no soportado" }, { status: 400 });
    }
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "sin_db" }, { status: 500 });
    }
    if (!await esDuenoDelPlan(planId, user.id)) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    // Generar paleta (sin IA)
    const seed = normalizarHex(seedRaw);
    const paleta = generarPaleta(seed, esquema);
    const justificacion = justExtra ||
      `Esquema ${esquema} construido a partir del color seed ${seed}. ` +
      `Primario para identidad principal, secundario como soporte cohesivo, ` +
      `acento para destacar acciones y notificaciones, y dos neutros con tinte ` +
      `sutil del primario para mantener cohesión sin ruido visual.`;

    // Persistir
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    const { data, error } = await sb
      .from("identidad_visuales")
      .upsert(
        {
          plan_id: planId,
          estudiante_id: user.id,
          paleta_primario: paleta.primario,
          paleta_secundario: paleta.secundario,
          paleta_acento: paleta.acento,
          paleta_neutro_claro: paleta.neutroClaro,
          paleta_neutro_oscuro: paleta.neutroOscuro,
          paleta_esquema: paleta.esquema,
          paleta_justificacion: justificacion,
          estado: "paleta",
        },
        { onConflict: "plan_id" },
      )
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ identidad: data, paleta });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
