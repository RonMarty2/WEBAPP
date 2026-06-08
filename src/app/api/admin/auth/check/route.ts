import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

// Sin fallback hardcodeado: si la variable no está, el endpoint devuelve 503
// y queda obvio en logs que falta configurar el secret en el entorno.
function getAdminSecret(): Uint8Array {
  const v = process.env.ADMIN_JWT_SECRET;
  if (!v || v.length < 16) {
    throw new Error("ADMIN_JWT_SECRET no está configurada (mínimo 32 caracteres aleatorios).");
  }
  return new TextEncoder().encode(v);
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Sin sesión admin" }, { status: 401 });
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

    const { payload } = await jwtVerify(token, adminSecret);

    if (payload.role !== "admin") {
      return NextResponse.json({ error: "No es admin" }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sesión inválida o expirada" }, { status: 401 });
  }
}
