/**
 * GET   /api/projects/[id]  — Detalle completo del proyecto
 * PATCH /api/projects/[id]  — Actualiza metadatos (tema, título, estado)
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase";
import type { UpdateTables, EstadoFase } from "@/types/database";

type Params = { params: Promise<{ id: string }> };

// ── GET ───────────────────────────────────────────────────────

export async function GET(_req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const db = createAdminClient();

    const { data, error } = await db
      .from("proyectos_fases")
      .select(`
        *,
        servicios ( id, nombre, descripcion, audiencia_id,
          perfiles_audiencia ( id, nombre )
        )
      `)
      .eq("id", id)
      .eq("usuario_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ proyecto: data });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ── PATCH ─────────────────────────────────────────────────────

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const body = await req.json();

    // Campos permitidos para actualización por el usuario
    const updates: UpdateTables<"proyectos_fases"> = {};

    if (typeof body.tema_aprobado === "string") {
      updates.tema_aprobado = body.tema_aprobado;
    }
    if (typeof body.titulo_provisional === "string") {
      updates.titulo_provisional = body.titulo_provisional;
    }
    if (typeof body.completado === "boolean") {
      updates.completado = body.completado;
    }
    if (typeof body.estado_fase === "number" && body.estado_fase >= 0 && body.estado_fase <= 5) {
      updates.estado_fase = body.estado_fase as EstadoFase;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No hay campos válidos para actualizar" }, { status: 400 });
    }

    const db = createAdminClient();

    const { data, error } = await db
      .from("proyectos_fases")
      .update(updates)
      .eq("id", id)
      .eq("usuario_id", user.id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
    }

    return NextResponse.json({ proyecto: data });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
