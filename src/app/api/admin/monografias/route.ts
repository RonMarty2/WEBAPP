import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import { monografiasStore, capitulosStore, citasStore, documentosStore } from "@/lib/memoryStore";

// GET /api/admin/monografias
// Devuelve todas las monografías con sus capítulos y estadísticas para el panel admin
export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const all = [...monografiasStore.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const result = all.map((m) => {
    const capitulos = capitulosStore.get(m.id) ?? [];
    const citas = citasStore.get(m.id) ?? [];
    const documentos = documentosStore.get(m.id) ?? [];

    return {
      id: m.id,
      user_id: m.user_id,
      titulo: m.titulo || "(Sin título)",
      diplomado: m.diplomado || m.datos_base?.diplomado || "",
      tema: m.tema || "",
      status: m.status,
      etapa_actual: m.etapa_actual,
      created_at: m.created_at,
      updated_at: m.updated_at,
      capitulos: capitulos.map((c) => ({
        numero: c.numero,
        status: c.status,
        palabras: c.contenido ? c.contenido.trim().split(/\s+/).length : 0,
        observaciones: c.observaciones || null,
        updated_at: c.updated_at,
      })),
      citas_count: citas.length,
      documentos_count: documentos.length,
    };
  });

  return NextResponse.json(result);
}
