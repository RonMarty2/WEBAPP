/**
 * GET  /api/projects  — Lista los proyectos del usuario autenticado
 * POST /api/projects  — Crea un nuevo proyecto vinculado a un servicio
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase";
import type { InsertTables } from "@/types/database";

// ── GET ───────────────────────────────────────────────────────

export async function GET() {
  try {
    const { user } = await requireAuth();
    const db = createAdminClient();

    const { data, error } = await db
      .from("proyectos_fases")
      .select(`
        id,
        servicio_id,
        tema_aprobado,
        titulo_provisional,
        estado_fase,
        completado,
        created_at,
        updated_at,
        servicios ( id, nombre, audiencia_id )
      `)
      .eq("usuario_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Error al obtener proyectos" }, { status: 500 });
    }

    return NextResponse.json({ proyectos: data ?? [] });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ── POST ──────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { user } = await requireAuth();

    const body = await req.json();
    const { servicio_id, tema_aprobado, titulo_provisional } = body;

    if (!servicio_id) {
      return NextResponse.json({ error: "servicio_id es requerido" }, { status: 400 });
    }

    const db = createAdminClient();

    // Validar que el servicio existe y está activo
    const { data: servicio, error: errS } = await db
      .from("servicios")
      .select("id, nombre, activo")
      .eq("id", servicio_id)
      .eq("activo", true)
      .single();

    if (errS || !servicio) {
      return NextResponse.json(
        { error: "Servicio no encontrado o no disponible" },
        { status: 404 }
      );
    }

    const nuevoProyecto: InsertTables<"proyectos_fases"> = {
      usuario_id:         user.id,
      servicio_id,
      tema_aprobado:      tema_aprobado ?? null,
      titulo_provisional: titulo_provisional ?? null,
      estado_fase:        0,
      completado:         false,
    };

    const { data, error } = await db
      .from("proyectos_fases")
      .insert(nuevoProyecto)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Error al crear el proyecto" }, { status: 500 });
    }

    return NextResponse.json({ proyecto: data }, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
