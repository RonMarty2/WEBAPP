/**
 * Middleware global — corre antes de cada request.
 *
 * Responsabilidades:
 *
 *   1. AUTH defensa en profundidad para /api/admin/*
 *      Verifica que el request lleve una cookie válida de admin (admin_session
 *      firmada con ADMIN_JWT_SECRET, o lab_session con role=admin). Rechaza
 *      con 401 antes de que llegue al handler.
 *
 *      Exclusiones:
 *      - /api/admin/auth/*  → crea/valida sesión, no puede requerir sesión.
 *
 *      Aunque cada handler también puede chequear requireAdmin() por su cuenta,
 *      este middleware es un cinturón EXTRA: garantiza que nunca se va a
 *      exponer un endpoint admin por olvido del dev.
 *
 *   2. HEADERS DE SEGURIDAD aplicados a todas las respuestas
 *      X-Frame-Options, X-Content-Type-Options, Referrer-Policy, etc.
 *      CSP es laxo en desarrollo (permite eval para Turbopack) y estricto en
 *      producción.
 *
 * Edge runtime — el middleware corre en V8 Isolates, no en Node. Solo se usan
 * APIs disponibles ahí (jose sí funciona; fs/path no).
 */

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_JWT_SECRET_RAW = process.env.ADMIN_JWT_SECRET;
const AUTH_SECRET_RAW = process.env.AUTH_SECRET;

const ADMIN_KEY = ADMIN_JWT_SECRET_RAW ? new TextEncoder().encode(ADMIN_JWT_SECRET_RAW) : null;
const SESSION_KEY = AUTH_SECRET_RAW ? new TextEncoder().encode(AUTH_SECRET_RAW) : null;

const SESSION_COOKIE = "lab_session";
const ADMIN_COOKIE = "admin_session";

/** Devuelve true si el path requiere auth de admin. Excluye los endpoints de login admin. */
function pathRequiresAdmin(pathname: string): boolean {
  if (!pathname.startsWith("/api/admin/")) return false;
  // /api/admin/auth/* son los endpoints que CREAN o validan la sesión —
  // no pueden requerir sesión previa.
  if (pathname.startsWith("/api/admin/auth/")) return false;
  return true;
}

/** Verifica la cookie admin contra una de las dos secrets. */
async function isValidAdminSession(req: NextRequest): Promise<boolean> {
  // 1) Cookie admin_session firmada con ADMIN_JWT_SECRET
  const adminToken = req.cookies.get(ADMIN_COOKIE)?.value;
  if (adminToken && ADMIN_KEY) {
    try {
      const { payload } = await jwtVerify(adminToken, ADMIN_KEY);
      if (payload.role === "admin") return true;
    } catch { /* token inválido o expirado */ }
  }

  // 2) Cookie lab_session firmada con AUTH_SECRET y role=admin
  const labToken = req.cookies.get(SESSION_COOKIE)?.value;
  if (labToken && SESSION_KEY) {
    try {
      const { payload } = await jwtVerify(labToken, SESSION_KEY);
      const user = (payload as { user?: { role?: string; active?: boolean } }).user;
      if (user?.role === "admin" && user?.active) return true;
    } catch { /* token inválido */ }
  }

  return false;
}

/** Aplica headers de seguridad a una respuesta. */
function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // CSP: estricto en producción, permisivo en dev (Turbopack necesita eval).
  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https://api.groq.com https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com https://*.supabase.co; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'"
    );
  }
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🛡️ Gate de auth para /api/admin/*
  if (pathRequiresAdmin(pathname)) {
    // Si las secrets no están seteadas en el entorno, NO autenticamos a nadie.
    // Esto es defensa contra deploys mal configurados que de otro modo dejarían
    // pasar a cualquiera.
    if (!ADMIN_KEY && !SESSION_KEY) {
      return NextResponse.json(
        { error: "Sistema mal configurado — secrets faltantes." },
        { status: 503 },
      );
    }
    const ok = await isValidAdminSession(req);
    if (!ok) {
      return NextResponse.json(
        { error: "Acceso restringido al panel de administración" },
        { status: 401 },
      );
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

/**
 * matcher: en qué rutas corre el middleware.
 * Lo aplicamos a TODO el sitio (no solo /api/admin/) porque queremos los
 * headers de seguridad globalmente. La función pathRequiresAdmin filtra
 * internamente cuál necesita verificación de admin.
 */
export const config = {
  matcher: [
    // Todas las rutas excepto archivos estáticos y _next internals.
    "/((?!_next/static|_next/image|favicon.ico|logos/|robots.txt|sitemap.xml).*)",
  ],
};
