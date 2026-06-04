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
import {
  buildPreambleUNIFRANZ,
  buildCaratulaUNIFRANZ,
  buildResumenHeaderUNIFRANZ,
  buildIndiceUNIFRANZ,
  buildBibliografiaHeaderUNIFRANZ,
  buildFinDocumentoUNIFRANZ,
} from "@/lib/latex/preamble-unifranz";
import {
  UNIFRANZ_UNIVERSITY_ID,
  getModalidadUnifranz,
  type ModalidadUnifranz,
} from "@/lib/proyectoGrado/unifranz/modalidades";
import { getUnifranzPhases } from "@/lib/proyectoGrado/unifranz/fases";

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

/**
 * Construye el .tex y el ZIP para proyectos UNIFRANZ por modalidad.
 *
 * Las fases UNIFRANZ tienen IDs `ph-unifranz-{modalidad}-{slug}`. El slug
 * determina su posición estructural en el documento:
 *   resumen → Resumen Ejecutivo (preliminares, romanos)
 *   introduccion → Capítulo "INTRODUCCIÓN"
 *   cap1 → Capítulo I — Marco Teórico
 *   cap2 / cap2-* → Capítulo II (con sub-secciones)
 *   cap3 / cap3-* → Capítulo III (con sub-secciones)
 *   conclusiones / recomendaciones → secciones de cierre
 *   bibliografia → bibliografía final
 *   compilacion / defensa → no van al PDF (son utilidades del workspace)
 */
