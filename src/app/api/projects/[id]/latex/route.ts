/**
 * GET /api/projects/[id]/latex
 * Descarga el .tex del proyecto con el formato de la universidad seleccionada.
 */
import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import { generarLatex, nombreArchivoLatex } from "@/lib/export/latex-builder";
import { DEFAULT_UNIVERSITIES } from "@/lib/data";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const url = new URL(_req.url);
    const qs = url.searchParams;
    const { user } = await requireAuth();
    const { id } = await params;

    const raw = await dbGetProyecto(id);
    if (!raw || (raw.usuario_id !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }
    const proyecto = raw as unknown as Record<string, unknown>;

    const titulo = (proyecto.tema_aprobado as string | null) || (proyecto.titulo_provisional as string | null) || "Proyecto Académico";

    // Buscar formato de universidad
    const universidadId = proyecto.universidad_id as string | undefined;
    const universidad = universidadId
      ? DEFAULT_UNIVERSITIES.find(u => u.id === universidadId)
      : DEFAULT_UNIVERSITIES[0];

    // Contenido del proyecto: solo phase_contents (sistema nuevo de 10 fases).
    const phaseContents = (proyecto.phase_contents ?? {}) as Record<string, string | null | undefined>;
    const nonEmpty = (s: string | null | undefined): string | null =>
      typeof s === "string" && s.trim() ? s : null;
    // Cap III, IV, V del sistema nuevo se combinan en la sección "Capítulos III-V" del LaTeX.
    const caps345 = [phaseContents["ph-cap3"], phaseContents["ph-cap4"], phaseContents["ph-cap5"]]
      .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
      .join("\n\n") || null;

    const latexSource = generarLatex({
      titulo,
      autor: qs.get("nombre") || user.name,
      institucion: universidad?.name,
      carrera: qs.get("carrera") || "Documento Académico",
      anio: qs.get("anio") || new Date().getFullYear().toString(),
      mes: qs.get("mes") || undefined,
      tutor: qs.get("tutor") || undefined,
      programa: qs.get("programa") || undefined,
      version: qs.get("version") || undefined,
      tema_aprobado: (proyecto.tema_aprobado as string) ?? undefined,
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
