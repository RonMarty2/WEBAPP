/**
 * Generador de HTML formal listo para pegar en Word.
 *
 * El render de pantalla usa Tailwind + componentes React. Eso se ve
 * lindo en web pero NO se pega bien en Word (Word ignora la mayoría de
 * clases CSS modernas).
 *
 * Esta función produce un HTML PARALELO con estilos INLINE clásicos
 * (font-family, font-size, font-weight, border, etc.) que Word entiende
 * y preserva.
 *
 * Cada universidad tiene su propia NORMA (tipografía, tamaño, interlineado,
 * márgenes, color, citas). El HTML generado respeta esas reglas para que
 * lo que el alumno copie al Word salga ya alineado con lo que pide su
 * tribunal — Times 12pt doble UMSS, Verdana 10pt 1.5 UNIFRANZ, Arial 11pt
 * EMI, etc.
 */

import type { BloqueNumerado } from "./numeracion";
import type { CitaUnica } from "./citas";
import { obtenerNorma, type NormaUniversitaria } from "./normas-universitarias";
import { parseDiagrama } from "@/lib/diagramas/parse";
import { diagramaASvg } from "@/lib/diagramas/svg";

export interface DatosCaratulaWord {
  titulo: string;
  universidad?: string;
  /** ID de la universidad para resolver la norma específica. */
  universidadId?: string;
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

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineWord(texto: string): string {
  let r = esc(texto);
  r = r.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  r = r.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, "<em>$1</em>");
  r = r.replace(/`([^`]+?)`/g, '<span style="font-family: Consolas, monospace; background: #f3f3f3; padding: 0 4px; border-radius: 3px;">$1</span>');
  return r;
}

function bloqueAWord(
  b: BloqueNumerado,
  norma: NormaUniversitaria,
  pngDiagramas?: Record<string, string>,
): string {
  const fuente = norma.fuenteWord;
  const color = norma.colorAcento;
  const baseSize = norma.tamanoBasePt;
  const align = norma.alineacion;
  // Líneas, tamaños y márgenes escalan respecto al tamaño base de la norma.
  const sizeH1 = Math.round(baseSize * 1.5);
  const sizeH2 = Math.round(baseSize * 1.17);
  const sizeH3 = baseSize;
  const sizeH4 = baseSize;
  const sizeFiguraCaption = Math.max(9, baseSize - 1);
  const sizeFuenteTabla = Math.max(9, baseSize - 1);
  const interlineado = norma.interlineado;

  switch (b.tipo) {
    case "h1":
      return `<h1 style="font-family: ${fuente}; font-size: ${sizeH1}pt; font-weight: bold; color: ${color}; text-align: center; margin: 36pt 0 18pt 0; page-break-before: always;">CAPÍTULO ${b.numero}<br/>${inlineWord(b.texto.toUpperCase())}</h1>`;
    case "h2":
      return `<h2 style="font-family: ${fuente}; font-size: ${sizeH2}pt; font-weight: bold; color: ${color}; margin: 18pt 0 9pt 0;">${b.numero ? b.numero + ". " : ""}${inlineWord(b.texto)}</h2>`;
    case "h3":
      return `<h3 style="font-family: ${fuente}; font-size: ${sizeH3}pt; font-weight: bold; color: ${color}; margin: 12pt 0 6pt 0;">${b.numero ? b.numero + ". " : ""}${inlineWord(b.texto)}</h3>`;
    case "h4":
      return `<h4 style="font-family: ${fuente}; font-size: ${sizeH4}pt; font-weight: bold; color: ${color}; margin: 9pt 0 4pt 0;">${b.numero ? b.numero + ". " : ""}${inlineWord(b.texto)}</h4>`;
    case "parrafo":
      return `<p style="font-family: ${fuente}; font-size: ${baseSize}pt; line-height: ${interlineado}; text-align: ${align}; margin: 0 0 12pt 0; text-indent: 1.25cm;">${inlineWord(b.texto)}</p>`;
    case "cita_bloque":
      return `<blockquote style="font-family: ${fuente}; font-size: ${Math.max(10, baseSize - 1)}pt; line-height: ${interlineado}; margin: 12pt 0 12pt 1.25cm; padding-left: 12pt; border-left: 3px solid ${color}; font-style: italic;">${inlineWord(b.texto)}</blockquote>`;
    case "lista": {
      const items = (b.items ?? []).map((it) => `<li style="margin-bottom: 4pt;">${inlineWord(it)}</li>`).join("");
      return `<ul style="font-family: ${fuente}; font-size: ${baseSize}pt; line-height: ${interlineado}; margin: 6pt 0 12pt 1.25cm;">${items}</ul>`;
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
<p style="font-family: ${fuente}; font-size: ${Math.max(10, baseSize - 1)}pt; font-weight: bold; margin: 0 0 6pt 0; text-align: center;">${b.numero ?? ""}${b.texto ? ": " + esc(b.texto) : ""}</p>
<table style="border-collapse: collapse; width: 100%; font-family: ${fuente}; font-size: ${sizeFuenteTabla}pt;">
<thead><tr>${headHtml}</tr></thead>
<tbody>${cuerpoHtml}</tbody>
</table>
<p style="font-family: ${fuente}; font-size: ${sizeFiguraCaption}pt; font-style: italic; margin: 4pt 0 0 0; text-align: center; color: #555;">Fuente: Elaboración propia con base en datos del estudio.</p>
</div>`;
    }
    case "figura": {
      const captionText = `${b.numero ?? ""}: ${esc(b.texto)}`;
      const captionSize = Math.max(10, baseSize - 1);
      if (b.lang === "diagrama" && b.raw) {
        const caption = `<p style="font-family: ${fuente}; font-size: ${captionSize}pt; font-weight: bold; margin: 6pt 0 0 0;">${captionText}</p>`;
        const png = b.id ? pngDiagramas?.[b.id] : undefined;
        if (png) {
          return `<div style="margin: 18pt 0; text-align: center;">
<img src="${png}" alt="${esc(b.texto)}" style="max-width: 90%; height: auto;" />
${caption}
</div>`;
        }
        // Respaldo: SVG inline (Word moderno lo abre; si no, el PNG de arriba
        // ya lo cubre cuando el rasterizado está disponible).
        const spec = parseDiagrama(b.raw);
        if (spec) {
          return `<div style="margin: 18pt 0; text-align: center;">
${diagramaASvg(spec, { sinTitulo: true })}
${caption}
</div>`;
        }
      }
      if (b.lang === "imagen" && b.raw) {
        return `<div style="margin: 18pt 0; text-align: center;">
<img src="${esc(b.raw)}" alt="${esc(b.texto)}" style="max-width: 80%; height: auto; border: 1px solid #ddd;" />
<p style="font-family: ${fuente}; font-size: ${Math.max(10, baseSize - 1)}pt; font-weight: bold; margin: 6pt 0 0 0;">${captionText}</p>
</div>`;
      }
      return `<div style="margin: 18pt 0; padding: 24pt; border: 1px dashed #999; text-align: center;">
<p style="font-family: ${fuente}; font-size: ${Math.max(10, baseSize - 1)}pt; font-weight: bold; margin: 0 0 6pt 0;">${captionText}</p>
<p style="font-family: ${fuente}; font-size: ${sizeFiguraCaption}pt; font-style: italic; color: #666; margin: 0;">[Reemplazar con el diagrama/gráfico vectorial generado en Word o herramienta visual.]</p>
</div>`;
    }
    case "code":
      return `<pre style="font-family: Consolas, monospace; font-size: 10pt; background: #f5f5f5; border: 1px solid #ddd; padding: 8pt; margin: 12pt 0; white-space: pre-wrap;">${esc(b.texto)}</pre>`;
    default:
      return "";
  }
}

