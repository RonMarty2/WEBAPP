import { NextResponse } from "next/server";
import { SignJWT } from "jose";

// Sin fallback hardcodeado: si la variable no está, el endpoint devuelve 503
// y queda obvio en logs que falta configurar el secret en el entorno. El
// fallback previo (`"laboratorio-academico-super-secret-key-2024"`) permitía
// a cualquiera con acceso al repo forjar sesiones de admin si la env no
// estaba puesta en producción.
function getAdminSecret(): Uint8Array {
  const v = process.env.ADMIN_JWT_SECRET;
  if (!v || v.length < 16) {
    throw new Error("ADMIN_JWT_SECRET no está configurada (mínimo 32 caracteres aleatorios).");
  }
  return new TextEncoder().encode(v);
}

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

    let adminSecret: Uint8Array;
    try {
      adminSecret = getAdminSecret();
    } catch (e) {
      return NextResponse.json(
        { error: (e as Error).message },
        { status: 503 }
      );
    }

    const token = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(adminSecret);

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
