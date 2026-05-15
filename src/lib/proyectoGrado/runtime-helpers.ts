/**
 * Helpers de runtime para enriquecer las fases del servicio Proyecto
 * de Grado con cálculos REALES de calculos.ts.
 *
 * Estos helpers se invocan desde el endpoint /api/projects/generate-phase
 * DESPUÉS de obtener el output de la IA, para reemplazar valores que la
 * IA puede haber estimado con cálculos exactos del módulo calculos.ts.
 *
 * Áreas de aplicación:
 *
 *   - Fase 3d: cálculo real del tamaño de muestra `n` con tamanoMuestra().
 *   - Fase 3e (modo CON_DATA_REAL): tabulación con frecuencias() y
 *     chiCuadrado() del módulo encuestas.ts. Esto NO va aquí — el
 *     endpoint precalcula y pasa a la IA antes de generar.
 *   - Fase 4f / 4g: cálculo real de VAN, TIR, WACC, punto de equilibrio
 *     con flujo de caja, una vez aprobados los parámetros financieros.
 *
 * Convención: cada helper recibe los inputs estructurados (no strings)
 * y devuelve un payload tipado que el endpoint puede inyectar al
 * contexto del prompt como bloque [DATOS CALCULADOS].
 */

import {
  van,
  tir,
  wacc,
  puntoEquilibrio,
  paybackDescontado,
  amortizacion,
  tamanoMuestra,
  construirFlujoCaja,
  decimalToPct,
  type WACCInputs,
  type AmortizacionInputs,
  type FlujoCajaInputs,
  type MuestraInputs,
  type PuntoEquilibrioInputs,
} from "./calculos";

// ─────────────────────────────────────────────────────────────────────────────
// Helper de Fase 3d — Tamaño de muestra
// ─────────────────────────────────────────────────────────────────────────────

export interface CalculoMuestraResult {
  /** Tamaño calculado de la muestra. */
  n: number;
  /** Bloque de texto formateado para inyectar al prompt. */
  bloqueParaPrompt: string;
}

