/**
 * Genera un documento HTML completo con el formato exacto de la universidad.
 * Función pura — sin dependencias de browser ni React.
 * El resultado se abre en una nueva pestaña y se imprime como PDF.
 */

import type { University } from "@/lib/data";

export interface StudentCoverData {
  nombre: string;
  mes: string;       // "Abril"
  anio: string;      // "2026"
  programa?: string;
  version?: string;
  tutor?: string;
  carrera?: string;
}

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
export { MESES };

// ── Markdown → HTML ───────────────────────────────────────────────────────────

function mdToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inUl = false;
  let inOl = false;
  let i = 0;

  const closeList = () => {
    if (inUl) { out.push("</ul>"); inUl = false; }
    if (inOl) { out.push("</ol>"); inOl = false; }
  };

  const inlineFormat = (s: string) =>
    s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>");

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // H6 → APA Level 5 (inline, bold-italic)
    if (/^###### /.test(line)) {
      closeList();
      const title = inlineFormat(line.replace(/^###### /, ""));
      // Merge with next non-empty line
      const next = lines[i + 1]?.trim() ?? "";
      if (next) {
        out.push(`<p class="apa-h5"><em><strong>${title}.</strong></em> ${inlineFormat(next)}</p>`);
        i += 2;
      } else {
        out.push(`<p class="apa-h5"><em><strong>${title}.</strong></em></p>`);
        i++;
      }
      continue;
    }

    // H5 → APA Level 4 (inline, bold)
    if (/^##### /.test(line)) {
      closeList();
      const title = inlineFormat(line.replace(/^##### /, ""));
      const next = lines[i + 1]?.trim() ?? "";
      if (next) {
        out.push(`<p class="apa-h4"><strong>${title}.</strong> ${inlineFormat(next)}</p>`);
        i += 2;
      } else {
        out.push(`<p class="apa-h4"><strong>${title}.</strong></p>`);
        i++;
      }
      continue;
    }

    // H4 → APA Level 3
    if (/^#### /.test(line)) {
      closeList();
      out.push(`<h3>${inlineFormat(line.replace(/^#### /, ""))}</h3>`);
      i++; continue;
    }

    // H3 → APA Level 2
    if (/^### /.test(line)) {
      closeList();
      out.push(`<h2>${inlineFormat(line.replace(/^### /, ""))}</h2>`);
      i++; continue;
    }

    // H2 → APA Level 1
    if (/^## /.test(line)) {
      closeList();
      out.push(`<h1>${inlineFormat(line.replace(/^## /, ""))}</h1>`);
      i++; continue;
    }

    // H1 → document title (centered, larger)
    if (/^# /.test(line)) {
      closeList();
      out.push(`<h1 class="doc-title">${inlineFormat(line.replace(/^# /, ""))}</h1>`);
      i++; continue;
    }

    // Unordered list
    if (/^[-*] /.test(line)) {
      if (!inUl) { if (inOl) { out.push("</ol>"); inOl = false; } out.push("<ul>"); inUl = true; }
      out.push(`<li>${inlineFormat(line.replace(/^[-*] /, ""))}</li>`);
      i++; continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      if (!inOl) { if (inUl) { out.push("</ul>"); inUl = false; } out.push("<ol>"); inOl = true; }
      out.push(`<li>${inlineFormat(line.replace(/^\d+\. /, ""))}</li>`);
      i++; continue;
    }

    // Blank line
    if (line.trim() === "") {
      closeList();
      i++; continue;
    }

    // Normal paragraph
    closeList();
    out.push(`<p>${inlineFormat(line.trim())}</p>`);
    i++;
  }

  closeList();
  return out.join("\n");
}

// ── CSS builder ───────────────────────────────────────────────────────────────

function buildCss(u: University): string {
  const f = u.format;
  const font = f.font || "Times New Roman";
  const size = f.size || 12;
  const lh = f.lineHeight || 1.5;
  const m = f.margins ?? { top: 2.54, left: 2.54, bottom: 2.54, right: 2.54 };
  const align = f.alineacion ?? "justify";
  const pageNumPos = f.numero_paginas_posicion ?? "top-right";

  const pageNumCss = pageNumPos === "top-right"
    ? `@page { @top-right { content: counter(page); font-family: '${font}', serif; font-size: ${size}pt; } }`
    : pageNumPos === "bottom-center"
    ? `@page { @bottom-center { content: counter(page); font-family: '${font}', serif; font-size: ${size}pt; } }`
    : `@page { @top-center { content: counter(page); font-family: '${font}', serif; font-size: ${size}pt; } }`;

  return `
    @page {
      size: letter;
      margin: ${m.top}cm ${m.right}cm ${m.bottom}cm ${m.left}cm;
    }
    @page cover { margin: ${m.top}cm ${m.right}cm ${m.bottom}cm ${m.left}cm; }
    ${pageNumCss}

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: '${font}', 'Times New Roman', serif;
      font-size: ${size}pt;
      line-height: ${lh};
      text-align: ${align};
      color: #000;
      background: #fff;
    }

    /* Cover page */
    .cover-page {
      page: cover;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      min-height: 100vh;
      padding: 0;
    }
    .cover-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      width: 100%;
      margin-bottom: 32px;
    }
    .cover-logo {
      height: 4cm;
      width: auto;
      flex-shrink: 0;
      margin-left: -${m.left}cm;
      padding-left: ${m.left}cm;
    }
    .cover-inst {
      flex: 1;
      text-align: center;
    }
    .cover-inst-name {
      font-size: 14pt;
      font-weight: bold;
      line-height: 1.3;
    }
    .cover-inst-sub {
      font-size: 12pt;
      font-weight: bold;
      line-height: 1.3;
    }
    .cover-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      flex: 1;
      justify-content: center;
      width: 100%;
    }
    .cover-modalidad {
      font-size: 12pt;
      font-weight: bold;
      text-align: center;
    }
    .cover-title-block {
      font-size: 14pt;
      font-weight: bold;
      text-align: center;
      line-height: 1.4;
    }
    .cover-footer {
      font-size: 14pt;
      font-weight: bold;
      text-align: center;
      margin-top: auto;
      padding-bottom: 8px;
    }

    /* Content */
    .content-page {
      page-break-before: always;
    }

    /* APA 7 headings */
    h1 {
      font-size: ${size}pt;
      font-weight: bold;
      text-align: center;
      margin: 1.5em 0 0.5em;
    }
    h1.doc-title {
      font-size: ${size + 2}pt;
      margin: 0 0 1.5em;
    }
    h2 {
      font-size: ${size}pt;
      font-weight: bold;
      text-align: left;
      margin: 1.2em 0 0.4em;
    }
    h3 {
      font-size: ${size}pt;
      font-weight: bold;
      font-style: italic;
      text-align: left;
      margin: 1em 0 0.4em;
    }
    /* APA H4 — inline with paragraph */
    p.apa-h4 {
      margin: 0.8em 0;
      padding-left: 1.27cm;
      text-indent: 0;
    }
    p.apa-h4 strong { font-weight: bold; }

    /* APA H5 — inline with paragraph, bold-italic */
    p.apa-h5 {
      margin: 0.8em 0;
      padding-left: 1.27cm;
      text-indent: 0;
    }
    p.apa-h5 em strong { font-weight: bold; font-style: italic; }

    p { margin: 0 0 0.5em; }
    ul, ol { margin: 0.5em 0 0.5em 2em; }
    li { margin-bottom: 0.25em; }
    code { font-family: 'Courier New', monospace; font-size: 0.9em; }

    /* Page number fallback for non-Chrome browsers */
    .page-num-header {
      display: none;
    }
    @media print {
      .page-num-header {
        display: block;
        position: running(header);
        text-align: ${pageNumPos === "top-right" ? "right" : pageNumPos === "top-center" ? "center" : "right"};
        font-size: ${size}pt;
      }
      @page { margin-top: ${m.top + 1}cm; }
      @page cover { margin-top: ${m.top}cm; }
    }
  `;
}

// ── Cover page builder ────────────────────────────────────────────────────────

function buildCover(u: University, s: StudentCoverData, titulo: string): string {
  const logoHtml = u.logo_url
    ? `<img src="${u.logo_url}" class="cover-logo" alt="Logo" />`
    : "";

  const instBlock = `
    <div class="cover-inst">
      <div class="cover-inst-name">${u.name}</div>
      ${u.facultad ? `<div class="cover-inst-sub">${u.facultad}</div>` : ""}
      ${u.departamento ? `<div class="cover-inst-sub">${u.departamento}</div>` : ""}
    </div>
  `;

  const modalidadHtml = u.tipo_modalidad
    ? `<div class="cover-modalidad">${u.tipo_modalidad}</div>`
    : "";

  const campos = u.campos_portada ?? [];
  let programaHtml = "";
  if (campos.includes("programa") && s.programa) {
    const ver = campos.includes("version") && s.version ? ` ${s.version} VERSIÓN` : "";
    const prog = u.tipo_modalidad?.split(" ")[0] ?? "DIPLOMADO";
    programaHtml = `<div class="cover-modalidad">${prog} ${s.programa}${ver}</div>`;
  }

  const tipoDocHtml = u.tipo_documento
    ? `<div class="cover-title-block">${u.tipo_documento}</div>`
    : "";

  const tituloHtml = titulo
    ? `<div class="cover-title-block">${titulo.toUpperCase()}</div>`
    : "";

  const estudianteHtml = s.nombre
    ? `<div class="cover-title-block">Estudiante: ${s.nombre}</div>`
    : "";

  const tutorHtml = campos.includes("tutor") && s.tutor
    ? `<div class="cover-title-block">Tutor/a: ${s.tutor}</div>`
    : "";

  const carreraHtml = campos.includes("carrera") && s.carrera
    ? `<div class="cover-title-block">Carrera: ${s.carrera}</div>`
    : "";

  const ciudad = u.ciudad || "";
  const pais = u.pais || "";
  const lugar = ciudad && pais ? `${ciudad} – ${pais}` : ciudad || pais;
  const fecha = `${s.mes} ${s.anio}`;
  const footerHtml = `<div class="cover-footer">${[lugar, fecha].filter(Boolean).join(", ")}</div>`;

  return `
    <div class="cover-page">
      <div class="cover-header">
        ${logoHtml}
        ${instBlock}
      </div>
      <div class="cover-body">
        ${modalidadHtml}
        ${programaHtml}
        ${tipoDocHtml}
        ${tituloHtml}
        ${estudianteHtml}
        ${tutorHtml}
        ${carreraHtml}
      </div>
      ${footerHtml}
    </div>
  `;
}

// ── Variable substitution for HTML cover templates ───────────────────────────

function substituteVars(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

// ── Main export ───────────────────────────────────────────────────────────────

export function generatePdfHtml(params: {
  university: University;
  studentData: StudentCoverData;
  phaseContents: Record<string, string | null>;
  titulo?: string;
}): string {
  const { university, studentData, phaseContents, titulo = "" } = params;

  const css = buildCss(university);

  // Cover: use admin HTML template if configured, otherwise build programmatically
  let cover: string;
  if (university.cover_template?.trim()) {
    const vars: Record<string, string> = {
      nombre_estudiante: studentData.nombre,
      titulo,
      mes: studentData.mes,
      anio: studentData.anio,
      universidad: university.name,
      facultad: university.facultad ?? "",
      departamento: university.departamento ?? "",
      ciudad: university.ciudad ?? "",
      pais: university.pais ?? "",
      programa: studentData.programa ?? "",
      version: studentData.version ?? "",
      tutor: studentData.tutor ?? "",
      carrera: studentData.carrera ?? "",
      tipo_documento: university.tipo_documento ?? "",
      tipo_modalidad: university.tipo_modalidad ?? "",
      logo_url: university.logo_url ?? "",
    };
    cover = `<div class="cover-page">${substituteVars(university.cover_template, vars)}</div>`;
  } else {
    cover = buildCover(university, studentData, titulo);
  }

  // Body: iterate all fase_N keys in numeric order (supports any number of phases)
  const sortedKeys = Object.keys(phaseContents)
    .filter(k => /^fase_\d+$/.test(k))
    .sort((a, b) => parseInt(a.replace("fase_", ""), 10) - parseInt(b.replace("fase_", ""), 10));

  const bodyParts: string[] = [];
  for (const key of sortedKeys) {
    const content = phaseContents[key];
    if (!content?.trim()) continue;
    bodyParts.push(`<div class="content-page">${mdToHtml(content)}</div>`);
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${titulo || "Documento Académico"}</title>
  <style>${css}</style>
</head>
<body>
  ${cover}
  ${bodyParts.join("\n")}
</body>
</html>`;
}
