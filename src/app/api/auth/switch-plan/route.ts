/**
 * POST /api/auth/switch-plan
 *
 * Cambia el plan de la sesión actual SIN cerrar sesión y SIN cambiar user.id.
 * Solo para usuarios con role="admin" (para probar el SaaS desde la perspectiva
 * de cualquier plan).
 *
 * Como user.id NO cambia, todos los proyectos del admin se mantienen
 * visibles después del switch — solo cambia lo que el SaaS le permite hacer
 * según el plan (ej. edit-phase-section requiere pro/elite).
 *
 * Body: { plan: "estandar" | "pro" | "elite" }
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE, type UserPlan } from "@/lib/auth";

const VALID_PLANS: UserPlan[] = ["estandar", "pro", "elite"];

export async function POST(req: Request) {
  try {
    const { user } = await requireAuth();

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Solo administradores pueden cambiar de plan en la misma sesión" },
        { status: 403 },
      );
    }

    let body: { plan?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
    }

    const planRequested = body.plan?.toLowerCase() ?? "";
    if (!VALID_PLANS.includes(planRequested as UserPlan)) {
      return NextResponse.json(
        { error: `Plan inválido. Valores válidos: ${VALID_PLANS.join(", ")}` },
        { status: 400 },
      );
    }

    const nuevoPlan = planRequested as UserPlan;

    // Re-genera el JWT con el mismo user.id (cero pérdida de proyectos)
    // pero con el nuevo plan vigente.
    const token = await createSessionToken({
      ...user,
      plan: nuevoPlan,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({
      ok: true,
      plan_anterior: user.plan ?? null,
      plan_actual: nuevoPlan,
      user_id: user.id,
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: (e as Error).message ?? "Error interno" }, { status: 500 });
  }
}
