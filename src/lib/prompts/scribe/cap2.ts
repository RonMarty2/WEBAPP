// Prompts maestro para Cap 2: Marco Teórico y Referencial
// Fase 2 — requiere Cap 1 como contexto

export const SISTEMA_SCRIBE_CAP2 = `
[VACÍO — PEGARÁS AQUÍ EL CONTENIDO DE CAP 2 DEL GOOGLE DOCS]
`;

export function buildContextoCap2(datos: {
  programa: string;
  materias: string[];
  tema_aprobado: string;
  dondeTrabaja?: string;
  materialPropio?: string;
  intereses?: string[];
  cap1_content: string;
  documentos_usuario?: string;
}): string {
  return `═══════════════════════════════════════════════════════════════
CONTEXTO DEL PROYECTO — CAP 2 (MARCO TEÓRICO Y REFERENCIAL)
═══════════════════════════════════════════════════════════════

PROGRAMA / DIPLOMADO:
${datos.programa}

MÓDULOS / MATERIAS CURSADOS:
${datos.materias.join(", ")}

TEMA APROBADO:
${datos.tema_aprobado}

LUGAR DE TRABAJO / CONTEXTO:
${datos.dondeTrabaja || "(No especificado)"}

INTERESES PERSONALES / ÁREAS DE PREFERENCIA:
${(datos.intereses || []).join(", ") || "(No especificados)"}

════════════════════════════════════════
CAPÍTULO I COMPLETADO (CONTEXTO PREVIO)
════════════════════════════════════════
${datos.cap1_content}

════════════════════════════════════════
MATERIAL ADICIONAL DEL ESTUDIANTE
════════════════════════════════════════
${datos.documentos_usuario || "(No hay documentos adicionales)"}

═══════════════════════════════════════════════════════════════`;
}
