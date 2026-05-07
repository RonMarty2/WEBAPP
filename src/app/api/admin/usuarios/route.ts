import { NextResponse } from "next/server";
import { dbListUsers, dbActivateUser, dbDeactivateUser, dbUpsertUser, dbGetUser } from "@/lib/db";
import type { UserRole, UserPlan } from "@/lib/auth";

// GET /api/admin/usuarios — lista todos los usuarios registrados
export async function GET() {
  return NextResponse.json({ usuarios: await dbListUsers() });
}

// PATCH /api/admin/usuarios — activar/desactivar y asignar rol+plan
export async function PATCH(req: Request) {
  const { id, action, role, plan } = await req.json();

  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  if (action === "activate") {
    const user = await dbActivateUser(id, role as UserRole, plan as UserPlan);
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true, user });
  }

  if (action === "deactivate") {
    const user = await dbDeactivateUser(id);
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true, user });
  }

  if (action === "update") {
    const existing = await dbGetUser(id);
    if (!existing) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    const user = await dbUpsertUser({ ...existing, role: role as UserRole, plan: plan as UserPlan });
    return NextResponse.json({ ok: true, user });
  }

  return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
}
