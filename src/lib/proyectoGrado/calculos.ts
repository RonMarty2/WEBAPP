/**
 * Cálculos financieros para Proyecto de Grado.
 *
 * Estas funciones implementan las fórmulas estándar que se aplican en el
 * Capítulo IV (Marco Propositivo) de los proyectos de factibilidad UCATEC.
 *
 * Todas las funciones son **puras** (sin efectos secundarios), **deterministas**
 * y **testeables**. La IA NO calcula estos valores en su prompt — los recibe
 * pre-calculados por este módulo para evitar errores aritméticos.
 *
 * Moneda: todas las funciones devuelven montos en la misma moneda que reciben.
 * El proyecto usa Bolivianos (Bs.) por convención UCATEC, pero el código es
 * agnóstico — funciona con cualquier moneda.
 *
 * Tasas: las funciones reciben tasas como **decimal** (0.12 = 12%), no como
 * porcentaje. El helper `pctToDecimal()` convierte si es necesario.
 *
 * Convenciones:
 * - `flujos`: array donde flujos[0] es el flujo del año 0 (típicamente la
 *   inversión inicial NEGATIVA) y flujos[t] es el flujo neto del año t.
 * - `tasa`: tasa de descuento en decimal (ej: 0.12 para 12%).
 * - Resultados con precisión de centavo (2 decimales).
 *
 * Referencias académicas:
 * - Sapag Chain & Sapag Chain (2014). Preparación y evaluación de proyectos.
 * - Brealey, Myers, Allen (2020). Principles of Corporate Finance.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Helpers básicos
// ─────────────────────────────────────────────────────────────────────────────

/** Convierte un porcentaje (12) a su forma decimal (0.12). */
export function pctToDecimal(pct: number): number {
  return pct / 100;
}

/** Convierte un decimal (0.12) a porcentaje (12). */
export function decimalToPct(decimal: number): number {
  return decimal * 100;
}

/** Redondea a la precisión indicada de decimales (default 2). */
export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

// ─────────────────────────────────────────────────────────────────────────────
// VAN — Valor Actual Neto
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula el VAN (Valor Actual Neto) de un flujo de caja.
 *
 * Fórmula: VAN = Σ (FCt / (1 + tasa)^t)
 *
 * @param flujos Array con los flujos de caja. flujos[0] suele ser la inversión
 *               inicial (NEGATIVA). flujos[1..n] son los flujos netos de cada
 *               período subsiguiente.
 * @param tasa   Tasa de descuento en decimal (ej: 0.12 para 12% anual).
 *
 * Interpretación:
 * - VAN > 0 → el proyecto genera valor por encima de la tasa de descuento.
 * - VAN = 0 → el proyecto apenas iguala la tasa de descuento.
 * - VAN < 0 → el proyecto NO supera la tasa de descuento, no es rentable.
 *
 * Ejemplo:
 *   van([-1000, 300, 400, 500, 600], 0.10) ≈ 416.62
 */
export function van(flujos: number[], tasa: number): number {
  if (!Array.isArray(flujos) || flujos.length === 0) {
    throw new Error("van: flujos debe ser un array no vacío");
  }
  if (!Number.isFinite(tasa)) {
    throw new Error("van: tasa debe ser un número finito");
  }
  if (tasa <= -1) {
    throw new Error("van: tasa no puede ser menor o igual a -100% (división por cero)");
  }

  let total = 0;
  for (let t = 0; t < flujos.length; t += 1) {
    const ft = flujos[t];
    if (!Number.isFinite(ft)) {
      throw new Error(`van: flujos[${t}] no es un número finito`);
    }
    total += ft / Math.pow(1 + tasa, t);
  }
  return round(total);
}

// ─────────────────────────────────────────────────────────────────────────────
// TIR — Tasa Interna de Retorno
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula la TIR (Tasa Interna de Retorno) de un flujo de caja.
 *
 * La TIR es la tasa que hace VAN = 0. Se resuelve numéricamente porque no
 * tiene fórmula cerrada para más de 4 flujos.
 *
 * Implementación: método de Newton-Raphson con fallback a bisección si
 * Newton no converge.
 *
 * @param flujos Array con los flujos (mismo formato que en van()).
 * @param guess  Estimación inicial (default 0.10 = 10%).
 *
 * Devuelve la TIR como decimal (ej: 0.18 para 18%).
 *
 * Lanza error si:
 * - El flujo no tiene cambio de signo (no existe TIR real).
 * - No converge después de 100 iteraciones.
 *
 * Ejemplo:
 *   tir([-1000, 300, 400, 500, 600]) ≈ 0.2480 (24.80%)
 */
