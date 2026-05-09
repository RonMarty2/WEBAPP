// Prompts maestro para Cap 4: Resultados y Análisis
// Fase 4 — requiere Caps 1-3 como contexto

export const SISTEMA_SCRIBE_CAP4 = `
[VACÍO — PEGARÁS AQUÍ EL CONTENIDO DE CAP 4 DEL GOOGLE DOCS]
`;

export function buildContextoCap4(datos: {
  programa: string;
  materias: string[];
  tema_aprobado: string;
  dondeTrabaja?: string;
  cap1_content: string;
  cap2_content: string;
  cap3_content: string;
  documentos_usuario?: string;
}): string {
  return `═══════════════════════════════════════════════════════════════
CONTEXTO DEL PROYECTO — CAP 4 (RESULTADOS Y ANÁLISIS)
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
CAPÍTULO III COMPLETADO
════════════════════════════════════════
${datos.cap3_content}

════════════════════════════════════════
MATERIAL ADICIONAL DEL ESTUDIANTE
════════════════════════════════════════
${datos.documentos_usuario || "(No hay documentos adicionales)"}

═══════════════════════════════════════════════════════════════`;
}
