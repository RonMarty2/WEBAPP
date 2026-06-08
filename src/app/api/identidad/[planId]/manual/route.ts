/**
 * GET /api/identidad/[planId]/manual
 *   Devuelve el Manual de Marca como texto markdown listo para
 *   descargar (Content-Disposition: attachment).
 *
 *   Sin llamadas a IA. Compila a partir de los datos persistidos.
 */

import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";
import { exportarManualDeMarca } from "@/lib/identidad/manual";
import { NextResponse } from "next/server";
import type { IdentidadVisual } from "@/types/identidad";

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

function slug(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "manual-de-marca";
}

export async function GET(_req: Request, { params }: { params: Promise<{ planId: string }> }) {
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

    const markdown = exportarManualDeMarca(identidad);
    const filename = `manual-de-marca-${slug(identidad.brief?.nombre || "marca")}.md`;

    return new Response(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
