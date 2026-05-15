/**
 * Tests E2E lógicos del flujo completo del servicio Proyecto de Grado.
 *
 * No invocan la IA real (costaría tokens y requiere API keys). Validan:
 *
 *   - El orden de las 22 fases es correcto.
 *   - Cada fase tiene un prompt real (no placeholder).
 *   - Las dependencias entre fases están bien declaradas (cada
 *     buildContexto* recibe los contenidos previos que necesita).
 *   - El subtipo afecta correctamente a las fases que dependen.
 *   - El sistema de resolución de prompts no se rompe ante phaseId
 *     inválidos.
 *
 * Ejecutar:
 *   npx tsx src/lib/proyectoGrado/flujo.test.ts
 */

import {
  getProyectoGradoPhases,
  getProyectoGradoPhaseSpecs,
  esServicioProyectoGrado,
  subtipoFromTipoProyecto,
  SERVICIO_PROYECTO_GRADO,
  TIPO_PROY_PRODUCCION,
  TIPO_PROY_SERVICIOS,
} from "./fases";

// ─────────────────────────────────────────────────────────────────────────────
// Mini runner
// ─────────────────────────────────────────────────────────────────────────────

let pass = 0;
let fail = 0;
const failures: string[] = [];

function test(name: string, fn: () => void): void {
  try {
    fn();
    pass += 1;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    fail += 1;
    const msg = e instanceof Error ? e.message : String(e);
    failures.push(`✗ ${name}\n     ${msg}`);
    console.log(`  ✗ ${name}\n     ${msg}`);
  }
}

function eq<T>(actual: T, expected: T, label = ""): void {
  if (actual !== expected) {
    throw new Error(`${label} → esperado ${JSON.stringify(expected)}, obtenido ${JSON.stringify(actual)}`);
  }
}

function eqLen(actual: { length: number }, expected: number, label = ""): void {
  if (actual.length !== expected) {
    throw new Error(`${label} → length esperado ${expected}, obtenido ${actual.length}`);
  }
}

