/**
 * GET /api/projects/[id]/paquete-latex-pg
 *
 * Empaqueta el Proyecto de Grado en un ZIP listo para compilar con
 * pdflatex localmente o subir a Overleaf.
 *
 * Diferente al endpoint /paquete-latex (que es para Monografía):
 * - Soporta las 22 fases del PG (ph-proy-cap0 a ph-proy-referencias).
 * - Usa el preámbulo UCATEC oficial.
 * - Estructura el documento según los 4 capítulos UCATEC (Marco
 *   Referencial, Teórico, Situacional, Propositivo) + cierre.
 * - Solo incluye las fases que tienen contenido generado (las vacías
 *   se omiten con un comentario en el .tex).
 *
 * Estrategia minimalista (sin pasar por la IA para compilación):
 * convierte el markdown de cada fase a LaTeX usando mdALatex (que ya
 * preserva bloques tikz/latex/pgfplots) y arma el documento completo.
 */

import { NextResponse } from "next/server";
import JSZip from "jszip";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import { mdALatex, escaparLatex } from "@/lib/latexMonografia";
import {
  buildPreambleUCATEC,
  buildCaratulaUCATEC,
  buildResumenHeaderUCATEC,
  buildIndiceUCATEC,
  buildBibliografiaHeaderUCATEC,
  buildFinDocumentoUCATEC,
} from "@/lib/latex/preamble-ucatec";

type Params = { params: Promise<{ id: string }> };

