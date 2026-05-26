import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";

async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// POST: usado por el botón "Cerrar sesión" del header (fetch desde JS)
export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true });
}

// GET: permite logout abriendo la URL directamente en el navegador
// (útil cuando la sesión está corrupta o el botón no responde).
// Redirige al login después de limpiar la cookie.
export async function GET(req: Request) {
  await clearSession();
  const { origin } = new URL(req.url);
  return NextResponse.redirect(new URL("/login", origin));
}
