/**
 * /api/docente/rubricas
 *   GET   → lista las rúbricas del docente (no archivadas).
 *   POST  → crea una rúbrica nueva.
 *
 * Las rúbricas son por docente. Una sola puede estar marcada como
 * `default_actual=TRUE` por docente; al crear una nueva con esa flag,
 * el endpoint desmarca la anterior.
 *
 * Wave 4 del panel docente. Ver bitácora sesión 10.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";
import { sumaDePesos, type CriterioRubrica, type EscalaCalificacion } from "@/types/docente-wave4";

const ROLES_PERMITIDOS = new Set(["docente", "admin"]);
const ESCALAS_VALIDAS = new Set<EscalaCalificacion>([7, 10, 20, 100]);

async function asegurarDocente() {
  const { user } = await requireAuth();
  if (!ROLES_PERMITIDOS.has(user.role)) {
    throw new AuthError(403, "Solo docentes pueden gestionar rúbricas");
  }
  return user;
}

export async function GET() {
  try {
    const user = await asegurarDocente();
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ rubricas: [] });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    const { data, error } = await sb
      .from("docente_rubricas")
      .select("*")
      .eq("docente_id", user.id)
      .eq("archivada", false)
      .order("default_actual", { ascending: false })
      .order("actualizada_en", { ascending: false });
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    return NextResponse.json({ rubricas: data ?? [] });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await asegurarDocente();
    const body = await req.json().catch(() => ({}));

    const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
    const descripcion = typeof body.descripcion === "string" ? body.descripcion.trim() : null;
    const criteriosRaw = Array.isArray(body.criterios) ? body.criterios : [];
    const escalaRaw = Number(body.escala_max ?? 100);
    const escala_max = (ESCALAS_VALIDAS.has(escalaRaw as EscalaCalificacion) ? escalaRaw : 100) as EscalaCalificacion;
    const nota_aprueba = Number.isFinite(body.nota_aprueba) ? Math.max(0, Math.min(escala_max, Number(body.nota_aprueba))) : Math.round(escala_max * 0.51);
    const default_actual = !!body.default_actual;

    if (!nombre || nombre.length > 200) {
      return NextResponse.json({ error: "Nombre requerido (1-200 caracteres)" }, { status: 400 });
    }

    // Validar criterios
    const criterios: CriterioRubrica[] = criteriosRaw.map((c: { id?: string; nombre?: string; descripcion?: string; peso_pct?: number }) => ({
      id: typeof c.id === "string" ? c.id : "c_" + Math.random().toString(36).slice(2, 10),
      nombre: typeof c.nombre === "string" ? c.nombre.trim().slice(0, 100) : "",
      descripcion: typeof c.descripcion === "string" ? c.descripcion.trim().slice(0, 500) : "",
      peso_pct: Math.max(0, Math.min(100, Number(c.peso_pct) || 0)),
    })).filter((c: CriterioRubrica) => c.nombre);

    if (criterios.length === 0) {
      return NextResponse.json({ error: "Necesitas al menos un criterio" }, { status: 400 });
    }

    const suma = sumaDePesos(criterios);
    if (Math.abs(suma - 100) > 0.5) {
      return NextResponse.json({
        error: `La suma de los pesos debe ser 100% (actual: ${suma}%)`,
        suma_actual: suma,
      }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "sin_db" }, { status: 500 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;

    // Si la nueva va a ser default, desmarcar la anterior.
    if (default_actual) {
      await sb
        .from("docente_rubricas")
        .update({ default_actual: false })
        .eq("docente_id", user.id)
        .eq("default_actual", true);
    }

    const { data, error } = await sb
      .from("docente_rubricas")
      .insert({
        docente_id: user.id,
        nombre,
        descripcion,
        criterios,
        escala_max,
        nota_aprueba,
        default_actual,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    return NextResponse.json({ rubrica: data });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