async function buildUnifranzZip(
  proyecto: NonNullable<Awaited<ReturnType<typeof dbGetProyecto>>>,
  user: { id: string; email?: string },
): Promise<Response> {
  const modalidadId = proyecto.modalidad_titulacion as ModalidadUnifranz;
  const modalidadInfo = getModalidadUnifranz(modalidadId);
  if (!modalidadInfo) {
    return NextResponse.json(
      { error: "Modalidad UNIFRANZ inválida en el proyecto" },
      { status: 400 },
    );
  }

  const phaseContents = (proyecto.phase_contents ?? {}) as Record<string, string | null>;
  const getContent = (faseId: string) => (phaseContents[faseId] ?? "").trim();

  // Resolver las fases UNIFRANZ de esta modalidad (ordenadas por `orden`).
  const fasesModalidad = getUnifranzPhases(modalidadId).sort((a, b) => a.orden - b.orden);

  // Prefijo exacto para extraer slugs sin perder guiones internos. Ver nota
  // larga en la declaración de `slugDe` más abajo.
  const slugPrefix = `ph-unifranz-${modalidadId.replace(/^unifranz-/, "")}-`;
  const extraerSlug = (faseId: string) =>
    faseId.startsWith(slugPrefix) ? faseId.slice(slugPrefix.length) : faseId;

  // Verificar que al menos una fase del documento esté generada.
  const algunaConContenido = fasesModalidad.some((f) => {
    const slug = extraerSlug(f.id);
    // Excluir compilacion y defensa que no van al PDF.
    if (slug === "compilacion" || slug === "defensa") return false;
    return getContent(f.id).length > 0;
  });
  if (!algunaConContenido) {
    return NextResponse.json(
      {
        error: "Aún no hay capítulos generados. Genera al menos uno (por ejemplo, el Capítulo I — Marco Teórico) antes de descargar el LaTeX.",
      },
      { status: 400 },
    );
  }

  // Datos para la carátula UNIFRANZ.
  const ctxInicial = (proyecto.academic_context as Record<string, unknown> | undefined)?.contexto_inicial as Record<string, string> | undefined;
  const titulo = (proyecto.tema_aprobado || proyecto.titulo_provisional || "Trabajo Final de Grado").trim();
  const carrera = (ctxInicial?.carrera || "Ingeniería").trim();
  const nombre = (user.email || "Estudiante").split("@")[0];
  const tutor = (ctxInicial?.tutor || "").trim() || undefined;

  // ⚠️ HISTÓRICO: aquí había un regex `/^ph-unifranz-[^-]+(?:-[^-]+)*-/` que
  // era greedy y comía DEMASIADO cuando la modalidad tiene guion en el
  // nombre (`pg-prefactibilidad`, `pg-mejora-org`, `pg-artefacto`,
  // `trabajo-dirigido`). Resultado: `cap2a-macroentorno` se convertía
  // en `macroentorno`, los filtros `cap2Fases`/`cap3Fases` quedaban
  // vacíos y 10+ subfases (PESTEL, Porter, Matricial, Financiera, etc.)
  // NO se incluían en el .tex final. El AgroHub salía con solo Cap I.
  //
  // Fix: usar `extraerSlug` que parte de `slugPrefix` construido desde
  // `modalidadId` (fuente de verdad) en lugar de adivinarlo por regex.
  const slugDe = extraerSlug;

  // Clasificar fases por sección estructural.
  const resumen = fasesModalidad.find((f) => slugDe(f.id) === "resumen");
  const intro = fasesModalidad.find((f) => slugDe(f.id) === "introduccion");
  const conclusiones = fasesModalidad.find((f) => slugDe(f.id) === "conclusiones");
  const recomendaciones = fasesModalidad.find((f) => slugDe(f.id) === "recomendaciones");
  const bibliografia = fasesModalidad.find((f) => slugDe(f.id) === "bibliografia");

  // Capítulo I (puede ser solo "cap1" o tener sub-fases).
  const cap1Fases = fasesModalidad.filter((f) => /^cap1(?:[-]|$)/.test(slugDe(f.id)));
  // Capítulo II (cap2, cap2-investigacion, cap2a-*, cap2b-*, etc.).
  const cap2Fases = fasesModalidad.filter((f) => /^cap2(?:[-a-z0-9]|$)/.test(slugDe(f.id)));
  // Capítulo III (cap3, cap3-*, cap3a-*, etc.).
  const cap3Fases = fasesModalidad.filter((f) => /^cap3(?:[-a-z0-9]|$)/.test(slugDe(f.id)));

  // Ensamblar el .tex.
  const partes: string[] = [];

  partes.push(buildPreambleUNIFRANZ());
  partes.push(
    buildCaratulaUNIFRANZ({
      nombre,
      titulo,
      modalidad: modalidadInfo.nombre_portada,
      carrera,
      facultad: "Facultad de Ciencias Económicas y Empresariales",
      universidad: "UNIVERSIDAD PRIVADA FRANZ TAMAYO",
      ciudad: "Cochabamba",
      pais: "Bolivia",
      anio: String(new Date().getFullYear()),
      tutor,
    }),
  );

  // Resumen ejecutivo (preliminares en romanos).
  if (resumen && getContent(resumen.id)) {
    partes.push(buildResumenHeaderUNIFRANZ());
    partes.push(mdALatex(getContent(resumen.id)));
  }

  // Índice (transición a arábigos).
  partes.push(buildIndiceUNIFRANZ());

  // Introducción (capítulo \chapter*, va antes del Cap. I).
  if (intro && getContent(intro.id)) {
    partes.push("\n\\chapter*{INTRODUCCIÓN}\n");
    partes.push("\\addcontentsline{toc}{chapter}{INTRODUCCIÓN}\n");
    partes.push(mdALatex(getContent(intro.id)));
    partes.push("\n");
  }

  // Helper: renderizar un grupo de fases bajo un \chapter común.
  const renderCapitulo = (
    fases: typeof fasesModalidad,
    nombreCap: string,
    nombreCorto: string,
  ) => {
    const conContenido = fases.filter((f) => getContent(f.id));
    if (conContenido.length === 0) return;
    partes.push(`\n\\chapter{${escaparLatex(nombreCap)}}\n`);
    void nombreCorto; // por si en el futuro queremos cabecera corta
    for (const fase of conContenido) {
      partes.push(mdALatex(getContent(fase.id)));
      partes.push("\n");
    }
  };

  // Capítulos del cuerpo según la modalidad.
  // Tesis: I Marco Teórico, II Marco Práctico, III Resultados y Discusión.
  // PG/TD: I Marco Teórico, II Investigación, III Propuesta/Plan/Diseño.
  // Los labels de cada modalidad ya vienen en `modalidadInfo.capitulos` (3 strings).
  const labelsCap = modalidadInfo.capitulos;
  const nombreCap1 = labelsCap[0]?.replace(/^Capítulo\s+I\s+—\s+/, "") ?? "Marco Teórico";
  const nombreCap2 = labelsCap[1]?.replace(/^Capítulo\s+II\s+—\s+/, "").replace(/\s+\(.*$/, "") ?? "Investigación";
  const nombreCap3 = labelsCap[2]?.replace(/^Capítulo\s+III\s+—\s+/, "").replace(/\s+\(.*$/, "") ?? "Propuesta";

  renderCapitulo(cap1Fases, nombreCap1, "Cap. I");
  renderCapitulo(cap2Fases, nombreCap2, "Cap. II");
  renderCapitulo(cap3Fases, nombreCap3, "Cap. III");

  // Conclusiones + Recomendaciones (capítulo combinado, sin numerar).
  const tieneConclus = conclusiones && getContent(conclusiones.id);
  const tieneRecom = recomendaciones && getContent(recomendaciones.id);
  if (tieneConclus || tieneRecom) {
    partes.push("\n\\chapter*{CONCLUSIONES Y RECOMENDACIONES}\n");
    partes.push("\\addcontentsline{toc}{chapter}{Conclusiones y Recomendaciones}\n");
    if (tieneConclus) {
      partes.push("\n\\section*{Conclusiones}\n");
      partes.push(mdALatex(getContent(conclusiones!.id)));
    }
    if (tieneRecom) {
      partes.push("\n\\section*{Recomendaciones}\n");
      partes.push(mdALatex(getContent(recomendaciones!.id)));
    }
  }

  // Bibliografía.
  if (bibliografia && getContent(bibliografia.id)) {
    partes.push(buildBibliografiaHeaderUNIFRANZ());
    partes.push(mdALatex(getContent(bibliografia.id)));
  }

  partes.push(buildFinDocumentoUNIFRANZ());

  const texContent = partes.join("\n");

  // Armar ZIP.
  const zip = new JSZip();
  zip.file("trabajo-final-grado.tex", texContent);
  zip.file(
    "README.txt",
    `Trabajo Final de Grado — UNIFRANZ Cochabamba
================================================

Modalidad: ${modalidadInfo.nombre}
Guía oficial: ${modalidadInfo.guia_oficial.nombre} (${modalidadInfo.guia_oficial.fecha})
Sección de referencia: ${modalidadInfo.guia_oficial.seccion_referencia}

Archivo principal: trabajo-final-grado.tex

Para compilar en tu PC:
  1. Instala una distribución LaTeX (TeX Live, MiKTeX o MacTeX).
  2. Abre el .tex en tu editor (TeXstudio, VSCode con LaTeX Workshop, etc.).
  3. Compila dos veces con pdflatex (la segunda actualiza el índice):
       pdflatex trabajo-final-grado.tex
       pdflatex trabajo-final-grado.tex

Para compilar en Overleaf:
  1. Entra a https://www.overleaf.com
  2. New Project → Upload Project → selecciona este ZIP completo.
  3. Overleaf detecta trabajo-final-grado.tex y lo compila automáticamente.

Formato oficial UNIFRANZ 2017:
  - Tipografía: Verdana 10pt (sustituida por Helvetica en LaTeX por
    compatibilidad; puede usarse Verdana real con XeLaTeX/LuaLaTeX + fontspec).
  - Márgenes: superior 2.5 / izquierdo 3.5 / inferior 2.5 / derecho 2.5 cm.
  - Interlineado: 1.5 con 6 puntos posteriores.
  - Numeración: inferior derecha. Preliminares en romanos minúsculos;
    cuerpo en arábigos desde INTRODUCCIÓN.
  - Citas APA con apellidos en minúscula (sello UNIFRANZ).

Fases incluidas en este paquete:
${fasesModalidad
  .filter((f) => {
    const s = slugDe(f.id);
    if (s === "compilacion" || s === "defensa") return false;
    return getContent(f.id).length > 0;
  })
  .map((f) => `  ✓ ${f.id} — ${f.label}`)
  .join("\n")}
`,
  );

  const zipBuffer = await zip.generateAsync({ type: "uint8array" });
  const baseName = slugify(titulo);

  return new NextResponse(zipBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${baseName}-unifranz-${modalidadId}.zip"`,
    },
  });
}

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

    // 🎓 DISPATCH UNIFRANZ ────────────────────────────────────────────────
    // Si el proyecto es UNIFRANZ + Proyecto de Grado + tiene modalidad,
    // usamos el builder UNIFRANZ. Si no, sigue al builder UCATEC genérico
    // (no rompemos la regresión de los proyectos PG existentes).
    if (
      proyecto.universidad_id === UNIFRANZ_UNIVERSITY_ID
      && proyecto.servicio_id === "proy-grado-001"
      && getModalidadUnifranz(proyecto.modalidad_titulacion) !== null
    ) {
      return buildUnifranzZip(proyecto, user);
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
