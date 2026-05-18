/**
 * Clasificación semántica de fases del proyecto.
 *
 * Divide las fases en 3 categorías para que la UI muestre solo lo relevante
 * al estudiante y para que el sistema sepa cuándo inyectar mejoras
 * específicas (ej. tablas + gráficos en fases analíticas).
 *
 * Tipos:
 *   - "academica"  → capítulos que el estudiante redacta/revisa (Cap I-V, etc.)
 *   - "analitica"  → subconjunto de académicas que requieren datos visuales
 *                    (tablas, gráficos, matrices). Reciben prompt enriquecido.
 *   - "tecnica"    → fases que el sistema procesa solo (LaTeX, bibliografía
 *                    consolidada, banco de preguntas, control de calidad).
 *                    Se ocultan/atenuan del flujo principal del estudiante.
 */

export type PhaseCategory = "academica" | "analitica" | "tecnica";

/**
 * Set de IDs de fases técnicas (se autogeneran o son procesamiento).
 * El estudiante no las redacta directamente.
 */
const TECNICAS = new Set<string>([
  // Monografía (Scribe)
  "ph-resumen",        // Resumen ejecutivo (sintetiza el resto)
  "ph-referencias",    // Bibliografía consolidada (auto)
  "ph-latex",          // Compilación LaTeX
  "ph-calidad",        // Banco de preguntas defensa (auto-generado)

  // Proyecto de Grado
  "ph-proy-resumen",
  "ph-proy-referencias",
  "ph-proy-latex",
  "ph-proy-defensa",
]);

/**
 * Set de IDs de fases analíticas: requieren datos cuantitativos, tablas,
 * gráficos, matrices estratégicas, etc. La IA recibe un bloque adicional
 * que la obliga a generar visualizaciones (tablas markdown + código TikZ
 * para gráficos en LaTeX).
 */
const ANALITICAS = new Set<string>([
  // Monografía: el Cap. IV es donde aparecen los resultados/datos
  "ph-cap4",

  // Proyecto de Grado: TODAS las fases del Cap 3 y varias del Cap 4
  "ph-proy-cap3a",  // PESTEL (matriz)
  "ph-proy-cap3b",  // Porter (5 fuerzas + tabla)
  "ph-proy-cap3c",  // Matrices estratégicas (MEFE, MEFI, FODA, BCG)
  "ph-proy-cap3d",  // Diseño encuesta (tabla de operacionalización)
  "ph-proy-cap3e",  // Resultados encuesta (gráficos + tablas)
  "ph-proy-cap3f",  // Demanda (proyecciones numéricas + gráfico)
  "ph-proy-cap4c",  // Estudio técnico (layouts, flujos, dimensiones)
  "ph-proy-cap4e",  // Mix marketing (4P/7P + tablas comparativas)
  "ph-proy-cap4f",  // Financiero (estados, flujos, ratios)
  "ph-proy-cap4g",  // Evaluación (VAN/TIR/sensibilidad + gráficos)
]);

/**
 * Devuelve la categoría semántica de una fase.
 * Default: "academica" (mantiene compatibilidad con fases no clasificadas).
 */
export function classifyPhase(phaseId: string): PhaseCategory {
  if (TECNICAS.has(phaseId)) return "tecnica";
  if (ANALITICAS.has(phaseId)) return "analitica";
  return "academica";
}

export function isPhaseTecnica(phaseId: string): boolean {
  return TECNICAS.has(phaseId);
}

export function isPhaseAnalitica(phaseId: string): boolean {
  return ANALITICAS.has(phaseId);
}

/**
 * Cuenta solo fases académicas (incluye analíticas) y omite las técnicas.
 * Usado por la UI para mostrar "X de Y capítulos" sin confundir al usuario
 * con fases de procesamiento interno.
 */
export function countAcademicPhases(phases: Array<{ id: string }>): number {
  return phases.filter(p => !isPhaseTecnica(p.id)).length;
}

/**
 * Cuenta cuántas fases académicas tienen contenido aprobado.
 */
export function countAcademicPhasesCompleted(
  phases: Array<{ id: string }>,
  phaseContents: Record<string, string | null | undefined>,
): number {
  return phases.filter(p => {
    if (isPhaseTecnica(p.id)) return false;
    const content = phaseContents[p.id] ?? phaseContents[`${p.id}_borrador`] ?? "";
    return typeof content === "string" && content.trim().length > 0;
  }).length;
}
