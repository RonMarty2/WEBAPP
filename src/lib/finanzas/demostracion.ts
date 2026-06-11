/**
 * Demostración financiera — helpers para el Modo Demostración.
 *
 * Devuelven los KPIs y series de gráficos que necesitan las 10 láminas
 * del modo presentación, derivadas del shape Proyecto + del flujo
 * multianual ya armado por construirFlujoCaja().
 *
 * Cero side effects, cero IA: matemática pura sobre el proyecto guardado.
 */

import type { Proyecto } from "@/types/finanzas/proyecto";
import { construirFlujoCaja } from "./flujo-proyecto";
import {
  calcularVAN,
  calcularTIR,
  calcularPayback,
  calcularIR,
  calcularRBC,
} from "./calculo-financiero";

export interface KpisDemostracion {
  inversionInicial: number;
  capitalPropio: number;
  capitalPrestamo: number;
  ingresosAnioUno: number;
  costosAnioUno: number;
  utilidadAnioUno: number;
  van: number;
  tir: number | null;
  payback: number;
  ir: number;
  rbc: number;
  tasaDescuento: number;
  ratioPropio: number; // 0..1
  veredictoViable: boolean;
}

export interface SerieAnual {
  anio: string;
  valor: number;
}

export interface SeriesGraficos {
  ingresos: SerieAnual[];
  costos: SerieAnual[];
  utilidad: SerieAnual[];
  flujoNeto: SerieAnual[];
  flujoAcumulado: SerieAnual[];
}

export interface KpisTributacion {
  regimen: "general" | "rts" | "rau" | "sin_actividad";
  ivaTotal: number;
  itTotal: number;
  cuotaFijaTotal: number;
  ingresosConFacturaTotal: number;
  comprasConFacturaTotal: number;
  cargaPorAnio: SerieAnual[];
  serieIVA: SerieAnual[];
  serieIT: SerieAnual[];
  serieCuota: SerieAnual[];
}

/** Suma el costoTotal de todos los ítems de inversión de un proyecto. */
function sumaInversionInicial(p: Proyecto): number {
  const cats = Object.values(p.inversiones ?? {});
  return cats
    .flat()
    .reduce((s, it) => s + (Number((it as { costoTotal?: number }).costoTotal ?? 0) || 0), 0);
}

export function calcularKpis(proyecto: Proyecto): KpisDemostracion {
  const flujo = construirFlujoCaja(proyecto);

  // Fallback defensivo: el shape de retorno de construirFlujoCaja varía
  // entre versiones del proyecto. Leemos lo que esté disponible.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const f = flujo as any;

  const inversionInicial =
    Number(f.inversionInicial ?? f.inversion ?? sumaInversionInicial(proyecto)) || 0;
  const ingresosArr: number[] = (f.ingresosTotales ?? f.ingresos ?? []) as number[];
  const costosArr: number[] = (f.costosTotales ?? f.costos ?? []) as number[];
  const utilidadArr: number[] = (f.utilidadNeta ?? f.utilidad ?? []) as number[];
  const flujoNetoArr: number[] = (f.flujoNeto ?? f.flujosNetos ?? []) as number[];

  // Para VAN/TIR/Payback usamos el flujo de inversionista (capital propio).
  // Convención: año 0 = -inversionInicial; años 1..N = flujos netos.
  const tasaDescuento: number =
    Number(f.tasaDescuento ?? f.wacc ?? proyecto.financiamiento?.costoOportunidadAccionista ?? 0.12) || 0.12;
  const flujosVan: number[] = [-inversionInicial, ...flujoNetoArr];

  let van = 0;
  let tir: number | null = null;
  let payback = 0;
  let ir = 0;
  let rbc = 0;
  try { van = calcularVAN(flujosVan, tasaDescuento); } catch {}
  try { tir = calcularTIR(flujosVan); } catch { tir = null; }
  try { payback = calcularPayback(flujosVan); } catch {}
  try { ir = calcularIR(flujosVan, tasaDescuento); } catch {}
  try { rbc = calcularRBC(ingresosArr, costosArr, tasaDescuento); } catch {}

  // Estructura de capital: el porcentajePrestamo es 0..1 del préstamo de
  // activo fijo. Capital propio = inversión total × porcentajePropio.
  const porcentajePrestamo = Number(proyecto.financiamiento?.porcentajePrestamo ?? 0) || 0;
  const capitalPrestamo = inversionInicial * porcentajePrestamo;
  const capitalPropio = Math.max(0, inversionInicial - capitalPrestamo);
  const ratioPropio = inversionInicial > 0 ? capitalPropio / inversionInicial : 0;

  const ingresosAnioUno = ingresosArr[0] ?? 0;
  const costosAnioUno = costosArr[0] ?? 0;
  const utilidadAnioUno = utilidadArr[0] ?? ingresosAnioUno - costosAnioUno;

  // Veredicto: VAN positivo + TIR superior al costo del dinero.
  const veredictoViable = van > 0 && (tir === null || tir > tasaDescuento);

  return {
    inversionInicial,
    capitalPropio,
    capitalPrestamo,
    ingresosAnioUno,
    costosAnioUno,
    utilidadAnioUno,
    van,
    tir,
    payback,
    ir,
    rbc,
    tasaDescuento,
    ratioPropio,
    veredictoViable,
  };
}