function slugify(s: string): string {
  return (s || "proyecto-grado")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "proyecto-grado";
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface FasePG {
  faseId: string;
  /** Título sugerido para el header del capítulo si la fase abre uno. */
  titulo?: string;
  /** Si pertenece a un capítulo padre (cap1, cap2, cap3, cap4), su número. */
  capituloPadre?: "I" | "II" | "III" | "IV";
  /** Si es la primera subfase de su capítulo (la que abre con \chapter). */
  abreCapitulo?: boolean;
}

// Definición de las 22 fases PG en orden estructural del documento
const FASES_PG_ORDEN: FasePG[] = [
  // Cap. I — Marco Referencial
  { faseId: "ph-proy-cap1",    capituloPadre: "I",   abreCapitulo: true, titulo: "Marco Referencial" },
  // Cap. II — Marco Teórico
  { faseId: "ph-proy-cap2",    capituloPadre: "II",  abreCapitulo: true, titulo: "Marco Teórico" },
  // Cap. III — Marco Situacional (6 subfases)
  { faseId: "ph-proy-cap3a",   capituloPadre: "III", abreCapitulo: true, titulo: "Marco Situacional" },
  { faseId: "ph-proy-cap3b",   capituloPadre: "III" },
  { faseId: "ph-proy-cap3c",   capituloPadre: "III" },
  { faseId: "ph-proy-cap3d",   capituloPadre: "III" },
  { faseId: "ph-proy-cap3e",   capituloPadre: "III" },
  { faseId: "ph-proy-cap3f",   capituloPadre: "III" },
  // Cap. IV — Marco Propositivo (8 subfases)
  { faseId: "ph-proy-cap4a",   capituloPadre: "IV",  abreCapitulo: true, titulo: "Marco Propositivo" },
  { faseId: "ph-proy-cap4abis",capituloPadre: "IV" },
  { faseId: "ph-proy-cap4b",   capituloPadre: "IV" },
  { faseId: "ph-proy-cap4c",   capituloPadre: "IV" },
  { faseId: "ph-proy-cap4d",   capituloPadre: "IV" },
  { faseId: "ph-proy-cap4e",   capituloPadre: "IV" },
  { faseId: "ph-proy-cap4f",   capituloPadre: "IV" },
  { faseId: "ph-proy-cap4g",   capituloPadre: "IV" },
];

const FASES_CIERRE = {
  resumen: "ph-proy-resumen",
  conclusiones: "ph-proy-conclus",
  bibliografia: "ph-proy-referencias",
};

export async function GET(_req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const proyecto = await dbGetProyecto(id);
    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }
    if (proyecto.usuario_id !== user.id) {
      return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
    }

    const phaseContents = (proyecto.phase_contents ?? {}) as Record<string, string | null>;
    const getContent = (faseId: string) => (phaseContents[faseId] ?? "").trim();

    // Verificar que al menos haya UNA fase del documento generada
    const tieneAlgo = FASES_PG_ORDEN.some((f) => getContent(f.faseId).length > 0)
      || Object.values(FASES_CIERRE).some((id) => getContent(id).length > 0);
    if (!tieneAlgo) {
      return NextResponse.json(
        {
          error: "Aún no hay capítulos del documento generados. Generá al menos Cap. I (Marco Referencial) antes de descargar el LaTeX. El Cap. 0 (Idea de Negocio) es solo validación interna y NO va al documento final.",
        },
        { status: 400 },
      );
    }

    // Datos de carátula
    const ctxInicial = (proyecto.academic_context as Record<string, unknown> | undefined)?.contexto_inicial as Record<string, string> | undefined;
    const titulo = (proyecto.tema_aprobado || proyecto.titulo_provisional || "Proyecto de Grado").trim();
    const ahora = new Date();
    const carrera = (ctxInicial?.carrera || "Ingeniería Comercial").trim();
    const programa = (ctxInicial?.programa || "Licenciatura").trim().toUpperCase();
    const nombre = (user.email || "Estudiante").split("@")[0];

    // Ensamblar el .tex
    const partes: string[] = [];

    partes.push(buildPreambleUCATEC());
    partes.push(buildCaratulaUCATEC({
      nombre,
      titulo,
      carrera,
      facultad: "Facultad de Ciencias Empresariales",
      modalidad: "PROYECTO DE GRADO",
      grado: programa,
      universidad: "Universidad Privada de Ciencias Administrativas y Tecnológicas (UCATEC)",
      ciudad: "Cochabamba",
      pais: "Bolivia",
      mes: MESES[ahora.getMonth()],
      anio: String(ahora.getFullYear()),
    }));

    // Resumen ejecutivo (si existe) — va antes del índice en numeración romana
    const resumenMd = getContent(FASES_CIERRE.resumen);
    if (resumenMd) {
      partes.push(buildResumenHeaderUCATEC());
      partes.push(mdALatex(resumenMd));
    }

    // Índice
    partes.push(buildIndiceUCATEC());

    // Capítulos del cuerpo — agrupados por capítulo padre
    const capitulosUsados = new Set<string>();
    for (const fase of FASES_PG_ORDEN) {
      const md = getContent(fase.faseId);
      if (!md) continue;

      // Abrir capítulo si esta fase es la primera generada de su capítulo padre
      if (fase.capituloPadre && !capitulosUsados.has(fase.capituloPadre)) {
        capitulosUsados.add(fase.capituloPadre);
        const tituloCap = fase.titulo || `Capítulo ${fase.capituloPadre}`;
        partes.push(`\n\\chapter{${escaparLatex(tituloCap)}}\n`);
      }

      // Convertir markdown a LaTeX (preserva bloques tikz/latex/pgfplots)
      partes.push(mdALatex(md));
      partes.push("\n");
    }

    // Conclusiones (si existen) — sin chapter formal, se trata como sección
    const conclusionesMd = getContent(FASES_CIERRE.conclusiones);
    if (conclusionesMd) {
      partes.push("\n\\chapter*{Conclusiones y Recomendaciones}\n");
      partes.push("\\addcontentsline{toc}{chapter}{Conclusiones y Recomendaciones}\n");
      partes.push(mdALatex(conclusionesMd));
    }

    // Bibliografía
    const biblioMd = getContent(FASES_CIERRE.bibliografia);
    if (biblioMd) {
      partes.push(buildBibliografiaHeaderUCATEC());
      partes.push(mdALatex(biblioMd));
    }

    partes.push(buildFinDocumentoUCATEC());

    const texContent = partes.join("\n");

    // Armar ZIP
    const zip = new JSZip();
    zip.file("proyecto-grado.tex", texContent);

    // README con instrucciones
    zip.file("README.txt", `Proyecto de Grado — Paquete LaTeX
================================================

Archivo principal: proyecto-grado.tex

Para compilar en tu PC:
  1. Instalá una distribución LaTeX (TeX Live, MiKTeX o MacTeX).
  2. Abrí el .tex en tu editor (TeXstudio, VSCode con LaTeX Workshop, etc.).
  3. Compilá dos veces con pdflatex (la segunda vez actualiza el índice):
       pdflatex proyecto-grado.tex
       pdflatex proyecto-grado.tex

Para compilar en Overleaf:
  1. Entrá a https://www.overleaf.com
  2. New Project → Upload Project → seleccioná este ZIP completo.
  3. Overleaf detecta proyecto-grado.tex y lo compila automáticamente.

Notas:
  - El preámbulo carga tikz + pgfplots para los diagramas vectoriales
    del Cap. III y Cap. IV (árbol de problemas, organigrama, flujograma).
  - Las fórmulas matemáticas (muestreo, VAN, TIR) se renderizan
    tipográficamente con amsmath.
  - Tipografía: Times New Roman 12pt, interlineado 1.5, márgenes UCATEC.

Fases incluidas en este paquete:
${[...FASES_PG_ORDEN.map((f) => f.faseId), ...Object.values(FASES_CIERRE)]
  .filter((id) => getContent(id).length > 0)
  .map((id) => `  ✓ ${id}`)
  .join("\n")}
`);

    const zipBuffer = await zip.generateAsync({ type: "uint8array" });
    const baseName = slugify(titulo);

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${baseName}-pg-latex.zip"`,
      },
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[paquete-latex-pg] error:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
