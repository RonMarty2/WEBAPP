/**
 * Contrato de datos de los diagramas académicos.
 *
 * UNA sola fuente de verdad: la IA emite un bloque ```diagrama con este JSON
 * y de ahí salen los TRES destinos (sin que ninguno "interprete" distinto):
 *
 *   - Pantalla / celular  → SVG (src/lib/diagramas/svg.ts)
 *   - Descarga Word        → el MISMO SVG embebido como imagen
 *   - Export LaTeX → PDF   → TikZ / pgfplots (src/lib/diagramas/tikz.ts)
 *
 * Por eso el formato es SEMÁNTICO (qué representa) y no visual (cómo se ve):
 * cada destino sabe cómo dibujarlo. Es lo que permite que "funcione siempre"
 * y se vea igual en los tres lados.
 *
 * Aplica a TODOS los tipos de proyecto (monografía, tesis, proyecto de grado,
 * guiada/automática) porque todos pasan por el mismo render y el mismo export.
 */

/** Árbol de problemas: causas (raíces) → problema central (tronco) → efectos (copa). */
export interface ArbolProblemasSpec {
  tipo: "arbol-problemas";
  /** Título opcional de la figura (ej. "Árbol de problemas"). */
  titulo?: string;
  /** Problema central. Va en el tronco, al medio. */
  problema: string;
  /** Causas del problema. Se dibujan abajo (raíces), apuntan hacia arriba. */
  causas: string[];
  /** Efectos/consecuencias. Se dibujan arriba (copa). */
  efectos: string[];
  /** Fuente opcional (ej. "Elaboración propia"). */
  fuente?: string;
}

export type GraficoVariante = "barras" | "lineas" | "pastel";

export interface GraficoDato {
  etiqueta: string;
  valor: number;
}

/** Gráfico de datos: barras, líneas o pastel (una serie). */
export interface GraficoSpec {
  tipo: "grafico";
  variante: GraficoVariante;
  /** Título de la figura (ej. "Distribución por edad"). */
  titulo?: string;
  /** Rótulo del eje X (barras/líneas). */
  ejeX?: string;
  /** Rótulo del eje Y (barras/líneas). */
  ejeY?: string;
  /** Sufijo de unidad para los valores (ej. "%", "Bs", "personas"). */
  unidad?: string;
  /** Fuente del dato (ej. "Encuesta propia, 2026, n=120"). */
  fuente?: string;
  datos: GraficoDato[];
}

export type DiagramaSpec = ArbolProblemasSpec | GraficoSpec;

/** Límites de seguridad para que el layout nunca se desborde. */
export const LIMITES = {
  /** Máx. cajas por fila en el árbol (causas o efectos). */
  arbolNodos: 6,
  /** Máx. puntos/categorías en un gráfico. */
  graficoDatos: 12,
  /** Máx. caracteres por etiqueta antes de recortar. */
  etiqueta: 160,
} as const;

/** Paleta determinista, apta para impresión (sin colores que se "pierdan" en B/N). */
export const PALETA = [
  "#2563eb", // azul
  "#0d9488", // teal
  "#d97706", // ámbar
  "#dc2626", // rojo
  "#7c3aed", // violeta
  "#16a34a", // verde
  "#db2777", // rosa
  "#0891b2", // cian
  "#65a30d", // lima
  "#9333ea", // púrpura
  "#ea580c", // naranja
  "#475569", // pizarra
] as const;
