import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
  try {
    await requireAuth();
    const db = createAdminClient();

    const { data, error } = await db
      .from("servicios")
      .select(`
        id, nombre, descripcion, activo, audiencia_id,
        perfiles_audiencia ( id, nombre )
      `)
      .eq("activo", true)
      .order("nombre");

    if (error) {
      return NextResponse.json({ error: "Error al obtener servicios" }, { status: 500 });
    }

    return NextResponse.json({ servicios: data ?? [] });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
