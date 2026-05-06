import assert from "node:assert/strict";
import {
  buildAcademicContextBlock,
  buildDisplayFinalDocument,
  normalizeRouteOptions,
  stripInternalDocumentMarkers,
  summarizePhaseForMemory,
  validateFinalDocument,
} from "../src/lib/academicProject.mjs";
import { appendAITrace, latestAITrace } from "../src/lib/aiTrace.mjs";

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
assert.equal(clean.includes("dato academico no especificado"), false);

const finalDisplay = buildDisplayFinalDocument([
  {
    label: "CAPITULO I",
    content: `# CAPITULO I: INTRODUCCION
Texto del capitulo.
### REFERENCIAS_ETAPA
Autor A. (2020). Fuente A.
Autor B. (2021). Fuente B.`,
  },
  {
    label: "CAPITULO II",
    content: `# CAPITULO II: MARCO TEORICO
Mas contenido.
## Referencias Bibliograficas
Autor A. (2020). Fuente A.
Autor C. (2022). Fuente C.
## ANEXOS
No aplica.`,
  },
  {
    label: "CAPITULO III",
    content: `# CAPITULO III: DISENO METODOLOGICO
Texto metodologico.
## REFERENCIAS\\_ETAPA
Autor D. (2023). Fuente D.`,
  },
]);
assert.equal((finalDisplay.match(/REFERENCIAS BIBLIOGRAFICAS/g) ?? []).length, 1);
assert.equal(finalDisplay.includes("REFERENCIAS_ETAPA"), false);
assert.equal(finalDisplay.includes("REFERENCIAS\\_ETAPA"), false);
assert.equal(finalDisplay.includes("## ANEXOS\nNo aplica"), false);
assert.match(finalDisplay, /Autor A\. \(2020\)/);
assert.match(finalDisplay, /Autor B\. \(2021\)/);
assert.match(finalDisplay, /Autor C\. \(2022\)/);
assert.match(finalDisplay, /Autor D\. \(2023\)/);

const tracedMemory = appendAITrace(
  { ai_trace: [{ id: "old", timestamp: "2026-01-01T00:00:00.000Z" }] },
  {
    id: "new",
    timestamp: "2026-05-06T10:00:00.000Z",
    scope: "generate-phase",
    phase_id: "cap-1",
    phase_label: "Capitulo I",
    action: "generar fase",
    provider_id: "gemini",
    provider_name: "Google Gemini",
    model: "gemini-2.5-pro",
    status: "success",
    duration_ms: 1200,
  }
);
assert.equal(tracedMemory.ai_trace.length, 2);
assert.equal(latestAITrace(tracedMemory).provider_id, "gemini");
assert.equal(latestAITrace(tracedMemory).model, "gemini-2.5-pro");

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
