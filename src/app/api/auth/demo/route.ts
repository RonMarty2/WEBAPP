import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import type { UserRole, UserPlan } from "@/lib/auth";

const VALID_ROLES: UserRole[] = ["estudiante", "docente"];
const VALID_PLANS: UserPlan[] = ["estandar", "pro"];

export async function POST(req: Request) {
  // Eliminado el bloqueo de producción para permitir probar la app en Vercel
  const body = await req.json().catch(() => ({}));
  const role: UserRole = VALID_ROLES.includes(body.role) ? body.role : "estudiante";
  const plan: UserPlan = VALID_PLANS.includes(body.plan) ? body.plan : "estandar";

  const token = await createSessionToken({
    id: `demo-${role}-${plan}`,
    email: `demo.${role}@laboratorio.test`,
    name: `Demo ${role === "estudiante" ? "Estudiante" : "Docente"} (${plan})`,
    role,
    plan,
    active: true,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    // secure: true en HTTPS (Vercel) / false en HTTP local. Sin esto
    // browsers móviles modernos descartan la cookie en https://.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