export function tir(flujos: number[], guess = 0.10): number {
  if (!Array.isArray(flujos) || flujos.length < 2) {
    throw new Error("tir: flujos debe tener al menos 2 elementos");
  }

  // Verificar que hay al menos un cambio de signo (condición necesaria
  // para que exista TIR real).
  const hayPositivos = flujos.some(f => f > 0);
  const hayNegativos = flujos.some(f => f < 0);
  if (!hayPositivos || !hayNegativos) {
    throw new Error("tir: el flujo no tiene cambio de signo — no existe TIR real");
  }

  // ── Newton-Raphson ────────────────────────────────────────────────────────
  let tasa = guess;
  for (let i = 0; i < 100; i += 1) {
    let vanActual = 0;
    let derivada = 0;
    for (let t = 0; t < flujos.length; t += 1) {
      const factor = Math.pow(1 + tasa, t);
      vanActual += flujos[t] / factor;
      if (t > 0) derivada -= (t * flujos[t]) / Math.pow(1 + tasa, t + 1);
    }
    if (Math.abs(vanActual) < 1e-7) return round(tasa, 6);
    if (Math.abs(derivada) < 1e-12) break; // derivada cero, salir y caer a bisección
    const tasaNueva = tasa - vanActual / derivada;
    if (!Number.isFinite(tasaNueva)) break;
    if (Math.abs(tasaNueva - tasa) < 1e-9) return round(tasaNueva, 6);
    tasa = tasaNueva;
  }

  // ── Bisección como fallback ──────────────────────────────────────────────
  // Busca la TIR en el rango [-0.99, 10] (entre -99% y 1000% anual).
  let lo = -0.99;
  let hi = 10.0;
  const vanAt = (r: number) => flujos.reduce(
    (acc, f, t) => acc + f / Math.pow(1 + r, t),
    0,
  );
  let vanLo = vanAt(lo);
  let vanHi = vanAt(hi);
  if (vanLo * vanHi > 0) {
    throw new Error("tir: no se encontró cambio de signo en el rango de búsqueda");
  }
  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2;
    const vanMid = vanAt(mid);
    if (Math.abs(vanMid) < 1e-7 || (hi - lo) / 2 < 1e-9) return round(mid, 6);
    if (vanMid * vanLo < 0) {
      hi = mid;
      vanHi = vanMid;
    } else {
      lo = mid;
      vanLo = vanMid;
    }
  }
  throw new Error("tir: no convergió en 200 iteraciones de bisección");
}

// ─────────────────────────────────────────────────────────────────────────────
// WACC — Costo Promedio Ponderado de Capital
// ─────────────────────────────────────────────────────────────────────────────

export interface WACCInputs {
  /** Monto de capital propio (Equity), en cualquier moneda. */
  capitalPropio: number;
  /** Monto de deuda, en la misma moneda. */
  deuda: number;
  /** Tasa de costo del capital propio en decimal (ej: 0.18 para 18%). */
  tasaCapitalPropio: number;
  /** Tasa de interés de la deuda en decimal (ej: 0.10 para 10%). */
  tasaDeuda: number;
  /** Tasa impositiva en decimal (ej: 0.25 para 25% IUE en Bolivia). */
  tasaImpositiva: number;
}

/**
 * Calcula el WACC (Weighted Average Cost of Capital).
 *
 * Fórmula: WACC = (E/V × Re) + (D/V × Rd × (1 - T))
 *
 * Donde:
 * - E = capital propio
 * - D = deuda
 * - V = E + D (capital total)
 * - Re = costo del capital propio
 * - Rd = costo de la deuda
 * - T  = tasa impositiva (escudo fiscal de la deuda)
 *
 * Devuelve el WACC como decimal (ej: 0.135 para 13.5%).
 *
 * Ejemplo (Bolivia, IUE 25%):
 *   wacc({
 *     capitalPropio: 60000, deuda: 40000,
 *     tasaCapitalPropio: 0.18, tasaDeuda: 0.10,
 *     tasaImpositiva: 0.25
 *   }) ≈ 0.138 (13.80%)
 */
