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

    // 1) Extraer el LaTeX del proyecto
    const phaseContents = (proyecto.phase_contents ?? {}) as Record<string, string | null | undefined>;
    const rawLatex = phaseContents["ph-latex"] || phaseContents["ph-latex_borrador"] || "";
    if (!rawLatex.trim()) {
      return NextResponse.json(
        { error: "Todavía no hay LaTeX generado. Genera la fase 'Compilar LaTeX' primero." },
        { status: 400 }
      );
    }
    const tex = extractLatex(rawLatex);

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
    const universidadId = (proyecto.universidad_id as string) || "umss-001";
    const universidad = DEFAULT_UNIVERSITIES.find(u => u.id === universidadId) ?? DEFAULT_UNIVERSITIES[0];
    const uniRecord = (universidad as unknown as Record<string, unknown>) ?? {};
    const datos: Record<string, string> = {
      nombre: nombreEstudiante,
      programa: String(ctxInicial.programa ?? "Diplomado"),
      version: String(ctxInicial.version ?? ctxInicial.numero_version ?? "1° Versión"),
      mes: mesElegido,
      anio: anioElegido,
      tutor: String(ctxInicial.tutor ?? ""),
      titulo: String(proyecto.tema_aprobado ?? proyecto.titulo_provisional ?? "Monografía"),
      universidad: String(uniRecord.name ?? "UNIVERSIDAD MAYOR DE SAN SIMÓN").toUpperCase(),
      facultad: String(uniRecord.facultad ?? "FACULTAD DE CIENCIAS ECONÓMICAS").toUpperCase(),
      departamento: String(uniRecord.departamento ?? "ESCUELA UNIVERSITARIA DE POSGRADO").toUpperCase(),
      modalidad: String(ctxInicial.modalidad ?? "DIPLOMADO").toUpperCase(),
      ciudad: String(ctxInicial.ciudad ?? uniRecord.ciudad ?? "Cochabamba"),
      pais: String(ctxInicial.pais ?? uniRecord.pais ?? "Bolivia"),
    };
    const texConDatos = inyectarDatosCaratula(tex, datos);

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
    const zip = new JSZip();
    const baseName = slugify(datos.titulo);
    zip.file(`${baseName}.tex`, texLimpio);
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
      `${baseName}.tex y busca el texto a cambiar — está al inicio del documento`,
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