/**
 * Genera el HTML completo del documento listo para Word, aplicando la
 * norma de la universidad indicada (tipografía, tamaño, márgenes,
 * interlineado, color de acento).
 */
export function generarHTMLParaWord(input: {
  caratula: DatosCaratulaWord;
  capitulos: CapituloParaExport[];
  bibliografia?: CitaUnica[];
  /** PNG (data URI) por id de bloque-figura, para embeber diagramas en Word. */
  pngDiagramas?: Record<string, string>;
}): string {
  const c = input.caratula;
  const norma = obtenerNorma(c.universidadId);
  const fuente = norma.fuenteWord;
  const baseSize = norma.tamanoBasePt;
  const interlineado = norma.interlineado;
  const margenes = norma.margenes;
  const color = norma.colorAcento;

  // Carátula — adopta los colores de portada si la norma los define
  // (UNIFRANZ por ejemplo: guindo + dorado).
  const portadaBg = norma.portadaColorFondo ?? "transparent";
  const portadaFg = norma.portadaColorTexto ?? color;

  const caratulaHtml = `
<div style="text-align: center; padding: 60pt 0; min-height: 600pt; page-break-after: always; background: ${portadaBg};">
${c.universidad ? `<p style="font-family: ${fuente}; font-size: ${baseSize + 4}pt; font-weight: bold; margin: 0 0 4pt 0; color: ${portadaFg};">${esc(c.universidad)}</p>` : ""}
${c.facultad ? `<p style="font-family: ${fuente}; font-size: ${baseSize + 1}pt; margin: 0 0 4pt 0; color: ${portadaFg};">${esc(c.facultad)}</p>` : ""}
${c.carrera ? `<p style="font-family: ${fuente}; font-size: ${baseSize}pt; margin: 0 0 36pt 0; color: ${portadaFg};">${esc(c.carrera)}</p>` : ""}
<p style="font-family: ${fuente}; font-size: ${baseSize + 10}pt; font-weight: bold; margin: 60pt 0 24pt 0; line-height: 1.4; color: ${portadaFg};">${esc(c.titulo)}</p>
${c.modalidad ? `<p style="font-family: ${fuente}; font-size: ${baseSize}pt; font-style: italic; margin: 12pt 0; color: ${portadaFg};">${esc(c.modalidad)}</p>` : ""}
<div style="margin-top: 96pt; font-family: ${fuente}; font-size: ${baseSize}pt; line-height: 1.8; color: ${portadaFg};">
${c.estudiante ? `<p style="margin: 0;"><strong>Por:</strong> ${esc(c.estudiante)}</p>` : ""}
${c.tutor ? `<p style="margin: 0;"><strong>Tutor:</strong> ${esc(c.tutor)}</p>` : ""}
</div>
<p style="font-family: ${fuente}; font-size: ${baseSize}pt; margin: 48pt 0 0 0; color: ${portadaFg};">${esc(c.ciudad ?? "Bolivia")} – ${esc(String(c.ano ?? new Date().getFullYear()))}</p>
</div>
`;

  // Índice
  const indiceEntradas: string[] = [];
  for (const cap of input.capitulos) {
    for (const b of cap.bloques) {
      if (b.tipo === "h1") {
        indiceEntradas.push(
          `<li style="margin: 6pt 0; font-weight: bold; color: ${color};">CAPÍTULO ${b.numero}. ${esc(b.texto.toUpperCase())}</li>`,
        );
      } else if (b.tipo === "h2") {
        indiceEntradas.push(
          `<li style="margin: 3pt 0 3pt 18pt;">${b.numero ?? ""}. ${esc(b.texto)}</li>`,
        );
      } else if (b.tipo === "h3") {
        indiceEntradas.push(
          `<li style="margin: 2pt 0 2pt 36pt; font-size: ${Math.max(10, baseSize - 1)}pt;">${b.numero ?? ""}. ${esc(b.texto)}</li>`,
        );
      }
    }
  }
  const indiceHtml = `
<div style="page-break-after: always;">
<h1 style="font-family: ${fuente}; font-size: ${baseSize + 6}pt; font-weight: bold; text-align: center; margin: 0 0 24pt 0; color: ${color};">ÍNDICE</h1>
<ul style="font-family: ${fuente}; font-size: ${baseSize}pt; line-height: 1.6; list-style: none; padding-left: 0;">
${indiceEntradas.join("\n")}
</ul>
</div>
`;

  const capitulosHtml = input.capitulos
    .map((cap) => cap.bloques.map((b) => bloqueAWord(b, norma, input.pngDiagramas)).join("\n"))
    .join("\n");

  let bibHtml = "";
  if (input.bibliografia && input.bibliografia.length > 0) {
    const items = input.bibliografia
      .map(
        (cita) =>
          `<li style="margin: 6pt 0; text-indent: -${norma.sangriaFrancesaEm}em; padding-left: ${norma.sangriaFrancesaEm}em; font-family: ${fuente}; font-size: ${Math.max(10, baseSize - 1)}pt; line-height: ${interlineado};">${esc(cita.texto_display)}</li>`,
      )
      .join("\n");
    const tituloBib = norma.citas === "iso690" ? "REFERENCIAS BIBLIOGRÁFICAS (ISO 690)" : norma.citas === "vancouver" ? "REFERENCIAS BIBLIOGRÁFICAS (Vancouver)" : "REFERENCIAS BIBLIOGRÁFICAS";
    bibHtml = `
<div style="page-break-before: always;">
<h1 style="font-family: ${fuente}; font-size: ${baseSize + 6}pt; font-weight: bold; text-align: center; margin: 36pt 0 18pt 0; color: ${color};">${tituloBib}</h1>
<ol style="font-family: ${fuente}; font-size: ${Math.max(10, baseSize - 1)}pt; padding-left: 0; list-style: none;">
${items}
</ol>
<p style="font-family: ${fuente}; font-size: ${Math.max(9, baseSize - 2)}pt; font-style: italic; color: #666; margin-top: 18pt;">
${esc(norma.notaNorma)}
</p>
</div>
`;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${esc(c.titulo)}</title>
<style>
@page { size: A4; margin: ${margenes.arriba}cm ${margenes.derecha}cm ${margenes.abajo}cm ${margenes.izquierda}cm; }
body { font-family: ${fuente}; font-size: ${baseSize}pt; line-height: ${interlineado}; color: #000; margin: 0; padding: 0; }
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
