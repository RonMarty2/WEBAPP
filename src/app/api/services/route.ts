import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase";

const MOCK_SERVICIOS = [
  {
    id: "mono-001",
    nombre: "Monografía Académica",
    descripcion: "Generador de monografías completas con IA para diplomados y postgrados",
    activo: true,
    audiencia_id: "est-001",
    perfiles_audiencia: { id: "est-001", nombre: "Estudiante" },
  },
];

export async function GET() {
  try {
    await requireAuth();

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ servicios: MOCK_SERVICIOS });
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
      return NextResponse.json({ servicios: MOCK_SERVICIOS });
    }

    return NextResponse.json({ servicios: data?.length ? data : MOCK_SERVICIOS });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