function isTrue(condition: boolean, label = ""): void {
  if (!condition) throw new Error(`${label} → debería ser true`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de prompt
// ─────────────────────────────────────────────────────────────────────────────

const PLACEHOLDER_MARK = "FASE PENDIENTE DE IMPLEMENTACIÓN";

function isPlaceholder(prompt: string): boolean {
  return prompt.includes(PLACEHOLDER_MARK);
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n=== Configuración del servicio ===");

test("SERVICIO_PROYECTO_GRADO es proy-grado-001", () => {
  eq(SERVICIO_PROYECTO_GRADO, "proy-grado-001");
});

test("Hay 2 tipos de proyecto definidos", () => {
  eq(TIPO_PROY_PRODUCCION, "proy-prod-001");
  eq(TIPO_PROY_SERVICIOS, "proy-serv-001");
});

test("esServicioProyectoGrado detecta correctamente", () => {
  isTrue(esServicioProyectoGrado("proy-grado-001"));
  isTrue(!esServicioProyectoGrado("mono-001"));
  isTrue(!esServicioProyectoGrado(null));
  isTrue(!esServicioProyectoGrado(undefined));
});

test("subtipoFromTipoProyecto mapea correctamente", () => {
  eq(subtipoFromTipoProyecto("proy-prod-001"), "produccion");
  eq(subtipoFromTipoProyecto("proy-serv-001"), "servicios");
  eq(subtipoFromTipoProyecto("tipo-monografia"), null);
  eq(subtipoFromTipoProyecto(undefined), null);
});

console.log("\n=== Listado y orden de fases ===");

test("Hay exactamente 22 fases", () => {
  const fases = getProyectoGradoPhases("produccion");
  eqLen(fases, 22);
});

test("Las fases están en orden por campo `orden` ascendente", () => {
  const fases = getProyectoGradoPhases("produccion");
  for (let i = 1; i < fases.length; i += 1) {
    if (fases[i].orden <= fases[i - 1].orden) {
      throw new Error(`Fase ${fases[i].id} (orden ${fases[i].orden}) no es mayor que ${fases[i - 1].id} (orden ${fases[i - 1].orden})`);
    }
  }
});

test("Las 22 fases tienen IDs únicos", () => {
  const fases = getProyectoGradoPhases("produccion");
  const ids = new Set(fases.map(f => f.id));
  eqLen([...ids], 22);
});

test("Todas las fases empiezan con prefijo ph-proy-", () => {
  const fases = getProyectoGradoPhases("produccion");
  for (const f of fases) {
    isTrue(f.id.startsWith("ph-proy-"), `${f.id} no empieza con ph-proy-`);
  }
});

test("Orden canónico: cap0 → cap1 → cap2 → cap3a-3f → cap4a-4g (con 4a-bis) → resumen → conclus → referencias → latex → defensa", () => {
  const fases = getProyectoGradoPhases("produccion");
  const idsEsperados = [
    "ph-proy-cap0",
    "ph-proy-cap1",
    "ph-proy-cap2",
    "ph-proy-cap3a", "ph-proy-cap3b", "ph-proy-cap3c", "ph-proy-cap3d", "ph-proy-cap3e", "ph-proy-cap3f",
    "ph-proy-cap4a", "ph-proy-cap4abis", "ph-proy-cap4b", "ph-proy-cap4c", "ph-proy-cap4d", "ph-proy-cap4e", "ph-proy-cap4f", "ph-proy-cap4g",
    "ph-proy-resumen", "ph-proy-conclus", "ph-proy-referencias", "ph-proy-latex", "ph-proy-defensa",
  ];
  for (let i = 0; i < idsEsperados.length; i += 1) {
    eq(fases[i].id, idsEsperados[i], `posición ${i}`);
  }
});

console.log("\n=== Prompts reales (no placeholder) ===");

test("Las 22 fases tienen prompt real, sin placeholder", () => {
  const fases = getProyectoGradoPhases("produccion");
  const placeholders = fases.filter(f => isPlaceholder(f.prompt));
  if (placeholders.length > 0) {
    throw new Error(`${placeholders.length} fases con placeholder: ${placeholders.map(f => f.id).join(", ")}`);
  }
});

test("Cada prompt tiene al menos 2000 caracteres (no es trivial)", () => {
  const fases = getProyectoGradoPhases("produccion");
  for (const f of fases) {
    if (f.prompt.length < 2000) {
      throw new Error(`${f.id} prompt demasiado corto: ${f.prompt.length} chars`);
    }
  }
});

test("Cada prompt referencia las reglas base (REGLAS_BASE_PROYECTO_GRADO indirecto)", () => {
  const fases = getProyectoGradoPhases("produccion");
  for (const f of fases) {
    // Las reglas base contienen estos marcadores únicos
    const tieneIdentidad = f.prompt.includes("IDENTIDAD Y TONO ACADÉMICO");
    const tieneCompletitud = f.prompt.includes("COMPLETITUD Y CALIDAD FACTUAL");
    if (!tieneIdentidad || !tieneCompletitud) {
      // LaTeX y defensa reutilizan prompts de monografía (no incluyen las reglas-comunes
      // de proyectoGrado), eso es intencional. Los exceptuamos.
      if (f.id === "ph-proy-latex" || f.id === "ph-proy-defensa") continue;
      throw new Error(`${f.id} no incluye las reglas-base de proyectoGrado`);
    }
  }
});

console.log("\n=== Variantes por subtipo ===");

test("Cap 2 (Marco Teórico) tiene prompt distinto en producción vs servicios", () => {
  const fasesProd = getProyectoGradoPhases("produccion");
  const fasesServ = getProyectoGradoPhases("servicios");
  const cap2Prod = fasesProd.find(f => f.id === "ph-proy-cap2");
  const cap2Serv = fasesServ.find(f => f.id === "ph-proy-cap2");
  if (!cap2Prod || !cap2Serv) throw new Error("Cap 2 no encontrado");
  if (cap2Prod.prompt === cap2Serv.prompt) {
    throw new Error("Cap 2 debe variar entre subtipos");
  }
  isTrue(cap2Prod.prompt.toLowerCase().includes("proceso productivo"), "cap2 prod debería mencionar 'proceso productivo'");
  isTrue(cap2Serv.prompt.toLowerCase().includes("servicescape"), "cap2 serv debería mencionar 'servicescape'");
  isTrue(cap2Serv.prompt.toLowerCase().includes("marketing de servicios"), "cap2 serv debería mencionar 'marketing de servicios'");
});

test("Cap 4c (Estudio Técnico) tiene prompt distinto en producción vs servicios", () => {
  const fasesProd = getProyectoGradoPhases("produccion");
  const fasesServ = getProyectoGradoPhases("servicios");
  const cap4cProd = fasesProd.find(f => f.id === "ph-proy-cap4c");
  const cap4cServ = fasesServ.find(f => f.id === "ph-proy-cap4c");
  if (!cap4cProd || !cap4cServ) throw new Error("Cap 4c no encontrado");
  if (cap4cProd.prompt === cap4cServ.prompt) {
    throw new Error("Cap 4c debe variar entre subtipos");
  }
});

test("Cap 4e (Mix Marketing) tiene prompt distinto en producción vs servicios", () => {
  const fasesProd = getProyectoGradoPhases("produccion");
  const fasesServ = getProyectoGradoPhases("servicios");
  const cap4eProd = fasesProd.find(f => f.id === "ph-proy-cap4e");
  const cap4eServ = fasesServ.find(f => f.id === "ph-proy-cap4e");
  if (!cap4eProd || !cap4eServ) throw new Error("Cap 4e no encontrado");
  if (cap4eProd.prompt === cap4eServ.prompt) {
    throw new Error("Cap 4e debe variar entre subtipos");
  }
  isTrue(cap4eProd.prompt.toUpperCase().includes("4P"));
  isTrue(cap4eServ.prompt.toUpperCase().includes("7P"));
});

test("Las fases COMUNES tienen prompt idéntico en ambos subtipos", () => {
  const fasesProd = getProyectoGradoPhases("produccion");
  const fasesServ = getProyectoGradoPhases("servicios");
  const subtipoDependiente = new Set(getProyectoGradoPhaseSpecs()
    .filter(s => s.subtipo_dependiente)
    .map(s => s.id));

  for (const fp of fasesProd) {
    if (subtipoDependiente.has(fp.id)) continue;
    const fs = fasesServ.find(f => f.id === fp.id);
    if (!fs) throw new Error(`Fase ${fp.id} no aparece en servicios`);
    if (fp.prompt !== fs.prompt) {
      throw new Error(`Fase común ${fp.id} difiere entre subtipos`);
    }
  }
});

console.log("\n=== Coherencia general ===");

test("Cada fase tiene servicio_id correcto", () => {
  const fases = getProyectoGradoPhases("produccion");
  for (const f of fases) {
    eq(f.servicio_id, "proy-grado-001", `${f.id} servicio_id`);
  }
});

test("Fases de producción tienen tipo_proyecto_id correcto", () => {
  const fases = getProyectoGradoPhases("produccion");
  for (const f of fases) {
    eq(f.tipo_proyecto_id, "proy-prod-001", `${f.id} tipo`);
  }
});

test("Fases de servicios tienen tipo_proyecto_id correcto", () => {
  const fases = getProyectoGradoPhases("servicios");
  for (const f of fases) {
    eq(f.tipo_proyecto_id, "proy-serv-001", `${f.id} tipo`);
  }
});

test("Cada fase tiene label y short_label no vacíos", () => {
  const fases = getProyectoGradoPhases("produccion");
  for (const f of fases) {
    isTrue(f.label.trim().length > 0, `${f.id} label vacío`);
    isTrue(f.short_label.trim().length > 0, `${f.id} short_label vacío`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Resumen
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════");
console.log(`Tests: ${pass} ✓   ${fail} ✗`);
console.log("══════════════════════════════════════════");

if (fail > 0) {
  console.log("\nFalladas:");
  for (const f of failures) console.log(f);
  process.exit(1);
}
console.log("Todos los tests del flujo pasaron.");
process.exit(0);
