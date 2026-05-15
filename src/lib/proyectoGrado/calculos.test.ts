/**
 * Tests de cálculos financieros para Proyecto de Grado.
 *
 * Ejecutar con:
 *   npx tsx src/lib/proyectoGrado/calculos.test.ts
 *
 * Los valores esperados están tomados de manuales académicos estándar
 * (Sapag Chain, Brealey-Myers) y de calculadoras financieras conocidas
 * (Excel VNA/VAN, Google Sheets NPV). Si un test falla, hay un bug real
 * en la fórmula.
 */

import {
  van,
  tir,
  wacc,
  puntoEquilibrio,
  amortizacion,
  paybackDescontado,
  tamanoMuestra,
  construirFlujoCaja,
  pctToDecimal,
  decimalToPct,
} from "./calculos";

// ─────────────────────────────────────────────────────────────────────────────
// Mini test runner sin dependencias externas
// ─────────────────────────────────────────────────────────────────────────────

let passCount = 0;
let failCount = 0;
const failures: string[] = [];

function test(name: string, fn: () => void): void {
  try {
    fn();
    passCount += 1;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failCount += 1;
    const msg = e instanceof Error ? e.message : String(e);
    failures.push(`✗ ${name}\n     ${msg}`);
    console.log(`  ✗ ${name}\n     ${msg}`);
  }
}

function eq(actual: number, expected: number, tolerance = 0.01, label = ""): void {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(
      `${label} → esperado ${expected}, obtenido ${actual} (diff ${diff.toFixed(4)})`,
    );
  }
}

