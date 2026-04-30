/**
 * GET /api/admin/proyectos/[id]/latex
 * Genera y descarga el .tex del proyecto usando el builder UMSS.
 * Solo accesible por admin.
 */
import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase";
import { generarLatex, nombreArchivoLatex } from "@/lib/export/latex-builder";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const db = createAdminClient();

    const { data: proyecto, error } = await db
      .from("proyectos_fases")
      .select("*, servicios ( nombre )")
      .eq("id", id)
      .single();

    if (error || !proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    const titulo = proyecto.tema_aprobado || proyecto.titulo_provisional || "Proyecto Académico";
    const servicio = proyecto.servicios as { nombre: string } | null;

    const latexSource = generarLatex({
      titulo,
      autor: "Autor del Proyecto",
      carrera: servicio?.nombre ?? "Monografía",
      tema_aprobado: proyecto.tema_aprobado ?? undefined,
      contenido_fase_0: proyecto.contenido_fase_0,
      contenido_fase_1: proyecto.contenido_fase_1,
      contenido_fase_2: proyecto.contenido_fase_2,
      contenido_fase_3: proyecto.contenido_fase_3,
      contenido_fase_4: proyecto.contenido_fase_4,
      contenido_fase_5: proyecto.contenido_fase_5,
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
