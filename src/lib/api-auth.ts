/**
 * Helpers de autenticación para rutas de API del servidor.
 * Lee la cookie lab_session (estudiantes) o admin_session (admin panel).
 */

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import type { UserPlan } from "@/types/database";

export interface AuthResult {
  user: SessionUser;
}

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "laboratorio-academico-super-secret-key-2024"
);

/** Verifica sesión activa de estudiante. Lanza si no está autenticado. */
export async function requireAuth(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;

  if (!user || !user.active) {
    throw new AuthError(401, "No autorizado");
  }
  return { user };
}

/**
 * Verifica sesión admin.
 * Acepta: (1) cookie admin_session firmado con ADMIN_JWT_SECRET,
 *         (2) cookie lab_session de usuario con role=admin.
 */
export async function requireAdmin(): Promise<AuthResult> {
  const cookieStore = await cookies();

  // Primero intentar cookie admin_session (login de panel admin)
  const adminToken = cookieStore.get("admin_session")?.value;
  if (adminToken) {
    try {
      const { payload } = await jwtVerify(adminToken, ADMIN_JWT_SECRET);
      if (payload.role === "admin") {
        const fakeAdminUser: SessionUser = {
          id: "admin",
          email: "admin@laboratorio.bo",
          name: "Administrador",
          role: "admin",
          plan: "pro",
          active: true,
        };
        return { user: fakeAdminUser };
      }
    } catch { /* token inválido o expirado */ }
  }

  // Fallback: cookie lab_session con role=admin
  const labToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (labToken) {
    const user = await verifySessionToken(labToken);
    if (user && user.active && user.role === "admin") {
      return { user };
    }
  }

  throw new AuthError(401, "Acceso restringido al panel de administración");
}

/**
 * Verifica que el usuario tenga uno de los planes requeridos.
 * Admin siempre tiene acceso. Lanza 403 si el plan no alcanza.
 */
export async function requirePlan(allowedPlans: UserPlan[]): Promise<AuthResult> {
  const result = await requireAuth();
  const { user } = result;
  if (user.role === "admin") return result;
  const userPlan = (user.plan ?? "estandar") as UserPlan;
  if (!allowedPlans.includes(userPlan)) {
    const nombres: Record<UserPlan, string> = { estandar: "Estándar", pro: "Pro", elite: "Elite" };
    const requerido = allowedPlans.map(p => nombres[p]).join(" o ");
    throw new AuthError(403, `Esta función requiere plan ${requerido}. Tu plan actual es ${nombres[userPlan] ?? userPlan}.`);
  }
  return result;
}

export class AuthError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}