function throws(fn: () => unknown, expectedMsg: string): void {
  try {
    fn();
    throw new Error(`debería haber lanzado error con mensaje "${expectedMsg}"`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!msg.includes(expectedMsg)) {
      throw new Error(`mensaje incorrecto. Esperado contener "${expectedMsg}", obtenido "${msg}"`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n=== Helpers ===");
test("pctToDecimal convierte 12 a 0.12", () => eq(pctToDecimal(12), 0.12));
test("decimalToPct convierte 0.25 a 25", () => eq(decimalToPct(0.25), 25));

console.log("\n=== VAN ===");

// Caso canónico: flujos [-1000, 300, 400, 500, 600] al 10%
// Convención académica (Sapag Chain): flujos[0] está en t=0 (sin descontar).
// Cálculo:
//   t=0: -1000 / 1.10^0 = -1000
//   t=1:  300 / 1.10^1 =  272.73
//   t=2:  400 / 1.10^2 =  330.58
//   t=3:  500 / 1.10^3 =  375.66
//   t=4:  600 / 1.10^4 =  409.81
//   VAN ≈ 388.77
// (Si se usa Excel =VNA(10%, 300..600) - 1000 da 416.62 porque VNA asume
//  todos los flujos en t≥1. Nuestra convención es la académica.)
test("VAN de flujo simple a 10% (convención t=0 para flujos[0])", () => {
  eq(van([-1000, 300, 400, 500, 600], 0.10), 388.77);
});

// VAN con tasa 0% es la suma simple
test("VAN con tasa 0% es la suma de flujos", () => {
  eq(van([-100, 50, 50, 50], 0), 50);
});

// VAN negativo: proyecto malo
test("VAN negativo cuando la tasa supera la rentabilidad del proyecto", () => {
  const v = van([-1000, 200, 200, 200, 200], 0.20);
  if (v >= 0) throw new Error(`VAN debería ser negativo, obtuvo ${v}`);
});

// VAN cero cuando flujos compensan exactamente
test("VAN ≈ 0 cuando los flujos compensan la inversión al descuento", () => {
  // Inversión 1000, flujo único de 1100 al año 1, tasa 10% → VAN = 0
  eq(van([-1000, 1100], 0.10), 0);
});

test("VAN lanza error con tasa <= -1", () => {
  throws(() => van([-100, 50], -1), "tasa no puede ser menor o igual");
});

console.log("\n=== TIR ===");

// Caso canónico: flujos [-1000, 300, 400, 500, 600] → TIR ≈ 24.89%
// Coincide con Excel =TIR() con tolerancia de 0.1% absoluto.
test("TIR de flujo simple ≈ 24.89%", () => {
  eq(tir([-1000, 300, 400, 500, 600]), 0.2489, 0.001);
});

// Si VAN al WACC es 0, la TIR = WACC
test("TIR coincide con la tasa que hace VAN = 0", () => {
  // [-1000, 1100] tiene VAN=0 a 10%, así que TIR = 10%
  eq(tir([-1000, 1100]), 0.10, 0.0001);
});

test("TIR lanza error si todos los flujos son positivos (no hay cambio de signo)", () => {
  throws(() => tir([100, 200, 300]), "cambio de signo");
});

console.log("\n=== WACC ===");

// Caso canónico: E=60K, D=40K, Re=18%, Rd=10%, T=25% → WACC ≈ 13.80%
test("WACC con escudo fiscal", () => {
  const result = wacc({
    capitalPropio: 60000,
    deuda: 40000,
    tasaCapitalPropio: 0.18,
    tasaDeuda: 0.10,
    tasaImpositiva: 0.25,
  });
  // WACC = 0.6×0.18 + 0.4×0.10×0.75 = 0.108 + 0.030 = 0.138
  eq(result, 0.138, 0.001);
});

test("WACC sin deuda = costo del capital propio", () => {
  const result = wacc({
    capitalPropio: 100000, deuda: 0,
    tasaCapitalPropio: 0.15, tasaDeuda: 0,
    tasaImpositiva: 0.25,
  });
  eq(result, 0.15);
});

test("WACC sin capital propio = tasa de deuda × (1-T)", () => {
  const result = wacc({
    capitalPropio: 0, deuda: 100000,
    tasaCapitalPropio: 0, tasaDeuda: 0.10,
    tasaImpositiva: 0.25,
  });
  eq(result, 0.075); // 0.10 × 0.75
});

console.log("\n=== Punto de equilibrio ===");

// Caso canónico: CF=12K, P=50, CVu=30 → Q*=600, $*=30000
test("Punto de equilibrio en unidades y monto", () => {
  const r = puntoEquilibrio({ costosFijos: 12000, precioVenta: 50, costoVariableUnitario: 30 });
  eq(r.unidades, 600, 0.01, "unidades");
  eq(r.monto, 30000, 0.01, "monto");
  eq(r.margenContribucion, 20, 0.01, "margen");
  eq(r.razonContribucion, 0.4, 0.001, "razón");
});

test("Punto de equilibrio lanza error si CVu >= P", () => {
  throws(() => puntoEquilibrio({ costosFijos: 1000, precioVenta: 10, costoVariableUnitario: 15 }), "menor que");
});

console.log("\n=== Amortización ===");

// Caso canónico francés: 10000 al 10% en 4 años → cuota fija ≈ 3154.71
// Verificado con calculadora online y fórmula PMT de Excel
test("Amortización francesa: cuota fija coincide con PMT de Excel", () => {
  const r = amortizacion({ capital: 10000, tasaPeriodo: 0.10, numPeriodos: 4, metodo: "frances" });
  eq(r.cuotas.length, 4, 0, "longitud");
  eq(r.cuotas[0].cuota, 3154.71, 0.50, "cuota 1");
  eq(r.cuotas[3].cuota, 3154.71, 0.50, "cuota 4 (igual que la 1)");
  eq(r.cuotas[3].saldoFinal, 0, 1, "saldo final ≈ 0");
});

// Caso canónico alemán: amortización fija de capital = 10000/4 = 2500
test("Amortización alemana: capital fijo 2500 cada período", () => {
  const r = amortizacion({ capital: 10000, tasaPeriodo: 0.10, numPeriodos: 4, metodo: "aleman" });
  for (const cuota of r.cuotas) {
    eq(cuota.amortizacionCapital, 2500, 0.01, `período ${cuota.periodo}`);
  }
  // Primera cuota = 2500 + 1000 = 3500
  eq(r.cuotas[0].cuota, 3500, 0.01, "cuota 1 (mayor)");
  // Última cuota = 2500 + 250 = 2750
  eq(r.cuotas[3].cuota, 2750, 0.01, "cuota 4 (menor)");
});

// Caso canónico americano: 3 períodos de solo intereses + 1 con todo
test("Amortización americana: intereses periódicos + capital al final", () => {
  const r = amortizacion({ capital: 10000, tasaPeriodo: 0.10, numPeriodos: 4, metodo: "americano" });
  eq(r.cuotas[0].cuota, 1000, 0.01, "cuota 1 (solo interés)");
  eq(r.cuotas[2].cuota, 1000, 0.01, "cuota 3 (solo interés)");
  eq(r.cuotas[3].cuota, 11000, 0.01, "cuota 4 (interés + capital)");
  eq(r.cuotas[3].saldoFinal, 0, 0, "saldo final = 0");
});

console.log("\n=== Payback descontado ===");

// Caso canónico: [-1000, 400, 400, 400, 400] al 10%
// Flujos descontados acumulados: -1000, -636.36, -305.79, -5.41, +267.78
// Payback ≈ 3 + 5.41/273.21 = 3.02 (aprox)
test("Payback descontado calcula el período de recuperación", () => {
  const pb = paybackDescontado([-1000, 400, 400, 400, 400], 0.10);
  if (pb === null) throw new Error("debería recuperar dentro del horizonte");
  if (pb < 3 || pb > 4) throw new Error(`payback esperado entre 3 y 4 años, obtenido ${pb}`);
});

test("Payback null cuando no se recupera dentro del horizonte", () => {
  const pb = paybackDescontado([-1000, 50, 50, 50], 0.10);
  if (pb !== null) throw new Error(`esperado null, obtenido ${pb}`);
});

console.log("\n=== Tamaño de muestra ===");

// Caso canónico: 700K habitantes, 95%, ±5% → n ≈ 384
test("Tamaño de muestra para población grande (Cochabamba, 95%, ±5%)", () => {
  const n = tamanoMuestra({ poblacion: 700000, nivelConfianza: 0.95, margenError: 0.05 });
  eq(n, 384, 1);
});

// Caso canónico: población infinita, 95%, ±5% → n ≈ 385
test("Tamaño de muestra para población infinita coincide con fórmula clásica", () => {
  const n = tamanoMuestra({ poblacion: Infinity, nivelConfianza: 0.95, margenError: 0.05 });
  eq(n, 385, 1);
});

// Población pequeña: la corrección por finitud reduce mucho la muestra
test("Tamaño de muestra para población pequeña aplica corrección finita", () => {
  const nInf = tamanoMuestra({ poblacion: Infinity, nivelConfianza: 0.95, margenError: 0.05 });
  const nFin = tamanoMuestra({ poblacion: 500, nivelConfianza: 0.95, margenError: 0.05 });
  if (nFin >= nInf) throw new Error(`población finita debería ser menor que infinita, ${nFin} vs ${nInf}`);
});

console.log("\n=== Construcción de flujo de caja ===");

test("Flujo de caja se construye correctamente con depreciación e impuestos", () => {
  const flujos = construirFlujoCaja({
    inversionInicial: 50000,
    ingresosAnuales: [30000, 35000, 40000, 45000, 50000],
    costosAnuales: [15000, 16000, 17000, 18000, 19000],
    tasaImpositiva: 0.25,
    depreciacionAnual: 10000,
    valorRescate: 5000,
  });
  // 1 año = -50000 (inv), 5 años de operación = 6 elementos total
  eq(flujos.length, 6, 0, "longitud");
  eq(flujos[0], -50000, 0, "inversión inicial negativa");
  // Año 1: U = 30000 - 15000 - 10000 = 5000; T = 5000×0.25 = 1250; FC = 5000 - 1250 + 10000 = 13750
  eq(flujos[1], 13750, 0.01, "año 1");
  // Año 5 incluye rescate
  if (flujos[5] <= flujos[4]) {
    // No es garantía que sea mayor, depende del crecimiento de costos, pero con estos datos sí
    throw new Error("año 5 debería ser mayor por el rescate sumado");
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Resumen final
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════");
console.log(`Tests: ${passCount} ✓   ${failCount} ✗`);
console.log("══════════════════════════════════════════");

if (failCount > 0) {
  console.log("\nFalladas:");
  for (const f of failures) console.log(f);
  process.exit(1);
}
console.log("Todos los tests pasaron.");
process.exit(0);
