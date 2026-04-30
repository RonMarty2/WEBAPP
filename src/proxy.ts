import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;

  // /admin/* requires admin role
  if (path.startsWith("/admin") && path !== "/admin/login") {
    if (!user || user.role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // /dashboard y /monografia requieren sesión activa
  if (path.startsWith("/dashboard") || path.startsWith("/monografia")) {
    if (!user) return NextResponse.redirect(new URL("/login", req.url));
    if (!user.active) return NextResponse.redirect(new URL("/pendiente", req.url));
  }

  // /pendiente solo para usuarios autenticados pero inactivos
  if (path === "/pendiente" && user?.active) {
    const dest = user.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // Redirigir usuarios ya autenticados fuera del login
  if (path === "/login" && user) {
    if (!user.active) return NextResponse.redirect(new URL("/pendiente", req.url));
    const dest = user.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|svg|ico)$).*)"],
};