export function calcularMuestraParaFase3d(inputs: MuestraInputs): CalculoMuestraResult {
  const n = tamanoMuestra(inputs);
  const Z = inputs.nivelConfianza === 0.95 ? 1.96
    : inputs.nivelConfianza === 0.99 ? 2.576 : 1.645;

  const bloqueParaPrompt = [
    "═══════════════════════════════════════════════════════════════",
    "[DATOS CALCULADOS POR EL SISTEMA — USAR EXACTAMENTE]",
    "═══════════════════════════════════════════════════════════════",
    `- Población N: ${inputs.poblacion === Infinity ? "infinita" : inputs.poblacion.toLocaleString("es-BO")}`,
    `- Nivel de confianza: ${decimalToPct(inputs.nivelConfianza)}% (Z = ${Z})`,
    `- Margen de error: ±${decimalToPct(inputs.margenError)}%`,
    `- Proporción esperada p: ${inputs.proporcion ?? 0.5}`,
    `- **Tamaño de muestra calculado: n = ${n}**`,
    "",
    "Use este valor EXACTO en el cuestionario y en cualquier mención",
    "del tamaño de muestra. NO recalcule ni redondee.",
    "",
  ].join("\n");

  return { n, bloqueParaPrompt };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper de Fase 4f / 4g — Cálculos financieros completos
// ─────────────────────────────────────────────────────────────────────────────

export interface CalculoFinancieroInputs {
  /** Inversión inicial total del proyecto. */
  inversionInicial: number;
  /** Ingresos proyectados por año (5 años típico). */
  ingresosAnuales: number[];
  /** Costos operativos por año (mismo largo que ingresos). */
  costosAnuales: number[];
  /** Tasa impositiva (IUE Bolivia = 0.25). */
  tasaImpositiva: number;
  /** Depreciación anual constante (0 si no aplica). */
  depreciacionAnual?: number;
  /** Valor de rescate al final del horizonte. */
  valorRescate?: number;
  /** Inputs para WACC. */
  wacc: WACCInputs;
  /** Punto de equilibrio inputs. */
  puntoEquilibrio: PuntoEquilibrioInputs;
  /** Amortización del préstamo (opcional). */
  amortizacion?: AmortizacionInputs;
}

export interface CalculoFinancieroResult {
  flujoCaja: number[];
  van: number;
  tir: number;
  wacc: number;
  puntoEquilibrioUnidades: number;
  puntoEquilibrioMonto: number;
  paybackDescontado: number | null;
  amortizacionResumen?: { totalIntereses: number; totalPagado: number; cuotaMensual?: number };
  bloqueParaPrompt: string;
}

export function calcularIndicadoresFinancieros(inputs: CalculoFinancieroInputs): CalculoFinancieroResult {
  // Construir flujo de caja
  const flujosCaja: FlujoCajaInputs = {
    inversionInicial: inputs.inversionInicial,
    ingresosAnuales: inputs.ingresosAnuales,
    costosAnuales: inputs.costosAnuales,
    tasaImpositiva: inputs.tasaImpositiva,
    depreciacionAnual: inputs.depreciacionAnual ?? 0,
    valorRescate: inputs.valorRescate ?? 0,
  };
  const flujoCaja = construirFlujoCaja(flujosCaja);

  // WACC
  const waccValor = wacc(inputs.wacc);

  // VAN y TIR sobre el flujo construido
  const vanValor = van(flujoCaja, waccValor);
  const tirValor = tir(flujoCaja, waccValor);

  // Punto de equilibrio
  const peResult = puntoEquilibrio(inputs.puntoEquilibrio);

  // Payback descontado
  const payback = paybackDescontado(flujoCaja, waccValor);

  // Amortización (si hay)
  let amortResumen: CalculoFinancieroResult["amortizacionResumen"];
  if (inputs.amortizacion) {
    const amort = amortizacion(inputs.amortizacion);
    amortResumen = {
      totalIntereses: amort.totalIntereses,
      totalPagado: amort.totalPagado,
      cuotaMensual: amort.cuotas[0]?.cuota,
    };
  }

  // Formato del bloque para inyectar en el prompt
  const fmt = (n: number) => n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const lineas: string[] = [
    "═══════════════════════════════════════════════════════════════",
    "[INDICADORES CALCULADOS POR EL SISTEMA — USAR EXACTAMENTE]",
    "═══════════════════════════════════════════════════════════════",
    "Estos valores YA están calculados con precisión por el módulo",
    "src/lib/proyectoGrado/calculos.ts. NO los recalcules ni los",
    "redondees. Úsalos tal cual en las tablas e interpretación.",
    "",
    "**Flujo de caja libre proyectado (Bs):**",
    `  Año 0: ${fmt(flujoCaja[0])}`,
    ...flujoCaja.slice(1).map((fc, i) => `  Año ${i + 1}: ${fmt(fc)}`),
    "",
    "**Indicadores:**",
    `  WACC: ${decimalToPct(waccValor).toFixed(2)}%`,
    `  VAN: Bs. ${fmt(vanValor)}`,
    `  TIR: ${decimalToPct(tirValor).toFixed(2)}%`,
    `  Punto de equilibrio (unidades): ${fmt(peResult.unidades)}`,
    `  Punto de equilibrio (monto): Bs. ${fmt(peResult.monto)}`,
    `  Margen de contribución unitario: Bs. ${fmt(peResult.margenContribucion)}`,
    `  Razón de contribución: ${(peResult.razonContribucion * 100).toFixed(2)}%`,
    `  Payback descontado: ${payback !== null ? `${payback.toFixed(2)} años` : "No se recupera en el horizonte"}`,
  ];

  if (amortResumen) {
    lineas.push(
      "",
      "**Amortización del préstamo (resumen):**",
      `  Cuota fija mensual: Bs. ${fmt(amortResumen.cuotaMensual ?? 0)}`,
      `  Total de intereses pagados: Bs. ${fmt(amortResumen.totalIntereses)}`,
      `  Total pagado al banco: Bs. ${fmt(amortResumen.totalPagado)}`,
    );
  }

  lineas.push(
    "",
    "**Decisiones automáticas:**",
    `  VAN ${vanValor > 0 ? "> 0 → proyecto crea valor" : vanValor === 0 ? "= 0 → proyecto indiferente" : "< 0 → proyecto destruye valor"}`,
    `  TIR ${tirValor > waccValor ? "> WACC → rentable" : tirValor === waccValor ? "= WACC → indiferente" : "< WACC → no rentable"}`,
    payback !== null && payback <= inputs.ingresosAnuales.length
      ? `  Payback (${payback.toFixed(2)} años) ≤ horizonte → recuperable`
      : `  Payback no se cumple en el horizonte → no recuperable`,
    "",
  );

  return {
    flujoCaja,
    van: vanValor,
    tir: tirValor,
    wacc: waccValor,
    puntoEquilibrioUnidades: peResult.unidades,
    puntoEquilibrioMonto: peResult.monto,
    paybackDescontado: payback,
    amortizacionResumen: amortResumen,
    bloqueParaPrompt: lineas.join("\n"),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper de validación de coherencia entre fases aprobadas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Valida que las fases sustantivas tienen contenido aprobado antes de
 * permitir el avance a las fases finales (resumen, conclusiones, latex).
 *
 * @param phaseContents El mapa de contenidos del proyecto.
 * @param fasesRequeridas Las phase_ids que deben estar aprobadas.
 *
 * Devuelve un objeto con `ok` y, si falta, el array de fases faltantes.
 */
export function validarFasesAprobadas(
  phaseContents: Record<string, string | null | undefined>,
  fasesRequeridas: readonly string[],
): { ok: boolean; faltantes: string[] } {
  const faltantes: string[] = [];
  for (const fid of fasesRequeridas) {
    const c = phaseContents[fid];
    if (!c || c.trim().length < 200) {
      faltantes.push(fid);
    }
  }
  return { ok: faltantes.length === 0, faltantes };
}

/** Listado canónico de fases SUSTANTIVAS (no resumen ni cierres). */
export const FASES_SUSTANTIVAS = [
  "ph-proy-cap0",
  "ph-proy-cap1",
  "ph-proy-cap2",
  "ph-proy-cap3a",
  "ph-proy-cap3b",
  "ph-proy-cap3c",
  "ph-proy-cap3d",
  "ph-proy-cap3e",
  "ph-proy-cap3f",
  "ph-proy-cap4a",
  "ph-proy-cap4abis",
  "ph-proy-cap4b",
  "ph-proy-cap4c",
  "ph-proy-cap4d",
  "ph-proy-cap4e",
  "ph-proy-cap4f",
  "ph-proy-cap4g",
] as const;
