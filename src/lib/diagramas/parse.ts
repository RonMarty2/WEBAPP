/**
 * Parser TOLERANTE de los bloques ```diagrama.
 *
 * Regla de oro: si algo viene mal de la IA, devolvemos `null` y el llamador
 * cae al placeholder de siempre. NUNCA lanza. NUNCA rompe el render ni el
 * export. Un diagrama malformado jamás debe tumbar el documento del estudiante.
 */

import {
  type DiagramaSpec,
  type GraficoDato,
  type GraficoVariante,
  LIMITES,
} from "./tipos";

const VARIANTES_GRAFICO: ReadonlySet<string> = new Set<GraficoVariante>([
  "barras",
  "lineas",
  "pastel",
]);

/** Sinónimos que la IA podría usar → variante canónica. */
const ALIAS_VARIANTE: Record<string, GraficoVariante> = {
  barras: "barras",
  barra: "barras",
  bar: "barras",
  columnas: "barras",
  lineas: "lineas",
  linea: "lineas",
  line: "lineas",
  pastel: "pastel",
  pie: "pastel",
  torta: "pastel",
  circular: "pastel",
};

function texto(v: unknown, max: number = LIMITES.etiqueta): string {
  if (typeof v !== "string") {
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    return "";
  }
  const limpio = v.replace(/\s+/g, " ").trim();
  return limpio.length > max ? `${limpio.slice(0, max - 1).trimEnd()}…` : limpio;
}

function listaTextos(v: unknown, maxItems: number): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => texto(x))
    .filter((s) => s.length > 0)
    .slice(0, maxItems);
}

function numero(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    // Acepta "12,5", "12.5", "1.200,50", "45%", "Bs 30"
    const limpio = v
      .replace(/[^\d,.\-]/g, "")
      .replace(/\.(?=\d{3}\b)/g, "") // separador de miles tipo 1.200
      .replace(",", ".");
    const n = parseFloat(limpio);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function esObjeto(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function normalizarDatos(v: unknown): GraficoDato[] {
  if (!Array.isArray(v)) return [];
  const out: GraficoDato[] = [];
  for (const item of v) {
    if (!esObjeto(item)) continue;
    const etiqueta = texto(item.etiqueta ?? item.label ?? item.nombre ?? item.categoria);
    const valor = numero(item.valor ?? item.value ?? item.y ?? item.cantidad);
    if (etiqueta.length === 0 || valor === null) continue;
    out.push({ etiqueta, valor });
    if (out.length >= LIMITES.graficoDatos) break;
  }
  return out;
}

/**
 * Convierte el contenido crudo de un bloque ```diagrama en un DiagramaSpec
 * validado, o `null` si no es interpretable.
 */
export function parseDiagrama(crudo: string): DiagramaSpec | null {
  if (typeof crudo !== "string" || crudo.trim().length === 0) return null;

  let data: unknown;
  try {
    data = JSON.parse(crudo);
  } catch {
    // Segundo intento: a veces la IA envuelve el JSON en texto. Extraemos el
    // primer objeto {...} balanceado de forma simple.
    const inicio = crudo.indexOf("{");
    const fin = crudo.lastIndexOf("}");
    if (inicio === -1 || fin <= inicio) return null;
    try {
      data = JSON.parse(crudo.slice(inicio, fin + 1));
    } catch {
      return null;
    }
  }

  if (!esObjeto(data)) return null;
  const tipo = texto(data.tipo).toLowerCase();

  if (tipo === "arbol-problemas" || tipo === "arbol" || tipo === "problemas") {
    const problema = texto(data.problema ?? data.central ?? data.problemaCentral);
    if (problema.length === 0) return null;
    const causas = listaTextos(data.causas, LIMITES.arbolNodos);
    const efectos = listaTextos(data.efectos ?? data.consecuencias, LIMITES.arbolNodos);
    if (causas.length === 0 && efectos.length === 0) return null;
    return {
      tipo: "arbol-problemas",
      problema,
      causas,
      efectos,
      titulo: texto(data.titulo) || undefined,
      fuente: texto(data.fuente) || undefined,
    };
  }

  if (tipo === "grafico" || tipo === "chart" || tipo === "grafica") {
    const varianteRaw = texto(data.variante ?? data.subtipo ?? data.kind).toLowerCase();
    const variante = ALIAS_VARIANTE[varianteRaw];
    if (!variante || !VARIANTES_GRAFICO.has(variante)) return null;
    const datos = normalizarDatos(data.datos ?? data.data ?? data.series);
    if (datos.length === 0) return null;
    return {
      tipo: "grafico",
      variante,
      datos,
      titulo: texto(data.titulo) || undefined,
      ejeX: texto(data.ejeX ?? data.ejex ?? data.xLabel) || undefined,
      ejeY: texto(data.ejeY ?? data.ejey ?? data.yLabel) || undefined,
      unidad: texto(data.unidad ?? data.unit, 8) || undefined,
      fuente: texto(data.fuente) || undefined,
    };
  }

  return null;
}
