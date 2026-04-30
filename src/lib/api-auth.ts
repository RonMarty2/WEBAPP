/**
 * Helpers de autenticación para rutas de API del servidor.
 * Lee la cookie lab_session, verifica el JWT y expone el usuario.
 */

import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";

export interface AuthResult {
  user: SessionUser;
}

/** Verifica sesión activa. Lanza si no está autenticado o inactivo. */
export async function requireAuth(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;

  if (!user || !user.active) {
    throw new AuthError(401, "No autorizado");
  }
  return { user };
}

/** Verifica sesión activa con rol admin. Lanza si no es admin. */
export async function requireAdmin(): Promise<AuthResult> {
  const { user } = await requireAuth();
  if (user.role !== "admin") {
    throw new AuthError(403, "Acceso restringido a administradores");
  }
  return { user };
}

export class AuthError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}
