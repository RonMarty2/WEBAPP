/**
 * GET /api/projects/[id]/cuadernillo
 *   → lista todos los cuadernillos del proyecto (un cuadernillo por fase)
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import { dbListCuadernillosByProyecto } from "@/lib/db/cuadernillos";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const proyecto = await dbGetProyecto(id);
    if (!proyecto || (proyecto.usuario_id !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }
    const cuadernillos = await dbListCuadernillosByProyecto(id);
    return NextResponse.json({ ok: true, total: cuadernillos.length, cuadernillos });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
