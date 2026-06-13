"use client";

/**
 * Generador de Word .docx AUTÉNTICO (no el truco HTML-como-.doc).
 *
 * Produce un documento Word de verdad con:
 *   - Índice automático (campo TOC) que Word actualiza con números de página.
 *   - Estilos de título APA 7 (niveles 1-4) para que el índice los recoja.
 *   - Carátula UMSS, numeración de página arriba-derecha, márgenes/fuente/
 *     interlineado de la norma de la universidad.
 *   - Tablas estilo APA (bordes horizontales) con caption (Tabla N + título).
 *   - Diagramas/gráficos rasterizados a PNG e insertados como imagen real.
 *   - Bibliografía con sangría francesa.
 *
 * Se genera en el cliente (Packer.toBlob) reutilizando los bloques que el
 * documento-web ya parseó. Es JavaScript puro: funciona en Vercel.
 */

import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, TableOfContents,
  PageNumber, Header, ImageRun, convertMillimetersToTwip, type ISectionOptions,
} from "docx";
import type { BloqueNumerado } from "./numeracion";
import type { CitaUnica } from "./citas";
import { obtenerNorma } from "./normas-universitarias";
import type { CapituloParaExport, DatosCaratulaWord } from "./exportar-word";
import { parseDiagrama } from "@/lib/diagramas/parse";
import { diagramaASvg } from "@/lib/diagramas/svg";
import { svgAPng } from "@/lib/diagramas/rasterizar";

const NEGRO = "000000";

/** Convierte **negrita** / *itálica* de un texto a TextRun[] con esa fuente/tamaño. */
function runsInline(texto: string, font: string, size: number): TextRun[] {
  const runs: TextRun[] = [];
  // Divide por **bold** y *italic* manteniendo el orden.
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto)) !== null) {
    if (m.index > last) runs.push(new TextRun({ text: texto.slice(last, m.index), font, size }));
    const tok = m[0];
    if (tok.startsWith("**")) runs.push(new TextRun({ text: tok.slice(2, -2), bold: true, font, size }));
    else runs.push(new TextRun({ text: tok.slice(1, -1), italics: true, font, size }));
    last = m.index + tok.length;
  }
  if (last < texto.length) runs.push(new TextRun({ text: texto.slice(last), font, size }));
  return runs.length > 0 ? runs : [new TextRun({ text: texto, font, size })];
}