export function calcularSeries(proyecto: Proyecto): SeriesGraficos {
  const flujo = construirFlujoCaja(proyecto);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const f = flujo as any;
  const ingresos: number[] = (f.ingresosTotales ?? f.ingresos ?? []) as number[];
  const costos: number[] = (f.costosTotales ?? f.costos ?? []) as number[];
  const utilidad: number[] = (f.utilidadNeta ?? f.utilidad ?? []) as number[];
  const flujoNeto: number[] = (f.flujoNeto ?? f.flujosNetos ?? []) as number[];

  const anios = Math.max(ingresos.length, costos.length, utilidad.length, flujoNeto.length);
  const label = (i: number) => `Año ${i + 1}`;
  const map = (arr: number[]) => arr.map((valor, i) => ({ anio: label(i), valor }));

  // Flujo acumulado para visualizar el punto de cruce / payback.
  let acc = 0;
  const flujoAcumulado: SerieAnual[] = [];
  for (let i = 0; i < anios; i++) {
    acc += flujoNeto[i] ?? 0;
    flujoAcumulado.push({ anio: label(i), valor: acc });
  }

  return {
    ingresos: map(ingresos),
    costos: map(costos),
    utilidad: map(utilidad),
    flujoNeto: map(flujoNeto),
    flujoAcumulado,
  };
}

/**
 * Datos tributarios para la lámina de carga tributaria mensual/anual.
 * Lee del flujo lo que `construirFlujoCaja` deja en `tributacion` (sesión 13).
 */
export function calcularTributacion(proyecto: Proyecto): KpisTributacion {
  const flujo = construirFlujoCaja(proyecto);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trib = (flujo as any).tributacion ?? {};
  const regimen: KpisTributacion["regimen"] =
    (trib.regimen as KpisTributacion["regimen"]) ?? "sin_actividad";
  const ivaArr: number[] = (trib.ivaPagadoPorAnio as number[]) ?? [];
  const itArr: number[] = (trib.itPagadoPorAnio as number[]) ?? [];
  const cuotaArr: number[] = (trib.cuotaFijaPorAnio as number[]) ?? [];
  const ingresosCF: number[] = (trib.ingresosConFactura as number[]) ?? [];
  const comprasCF: number[] = (trib.comprasConFactura as number[]) ?? [];

  const label = (i: number) => `Año ${i + 1}`;
  const anios = Math.max(ivaArr.length, itArr.length, cuotaArr.length, 5);
  const sum = (arr: number[]) => arr.reduce((s, v) => s + (v || 0), 0);

  const cargaPorAnio: SerieAnual[] = [];
  const serieIVA: SerieAnual[] = [];
  const serieIT: SerieAnual[] = [];
  const serieCuota: SerieAnual[] = [];
  for (let i = 0; i < anios; i++) {
    const iva = ivaArr[i] ?? 0;
    const it = itArr[i] ?? 0;
    const cuota = cuotaArr[i] ?? 0;
    cargaPorAnio.push({ anio: label(i), valor: iva + it + cuota });
    serieIVA.push({ anio: label(i), valor: iva });
    serieIT.push({ anio: label(i), valor: it });
    serieCuota.push({ anio: label(i), valor: cuota });
  }

  return {
    regimen,
    ivaTotal: sum(ivaArr),
    itTotal: sum(itArr),
    cuotaFijaTotal: sum(cuotaArr),
    ingresosConFacturaTotal: sum(ingresosCF),
    comprasConFacturaTotal: sum(comprasCF),
    cargaPorAnio,
    serieIVA,
    serieIT,
    serieCuota,
  };
}

/**
 * Punto de equilibrio en unidades para el primer producto, formato simple.
 * Devuelve null si no hay suficientes datos para calcularlo.
 */
export function calcularPuntoEquilibrioSimple(proyecto: Proyecto): {
  unidades: number;
  ingresoEquilibrio: number;
} | null {
  const prod = proyecto.productos?.[0];
  if (!prod) return null;
  const precio = Number((prod as { precio?: number }).precio ?? 0) || 0;
  const costoVarUnit = Number((prod as { costoVariableUnitario?: number }).costoVariableUnitario ?? 0) || 0;
  if (precio <= costoVarUnit) return null;

  const costoFijoAnual =
    (proyecto.costosAdministracion ?? []).reduce((s, c) => s + (Number((c as { monto?: number }).monto ?? 0) || 0), 0) +
    (proyecto.costosComercializacion ?? []).reduce((s, c) => s + (Number((c as { monto?: number }).monto ?? 0) || 0), 0);

  const unidades = costoFijoAnual / (precio - costoVarUnit);
  return { unidades, ingresoEquilibrio: unidades * precio };
}

export function formatearBolivianos(v: number): string {
  return `Bs ${Math.round(v).toLocaleString("es-BO")}`;
}

export function formatearPorcentaje(v: number, decimales = 1): string {
  return `${(v * 100).toFixed(decimales)}%`;
}
