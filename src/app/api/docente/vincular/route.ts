/**
 * POST /api/docente/vincular
 *   El alumno (o cualquier usuario logueado) pega un código → se vincula
 *   al docente que lo generó. Devuelve el nombre del docente para feedback.
 *
 * Body: { codigo: string }
 *
 * Reglas:
 *   - El código debe existir y estar `activo`.
 *   - El alumno no puede vincularse a sí mismo (si por error es docente).
 *   - Un alumno no puede vincularse 2 veces al mismo docente (UNIQUE).
 *
 * Wave 1 del panel docente.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { user } = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const codigoRaw = typeof body.codigo === "string" ? body.codigo.trim().toUpperCase() : "";
    if (codigoRaw.length < 4 || codigoRaw.length > 12) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 });
    }
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "sin_db" }, { status: 500 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;

    // Buscar el código y verificar que está activo.
    const { data: codigoRow, error: errCod } = await sb
      .from("docente_codigos")
      .select("codigo, docente_id, etiqueta, activo")
      .eq("codigo", codigoRaw)
      .maybeSingle();
    if (errCod) return NextResponse.json({ error: "db_error", detail: errCod.message }, { status: 500 });
    if (!codigoRow) return NextResponse.json({ error: "Código no encontrado" }, { status: 404 });
    if (!codigoRow.activo) return NextResponse.json({ error: "Este código fue revocado por el docente" }, { status: 410 });
    if (codigoRow.docente_id === user.id) {
      return NextResponse.json({ error: "No puedes usar tu propio código" }, { status: 400 });
    }

    // Crear el vínculo (o devolver 409 si ya existía — el UNIQUE lo bloquea).
    // El JWT no incluye universidad. Intentamos leerla del perfil del
    // módulo Idea (primer perfil que suelen crear los alumnos al entrar
    // por primera vez). Si no existe ahí, intentamos los demás módulos
    // como fallback. Si nada existe, queda null (la UI lo maneja).
    let universidadSnapshot: string | null = null;
    for (const tabla of ["idea_perfiles", "mercados_perfiles", "estrategia_perfiles", "marketing_perfiles", "organizacion_perfiles", "defensa_perfiles"]) {
      try {
        const { data: perfil } = await sb
          .from(tabla)
          .select("universidad")
          .eq("id", user.id)
          .maybeSingle();
        if (perfil?.universidad) {
          universidadSnapshot = perfil.universidad as string;
          break;
        }
      } catch {
        // tabla no existe (migración pendiente) — sigue con la próxima
      }
    }

    const { data: vinculo, error: errVin } = await sb
      .from("docente_alumno_vinculos")
      .insert({
        docente_id: codigoRow.docente_id,
        alumno_id: user.id,
        codigo_usado: codigoRow.codigo,
        alumno_nombre: user.name,
        alumno_email: user.email,
        alumno_universidad: universidadSnapshot,
      })
      .select()
      .single();
    if (errVin) {
      if (errVin.message?.includes("duplicate")) {
        return NextResponse.json({ error: "Ya estás vinculado a este docente" }, { status: 409 });
      }
      return NextResponse.json({ error: "db_error", detail: errVin.message }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      vinculo,
      etiqueta: codigoRow.etiqueta,
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