export function wacc(inputs: WACCInputs): number {
  const { capitalPropio, deuda, tasaCapitalPropio, tasaDeuda, tasaImpositiva } = inputs;

  if (!Number.isFinite(capitalPropio) || capitalPropio < 0) {
    throw new Error("wacc: capitalPropio debe ser un número >= 0");
  }
  if (!Number.isFinite(deuda) || deuda < 0) {
    throw new Error("wacc: deuda debe ser un número >= 0");
  }
  if (capitalPropio + deuda <= 0) {
    throw new Error("wacc: capital total (propio + deuda) debe ser > 0");
  }
  if (!Number.isFinite(tasaCapitalPropio)) {
    throw new Error("wacc: tasaCapitalPropio debe ser un número finito");
  }
  if (!Number.isFinite(tasaDeuda)) {
    throw new Error("wacc: tasaDeuda debe ser un número finito");
  }
  if (tasaImpositiva < 0 || tasaImpositiva >= 1) {
    throw new Error("wacc: tasaImpositiva debe estar entre 0 y 1");
  }

  const total = capitalPropio + deuda;
  const pesoE = capitalPropio / total;
  const pesoD = deuda / total;

  return round(pesoE * tasaCapitalPropio + pesoD * tasaDeuda * (1 - tasaImpositiva), 6);
}

// ─────────────────────────────────────────────────────────────────────────────
// Punto de equilibrio
// ─────────────────────────────────────────────────────────────────────────────

export interface PuntoEquilibrioInputs {
  /** Costos fijos totales del período (mensuales o anuales). */
  costosFijos: number;
  /** Precio de venta por unidad. */
  precioVenta: number;
  /** Costo variable por unidad (insumos + mano de obra directa). */
  costoVariableUnitario: number;
}

export interface PuntoEquilibrioResult {
  /** Cantidad de unidades a vender para no perder ni ganar. */
  unidades: number;
  /** Monto de ventas en moneda para no perder ni ganar. */
  monto: number;
  /** Margen de contribución por unidad (precio - costo variable). */
  margenContribucion: number;
  /** Razón de margen de contribución (margen / precio). */
  razonContribucion: number;
}

/**
 * Calcula el punto de equilibrio en unidades y en monto.
 *
 * Fórmulas:
 *   Q* = CF / (P - CVu)              (unidades)
 *   $* = CF / (1 - CVu/P)            (monto)
 *
 * Donde:
 * - CF = costos fijos del período
 * - P  = precio de venta unitario
 * - CVu = costo variable unitario
 *
 * Devuelve también el margen de contribución y la razón, útiles para análisis.
 *
 * Lanza error si CVu ≥ P (no hay margen, el proyecto pierde con cada venta).
 *
 * Ejemplo:
 *   puntoEquilibrio({ costosFijos: 12000, precioVenta: 50, costoVariableUnitario: 30 })
 *   → { unidades: 600, monto: 30000, margenContribucion: 20, razonContribucion: 0.4 }
 */
