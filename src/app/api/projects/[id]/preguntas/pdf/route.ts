/**
 * GET /api/projects/[id]/preguntas/pdf
 *
 * Renderiza el banco de preguntas de defensa como un PDF imprimible.
 *
 * Lee phase_contents[`${faseId}_preguntas`] para cada fase con contenido,
 * arma un HTML simple y limpio, y lo renderiza con Chrome headless. Devuelve
 * el PDF en base64 dentro de un JSON (mismo workaround que /api/projects/[id]/pdf
 * por el bug de binary body en Next.js 16 + Turbopack).
 */

import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import { phaseDefinitionsForProject } from "@/lib/projectTypePhases";

const execFileAsync = promisify(execFile);

type Params = { params: Promise<{ id: string }> };

const FASES_CON_PREGUNTAS = ["ph-cap0", "ph-cap1", "ph-cap2", "ph-cap3", "ph-cap4", "ph-cap5"];

interface PreguntaItem {
  pregunta: string;
  respuesta_sugerida: string;
}

interface PreguntasFasePayload {
  generadas_at?: string;
  conocimiento: PreguntaItem[];
  autoria: PreguntaItem[];
}

function slugify(s: string): string {
  return (s || "banco-preguntas")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "banco-preguntas";
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parsePayload(raw: string | null | undefined): PreguntasFasePayload | null {
  if (!raw?.trim()) return null;
  try {
    const obj = JSON.parse(raw) as PreguntasFasePayload;
    if (!obj || typeof obj !== "object") return null;
    if (!Array.isArray(obj.conocimiento) || !Array.isArray(obj.autoria)) return null;
    return obj;
  } catch {
    return null;
  }
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
    return [...fromEnv, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"];
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
    try { await readFile(c); return c; } catch { /* try next */ }
  }
  return null;
}

function buildHtml(params: {
  titulo: string;
  estudiante: string;
  bloques: Array<{ label: string; conocimiento: PreguntaItem[]; autoria: PreguntaItem[] }>;
  totalConocimiento: number;
  totalAutoria: number;
}): string {
  const { titulo, estudiante, bloques, totalConocimiento, totalAutoria } = params;
  const fecha = new Date().toLocaleDateString("es-BO", { year: "numeric", month: "long", day: "numeric" });

  const css = `
    @page { size: letter; margin: 2.2cm 2.2cm 2.5cm 2.2cm; }
    * { box-sizing: border-box; }
    body { font-family: Georgia, "Times New Roman", serif; color: #1f2937; font-size: 11.5pt; line-height: 1.55; margin: 0; }
    h1.cover { font-size: 22pt; margin: 0 0 10pt; color: #111827; }
    h2.section { font-size: 14pt; margin: 24pt 0 8pt; color: #111827; border-bottom: 1pt solid #d1d5db; padding-bottom: 4pt; }
    h3.kind { font-size: 11pt; margin: 14pt 0 6pt; text-transform: uppercase; letter-spacing: 0.06em; }
    h3.kind.conocimiento { color: #2563eb; }
    h3.kind.autoria { color: #7c3aed; }
    .cover-block { padding: 24pt 0 18pt; border-bottom: 2pt solid #111827; margin-bottom: 18pt; }
    .cover-block .meta { font-size: 10.5pt; color: #4b5563; line-height: 1.7; }
    .cover-block .meta strong { color: #111827; }
    .stats { display: flex; gap: 16pt; margin: 12pt 0 6pt; font-size: 10pt; color: #4b5563; }
    .stats span strong { color: #111827; font-size: 12pt; }
    ol.preguntas { padding-left: 18pt; margin: 0; }
    ol.preguntas li { margin-bottom: 12pt; page-break-inside: avoid; }
    .pregunta { font-weight: 600; color: #111827; margin-bottom: 4pt; }
    .respuesta { font-size: 10.5pt; color: #374151; border-left: 2pt solid #e5e7eb; padding-left: 10pt; }
    .respuesta .tag { display: block; font-size: 8.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2pt; }
    .respuesta.conocimiento { border-left-color: #93c5fd; }
    .respuesta.conocimiento .tag { color: #2563eb; }
    .respuesta.autoria { border-left-color: #c4b5fd; }
    .respuesta.autoria .tag { color: #7c3aed; }
    .footer-note { margin-top: 28pt; padding-top: 12pt; border-top: 1pt solid #e5e7eb; font-size: 9.5pt; color: #6b7280; font-style: italic; }
  `;

  const renderItems = (items: PreguntaItem[], kind: "conocimiento" | "autoria") => `
    <ol class="preguntas">
      ${items.map(it => `
        <li>
          <div class="pregunta">${esc(it.pregunta)}</div>
          <div class="respuesta ${kind}">
            <span class="tag">Pista de respuesta</span>
            ${esc(it.respuesta_sugerida)}
          </div>
        </li>`).join("")}
    </ol>
  `;

  const bloquesHtml = bloques.map(b => `
    <h2 class="section">${esc(b.label)}</h2>
    ${b.conocimiento.length > 0 ? `
      <h3 class="kind conocimiento">🧠 De conocimiento — qué te puede preguntar el tribunal académico</h3>
      ${renderItems(b.conocimiento, "conocimiento")}
    ` : ""}
    ${b.autoria.length > 0 ? `
      <h3 class="kind autoria">🔍 De autoría y proceso — cómo verifican que vos hiciste el trabajo</h3>
      ${renderItems(b.autoria, "autoria")}
    ` : ""}
  `).join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Banco de preguntas — ${esc(titulo)}</title>
  <style>${css}</style>
</head>
<body>
  <div class="cover-block">
    <h1 class="cover">Banco de preguntas para tu defensa</h1>
    <div class="meta">
      <div><strong>Trabajo:</strong> ${esc(titulo)}</div>
      <div><strong>Estudiante:</strong> ${esc(estudiante)}</div>
      <div><strong>Generado:</strong> ${esc(fecha)}</div>
    </div>
    <div class="stats">
      <span><strong>${totalConocimiento}</strong> de conocimiento</span>
      <span><strong>${totalAutoria}</strong> de autoría</span>
      <span><strong>${totalConocimiento + totalAutoria}</strong> en total</span>
    </div>
  </div>
  ${bloquesHtml}
  <div class="footer-note">
    Estas preguntas fueron generadas por IA a partir del contenido aprobado de tu propia
    monografía. Las pistas de respuesta son referencias rápidas — estudialas y reformulalas
    con tus palabras antes de la defensa.
  </div>
</body>
</html>`;
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
      return NextResponse.json({ error: "Sin acceso al proyecto" }, { status: 403 });
    }

    const phaseContents = (proyecto.phase_contents ?? {}) as Record<string, string | null | undefined>;
    const servicioId = (proyecto.servicio_id as string) || "mono-001";
    const tipoProyectoId = proyecto.tipo_proyecto_id as string | undefined;
    const phaseDefs = phaseDefinitionsForProject({ servicioId, tipoProyectoId });
    const labelById: Record<string, string> = {};
    phaseDefs.forEach(p => { labelById[p.id] = p.label; });

    const bloques: Array<{ label: string; conocimiento: PreguntaItem[]; autoria: PreguntaItem[] }> = [];
    let totalConocimiento = 0;
    let totalAutoria = 0;
    for (const fid of FASES_CON_PREGUNTAS) {
      const payload = parsePayload(phaseContents[`${fid}_preguntas`]);
      if (!payload) continue;
      if (payload.conocimiento.length === 0 && payload.autoria.length === 0) continue;
      bloques.push({
        label: labelById[fid] || fid,
        conocimiento: payload.conocimiento,
        autoria: payload.autoria,
      });
      totalConocimiento += payload.conocimiento.length;
      totalAutoria += payload.autoria.length;
    }

    if (bloques.length === 0) {
      return NextResponse.json(
        { error: "Todavía no hay preguntas generadas. Aprobá al menos un capítulo." },
        { status: 400 },
      );
    }

    const titulo = String(proyecto.tema_aprobado ?? proyecto.titulo_provisional ?? "Monografía");
    const html = buildHtml({
      titulo,
      estudiante: user.name || "Estudiante",
      bloques,
      totalConocimiento,
      totalAutoria,
    });

    const chromePath = await findChrome();
    if (!chromePath) {
      return NextResponse.json({
        error: "Generador de PDF no disponible. En desarrollo, instalá Chrome/Edge.",
      }, { status: 500 });
    }

    const tempDir = path.join(os.tmpdir(), "laboratorio-preguntas");
    await mkdir(tempDir, { recursive: true });
    const base = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const htmlPath = path.join(tempDir, `${base}.html`);
    const pdfPath = path.join(tempDir, `${base}.pdf`);
    const fileName = `banco-preguntas-${slugify(titulo)}.pdf`;

    let pdfBytes: Uint8Array | null = null;
    try {
      await writeFile(htmlPath, html, "utf8");
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
        throw new Error(`Chrome generó un PDF inválido (${pdfBuffer.byteLength} bytes, magic="${magic}").`);
      }
      pdfBytes = new Uint8Array(pdfBuffer.byteLength);
      pdfBytes.set(pdfBuffer);
    } finally {
      await rm(htmlPath, { force: true }).catch(() => {});
      await rm(pdfPath, { force: true }).catch(() => {});
    }

    if (!pdfBytes || pdfBytes.byteLength === 0) {
      throw new Error("No se pudo generar el PDF.");
    }

    const base64 = Buffer.from(pdfBytes).toString("base64");
    return NextResponse.json({
      pdfBase64: base64,
      bytes: pdfBytes.byteLength,
      fileName,
      totalConocimiento,
      totalAutoria,
    }, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[preguntas/pdf]", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
