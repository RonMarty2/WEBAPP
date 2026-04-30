/**
 * GET /api/admin/proyectos — Lista todos los proyectos (todos los usuarios)
 * Solo accesible por admin.
 */
import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
  try {
    await requireAdmin();
    const db = createAdminClient();

    const { data, error } = await db
      .from("proyectos_fases")
      .select(`
        id, usuario_id, tema_aprobado, titulo_provisional,
        estado_fase, completado, created_at, updated_at,
        servicios ( id, nombre )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Error al obtener proyectos" }, { status: 500 });
    }

    return NextResponse.json({ proyectos: data ?? [] });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