export function puntoEquilibrio(inputs: PuntoEquilibrioInputs): PuntoEquilibrioResult {
  const { costosFijos, precioVenta, costoVariableUnitario } = inputs;

  if (!Number.isFinite(costosFijos) || costosFijos < 0) {
    throw new Error("puntoEquilibrio: costosFijos debe ser un número >= 0");
  }
  if (!Number.isFinite(precioVenta) || precioVenta <= 0) {
    throw new Error("puntoEquilibrio: precioVenta debe ser > 0");
  }
  if (!Number.isFinite(costoVariableUnitario) || costoVariableUnitario < 0) {
    throw new Error("puntoEquilibrio: costoVariableUnitario debe ser >= 0");
  }
  if (costoVariableUnitario >= precioVenta) {
    throw new Error(
      "puntoEquilibrio: costoVariableUnitario debe ser menor que precioVenta " +
      "(de lo contrario el proyecto pierde dinero por cada unidad vendida)",
    );
  }

  const margenContribucion = precioVenta - costoVariableUnitario;
  const razonContribucion = margenContribucion / precioVenta;
  const unidades = costosFijos / margenContribucion;
  const monto = costosFijos / razonContribucion;

  return {
    unidades: round(unidades, 2),
    monto: round(monto, 2),
    margenContribucion: round(margenContribucion, 2),
    razonContribucion: round(razonContribucion, 4),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Amortización de deuda
// ─────────────────────────────────────────────────────────────────────────────

export type MetodoAmortizacion = "frances" | "aleman" | "americano";

export interface AmortizacionInputs {
  /** Monto del préstamo (capital). */
  capital: number;
  /** Tasa de interés del período en decimal (ej: 0.10 anual). */
  tasaPeriodo: number;
  /** Número de períodos del préstamo (ej: 60 meses). */
  numPeriodos: number;
  /** Método de amortización. */
  metodo: MetodoAmortizacion;
}

export interface CuotaAmortizacion {
  periodo: number;
  saldoInicial: number;
  cuota: number;
  interes: number;
  amortizacionCapital: number;
  saldoFinal: number;
}

export interface AmortizacionResult {
  cuotas: CuotaAmortizacion[];
  totalIntereses: number;
  totalPagado: number;
}

/**
 * Genera la tabla de amortización de un préstamo.
 *
 * Métodos soportados:
 * - **francés** (cuota fija): cuota igual en cada período. La proporción de
 *   interés es alta al principio y baja con el tiempo. Más común en Bolivia.
 *
 * - **alemán** (capital fijo): la amortización del capital es igual en cada
 *   período. La cuota total decrece porque el interés se calcula sobre saldo
 *   decreciente.
 *
 * - **americano** (cuota balón): solo se pagan intereses cada período; el
 *   capital se devuelve íntegro al final. Útil para proyectos con flujo
 *   inicial bajo.
 *
 * Ejemplo (préstamo de 10000 a 10% anual a 4 años, método francés):
 *   amortizacion({ capital: 10000, tasaPeriodo: 0.10, numPeriodos: 4, metodo: "frances" })
 *   → 4 cuotas de ~3154.71 c/u
 */
export function amortizacion(inputs: AmortizacionInputs): AmortizacionResult {
  const { capital, tasaPeriodo, numPeriodos, metodo } = inputs;

  if (!Number.isFinite(capital) || capital <= 0) {
    throw new Error("amortizacion: capital debe ser > 0");
  }
  if (!Number.isFinite(tasaPeriodo) || tasaPeriodo < 0) {
    throw new Error("amortizacion: tasaPeriodo debe ser >= 0");
  }
  if (!Number.isInteger(numPeriodos) || numPeriodos <= 0) {
    throw new Error("amortizacion: numPeriodos debe ser un entero > 0");
  }

  const cuotas: CuotaAmortizacion[] = [];
  let saldo = capital;
  let totalIntereses = 0;
  let totalPagado = 0;

  if (metodo === "frances") {
    // Cuota fija: C = K × (i × (1+i)^n) / ((1+i)^n - 1)
    const factor = Math.pow(1 + tasaPeriodo, numPeriodos);
    const cuotaFija = tasaPeriodo === 0
      ? capital / numPeriodos
      : capital * (tasaPeriodo * factor) / (factor - 1);

    for (let t = 1; t <= numPeriodos; t += 1) {
      const interes = saldo * tasaPeriodo;
      const amortCapital = cuotaFija - interes;
      const saldoFinal = Math.max(0, saldo - amortCapital);
      cuotas.push({
        periodo: t,
        saldoInicial: round(saldo),
        cuota: round(cuotaFija),
        interes: round(interes),
        amortizacionCapital: round(amortCapital),
        saldoFinal: round(saldoFinal),
      });
      totalIntereses += interes;
      totalPagado += cuotaFija;
      saldo = saldoFinal;
    }
  } else if (metodo === "aleman") {
    // Capital fijo: amortización constante = K / n
    const amortFija = capital / numPeriodos;
    for (let t = 1; t <= numPeriodos; t += 1) {
      const interes = saldo * tasaPeriodo;
      const cuota = amortFija + interes;
      const saldoFinal = Math.max(0, saldo - amortFija);
      cuotas.push({
        periodo: t,
        saldoInicial: round(saldo),
        cuota: round(cuota),
        interes: round(interes),
        amortizacionCapital: round(amortFija),
        saldoFinal: round(saldoFinal),
      });
      totalIntereses += interes;
      totalPagado += cuota;
      saldo = saldoFinal;
    }
  } else if (metodo === "americano") {
    // Solo intereses, capital al final
    const interesPeriodico = capital * tasaPeriodo;
    for (let t = 1; t <= numPeriodos; t += 1) {
      const esUltimo = t === numPeriodos;
      const cuota = esUltimo ? interesPeriodico + capital : interesPeriodico;
      const amortCapital = esUltimo ? capital : 0;
      const saldoFinal = esUltimo ? 0 : saldo;
      cuotas.push({
        periodo: t,
        saldoInicial: round(saldo),
        cuota: round(cuota),
        interes: round(interesPeriodico),
        amortizacionCapital: round(amortCapital),
        saldoFinal: round(saldoFinal),
      });
      totalIntereses += interesPeriodico;
      totalPagado += cuota;
      if (esUltimo) saldo = 0;
    }
  } else {
    throw new Error(`amortizacion: método "${metodo}" no soportado`);
  }

  return {
    cuotas,
    totalIntereses: round(totalIntereses),
    totalPagado: round(totalPagado),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Payback descontado
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula el período de recuperación descontado (Discounted Payback Period).
 *
 * Es el momento (en años) en que la suma de flujos descontados deja de ser
 * negativa. Es preferible al payback simple porque considera el valor del
 * dinero en el tiempo.
 *
 * @param flujos Flujos de caja (flujos[0] suele ser inversión negativa).
 * @param tasa   Tasa de descuento en decimal.
 *
 * Devuelve el período de recuperación (puede ser fraccionario, ej: 2.45 años).
 * Devuelve `null` si nunca se recupera dentro del horizonte del flujo.
 *
 * Ejemplo:
 *   paybackDescontado([-1000, 400, 400, 400, 400], 0.10) ≈ 3.31
 */
export function paybackDescontado(flujos: number[], tasa: number): number | null {
  if (!Array.isArray(flujos) || flujos.length === 0) {
    throw new Error("paybackDescontado: flujos debe ser un array no vacío");
  }
  if (!Number.isFinite(tasa) || tasa <= -1) {
    throw new Error("paybackDescontado: tasa inválida");
  }

  let acumulado = 0;
  let acumuladoAnterior = 0;
  for (let t = 0; t < flujos.length; t += 1) {
    const flujoDescontado = flujos[t] / Math.pow(1 + tasa, t);
    acumuladoAnterior = acumulado;
    acumulado += flujoDescontado;
    if (acumulado >= 0 && t > 0) {
      // Interpolar para encontrar el momento exacto
      const fraccion = -acumuladoAnterior / flujoDescontado;
      return round(t - 1 + fraccion, 2);
    }
  }
  return null; // no se recupera dentro del horizonte
}

// ─────────────────────────────────────────────────────────────────────────────
// Tamaño de muestra
// ─────────────────────────────────────────────────────────────────────────────

export interface MuestraInputs {
  /** Tamaño de la población. Si es desconocida o infinita, pasar Infinity. */
  poblacion: number;
  /**
   * Nivel de confianza en decimal (ej: 0.95 para 95%). El sistema mapea a Z:
   * 0.90 → 1.645, 0.95 → 1.96, 0.99 → 2.576.
   */
  nivelConfianza: 0.90 | 0.95 | 0.99;
  /** Margen de error en decimal (ej: 0.05 para ±5%). */
  margenError: number;
  /** Proporción esperada de la característica (default 0.5 = máximo conservador). */
  proporcion?: number;
}

const Z_VALORES: Record<number, number> = {
  0.90: 1.645,
  0.95: 1.96,
  0.99: 2.576,
};

/**
 * Calcula el tamaño de muestra para una encuesta.
 *
 * Para población **infinita o desconocida** usa la fórmula clásica:
 *   n = (Z² × p × q) / e²
 *
 * Para población **finita** aplica corrección:
 *   n = (Z² × p × q × N) / (e² × (N-1) + Z² × p × q)
 *
 * @returns El tamaño de muestra redondeado hacia arriba.
 *
 * Ejemplo (Cochabamba urbana ~700K habitantes, 95%, ±5%):
 *   muestra({ poblacion: 700000, nivelConfianza: 0.95, margenError: 0.05 }) → 384
 */
export function tamanoMuestra(inputs: MuestraInputs): number {
  const { poblacion, nivelConfianza, margenError } = inputs;
  const p = inputs.proporcion ?? 0.5;
  const q = 1 - p;

  if (!Number.isFinite(poblacion) && poblacion !== Infinity) {
    throw new Error("tamanoMuestra: población inválida");
  }
  if (poblacion <= 0) {
    throw new Error("tamanoMuestra: población debe ser > 0");
  }
  if (!(nivelConfianza in Z_VALORES)) {
    throw new Error("tamanoMuestra: nivelConfianza debe ser 0.90, 0.95 o 0.99");
  }
  if (margenError <= 0 || margenError >= 1) {
    throw new Error("tamanoMuestra: margenError debe estar entre 0 y 1");
  }
  if (p < 0 || p > 1) {
    throw new Error("tamanoMuestra: proporcion debe estar entre 0 y 1");
  }

  const z = Z_VALORES[nivelConfianza];
  const numeradorInf = (z * z) * p * q;
  const denominadorInf = margenError * margenError;
  const nInfinito = numeradorInf / denominadorInf;

  if (poblacion === Infinity) {
    return Math.ceil(nInfinito);
  }

  // Corrección para población finita:
  //   n = (N × Z²pq) / ((N-1) × e² + Z²pq)
  // Importante: usamos numeradorInf (no nInfinito) en el numerador,
  // porque nInfinito ya divide por denominadorInf y romperíamos la fórmula.
  const numerador = numeradorInf * poblacion;
  const denominador = (poblacion - 1) * denominadorInf + numeradorInf;
  return Math.ceil(numerador / denominador);
}

// ─────────────────────────────────────────────────────────────────────────────
// Construcción de flujo de caja proyectado
// ─────────────────────────────────────────────────────────────────────────────

export interface FlujoCajaInputs {
  /** Inversión inicial (en valor positivo, se convierte a negativo en el resultado). */
  inversionInicial: number;
  /** Ingresos proyectados por año (longitud = horizonte de evaluación). */
  ingresosAnuales: number[];
  /** Costos operativos proyectados por año (mismo largo que ingresos). */
  costosAnuales: number[];
  /** Tasa impositiva en decimal (ej: 0.25 para IUE Bolivia). */
  tasaImpositiva: number;
  /** Depreciación anual (constante). 0 si no aplica. */
  depreciacionAnual?: number;
  /** Valor de rescate al final del horizonte. 0 si no aplica. */
  valorRescate?: number;
}

/**
 * Construye un flujo de caja neto anual para evaluación del proyecto.
 *
 * Procedimiento por año:
 *   1. Utilidad antes de impuestos = Ingresos - Costos - Depreciación
 *   2. Impuestos = Utilidad × tasaImpositiva (solo si utilidad > 0)
 *   3. Utilidad después de impuestos = Utilidad - Impuestos
 *   4. Flujo de caja neto = Utilidad después de impuestos + Depreciación
 *      (la depreciación es escudo fiscal pero no es salida de caja real)
 *   5. En el último año se suma el valor de rescate.
 *
 * Devuelve el array completo: [-inversionInicial, fcAño1, fcAño2, ..., fcAñoN].
 * Usar este array directamente con `van()` y `tir()`.
 *
 * Ejemplo:
 *   construirFlujoCaja({
 *     inversionInicial: 50000,
 *     ingresosAnuales: [30000, 35000, 40000, 45000, 50000],
 *     costosAnuales: [15000, 16000, 17000, 18000, 19000],
 *     tasaImpositiva: 0.25,
 *     depreciacionAnual: 10000,
 *     valorRescate: 5000,
 *   }) → [-50000, fc1, fc2, fc3, fc4, fc5+rescate]
 */
export function construirFlujoCaja(inputs: FlujoCajaInputs): number[] {
  const {
    inversionInicial,
    ingresosAnuales,
    costosAnuales,
    tasaImpositiva,
    depreciacionAnual = 0,
    valorRescate = 0,
  } = inputs;

  if (!Number.isFinite(inversionInicial) || inversionInicial < 0) {
    throw new Error("construirFlujoCaja: inversionInicial debe ser >= 0");
  }
  if (!Array.isArray(ingresosAnuales) || !Array.isArray(costosAnuales)) {
    throw new Error("construirFlujoCaja: ingresosAnuales y costosAnuales deben ser arrays");
  }
  if (ingresosAnuales.length !== costosAnuales.length) {
    throw new Error("construirFlujoCaja: ingresos y costos deben tener el mismo largo");
  }
  if (ingresosAnuales.length === 0) {
    throw new Error("construirFlujoCaja: el horizonte debe ser al menos 1 año");
  }
  if (tasaImpositiva < 0 || tasaImpositiva >= 1) {
    throw new Error("construirFlujoCaja: tasaImpositiva debe estar entre 0 y 1");
  }

  const flujos: number[] = [-inversionInicial];
  const n = ingresosAnuales.length;

  for (let i = 0; i < n; i += 1) {
    const ing = ingresosAnuales[i];
    const cos = costosAnuales[i];
    const utilidadAI = ing - cos - depreciacionAnual;
    const impuestos = utilidadAI > 0 ? utilidadAI * tasaImpositiva : 0;
    const utilidadDI = utilidadAI - impuestos;
    let fcNeto = utilidadDI + depreciacionAnual;
    if (i === n - 1) fcNeto += valorRescate;
    flujos.push(round(fcNeto));
  }

  return flujos;
}
