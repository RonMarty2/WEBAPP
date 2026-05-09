// Prompts maestro para Resumen Ejecutivo
// Fase 6 — requiere Caps 1-5 como contexto

export const SISTEMA_SCRIBE_RESUMEN = `
[VACÍO — PEGARÁS AQUÍ EL CONTENIDO DE RESUMEN EJECUTIVO DEL GOOGLE DOCS]
`;

export function buildContextoResumen(datos: {
  programa: string;
  materias: string[];
  tema_aprobado: string;
  dondeTrabaja?: string;
  cap1_content: string;
  cap2_content: string;
  cap3_content: string;
  cap4_content: string;
  cap5_content: string;
}): string {
  return `═══════════════════════════════════════════════════════════════
CONTEXTO DEL PROYECTO — RESUMEN EJECUTIVO
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
CAPÍTULO V COMPLETADO
════════════════════════════════════════
${datos.cap5_content}

═══════════════════════════════════════════════════════════════`;
}
