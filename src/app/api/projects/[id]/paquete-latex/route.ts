/**
 * GET /api/projects/[id]/paquete-latex
 *
 * Genera un ZIP listo para subir a Overleaf: contiene el .tex con datos
 * del usuario inyectados (nombre, fecha, programa) + el logo de la
 * universidad + un README breve.
 *
 * El usuario solo hace UN click y obtiene un paquete autocontenido para
 * subir directamente a Overleaf y compilar sin tocar nada más.
 */

import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import JSZip from "jszip";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import { DEFAULT_UNIVERSITIES } from "@/lib/data";
import { sanitizeOrphanIncludes } from "@/lib/latex/sanitize";
import { llamarIA, hydrateAIConfigAsync } from "@/lib/aiProvider";
import { mdALatex, escaparLatexPlain } from "@/lib/latexMonografia";
import {
  SISTEMA_COMPILAR_CAPITULO,
  buildCompilarCapituloUserPrompt,
} from "@/lib/prompts/scribe/compilar-capitulo";
import {
  buildPreambleUMSS,
  buildCaratulaUMSS,
  buildResumenHeader,
  buildIndice,
  buildBibliografiaHeader,
  buildFinDocumento,
} from "@/lib/latex/preamble-umss";
import {
  buildPreambleUCB,
  buildCaratulaUCB,
  buildTribunalUCB,
  buildResumenHeader as buildResumenHeaderUCB,
  buildAbstractHeader as buildAbstractHeaderUCB,
  buildIndice as buildIndiceUCB,
  buildBibliografiaHeader as buildBibliografiaHeaderUCB,
  buildSeparadorAnexos as buildSeparadorAnexosUCB,
  buildFinDocumento as buildFinDocumentoUCB,
} from "@/lib/latex/preamble-ucb";
import {
  buildPreambleUNIFRANZ,
  buildCaratulaUNIFRANZ,
  buildResumenHeaderUNIFRANZ,
  buildIndiceUNIFRANZ,
  buildBibliografiaHeaderUNIFRANZ,
  buildFinDocumentoUNIFRANZ,
} from "@/lib/latex/preamble-unifranz";
import {
  buildPreambleUCATEC,
  buildCaratulaUCATEC,
  buildResumenHeaderUCATEC,
  buildIndiceUCATEC,
  buildBibliografiaHeaderUCATEC,
  buildFinDocumentoUCATEC,
} from "@/lib/latex/preamble-ucatec";

type Params = { params: Promise<{ id: string }> };

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function slugify(s: string): string {
  return (s || "monografia")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "monografia";
}

