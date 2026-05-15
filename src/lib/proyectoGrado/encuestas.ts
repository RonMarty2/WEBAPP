/**
 * Análisis estadístico de encuestas para Proyecto de Grado.
 *
 * Implementa todo el procesamiento que la fase 3e (Análisis de Encuesta Real)
 * necesita después de que el estudiante sube su CSV con respuestas crudas:
 *
 * - Frecuencias absolutas y relativas (univariado).
 * - Estadísticos descriptivos (media, mediana, moda, desvío, coef. variación).
 * - Tablas de contingencia (análisis bivariado).
 * - Test de chi-cuadrado de independencia para validar relación entre variables.
 *
 * Todas las funciones son **puras** y **deterministas**. La IA NO inventa
 * estos valores — los recibe ya calculados por este módulo.
 *
 * Usa `simple-statistics` para los descriptivos básicos. El chi-cuadrado se
 * implementa a mano con tabla de valores críticos (no se necesita la función
 * gamma incompleta para el caso académico de UCATEC).
 */

import {
  mean as ssMean,
  median as ssMedian,
  mode as ssMode,
  standardDeviation as ssStandardDeviation,
  variance as ssVariance,
  min as ssMin,
  max as ssMax,
} from "simple-statistics";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Redondea a la precisión indicada (default 4 decimales para estadística). */
function round(value: number, decimals = 4): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

// ─────────────────────────────────────────────────────────────────────────────
// Frecuencias univariadas
// ─────────────────────────────────────────────────────────────────────────────

export interface FrecuenciaItem {
  /** Valor (categoría) observado. */
  categoria: string;
  /** Cuántas veces apareció. */
  frecuenciaAbsoluta: number;
  /** Proporción del total (0-1). */
  frecuenciaRelativa: number;
  /** Porcentaje (0-100). */
  porcentaje: number;
}

export interface FrecuenciaResult {
  /** Total de respuestas válidas analizadas. */
  total: number;
  /** Distribución por categoría, ordenada de mayor a menor frecuencia. */
  items: FrecuenciaItem[];
}

/**
 * Calcula la distribución de frecuencias de una columna de respuestas.
 *
 * @param respuestas Array de respuestas (cualquier tipo serializable a string).
 *                   Valores `null`, `undefined` o strings vacíos se ignoran.
 * @param ordenAlfabetico Si true, ordena las categorías alfabéticamente.
 *                        Si false (default), ordena por frecuencia descendente.
 *
 * Ejemplo:
 *   frecuencias(["Sí","No","Sí","No","Sí","Tal vez"])
 *   → { total: 6, items: [
 *       { categoria: "Sí", frecuenciaAbsoluta: 3, frecuenciaRelativa: 0.5, porcentaje: 50 },
 *       { categoria: "No", frecuenciaAbsoluta: 2, frecuenciaRelativa: 0.3333, porcentaje: 33.33 },
 *       { categoria: "Tal vez", frecuenciaAbsoluta: 1, frecuenciaRelativa: 0.1667, porcentaje: 16.67 },
 *     ]}
 */
export function frecuencias(
  respuestas: Array<string | number | null | undefined>,
  ordenAlfabetico = false,
): FrecuenciaResult {
  if (!Array.isArray(respuestas)) {
    throw new Error("frecuencias: respuestas debe ser un array");
  }

  // Limpiar valores vacíos/nulos y normalizar a string
  const limpias = respuestas
    .filter(r => r !== null && r !== undefined && String(r).trim() !== "")
    .map(r => String(r).trim());

  const total = limpias.length;
  if (total === 0) {
    return { total: 0, items: [] };
  }

  // Contar
  const conteo = new Map<string, number>();
  for (const r of limpias) {
    conteo.set(r, (conteo.get(r) ?? 0) + 1);
  }

  // Construir items
  const items: FrecuenciaItem[] = Array.from(conteo.entries()).map(([categoria, freq]) => ({
    categoria,
    frecuenciaAbsoluta: freq,
    frecuenciaRelativa: round(freq / total, 4),
    porcentaje: round((freq / total) * 100, 2),
  }));

  // Ordenar
  if (ordenAlfabetico) {
    items.sort((a, b) => a.categoria.localeCompare(b.categoria, "es"));
  } else {
    items.sort((a, b) => b.frecuenciaAbsoluta - a.frecuenciaAbsoluta);
  }

  return { total, items };
}

// ─────────────────────────────────────────────────────────────────────────────
// Estadísticos descriptivos
// ─────────────────────────────────────────────────────────────────────────────

