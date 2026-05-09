// Prompts maestro para Compilación Final en LaTeX
// Fase automática 2 — requiere todos los capítulos + referencias

export const SISTEMA_SCRIBE_LATEX = `
[VACÍO — PEGARÁS AQUÍ EL CONTENIDO DE COMPILACIÓN FINAL EN LaTeX DEL GOOGLE DOCS]
`;

export function buildContextoLatex(datos: {
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
  universidad_id?: string;
}): string {
  return `═══════════════════════════════════════════════════════════════
CONTEXTO DEL PROYECTO — COMPILACIÓN FINAL EN LaTeX
═══════════════════════════════════════════════════════════════

PROGRAMA / DIPLOMADO:
${datos.programa}

MÓDULOS / MATERIAS CURSADOS:
${datos.materias.join(", ")}

TEMA APROBADO:
${datos.tema_aprobado}

UNIVERSIDAD:
${datos.universidad_id || "(No especificada)"}

════════════════════════════════════════
RESUMEN EJECUTIVO
════════════════════════════════════════
${datos.resumen_content}

════════════════════════════════════════
CAPÍTULO I
════════════════════════════════════════
${datos.cap1_content}

════════════════════════════════════════
CAPÍTULO II
════════════════════════════════════════
${datos.cap2_content}

════════════════════════════════════════
CAPÍTULO III
════════════════════════════════════════
${datos.cap3_content}

════════════════════════════════════════
CAPÍTULO IV
════════════════════════════════════════
${datos.cap4_content}

════════════════════════════════════════
CAPÍTULO V
════════════════════════════════════════
${datos.cap5_content}

════════════════════════════════════════
REFERENCIAS (CONSOLIDADAS)
════════════════════════════════════════
${datos.referencias_content}

═══════════════════════════════════════════════════════════════`;
}
