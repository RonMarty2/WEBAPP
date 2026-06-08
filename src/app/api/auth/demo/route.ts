import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import type { UserRole, UserPlan } from "@/lib/auth";

const VALID_ROLES: UserRole[] = ["estudiante", "docente"];
const VALID_PLANS: UserPlan[] = ["estandar", "pro"];

export async function POST(req: Request) {
  // Modo demo: bloqueado en producción salvo que se autorice con un token
  // de invitación. La sesión 6 detectó que dejarlo abierto permitía a
  // cualquiera obtener una sesión `role=docente` válida y luego usar el
  // panel docente (crear códigos, vincular alumnos, etc.) — escalación
  // efectiva. Solo accesible si:
  //   - estamos en development, O
  //   - el body trae { token } y coincide con DEMO_INVITE_TOKEN.
  const body = await req.json().catch(() => ({}));

  const enDesarrollo = process.env.NODE_ENV !== "production";
  const tokenEsperado = process.env.DEMO_INVITE_TOKEN;
  const tokenProvisto = typeof body.token === "string" ? body.token : "";

  const autorizado =
    enDesarrollo ||
    (!!tokenEsperado && tokenEsperado.length >= 16 && tokenProvisto === tokenEsperado);

  if (!autorizado) {
    return NextResponse.json(
      { error: "Modo demo deshabilitado en producción. Inicia sesión con Google." },
      { status: 403 },
    );
  }

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
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