export interface DescriptivosResult {
  n: number;
  media: number;
  mediana: number;
  moda: number;
  desviacionEstandar: number;
  varianza: number;
  coeficienteVariacion: number;
  minimo: number;
  maximo: number;
  rango: number;
}

/**
 * Calcula estadísticos descriptivos básicos para una variable numérica.
 *
 * Útil para preguntas tipo "edad", "ingreso mensual", "cantidad de…", etc.
 *
 * @param datos Array de números. NaN y valores no finitos se ignoran.
 *
 * Lanza error si después de limpiar quedan menos de 2 datos.
 *
 * Ejemplo:
 *   descriptivos([25, 30, 28, 35, 22, 30, 27])
 *   → { n: 7, media: 28.14, mediana: 28, moda: 30, ... }
 */
export function descriptivos(datos: number[]): DescriptivosResult {
  if (!Array.isArray(datos)) {
    throw new Error("descriptivos: datos debe ser un array");
  }
  const limpios = datos.filter(d => typeof d === "number" && Number.isFinite(d));
  if (limpios.length < 2) {
    throw new Error("descriptivos: se necesitan al menos 2 datos numéricos válidos");
  }

  const media = ssMean(limpios);
  const desv = ssStandardDeviation(limpios);

  return {
    n: limpios.length,
    media: round(media, 4),
    mediana: round(ssMedian(limpios), 4),
    moda: round(ssMode(limpios), 4),
    desviacionEstandar: round(desv, 4),
    varianza: round(ssVariance(limpios), 4),
    coeficienteVariacion: round(media !== 0 ? desv / Math.abs(media) : 0, 4),
    minimo: round(ssMin(limpios), 4),
    maximo: round(ssMax(limpios), 4),
    rango: round(ssMax(limpios) - ssMin(limpios), 4),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tabla de contingencia y chi-cuadrado
// ─────────────────────────────────────────────────────────────────────────────

export interface TablaContingenciaResult {
  /** Categorías de la primera variable (filas). */
  categoriasFila: string[];
  /** Categorías de la segunda variable (columnas). */
  categoriasColumna: string[];
  /** Matriz de frecuencias observadas [fila][columna]. */
  observados: number[][];
  /** Matriz de frecuencias esperadas (bajo hipótesis de independencia). */
  esperados: number[][];
  /** Totales por fila. */
  totalesFila: number[];
  /** Totales por columna. */
  totalesColumna: number[];
  /** Total general (n). */
  totalGeneral: number;
}

/**
 * Construye una tabla de contingencia 2D a partir de dos columnas de respuestas
 * del mismo tamaño.
 *
 * Las filas se mapean a categorías de `variableFila` (orden alfabético) y las
 * columnas a `variableColumna` (orden alfabético).
 *
 * Calcula también las frecuencias esperadas bajo la hipótesis nula de
 * independencia: E_ij = (totalFila_i × totalColumna_j) / totalGeneral.
 *
 * Lanza error si las dos columnas tienen distinto largo o si después de
 * limpiar no queda nada.
 */
export function tablaContingencia(
  variableFila: Array<string | number | null | undefined>,
  variableColumna: Array<string | number | null | undefined>,
): TablaContingenciaResult {
  if (!Array.isArray(variableFila) || !Array.isArray(variableColumna)) {
    throw new Error("tablaContingencia: ambos argumentos deben ser arrays");
  }
  if (variableFila.length !== variableColumna.length) {
    throw new Error(
      `tablaContingencia: las variables tienen distinto largo (${variableFila.length} vs ${variableColumna.length})`,
    );
  }

  // Limpiar pares — descartar si CUALQUIERA de los dos es null/vacío
  const pares: Array<[string, string]> = [];
  for (let i = 0; i < variableFila.length; i += 1) {
    const a = variableFila[i];
    const b = variableColumna[i];
    if (a === null || a === undefined || String(a).trim() === "") continue;
    if (b === null || b === undefined || String(b).trim() === "") continue;
    pares.push([String(a).trim(), String(b).trim()]);
  }

  if (pares.length === 0) {
    throw new Error("tablaContingencia: no quedan pares válidos después de limpiar");
  }

  // Categorías únicas
  const setFila = new Set<string>();
  const setColumna = new Set<string>();
  for (const [a, b] of pares) {
    setFila.add(a);
    setColumna.add(b);
  }
  const categoriasFila = Array.from(setFila).sort((a, b) => a.localeCompare(b, "es"));
  const categoriasColumna = Array.from(setColumna).sort((a, b) => a.localeCompare(b, "es"));

  const idxFila = new Map(categoriasFila.map((c, i) => [c, i] as const));
  const idxColumna = new Map(categoriasColumna.map((c, i) => [c, i] as const));

  // Matriz observada
  const observados: number[][] = categoriasFila.map(() =>
    new Array<number>(categoriasColumna.length).fill(0),
  );
  for (const [a, b] of pares) {
    observados[idxFila.get(a)!][idxColumna.get(b)!] += 1;
  }

  // Totales
  const totalesFila = observados.map(fila => fila.reduce((sum, x) => sum + x, 0));
  const totalesColumna = categoriasColumna.map((_, j) =>
    observados.reduce((sum, fila) => sum + fila[j], 0),
  );
  const totalGeneral = totalesFila.reduce((sum, x) => sum + x, 0);

  // Matriz esperada
  const esperados: number[][] = totalesFila.map((tf, i) =>
    totalesColumna.map((tc, _j) => round((tf * tc) / totalGeneral, 4)),
  );

  return {
    categoriasFila,
    categoriasColumna,
    observados,
    esperados,
    totalesFila,
    totalesColumna,
    totalGeneral,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Test de Chi-cuadrado de independencia
// ─────────────────────────────────────────────────────────────────────────────

export interface ChiCuadradoResult {
  /** Valor del estadístico χ². */
  estadistico: number;
  /** Grados de libertad: (filas-1) × (columnas-1). */
  gradosLibertad: number;
  /** Tabla de contingencia usada para el cálculo. */
  tabla: TablaContingenciaResult;
  /** Valor crítico para α=0.05 (nivel de significancia 95%). */
  valorCriticoAlfa05: number;
  /** Valor crítico para α=0.01 (nivel de significancia 99%). */
  valorCriticoAlfa01: number;
  /** ¿Se rechaza H₀ (independencia) a α=0.05? */
  significativoAlfa05: boolean;
  /** ¿Se rechaza H₀ a α=0.01? */
  significativoAlfa01: boolean;
  /** Interpretación textual del resultado para el estudiante. */
  interpretacion: string;
}

/**
 * Tabla de valores críticos de la distribución χ² para grados de libertad 1-30
 * a niveles de significancia α=0.05 y α=0.01.
 *
 * Para gl > 30 se usa la aproximación: χ²_crit ≈ gl + z×√(2gl)
 * (z=1.645 para α=0.05, z=2.326 para α=0.01).
 *
 * Fuente: tabla canónica de chi-cuadrado de cualquier manual de estadística.
 */
const CHI_CUADRADO_CRITICOS: Record<number, { alfa05: number; alfa01: number }> = {
  1:  { alfa05: 3.841,  alfa01: 6.635 },
  2:  { alfa05: 5.991,  alfa01: 9.210 },
  3:  { alfa05: 7.815,  alfa01: 11.345 },
  4:  { alfa05: 9.488,  alfa01: 13.277 },
  5:  { alfa05: 11.070, alfa01: 15.086 },
  6:  { alfa05: 12.592, alfa01: 16.812 },
  7:  { alfa05: 14.067, alfa01: 18.475 },
  8:  { alfa05: 15.507, alfa01: 20.090 },
  9:  { alfa05: 16.919, alfa01: 21.666 },
  10: { alfa05: 18.307, alfa01: 23.209 },
  11: { alfa05: 19.675, alfa01: 24.725 },
  12: { alfa05: 21.026, alfa01: 26.217 },
  13: { alfa05: 22.362, alfa01: 27.688 },
  14: { alfa05: 23.685, alfa01: 29.141 },
  15: { alfa05: 24.996, alfa01: 30.578 },
  16: { alfa05: 26.296, alfa01: 32.000 },
  17: { alfa05: 27.587, alfa01: 33.409 },
  18: { alfa05: 28.869, alfa01: 34.805 },
  19: { alfa05: 30.144, alfa01: 36.191 },
  20: { alfa05: 31.410, alfa01: 37.566 },
  21: { alfa05: 32.671, alfa01: 38.932 },
  22: { alfa05: 33.924, alfa01: 40.289 },
  23: { alfa05: 35.172, alfa01: 41.638 },
  24: { alfa05: 36.415, alfa01: 42.980 },
  25: { alfa05: 37.652, alfa01: 44.314 },
  26: { alfa05: 38.885, alfa01: 45.642 },
  27: { alfa05: 40.113, alfa01: 46.963 },
  28: { alfa05: 41.337, alfa01: 48.278 },
  29: { alfa05: 42.557, alfa01: 49.588 },
  30: { alfa05: 43.773, alfa01: 50.892 },
};

function valorCritico(gl: number, nivel: "alfa05" | "alfa01"): number {
  if (gl < 1) throw new Error("valorCritico: gl debe ser >= 1");
  if (gl <= 30) return CHI_CUADRADO_CRITICOS[gl][nivel];
  // Aproximación para gl > 30
  const z = nivel === "alfa05" ? 1.645 : 2.326;
  return round(gl + z * Math.sqrt(2 * gl), 3);
}

/**
 * Test de chi-cuadrado de independencia entre dos variables categóricas.
 *
 * Hipótesis:
 *   H₀: las variables son independientes.
 *   H₁: las variables están relacionadas.
 *
 * Fórmula del estadístico:
 *   χ² = Σ ((Observado - Esperado)² / Esperado)
 *
 * Devuelve estadístico, gl, valores críticos y conclusión textual lista para
 * usar en el documento académico.
 *
 * Limitación: el test es confiable cuando todas las frecuencias esperadas
 * son ≥ 5. Si hay celdas con esperado < 5, el resultado se marca con
 * advertencia en la interpretación.
 *
 * Ejemplo:
 *   const r = chiCuadrado(
 *     ["Sí","Sí","No","No","Sí","No","Sí","No"],   // ¿Conoce el producto?
 *     ["Hombre","Mujer","Hombre","Mujer","Mujer","Hombre","Mujer","Mujer"]  // Género
 *   );
 *   // r.estadistico, r.gradosLibertad, r.significativoAlfa05, r.interpretacion
 */
export function chiCuadrado(
  variableA: Array<string | number | null | undefined>,
  variableB: Array<string | number | null | undefined>,
): ChiCuadradoResult {
  const tabla = tablaContingencia(variableA, variableB);
  const { observados, esperados, categoriasFila, categoriasColumna } = tabla;

  if (categoriasFila.length < 2 || categoriasColumna.length < 2) {
    throw new Error(
      "chiCuadrado: se necesitan al menos 2 categorías en cada variable",
    );
  }

  // Calcular estadístico
  let estadistico = 0;
  let celdasConEsperadoBajo = 0;
  for (let i = 0; i < observados.length; i += 1) {
    for (let j = 0; j < observados[i].length; j += 1) {
      const o = observados[i][j];
      const e = esperados[i][j];
      if (e <= 0) continue; // celda imposible — se ignora
      if (e < 5) celdasConEsperadoBajo += 1;
      estadistico += Math.pow(o - e, 2) / e;
    }
  }

  const gradosLibertad = (categoriasFila.length - 1) * (categoriasColumna.length - 1);
  const valorCriticoAlfa05 = valorCritico(gradosLibertad, "alfa05");
  const valorCriticoAlfa01 = valorCritico(gradosLibertad, "alfa01");
  const significativoAlfa05 = estadistico > valorCriticoAlfa05;
  const significativoAlfa01 = estadistico > valorCriticoAlfa01;

  // Construir interpretación
  let interpretacion = "";
  if (significativoAlfa01) {
    interpretacion = `Se rechaza la hipótesis nula de independencia con un nivel de confianza del 99% (χ²=${round(estadistico, 3)} > ${valorCriticoAlfa01}, gl=${gradosLibertad}). Existe evidencia estadística fuerte de una relación entre las dos variables.`;
  } else if (significativoAlfa05) {
    interpretacion = `Se rechaza la hipótesis nula de independencia con un nivel de confianza del 95% (χ²=${round(estadistico, 3)} > ${valorCriticoAlfa05}, gl=${gradosLibertad}). Existe evidencia estadística de una relación entre las dos variables.`;
  } else {
    interpretacion = `No se rechaza la hipótesis nula de independencia (χ²=${round(estadistico, 3)} ≤ ${valorCriticoAlfa05}, gl=${gradosLibertad}). No hay evidencia estadística suficiente para afirmar que las variables están relacionadas a un nivel de confianza del 95%.`;
  }

  if (celdasConEsperadoBajo > 0) {
    interpretacion += ` Advertencia: ${celdasConEsperadoBajo} celda(s) tienen frecuencia esperada < 5, lo que puede afectar la validez del test. Considere ampliar la muestra o agrupar categorías.`;
  }

  return {
    estadistico: round(estadistico, 4),
    gradosLibertad,
    tabla,
    valorCriticoAlfa05,
    valorCriticoAlfa01,
    significativoAlfa05,
    significativoAlfa01,
    interpretacion,
  };
}
