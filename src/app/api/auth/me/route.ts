import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifySessionToken,
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/auth";
import { dbGetUserByEmail } from "@/lib/db";

// CRÍTICO: este endpoint NUNCA debe cachearse — el rol/plan pueden cambiar
// y necesitamos respuesta fresca en cada request.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  const userFromToken = await verifySessionToken(token);
  if (!userFromToken) {
    return NextResponse.json({ user: null }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  // Revalidar contra la BD para detectar cambios de rol/plan/active.
  let dbUser;
  try {
    dbUser = await dbGetUserByEmail(userFromToken.email);
  } catch {
    // Si la BD falla, devolvemos los datos del JWT para no romper la sesión.
    return NextResponse.json(
      { user: userFromToken, __source: "jwt-fallback" },
      { headers: NO_CACHE_HEADERS },
    );
  }

  if (!dbUser) {
    return NextResponse.json({ user: null }, { status: 401, headers: NO_CACHE_HEADERS });
  }
  if (dbUser.active === false) {
    return NextResponse.json({ user: null }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  const freshUser = {
    id: userFromToken.id,
    email: userFromToken.email,
    name: userFromToken.name,
    picture: userFromToken.picture,
    role: dbUser.role ?? userFromToken.role,
    plan: dbUser.plan ?? userFromToken.plan,
    active: dbUser.active ?? userFromToken.active,
  };

  // Detectar inconsistencia entre cookie viejo y BD actual.
  // Si el cookie tiene un rol/plan/active distinto al de la BD, lo regeneramos
  // con los datos frescos y le decimos al cliente que recargue para descartar
  // cualquier state stale (botones admin, etc.) que tenga renderizado.
  const cookieIsStale =
    userFromToken.role !== freshUser.role ||
    userFromToken.plan !== freshUser.plan ||
    userFromToken.active !== freshUser.active;

  if (cookieIsStale) {
    const newToken = await createSessionToken(freshUser);
    const response = NextResponse.json(
      { user: freshUser, __source: "db", __refreshed: true },
      { headers: NO_CACHE_HEADERS },
    );
    response.cookies.set(SESSION_COOKIE, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return response;
  }

  return NextResponse.json(
    { user: freshUser, __source: "db" },
    { headers: NO_CACHE_HEADERS },
  );
}
