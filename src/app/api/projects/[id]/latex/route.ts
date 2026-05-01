/**
 * GET /api/projects/[id]/latex
 * Descarga el .tex del proyecto con el formato de la universidad seleccionada.
 */
import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { getProyecto } from "@/lib/memoryStore";
import { generarLatex, nombreArchivoLatex } from "@/lib/export/latex-builder";
import { DEFAULT_UNIVERSITIES } from "@/lib/data";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    let proyecto: Record<string, unknown> | null = null;

    if (!isSupabaseConfigured()) {
      const p = getProyecto(id);
      if (!p) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
      proyecto = p as unknown as Record<string, unknown>;
    } else {
      const db = createAdminClient();
      const { data, error } = await db
        .from("proyectos_fases")
        .select("*, servicios ( nombre )")
        .eq("id", id)
        .eq("usuario_id", user.id)
        .single();
      if (error || !data) {
        const p = getProyecto(id);
        if (!p) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
        proyecto = p as unknown as Record<string, unknown>;
      } else {
        proyecto = data as Record<string, unknown>;
      }
    }

    const titulo = (proyecto.tema_aprobado as string | null) || (proyecto.titulo_provisional as string | null) || "Proyecto Académico";

    // Buscar formato de universidad
    const universidadId = proyecto.universidad_id as string | undefined;
    const universidad = universidadId
      ? DEFAULT_UNIVERSITIES.find(u => u.id === universidadId)
      : DEFAULT_UNIVERSITIES[0];

    const latexSource = generarLatex({
      titulo,
      autor: user.name,
      institucion: universidad?.name,
      carrera: "Monografía Académica",
      tema_aprobado: (proyecto.tema_aprobado as string) ?? undefined,
      contenido_fase_0: proyecto.contenido_fase_0 as string | null,
      contenido_fase_1: proyecto.contenido_fase_1 as string | null,
      contenido_fase_2: proyecto.contenido_fase_2 as string | null,
      contenido_fase_3: proyecto.contenido_fase_3 as string | null,
      contenido_fase_4: proyecto.contenido_fase_4 as string | null,
      contenido_fase_5: proyecto.contenido_fase_5 as string | null,
    });

    const filename = nombreArchivoLatex(titulo);

    return new NextResponse(latexSource, {
      status: 200,
      headers: {
        "Content-Type": "application/x-tex; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
