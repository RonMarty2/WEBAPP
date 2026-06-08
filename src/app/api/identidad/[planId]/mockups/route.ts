/**
 * POST /api/identidad/[planId]/mockups
 *   Genera el set completo de mockups (cero costo IA — todo SVG inline)
 *   y los persiste. Devuelve la identidad actualizada.
 *
 *   Body opcional: { tipos?: TipoMockup[] } — si se omite, genera los 6
 *   tipos por defecto (tarjeta, redes, empaque, polo, taza, banner).
 *
 * Requisito: el plan debe tener al menos paleta + brief.nombre.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";
import { generarMockup, generarMockupsCompletos } from "@/lib/identidad/mockup";
import type { IdentidadVisual, TipoMockup } from "@/types/identidad";

const TIPOS_VALIDOS: TipoMockup[] = [
  "tarjeta", "redes", "empaque", "merch_polo", "merch_taza", "merch_gorra", "banner", "libre",
];

async function cargarIdentidadDuena(planId: string, userId: string): Promise<IdentidadVisual | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
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

    // Requisitos mínimos: paleta + nombre
    if (!identidad.paleta_primario || !identidad.brief?.nombre) {
      return NextResponse.json({
        error: "Necesitas tener la paleta y el nombre de la marca antes de generar mockups",
      }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const tiposPedidos: TipoMockup[] = Array.isArray(body.tipos)
      ? body.tipos.filter((t: unknown): t is TipoMockup => typeof t === "string" && TIPOS_VALIDOS.includes(t as TipoMockup))
      : [];

    const ctx = {
      logoUrl: identidad.logo_principal_url || "",
      paleta: {
        primario: identidad.paleta_primario,
        secundario: identidad.paleta_secundario || identidad.paleta_primario,
        acento: identidad.paleta_acento || identidad.paleta_primario,
        neutroClaro: identidad.paleta_neutro_claro || "#f8fafc",
        neutroOscuro: identidad.paleta_neutro_oscuro || "#0f172a",
      },
      brief: identidad.brief,
    };

    const mockupsGenerados = tiposPedidos.length > 0
      ? tiposPedidos.map((t) => generarMockup(t, ctx))
      : generarMockupsCompletos(ctx);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    const { data, error } = await sb
      .from("identidad_visuales")
      .update({
        mockups: mockupsGenerados,
        estado: "mockups",
      })
      .eq("plan_id", planId)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    return NextResponse.json({ identidad: data, mockups: mockupsGenerados });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
