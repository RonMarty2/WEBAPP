/**
 * GET  /api/projects  — Lista los proyectos del usuario autenticado
 * POST /api/projects  — Crea un nuevo proyecto vinculado a un servicio
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { createProyecto, listProyectos } from "@/lib/memoryStore";
import type { InsertTables } from "@/types/database";

// ── GET ───────────────────────────────────────────────────────

export async function GET() {
  try {
    const { user } = await requireAuth();

    if (!isSupabaseConfigured()) {
      const proyectos = listProyectos(user.id).map(p => ({
        ...p,
        servicios: { id: p.servicio_id, nombre: "Monografía Académica" },
      }));
      return NextResponse.json({ proyectos });
    }

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
      // Supabase falló — usar memoria como respaldo
      const proyectos = listProyectos(user.id).map(p => ({
        ...p,
        servicios: { id: p.servicio_id, nombre: "Monografía Académica" },
      }));
      return NextResponse.json({ proyectos });
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
    const { servicio_id, universidad_id, tema_aprobado, titulo_provisional, modalidad_creacion } = body;

    if (!servicio_id) {
      return NextResponse.json({ error: "servicio_id es requerido" }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      const proyecto = createProyecto({
        usuario_id: user.id,
        servicio_id,
        universidad_id: universidad_id ?? undefined,
        modalidad_creacion: modalidad_creacion ?? "directa",
        tema_aprobado: tema_aprobado ?? null,
        titulo_provisional: titulo_provisional ?? null,
        estado_fase: 0,
        completado: false,
        contenido_fase_0: null,
        contenido_fase_1: null,
        contenido_fase_2: null,
        contenido_fase_3: null,
        contenido_fase_4: null,
        contenido_fase_5: null,
      });
      return NextResponse.json({ proyecto }, { status: 201 });
    }

    const db = createAdminClient();

    const { data: servicio, error: errS } = await db
      .from("servicios")
      .select("id, nombre, activo")
      .eq("id", servicio_id)
      .eq("activo", true)
      .single();

    if (errS || !servicio) {
      // Supabase no tiene el servicio — crear proyecto en memoria igual
      const proyecto = createProyecto({
        usuario_id: user.id,
        servicio_id,
        universidad_id: universidad_id ?? undefined,
        modalidad_creacion: modalidad_creacion ?? "directa",
        tema_aprobado: tema_aprobado ?? null,
        titulo_provisional: titulo_provisional ?? null,
        estado_fase: 0,
        completado: false,
        contenido_fase_0: null,
        contenido_fase_1: null,
        contenido_fase_2: null,
        contenido_fase_3: null,
        contenido_fase_4: null,
        contenido_fase_5: null,
      });
      return NextResponse.json({ proyecto }, { status: 201 });
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
      // Supabase falló — guardar en memoria
      const proyecto = createProyecto({
        usuario_id: user.id,
        servicio_id,
        universidad_id: universidad_id ?? undefined,
        modalidad_creacion: modalidad_creacion ?? "directa",
        tema_aprobado: tema_aprobado ?? null,
        titulo_provisional: titulo_provisional ?? null,
        estado_fase: 0,
        completado: false,
        contenido_fase_0: null,
        contenido_fase_1: null,
        contenido_fase_2: null,
        contenido_fase_3: null,
        contenido_fase_4: null,
        contenido_fase_5: null,
      });
      return NextResponse.json({ proyecto }, { status: 201 });
    }

    return NextResponse.json({ proyecto: data }, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
