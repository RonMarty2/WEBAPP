/**
 * /api/docente/codigos
 *   GET  → lista códigos activos del docente logueado.
 *   POST → genera un nuevo código de 6 caracteres (A-Z 0-9).
 *
 * Solo accesible para usuarios con role 'docente' o 'admin'. Los
 * estudiantes que intenten llamar reciben 403.
 *
 * Wave 1 del panel docente. Ver bitácora sesión 6.
 */

import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";

const ROLES_PERMITIDOS = new Set(["docente", "admin"]);

// Caracteres "seguros" para códigos: sin 0/O/1/I/L que se confunden a mano.
const ALFABETO_SEGURO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

// Usa crypto.randomInt (CSPRNG) en vez de Math.random — Math.random es
// predecible y un atacante con tiempo puede correlacionar timing con
// salida para enumerar códigos generados y vincularse a docentes ajenos.
function generarCodigoAleatorio(longitud = 6): string {
  let out = "";
  for (let i = 0; i < longitud; i++) {
    out += ALFABETO_SEGURO[randomInt(0, ALFABETO_SEGURO.length)];
  }
  return out;
}

async function asegurarDocente() {
  const { user } = await requireAuth();
  if (!ROLES_PERMITIDOS.has(user.role)) {
    throw new AuthError(403, "Solo docentes pueden gestionar códigos");
  }
  return user;
}

export async function GET() {
  try {
    const user = await asegurarDocente();
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ codigos: [] });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    const { data, error } = await sb
      .from("docente_codigos")
      .select("*")
      .eq("docente_id", user.id)
      .eq("activo", true)
      .order("creado_en", { ascending: false });
    if (error) return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
    return NextResponse.json({ codigos: data ?? [] });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await asegurarDocente();
    const body = await req.json().catch(() => ({}));
    const etiqueta = typeof body.etiqueta === "string" ? body.etiqueta.trim().slice(0, 60) : null;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "sin_db" }, { status: 500 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;

    // Reintenta hasta 5 veces si hay colisión (probabilidad mínima con
    // 31^6 ≈ 887 millones, pero por las dudas).
    for (let intento = 0; intento < 5; intento++) {
      const codigo = generarCodigoAleatorio(6);
      const { data, error } = await sb
        .from("docente_codigos")
        .insert({ codigo, docente_id: user.id, etiqueta, activo: true })
        .select()
        .single();
      if (!error) return NextResponse.json({ codigo: data });
      // Si es colisión de PK, reintentar; si es otro error, abortar.
      if (!error.message?.includes("duplicate")) {
        return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
      }
    }
    return NextResponse.json({ error: "no_se_pudo_generar" }, { status: 500 });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
