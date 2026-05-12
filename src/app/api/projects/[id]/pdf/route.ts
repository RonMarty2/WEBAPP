/**
 * GET /api/projects/[id]/pdf
 *
 * Genera el PDF FINAL de la monografía directamente, sin Overleaf.
 * El estudiante hace UN solo click y descarga el PDF.
 *
 * Flujo:
 *   1. Carga el proyecto y todos sus phase_contents aprobados.
 *   2. Construye el HTML con generatePdfHtml usando datos reales del usuario.
 *   3. Pasa el HTML al endpoint interno /api/export/pdf que usa Chrome headless
 *      para renderizar a PDF.
 *   4. Devuelve el PDF como descarga directa (Content-Disposition: attachment).
 *
 * Tiempo típico: 5-15 segundos según tamaño del documento.
 */

import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import { DEFAULT_UNIVERSITIES } from "@/lib/data";
import { generatePdfHtml, MESES, type StudentCoverData } from "@/lib/pdfTemplate";
import { phaseDefinitionsForProject } from "@/lib/projectTypePhases";

const execFileAsync = promisify(execFile);

type Params = { params: Promise<{ id: string }> };

function slugify(s: string): string {
  return (s || "monografia")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "monografia";
}

function getChromeCandidates(): string[] {
  const fromEnv = process.env.CHROME_PATH ? [process.env.CHROME_PATH] : [];
  if (process.platform === "win32") {
    return [
      ...fromEnv,
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      path.join(process.env.LOCALAPPDATA ?? "", "Google\\Chrome\\Application\\chrome.exe"),
      path.join(process.env.PROGRAMFILES ?? "", "Microsoft\\Edge\\Application\\msedge.exe"),
    ];
  }
  if (process.platform === "darwin") {
    return [
      ...fromEnv,
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    ];
  }
  return [
    ...fromEnv,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
}

async function findChrome(): Promise<string | null> {
  for (const c of getChromeCandidates()) {
    if (!c.trim()) continue;
    try {
      await readFile(c);
      return c;
    } catch { /* try next */ }
  }
  return null;
}

function withAbsoluteAssets(html: string, origin: string): string {
  const o = origin.replace(/\/$/, "");
  let head = `<base href="${o}/">`;
  let result = html.includes("<head>") ? html.replace("<head>", `<head>${head}`) : `${head}${html}`;
  result = result
    .replace(/\b(src|href)=["']\/(?!\/)([^"']*)["']/g, (_m, attr, url) => `${attr}="${o}/${url}"`)
    .replace(/url\(["']?\/(?!\/)([^"')]+)["']?\)/g, (_m, url) => `url("${o}/${url}")`);
  return result;
}

export async function GET(req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const proyectoRaw = await dbGetProyecto(id);
    if (!proyectoRaw) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }
    const proyecto = proyectoRaw as unknown as Record<string, unknown>;
    if (proyecto.usuario_id !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Sin acceso al proyecto" }, { status: 403 });
    }

    // 1) Cargar fases con contenido
    const phaseContentsAll = (proyecto.phase_contents ?? {}) as Record<string, string | null | undefined>;
    const servicioId = (proyecto.servicio_id as string) || "mono-001";
    const tipoProyectoId = proyecto.tipo_proyecto_id as string | undefined;
    const phaseDefs = phaseDefinitionsForProject({ servicioId, tipoProyectoId });

    // 2) Universidad
    const universidadId = (proyecto.universidad_id as string) || "umss-001";
    const universidad = DEFAULT_UNIVERSITIES.find(u => u.id === universidadId) ?? DEFAULT_UNIVERSITIES[0];

    // 3) Datos reales del estudiante (inyectados desde el servidor)
    const ahora = new Date();
    const academicContext = (proyecto.academic_context ?? {}) as Record<string, unknown>;
    const ctxInicial = (academicContext.contexto_inicial ?? {}) as Record<string, unknown>;
    const titulo = String(proyecto.tema_aprobado ?? proyecto.titulo_provisional ?? "Monografía");
    const studentData: StudentCoverData = {
      nombre: user.name || "Estudiante",
      mes: MESES[ahora.getMonth()],
      anio: String(ahora.getFullYear()),
      programa: String(ctxInicial.programa ?? "Diplomado"),
      version: String(ctxInicial.version ?? ctxInicial.numero_version ?? "1° Versión"),
      tutor: String(ctxInicial.tutor ?? ""),
      carrera: String(ctxInicial.programa ?? ""),
      tituloTrabajo: titulo,
    };

    // 4) Si hay documento final consolidado, usar eso. Sino, ensamblar desde phase_contents.
    const storedFinal = (proyecto.final_document as string | null) || phaseContentsAll.__final_document;
    let phaseContents: Record<string, string | null>;
    let phaseLabels: Record<string, string>;
    if (storedFinal && storedFinal.trim()) {
      phaseContents = { fase_0: storedFinal };
      phaseLabels = { fase_0: "Monografía final" };
    } else {
      // Mapeo: solo capítulos sustantivos que van al PDF.
      const fasesPDF = phaseDefs.filter(p => p.id !== "ph-cap0" && p.id !== "ph-latex" && p.id !== "ph-calidad");
      phaseContents = {};
      phaseLabels = {};
      fasesPDF.forEach((p, idx) => {
        const final = phaseContentsAll[p.id];
        const borrador = phaseContentsAll[`${p.id}_borrador`];
        const contenido = (final?.trim() ? final : borrador) || "";
        if (contenido.trim()) {
          phaseContents[`fase_${idx}`] = contenido;
          phaseLabels[`fase_${idx}`] = p.label;
        }
      });
    }

    const totalContenido = Object.values(phaseContents).filter(c => typeof c === "string" && c.trim()).length;
    if (totalContenido === 0) {
      return NextResponse.json(
        { error: "Todavía no hay contenido aprobado. Aprobá al menos un capítulo primero." },
        { status: 400 }
      );
    }

    // 5) Generar HTML con generatePdfHtml
    const html = generatePdfHtml({
      university: universidad,
      studentData,
      phaseContents,
      phaseLabels,
      titulo,
    });

    // 6) Buscar Chrome para renderizar a PDF
    const chromePath = await findChrome();
    if (!chromePath) {
      return NextResponse.json({
        error: "Generador de PDF no disponible. En desarrollo, instalá Chrome/Edge. En producción, configurá CHROME_PATH.",
      }, { status: 500 });
    }

    // 7) Renderizar HTML → PDF con Chrome headless
    const tempDir = path.join(os.tmpdir(), "laboratorio-pdf");
    await mkdir(tempDir, { recursive: true });
    const base = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const htmlPath = path.join(tempDir, `${base}.html`);
    const pdfPath = path.join(tempDir, `${base}.pdf`);
    const origin = new URL(req.url).origin;
    const fileName = `${slugify(titulo)}.pdf`;

    try {
      await writeFile(htmlPath, withAbsoluteAssets(html, origin), "utf8");
      await execFileAsync(chromePath, [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--no-pdf-header-footer",
        `--print-to-pdf=${pdfPath}`,
        `file:///${htmlPath.replace(/\\/g, "/")}`,
      ], { timeout: 60_000 });

      const pdfBuffer = await readFile(pdfPath);
      const magic = pdfBuffer.subarray(0, 5).toString("ascii");
      if (pdfBuffer.byteLength === 0 || magic !== "%PDF-") {
        throw new Error(`Chrome generó un PDF inválido (${pdfBuffer.byteLength} bytes).`);
      }

      return new NextResponse(new Uint8Array(pdfBuffer) as unknown as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Content-Length": String(pdfBuffer.byteLength),
          "Cache-Control": "no-store",
        },
      });
    } finally {
      await rm(htmlPath, { force: true }).catch(() => {});
      await rm(pdfPath, { force: true }).catch(() => {});
    }
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[pdf]", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
