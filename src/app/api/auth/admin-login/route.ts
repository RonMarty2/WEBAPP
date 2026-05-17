/**
 * POST /api/auth/admin-login
 *
 * Login real para administradores del SaaS (vos: rnd261190@gmail.com).
 * Requiere:
 *   - email que figure en ADMIN_EMAILS (env)
 *   - password que coincida con ADMIN_PASSWORD (env)
 *
 * Crea una sesión con:
 *   - user.id estable derivado del email (NO cambia entre logins ni planes)
 *   - role = "admin"
 *   - plan = "pro" por default (cambiable después con /api/auth/switch-plan)
 *
 * Body: { email: string, password: string, plan?: "estandar" | "pro" | "elite" }
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE, getAdminEmails, type UserPlan } from "@/lib/auth";

const VALID_PLANS: UserPlan[] = ["estandar", "pro", "elite"];

/**
 * Genera un user.id estable a partir del email. El mismo email siempre produce
 * el mismo id, sin importar desde qué dispositivo entres ni qué plan elijas.
 * Esto asegura que tus proyectos te siguen.
 */
function adminUserIdFromEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  // Slug simple: alphanumeric + guiones. Predecible y estable.
  const slug = normalized.replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `admin-${slug}`;
}

export async function POST(req: Request) {
  let body: { email?: string; password?: string; plan?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña obligatorios" }, { status: 400 });
  }

  const adminEmails = getAdminEmails();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";

  if (!adminPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD no configurado en .env.local" },
      { status: 500 },
    );
  }

  if (!adminEmails.includes(email)) {
    return NextResponse.json({ error: "Email no autorizado como admin" }, { status: 403 });
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const planRequested = body.plan?.toLowerCase() ?? "";
  const plan: UserPlan = VALID_PLANS.includes(planRequested as UserPlan)
    ? (planRequested as UserPlan)
    : "pro";

  const userId = adminUserIdFromEmail(email);

  const token = await createSessionToken({
    id: userId,
    email,
    name: `Admin (${email})`,
    role: "admin",
    plan,
    active: true,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: false, // true en producción HTTPS
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return NextResponse.json({
    ok: true,
    user: {
      id: userId,
      email,
      role: "admin",
      plan,
    },
  });
}
