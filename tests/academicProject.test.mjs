import assert from "node:assert/strict";
import {
  buildAcademicContextBlock,
  normalizeRouteOptions,
  stripInternalDocumentMarkers,
  summarizePhaseForMemory,
  validateFinalDocument,
} from "../src/lib/academicProject.mjs";

const dirty = `
# Fase 1 - CAPITULO I
La investigacion usa [[DATO_EDITABLE:[COMPLETAR: fuente]]]INE 2024[[/DATO_EDITABLE]]
y deja [COMPLETAR: porcentaje] para despues.
`;

const clean = stripInternalDocumentMarkers(dirty);
assert.equal(clean.includes("DATO_EDITABLE"), false);
assert.equal(clean.includes("[COMPLETAR"), false);
assert.equal(clean.includes("Fase 1"), false);
assert.match(clean, /INE 2024/);
assert.match(clean, /dato académico no especificado/);

const validation = validateFinalDocument(`
# CAPITULO I: INTRODUCCION
Contenido.
# CAPITULO II: MARCO TEORICO
Contenido.
# CAPITULO III: DISENO METODOLOGICO
Contenido.
# CAPITULO IV: ANALISIS DE RESULTADOS
Contenido.
# CAPITULO V: CONCLUSIONES
Contenido.
# REFERENCIAS BIBLIOGRAFICAS
Hernandez Sampieri, R. (2014). Metodologia de la investigacion.
`);
assert.deepEqual(validation.errors, []);

const badValidation = validateFinalDocument("Fase 1\n[COMPLETAR: dato]\nSin capitulos");
assert.ok(badValidation.errors.length >= 2);

const options = normalizeRouteOptions({
  rutas: [
    {
      titulo: "Titulo A",
      idea_central: "Idea A",
      problema: "Problema A",
      objetivo_general: "Objetivo A",
      alcance: "Alcance A",
      materiales_prioritarios: ["doc1.pdf"],
      justificacion: "Conviene por A",
    },
  ],
});
assert.equal(options.length, 1);
assert.equal(options[0].id, "ruta-1");
assert.equal(options[0].titulo, "Titulo A");

const phaseSummary = summarizePhaseForMemory("Capitulo I", "Uno dos tres cuatro cinco seis siete ocho nueve diez.");
assert.equal(phaseSummary.phase_label, "Capitulo I");
assert.ok(phaseSummary.summary.length > 0);

const contextBlock = buildAcademicContextBlock({
  contract: options[0],
  studentContext: {
    programa: "Diplomado en Educacion Superior",
    modulos: "Modulo 1\nModulo 2",
  },
  documents: [{ nombre: "doc1.pdf", palabras: 1200, texto: "Contenido base del estudiante" }],
  phaseMemory: [phaseSummary],
});
assert.match(contextBlock, /CONTRATO ACADEMICO/);
assert.match(contextBlock, /MATERIAL DEL ESTUDIANTE/);
assert.match(contextBlock, /MEMORIA DE FASES/);

console.log("academicProject tests passed");
