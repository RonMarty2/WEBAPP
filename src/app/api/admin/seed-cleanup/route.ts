/**
 * POST /api/admin/seed-cleanup
 *
 * Endpoint de un solo uso para hacer cleanup del estado de Supabase
 * solicitado por el dueño del proyecto:
 *
 *   1. Crea usuario admin ronaldmartinezjimenes@gmail.com (id estable)
 *   2. Cambia rol de rnd261190@gmail.com de "admin" a "estudiante"
 *   3. Reasigna proyectos #1 (rmon6rl8ihmpjqetov - VallEnlace) y
 *      #8 (wtrma65wplcmp9s9kr8 - Monografía Aduanas) al admin nuevo
 *   4. Borra los 7 proyectos huérfanos restantes
 *
 * Protección: requiere body con campo `confirm: "yes-cleanup-prod-supabase"`.
 * Después de ejecutar exitosamente, el endpoint debe eliminarse en un
 * commit posterior.
 *
 * Devuelve JSON con el detalle de cada operación realizada y errores
 * si los hubo.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  dbUpsertUser,
  dbActivateUser,
  dbUpdateProyecto,
  dbDeleteProyecto,
  dbGetUserByEmail,
} from "@/lib/db";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "ronaldmartinezjimenes@gmail.com";
const ADMIN_NAME = "Ronald Martínez Jiménez";
const ADMIN_ID_FALLBACK = "seed-admin-ronaldmartinezjimenes"; // solo si OAuth no lo creó aún

const ESTUDIANTE_EMAIL = "rnd261190@gmail.com";

const PROJECTS_TO_KEEP = [
  "rmon6rl8ihmpjqetov", // Proyecto de Grado - VallEnlace (Hub Agrícola)
  "wtrma65wplcmp9s9kr8", // Monografía - Aduanas exportaciones
];

const PROJECTS_TO_DELETE = [
  "fqnq8murljhmpjq5fmz",
  "yi6qyddcvnlmpiw4e94",
  "ckgizmojslbmpivjsau",
  "qon8be6fojmpivfixe",
  "23xyz2fbo54mpivav73",
  "d2vp1sgzrymmpiv0o1k",
  "cjswamuex7lmov8shor",
];

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase no configurado. Abortando cleanup." },
      { status: 503 }
    );
  }

  let body: { confirm?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body JSON inválido o ausente" },
      { status: 400 }
    );
  }

  if (body.confirm !== "yes-cleanup-prod-supabase") {
    return NextResponse.json(
      {
        error:
          "Confirmación requerida. Enviar body { confirm: 'yes-cleanup-prod-supabase' }",
      },
      { status: 403 }
    );
  }

  const report: Record<string, unknown> = {
    startedAt: new Date().toISOString(),
    steps: [],
    errors: [],
  };
  const steps = report.steps as Array<Record<string, unknown>>;
  const errors = report.errors as Array<Record<string, unknown>>;

  // ── 1. Resolver id real del admin (OAuth pudo haberlo creado ya) ───────
  let adminId: string = ADMIN_ID_FALLBACK;
  try {
    const existingAdmin = await dbGetUserByEmail(ADMIN_EMAIL);
    if (existingAdmin) {
      adminId = existingAdmin.id;
      steps.push({
        step: "resolve-admin-id",
        ok: true,
        source: "existing-oauth-user",
        adminId,
      });
    } else {
      // Crear desde cero con id estable
      const created = await dbUpsertUser({
        id: ADMIN_ID_FALLBACK,
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        role: "admin",
        plan: "pro",
        active: true,
        activated_at: new Date().toISOString(),
      });
      adminId = created.id;
      steps.push({
        step: "resolve-admin-id",
        ok: true,
        source: "created-from-seed",
        adminId,
        user: created,
      });
    }
  } catch (e) {
    errors.push({ step: "resolve-admin-id", error: (e as Error).message });
  }

  // ── 2. Activar admin con role=admin, plan=pro (sobre el id real) ───────
  try {
    const updated = await dbActivateUser(adminId, "admin", "pro");
    steps.push({ step: "activate-admin", ok: Boolean(updated), user: updated });
  } catch (e) {
    errors.push({ step: "activate-admin", error: (e as Error).message });
  }

  // ── 3. Cambiar rol del usuario actual de admin → user (estudiante) ──────
  // OJO: el schema de Supabase tiene CHECK (role IN ('admin', 'user', 'demo'))
  // por lo que NO acepta 'estudiante'. Usamos 'user' que es el equivalente
  // en el schema actual. El mapping a 'estudiante' en UI se hace en cliente.
  try {
    const existing = await dbGetUserByEmail(ESTUDIANTE_EMAIL);
    if (!existing) {
      errors.push({
        step: "downgrade-student",
        error: `Usuario ${ESTUDIANTE_EMAIL} no encontrado`,
      });
    } else {
      // Usar cliente directo de Supabase con role válido del schema
      const sb = createAdminClient();
      const { data, error } = await sb
        .from("usuarios")
        .update({
          role: "user",
          plan: "estandar",
          active: true,
          activated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (error) {
        errors.push({
          step: "downgrade-student",
          error: `Supabase error: ${error.message}`,
          code: error.code,
        });
      } else {
        steps.push({
          step: "downgrade-student",
          ok: true,
          user: data,
          note: "role cambiado a 'user' (estudiante en UI)",
        });
      }
    }
  } catch (e) {
    errors.push({ step: "downgrade-student", error: (e as Error).message });
  }

  // ── 4. Reasignar proyectos a conservar al id real del admin ─────────────
  for (const projectId of PROJECTS_TO_KEEP) {
    try {
      const updated = await dbUpdateProyecto(projectId, {
        usuario_id: adminId,
      });
      steps.push({
        step: "reassign-project",
        projectId,
        ok: Boolean(updated),
        titulo:
          (updated as { titulo_provisional?: string } | null)?.titulo_provisional
          ?? (updated as { tema_aprobado?: string } | null)?.tema_aprobado
          ?? "(sin título)",
      });
    } catch (e) {
      errors.push({
        step: "reassign-project",
        projectId,
        error: (e as Error).message,
      });
    }
  }

  // ── 5. Borrar proyectos huérfanos ───────────────────────────────────────
  for (const projectId of PROJECTS_TO_DELETE) {
    try {
      const deleted = await dbDeleteProyecto(projectId);
      steps.push({ step: "delete-project", projectId, ok: deleted });
    } catch (e) {
      errors.push({
        step: "delete-project",
        projectId,
        error: (e as Error).message,
      });
    }
  }

  report.finishedAt = new Date().toISOString();
  report.summary = {
    totalSteps: steps.length,
    totalErrors: errors.length,
    success: errors.length === 0,
  };

  return NextResponse.json(report, {
    status: errors.length === 0 ? 200 : 207, // 207 multi-status si hubo fallos parciales
  });
}
