/**
 * Definición de las 20 fases del servicio Proyecto de Grado.
 *
 * El servicio tiene 2 subtipos (producción / servicios) que comparten la
 * mayoría de las fases. Las fases marcadas con `subtipo_dependiente: true`
 * tienen prompts distintos por subtipo (Cap. II, Cap. 4c, Cap. 4e).
 *
 * Los prompts de las fases NO están implementados todavía — son placeholders
 * que indican la semana en que se van a implementar según el plan del
 * documento `docs/PATRON_PROYECTO_GRADO.md`.
 *
 * IDs convención:
 *   ph-proy-cap0 ... ph-proy-cap4abis ... ph-proy-defensa
 *
 * Importante: NO reutilizar IDs del servicio monografía (`ph-cap0`, etc.).
 * Si reutilizamos, los proyectos viejos de monografía se confunden.
 */

import type { PhaseDefinition } from "@/lib/persistence";
import { SISTEMA_PROY_CAP0 } from "@/lib/prompts/proyectoGrado/cap0-idea-negocio";
import { SISTEMA_PROY_CAP1 } from "@/lib/prompts/proyectoGrado/cap1-marco-referencial";
import { getPromptCap2 } from "@/lib/prompts/proyectoGrado/cap2-marco-teorico";
import { SISTEMA_PROY_CAP3A } from "@/lib/prompts/proyectoGrado/cap3a-pestel";
import { SISTEMA_PROY_CAP3B } from "@/lib/prompts/proyectoGrado/cap3b-porter";
import { SISTEMA_PROY_CAP3C } from "@/lib/prompts/proyectoGrado/cap3c-matrices";
import { SISTEMA_PROY_CAP3D } from "@/lib/prompts/proyectoGrado/cap3d-diseno-encuesta";
import { SISTEMA_PROY_CAP3E } from "@/lib/prompts/proyectoGrado/cap3e-analisis-encuesta";
import { SISTEMA_PROY_CAP3F } from "@/lib/prompts/proyectoGrado/cap3f-demanda-cuota";

/** Subtipos válidos del servicio Proyecto de Grado. */
export type SubtipoProyectoGrado = "produccion" | "servicios";

/** ID del servicio en BD. */
export const SERVICIO_PROYECTO_GRADO = "proy-grado-001";

/** IDs de los tipos de proyecto. */
export const TIPO_PROY_PRODUCCION = "proy-prod-001";
export const TIPO_PROY_SERVICIOS = "proy-serv-001";

/**
 * Prompt placeholder mientras la fase no está implementada.
 * Cuando se llame con este prompt, la IA tiene que reconocer que la fase
 * no está lista y devolver un mensaje claro al estudiante.
 */
const PROMPT_PLACEHOLDER = `
=== FASE PENDIENTE DE IMPLEMENTACIÓN ===

Esta fase está reservada en el flujo del servicio Proyecto de Grado pero
aún no tiene su prompt definitivo escrito. Está prevista para una
iteración futura según el documento docs/PATRON_PROYECTO_GRADO.md.

Si llegaste a esta fase, devolvé exactamente el siguiente mensaje al
estudiante (sin agregar ni quitar nada):

"⚙️ Esta fase todavía está en construcción. Estamos perfeccionando el
prompt y las validaciones para entregarte la mejor calidad. Volvé pronto."

NO intentes generar contenido académico de esta fase. NO inventes.
`.trim();

interface FaseSpec {
  id: string;
  orden: number;
  label: string;
  short_label: string;
  /** Si true, el prompt depende del subtipo (producción vs servicios). */
  subtipo_dependiente: boolean;
}

/**
 * Las 20 fases del flujo, en orden de aparición para el estudiante.
 * Mismo orden para los dos subtipos (lo que cambia es el contenido del
 * prompt en las fases marcadas como subtipo_dependiente).
 */
