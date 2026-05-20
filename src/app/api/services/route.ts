import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { SERVICIOS_CATALOGO, toLegacyServiciosShape } from "@/lib/servicesCatalog";

export async function GET() {
  try {
    await requireAuth();

    const fallback = toLegacyServiciosShape();

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ servicios: fallback, catalogo: SERVICIOS_CATALOGO });
    }

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
      return NextResponse.json({ servicios: fallback, catalogo: SERVICIOS_CATALOGO });
    }

    return NextResponse.json({
      servicios: data?.length ? data : fallback,
      catalogo: SERVICIOS_CATALOGO,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
