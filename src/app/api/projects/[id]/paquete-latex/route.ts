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
 * Reemplaza los placeholders típicos que la IA deja en la carátula con datos
 * reales del proyecto. Se hace en el servidor para que el usuario NO tenga
 * que tocar el .tex.
 */
function inyectarDatosCaratula(tex: string, datos: Record<string, string>): string {
  const replacements: Array<[RegExp, string]> = [
    // Nombre del estudiante (varios formatos que la IA puede generar)
    [/\[Nombre del Estudiante\]/gi, datos.nombre],
    [/\[Nombre Estudiante\]/gi, datos.nombre],
    [/\{Nombre del Estudiante\}/gi, datos.nombre],
    [/\{nombre estudiante\}/gi, datos.nombre],
    // Programa
    [/\[Programa\]/gi, datos.programa],
    [/\{PROGRAMA\}/gi, datos.programa],
    // Versión
    [/\[Versión\]/gi, datos.version],
    [/\[Version\]/gi, datos.version],
    [/\{VERSIÓN\}/gi, datos.version],
    [/\{VERSION\}/gi, datos.version],
    // Mes y año
    [/\[Mes\]/gi, datos.mes],
    [/\{Mes\}/gi, datos.mes],
    [/\[Año\]/gi, datos.anio],
    [/\[Anio\]/gi, datos.anio],
    [/\{Año\}/gi, datos.anio],
    // Tutor
    [/\[Nombre del Tutor.*?\]/gi, datos.tutor],
    [/\[Tutor\]/gi, datos.tutor],
    // Título de trabajo (si quedó como placeholder)
    [/\[TÍTULO DEL TRABAJO\]/gi, datos.titulo],
    [/\{TÍTULO DEL TRABAJO\}/gi, datos.titulo],
    [/\{TITULO DEL TRABAJO\}/gi, datos.titulo],
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
        { error: "Todavía no hay LaTeX generado. Generá la fase 'Compilar LaTeX' primero." },
        { status: 400 }
      );
    }
    const tex = extractLatex(rawLatex);

    // 2) Datos para inyectar en la carátula
    const ahora = new Date();
    const academicContext = (proyecto.academic_context ?? {}) as Record<string, unknown>;
    const ctxInicial = (academicContext.contexto_inicial ?? {}) as Record<string, unknown>;
    const datos: Record<string, string> = {
      nombre: user.name || "Estudiante",
      programa: String(ctxInicial.programa ?? "Diplomado"),
      version: String(ctxInicial.version ?? ctxInicial.numero_version ?? "1° Versión"),
      mes: MESES[ahora.getMonth()],
      anio: String(ahora.getFullYear()),
      tutor: String(ctxInicial.tutor ?? ""),
      titulo: String(proyecto.tema_aprobado ?? proyecto.titulo_provisional ?? "Monografía"),
    };
    const texConDatos = inyectarDatosCaratula(tex, datos);

    // 3) Cargar el logo de la universidad
    const universidadId = (proyecto.universidad_id as string) || "umss-001";
    const universidad = DEFAULT_UNIVERSITIES.find(u => u.id === universidadId) ?? DEFAULT_UNIVERSITIES[0];
    let logoBuffer: Buffer | null = null;
    let logoFilename = "logo-universidad.png";
    if (universidad?.logo_url) {
      try {
        // El logo_url es una ruta relativa como "/logos/umss.png" → leer de public/
        const logoPath = path.join(process.cwd(), "public", universidad.logo_url.replace(/^\//, ""));
        logoBuffer = await fs.readFile(logoPath);
        const ext = path.extname(universidad.logo_url).toLowerCase() || ".png";
        logoFilename = `logo-universidad${ext}`;
      } catch (e) {
        console.warn("[paquete-latex] No se pudo cargar el logo:", (e as Error).message);
        // Continuamos sin logo — el .tex tiene un comentario explicando
      }
    }

    // 4) Armar el ZIP
    const zip = new JSZip();
    const baseName = slugify(datos.titulo);
    zip.file(`${baseName}.tex`, texConDatos);
    if (logoBuffer) {
      zip.file(logoFilename, logoBuffer);
    }
    zip.file("README.txt", [
      `Paquete generado por Laboratorio Académico PRO`,
      `Universidad: ${universidad?.name ?? "N/A"}`,
      `Proyecto: ${datos.titulo}`,
      `Estudiante: ${datos.nombre}`,
      `Fecha: ${datos.mes} ${datos.anio}`,
      ``,
      `INSTRUCCIONES:`,
      `1. Abrí Overleaf (overleaf.com) y creá un proyecto nuevo "Upload Project".`,
      `2. Subí TODO el contenido de este ZIP (descomprimido) a tu proyecto Overleaf.`,
      `3. Asegurate de que el motor sea pdfLaTeX (por defecto ya lo es).`,
      `4. Apretá "Recompile". El PDF se genera automáticamente con el logo,`,
      `   tu nombre, fecha y programa ya cargados.`,
      ``,
      `Si necesitás ajustar algún dato (nombre, mes, etc.), abrí el archivo`,
      `${baseName}.tex y buscá el texto a cambiar — está al inicio del documento`,
      `en el bloque \\begin{titlepage}.`,
    ].join("\n"));

    // 5) Generar el ZIP y devolverlo
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${baseName}-overleaf.zip"`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[paquete-latex]", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
