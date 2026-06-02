/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESOLVER UNIFRANZ — Proyecto de Grado
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Entrega el megaprompt correcto según la fase que el flujo del sistema
 * está generando. Pensado para ser invocado desde:
 *   - /api/projects/generate-phase
 *   - O cualquier API/IA externa que consuma estos prompts.
 *
 * Identificación inequívoca:
 *   universidad   = "unifranz-cba-001"
 *   tipo_proyecto = "proyecto-grado"
 *   modalidad     = "pre-factibilidad" | "mejora-organizacional" |
 *                   "diseno-artefacto" | "trabajo-dirigido"
 *
 * Por ahora, este resolver cubre la modalidad PRE-FACTIBILIDAD (la más
 * común). Las otras modalidades comparten Cap I y diferentes Cap II/III.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { PROMPT_UNIFRANZ_INTRODUCCION } from "./01-introduccion";
import { PROMPT_UNIFRANZ_MARCO_TEORICO } from "./02-marco-teorico";
import { PROMPT_UNIFRANZ_INVESTIGACION } from "./03-investigacion";
import { PROMPT_UNIFRANZ_PLAN_ESTRATEGICO } from "./04-plan-estrategico";
import { PROMPT_UNIFRANZ_CONCLUSIONES_RECOMENDACIONES } from "./05-conclusiones-recomendaciones";
import { PROMPT_UNIFRANZ_BIBLIOGRAFIA } from "./06-bibliografia";
import { PROMPT_UNIFRANZ_RESUMEN_TRABAJO } from "./07-resumen-trabajo";

/** Identificadores de fase reconocidos por el motor UNIFRANZ Proyecto de Grado. */
export type FaseUnifranzPG =
  | "resumen-trabajo"
  | "introduccion"
  | "marco-teorico"
  | "investigacion"
  | "plan-estrategico"
  | "conclusiones-recomendaciones"
  | "bibliografia";

export type ModalidadUnifranzPG =
  | "pre-factibilidad"
  | "mejora-organizacional"
  | "diseno-artefacto"
  | "trabajo-dirigido";

/**
 * Devuelve el megaprompt listo para ser enviado a la IA en producción.
 *
 * El cuerpo del prompt ya incluye:
 *   1. Reglas comunes UNIFRANZ (anti-alucinación, redacción, formato, citas APA).
 *   2. Instrucciones específicas del capítulo/fase solicitada.
 *
 * El consumidor (API externa o /api/projects/generate-phase) DEBE además
 * concatenar el CONTEXTO del proyecto del estudiante antes de invocar la IA:
 *   - Carrera y facultad UNIFRANZ.
 *   - Tema confirmado.
 *   - Material propio (PDFs, encuestas, Excel).
 *   - Datos económicos / sectoriales del proyecto.
 *   - Fases previamente generadas (para coherencia / hilo conductor).
 */
export function getPromptUnifranzPG(
  fase: FaseUnifranzPG,
  modalidad: ModalidadUnifranzPG = "pre-factibilidad"
): string {
  // Por ahora todas las modalidades usan los mismos prompts de Introducción,
  // Resumen, Conclusiones y Bibliografía. Cap II y Cap III varían.
  // (Las modalidades faltantes se irán implementando archivo por archivo.)

  if (modalidad !== "pre-factibilidad") {
    // Fallback documentado: aún no hay prompts específicos para las otras
    // 3 modalidades. Devolvemos el de Pre-Factibilidad con una nota
    // explícita para que el operador del SaaS lo sepa.
    console.warn(
      `[unifranz/resolver] Modalidad '${modalidad}' aún no implementada. ` +
        `Usando prompts de 'pre-factibilidad' como base.`
    );
  }

  switch (fase) {
    case "resumen-trabajo":
      return PROMPT_UNIFRANZ_RESUMEN_TRABAJO;
    case "introduccion":
      return PROMPT_UNIFRANZ_INTRODUCCION;
    case "marco-teorico":
      return PROMPT_UNIFRANZ_MARCO_TEORICO;
    case "investigacion":
      return PROMPT_UNIFRANZ_INVESTIGACION;
    case "plan-estrategico":
      return PROMPT_UNIFRANZ_PLAN_ESTRATEGICO;
    case "conclusiones-recomendaciones":
      return PROMPT_UNIFRANZ_CONCLUSIONES_RECOMENDACIONES;
    case "bibliografia":
      return PROMPT_UNIFRANZ_BIBLIOGRAFIA;
    default: {
      const _exhaustive: never = fase;
      throw new Error(
        `[unifranz/resolver] Fase no soportada: ${_exhaustive}`
      );
    }
  }
}

/**
 * Lista las fases disponibles en orden lógico de generación.
 * Útil para que la UI de administración o el wizard del estudiante
 * sepa qué pasos existen y en qué orden invocarlos.
 */
export const FASES_UNIFRANZ_PG_EN_ORDEN: FaseUnifranzPG[] = [
  "introduccion",
  "marco-teorico",
  "investigacion",
  "plan-estrategico",
  "conclusiones-recomendaciones",
  "bibliografia",
  "resumen-trabajo", // Se genera al final aunque va en preliminares
];
