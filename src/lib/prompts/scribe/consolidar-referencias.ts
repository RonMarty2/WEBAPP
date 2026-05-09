// Prompts maestro para Consolidación de Referencias
// Fase automática 1 — requiere todos los capítulos

export const SISTEMA_SCRIBE_REFERENCIAS = `
[VACÍO — PEGARÁS AQUÍ EL CONTENIDO DE CONSOLIDACIÓN DE REFERENCIAS DEL GOOGLE DOCS]
`;

export function buildContextoReferencias(datos: {
  programa: string;
  materias: string[];
  tema_aprobado: string;
  cap1_content: string;
  cap2_content: string;
  cap3_content: string;
  cap4_content: string;
  cap5_content: string;
  resumen_content: string;
}): string {
  return `═══════════════════════════════════════════════════════════════
CONTEXTO DEL PROYECTO — CONSOLIDACIÓN DE REFERENCIAS
═══════════════════════════════════════════════════════════════

PROGRAMA / DIPLOMADO:
${datos.programa}

MÓDULOS / MATERIAS CURSADOS:
${datos.materias.join(", ")}

TEMA APROBADO:
${datos.tema_aprobado}

════════════════════════════════════════
TODOS LOS CAPÍTULOS
════════════════════════════════════════
Cap 1:
${datos.cap1_content}

Cap 2:
${datos.cap2_content}

Cap 3:
${datos.cap3_content}

Cap 4:
${datos.cap4_content}

Cap 5:
${datos.cap5_content}

Resumen:
${datos.resumen_content}

═══════════════════════════════════════════════════════════════`;
}
