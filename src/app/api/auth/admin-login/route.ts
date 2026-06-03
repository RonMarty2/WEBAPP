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
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE, getAdminEmails, type UserPlan, type UserRole } from "@/lib/auth";
import { dbGetUserByEmail } from "@/lib/db";

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

  // ── Resolver rol final con la misma jerarquía que el callback de Google ──
  // Si el usuario ya existe en BD → respetar el rol de BD. La env var
  // ADMIN_EMAILS / la contraseña admin solo prueban que el solicitante
  // CONOCE las credenciales del SaaS, pero NO promueven a admin
  // automáticamente si en la BD se le bajó manualmente.
  //
  // Esto evita que un usuario degradado con SQL siga entrando como admin
  // solo porque tiene la password del SaaS.
  let finalRole: UserRole = "admin";
  let finalActive = true;
  try {
    const existing = await dbGetUserByEmail(email);
    if (existing) {
      finalRole = (existing.role as UserRole | undefined) ?? "estudiante";
      finalActive = existing.active ?? false;
    }
  } catch { /* si la BD falla, mantenemos admin (compatibilidad con dev local) */ }

  const token = await createSessionToken({
    id: userId,
    email,
    name: finalRole === "admin" ? `Admin (${email})` : email,
    role: finalRole,
    plan,
    active: finalActive,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    // secure: true en HTTPS (prod en Vercel) / false en HTTP (dev local).
    // Sin esto Chrome Android rechaza la cookie en https:// y el login parece
    // exitoso pero la sesión nunca se persiste.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return NextResponse.json({
    ok: true,
    user: {
      id: userId,
      email,
      role: finalRole,
      plan,
      active: finalActive,
    },
    // Si la BD bajó el rol, decirle al cliente que NO redirija a /admin.
    // Es responsabilidad del cliente decidir basado en role.
    redirectTo: finalRole === "admin" ? "/admin" : (finalActive ? "/dashboard" : "/pendiente"),
  });
}
