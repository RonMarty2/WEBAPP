/**
 * GET /api/admin/prompts  — Lista todos los prompts maestros (con servicio)
 * PUT /api/admin/prompts  — Crea o actualiza un prompt maestro
 *
 * Protegido: solo rol 'admin'.
 */

import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase";
import type { EstadoFase } from "@/types/database";

// ── GET ───────────────────────────────────────────────────────

export async function GET() {
  try {
    await requireAdmin();
    const db = createAdminClient();

    const { data, error } = await db
      .from("prompts_maestros")
      .select(`
        id, servicio_id, fase_numero, nombre_fase,
        contenido_prompt, version, activo, updated_at,
        servicios ( id, nombre, audiencia_id )
      `)
      .order("fase_numero");

    if (error) {
      return NextResponse.json({ error: "Error al obtener prompts" }, { status: 500 });
    }

    return NextResponse.json({ prompts: data ?? [] });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ── PUT ───────────────────────────────────────────────────────

export async function PUT(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { id, servicio_id, fase_numero, nombre_fase, contenido_prompt, activo } = body;

    if (!servicio_id || fase_numero === undefined || !contenido_prompt) {
      return NextResponse.json(
        { error: "servicio_id, fase_numero y contenido_prompt son requeridos" },
        { status: 400 }
      );
    }

    const db = createAdminClient();

    if (id) {
      // Actualizar existente — incrementa versión
      const { data: actual } = await db
        .from("prompts_maestros")
        .select("version")
        .eq("id", id)
        .single();

      const { data, error } = await db
        .from("prompts_maestros")
        .update({
          contenido_prompt,
          nombre_fase: nombre_fase ?? null,
          activo: activo ?? true,
          version: (actual?.version ?? 1) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Error al actualizar prompt" }, { status: 500 });
      }
      return NextResponse.json({ prompt: data });
    } else {
      // Crear / upsert por servicio_id + fase_numero
      const { data, error } = await db
        .from("prompts_maestros")
        .upsert(
          {
            servicio_id,
            fase_numero: Number(fase_numero) as EstadoFase,
            nombre_fase: nombre_fase ?? null,
            contenido_prompt,
            activo: activo ?? true,
          },
          { onConflict: "servicio_id,fase_numero" }
        )
        .select()
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Error al crear prompt" }, { status: 500 });
      }
      return NextResponse.json({ prompt: data }, { status: 201 });
    }
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