/** Extrae código LaTeX puro del contenido (puede venir con fences ```latex). */
function extractLatex(raw: string): string {
  if (!raw) return "";
  const fenced = raw.match(/```(?:latex|tex)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1] && fenced[1].includes("\\documentclass")) return fenced[1].trim();
  if (raw.includes("\\documentclass")) return raw.trim();
  return raw.trim();
}

/**
 * Reemplaza los placeholders que la IA deja en la carátula con datos
 * reales del proyecto. Se hace en el servidor para que el usuario NO tenga
 * que tocar el .tex.
 *
 * IMPORTANTE: el prompt actual usa formato `<<PLACEHOLDER>>`. Mantenemos
 * compatibilidad hacia atrás con `[Placeholder]` y `{Placeholder}` por si
 * versiones viejas o ediciones del admin usan esos formatos.
 */
function inyectarDatosCaratula(tex: string, datos: Record<string, string>): string {
  // Datos derivados / defaults
  const universidad = datos.universidad || "UNIVERSIDAD MAYOR DE SAN SIMÓN";
  const facultad = datos.facultad || "FACULTAD DE CIENCIAS ECONÓMICAS";
  const departamento = datos.departamento || "ESCUELA UNIVERSITARIA DE POSGRADO";
  const modalidad = datos.modalidad || "DIPLOMADO";
  const ciudad = datos.ciudad || "Cochabamba";
  const pais = datos.pais || "Bolivia";
  const mesAnio = `${datos.mes} ${datos.anio}`;

  const replacements: Array<[RegExp, string]> = [
    // ── Formato actual del prompt: <<PLACEHOLDER>> ─────────────────
    [/<<\s*ESTUDIANTE\s*>>/g, datos.nombre],
    [/<<\s*UNIVERSIDAD\s*>>/g, universidad],
    [/<<\s*FACULTAD\s*>>/g, facultad],
    [/<<\s*DEPARTAMENTO\s*>>/g, departamento],
    [/<<\s*MODALIDAD\s*>>/g, modalidad],
    [/<<\s*PROGRAMA\s*>>/g, datos.programa],
    [/<<\s*VERSION_DIPLOMADO\s*>>/g, datos.version],
    [/<<\s*VERSI[ÓO]N\s*>>/g, datos.version],
    [/<<\s*TITULO_TRABAJO\s*>>/g, datos.titulo],
    [/<<\s*T[ÍI]TULO\s*>>/g, datos.titulo],
    [/<<\s*MES_ANIO\s*>>/g, mesAnio],
    [/<<\s*MES\s*>>/g, datos.mes],
    [/<<\s*A[ÑN]IO\s*>>/g, datos.anio],
    [/<<\s*A[ÑN]O\s*>>/g, datos.anio],
    [/<<\s*TUTOR\s*>>/g, datos.tutor],
    [/<<\s*CIUDAD\s*>>/g, ciudad],
    [/<<\s*PAIS\s*>>/g, pais],

    // ── Compatibilidad hacia atrás: [Placeholder] / {Placeholder} ─
    [/\[Nombre del Estudiante\]/gi, datos.nombre],
    [/\[Nombre Estudiante\]/gi, datos.nombre],
    [/\{Nombre del Estudiante\}/gi, datos.nombre],
    [/\{nombre estudiante\}/gi, datos.nombre],
    [/\[Programa\]/gi, datos.programa],
    [/\{PROGRAMA\}/gi, datos.programa],
    [/\[Versi[óo]n\]/gi, datos.version],
    [/\{VERSI[ÓO]N\}/gi, datos.version],
    [/\[Mes\]/gi, datos.mes],
    [/\{Mes\}/gi, datos.mes],
    [/\[A[ñn]o\]/gi, datos.anio],
    [/\{A[ñn]o\}/gi, datos.anio],
    [/\[Nombre del Tutor.*?\]/gi, datos.tutor],
    [/\[Tutor\]/gi, datos.tutor],
    [/\[T[ÍI]TULO DEL TRABAJO\]/gi, datos.titulo],
    [/\{T[ÍI]TULO DEL TRABAJO\}/gi, datos.titulo],

    // ── Limpieza de placeholders sin reemplazar (sobrevivientes) ──
    //    La IA a veces deja literalmente "Estudiante del Programa",
    //    "Nombre del Estudiante", "Mes Año", etc. cuando no encuentra
    //    los datos. Los reemplazamos por los valores reales.
    [/Estudiante del Programa/g, datos.nombre],
    [/Nombre del Estudiante/g, datos.nombre],
    [/Nombre Estudiante/g, datos.nombre],
  ];

  let resultado = tex;
  for (const [pattern, valor] of replacements) {
    resultado = resultado.replace(pattern, valor);
  }
  return resultado;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const proyectoRaw = await dbGetProyecto(id);
    if (!proyectoRaw) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }
    const proyecto = proyectoRaw as unknown as Record<string, unknown>;
    if (proyecto.usuario_id !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
    }

    // 1) CHUNKING — Compilar cada capítulo por separado en paralelo.
    //
    // ⚠️ HISTORIA: Antes leíamos phase_contents['ph-latex'] que era un .tex
    // monolítico generado por una sola llamada IA con TODOS los caps. Gemini
    // resumía contenido porque era demasiado para una sola call.
    //
    // AHORA: 7 llamadas chicas en paralelo (1 por cap + resumen + biblio).
    // Cada llamada procesa 3-6K palabras, dentro del sweet-spot del modelo.
    // Cero presión para resumir.
    //
    // Después un script (buildPreambleUMSS + buildCaratulaUMSS + etc.) ensambla
    // todo con la estructura UMSS oficial (carátula → resumen → índice → caps
    // → bibliografía). 100% determinista, sin riesgo de errores estructurales.
    await hydrateAIConfigAsync();
    const phaseContents = (proyecto.phase_contents ?? {}) as Record<string, string | null | undefined>;

    const getContent = (faseId: string): string => {
      const final = phaseContents[faseId];
      const borrador = phaseContents[`${faseId}_borrador`];
      const txt = typeof final === "string" && final.trim() ? final
                : typeof borrador === "string" && borrador.trim() ? borrador
                : "";
      return txt.trim();
    };

    const FASES_CAP: Array<{ faseId: string; numero: number | "RESUMEN" | "BIBLIOGRAFIA"; titulo: string }> = [
      { faseId: "ph-resumen",     numero: "RESUMEN",      titulo: "RESUMEN EJECUTIVO" },
      { faseId: "ph-cap1",        numero: 1, titulo: "INTRODUCCIÓN Y ANTECEDENTES DEL TEMA DE INVESTIGACIÓN" },
      { faseId: "ph-cap2",        numero: 2, titulo: "MARCO TEÓRICO Y REFERENCIAL" },
      { faseId: "ph-cap3",        numero: 3, titulo: "DISEÑO METODOLÓGICO DE LA INVESTIGACIÓN" },
      { faseId: "ph-cap4",        numero: 4, titulo: "ANÁLISIS DE RESULTADOS Y PROPUESTA DE SOLUCIÓN" },
      { faseId: "ph-cap5",        numero: 5, titulo: "CONCLUSIONES Y RECOMENDACIONES" },
      { faseId: "ph-referencias", numero: "BIBLIOGRAFIA", titulo: "REFERENCIAS BIBLIOGRÁFICAS" },
    ];

    // Filtrar solo fases que tienen contenido
    const fasesConContenido = FASES_CAP
      .map((f) => ({ ...f, contenidoMd: getContent(f.faseId) }))
      .filter((f) => f.contenidoMd.length > 0);

    if (fasesConContenido.length === 0) {
      return NextResponse.json(
        { error: "Aún no hay capítulos generados. Generá Cap I-V primero." },
        { status: 400 },
      );
    }

    const servicioId = (proyecto.servicio_id as string) || "mono-001";
    console.log(`[paquete-latex] chunking: compilando ${fasesConContenido.length} secciones en paralelo (svc=${servicioId})`);

    // 🛡️ BLINDAJE EN 3 CAPAS contra fallos de IA al compilar capítulos.
    //
    // ANTES: si la IA fallaba al convertir markdown→LaTeX para un capítulo,
    // ese capítulo se reemplazaba con un comentario LaTeX (% ⚠️ ERROR...),
    // que es invisible al compilar. Resultado: el PDF salía sin esos
    // capítulos y el usuario no se enteraba hasta abrirlo en TeXStudio.
    //
    // AHORA, para cada capítulo:
    //   1) Intentamos con IA hasta 3 veces (con backoff 1.5s, 3s).
    //   2) Si los 3 intentos fallan, usamos conversión determinista
    //      mdALatex() (sin IA, código puro TS). Calidad tipográfica un poco
    //      menor pero NUNCA pierde contenido.
    //   3) Si por algún motivo extremo también el fallback falla, marcamos
    //      el capítulo con latex=null y abortamos la descarga con error
    //      claro al usuario — NUNCA entregamos un ZIP con capítulos
    //      invisibles.
    async function compilarConBlindaje(
      f: { faseId: string; numero: number | "RESUMEN" | "BIBLIOGRAFIA"; titulo: string; contenidoMd: string },
    ): Promise<{ faseId: string; numero: number | "RESUMEN" | "BIBLIOGRAFIA"; latex: string | null; error: string | null; usedFallback: boolean }> {
      const userPrompt = buildCompilarCapituloUserPrompt({
        numero: f.numero,
        titulo: f.titulo,
        contenidoMd: f.contenidoMd,
      });

      // Capa 1: IA con 3 intentos
      let lastError: Error | null = null;
      for (let intento = 1; intento <= 3; intento++) {
        try {
          const result = await llamarIA(
            SISTEMA_COMPILAR_CAPITULO,
            userPrompt,
            12000,
            servicioId,
          );
          if (intento > 1) {
            console.log(`[paquete-latex] ${f.faseId} compiló en intento ${intento}/3`);
          }
          return { faseId: f.faseId, numero: f.numero, latex: result.text.trim(), error: null, usedFallback: false };
        } catch (e) {
          lastError = e as Error;
          console.warn(`[paquete-latex] intento ${intento}/3 falló para ${f.faseId}: ${lastError.message}`);
          if (intento < 3) {
            await new Promise((r) => setTimeout(r, 1500 * intento));
          }
        }
      }

      // Capa 2: fallback determinista (markdown → LaTeX sin IA)
      console.warn(`[paquete-latex] ${f.faseId}: IA falló 3 veces, usando fallback determinista mdALatex()`);
      try {
        const latexBody = mdALatex(f.contenidoMd);
        // Para capítulos numerados (1-5), agregar \chapter{} ya que la IA
        // normalmente lo agrega. Para RESUMEN y BIBLIOGRAFIA, el ensamblador
        // agrega los headers separadamente (buildResumenHeader, etc.), así
        // que aquí solo devolvemos el body.
        const conChapter = typeof f.numero === "number"
          ? `\\chapter{${escaparLatexPlain(f.titulo)}}\n\n${latexBody}\n`
          : `${latexBody}\n`;
        return {
          faseId: f.faseId,
          numero: f.numero,
          latex: conChapter,
          error: `IA falló 3 veces (${lastError?.message ?? "sin detalle"}); se usó conversión determinista de respaldo.`,
          usedFallback: true,
        };
      } catch (deterministicErr) {
        // Capa 3: el fallback también falló. Marcamos latex=null para abortar.
        console.error(`[paquete-latex] ${f.faseId}: FALLBACK DETERMINISTA TAMBIÉN FALLÓ: ${(deterministicErr as Error).message}`);
        return {
          faseId: f.faseId,
          numero: f.numero,
          latex: null,
          error: `IA falló 3 veces y el fallback determinista también falló: ${(deterministicErr as Error).message}`,
          usedFallback: false,
        };
      }
    }

    const results = await Promise.all(
      fasesConContenido.map((f) => compilarConBlindaje(f)),
    );

    // 🛡️ Validación final: si ALGÚN capítulo terminó con latex=null
    // (ni IA ni fallback funcionaron), abortar la descarga. NO entregar
    // un ZIP incompleto — preferimos un error claro al usuario que un
    // documento con capítulos faltantes que ni se note hasta compilar.
    const sinContenido = results.filter((r) => r.latex === null);
    if (sinContenido.length > 0) {
      const ids = sinContenido.map((r) => r.faseId).join(", ");
      return NextResponse.json(
        {
          error: `No se pudo generar el LaTeX para: ${ids}. Tanto la IA como el fallback de respaldo fallaron. Probá de nuevo en unos minutos — los proveedores de IA pueden estar saturados temporalmente.`,
        },
        { status: 502 },
      );
    }

    const usadoFallback = results.filter((r) => r.usedFallback);
    if (usadoFallback.length > 0) {
      console.warn(`[paquete-latex] ${usadoFallback.length}/${results.length} secciones usaron fallback determinista (IA falló): ${usadoFallback.map((r) => r.faseId).join(", ")}`);
    }

    // Helper: limpiar bloques code fence ```latex que la IA pudo dejar
    // + quitar cabeceras duplicadas en RESUMEN y BIBLIOGRAFIA (el script
    //   ya las agrega, no queremos doble título en el TOC).
    const limpiarLatexBlock = (latex: string, faseId: string): string => {
      let cleaned = latex.replace(/```(?:latex|tex)?\s*\n([\s\S]*?)\n```/g, "$1");
      cleaned = cleaned.replace(/```\s*\n?/g, "");
      // Quitar \section*{RESUMEN EJECUTIVO} o REFERENCIAS BIBLIOGRÁFICAS
      // que la IA pudo haber agregado a pesar del prompt (defensa profunda).
      if (faseId === "ph-resumen" || faseId === "ph-referencias") {
        cleaned = cleaned.replace(
          /\\section\*\{[^}]*(RESUMEN EJECUTIVO|REFERENCIAS BIBLIOGR[AÁ]FICAS)[^}]*\}\s*/gi,
          "",
        );
        cleaned = cleaned.replace(
          /\\addcontentsline\{toc\}\{section\}\{[^}]*(RESUMEN EJECUTIVO|REFERENCIAS BIBLIOGR[AÁ]FICAS)[^}]*\}\s*/gi,
          "",
        );
      }

      // 🛡️ ANTI-AUTOR-DESCONOCIDO (solo en bibliografía consolidada):
      // Si pese al prompt la IA dejó una entrada con autor inválido en la
      // lista final, la eliminamos. Cubrimos: "Autor desconocido", "Anónimo",
      // "Sin autor", "N.D.", "(s. a.)" como primer token de la referencia.
      // Aplicamos solo en ph-referencias para no tocar texto del cuerpo
      // (donde "Autor" puede aparecer legítimamente en otro contexto).
      if (faseId === "ph-referencias") {
        // Cada referencia APA suele empezar al inicio de una línea.
        // Detectar líneas que empiezan con un patrón "fantasma" y removerlas.
        const lineasInvalidas = [
          /^\s*Autor\s+desconocido\b[^\n]*\n?/gim,
          /^\s*An[oó]nimo\b[^\n]*\n?/gim,
          /^\s*Sin\s+autor\b[^\n]*\n?/gim,
          /^\s*N\.?\s*D\.?\s*\([^)]*\)[^\n]*\n?/gim,
          /^\s*\(\s*s\.?\s*a\.?\s*\)\b[^\n]*\n?/gim,
        ];
        for (const re of lineasInvalidas) {
          cleaned = cleaned.replace(re, "");
        }
      }
      // Sanear bibliografía: escapar `&` sueltos dentro de hangparas/thebibliography
      cleaned = cleaned.replace(
        /(\\begin\{(?:hangparas|thebibliography)\}[\s\S]*?\\end\{(?:hangparas|thebibliography)\})/g,
        (block) => block.replace(/(?<!\\)&/g, "\\&"),
      );
      // Limpiar numeración duplicada en captions:
      //   \caption{Cuadro 4.2. Texto...}  →  \caption{Texto...}
      //   \caption{Tabla 1.1: Texto...}   →  \caption{Texto...}
      //   \caption{Figura 3.2 - Texto...} →  \caption{Texto...}
      cleaned = cleaned.replace(
        /\\caption\{\s*(?:Cuadro|Tabla|Figura|Tab\.|Fig\.)\s*\d+(?:[.\-:]\d+)?\s*[.\-:]\s*/gi,
        "\\caption{",
      );
      // Limpiar numeración duplicada en secciones/subsecciones:
      //   \section{3.2. Tipo de investigación}     → \section{Tipo de investigación}
      //   \subsection{1.4 Justificación}           → \subsection{Justificación}
      //   \subsubsection{2.3.1 Concepto}           → \subsubsection{Concepto}
      // LaTeX numera automáticamente; los números manuales son duplicados.
      cleaned = cleaned.replace(
        /(\\(?:sub){0,3}section\*?\{)\s*\d+(?:\.\d+){0,3}\.?\s+/g,
        "$1",
      );
      // Limpiar también \chapter{Capítulo 1. Texto} → \chapter{Texto}
      cleaned = cleaned.replace(
        /(\\chapter\*?\{)\s*(?:Cap[íi]tulo|CAP[ÍI]TULO)\s+(?:[IVX]+|\d+)\s*[.:\-]?\s*/gi,
        "$1",
      );

      // 🛡️ DEFENSA EN PROFUNDIDAD — sustituciones post-IA:
      //
      // 1) "Tabla X.Y" → "Cuadro X.Y" en referencias inline del cuerpo.
      //    El preámbulo ya renombra \tablename a "Cuadro" para captions
      //    automáticos; pero la IA a veces escribe "como muestra la Tabla 2.1"
      //    en el texto del párrafo. UMSS exige "Cuadro" en todo el documento.
      //    Solo cambiamos cuando viene seguido de número (Tabla 2.1, Tabla 4.3),
      //    NO "tabla periódica" ni "tabla de contenido" sueltos.
      cleaned = cleaned.replace(
        /\b(la|el|La|El|al|Al|del|Del)\s+Tabla\s+(\d+(?:\.\d+)?)/g,
        "$1 Cuadro $2",
      );
      cleaned = cleaned.replace(
        /(?<=^|[\s(,;:.])Tabla\s+(\d+\.\d+)/g,
        "Cuadro $1",
      );

      // 2) Saneo de caracteres ordinales/grados que confunden a pdflatex.
      //    Cuando la IA pega "Nº" (U+00BA, masculine ordinal), babel a veces
      //    lo renderiza como "N^" (acento circunflejo) si la fuente no tiene
      //    el glyph. Mismo con "ª" y "°". Reemplazamos por comandos LaTeX
      //    explícitos que renderizan siempre bien.
      cleaned = cleaned.replace(/º/g, "\\textordmasculine{}");
      cleaned = cleaned.replace(/ª/g, "\\textordfeminine{}");
      cleaned = cleaned.replace(/°/g, "\\textdegree{}");

      // 3) Salvataje específico: si la IA ya escribió "N^" (artefacto de
      //    una compilación previa o un copy-paste mal), normalizar a "N°".
      //    Lo hacemos DESPUÉS del paso 2 para no duplicar.
      cleaned = cleaned.replace(
        /\bN\^\s*(\d)/g,
        "N\\textordmasculine{} $1",
      );

      return cleaned;
    };
    results.forEach((r) => { r.latex = limpiarLatexBlock(r.latex, r.faseId); });

    // 2) Datos para inyectar en la carátula
    //
    // Si el estudiante editó mes/año en el modal "Configurar Carátula" del
    // workspace, esos valores quedaron persistidos en
    // academic_context.contexto_inicial.{mes_presentacion, anio_presentacion}.
    // Los usamos preferentemente; si no existen, fallback a la fecha actual.
    const ahora = new Date();
    const academicContext = (proyecto.academic_context ?? {}) as Record<string, unknown>;
    const ctxInicial = (academicContext.contexto_inicial ?? {}) as Record<string, unknown>;
    const mesElegido = typeof ctxInicial.mes_presentacion === "string" && ctxInicial.mes_presentacion.trim()
      ? ctxInicial.mes_presentacion
      : MESES[ahora.getMonth()];
    const anioElegido = typeof ctxInicial.anio_presentacion === "string" && ctxInicial.anio_presentacion.trim()
      ? ctxInicial.anio_presentacion
      : String(ahora.getFullYear());
    const nombreEstudiante = typeof ctxInicial.nombre === "string" && ctxInicial.nombre.trim()
      ? ctxInicial.nombre
      : (user.name || "Estudiante");
    // Resolver universidad ANTES de construir `datos`, para inyectar nombre,
    // facultad y departamento en los placeholders <<UNIVERSIDAD>>, etc.
    // Orden de prioridad:
    //   1) Si el estudiante editó el campo en el modal "Configurar Carátula"
    //      (persistido en contexto_inicial), usar ese valor.
    //   2) Si la universidad del proyecto tiene datos en data.ts, usar esos.
    //   3) Default UMSS hardcoded.
    const universidadId = (proyecto.universidad_id as string) || "umss-001";
    const universidad = DEFAULT_UNIVERSITIES.find(u => u.id === universidadId) ?? DEFAULT_UNIVERSITIES[0];
    const uniRecord = (universidad as unknown as Record<string, unknown>) ?? {};
    const pick = (campoCtx: string, campoUni: string, fallback: string, mayusculas = false): string => {
      const v = typeof ctxInicial[campoCtx] === "string" && (ctxInicial[campoCtx] as string).trim()
        ? (ctxInicial[campoCtx] as string)
        : typeof uniRecord[campoUni] === "string" && (uniRecord[campoUni] as string).trim()
          ? (uniRecord[campoUni] as string)
          : fallback;
      return mayusculas ? v.toUpperCase() : v;
    };
    const datos: Record<string, string> = {
      nombre: nombreEstudiante,
      programa: String(ctxInicial.programa ?? "Diplomado"),
      version: String(ctxInicial.version ?? ctxInicial.numero_version ?? "1°"),
      mes: mesElegido,
      anio: anioElegido,
      tutor: String(ctxInicial.tutor ?? ""),
      titulo: String(proyecto.tema_aprobado ?? proyecto.titulo_provisional ?? "Monografía"),
      universidad: pick("universidad", "name", "UNIVERSIDAD MAYOR DE SAN SIMÓN", true),
      facultad: pick("facultad", "facultad", "FACULTAD DE CIENCIAS ECONÓMICAS", true),
      departamento: pick("departamento", "departamento", "ESCUELA UNIVERSITARIA DE POSGRADO", true),
      modalidad: pick("modalidad", "modalidad", "DIPLOMADO COMO MODALIDAD DE TITULACIÓN", true),
      ciudad: pick("ciudad", "ciudad", "Cochabamba"),
      pais: pick("pais", "pais", "Bolivia"),
    };

    // ENSAMBLAR el .tex final de forma determinista (sin IA).
    //
    // Switch por universidad: cada una usa SU PROPIO preámbulo, carátula
    // y builders, sin solaparse con las demás. UMSS queda como rama
    // default — proyectos sin universidad mapeada compilan igual que antes.
    //
    //   - UCB      → preamble-ucb.ts      (Tribunal + Abstract + Separador Anexos)
    //   - UNIFRANZ → preamble-unifranz.ts (Verdana 11, márgenes 3.5/2.5)
    //   - UCATEC   → preamble-ucatec.ts   (Times NR 12 / 1.5 / márgenes 3+2.5, caps romanos)
    //   - UMSS     → preamble-umss.ts     (default, comportamiento original)
    const esUCB = proyecto.universidad_id === "ucb-001";
    const esUnifranz = proyecto.universidad_id === "unifranz-cba-001";
    const esUCATEC = proyecto.universidad_id === "ucatec-001";

    // Ubicar cada sección por su faseId (igual para todas las universidades)
    const resumenLatex = results.find((r) => r.faseId === "ph-resumen")?.latex ?? "";
    const cap1Latex = results.find((r) => r.faseId === "ph-cap1")?.latex ?? "";
    const cap2Latex = results.find((r) => r.faseId === "ph-cap2")?.latex ?? "";
    const cap3Latex = results.find((r) => r.faseId === "ph-cap3")?.latex ?? "";
    const cap4Latex = results.find((r) => r.faseId === "ph-cap4")?.latex ?? "";
    const cap5Latex = results.find((r) => r.faseId === "ph-cap5")?.latex ?? "";
    const biblioLatex = results.find((r) => r.faseId === "ph-referencias")?.latex ?? "";

    const partes: string[] = [];

    if (esUCB) {
      // ===== ENSAMBLAJE UCB =====
      // Orden UCB (Guía 2020 págs. 4-16):
      //   1. Preámbulo
      //   2. Carátula UCB (escudo + Departamento + Carrera + Título)
      //   3. Tribunal Examinador (firma de los 4 miembros)
      //   4. Resumen (≤200 palabras) en numeración romana
      //   5. Abstract (traducción inglesa del resumen)
      //   6. Índice general
      //   7. Capítulos 1-5
      //   8. Bibliografía
      //   9. Separador de anexos
      //  10. \end{document}
      partes.push(buildPreambleUCB());
      partes.push(buildCaratulaUCB({
        nombre: datos.nombre,
        titulo: datos.titulo,
        departamento: datos.departamento,
        carrera: String(ctxInicial.carrera ?? datos.programa ?? ""),
        tipo_trabajo: String(ctxInicial.tipo_trabajo ?? "Monografía"),
        grado_academico: String(ctxInicial.grado_academico ?? "Licenciatura"),
        universidad: datos.universidad,
        ciudad: datos.ciudad,
        pais: datos.pais,
        mes: datos.mes,
        anio: datos.anio,
        tutor: datos.tutor || undefined,
      }));
      partes.push(buildTribunalUCB({
        profesor_guia: String(ctxInicial.profesor_guia ?? datos.tutor ?? ""),
        profesor_relator: String(ctxInicial.profesor_relator ?? ""),
        director_carrera: String(ctxInicial.director_carrera ?? ""),
        rector_regional: String(ctxInicial.rector_regional ?? ""),
      }));
      if (resumenLatex) {
        partes.push(buildResumenHeaderUCB());
        partes.push(resumenLatex);
        // UCB exige Abstract en inglés. Si el resumenLatex ya lo trae,
        // la IA habrá emitido un \section*{ABSTRACT}; si no, queda como
        // marcador del estudiante (no inventamos traducción).
        partes.push(buildAbstractHeaderUCB());
        partes.push("\\textit{[Pendiente: traducción del resumen al inglés + 3 a 8 palabras clave (keywords) — la IA o el estudiante deben completar esta sección.]}");
      }
      partes.push(buildIndiceUCB());
      if (cap1Latex) partes.push(cap1Latex);
      if (cap2Latex) partes.push(cap2Latex);
      if (cap3Latex) partes.push(cap3Latex);
      if (cap4Latex) partes.push(cap4Latex);
      if (cap5Latex) partes.push(cap5Latex);
      if (biblioLatex) {
        partes.push(buildBibliografiaHeaderUCB());
        partes.push(biblioLatex);
      }
      partes.push(buildSeparadorAnexosUCB());
      partes.push(buildFinDocumentoUCB());
    } else if (esUnifranz) {
      // ===== ENSAMBLAJE UNIFRANZ (Cochabamba, Guía 2017) =====
      // Estructura UNIFRANZ:
      //   1. Preámbulo (Verdana 11, márgenes 3.5/2.5, numeración inf. derecha)
      //   2. Carátula UNIFRANZ (POSTULANTE + TUTOR + Ciudad-País + Año)
      //   3. Resumen (250 palabras, preliminares en romanos i, ii, iii)
      //   4. Índice (\tableofcontents → ÍNDICE)
      //   5. Capítulos 1-5
      //   6. Bibliografía (APA, apellidos en minúscula)
      //   7. \end{document}
      partes.push(buildPreambleUNIFRANZ());
      partes.push(buildCaratulaUNIFRANZ({
        nombre: datos.nombre,
        titulo: datos.titulo,
        modalidad: datos.modalidad,
        carrera: String(ctxInicial.carrera ?? ctxInicial.programa ?? datos.programa ?? "CARRERA"),
        facultad: datos.facultad,
        universidad: datos.universidad,
        ciudad: datos.ciudad,
        pais: datos.pais,
        anio: datos.anio,
        tutor: datos.tutor || undefined,
      }));
      if (resumenLatex) {
        partes.push(buildResumenHeaderUNIFRANZ());
        partes.push(resumenLatex);
      }
      partes.push(buildIndiceUNIFRANZ());
      if (cap1Latex) partes.push(cap1Latex);
      if (cap2Latex) partes.push(cap2Latex);
      if (cap3Latex) partes.push(cap3Latex);
      if (cap4Latex) partes.push(cap4Latex);
      if (cap5Latex) partes.push(cap5Latex);
      if (biblioLatex) {
        partes.push(buildBibliografiaHeaderUNIFRANZ());
        partes.push(biblioLatex);
      }
      partes.push(buildFinDocumentoUNIFRANZ());
    } else if (esUCATEC) {
      // ===== ENSAMBLAJE UCATEC (Cochabamba) =====
      // Estructura UCATEC para Proyecto de Grado (Lic / Téc Sup):
      //   1. Preámbulo (Times NR 12, interlineado 1.5, márgenes 3+2.5cm,
      //      numeración inf. derecha, capítulos en romanos I-IV)
      //   2. Carátula UCATEC (logo + facultad + carrera + modalidad +
      //      título + postulante + tutor + ciudad-país + año)
      //   3. Resumen Ejecutivo (preliminares en romanos)
      //   4. Índice general
      //   5. Capítulos I-IV (Marco Referencial / Teórico / Situacional /
      //      Propositivo) + Cap. V si existe (conclusiones formales)
      //   6. Bibliografía (APA 7)
      //   7. \end{document}
      partes.push(buildPreambleUCATEC());
      partes.push(buildCaratulaUCATEC({
        nombre: datos.nombre,
        titulo: datos.titulo,
        carrera: String(ctxInicial.carrera ?? datos.programa ?? "CARRERA"),
        facultad: String(ctxInicial.facultad ?? datos.facultad ?? "Facultad de Ciencias Empresariales"),
        modalidad: datos.modalidad || "PROYECTO DE GRADO",
        grado: String(ctxInicial.programa ?? ctxInicial.grado_academico ?? "LICENCIATURA"),
        universidad: datos.universidad,
        ciudad: datos.ciudad,
        pais: datos.pais,
        mes: datos.mes,
        anio: datos.anio,
        tutor: datos.tutor || undefined,
      }));
      if (resumenLatex) {
        partes.push(buildResumenHeaderUCATEC());
        partes.push(resumenLatex);
      }
      partes.push(buildIndiceUCATEC());
      if (cap1Latex) partes.push(cap1Latex);
      if (cap2Latex) partes.push(cap2Latex);
      if (cap3Latex) partes.push(cap3Latex);
      if (cap4Latex) partes.push(cap4Latex);
      if (cap5Latex) partes.push(cap5Latex);
      if (biblioLatex) {
        partes.push(buildBibliografiaHeaderUCATEC());
        partes.push(biblioLatex);
      }
      partes.push(buildFinDocumentoUCATEC());
    } else {
      // ===== ENSAMBLAJE UMSS (default — comportamiento original intacto) =====
      // Estructura UMSS oficial garantizada en orden correcto:
      //   1. Preámbulo (paquetes + config tipográfica)
      //   2. \begin{document}
      //   3. Carátula UMSS (logo izq + datos derecha)
      //   4. Resumen Ejecutivo (con \section*)
      //   5. Índice general (\tableofcontents)
      //   6. Capítulos 1-5 (\chapter)
      //   7. Bibliografía
      //   8. \end{document}
      partes.push(buildPreambleUMSS());
      partes.push(buildCaratulaUMSS({
        nombre: datos.nombre,
        titulo: datos.titulo,
        programa: datos.programa,
        version: datos.version,
        modalidad: datos.modalidad,
        universidad: datos.universidad,
        facultad: datos.facultad,
        departamento: datos.departamento,
        ciudad: datos.ciudad,
        pais: datos.pais,
        mes: datos.mes,
        anio: datos.anio,
        tutor: datos.tutor || undefined,
      }));
      if (resumenLatex) {
        partes.push(buildResumenHeader());
        partes.push(resumenLatex);
      }
      partes.push(buildIndice());
      if (cap1Latex) partes.push(cap1Latex);
      if (cap2Latex) partes.push(cap2Latex);
      if (cap3Latex) partes.push(cap3Latex);
      if (cap4Latex) partes.push(cap4Latex);
      if (cap5Latex) partes.push(cap5Latex);
      if (biblioLatex) {
        partes.push(buildBibliografiaHeader());
        partes.push(biblioLatex);
      }
      partes.push(buildFinDocumento());
    }

    const texConDatos = partes.join("\n\n");

    // 3) Cargar el logo de la universidad para incluirlo en el ZIP.
    //
    // Cada universidad usa SU PROPIO nombre de archivo dentro del ZIP, y SU
    // PROPIO preámbulo apunta a ese nombre. UMSS → `logos/umss.png`,
    // UNIFRANZ → `logos/unifranz.png`. No se solapan.
    let logoBuffer: Buffer | null = null;
    // ⚠️ IMPORTANTE: el preámbulo LaTeX de cada universidad referencia el
    //    logo en una ruta fija dentro del ZIP (logos/<uni>.<ext>). Cada
    //    universidad usa SU PROPIO nombre — UMSS → `logos/umss.png`,
    //    UCB → `logos/ucb.png`, UNIFRANZ → `logos/unifranz.png` — para no
    //    pisarse. Si cambiás esto, actualizá también `\IfFileExists{...}`
    //    en src/lib/latex/preamble-{umss,ucb,unifranz}.ts.
    const logoBaseName = esUCB ? "ucb" : esUnifranz ? "unifranz" : "umss";
    let logoFilename = `logos/${logoBaseName}.png`;
    if (universidad?.logo_url) {
      try {
        const logoPath = path.join(process.cwd(), "public", universidad.logo_url.replace(/^\//, ""));
        logoBuffer = await fs.readFile(logoPath);
        const ext = path.extname(universidad.logo_url).toLowerCase() || ".png";
        // Mantener la extensión real del archivo pero conservar la ruta logos/<uni>.<ext>
        logoFilename = `logos/${logoBaseName}${ext}`;
      } catch (e) {
        console.warn("[paquete-latex] No se pudo cargar el logo:", (e as Error).message);
      }
    }

    // 4) Saneo defensivo: eliminar \includegraphics que apuntan a archivos
    //    que NO van en el ZIP. Esto evita que Overleaf falle con "File not found".
    //    Por ahora el único archivo disponible es el logo institucional.
    //    TODO (opción B, próximo sprint): aceptar imágenes del estudiante en
    //    upload-document y meterlas en una carpeta `figuras/` del ZIP.
    const availableFiles = logoBuffer ? [logoFilename] : [];
    const { tex: texLimpio, orphans } = sanitizeOrphanIncludes(texConDatos, availableFiles);
    if (orphans.length > 0) {
      console.warn(`[paquete-latex] Se eliminaron ${orphans.length} \\includegraphics huérfano(s): ${orphans.join(", ")}`);
    }

    // 5) Armar el ZIP
    //
    // ⚠️ IMPORTANTE: Overleaf busca `main.tex` por default al hacer Upload
    //    Project. Si el archivo tiene otro nombre, da el error
    //    "Emergency stop / file error in nonstop mode" porque pdftex no
    //    encuentra el archivo. Por eso guardamos como `main.tex`.
    //    El nombre descriptivo del proyecto va solo en el README.
    const zip = new JSZip();
    const baseName = slugify(datos.titulo);
    zip.file("main.tex", texLimpio);
    if (logoBuffer) {
      zip.file(logoFilename, logoBuffer);
    }

    const readmeLines: string[] = [
      `Paquete generado por Laboratorio Académico PRO`,
      `Universidad: ${universidad?.name ?? "N/A"}`,
      `Proyecto: ${datos.titulo}`,
      `Estudiante: ${datos.nombre}`,
      `Fecha: ${datos.mes} ${datos.anio}`,
      ``,
      `INSTRUCCIONES:`,
      `1. Abre Overleaf (overleaf.com) y crea un proyecto nuevo "Upload Project".`,
      `2. Sube TODO el contenido de este ZIP (descomprimido) a tu proyecto Overleaf.`,
      `3. Asegúrate de que el motor sea pdfLaTeX (por defecto ya lo es).`,
      `4. Pulsa "Recompile". El PDF se genera automáticamente con el logo,`,
      `   tu nombre, fecha y programa ya cargados.`,
      ``,
      `Si necesitas ajustar algún dato (nombre, mes, etc.), abre el archivo`,
      `main.tex y busca el texto a cambiar — está al inicio del documento`,
      `en el bloque \\begin{titlepage}.`,
    ];

    if (orphans.length > 0) {
      readmeLines.push(
        ``,
        `─────────────────────────────────────────────────`,
        `AVISO: Se omitieron ${orphans.length} figura(s) sin archivo asociado:`,
        ...orphans.map(n => `   • ${n}`),
        ``,
        `Estas figuras estaban referenciadas en el documento pero no se`,
        `subió ningún archivo de imagen correspondiente. Para incluirlas:`,
        `1. Consigue las imágenes (formatos: .png, .jpg, .pdf).`,
        `2. Subilas a tu proyecto Overleaf con esos mismos nombres.`,
        `3. En el .tex, descomentá las líneas que empiezan con`,
        `   "% [auto] Figura omitida:" y restaurá el bloque \\begin{figure}.`,
      );
    }

    zip.file("README.txt", readmeLines.join("\n"));

    // 6) Generar el ZIP y devolverlo
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

    const headers: Record<string, string> = {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${baseName}-overleaf.zip"`,
      "Content-Length": String(zipBuffer.length),
    };
    if (orphans.length > 0) {
      headers["X-Latex-Orphan-Count"] = String(orphans.length);
      // Header expone nombres URL-encoded (separados por coma) para que el
      // cliente pueda mostrar un aviso amigable. Se truncan si son muchos.
      const list = orphans.slice(0, 10).map(encodeURIComponent).join(",");
      headers["X-Latex-Orphan-Names"] = list;
      // Header CORS para que el navegador exponga estos headers a fetch().
      headers["Access-Control-Expose-Headers"] = "X-Latex-Orphan-Count,X-Latex-Orphan-Names";
    }

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      status: 200,
      headers,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[paquete-latex]", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
