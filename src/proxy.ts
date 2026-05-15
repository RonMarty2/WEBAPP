import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, verifyAdminToken, SESSION_COOKIE } from "@/lib/auth";

async function checkAdminAuth(req: NextRequest): Promise<boolean> {
  try {
    const adminToken = req.cookies.get("admin_session")?.value;
    if (adminToken && await verifyAdminToken(adminToken)) return true;
    const labToken = req.cookies.get(SESSION_COOKIE)?.value;
    if (labToken) {
      const user = await verifySessionToken(labToken);
      if (user?.role === "admin") return true;
    }
  } catch {
    // Si las env vars de auth no están seteadas, verifyAdminToken/verifySessionToken
    // lanzan error. En esa situación FAIL CLOSED — no autenticamos a nadie.
  }
  return false;
}

/** Aplica headers de seguridad a una respuesta. */
function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
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

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // ─────────────────────────────────────────────────────────────────────────
  // 🛡️ /api/admin/* requiere admin auth — defensa en profundidad. Aunque cada
  // handler también pueda chequear requireAdmin(), este gate garantiza que
  // ningún endpoint admin queda expuesto por olvido del dev.
  // Exclusiones: /api/admin/auth/* crea/valida sesión, no puede requerir
  // sesión previa.
  // ─────────────────────────────────────────────────────────────────────────
  if (path.startsWith("/api/admin/") && !path.startsWith("/api/admin/auth/")) {
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: "Acceso restringido al panel de administración" },
          { status: 401 },
        ),
      );
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // Resto de la lógica usa try/catch defensivo para no crashear al middleware.
  try {
    // /admin/* (páginas del panel) requiere admin — checked via admin_session JWT o lab_session con role=admin
    if (path.startsWith("/admin") && path !== "/admin/login") {
      const isAdmin = await checkAdminAuth(req);
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      return applySecurityHeaders(NextResponse.next());
    }

    // Student routes — use lab_session
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const user = token ? await verifySessionToken(token) : null;

    if (path.startsWith("/dashboard") || path.startsWith("/monografia")) {
      if (!user) return NextResponse.redirect(new URL("/login", req.url));
      if (!user.active) return NextResponse.redirect(new URL("/pendiente", req.url));
    }

    if (path === "/pendiente" && user?.active) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (path === "/login" && user) {
      if (!user.active) return NextResponse.redirect(new URL("/pendiente", req.url));
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return applySecurityHeaders(NextResponse.next());
  } catch {
    // Never crash the middleware — let the request through (con headers seguros).
    return applySecurityHeaders(NextResponse.next());
  }
}

// matcher: corre el proxy en todas las rutas excepto estáticos y archivos
// de _next. Incluye /api/admin/* (a diferencia del default que excluía /api).
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp|woff|woff2|ttf|otf)$).*)",
  ],
};
