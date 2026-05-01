import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, verifyAdminToken, SESSION_COOKIE } from "@/lib/auth";

async function checkAdminAuth(req: NextRequest): Promise<boolean> {
  const adminToken = req.cookies.get("admin_session")?.value;
  if (adminToken && await verifyAdminToken(adminToken)) return true;
  const labToken = req.cookies.get(SESSION_COOKIE)?.value;
  if (labToken) {
    const user = await verifySessionToken(labToken);
    if (user?.role === "admin") return true;
  }
  return false;
}

export async function proxy(req: NextRequest) {
  try {
    const path = req.nextUrl.pathname;

    // /admin/* requires admin — checked via admin_session JWT or lab_session with role=admin
    if (path.startsWith("/admin") && path !== "/admin/login") {
      const isAdmin = await checkAdminAuth(req);
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      return NextResponse.next();
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

    return NextResponse.next();
  } catch {
    // Never crash the middleware — let the request through
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|svg|ico)$).*)"],
};
