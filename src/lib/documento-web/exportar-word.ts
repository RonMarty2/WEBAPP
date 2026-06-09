/**
 * Generador de HTML formal listo para pegar en Word.
 *
 * El render de pantalla usa Tailwind + componentes React. Eso se ve
 * lindo en web pero NO se pega bien en Word (Word ignora la mayoría de
 * clases CSS modernas).
 *
 * Esta función produce un HTML PARALELO con estilos INLINE clásicos
 * (font-family, font-size, font-weight, border, etc.) que Word entiende
 * y preserva: tipografía Times New Roman, márgenes razonables, tablas
 * con borde 1px, numeración expandida, jerarquía de encabezados.
 *
 * El alumno hace Ctrl+V en Word → ve su documento formateado.
 */

import type { BloqueNumerado } from "./numeracion";
import type { CitaUnica } from "./citas";

export interface DatosCaratulaWord {
  titulo: string;
  universidad?: string;
  facultad?: string;
  carrera?: string;
  modalidad?: string;
  estudiante?: string;
  tutor?: string;
  ciudad?: string;
  ano?: number | string;
}

export interface CapituloParaExport {
  label: string;
  bloques: BloqueNumerado[];
}

const FUENTE = '"Times New Roman", Times, serif';
const FUENTE_TITULO = '"Times New Roman", Times, serif';
const COLOR_TEXTO = "#000";
const COLOR_HEADER = "#0c1e44";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Renderiza inline markdown: **negrita**, *cursiva*, `code`, citas.
 */
function inlineWord(texto: string): string {
  let r = esc(texto);
  // Negritas
  r = r.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Cursiva
  r = r.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, "<em>$1</em>");
  // Código inline
  r = r.replace(/`([^`]+?)`/g, '<span style="font-family: Consolas, monospace; background: #f3f3f3; padding: 0 4px; border-radius: 3px;">$1</span>');
  return r;
}

function bloqueAWord(b: BloqueNumerado): string {
  switch (b.tipo) {
    case "h1":
      return `<h1 style="font-family: ${FUENTE_TITULO}; font-size: 18pt; font-weight: bold; color: ${COLOR_HEADER}; text-align: center; margin: 36pt 0 18pt 0; page-break-before: always;">CAPÍTULO ${b.numero}<br/>${inlineWord(b.texto.toUpperCase())}</h1>`;
    case "h2":
      return `<h2 style="font-family: ${FUENTE_TITULO}; font-size: 14pt; font-weight: bold; color: ${COLOR_HEADER}; margin: 18pt 0 9pt 0;">${b.numero ? b.numero + ". " : ""}${inlineWord(b.texto)}</h2>`;
    case "h3":
      return `<h3 style="font-family: ${FUENTE_TITULO}; font-size: 12pt; font-weight: bold; color: ${COLOR_HEADER}; margin: 12pt 0 6pt 0;">${b.numero ? b.numero + ". " : ""}${inlineWord(b.texto)}</h3>`;
    case "h4":
      return `<h4 style="font-family: ${FUENTE_TITULO}; font-size: 11pt; font-weight: bold; color: ${COLOR_HEADER}; margin: 9pt 0 4pt 0;">${b.numero ? b.numero + ". " : ""}${inlineWord(b.texto)}</h4>`;
    case "parrafo":
      return `<p style="font-family: ${FUENTE}; font-size: 12pt; line-height: 1.5; text-align: justify; margin: 0 0 12pt 0; text-indent: 1.25cm;">${inlineWord(b.texto)}</p>`;
    case "cita_bloque":
      return `<blockquote style="font-family: ${FUENTE}; font-size: 11pt; line-height: 1.5; margin: 12pt 0 12pt 1.25cm; padding-left: 12pt; border-left: 3px solid #0c1e44; font-style: italic;">${inlineWord(b.texto)}</blockquote>`;
    case "lista": {
      const items = (b.items ?? []).map((it) => `<li style="margin-bottom: 4pt;">${inlineWord(it)}</li>`).join("");
      return `<ul style="font-family: ${FUENTE}; font-size: 12pt; line-height: 1.5; margin: 6pt 0 12pt 1.25cm;">${items}</ul>`;
    }
    case "tabla": {
      const filas = b.filas ?? [];
      if (filas.length === 0) return "";
      const header = filas[0];
      const cuerpo = filas.slice(1);
      const headHtml = header.map((c) => `<th style="border: 1px solid #333; padding: 6pt 8pt; background: #e8eaf6; font-weight: bold; text-align: left;">${inlineWord(c)}</th>`).join("");
      const cuerpoHtml = cuerpo
        .map((fila) =>
          `<tr>${fila.map((c) => `<td style="border: 1px solid #333; padding: 6pt 8pt; vertical-align: top;">${inlineWord(c)}</td>`).join("")}</tr>`,
        )
        .join("");
      return `<div style="margin: 18pt 0;">
