import { NextResponse } from "next/server";
import { SignJWT } from "jose";

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "laboratorio-academico-super-secret-key-2024"
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = body.password?.trim();
    const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();

    if (!adminPassword) {
      return NextResponse.json(
        { error: "ADMIN_PASSWORD no está configurada en el servidor." },
        { status: 503 }
      );
    }

    if (!password || password !== adminPassword) {
      return NextResponse.json({ error: "Acceso restringido al panel de administración" }, { status: 401 });
    }

    const token = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(ADMIN_JWT_SECRET);

    const response = NextResponse.json({ success: true });

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}
