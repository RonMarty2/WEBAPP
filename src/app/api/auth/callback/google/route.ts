import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForGoogleProfile,
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  isAdmin,
} from "@/lib/auth";
import { upsertUser, getUser } from "@/lib/memoryStore";

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

  const admin = isAdmin(profile.email);

  // Mantener rol/plan si el usuario ya existe y fue activado
  const existing = getUser(profile.id);

  const userRecord = upsertUser({
    id: profile.id,
    email: profile.email,
    name: profile.name,
    picture: profile.picture,
    role: admin ? "admin" : (existing?.role ?? "estudiante"),
    plan: existing?.plan,
    active: admin ? true : (existing?.active ?? false),
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

  if (admin) return NextResponse.redirect(new URL("/admin", origin));
  if (!userRecord.active) return NextResponse.redirect(new URL("/pendiente", origin));
  return NextResponse.redirect(new URL("/dashboard", origin));
}
