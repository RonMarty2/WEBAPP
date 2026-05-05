import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";

function sanitizeFileName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "documento-academico";
}

function withBaseHref(html: string, origin: string): string {
  const base = `<base href="${origin}/">`;
  return html.includes("<head>")
    ? html.replace("<head>", `<head>${base}`)
    : `${base}${html}`;
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
      path.join(process.env["PROGRAMFILES(X86)"] ?? "", "Microsoft\\Edge\\Application\\msedge.exe"),
    ];
  }
  if (process.platform === "darwin") {
    return [
      ...fromEnv,
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ];
  }
  return [
    ...fromEnv,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/microsoft-edge",
  ];
}

async function findChrome(): Promise<string | null> {
  for (const candidate of getChromeCandidates()) {
    if (!candidate.trim()) continue;
    try {
      await readFile(candidate);
      return candidate;
    } catch {
      /* Try next known browser path. */
    }
  }
  return null;
}

export async function POST(request: Request) {
  let body: { html?: string; title?: string; responseMode?: "binary" | "base64" };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const html = body.html?.trim();
  if (!html) {
    return Response.json({ error: "HTML requerido para generar el PDF." }, { status: 400 });
  }
  if (html.length > 5_000_000) {
    return Response.json({ error: "El documento es demasiado grande para exportar." }, { status: 413 });
  }

  const chromePath = await findChrome();
  if (!chromePath) {
    return Response.json({
      error: "No se encontró Chrome o Edge en el servidor para generar PDF.",
    }, { status: 500 });
  }

  const tempDir = path.join(os.tmpdir(), "laboratorio-pdf");
  await mkdir(tempDir, { recursive: true });
  const fileBase = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const htmlPath = path.join(tempDir, `${fileBase}.html`);
  const pdfPath = path.join(tempDir, `${fileBase}.pdf`);
  const origin = new URL(request.url).origin;
  const title = body.title?.trim() || "Documento Académico";
  const fileName = `${sanitizeFileName(title)}.pdf`;

  try {
    await writeFile(htmlPath, withBaseHref(html, origin), "utf8");
    await execFileAsync(chromePath, [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--no-pdf-header-footer",
      `--print-to-pdf=${pdfPath}`,
      `file:///${htmlPath.replace(/\\/g, "/")}`,
    ], { timeout: 45_000 });

    const pdf = await readFile(pdfPath);
    const magic = pdf.subarray(0, 5).toString("ascii");
    if (pdf.byteLength === 0 || magic !== "%PDF-") {
      return Response.json({
        error: `Chrome generó un PDF inválido (${pdf.byteLength} bytes).`,
      }, { status: 500 });
    }

    if (body.responseMode === "base64") {
      return Response.json({
        fileName,
        bytes: pdf.byteLength,
        pdfBase64: pdf.toString("base64"),
      }, {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      });
    }

    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(pdf.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF export failed", error);
    return Response.json({ error: "No se pudo generar el PDF." }, { status: 500 });
  } finally {
    await rm(htmlPath, { force: true }).catch(() => {});
    await rm(pdfPath, { force: true }).catch(() => {});
  }
}
