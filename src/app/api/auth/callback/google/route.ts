import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForGoogleProfile,
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  isAdmin,
  type UserRole,
} from "@/lib/auth";
import { dbUpsertUser, dbGetUser, dbGetUserByEmail } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const host = req.headers.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/auth/callback/google`;

  if (error || !code) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", origin));
  }

  const profile = await exchangeCodeForGoogleProfile(code, redirectUri);
  if (!profile) {
    return NextResponse.redirect(new URL("/login?error=profile_failed", origin));
  }

  // Resolver rol/active con esta jerarquía:
  //
  //   1) Si el usuario YA EXISTE en BD → respetar su rol actual.
  //      La BD es la fuente de verdad. Esto evita que la env var ADMIN_EMAILS
  //      pise un cambio manual (ej: "este usuario era admin y lo bajé a
  //      estudiante con un SQL"). Si un admin bajó a alguien, no queremos
  //      que el próximo login lo vuelva a subir solo porque su email
  //      aparece en la whitelist.
  //
  //   2) Si el usuario NO EXISTE (primer login) → la env var ADMIN_EMAILS
  //      decide. Útil para alta automática del admin del SaaS.
  //
  // ANTES (bug que mantuvo a rnd261190 como admin en cada login):
  //   role: admin ? "admin" : (existing?.role ?? "estudiante")
  // → si el email estaba en ADMIN_EMAILS, el callback forzaba role=admin
  // en CADA login, pisando lo que tuviera la BD.
  const isWhitelistedAdmin = isAdmin(profile.email);

  // Buscar el usuario en BD por ID Y por email — algunos usuarios tienen el
  // registro con id != profile.id (por ej. usuarios creados manualmente con
  // SQL antes de loguearse). Sin este doble lookup, el callback caía al
  // fallback "primer login" y la env var ADMIN_EMAILS lo subía a admin
  // aunque la BD tuviera role=user/estudiante.
  let existing = await dbGetUser(profile.id);
  if (!existing) {
    existing = await dbGetUserByEmail(profile.email);
  }

  let finalRole: UserRole;
  let finalActive: boolean;

  if (existing) {
    finalRole = (existing.role as UserRole | undefined) ?? "estudiante";
    finalActive = existing.active ?? false;
  } else {
    finalRole = isWhitelistedAdmin ? "admin" : "estudiante";
    finalActive = isWhitelistedAdmin ? true : false;
  }

  // Antes se logueaba el email completo, lo cual es PII en logs de Vercel
  // y permite enumerar admins. Ahora solo el dominio del email + flags.
  // Activar log completo con LOG_AUTH_DEBUG=1 si hace falta diagnosticar.
  if (process.env.LOG_AUTH_DEBUG === "1") {
    console.log("[oauth/callback] email=%s isWhitelistedAdmin=%s existing.role=%s → finalRole=%s",
      profile.email, isWhitelistedAdmin, existing?.role, finalRole);
  } else {
    const dominio = profile.email.split("@")[1] ?? "?";
    console.log("[oauth/callback] dominio=%s isWhitelistedAdmin=%s existing.role=%s → finalRole=%s",
      dominio, isWhitelistedAdmin, existing?.role, finalRole);
  }

  const userRecord = await dbUpsertUser({
    id: profile.id,
    email: profile.email,
    name: profile.name,
    picture: profile.picture,
    role: finalRole,
    plan: existing?.plan,
    active: finalActive,
  });

  const sessionUser = {
    id: userRecord.id,
    email: userRecord.email,
    name: userRecord.name,
    picture: userRecord.picture,
    role: userRecord.role,
    plan: userRecord.plan,
    active: userRecord.active,
  };

  const token = await createSessionToken(sessionUser);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  // Redirigir según el rol REAL del usuario (de BD), no según la whitelist.
  if (userRecord.role === "admin") return NextResponse.redirect(new URL("/admin", origin));
  if (!userRecord.active) return NextResponse.redirect(new URL("/pendiente", origin));
  return NextResponse.redirect(new URL("/dashboard", origin));
}
