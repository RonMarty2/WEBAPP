import {
  extractReferenceLines,
  normalizeReferenceCatalog,
} from "@/lib/projectReferences.mjs";

const FORBIDDEN_FINAL_PATTERNS = [
  /\bFase\s+\d+\b/i,
  /\bFASE\s+\d+\b/i,
  /\[COMPLETAR[^\]]*\]/i,
  /\[\[DATO_EDITABLE:/i,
  /DATO_EDITABLE/i,
  /REFERENCIAS_ETAPA/i,
  /contenido truncado/i,
];

const REQUIRED_CHAPTER_PATTERNS = [
  /cap[ií]tulo\s+i\b|capitulo\s+i\b/i,
  /cap[ií]tulo\s+ii\b|capitulo\s+ii\b/i,
  /cap[ií]tulo\s+iii\b|capitulo\s+iii\b/i,
  /cap[ií]tulo\s+iv\b|capitulo\s+iv\b/i,
  /cap[ií]tulo\s+v\b|capitulo\s+v\b/i,
  /referencias|bibliograf/i,
];

function cleanWhitespace(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function words(value) {
  return cleanWhitespace(value).split(/\s+/).filter(Boolean);
}

function clipWords(value, maxWords) {
  const list = words(value);
  if (list.length <= maxWords) return cleanWhitespace(value);
  return `${list.slice(0, maxWords).join(" ")} ...`;
}

export function stripInternalDocumentMarkers(text) {
  return cleanWhitespace(text)
    .replace(/\[\[DATO_EDITABLE:[\s\S]*?\]\]([\s\S]*?)\[\[\/DATO_EDITABLE\]\]/g, "$1")
    .replace(/\s*\[COMPLETAR[^\]]*\]\s*/gi, " ")
    .replace(/^#{1,6}\s*Fase\s+\d+\s*[—-]\s*/gim, "# ")
    .replace(/\bFase\s+\d+\s*[—-]\s*/gi, "")
    .replace(/REFERENCIAS\\_ETAPA/g, "")
    .replace(/REFERENCIAS_ETAPA/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeForMatch(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\\_/g, "_")
    .replace(/[\u0300-\u036f]/g, "");
}

function isMarkdownHeading(line) {
  return /^#{1,6}\s+/.test(line.trim());
}

function isReferenceHeading(line) {
  const normalized = normalizeForMatch(line).replace(/^#+\s*/, "").trim();
  return normalized.includes("referencias_etapa")
    || normalized === "referencias"
    || normalized.includes("referencias bibliograficas")
    || normalized.includes("bibliografia");
}

function isAnnexHeading(line) {
  const normalized = normalizeForMatch(line).replace(/^#+\s*/, "").trim();
  return normalized === "anexos" || normalized.startsWith("anexo ");
}

function splitVisibleBodyAndBackMatter(content) {
  const lines = cleanWhitespace(content).split("\n");
  const body = [];
  const references = [];
  const annexes = [];
  let mode = "body";

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (isReferenceHeading(line)) {
      mode = "references";
      continue;
    }
    if (isAnnexHeading(line)) {
      mode = "annexes";
      continue;
    }
    if (isMarkdownHeading(line) && (mode === "references" || mode === "annexes")) {
      mode = "body";
    }

    if (mode === "references") {
      references.push(...extractReferenceLines(`## Referencias Bibliograficas\n${line}`));
      continue;
    }

    if (mode === "annexes") {
      const cleaned = stripInternalDocumentMarkers(line);
      if (cleaned) annexes.push(cleaned);
      continue;
    }

    body.push(rawLine);
  }

  return {
    body: stripInternalDocumentMarkers(body.join("\n")),
    references,
    annexes,
  };
}

export function buildDisplayFinalDocument(phaseContents = [], options = {}) {
  const bodyParts = [];
  const referenceSet = new Set();
  const annexSet = new Set();

  for (const item of phaseContents) {
    const raw = typeof item === "string" ? item : item?.content;
    if (!raw?.trim()) continue;
    const split = splitVisibleBodyAndBackMatter(raw);
    if (split.body) bodyParts.push(split.body);
    for (const ref of split.references) referenceSet.add(ref);
    for (const annex of split.annexes) annexSet.add(annex);
  }

  for (const ref of normalizeReferenceCatalog(options.referenceCatalog)) {
    referenceSet.add(ref);
  }

  for (const annex of Array.isArray(options.annexes) ? options.annexes : []) {
    if (annex) annexSet.add(String(annex).trim());
  }

  const references = [...referenceSet].sort((a, b) => a.localeCompare(b, "es"));
  const annexes = [...annexSet];
  const finalParts = bodyParts.filter(Boolean);

  finalParts.push(
    `# REFERENCIAS BIBLIOGRAFICAS\n\n${
      references.length
        ? references.join("\n\n")
        : "Las referencias bibliograficas se consolidan a partir de las fuentes citadas en el desarrollo del documento."
    }`
  );

  finalParts.push(
    `# ANEXOS\n\n${
      annexes.length
        ? annexes.join("\n")
        : "No se registraron documentos anexos independientes en el sistema."
    }`
  );

  return cleanWhitespace(finalParts.join("\n\n"));
}

export function validateFinalDocument(text) {
  const value = cleanWhitespace(text);
  const errors = [];
  const warnings = [];

  if (!value) errors.push("El documento final esta vacio.");

  for (const pattern of FORBIDDEN_FINAL_PATTERNS) {
    if (pattern.test(value)) {
      errors.push(`Contiene una marca interna prohibida: ${pattern.source}`);
    }
  }

  const missing = REQUIRED_CHAPTER_PATTERNS.filter((pattern) => !pattern.test(value));
  if (missing.length > 0) {
    errors.push("Faltan capitulos o secciones obligatorias de una monografia final.");
  }

  const wordCount = words(value).length;
  if (wordCount < 1200) {
    warnings.push("El documento final parece corto para una monografia entregable.");
  }

  return { ok: errors.length === 0, errors, warnings, wordCount };
}

export function normalizeRouteOptions(raw) {
  const source = Array.isArray(raw) ? raw : raw?.rutas;
  if (!Array.isArray(source)) return [];
  return source.slice(0, 3).map((item, index) => ({
    id: String(item.id || `ruta-${index + 1}`),
    titulo: cleanWhitespace(item.titulo || item.title || `Ruta ${index + 1}`),
    idea_central: cleanWhitespace(item.idea_central || item.idea || item.descripcion || ""),
    problema: cleanWhitespace(item.problema || ""),
    objetivo_general: cleanWhitespace(item.objetivo_general || item.objetivo || ""),
    alcance: cleanWhitespace(item.alcance || ""),
    materiales_prioritarios: Array.isArray(item.materiales_prioritarios)
      ? item.materiales_prioritarios.map(String)
      : [],
    justificacion: cleanWhitespace(item.justificacion || item.por_que_conviene || ""),
  }));
}

export function parseJsonFromAi(text) {
  const raw = cleanWhitespace(text);
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced || raw.match(/\{[\s\S]*\}/)?.[0] || raw;
  return JSON.parse(candidate);
}

export function summarizePhaseForMemory(phaseLabel, content) {
  const cleaned = stripInternalDocumentMarkers(content);
  return {
    phase_label: cleanWhitespace(phaseLabel),
    summary: clipWords(cleaned, 110),
    key_terms: Array.from(
      new Set(
        cleaned
          .replace(/[^\p{L}\p{N}\s]/gu, " ")
          .split(/\s+/)
          .filter((word) => word.length > 8)
          .slice(0, 18)
      )
    ),
    word_count: words(cleaned).length,
  };
}

function formatDocumentCards(documents = []) {
  if (!Array.isArray(documents) || documents.length === 0) {
    return "No se subieron materiales. La IA debe completar con criterio academico verificable y prudente.";
  }
  return documents
    .slice(0, 8)
    .map((doc, index) => {
      const name = doc.nombre || doc.name || `Documento ${index + 1}`;
      const count = doc.palabras ? ` (${doc.palabras} palabras extraidas)` : "";
      const text = clipWords(doc.texto || doc.contenido_extraido || "", 350);
      return `DOCUMENTO ${index + 1}: ${name}${count}\n${text}`;
    })
    .join("\n\n");
}

export function buildAcademicContextBlock({
  contract,
  studentContext = {},
  documents = [],
  phaseMemory = [],
} = {}) {
  const selected = contract || {};
  const modules = studentContext.modulos || studentContext.materias || "";
  const contextLines = [
    studentContext.tema ? `Tema/interes inicial: ${studentContext.tema}` : null,
    studentContext.programa ? `Programa/diplomado/curso: ${studentContext.programa}` : null,
    modules ? `Modulos cursados:\n${modules}` : null,
    studentContext.contexto_laboral ? `Contexto laboral/institucional: ${studentContext.contexto_laboral}` : null,
  ].filter(Boolean);

  const memoryLines = Array.isArray(phaseMemory) && phaseMemory.length
    ? phaseMemory.map((item, index) => {
        return `INSUMO INTERNO ${index + 1}: ${item.phase_label || "Sin etiqueta"}\nResumen: ${item.summary || ""}`;
      }).join("\n\n")
    : "Aun no hay insumos internos generados.";

  return `
=== CONTRATO ACADEMICO DEL PROYECTO ===
Titulo elegido: ${selected.titulo || "No definido"}
Idea central: ${selected.idea_central || "No definida"}
Problema: ${selected.problema || "No definido"}
Objetivo general: ${selected.objetivo_general || "No definido"}
Alcance: ${selected.alcance || "No definido"}
Justificacion de la ruta: ${selected.justificacion || "No definida"}

=== CONTEXTO DEL ESTUDIANTE ===
${contextLines.join("\n") || "No se registro contexto adicional."}

=== MATERIAL DEL ESTUDIANTE ===
${formatDocumentCards(documents)}

=== MEMORIA DE FASES INTERNAS ===
${memoryLines}

=== REGLAS DE COHERENCIA ===
Las fases son organizacion interna del sistema. Nunca escribas "Fase 1", "Fase 2" ni etiquetas internas en el documento final.
Respeta el contrato academico elegido. Si falta material, completa con criterio academico, sin dejar espacios pendientes.
Prioriza el material del estudiante cuando exista. Usa conocimiento general solo para completar y conectar ideas sin contradecir el material base.
No inventes cifras, instituciones, leyes o fuentes especificas. Si no hay dato exacto, redacta de forma prudente y academica.
`.trim();
}

export function buildFinalConsolidationPrompt({
  contract,
  studentContext = {},
  documents = [],
  phaseMemory = [],
  phaseContents = [],
  referenceCatalog = [],
  formatRules = "",
} = {}) {
  const context = buildAcademicContextBlock({ contract, studentContext, documents, phaseMemory });
  const internalReferences = new Set(normalizeReferenceCatalog(referenceCatalog));
  const content = phaseContents
    .filter((item) => item?.content?.trim())
    .map((item, index) => {
      const split = splitVisibleBodyAndBackMatter(item.content);
      for (const ref of split.references) internalReferences.add(ref);
      return `=== INSUMO INTERNO ${index + 1}: ${item.label || "Seccion"} ===\n${split.body}`;
    })
    .join("\n\n");

  return {
    system: `
Eres un editor academico senior. Tu tarea es crear una MONOGRAFIA FINAL ENTREGABLE, no un borrador ni una suma de fases.
Debes consolidar, reescribir, ordenar y limpiar los insumos internos.
El resultado debe estar listo para generar PDF academico.
Prohibido dejar marcas internas: Fase, COMPLETAR, DATO_EDITABLE, REFERENCIAS_ETAPA, notas para el usuario o instrucciones del sistema.
Prohibido decir que falta informacion. Si falta algo, resuelve con redaccion academica prudente.
${formatRules ? `\nReglas de formato institucional:\n${formatRules}` : ""}
`.trim(),
    user: `
${context}

=== INSUMOS GENERADOS POR FASES INTERNAS ===
${content || "No hay insumos internos suficientes. Genera la monografia desde el contrato y el contexto disponible."}

=== REFERENCIAS INTERNAS DETECTADAS ===
${[...internalReferences].join("\n") || "No se detectaron referencias internas estructuradas."}

Genera una unica monografia final en Markdown academico con esta estructura:
# CAPITULO I: INTRODUCCION Y ANTECEDENTES
# CAPITULO II: MARCO TEORICO Y REFERENCIAL
# CAPITULO III: DISENO METODOLOGICO
# CAPITULO IV: ANALISIS DE RESULTADOS Y PROPUESTA
# CAPITULO V: CONCLUSIONES Y RECOMENDACIONES
# REFERENCIAS BIBLIOGRAFICAS

No incluyas portada ni indice en el Markdown: el sistema los genera con el formato institucional.
`.trim(),
  };
}