/** dataURL PNG → Uint8Array para ImageRun. */
function dataUrlAUint8(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const bin = atob(base64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

interface DocxInput {
  caratula: DatosCaratulaWord;
  capitulos: CapituloParaExport[];
  bibliografia?: CitaUnica[];
}

/**
 * Genera el .docx y devuelve un Blob listo para descargar.
 */
export async function generarDocx(input: DocxInput): Promise<Blob> {
  const c = input.caratula;
  const norma = obtenerNorma(c.universidadId);
  const font = norma.fuenteWord.split(",")[0].replace(/["']/g, "").trim() || "Times New Roman";
  const size = norma.tamanoBasePt * 2;                 // half-points (12pt → 24)
  const line = Math.round(norma.interlineado * 240);   // doble = 480
  const margen = (cm?: number) => convertMillimetersToTwip((cm ?? 2.54) * 10);

  // ── Carátula (centrada, sin numeración) ──────────────────────────────────
  const center = (text: string, opts: { size?: number; bold?: boolean; italics?: boolean; spaceAfter?: number } = {}) =>
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line, after: opts.spaceAfter ?? 120 },
      children: [new TextRun({ text, bold: opts.bold ?? false, italics: opts.italics ?? false, font, size: opts.size ?? size })],
    });

  const caratula: Paragraph[] = [];
  if (c.universidad) caratula.push(center(c.universidad, { bold: true, size: size + 4, spaceAfter: 40 }));
  if (c.facultad) caratula.push(center(c.facultad, { bold: true, spaceAfter: 40 }));
  caratula.push(center("Departamento de Posgrado", { bold: true, spaceAfter: 600 }));
  if (c.modalidad) caratula.push(center(c.modalidad, { bold: true, spaceAfter: 200 }));
  caratula.push(center("MONOGRAFÍA", { bold: true, size: size + 4, spaceAfter: 400 }));
  caratula.push(center((c.titulo ?? "").toUpperCase(), { bold: true, size: size + 2, spaceAfter: 600 }));
  if (c.estudiante) caratula.push(center(`Estudiante: ${c.estudiante}`, { bold: true, spaceAfter: 40 }));
  if (c.tutor) caratula.push(center(`Tutor: ${c.tutor}`, { spaceAfter: 600 }));
  caratula.push(center(`${c.ciudad ?? "Cochabamba"} – Bolivia`, { bold: true, spaceAfter: 40 }));
  caratula.push(center(String(c.ano ?? new Date().getFullYear()), { bold: true }));

  // ── Cuerpo: TOC + capítulos + bibliografía ───────────────────────────────
  const cuerpo: (Paragraph | Table | TableOfContents)[] = [];

  cuerpo.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line, after: 240 }, children: [new TextRun({ text: "ÍNDICE", bold: true, font, size })] }));
  cuerpo.push(new TableOfContents("Índice", { hyperlink: true, headingStyleRange: "1-4" }));
  cuerpo.push(new Paragraph({ children: [], pageBreakBefore: true }));

  const headingNivel = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4];

  for (const cap of input.capitulos) {
    for (const b of cap.bloques) {
      if (b.tipo === "h1" || b.tipo === "h2" || b.tipo === "h3" || b.tipo === "h4") {
        const nivel = Number(b.tipo[1]) - 1;
        const esCap = b.tipo === "h1";
        const texto = esCap
          ? `CAPÍTULO ${b.numero ?? ""}: ${b.texto.toUpperCase()}`
          : `${b.numero ? b.numero + " " : ""}${b.texto}`;
        cuerpo.push(new Paragraph({
          heading: headingNivel[nivel],
          alignment: esCap ? AlignmentType.CENTER : AlignmentType.LEFT,
          spacing: { line, before: esCap ? 360 : 200, after: 120 },
          pageBreakBefore: esCap,
          children: [new TextRun({ text: texto, bold: true, italics: nivel >= 2, font, size, color: NEGRO })],
        }));
      } else if (b.tipo === "parrafo") {
        cuerpo.push(new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { line },
          indent: { firstLine: convertMillimetersToTwip(12.7) },
          children: runsInline(b.texto, font, size),
        }));
      } else if (b.tipo === "cita_bloque") {
        cuerpo.push(new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { line },
          indent: { left: convertMillimetersToTwip(12.7) },
          children: [new TextRun({ text: b.texto, italics: true, font, size })],
        }));
      } else if (b.tipo === "lista" && b.items) {
        for (const it of b.items) {
          cuerpo.push(new Paragraph({ bullet: { level: 0 }, spacing: { line }, children: runsInline(it, font, size) }));
        }
      } else if (b.tipo === "tabla" && b.filas && b.filas.length > 0) {
        // Caption APA: "Tabla N" en negrita + título en cursiva.
        cuerpo.push(new Paragraph({
          spacing: { line, before: 160, after: 40 },
          children: [
            new TextRun({ text: b.numero ?? "Tabla", bold: true, font, size }),
            ...(b.texto ? [new TextRun({ text: `. ${b.texto}`, italics: true, font, size })] : []),
          ],
        }));
        cuerpo.push(tablaApa(b.filas, font, size));
        cuerpo.push(new Paragraph({ spacing: { line, after: 120 }, children: [new TextRun({ text: "Fuente: Elaboración propia con base en datos del estudio.", italics: true, font, size: size - 2 })] }));
      } else if (b.tipo === "figura") {
        const fig = await figuraADocx(b, font, size);
        cuerpo.push(...fig);
      }
    }
  }

  // Bibliografía
  if (input.bibliografia && input.bibliografia.length > 0) {
    cuerpo.push(new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, pageBreakBefore: true, spacing: { line, after: 160 }, children: [new TextRun({ text: "REFERENCIAS BIBLIOGRÁFICAS", bold: true, font, size, color: NEGRO })] }));
    for (const ref of input.bibliografia) {
      cuerpo.push(new Paragraph({
        spacing: { line },
        indent: { left: convertMillimetersToTwip(12.7), hanging: convertMillimetersToTwip(12.7) },
        children: runsInline(ref.texto_display, font, size),
      }));
    }
  }

  const seccionCaratula: ISectionOptions = {
    properties: { page: { margin: { top: margen(norma.margenes.arriba), right: margen(norma.margenes.derecha), bottom: margen(norma.margenes.abajo), left: margen(norma.margenes.izquierda) } } },
    children: caratula,
  };
  const seccionCuerpo: ISectionOptions = {
    properties: { page: { margin: { top: margen(norma.margenes.arriba), right: margen(norma.margenes.derecha), bottom: margen(norma.margenes.abajo), left: margen(norma.margenes.izquierda) }, pageNumbers: { start: 1 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT], font, size })] })] }) },
    children: cuerpo,
  };

  const doc = new Document({
    features: { updateFields: true }, // Word actualiza el índice al abrir
    styles: {
      default: { document: { run: { font, size }, paragraph: { spacing: { line } } } },
    },
    sections: [seccionCaratula, seccionCuerpo],
  });

  return Packer.toBlob(doc);
}