<p style="font-family: ${FUENTE}; font-size: 11pt; font-weight: bold; margin: 0 0 6pt 0; text-align: center;">${b.numero ?? ""}${b.texto ? ": " + esc(b.texto) : ""}</p>
<table style="border-collapse: collapse; width: 100%; font-family: ${FUENTE}; font-size: 11pt;">
<thead><tr>${headHtml}</tr></thead>
<tbody>${cuerpoHtml}</tbody>
</table>
<p style="font-family: ${FUENTE}; font-size: 10pt; font-style: italic; margin: 4pt 0 0 0; text-align: center; color: #555;">Fuente: Elaboración propia con base en datos del estudio.</p>
</div>`;
    }
    case "figura": {
      const captionText = `${b.numero ?? ""}: ${esc(b.texto)}`;
      if (b.lang === "imagen" && b.raw) {
        return `<div style="margin: 18pt 0; text-align: center;">
<img src="${esc(b.raw)}" alt="${esc(b.texto)}" style="max-width: 80%; height: auto; border: 1px solid #ddd;" />
<p style="font-family: ${FUENTE}; font-size: 11pt; font-weight: bold; margin: 6pt 0 0 0;">${captionText}</p>
</div>`;
      }
      // Figura tipo diagrama (TikZ, PGFPlots, etc.) — placeholder visual.
      return `<div style="margin: 18pt 0; padding: 24pt; border: 1px dashed #999; text-align: center;">
<p style="font-family: ${FUENTE}; font-size: 11pt; font-weight: bold; margin: 0 0 6pt 0;">${captionText}</p>
<p style="font-family: ${FUENTE}; font-size: 10pt; font-style: italic; color: #666; margin: 0;">[Reemplazar con el diagrama/gráfico vectorial generado en Word o herramienta visual.]</p>
</div>`;
    }
    case "code":
      return `<pre style="font-family: Consolas, monospace; font-size: 10pt; background: #f5f5f5; border: 1px solid #ddd; padding: 8pt; margin: 12pt 0; white-space: pre-wrap;">${esc(b.texto)}</pre>`;
    default:
      return "";
  }
}

/**
 * Genera el HTML completo del documento listo para Word: carátula +
 * índice + capítulos + bibliografía.
 */
export function generarHTMLParaWord(input: {
  caratula: DatosCaratulaWord;
  capitulos: CapituloParaExport[];
  bibliografia?: CitaUnica[];
}): string {
  const c = input.caratula;

  // Carátula
  const caratulaHtml = `
