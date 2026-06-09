/**
 * /api/docente/entregas
 *   GET  → lista de fechas tope del docente (con filtros).
 *   POST → crea una entrega nueva. Si vinculo_id es null, aplica a TODOS
 *          los alumnos vinculados (entrega global).
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";
import type { ModuloCalificable, PrioridadEntrega } from "@/types/docente-wave4";

const ROLES_PERMITIDOS = new Set(["docente", "admin"]);
const MODULOS: ModuloCalificable[] = ["idea","mercados","estrategia","marketing","organizacion","finanzas","defensa","generador","otro"];
const PRIORIDADES: PrioridadEntrega[] = ["baja","media","alta"];

async function asegurarDocente() {
  const { user } = await requireAuth();
  if (!ROLES_PERMITIDOS.has(user.role)) {
    throw new AuthError(403, "Solo docentes pueden gestionar entregas");
  }
  return user;
}

export async function GET(req: Request) {
  try {
    const user = await asegurarDocente();
    const url = new URL(req.url);
    const vinculoId = url.searchParams.get("vinculo_id");
    const estado = url.searchParams.get("estado");
    if (!isSupabaseConfigured()) return NextResponse.json({ entregas: [] });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    let q = sb.from("docente_entregas").select("*").eq("docente_id", user.id);
    if (vinculoId) q = q.eq("vinculo_id", vinculoId);
    if (estado) q = q.eq("estado", estado);
    q = q.order("fecha_tope", { ascending: true });
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    return NextResponse.json({ entregas: data ?? [] });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await asegurarDocente();
    const body = await req.json().catch(() => ({}));

    const titulo = typeof body.titulo === "string" ? body.titulo.trim() : "";
    const descripcion = typeof body.descripcion === "string" ? body.descripcion.trim() : null;
    const vinculo_id = typeof body.vinculo_id === "string" && body.vinculo_id ? body.vinculo_id : null;
    const modulo_sugerido = typeof body.modulo_sugerido === "string" && MODULOS.includes(body.modulo_sugerido as ModuloCalificable)
      ? body.modulo_sugerido as ModuloCalificable : null;
    const fecha_tope_raw = typeof body.fecha_tope === "string" ? body.fecha_tope : "";
    const prioridad = typeof body.prioridad === "string" && PRIORIDADES.includes(body.prioridad as PrioridadEntrega)
      ? body.prioridad as PrioridadEntrega : "media";

    if (!titulo || titulo.length > 200) {
      return NextResponse.json({ error: "Título requerido (1-200 caracteres)" }, { status: 400 });
    }
    const fecha = new Date(fecha_tope_raw);
    if (isNaN(fecha.getTime())) {
      return NextResponse.json({ error: "Fecha tope inválida (formato ISO 8601)" }, { status: 400 });
    }

    if (!isSupabaseConfigured()) return NextResponse.json({ error: "sin_db" }, { status: 500 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;

    // Si vinculo_id viene, verificar ownership.
    if (vinculo_id) {
      const { data: vinculo } = await sb
        .from("docente_alumno_vinculos")
        .select("id")
        .eq("id", vinculo_id)
        .eq("docente_id", user.id)
        .maybeSingle();
      if (!vinculo) return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });
    }

    const { data, error } = await sb
      .from("docente_entregas")
      .insert({
        docente_id: user.id,
        vinculo_id,
        titulo,
        descripcion,
        modulo_sugerido,
        fecha_tope: fecha.toISOString(),
        prioridad,
        estado: "programada",
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    return NextResponse.json({ entrega: data });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
