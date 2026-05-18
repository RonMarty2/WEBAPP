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

    // Compilar TODAS las secciones en paralelo. Cada call es chica (4-8K palabras),
    // dentro del sweet-spot del modelo. Si una falla, captura el error pero
    // las otras siguen — al final reportamos cuáles fallaron.
    const results = await Promise.all(
      fasesConContenido.map(async (f) => {
        try {
          const userPrompt = buildCompilarCapituloUserPrompt({
            numero: f.numero,
            titulo: f.titulo,
            contenidoMd: f.contenidoMd,
          });
          const result = await llamarIA(
            SISTEMA_COMPILAR_CAPITULO,
            userPrompt,
            12000, // suficiente para un cap de 4-6K palabras
            servicioId,
          );
          return { faseId: f.faseId, numero: f.numero, latex: result.text.trim(), error: null };
        } catch (e) {
          console.error(`[paquete-latex] error compilando ${f.faseId}:`, (e as Error).message);
          return {
            faseId: f.faseId,
            numero: f.numero,
            latex: `% ⚠️ ERROR al compilar este capítulo: ${(e as Error).message}\n% El contenido original está en markdown, no se pudo convertir.\n`,
            error: (e as Error).message,
          };
        }
      }),
    );

    // Si ALL fallaron, reportar error
    const failed = results.filter((r) => r.error !== null);
    if (failed.length === results.length) {
      return NextResponse.json(
        { error: "No se pudo compilar ninguna sección. Verificá que la IA esté configurada y disponible." },
        { status: 502 },
      );
    }
    if (failed.length > 0) {
      console.warn(`[paquete-latex] ${failed.length}/${results.length} secciones fallaron.`);
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
      // Sanear bibliografía: escapar `&` sueltos dentro de hangparas/thebibliography
      cleaned = cleaned.replace(
        /(\\begin\{(?:hangparas|thebibliography)\}[\s\S]*?\\end\{(?:hangparas|thebibliography)\})/g,
        (block) => block.replace(/(?<!\\)&/g, "\\&"),
      );
      // Limpiar numeración duplicada en captions:
      //   \caption{Cuadro 4.2. Texto...}  →  \caption{Texto...}
      //   \caption{Tabla 1.1: Texto...}   →  \caption{Texto...}
      //   \caption{Figura 3.2 - Texto...} →  \caption{Texto...}
      // LaTeX agrega automáticamente "Cuadro X.Y" via \counterwithin{table}{chapter}.
      cleaned = cleaned.replace(
        /\\caption\{\s*(?:Cuadro|Tabla|Figura|Tab\.|Fig\.)\s*\d+(?:[.\-:]\d+)?\s*[.\-:]\s*/gi,
        "\\caption{",
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
    // Estructura UMSS oficial garantizada en orden correcto:
    //   1. Preámbulo (paquetes + config tipográfica)
    //   2. \begin{document}
    //   3. Carátula UMSS (logo izq + datos derecha)
    //   4. Resumen Ejecutivo (con \section*)
    //   5. Índice general (\tableofcontents)
    //   6. Capítulos 1-5 (\chapter)
    //   7. Bibliografía
    //   8. \end{document}
    const preamble = buildPreambleUMSS();
    const caratula = buildCaratulaUMSS({
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
    });

    // Ubicar cada sección por su faseId
    const resumenLatex = results.find((r) => r.faseId === "ph-resumen")?.latex ?? "";
    const cap1Latex = results.find((r) => r.faseId === "ph-cap1")?.latex ?? "";
    const cap2Latex = results.find((r) => r.faseId === "ph-cap2")?.latex ?? "";
    const cap3Latex = results.find((r) => r.faseId === "ph-cap3")?.latex ?? "";
    const cap4Latex = results.find((r) => r.faseId === "ph-cap4")?.latex ?? "";
    const cap5Latex = results.find((r) => r.faseId === "ph-cap5")?.latex ?? "";
    const biblioLatex = results.find((r) => r.faseId === "ph-referencias")?.latex ?? "";

    const partes: string[] = [
      preamble,
      caratula,
    ];
    if (resumenLatex) {
      // La IA debería haber generado \section*{RESUMEN EJECUTIVO}, pero por seguridad
      // agregamos también la cabecera + numeración roman.
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

    const texConDatos = partes.join("\n\n");

    // 3) Cargar el logo de la universidad para incluirlo en el ZIP.
    let logoBuffer: Buffer | null = null;
    // ⚠️ IMPORTANTE: el prompt LaTeX referencia el logo como `logos/umss.png`
    //    (carpeta `logos/` dentro del ZIP). Si cambiás este path, también hay
    //    que cambiar `\IfFileExists{logos/umss.png}` en compilar-latex.ts.
    let logoFilename = "logos/umss.png";
    if (universidad?.logo_url) {
      try {
        // El logo_url es una ruta relativa como "/logos/umss.png" → leer de public/
        const logoPath = path.join(process.cwd(), "public", universidad.logo_url.replace(/^\//, ""));
        logoBuffer = await fs.readFile(logoPath);
        const ext = path.extname(universidad.logo_url).toLowerCase() || ".png";
        // Mantener la extensión real del archivo pero conservar la ruta logos/umss.<ext>
        logoFilename = `logos/umss${ext}`;
      } catch (e) {
        console.warn("[paquete-latex] No se pudo cargar el logo:", (e as Error).message);
        // Continuamos sin logo — el .tex tiene un comentario explicando
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
