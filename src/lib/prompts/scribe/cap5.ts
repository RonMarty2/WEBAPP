// Prompts maestro para Cap 5: Conclusiones y Recomendaciones
// Fase 5 — requiere Caps 1-4 como contexto

export const SISTEMA_SCRIBE_CAP5 = `
[VACÍO — PEGARÁS AQUÍ EL CONTENIDO DE CAP 5 DEL GOOGLE DOCS]
`;

export function buildContextoCap5(datos: {
  programa: string;
  materias: string[];
  tema_aprobado: string;
  dondeTrabaja?: string;
  cap1_content: string;
  cap2_content: string;
  cap3_content: string;
  cap4_content: string;
  documentos_usuario?: string;
}): string {
  return `═══════════════════════════════════════════════════════════════
CONTEXTO DEL PROYECTO — CAP 5 (CONCLUSIONES Y RECOMENDACIONES)
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
CAPÍTULO IV COMPLETADO
════════════════════════════════════════
${datos.cap4_content}

════════════════════════════════════════
MATERIAL ADICIONAL DEL ESTUDIANTE
════════════════════════════════════════
${datos.documentos_usuario || "(No hay documentos adicionales)"}

═══════════════════════════════════════════════════════════════`;
}
