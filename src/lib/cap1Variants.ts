/**
 * Registry de VARIANTES de estructura del Capítulo I.
 *
 * Cada universidad puede tener una o más variantes habilitadas
 * (por defecto se asume "clasico"). El estudiante elige una variante
 * en el flujo de creación del proyecto y se persiste en
 * `proyecto.academic_context.cap1_variante_id`.
 *
 * 🔴 ESTADO ACTUAL (ver memory/pending_variante_reducida.md):
 *   - Cap. I clásico y reducido implementados.
 *   - Cap. II–V todavía usan un único prompt para AMBAS variantes.
 *     Cuando el usuario defina la estructura reducida de Cap. II–V,
 *     extender este registry con `cap2Variants.ts`, `cap3Variants.ts`, etc.
 *     y replicar el patrón de resolución en /api/projects/generate-phase.
 *
 * Server-only — los prompts NUNCA salen al cliente. La metadata pública
 * (id, nombre, descripcion, estructura_visible) se expone vía
 * /api/cap1-variants.
 */

import { SISTEMA_SCRIBE_CAP1_CLASICO } from "@/lib/prompts/scribe/cap1-variantes/clasico";
import { SISTEMA_SCRIBE_CAP1_REDUCIDO } from "@/lib/prompts/scribe/cap1-variantes/reducido";

export interface Cap1Variant {
  id: string;
  nombre: string;
  descripcion: string;
  /**
   * Lista de subtítulos genéricos visibles para el estudiante al elegir
   * la variante (NO debe contener nada específico del tema del estudiante).
   */
  estructura_visible: string[];
  /**
   * Megaprompt server-only. NUNCA se expone vía API pública.
   */
  prompt: string;
  /**
   * Notas que se muestran al estudiante al elegir esta variante
   * (opcional). Útil para advertencias o aclaraciones.
   */
  nota?: string;
}

const CLASICO: Cap1Variant = {
  id: "clasico",
  nombre: "Clásico",
  descripcion:
    "Estructura completa con sistematización, hipótesis y operacionalización de variables. Recomendada para tesis y monografías de investigación cuantitativa o mixta.",
  estructura_visible: [
    "Introducción y antecedentes generales",
    "1.1 Planteamiento y formulación del problema",
    "    1.1.1 Planteamiento (árbol de problemas, pronóstico, control)",
    "    1.1.2 Formulación y sistematización (pregunta central + subpreguntas)",
    "1.2 Objetivos (general + específicos)",
    "1.3 Justificación (teórica, práctica y social)",
    "1.4 Alcances (temático, temporal, espacial)",
    "1.5 Hipótesis y operacionalización de variables",
  ],
  prompt: SISTEMA_SCRIBE_CAP1_CLASICO,
};

const REDUCIDO: Cap1Variant = {
  id: "reducido",
  nombre: "Reducido",
  descripcion:
    "Estructura simplificada sin hipótesis ni operacionalización. Justificación enfocada en lo Social y Económico. Útil para diplomados o programas que piden un enfoque ejecutivo y aplicado.",
  estructura_visible: [
    "Introducción",
    "1.1 Antecedentes",
    "1.2 Planteamiento del problema",
    "    1.2.1 Descripción del problema",
    "    1.2.2 Árbol de problemas",
    "    1.2.3 Formulación del problema",
    "1.3 Objetivos de investigación",
    "    1.3.1 Objetivo general",
    "    1.3.2 Objetivos específicos",
    "1.4 Justificación de la investigación",
    "    1.4.1 Justificación social",
    "    1.4.2 Justificación económica",
    "1.5 Alcances de la investigación",
    "    1.5.1 Alcance temático",
    "    1.5.2 Alcance temporal",
    "    1.5.3 Alcance espacial",
  ],
  prompt: SISTEMA_SCRIBE_CAP1_REDUCIDO,
  nota:
    "⚠️ Beta — Esta variante está optimizada para el Capítulo I. Los capítulos II–V se generarán por ahora con el formato clásico hasta que tu diplomado nos confirme su estructura específica.",
};

const REGISTRY: Record<string, Cap1Variant> = {
  clasico: CLASICO,
  reducido: REDUCIDO,
};

/**
 * Mapeo universidad_id (tal como aparece en src/lib/data.ts) → variantes
 * disponibles. SIEMPRE incluye "clasico" como primera opción (default).
 *
 * Si una universidad no está aquí, se asume solo "clasico" (compatibilidad
 * total con el comportamiento previo).
 */
const VARIANTES_POR_UNIVERSIDAD: Record<string, string[]> = {
  // UMSS — Universidad Mayor de San Simón (Cochabamba)
  "umss-001": ["clasico", "reducido"],
};

/**
 * Devuelve las variantes habilitadas para una universidad.
 * Si la universidad no tiene mapeo explícito, retorna solo "clasico".
 */
export function getVariantsForUniversity(universidadId: string | null | undefined): Cap1Variant[] {
  const ids = VARIANTES_POR_UNIVERSIDAD[universidadId ?? ""] ?? ["clasico"];
  return ids.map((id) => REGISTRY[id]).filter(Boolean);
}

/**
 * Devuelve la variante por defecto para una universidad (la primera de su lista).
 */
export function getDefaultVariantId(universidadId: string | null | undefined): string {
  const variantes = getVariantsForUniversity(universidadId);
  return variantes[0]?.id ?? "clasico";
}

/**
 * Resuelve la variante por su id. Si no existe, devuelve "clasico".
 */
export function getVariantById(variantId: string | null | undefined): Cap1Variant {
  if (variantId && REGISTRY[variantId]) return REGISTRY[variantId];
  return CLASICO;
}

/**
 * Devuelve solo la metadata pública (sin el prompt) — segura para enviar al cliente.
 */
export function toPublicVariant(v: Cap1Variant): Omit<Cap1Variant, "prompt"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { prompt, ...publica } = v;
  return publica;
}
