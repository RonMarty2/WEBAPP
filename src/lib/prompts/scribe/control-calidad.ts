// Prompts maestro para Control Final de Calidad
// Fase automática 3 — requiere todos los capítulos + referencias

export const SISTEMA_SCRIBE_CALIDAD = `
[VACÍO — PEGARÁS AQUÍ EL CONTENIDO DE CONTROL FINAL DE CALIDAD DEL GOOGLE DOCS]
`;

export function buildContextoCalidad(datos: {
  programa: string;
  materias: string[];
  tema_aprobado: string;
  cap1_content: string;
  cap2_content: string;
  cap3_content: string;
  cap4_content: string;
  cap5_content: string;
  resumen_content: string;
  referencias_content: string;
}): string {
  return `═══════════════════════════════════════════════════════════════
CONTEXTO DEL PROYECTO — CONTROL FINAL DE CALIDAD
═══════════════════════════════════════════════════════════════

PROGRAMA / DIPLOMADO:
${datos.programa}

MÓDULOS / MATERIAS CURSADOS:
${datos.materias.join(", ")}

TEMA APROBADO:
${datos.tema_aprobado}

════════════════════════════════════════
DOCUMENTO COMPLETO PARA VALIDACIÓN
════════════════════════════════════════

Resumen:
${datos.resumen_content}

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

Referencias:
${datos.referencias_content}

═══════════════════════════════════════════════════════════════`;
}