const FASES_SPEC: FaseSpec[] = [
  // ── Fundamentos ─────────────────────────────────────────────────────────
  { id: "ph-proy-cap0",     orden:   0, label: "Idea de negocio",                   short_label: "Idea",          subtipo_dependiente: false },
  { id: "ph-proy-cap1",     orden:  10, label: "Marco Referencial",                 short_label: "Cap. I",        subtipo_dependiente: false },
  { id: "ph-proy-cap2",     orden:  20, label: "Marco Teórico Conceptual",          short_label: "Cap. II",       subtipo_dependiente: true  },

  // ── Análisis Situacional (Cap. III dividido en 6 sub-fases) ─────────────
  { id: "ph-proy-cap3a",    orden:  30, label: "Análisis del Macroentorno (PESTEL)",short_label: "PESTEL",        subtipo_dependiente: false },
  { id: "ph-proy-cap3b",    orden:  40, label: "Análisis del Microentorno (Porter)",short_label: "Porter",        subtipo_dependiente: false },
  { id: "ph-proy-cap3c",    orden:  50, label: "Matrices Estratégicas",             short_label: "Matrices",      subtipo_dependiente: false },
  { id: "ph-proy-cap3d",    orden:  60, label: "Diseño de la Encuesta",             short_label: "Encuesta",      subtipo_dependiente: false },
  { id: "ph-proy-cap3e",    orden:  70, label: "Análisis de Resultados de Encuesta",short_label: "Resultados",    subtipo_dependiente: false },
  { id: "ph-proy-cap3f",    orden:  80, label: "Determinación de Demanda",          short_label: "Demanda",       subtipo_dependiente: false },

  // ── Marco Propositivo (Cap. IV dividido en 8 sub-fases) ─────────────────
  { id: "ph-proy-cap4a",    orden:  90, label: "Estudio Organizacional",            short_label: "Organización", subtipo_dependiente: false },
  { id: "ph-proy-cap4abis", orden: 100, label: "Propuesta Administrativa de RRHH",  short_label: "RRHH",          subtipo_dependiente: false },
  { id: "ph-proy-cap4b",    orden: 110, label: "Estudio Legal",                     short_label: "Legal",         subtipo_dependiente: false },
  { id: "ph-proy-cap4c",    orden: 120, label: "Estudio Técnico",                   short_label: "Técnico",       subtipo_dependiente: true  },
  { id: "ph-proy-cap4d",    orden: 130, label: "Branding y Diseño Comercial",       short_label: "Branding",      subtipo_dependiente: false },
  { id: "ph-proy-cap4e",    orden: 140, label: "Mix de Marketing",                  short_label: "Marketing",     subtipo_dependiente: true  },
  { id: "ph-proy-cap4f",    orden: 150, label: "Estudio Financiero",                short_label: "Financiero",    subtipo_dependiente: false },
  { id: "ph-proy-cap4g",    orden: 160, label: "Evaluación del Proyecto",           short_label: "Evaluación",    subtipo_dependiente: false },

  // ── Cierre ──────────────────────────────────────────────────────────────
  { id: "ph-proy-resumen",  orden: 170, label: "Resumen Ejecutivo",                 short_label: "Resumen",       subtipo_dependiente: false },
  { id: "ph-proy-conclus",  orden: 180, label: "Conclusiones y Recomendaciones",    short_label: "Conclusiones",  subtipo_dependiente: false },
  { id: "ph-proy-referencias", orden: 190, label: "Bibliografía",                   short_label: "Bibliografía",  subtipo_dependiente: false },

  // ── Compilación y defensa ───────────────────────────────────────────────
  { id: "ph-proy-latex",    orden: 200, label: "Compilar LaTeX",                    short_label: "LaTeX",         subtipo_dependiente: false },
  { id: "ph-proy-defensa",  orden: 210, label: "Banco de preguntas para tu defensa",short_label: "Defensa",       subtipo_dependiente: false },
];

/**
 * Devuelve las definiciones de fase para un subtipo de Proyecto de Grado.
 *
 * Por ahora todos los prompts son placeholders. A medida que las semanas
 * del plan avancen, este módulo importará los prompts reales desde
 * `src/lib/prompts/proyectoGrado/*.ts` y los enchufará acá.
 *
 * @param subtipo "produccion" o "servicios"
 */
/**
 * Devuelve el prompt real (no placeholder) para una fase dada, eligiendo
 * la variante correcta según subtipo cuando aplica.
 *
 * Las fases sin prompt implementado todavía caen al PROMPT_PLACEHOLDER,
 * que instruye a la IA a devolver un mensaje "fase en construcción"
 * en lugar de generar contenido.
 */
function resolvePromptForPhase(phaseId: string, subtipo: SubtipoProyectoGrado): string {
  switch (phaseId) {
    case "ph-proy-cap0":
      return SISTEMA_PROY_CAP0;
    case "ph-proy-cap1":
      return SISTEMA_PROY_CAP1;
    case "ph-proy-cap2":
      return getPromptCap2(subtipo);
    case "ph-proy-cap3a":
      return SISTEMA_PROY_CAP3A;
    case "ph-proy-cap3b":
      return SISTEMA_PROY_CAP3B;
    case "ph-proy-cap3c":
      return SISTEMA_PROY_CAP3C;
    case "ph-proy-cap3d":
      return SISTEMA_PROY_CAP3D;
    case "ph-proy-cap3e":
      return SISTEMA_PROY_CAP3E;
    case "ph-proy-cap3f":
      return SISTEMA_PROY_CAP3F;
    // Las demás fases todavía no tienen prompt — irán llegando en
    // semanas siguientes según el plan PATRON_PROYECTO_GRADO.md.
    default:
      return PROMPT_PLACEHOLDER;
  }
}

export function getProyectoGradoPhases(subtipo: SubtipoProyectoGrado): PhaseDefinition[] {
  const tipoProyectoId = subtipo === "produccion" ? TIPO_PROY_PRODUCCION : TIPO_PROY_SERVICIOS;

  return FASES_SPEC.map(spec => ({
    id: spec.id,
    servicio_id: SERVICIO_PROYECTO_GRADO,
    tipo_proyecto_id: tipoProyectoId,
    orden: spec.orden,
    label: spec.label,
    short_label: spec.short_label,
    prompt: resolvePromptForPhase(spec.id, subtipo),
  }));
}

/**
 * Devuelve la lista cruda de IDs de fase con su orden. Útil para validaciones
 * y tests sin tener que construir prompts.
 */
export function getProyectoGradoPhaseSpecs(): readonly FaseSpec[] {
  return FASES_SPEC;
}

/**
 * ¿El servicio recibido corresponde al de Proyecto de Grado?
 */
export function esServicioProyectoGrado(servicioId: string | null | undefined): boolean {
  return servicioId === SERVICIO_PROYECTO_GRADO;
}

/**
 * Convierte un `tipo_proyecto_id` al subtipo correspondiente.
 * Si no es un tipo conocido, devuelve null.
 */
export function subtipoFromTipoProyecto(
  tipoProyectoId: string | null | undefined,
): SubtipoProyectoGrado | null {
  if (tipoProyectoId === TIPO_PROY_PRODUCCION) return "produccion";
  if (tipoProyectoId === TIPO_PROY_SERVICIOS) return "servicios";
  return null;
}
