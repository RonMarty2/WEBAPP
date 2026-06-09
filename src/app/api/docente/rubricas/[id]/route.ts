/**
 * PATCH/DELETE /api/docente/rubricas/[id]
 *   PATCH  → actualizar campos de la rúbrica.
 *   DELETE → archivar (no borrar; preservar calificaciones que la usan).
 *
 * Solo el docente dueño puede modificar sus rúbricas.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";
import { sumaDePesos, type CriterioRubrica, type EscalaCalificacion } from "@/types/docente-wave4";

const ROLES_PERMITIDOS = new Set(["docente", "admin"]);
const ESCALAS_VALIDAS = new Set<EscalaCalificacion>([7, 10, 20, 100]);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth();
    if (!ROLES_PERMITIDOS.has(user.role)) {
      return NextResponse.json({ error: "Solo docentes" }, { status: 403 });
    }
    const { id } = await params;
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "sin_db" }, { status: 500 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;

    const body = await req.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};

    if (typeof body.nombre === "string") {
      const v = body.nombre.trim();
      if (!v || v.length > 200) {
        return NextResponse.json({ error: "Nombre inválido (1-200 caracteres)" }, { status: 400 });
      }
      updates.nombre = v;
    }
    if (typeof body.descripcion === "string") {
      updates.descripcion = body.descripcion.trim() || null;
    }
    if (Array.isArray(body.criterios)) {
      const criterios: CriterioRubrica[] = body.criterios.map((c: { id?: string; nombre?: string; descripcion?: string; peso_pct?: number }) => ({
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
        return NextResponse.json({ error: `La suma de los pesos debe ser 100% (actual: ${suma}%)` }, { status: 400 });
      }
      updates.criterios = criterios;
    }
    if (body.escala_max !== undefined) {
      const n = Number(body.escala_max);
      if (!ESCALAS_VALIDAS.has(n as EscalaCalificacion)) {
        return NextResponse.json({ error: "Escala debe ser 7, 10, 20 o 100" }, { status: 400 });
      }
      updates.escala_max = n;
    }
    if (body.nota_aprueba !== undefined) {
      const escalaMax = (updates.escala_max as number | undefined) ?? 100;
      const n = Number(body.nota_aprueba);
      if (!Number.isFinite(n) || n < 0 || n > escalaMax) {
        return NextResponse.json({ error: `Nota de aprobación entre 0 y ${escalaMax}` }, { status: 400 });
      }
      updates.nota_aprueba = n;
    }
    if (typeof body.default_actual === "boolean") {
      // Si la marcamos como default, desmarcar las otras del docente.
      if (body.default_actual) {
        await sb
          .from("docente_rubricas")
          .update({ default_actual: false })
          .eq("docente_id", user.id)
          .eq("default_actual", true)
          .neq("id", id);
      }
      updates.default_actual = body.default_actual;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
    }

    const { data, error } = await sb
      .from("docente_rubricas")
      .update(updates)
      .eq("id", id)
      .eq("docente_id", user.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    return NextResponse.json({ rubrica: data });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth();
    if (!ROLES_PERMITIDOS.has(user.role)) {
      return NextResponse.json({ error: "Solo docentes" }, { status: 403 });
    }
    const { id } = await params;
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "sin_db" }, { status: 500 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    // Archivar (no borrar) para no romper calificaciones que apuntan a esta rúbrica.
    const { error } = await sb
      .from("docente_rubricas")
      .update({ archivada: true, default_actual: false })
      .eq("id", id)
      .eq("docente_id", user.id);
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
