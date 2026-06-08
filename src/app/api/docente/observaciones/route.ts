/**
 * /api/docente/observaciones
 *   POST → crear observación sobre un proyecto del alumno.
 *   GET  → listar observaciones que dejó este docente (filtros opcionales).
 *
 * Wave 3 del panel docente. Solo accesible a docente o admin.
 *
 * POST body: { vinculo_id, modulo, proyecto_id, proyecto_titulo, observacion }
 *   - Valida que el vínculo es del docente logueado (sino 404).
 *   - Snapshotea docente_id + alumno_id desde el vínculo.
 *   - Crea la observación con estado=pendiente.
 *
 * GET query params (todos opcionales):
 *   - vinculo_id: solo observaciones de ese alumno
 *   - modulo: solo de ese módulo
 *   - estado: pendiente|atendida|descartada
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";

const ROLES_PERMITIDOS = new Set(["docente", "admin"]);

const MODULOS_VALIDOS = new Set([
  "idea", "mercados", "estrategia", "marketing", "organizacion", "finanzas", "defensa", "generador",
]);

async function asegurarDocente() {
  const { user } = await requireAuth();
  if (!ROLES_PERMITIDOS.has(user.role)) {
    throw new AuthError(403, "Solo docentes pueden dejar observaciones");
  }
  return user;
}

export async function POST(req: Request) {
  try {
    const user = await asegurarDocente();
    const body = await req.json().catch(() => ({}));
    const vinculoId = typeof body.vinculo_id === "string" ? body.vinculo_id : "";
    const modulo = typeof body.modulo === "string" ? body.modulo : "";
    const proyectoId = typeof body.proyecto_id === "string" ? body.proyecto_id : "";
    const proyectoTitulo = typeof body.proyecto_titulo === "string" ? body.proyecto_titulo.trim().slice(0, 200) : "";
    const observacion = typeof body.observacion === "string" ? body.observacion.trim() : "";

    if (!vinculoId || !modulo || !proyectoId || !proyectoTitulo || !observacion) {
      return NextResponse.json({ error: "Faltan campos: vinculo_id, modulo, proyecto_id, proyecto_titulo, observacion" }, { status: 400 });
    }
    if (!MODULOS_VALIDOS.has(modulo)) {
      return NextResponse.json({ error: "Módulo inválido" }, { status: 400 });
    }
    if (observacion.length > 4000) {
      return NextResponse.json({ error: "La observación supera 4000 caracteres" }, { status: 400 });
    }
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "sin_db" }, { status: 500 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;

    // Verificar propiedad del vínculo: el docente solo puede dejar
    // observaciones a SUS alumnos.
    const { data: vinculo } = await sb
      .from("docente_alumno_vinculos")
      .select("id, alumno_id")
      .eq("id", vinculoId)
      .eq("docente_id", user.id)
      .maybeSingle();
    if (!vinculo) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });
    }

    const { data, error } = await sb
      .from("docente_observaciones")
      .insert({
        vinculo_id: vinculoId,
        docente_id: user.id,
        alumno_id: vinculo.alumno_id,
        modulo,
        proyecto_id: proyectoId,
        proyecto_titulo: proyectoTitulo,
        observacion,
        estado: "pendiente",
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, observacion: data });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await asegurarDocente();
    const url = new URL(req.url);
    const vinculoId = url.searchParams.get("vinculo_id");
    const modulo = url.searchParams.get("modulo");
    const estado = url.searchParams.get("estado");
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ observaciones: [] });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    let q = sb.from("docente_observaciones").select("*").eq("docente_id", user.id);
    if (vinculoId) q = q.eq("vinculo_id", vinculoId);
    if (modulo) q = q.eq("modulo", modulo);
    if (estado) q = q.eq("estado", estado);
    q = q.order("creada_en", { ascending: false });
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
    return NextResponse.json({ observaciones: data ?? [] });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
