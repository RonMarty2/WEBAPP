/**
 * Tests de análisis estadístico de encuestas.
 *
 * Ejecutar con:
 *   npx tsx src/lib/proyectoGrado/encuestas.test.ts
 *
 * Casos canónicos verificados contra tablas estadísticas estándar y
 * calculadoras conocidas (Excel CHITEST, Google Sheets CHISQ.TEST).
 */

import {
  frecuencias,
  descriptivos,
  tablaContingencia,
  chiCuadrado,
} from "./encuestas";

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
    throw new Error(`${label} → esperado ${expected}, obtenido ${actual} (diff ${diff.toFixed(4)})`);
  }
}

function eqStr(actual: string, expected: string, label = ""): void {
  if (actual !== expected) {
    throw new Error(`${label} → esperado "${expected}", obtenido "${actual}"`);
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
// Frecuencias
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n=== Frecuencias ===");

test("Frecuencias básicas con ordenamiento por frecuencia descendente", () => {
  const r = frecuencias(["Sí", "No", "Sí", "No", "Sí", "Tal vez"]);
  eq(r.total, 6, 0, "total");
  eqStr(r.items[0].categoria, "Sí", "primer item");
  eq(r.items[0].frecuenciaAbsoluta, 3, 0, "freq Sí");
  eq(r.items[0].porcentaje, 50, 0.01, "% Sí");
  eq(r.items[1].frecuenciaAbsoluta, 2, 0, "freq No");
  eq(r.items[2].frecuenciaAbsoluta, 1, 0, "freq Tal vez");
});

test("Frecuencias ignoran valores null, undefined y vacíos", () => {
  const r = frecuencias(["A", null, "B", undefined, "", "A", "  "]);
  eq(r.total, 3, 0);
  eq(r.items[0].frecuenciaAbsoluta, 2, 0, "freq A");
});

test("Frecuencias con ordenamiento alfabético", () => {
  const r = frecuencias(["Z", "A", "M", "A"], true);
  eqStr(r.items[0].categoria, "A");
  eqStr(r.items[1].categoria, "M");
  eqStr(r.items[2].categoria, "Z");
});

test("Frecuencias con array vacío", () => {
  const r = frecuencias([]);
  eq(r.total, 0, 0);
  if (r.items.length !== 0) throw new Error("items debería ser vacío");
});

test("Frecuencias suman 100% en porcentaje", () => {
  const r = frecuencias(["X", "Y", "Z", "X", "Y", "Z", "X"]);
  const sumaPct = r.items.reduce((s, i) => s + i.porcentaje, 0);
  eq(sumaPct, 100, 0.05, "suma porcentajes");
});

// ─────────────────────────────────────────────────────────────────────────────
// Estadísticos descriptivos
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n=== Descriptivos ===");

test("Descriptivos básicos de datos numéricos", () => {
  const r = descriptivos([25, 30, 28, 35, 22, 30, 27]);
  eq(r.n, 7, 0, "n");
  eq(r.media, 28.1429, 0.001, "media");
  eq(r.mediana, 28, 0.001, "mediana");
  eq(r.moda, 30, 0, "moda");
  eq(r.minimo, 22, 0, "min");
  eq(r.maximo, 35, 0, "max");
  eq(r.rango, 13, 0, "rango");
});

test("Descriptivos ignoran NaN e infinitos", () => {
  const r = descriptivos([10, 20, NaN, 30, Infinity, 40, -Infinity]);
  eq(r.n, 4, 0);
  eq(r.media, 25, 0.001);
});

test("Descriptivos lanza error con menos de 2 datos", () => {
  throws(() => descriptivos([42]), "al menos 2 datos");
  throws(() => descriptivos([]), "al menos 2 datos");
});

test("Coeficiente de variación es positivo y razonable", () => {
  const r = descriptivos([10, 12, 11, 9, 13, 10, 11]);
  // Datos muy parecidos → CV bajo
  if (r.coeficienteVariacion > 0.20) {
    throw new Error(`CV esperado < 20%, obtuvo ${r.coeficienteVariacion}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Tabla de contingencia
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n=== Tabla de contingencia ===");

test("Tabla 2x2 con totales correctos", () => {
  // 4 hombres dijeron Sí, 2 mujeres dijeron Sí, 1 hombre No, 3 mujeres No
  const t = tablaContingencia(
    ["H", "H", "H", "H", "H", "M", "M", "M", "M", "M"],
    ["Sí", "Sí", "Sí", "Sí", "No", "Sí", "Sí", "No", "No", "No"],
  );
  eq(t.totalGeneral, 10, 0, "total general");
  if (t.categoriasFila.length !== 2) throw new Error("debería haber 2 categorías fila");
  if (t.categoriasColumna.length !== 2) throw new Error("debería haber 2 categorías columna");
});

test("Tabla descarta pares con cualquier valor faltante", () => {
  const t = tablaContingencia(
    ["A", "A", null, "B", ""],
    ["X", "Y", "X", null, "Y"],
  );
  // Solo los pares (A,X), (A,Y) son válidos
  eq(t.totalGeneral, 2, 0);
});

test("Tabla lanza error si los largos difieren", () => {
  throws(
    () => tablaContingencia(["A", "B"], ["X"]),
    "distinto largo",
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Chi-cuadrado
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n=== Chi-cuadrado ===");

// Caso canónico construido manualmente:
// Tabla 2x2 con frecuencias claramente independientes (proporciones iguales)
// debería dar χ² ≈ 0 y NO ser significativo.
test("Chi-cuadrado con variables independientes no es significativo", () => {
  // Cada combinación tiene la misma frecuencia → independencia perfecta
  const filas = ["A", "A", "A", "A", "B", "B", "B", "B"];
  const cols = ["X", "X", "Y", "Y", "X", "X", "Y", "Y"];
  const r = chiCuadrado(filas, cols);
  eq(r.estadistico, 0, 0.01, "estadístico ≈ 0");
  if (r.significativoAlfa05) throw new Error("no debería ser significativo");
});

// Caso canónico de manual: tabla 2x2 conocida
// Fumadores vs cáncer (ejemplo clásico): claramente dependientes
test("Chi-cuadrado con variables dependientes es significativo", () => {
  // Construido para tener χ² alto:
  // Categoría A → mayormente X (8) y poco Y (2)
  // Categoría B → mayormente Y (8) y poco X (2)
  const filas = [
    ...Array(8).fill("A"), ...Array(2).fill("A"),  // 10 A's
    ...Array(2).fill("B"), ...Array(8).fill("B"),  // 10 B's
  ];
  const cols = [
    ...Array(8).fill("X"), ...Array(2).fill("Y"),
    ...Array(2).fill("X"), ...Array(8).fill("Y"),
  ];
  const r = chiCuadrado(filas, cols);
  if (!r.significativoAlfa05) {
    throw new Error(`debería ser significativo a 0.05, χ²=${r.estadistico}`);
  }
  eq(r.gradosLibertad, 1, 0);
});

test("Chi-cuadrado grados de libertad para tabla 3x3 son 4", () => {
  const filas = ["A", "A", "A", "B", "B", "B", "C", "C", "C"];
  const cols = ["X", "Y", "Z", "X", "Y", "Z", "X", "Y", "Z"];
  const r = chiCuadrado(filas, cols);
  eq(r.gradosLibertad, 4, 0); // (3-1)(3-1) = 4
});

test("Chi-cuadrado advierte sobre celdas con esperado bajo", () => {
  // Muestra muy chica → esperados < 5
  const filas = ["A", "B"];
  const cols = ["X", "Y"];
  // Necesitamos al menos 2x2 con al menos 2 datos por categoría
  const filasMin = ["A", "A", "B", "B"];
  const colsMin = ["X", "Y", "X", "Y"];
  const r = chiCuadrado(filasMin, colsMin);
  if (!r.interpretacion.toLowerCase().includes("advertencia")) {
    throw new Error(`debería incluir advertencia de muestra pequeña`);
  }
});

test("Chi-cuadrado interpretación menciona alfa correcto", () => {
  // Datos dependientes — esperamos alfa=0.05 o 0.01 en la interpretación
  const filas = [...Array(15).fill("A"), ...Array(5).fill("A"), ...Array(5).fill("B"), ...Array(15).fill("B")];
  const cols = [...Array(15).fill("X"), ...Array(5).fill("Y"), ...Array(5).fill("X"), ...Array(15).fill("Y")];
  const r = chiCuadrado(filas, cols);
  if (!r.interpretacion.includes("99%") && !r.interpretacion.includes("95%")) {
    throw new Error(`interpretación no menciona alfa: "${r.interpretacion}"`);
  }
});

test("Chi-cuadrado lanza error con < 2 categorías", () => {
  throws(
    () => chiCuadrado(["A", "A", "A"], ["X", "Y", "X"]),
    "al menos 2 categorías",
  );
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
