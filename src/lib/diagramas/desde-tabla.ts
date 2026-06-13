/**
 * Conversión TABLA → GRÁFICO **solo a nivel de render**.
 *
 * Detecta automáticamente las tablas de frecuencias/datos numéricos que la
 * IA ya emitió en el markdown del estudiante y deriva un GraficoSpec a
 * partir de ESOS MISMOS números. El markdown guardado NO se toca: la tabla
 * sigue ahí intacta; el gráfico se dibuja al vuelo debajo, en pantalla y en
 * la descarga Word.
 *
 * Pensado para documentos ya redactados/aprobados donde regenerar fases
 * destruiría el trabajo del estudiante. Solo aplica cuando la tabla es
 * CLARAMENTE graficable (categorías + columna numérica reconocible); si
 * la tabla es de texto/diseño, devuelve null y no se dibuja nada.
 */

import type { GraficoSpec, GraficoVariante, GraficoDato } from "./tipos";
import { LIMITES } from "./tipos";

/** Convierte "45", "38,5%", "Bs 1.200,50" → número, o null si no es numérico. */
function parseNumero(s: string): number | null {
  if (typeof s !== "string") return null;
  const limpio = s
    .replace(/\*\*/g, "")
    .replace(/[^\d,.\-]/g, "")
    .replace(/\.(?=\d{3}\b)/g, "") // miles 1.200 → 1200
    .replace(",", ".");
  if (limpio.length === 0) return null;
  const n = parseFloat(limpio);
  return Number.isFinite(n) ? n : null;
}

function limpiar(s: string): string {
  return (s ?? "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}

/** Reconoce filas tipo "Total", "Suma", etc. para excluirlas del gráfico. */
function esFilaTotal(fila: string[]): boolean {
  const primera = limpiar(fila[0] ?? "").toLowerCase();
  return /^(total|suma|gran total|n\s*=)/i.test(primera);
}

const MESES_RE = /^(ene|feb|mar|abr|may|jun|jul|ago|sep|set|oct|nov|dic|q[1-4]|t[1-4]|\d{4}|\d{1,2}[/-]\d{2,4})/i;

/**
 * Intenta derivar un GraficoSpec de las filas de una tabla. Devuelve `null`
 * si la tabla no es claramente graficable (poca data, sin columna numérica,
 * etiquetas largas, etc.).
 */
export function tablaAGrafico(filas: string[][], captionTabla?: string): GraficoSpec | null {
  if (!Array.isArray(filas) || filas.length < 3) return null;
  const header = filas[0].map(limpiar);
  const cuerpo = filas.slice(1).filter((f) => !esFilaTotal(f));
  if (cuerpo.length < 2 || cuerpo.length > LIMITES.graficoDatos) return null;

  // Necesitamos AL MENOS 2 columnas (etiqueta + valor).
  if (header.length < 2) return null;

  // Elegir columna de valor numérico. Prioridad:
  //   1) "Porcentaje" / "%"
  //   2) "Frecuencia" / "Cantidad" / "n"
  //   3) la última columna que sea numérica en ≥80% de las filas.
  const idxPct = header.findIndex((h) => /porcentaje|^%|\(%\)/i.test(h));
  const idxFreq = header.findIndex((h) => /frecuencia|cantidad|conteo|cuenta|n[ºo°]?$|^n$/i.test(h));

  function esColumnaNumerica(idx: number): boolean {
    if (idx <= 0 || idx >= header.length) return false;
    let ok = 0;
    for (const fila of cuerpo) {
      if (parseNumero(fila[idx] ?? "") !== null) ok++;
    }
    return ok / cuerpo.length >= 0.8;
  }

  let idxValor = -1;
  if (idxPct > 0 && esColumnaNumerica(idxPct)) idxValor = idxPct;
  else if (idxFreq > 0 && esColumnaNumerica(idxFreq)) idxValor = idxFreq;
  else {
    // Recorre de derecha a izquierda buscando una columna numérica.
    for (let j = header.length - 1; j >= 1; j--) {
      if (esColumnaNumerica(j)) { idxValor = j; break; }
    }
  }
  if (idxValor < 0) return null;

  // Etiquetas: siempre la columna 0. Si está vacía/numérica, abortar.
  const datos: GraficoDato[] = [];
  for (const fila of cuerpo) {
    const etiqueta = limpiar(fila[0] ?? "");
    if (!etiqueta) continue;
    if (etiqueta.length > 50) return null; // tabla de prosa, no para graficar
    const valor = parseNumero(fila[idxValor] ?? "");
    if (valor === null) continue;
    datos.push({ etiqueta, valor });
  }
  if (datos.length < 2) return null;

  // Elegir variante.
  const total = datos.reduce((s, d) => s + d.valor, 0);
  const cercaDe100 = idxPct > 0 && Math.abs(total - 100) <= 3;
  const etiquetasTemporales =
    datos.every((d) => MESES_RE.test(d.etiqueta)) && datos.length >= 3;

  const variante: GraficoVariante =
    cercaDe100 && datos.length <= 7 ? "pastel" :
    etiquetasTemporales ? "lineas" :
    "barras";

  // Título: usa el caption de la tabla si existe, recortando "Tabla N:" o
  // "Datos del estudio" (placeholder por defecto del parser).
  const tituloLimpio =
    captionTabla && !/^datos del estudio$/i.test(captionTabla)
      ? captionTabla.replace(/^Tabla\s+[\d.]+\s*[:.\-]?\s*/i, "").trim()
      : undefined;

  return {
    tipo: "grafico",
    variante,
    titulo: tituloLimpio,
    unidad: idxValor === idxPct ? "%" : undefined,
    ejeY: variante === "pastel" ? undefined : header[idxValor],
    datos,
  };
}
