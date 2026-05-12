/**
 * Helpers de autenticación para rutas de API del servidor.
 * Lee la cookie lab_session (estudiantes) o admin_session (admin panel).
 */

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";

export interface AuthResult {
  user: SessionUser;
}

// 🛡️ Secret de admin: DEBE venir del entorno (sin fallback inseguro).
// Lazy load para no crashear el módulo si la env var falta cuando esta
// función no se usa. Si falta y se intenta verificar admin, lanza error
// explícito en vez de fallar silenciosamente.
let _adminKey: Uint8Array | null = null;
function getAdminKey(): Uint8Array {
  if (_adminKey) return _adminKey;
  const value = process.env.ADMIN_JWT_SECRET;
  if (!value || value.length < 16) {
    throw new Error(
      "ADMIN_JWT_SECRET no está configurada (o es demasiado corta). " +
      "Definila con al menos 32 caracteres aleatorios.",
    );
  }
  _adminKey = new TextEncoder().encode(value);
  return _adminKey;
}

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
      const { payload } = await jwtVerify(adminToken, getAdminKey());
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

export class AuthError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}