<div style="text-align: center; padding: 60pt 0; min-height: 600pt; page-break-after: always;">
${c.universidad ? `<p style="font-family: ${FUENTE_TITULO}; font-size: 16pt; font-weight: bold; margin: 0 0 4pt 0;">${esc(c.universidad)}</p>` : ""}
${c.facultad ? `<p style="font-family: ${FUENTE_TITULO}; font-size: 13pt; margin: 0 0 4pt 0;">${esc(c.facultad)}</p>` : ""}
${c.carrera ? `<p style="font-family: ${FUENTE_TITULO}; font-size: 12pt; margin: 0 0 36pt 0;">${esc(c.carrera)}</p>` : ""}
<p style="font-family: ${FUENTE_TITULO}; font-size: 22pt; font-weight: bold; margin: 60pt 0 24pt 0; line-height: 1.4;">${esc(c.titulo)}</p>
${c.modalidad ? `<p style="font-family: ${FUENTE}; font-size: 12pt; font-style: italic; margin: 12pt 0;">${esc(c.modalidad)}</p>` : ""}
<div style="margin-top: 96pt; font-family: ${FUENTE}; font-size: 12pt; line-height: 1.8;">
${c.estudiante ? `<p style="margin: 0;"><strong>Por:</strong> ${esc(c.estudiante)}</p>` : ""}
${c.tutor ? `<p style="margin: 0;"><strong>Tutor:</strong> ${esc(c.tutor)}</p>` : ""}
</div>
<p style="font-family: ${FUENTE}; font-size: 12pt; margin: 48pt 0 0 0;">${esc(c.ciudad ?? "Bolivia")} – ${esc(String(c.ano ?? new Date().getFullYear()))}</p>
</div>
`;

  // Índice
  const indiceEntradas: string[] = [];
  for (const cap of input.capitulos) {
    for (const b of cap.bloques) {
      if (b.tipo === "h1") {
        indiceEntradas.push(
          `<li style="margin: 6pt 0; font-weight: bold;">CAPÍTULO ${b.numero}. ${esc(b.texto.toUpperCase())}</li>`,
        );
      } else if (b.tipo === "h2") {
        indiceEntradas.push(
          `<li style="margin: 3pt 0 3pt 18pt;">${b.numero ?? ""}. ${esc(b.texto)}</li>`,
        );
      } else if (b.tipo === "h3") {
        indiceEntradas.push(
          `<li style="margin: 2pt 0 2pt 36pt; font-size: 11pt;">${b.numero ?? ""}. ${esc(b.texto)}</li>`,
        );
      }
    }
  }
  const indiceHtml = `
<div style="page-break-after: always;">
<h1 style="font-family: ${FUENTE_TITULO}; font-size: 18pt; font-weight: bold; text-align: center; margin: 0 0 24pt 0;">ÍNDICE</h1>
<ul style="font-family: ${FUENTE}; font-size: 12pt; line-height: 1.6; list-style: none; padding-left: 0;">
${indiceEntradas.join("\n")}
</ul>
</div>
`;

  // Capítulos
  const capitulosHtml = input.capitulos
    .map((cap) => cap.bloques.map(bloqueAWord).join("\n"))
    .join("\n");

  // Bibliografía
  let bibHtml = "";
  if (input.bibliografia && input.bibliografia.length > 0) {
    const items = input.bibliografia
      .map(
        (c) =>
          `<li style="margin: 6pt 0; text-indent: -1.25cm; padding-left: 1.25cm; font-family: ${FUENTE}; font-size: 11pt; line-height: 1.5;">${esc(c.texto_display)}</li>`,
      )
      .join("\n");
    bibHtml = `
<div style="page-break-before: always;">
<h1 style="font-family: ${FUENTE_TITULO}; font-size: 18pt; font-weight: bold; text-align: center; margin: 36pt 0 18pt 0;">REFERENCIAS BIBLIOGRÁFICAS</h1>
<ol style="font-family: ${FUENTE}; font-size: 11pt; padding-left: 0; list-style: none;">
${items}
</ol>
</div>
`;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${esc(c.titulo)}</title>
<style>
@page { size: A4; margin: 2.5cm 3cm 2.5cm 3cm; }
body { font-family: ${FUENTE}; font-size: 12pt; line-height: 1.5; color: ${COLOR_TEXTO}; margin: 0; padding: 0; }
* { box-sizing: border-box; }
</style>
</head>
<body>
${caratulaHtml}
${indiceHtml}
${capitulosHtml}
${bibHtml}
</body>
</html>`;
}
