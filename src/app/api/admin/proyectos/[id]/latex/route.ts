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

    // Contenido del proyecto: solo phase_contents (sistema nuevo de 10 fases).
    const phaseContents = (((proyecto as unknown as Record<string, unknown>).phase_contents) ?? {}) as Record<string, string | null | undefined>;
    const nonEmpty = (s: string | null | undefined): string | null =>
      typeof s === "string" && s.trim() ? s : null;
    const caps345 = [phaseContents["ph-cap3"], phaseContents["ph-cap4"], phaseContents["ph-cap5"]]
      .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
      .join("\n\n") || null;

    const latexSource = generarLatex({
      titulo,
      autor: "Autor del Proyecto",
      carrera: servicio?.nombre ?? "Monografía",
      tema_aprobado: proyecto.tema_aprobado ?? undefined,
      planteamientoTema:    nonEmpty(phaseContents["ph-cap0"]),
      capituloI:            nonEmpty(phaseContents["ph-cap1"]),
      capituloII:           nonEmpty(phaseContents["ph-cap2"]),
      desarrolloIIIaV:      caps345,
      resumen:              nonEmpty(phaseContents["ph-resumen"]),
      conclusionesBiblio:   nonEmpty(phaseContents["ph-referencias"]),
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
