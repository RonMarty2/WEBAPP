import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { dbGetUserByEmail } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  const userFromToken = await verifySessionToken(token);
  if (!userFromToken) return NextResponse.json({ user: null }, { status: 401 });

  // Revalidar contra la BD para que cambios de rol/plan/active hechos por
  // un admin (degradar a estudiante, deactivar, cambio de plan) se reflejen
  // INMEDIATAMENTE en la sesión sin necesidad de logout/login forzoso.
  // Si la BD falla, caemos a los datos del JWT — mejor mantener la sesión
  // que romperla por un timeout puntual.
  try {
    const dbUser = await dbGetUserByEmail(userFromToken.email);
    if (!dbUser) return NextResponse.json({ user: null }, { status: 401 });
    if (dbUser.active === false) return NextResponse.json({ user: null }, { status: 401 });
    const user = {
      ...userFromToken,
      role: dbUser.role ?? userFromToken.role,
      plan: dbUser.plan ?? userFromToken.plan,
      active: dbUser.active ?? userFromToken.active,
    };
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: userFromToken });
  }
}
