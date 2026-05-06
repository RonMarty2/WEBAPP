function normalizeForMatch(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\\_/g, "_")
    .replace(/[\u0300-\u036f]/g, "");
}

export function cleanReferenceLine(line) {
  return String(line ?? "")
    .replace(/^[-*]\s*/, "")
    .replace(/^#{1,6}\s*/, "")
    .replace(/\[COMPLETAR[^\]]*\]/gi, "")
    .replace(/REFERENCIAS_ETAPA/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isReferenceHeading(line) {
  const normalized = normalizeForMatch(line).replace(/^#+\s*/, "").trim();
  return normalized.includes("referencias_etapa")
    || normalized === "referencias"
    || normalized.includes("referencias bibliograficas")
    || normalized.includes("bibliografia");
}

function isStopHeading(line) {
  const normalized = normalizeForMatch(line).replace(/^#+\s*/, "").trim();
  return normalized === "anexos"
    || normalized.startsWith("anexo ")
    || normalized.startsWith("capitulo ");
}

export function extractReferenceLines(content) {
  const lines = String(content ?? "").split(/\r?\n/);
  const refs = [];
  let inReferences = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (inReferences) refs.push("");
      continue;
    }

    if (isReferenceHeading(line)) {
      inReferences = true;
      continue;
    }

    if (inReferences && /^#{1,6}\s+/.test(line) && isStopHeading(line)) {
      inReferences = false;
      continue;
    }

    if (!inReferences) continue;

    const cleaned = cleanReferenceLine(line);
    if (
      cleaned.length > 18 &&
      !/^nota\b/i.test(cleaned) &&
      !/^(anexos?|capitulo|fase)\b/i.test(cleaned)
    ) {
      refs.push(cleaned);
    }
  }

  return normalizeReferenceCatalog(refs);
}

export function normalizeReferenceCatalog(value) {
  const source = Array.isArray(value) ? value : [value];
  const dedup = new Map();

  for (const item of source.flat(Infinity)) {
    const cleaned = cleanReferenceLine(item);
    if (!cleaned) continue;
    const key = normalizeForMatch(cleaned).replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    if (!key) continue;
    if (!dedup.has(key)) dedup.set(key, cleaned);
  }

  return [...dedup.values()].sort((a, b) => a.localeCompare(b, "es"));
}

function collectReferencesFromUnknown(source) {
  if (!source) return [];
  if (typeof source === "string") return extractReferenceLines(source);
  if (Array.isArray(source)) {
    return normalizeReferenceCatalog(source.flatMap((item) => collectReferencesFromUnknown(item)));
  }
  if (typeof source === "object") {
    if (Array.isArray(source.reference_catalog)) {
      return normalizeReferenceCatalog(source.reference_catalog);
    }
    if (typeof source.content === "string") {
      return extractReferenceLines(source.content);
    }
  }
  return [];
}

export function collectReferencesFromPhaseContents(phaseContents = []) {
  return normalizeReferenceCatalog(
    phaseContents.flatMap((item) => collectReferencesFromUnknown(item))
  );
}

export function readReferenceCatalog(memory = {}) {
  if (!memory || typeof memory !== "object") return [];
  return normalizeReferenceCatalog(memory.reference_catalog);
}

export function withUpdatedReferenceCatalog(memory = {}, ...sources) {
  const merged = normalizeReferenceCatalog([
    readReferenceCatalog(memory),
    ...sources.flatMap((source) => collectReferencesFromUnknown(source)),
  ]);

  return {
    ...memory,
    reference_catalog: merged,
  };
}

export function buildReferenceSupportBlock({
  referenceCatalog = [],
  documents = [],
  contextualReferences = [],
} = {}) {
  const normalizedCatalog = normalizeReferenceCatalog([
    referenceCatalog,
    contextualReferences,
  ]);
  const documentInventory = Array.isArray(documents) && documents.length > 0
    ? documents
        .slice(0, 12)
        .map((doc, index) => {
          const name = String(doc?.nombre || doc?.name || `Documento ${index + 1}`);
          return `${index + 1}. ${name}`;
        })
        .join("\n")
    : "No se registraron documentos fuente adicionales.";

  return `
=== CATALOGO ESTRUCTURADO DE REFERENCIAS ===
${normalizedCatalog.join("\n") || "Aun no hay referencias estructuradas consolidadas."}

=== INVENTARIO DE DOCUMENTOS BASE ===
${documentInventory}
`.trim();
}

export function buildContextualReferences({
  topic = "",
  route = {},
  studentContext = {},
  documents = [],
} = {}) {
  const references = [];
  const cleanedTopic = String(topic || "").trim();
  const routeRecord = route && typeof route === "object" ? route : {};
  const contextRecord = studentContext && typeof studentContext === "object" ? studentContext : {};
  const materials = Array.isArray(routeRecord.materiales_prioritarios)
    ? routeRecord.materiales_prioritarios
    : [];

  for (const material of materials) {
    const label = cleanReferenceLine(material);
    if (!label) continue;
    references.push(`Fuente tematica de apoyo. (s.f.). ${label}.`);
  }

  const institution = cleanReferenceLine(contextRecord.contexto_laboral || contextRecord.programa || "");
  if (institution) {
    references.push(`${institution}. (s.f.). Documentacion institucional y academica consultada para el estudio${cleanedTopic ? ` sobre ${cleanedTopic}` : ""}.`);
  }

  if (Array.isArray(documents)) {
    for (const doc of documents.slice(0, 12)) {
      const name = cleanReferenceLine(doc?.nombre || doc?.name || "");
      if (!name) continue;
      references.push(`Documento base del proyecto. (s.f.). ${name}.`);
    }
  }

  return normalizeReferenceCatalog(references);
}
