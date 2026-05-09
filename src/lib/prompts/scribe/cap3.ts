// Prompts maestro para Cap 3: Metodología
// Fase 3 — requiere Caps 1-2 como contexto

export const SISTEMA_SCRIBE_CAP3 = `
[VACÍO — PEGARÁS AQUÍ EL CONTENIDO DE CAP 3 DEL GOOGLE DOCS]
`;

export function buildContextoCap3(datos: {
  programa: string;
  materias: string[];
  tema_aprobado: string;
  dondeTrabaja?: string;
  cap1_content: string;
  cap2_content: string;
  documentos_usuario?: string;
}): string {
  return `═══════════════════════════════════════════════════════════════
CONTEXTO DEL PROYECTO — CAP 3 (METODOLOGÍA)
═══════════════════════════════════════════════════════════════

PROGRAMA / DIPLOMADO:
${datos.programa}

MÓDULOS / MATERIAS CURSADOS:
${datos.materias.join(", ")}

TEMA APROBADO:
${datos.tema_aprobado}

LUGAR DE TRABAJO / CONTEXTO:
${datos.dondeTrabaja || "(No especificado)"}

════════════════════════════════════════
CAPÍTULO I COMPLETADO
════════════════════════════════════════
${datos.cap1_content}

════════════════════════════════════════
CAPÍTULO II COMPLETADO
════════════════════════════════════════
${datos.cap2_content}

════════════════════════════════════════
MATERIAL ADICIONAL DEL ESTUDIANTE
════════════════════════════════════════
${datos.documentos_usuario || "(No hay documentos adicionales)"}

═══════════════════════════════════════════════════════════════`;
}