/** Tabla estilo APA: bordes horizontales (arriba, bajo encabezado, abajo). */
function tablaApa(filas: string[][], font: string, size: number): Table {
  const borderH = { style: BorderStyle.SINGLE, size: 4, color: NEGRO };
  const borderNone = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const header = filas[0] ?? [];
  const cuerpo = filas.slice(1);

  const celda = (texto: string, bold: boolean, conBordeAbajo: boolean) =>
    new TableCell({
      borders: { top: borderNone, bottom: conBordeAbajo ? borderH : borderNone, left: borderNone, right: borderNone },
      children: [new Paragraph({ spacing: { line: 240 }, children: [new TextRun({ text: texto.replace(/\*\*/g, ""), bold, font, size: size - 2 })] })],
    });

  const filaHeader = new TableRow({ children: header.map((h) => celda(h, true, true)) });
  const filasCuerpo = cuerpo.map((fila) =>
    new TableRow({ children: fila.map((cel) => celda(cel, false, false)) }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: borderH, bottom: borderH, left: borderNone, right: borderNone, insideHorizontal: borderNone, insideVertical: borderNone },
    rows: [filaHeader, ...filasCuerpo],
  });
}

/** Figura: diagrama → PNG embebido; imagen → embebida; otra → caption. */
async function figuraADocx(b: BloqueNumerado, font: string, size: number): Promise<Paragraph[]> {
  const caption = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { line, before: 120, after: 40 },
    children: [
      new TextRun({ text: b.numero ?? "Gráfico", bold: true, font, size }),
      ...(b.texto ? [new TextRun({ text: `. ${b.texto}`, italics: true, font, size })] : []),
    ],
  });

  if (b.lang === "diagrama" && b.raw) {
    const spec = parseDiagrama(b.raw);
    if (spec) {
      try {
        const svg = diagramaASvg(spec, { sinTitulo: true });
        const png = await svgAPng(svg, 2);
        if (png) {
          const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
          const W = vb ? parseFloat(vb[1]) : 640;
          const H = vb ? parseFloat(vb[2]) : 400;
          const ancho = 440;
          const alto = Math.round((ancho * H) / W);
          return [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 120 },
              children: [new ImageRun({ type: "png", data: dataUrlAUint8(png), transformation: { width: ancho, height: alto } })],
            }),
            caption,
          ];
        }
      } catch { /* cae al caption */ }
    }
  }
  // Sin imagen renderizable: solo el caption.
  return [caption];
}

// `line` global para helpers (se recalcula por documento, pero el interlineado
// estándar UMSS es doble; los helpers de figura usan el del documento via cierre
// no es posible, así que usamos 480 por defecto aquí).
const line = 480;
