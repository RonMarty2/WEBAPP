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
  tituloTrabajo?: string;
  tutor?: string;
  carrera?: string;
  ciudad?: string;
}

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
export { MESES };

type PageSize = "letter" | "a4" | "legal";

const PAGE_SIZES: Record<PageSize, { css: string; widthCm: number; heightCm: number }> = {
  letter: { css: "letter", widthCm: 21.59, heightCm: 27.94 },
  a4: { css: "A4", widthCm: 21, heightCm: 29.7 },
  legal: { css: "legal", widthCm: 21.59, heightCm: 35.56 },
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escAttr(s: string): string {
  return esc(s).replace(/"/g, "&quot;");
}

function normalizeTextKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[.,;:]+$/g, "")
    .trim();
}

function normalizeReferenceEntry(value: string): string {
  return normalizeTextKey(value)
    .replace(/\[url\/doi sugerido:\s*/g, "")
    .replace(/\[se recomienda anadir url o doi especifico\]/g, "")
    .replace(/\[url o doi especifico si se consulto en linea\]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isCaptionLine(value: string): boolean {
  return /^(tabla|cuadro|figura|grafico|gr[aá]fico)\s+\d+[\.:]?\s+/i.test(value.trim());
}

function extractCaptionItems(markdown: string) {
  const items = [...markdown.matchAll(/^(Tabla|Cuadro|Figura|Gr[aá]fico|Grafico)\s+(\d+)[\.:]?\s+(.+)$/gim)]
    .map(match => ({
      type: normalizeTextKey(match[1]).startsWith("tabla") || normalizeTextKey(match[1]).startsWith("cuadro")
        ? "table"
        : "figure",
      label: `${match[1]} ${match[2]}. ${match[3].replace(/\*\*/g, "").trim()}`,
    }));

  return {
    tables: items.filter(item => item.type === "table").map(item => item.label),
    figures: items.filter(item => item.type === "figure").map(item => item.label),
  };
}

// ── Markdown → HTML ───────────────────────────────────────────────────────────

function mdToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inUl = false;
  let inOl = false;
  let inReferences = false;
  const seenReferences = new Set<string>();
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

  const isTableRow = (s: string) => /^\s*\|.+\|\s*$/.test(s);
  const isSeparatorRow = (s: string) => {
    const cells = s.trim().replace(/^\|/, "").replace(/\|$/, "").split("|");
    return cells.length > 1 && cells.every(cell => /^\s*:?-{3,}:?\s*$/.test(cell));
  };
  const splitTableCells = (s: string) =>
    s.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(cell => cell.trim());

  const normalizeHeading = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\\_/g, "_");

  const updateReferenceMode = (headingText: string) => {
    const normalized = normalizeHeading(headingText);
    inReferences = normalized.includes("referencias") || normalized.includes("bibliografia");
  };

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimEnd();

    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (imageMatch) {
      closeList();
      const alt = imageMatch[1].trim();
      const src = imageMatch[2].trim();
      out.push(
        `<figure class="md-figure"><img src="${escAttr(src)}" alt="${escAttr(alt)}" />${
          alt ? `<figcaption>${inlineFormat(esc(alt))}</figcaption>` : ""
        }</figure>`
      );
      i++; continue;
    }

    // Horizontal rule sola (---, ***, ___) — La IA suele agregarlas innecesariamente
    // entre encabezados que ya separan visualmente. Las ignoramos.
    if (/^\s*[-*_]{3,}\s*$/.test(line)) {
      closeList();
      i++;
      continue;
    }

    // Caption de bloque: "Tabla 1.2", "Ecuación 2.1", "Figura 3.1", "Cuadro 4.5", "Gráfico 2.3"
    // Aparecen como subtítulos cortos sin párrafo — les damos espacio respiratorio.
    if (/^(Tabla|Cuadro|Figura|Gr[áa]fico|Ecuaci[óo]n)\s+\d+(\.\d+)?\s*$/i.test(line)) {
      closeList();
      out.push(`<p class="caption-block"><strong>${inlineFormat(line.trim())}</strong></p>`);
      i++;
      continue;
    }

    // Tabla markdown — TOLERANTE: acepta tablas sin separador "|---|---|" después del header.
    // Si la IA olvida el separador, igual reconocemos el bloque como tabla mientras haya
    // filas consecutivas con formato "| ... |". Filas vacías o de solo "|" se saltan.
    if (isTableRow(line)) {
      closeList();
      const tieneSeparador = isSeparatorRow(lines[i + 1] ?? "");
      const headers = splitTableCells(line);
      const rows: string[][] = [];
      i += tieneSeparador ? 2 : 1;
      while (i < lines.length) {
        const candidate = lines[i];
        if (isTableRow(candidate)) {
          const cells = splitTableCells(candidate);
          // Saltar filas completamente vacías (todas las celdas vacías o solo whitespace).
          if (cells.some(c => c.length > 0)) {
            rows.push(cells);
          }
          i++;
        } else if ((candidate ?? "").trim() === "" && isTableRow(lines[i + 1] ?? "")) {
          // Línea en blanco entre filas: aceptable, seguir.
          i++;
        } else {
          break;
        }
      }
      // Si no había separador Y no aparecieron filas adicionales, era una sola línea con "|" —
      // tratarla como párrafo normal en vez de tabla rota.
      if (!tieneSeparador && rows.length === 0) {
        out.push(`<p>${inlineFormat(line.trim())}</p>`);
        continue;
      }
      // Calcular columnas máximas (algunas filas pueden tener menos celdas que el header).
      const numCols = Math.max(headers.length, ...rows.map(r => r.length));
      const padHeaders = [...headers, ...Array(Math.max(0, numCols - headers.length)).fill("")];
      out.push(
        `<table class="md-table"><thead><tr>${padHeaders.map(header => `<th>${inlineFormat(header)}</th>`).join("")}</tr></thead><tbody>${
          rows.map(row => `<tr>${padHeaders.map((_, idx) => `<td>${inlineFormat(row[idx] ?? "")}</td>`).join("")}</tr>`).join("")
        }</tbody></table>`
      );
      continue;
    }

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
      const heading = line.replace(/^#### /, "");
      updateReferenceMode(heading);
      out.push(`<h3>${inlineFormat(heading)}</h3>`);
      i++; continue;
    }

    // H3 → APA Level 2
    if (/^### /.test(line)) {
      closeList();
      const heading = line.replace(/^### /, "");
      updateReferenceMode(heading);
      out.push(`<h2>${inlineFormat(heading)}</h2>`);
      i++; continue;
    }

    // H2 → APA Level 1
    if (/^## /.test(line)) {
      closeList();
      const heading = line.replace(/^## /, "");
      updateReferenceMode(heading);
      out.push(`<h1>${inlineFormat(heading)}</h1>`);
      i++; continue;
    }

    // H1 → document title (centered, larger)
    if (/^# /.test(line)) {
      closeList();
      const heading = line.replace(/^# /, "");
      updateReferenceMode(heading);
      out.push(`<h1 class="doc-title">${inlineFormat(heading)}</h1>`);
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
    if (inReferences) {
      const refKey = normalizeReferenceEntry(line.trim());
      if (refKey && seenReferences.has(refKey)) {
        i++;
        continue;
      }
      if (refKey) seenReferences.add(refKey);
    }
    const paragraphClass = inReferences
      ? ' class="reference-entry"'
      : isCaptionLine(line)
        ? ' class="caption-entry"'
        : "";
    out.push(`<p${paragraphClass}>${inlineFormat(line.trim())}</p>`);
    i++;
  }

  closeList();
  return out.join("\n");
}

function plainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`(.+?)`/g, "$1")
    .replace(/[#*_>\-[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pageCapacity(u: University): number {
  const f = u.format;
  const page = PAGE_SIZES[f.pageSize ?? "letter"];
  const m = f.margins ?? { top: 2.54, left: 2.54, bottom: 2.54, right: 2.54 };
  const contentWidth = Math.max(8, page.widthCm - m.left - m.right);
  const contentHeight = Math.max(10, page.heightCm - m.top - m.bottom);
  const lineHeightCm = ((f.size || 12) * 0.0352778) * (f.lineHeight || 1.5);
  const lines = Math.max(8, Math.floor(contentHeight / lineHeightCm));
  const charsPerLine = Math.max(34, Math.floor(contentWidth / ((f.size || 12) * 0.018)));
  return Math.max(900, Math.floor(lines * charsPerLine * 0.84));
}

function paginateMarkdown(md: string, capacity: number): string[] {
  const blocks = md.split(/\n{2,}/).map(block => block.trim()).filter(Boolean);
  const pages: string[] = [];
  let current: string[] = [];
  let currentUnits = 0;

  const blockUnits = (block: string) => {
    const headingCost = /^#{1,6}\s/.test(block) ? 220 : 0;
    const listCost = /^[-*]\s/m.test(block) ? 90 : 0;
    return plainText(block).length + headingCost + listCost;
  };

  const flush = () => {
    if (!current.length) return;
    pages.push(current.join("\n\n"));
    current = [];
    currentUnits = 0;
  };

  for (let idx = 0; idx < blocks.length; idx++) {
    const block = blocks[idx];
    const headingOnly = /^#{1,6}\s/.test(block) && !block.includes("\n");
    const nextBlock = headingOnly ? blocks[idx + 1] : undefined;
    const units = blockUnits(block);
    const keepWithNextUnits = nextBlock ? units + Math.min(blockUnits(nextBlock), Math.floor(capacity * 0.45)) : units;

    if (headingOnly && current.length && currentUnits + keepWithNextUnits > capacity) {
      flush();
    }

    if (units > capacity) {
      const sentences = block.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ?? [block];
      for (const sentence of sentences.map(s => s.trim()).filter(Boolean)) {
        const sentenceUnits = plainText(sentence).length;
        if (current.length && currentUnits + sentenceUnits > capacity) flush();
        current.push(sentence);
        currentUnits += sentenceUnits;
      }
      continue;
    }

    if (current.length && currentUnits + units > capacity) flush();
    current.push(block);
    currentUnits += units;
  }

  flush();
  return pages.length ? pages : [md];
}

// ── CSS builder ───────────────────────────────────────────────────────────────

export function buildCss(u: University): string {
  const f = u.format;
  const page = PAGE_SIZES[f.pageSize ?? "letter"];
  const font = f.font || "Times New Roman";
  const size = f.size || 12;
  const lh = f.lineHeight || 1.5;
  const m = f.margins ?? { top: 2.54, left: 2.54, bottom: 2.54, right: 2.54 };
  const align = f.alineacion ?? "justify";
  const pageNumPos = f.numero_paginas_posicion ?? "top-right";

  const pageNumCss = "";

  return `
    @page {
      size: ${page.css};
      margin: 0;
    }
    @page cover { margin: 0; }
    ${pageNumCss}

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: '${font}', 'Times New Roman', serif;
      font-size: ${size}pt;
      line-height: ${lh};
      text-align: ${align};
      color: #000;
      background: #fff;
      counter-reset: content-page;
    }

    .document-sheet {
      position: relative;
      width: ${page.widthCm}cm;
      height: ${page.heightCm}cm;
      padding: ${m.top}cm ${m.right}cm ${m.bottom}cm ${m.left}cm;
      background: #fff;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
    }

    .content-sheet {
      counter-increment: content-page;
    }

    .page-number {
      position: absolute;
      font-family: '${font}', serif;
      font-size: ${size}pt;
      line-height: 1;
      display: block;
    }

    .page-number::after {
      content: counter(content-page);
    }

    .page-number.top-right {
      top: 1.2cm;
      right: ${m.right}cm;
    }

    .page-number.top-center {
      top: 1.2cm;
      left: 0;
      right: 0;
      text-align: center;
    }

    .page-number.bottom-center {
      bottom: 1.2cm;
      left: 0;
      right: 0;
      text-align: center;
    }

    /* Cover page */
    .cover-page {
      page: cover;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      min-height: 100%;
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
      object-fit: contain;
    }
    .cover-logo-fallback {
      width: 2.5cm;
      height: 4cm;
      flex-shrink: 0;
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
      gap: 1.35cm;
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

    .cover-programa {
      font-size: 12pt;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
    }

    .cover-doc-type,
    .cover-work-title,
    .cover-student {
      font-size: 14pt;
      font-weight: bold;
      text-align: center;
      line-height: 1.35;
    }

    .toc-title,
    .references-title {
      font-size: ${size}pt;
      font-weight: bold;
      text-align: center;
      margin: 0 0 1.2em;
    }

    .toc-list {
      list-style: none;
      margin: 0;
      padding: 0;
      text-align: left;
      line-height: 1.25;
    }

    .toc-list li {
      margin: 0 0 0.18em;
      font-size: ${size}pt;
    }

    .toc-level-1 { font-weight: bold; }
    .toc-level-2 { padding-left: 0.35cm; }
    .toc-level-3 { padding-left: 0.7cm; }

    p.reference-entry {
      padding-left: 1.27cm;
      text-indent: -1.27cm;
      margin-bottom: 0.5em;
    }

    p.caption-entry,
    figcaption {
      font-size: ${Math.max(9, size - 1)}pt;
      text-align: center;
      margin: 0.35em 0 0.7em;
    }

    /* Bloque caption: "Tabla N.M", "Ecuación N.M", "Figura N.M" sueltos en línea.
       Damos margin superior para separarlos del párrafo previo y centramos. */
    p.caption-block {
      font-size: ${size}pt;
      font-weight: bold;
      text-align: left;
      margin: 1.2em 0 0.4em;
      break-after: avoid;
      page-break-after: avoid;
      text-indent: 0;
    }
    p.caption-block strong { font-weight: bold; }

    /* APA 7 headings */
    h1 {
      font-size: ${size}pt;
      font-weight: bold;
      text-align: center;
      margin: 1.5em 0 0.5em;
      break-after: avoid;
      page-break-after: avoid;
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
      break-after: avoid;
      page-break-after: avoid;
    }
    h3 {
      font-size: ${size}pt;
      font-weight: bold;
      font-style: italic;
      text-align: left;
      margin: 1em 0 0.4em;
      break-after: avoid;
      page-break-after: avoid;
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

    p { margin: 0; }
    ul, ol { margin: 0.5em 0 0.5em 2em; }
    li { margin-bottom: 0.25em; }
    code { font-family: 'Courier New', monospace; font-size: 0.9em; }
    .md-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.7em 0 0.9em;
      font-size: ${Math.max(9, size - 1)}pt;
      line-height: 1.25;
      text-align: left;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .md-table th,
    .md-table td {
      border: 1px solid #000;
      padding: 0.16cm 0.18cm;
      vertical-align: top;
    }
    .md-table th {
      font-weight: bold;
      text-align: center;
    }
    .md-figure {
      margin: 0.8em 0 1em;
      text-align: center;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .md-figure img {
      max-width: 100%;
      max-height: 15cm;
      object-fit: contain;
    }

    /* Page number fallback for non-Chrome browsers */
    .page-num-header {
      display: none;
    }
    @media print {
      body { background: #fff; }
      .document-sheet {
        width: ${page.widthCm}cm;
        height: ${page.heightCm}cm;
        padding: ${m.top}cm ${m.right}cm ${m.bottom}cm ${m.left}cm;
        box-shadow: none;
        overflow: hidden;
      }
      .page-num-header {
        display: block;
        position: running(header);
        text-align: ${pageNumPos === "top-right" ? "right" : pageNumPos === "top-center" ? "center" : "right"};
        font-size: ${size}pt;
      }
    }

    @media screen {
      html { background: #eef0f3; }
      body {
        background: #eef0f3;
        padding: 24px 0;
      }
      body.document-preview-mode {
        zoom: 0.36;
        width: max-content;
        margin: 0 auto;
      }
      .document-sheet {
        margin: 0 auto 22px;
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.16), 0 0 1px rgba(15, 23, 42, 0.22);
      }
    }
  `;
}

// ── Cover page builder ────────────────────────────────────────────────────────

export function buildCover(u: University, s: StudentCoverData, titulo: string): string {
  const isUmss = /san sim[oó]n|umss/i.test(u.name);
  const umssFallbackLogo = `
    <svg class="cover-logo-fallback" viewBox="0 0 90 144" role="img" aria-label="Logo UMSS">
      <defs>
        <linearGradient id="umssShield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ed1c24"/>
          <stop offset="0.5" stop-color="#ffffff"/>
          <stop offset="1" stop-color="#0057a8"/>
        </linearGradient>
      </defs>
      <path d="M8 8h74L45 136 8 8Z" fill="url(#umssShield)" stroke="#003b70" stroke-width="4"/>
      <path d="M16 18h58L45 120 16 18Z" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.9"/>
      <text x="45" y="28" text-anchor="middle" font-family="Times New Roman, serif" font-size="13" font-weight="700" fill="#003b70">UMSS</text>
      <path d="M45 45c8 10 8 21 0 32-8-11-8-22 0-32Z" fill="#ffffff" stroke="#003b70" stroke-width="2"/>
      <path d="M29 38l16 18 16-18" fill="none" stroke="#003b70" stroke-width="3"/>
    </svg>
  `;
  const logoHtml = u.logo_url
    ? `<img src="${u.logo_url}" class="cover-logo" alt="Logo" />`
    : isUmss ? umssFallbackLogo : "";

  const instBlock = `
    <div class="cover-inst">
      <div class="cover-inst-name">${isUmss ? "UNIVERSIDAD MAYOR DE SAN SIM&Oacute;N" : esc(u.name).toUpperCase()}</div>
      ${isUmss ? `<div class="cover-inst-sub">Facultad de Ciencias Econ&oacute;micas</div><div class="cover-inst-sub">Departamento de Posgrado</div>` : ""}
    </div>
  `;

  const modalidadHtml = `<div class="cover-modalidad">DIPLOMADO COMO MODALIDAD DE TITULACI&Oacute;N</div>`;

  const campos = u.campos_portada ?? [];
  let programaHtml = "";
  if (campos.includes("programa") && s.programa) {
    const ver = campos.includes("version") && s.version ? ` ${esc(s.version)} VERSI&Oacute;N` : "";
    programaHtml = `<div class="cover-programa">DIPLOMADO ${esc(s.programa)}${ver}</div>`;
  }

  const tipoDocHtml = `<div class="cover-doc-type">MONOGRAF&Iacute;A</div>`;

  const tituloHtml = titulo
    ? `<div class="cover-work-title">${esc(titulo).toUpperCase()}</div>`
    : "";

  const estudianteHtml = s.nombre
    ? `<div class="cover-student">Estudiante: ${esc(s.nombre)}</div>`
    : "";

  const tutorHtml = campos.includes("tutor") && s.tutor
    ? `<div class="cover-title-block">Tutor/a: ${esc(s.tutor)}</div>`
    : "";

  const carreraHtml = campos.includes("carrera") && s.carrera
    ? `<div class="cover-title-block">Carrera: ${esc(s.carrera)}</div>`
    : "";

  const ciudad = s.ciudad?.trim() || "Cochabamba - Bolivia";
  const fecha = `${s.mes}, ${s.anio}`;
  const footerHtml = `<div class="cover-footer">${esc(ciudad)}<br/>${esc(fecha)}</div>`;

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

// ── Cover Generation (Template or Fallback) ───────────────────────────────────

export function getHtmlCover(university: University, studentData: StudentCoverData, titulo: string): string {
  if (university.cover_template?.trim()) {
    const vars: Record<string, string> = {
      nombre_estudiante: studentData.nombre,
      titulo,
      mes: studentData.mes,
      anio: studentData.anio,
      universidad: university.name,
      programa: studentData.programa ?? "",
      version: studentData.version ?? "",
      tutor: studentData.tutor ?? "",
      carrera: studentData.carrera ?? "",
      ciudad: studentData.ciudad ?? "Cochabamba - Bolivia",
      logo_url: university.logo_url ?? "",
      ...(university.logo_assets ?? {}),
    };
    return `<div class="cover-page">${substituteVars(university.cover_template, vars)}</div>`;
  }
  return buildCover(university, studentData, titulo);
}

// ── Main export ───────────────────────────────────────────────────────────────

function extractTocFromMarkdown(content: string): { label: string; level: number }[] {
  const headings = [...content.matchAll(/^(#{1,3})\s+(.+)$/gm)]
    .map(match => ({
      label: match[2].replace(/\*\*/g, "").trim(),
      level: Math.min(match[1].length, 3),
    }))
    .filter(item => item.label && !/^indice$/i.test(item.label));
  return headings.slice(0, 18);
}

function isChapterHeadingLine(line: string): boolean {
  const cleaned = normalizeTextKey(line.replace(/^#{1,6}\s+/, ""));
  return /^capitulo\s+(i|ii|iii|iv|v|vi|vii|viii|ix|x)\b/i.test(cleaned);
}

function splitMarkdownByChapters(content: string): string[] {
  const lines = content.split("\n");
  const sections: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (isChapterHeadingLine(line) && current.some(item => item.trim())) {
      sections.push(current.join("\n").trim());
      current = [];
    }
    current.push(line);
  }

  if (current.some(item => item.trim())) {
    sections.push(current.join("\n").trim());
  }

  return sections.length ? sections : [content];
}

export function generatePdfHtml(params: {
  university: University;
  studentData: StudentCoverData;
  phaseContents: Record<string, string | null>;
  phaseLabels?: Record<string, string>;
  titulo?: string;
  preview?: boolean;
}): string {
  const { university, studentData, phaseContents, phaseLabels = {}, titulo = "", preview = false } = params;

  const css = buildCss(university);
  const cover = getHtmlCover(university, studentData, titulo);
  const pageNumPos = university.format.numero_paginas_posicion ?? "top-right";
  const capacity = pageCapacity(university);

  // Body: iterate all fase_N keys in numeric order (supports any number of phases)
  const sortedKeys = Object.keys(phaseContents)
    .filter(k => /^fase_\d+$/.test(k))
    .sort((a, b) => parseInt(a.replace("fase_", ""), 10) - parseInt(b.replace("fase_", ""), 10));

  const isSingleFinalDocument = sortedKeys.length === 1 && /monograf/i.test(phaseLabels[sortedKeys[0]] ?? "");
  const allMarkdown = sortedKeys.map(key => phaseContents[key] ?? "").join("\n\n");
  const captionItems = extractCaptionItems(allMarkdown);
  const tocItems = isSingleFinalDocument
    ? extractTocFromMarkdown(phaseContents[sortedKeys[0]] ?? "")
    : sortedKeys
        .filter(key => phaseContents[key]?.trim())
        .map((key, index) => ({
          label: phaseLabels[key] ?? `Capítulo ${index + 1}`,
          level: 1,
        }));

  const toc = tocItems.length
    ? `<section class="document-sheet toc-sheet">
        <h1 class="toc-title">Índice</h1>
        <ol class="toc-list">
          ${tocItems.map(item => `<li class="toc-level-${item.level}">${esc(item.label)}</li>`).join("\n")}
          ${tocItems.some(item => /referencias|bibliograf/i.test(item.label)) ? "" : `<li class="toc-level-1">Referencias Bibliográficas</li>`}
          ${captionItems.tables.length ? `<li class="toc-level-1">Índice de Tablas</li>` : ""}
          ${captionItems.figures.length ? `<li class="toc-level-1">Índice de Figuras y Gráficos</li>` : ""}
          <li class="toc-level-1">Anexos</li>
        </ol>
      </section>`
    : "";

  const tableIndex = captionItems.tables.length
    ? `<section class="document-sheet toc-sheet">
        <h1 class="toc-title">Índice de Tablas</h1>
        <ol class="toc-list">
          ${captionItems.tables.map(item => `<li class="toc-level-1">${esc(item)}</li>`).join("\n")}
        </ol>
      </section>`
    : "";

  const figureIndex = captionItems.figures.length
    ? `<section class="document-sheet toc-sheet">
        <h1 class="toc-title">Índice de Figuras y Gráficos</h1>
        <ol class="toc-list">
          ${captionItems.figures.map(item => `<li class="toc-level-1">${esc(item)}</li>`).join("\n")}
        </ol>
      </section>`
    : "";

  const bodyParts: string[] = [];
  for (const key of sortedKeys) {
    const content = phaseContents[key];
    if (!content?.trim()) continue;
    const label = phaseLabels[key] ?? "";
    const phaseIsBibliography = /bibliograf|referencias/i.test(label);
    const sections = isSingleFinalDocument ? splitMarkdownByChapters(content) : [content];
    sections.forEach((sectionContent) => {
      const pages = paginateMarkdown(sectionContent, capacity);
      pages.forEach((pageContent, pageIndex) => {
        const pageIsBibliography = phaseIsBibliography || /(^|\n)#{1,3}\s*(bibliograf|referencias)/i.test(pageContent);
        const pageTitle = pageIndex === 0 && label && !isSingleFinalDocument ? `<h1 class="doc-title">${esc(label)}</h1>` : "";
        bodyParts.push(
          `<section class="document-sheet content-sheet ${pageIsBibliography ? "bibliography references" : ""}">
            <span class="page-number ${pageNumPos}"></span>
            ${pageTitle}
            ${mdToHtml(pageContent)}
          </section>`
        );
      });
    });
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${titulo || "Documento Académico"}</title>
  <style>${css}</style>
</head>
<body class="${preview ? "document-preview-mode" : ""}">
  <section class="document-sheet cover-sheet">
    ${cover}
  </section>
  ${toc}
  ${tableIndex}
  ${figureIndex}
  ${bodyParts.join("\n")}
</body>
</html>`;
}
