import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "laboratorio-academico-super-secret-key-2024"
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Sin sesión admin" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, ADMIN_JWT_SECRET);

    if (payload.role !== "admin") {
      return NextResponse.json({ error: "No es admin" }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sesión inválida o expirada" }, { status: 401 });
  }
}
