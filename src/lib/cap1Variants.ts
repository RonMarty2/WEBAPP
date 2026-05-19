/**
 * Registry de VARIANTES de estructura del Capítulo I.
 *
 * Cada universidad puede tener una o más variantes habilitadas
 * (por defecto se asume "clasico"). El estudiante elige una variante
 * en el flujo de creación del proyecto y se persiste en
 * `proyecto.academic_context.cap1_variante_id`.
 *
 * 🔴 ESTADO ACTUAL (ver memory/pending_variante_reducida.md):
 *   - Cap. I clásico y reducido implementados alineados a UMSS Guías 1 y 2.
 *   - Cap. II–V ya soportan el parámetro `variante` en sus builders
 *     (`buildContextoCap2`/3/4/5) y adaptan su comportamiento para no
 *     contradecir la variante reducida (no asumir hipótesis ni
 *     operacionalización). Falta que /api/projects/generate-phase pase
 *     este parámetro a los builders.
 *
 * Server-only — los prompts NUNCA salen al cliente. La metadata pública
 * (id, nombre, descripcion, estructura_visible, guia_oficial) se expone vía
 * /api/cap1-variants.
 */

import { SISTEMA_SCRIBE_CAP1_CLASICO } from "@/lib/prompts/scribe/cap1-variantes/clasico";
import { SISTEMA_SCRIBE_CAP1_REDUCIDO } from "@/lib/prompts/scribe/cap1-variantes/reducido";
import { SISTEMA_SCRIBE_CAP1_UCB_LICENCIATURA } from "@/lib/prompts/scribe/cap1-variantes/ucb-licenciatura";

/**
 * Mapeo de la variante a la guía oficial UMSS que sigue.
 * Permite a la UI mostrar qué documento normativo cubre cada variante.
 *
 * - `id`: identificador estable
 * - `nombre`: etiqueta humana para el estudiante
 * - `formato_umss`: clave técnica que viaja al builder para que la IA
 *   ajuste interlineado / márgenes / notas editoriales
 */
export interface GuiaOficialUmss {
  id: "guia_1_posgrado_fce" | "guia_2_cespedes";
  nombre: string;
  formato_umss: "guia_1_posgrado" | "guia_2_cespedes";
}

/**
 * Análogo a GuiaOficialUmss pero para universidades que NO son UMSS.
 * Usa `formato_universidad` (genérico) en vez de `formato_umss` para
 * dejar claro que no se debe consumir con los validadores UMSS.
 *
 * Hoy soporta UCB. Cuando llegue otra universidad con guía propia
 * (UMSA, UAGRM, etc.) se amplía la unión de id/formato.
 */
export interface GuiaOficialOtra {
  id: "ucb_2020_san_pablo";
  nombre: string;
  formato_universidad: "ucb_2020";
}

/** Unión usada por Cap1Variant. Las dos ramas se enriquecen vía validators distintos. */
export type GuiaOficial = GuiaOficialUmss | GuiaOficialOtra;

const GUIA_1_POSGRADO_FCE: GuiaOficialUmss = {
  id: "guia_1_posgrado_fce",
  nombre: "Guía Posgrado FCE UMSS (Sept 2024) — Doble Titulación",
  formato_umss: "guia_1_posgrado",
};

const GUIA_2_CESPEDES: GuiaOficialUmss = {
  id: "guia_2_cespedes",
  nombre: "Estilo Céspedes Tapia (Guía 2 UMSS — versión extendida)",
  formato_umss: "guia_2_cespedes",
};

const GUIA_UCB_2020: GuiaOficialOtra = {
  id: "ucb_2020_san_pablo",
  nombre: "Guía UCB San Pablo Cochabamba (6ª edición, Marzo 2020)",
  formato_universidad: "ucb_2020",
};

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
  /**
   * Guía oficial a la que corresponde esta variante. Puede ser UMSS
   * (GuiaOficialUmss) u otra universidad (GuiaOficialOtra, e.g. UCB).
   * El consumidor debe discriminar por `formato_umss` vs `formato_universidad`.
   */
  guia_oficial: GuiaOficial;
}

const CLASICO: Cap1Variant = {
  id: "clasico",
  nombre: "Clásico",
  descripcion:
    "Estructura UMSS Posgrado FCE (Guía 1, Sept 2024 — Doble Titulación). Incluye antecedentes generales y específicos, planteamiento con árbol de problemas y formulación, objetivos, justificación metodológica/práctica/social, alcances y, opcionalmente, hipótesis con operacionalización de variables. Recomendada para tesis y monografías cuantitativas, correlacionales, descriptivas o proyectivas.",
  estructura_visible: [
    "Capítulo I: Introducción",
    "1.1 Antecedentes",
    "    1.1.1 Antecedentes generales",
    "    1.1.2 Antecedentes específicos",
    "1.2 Planteamiento del problema",
    "    1.2.1 Descripción del problema",
    "    1.2.2 Árbol de problemas",
    "    1.2.3 Causas y efectos",
    "    1.2.4 Formulación del problema",
    "1.3 Objetivos de investigación",
    "    1.3.1 Objetivo general",
    "    1.3.2 Objetivos específicos",
    "1.4 Justificación de la investigación",
    "    1.4.1 Justificación metodológica",
    "    1.4.2 Justificación práctica",
    "    1.4.3 Justificación social",
    "1.5 Alcances de la investigación",
    "    1.5.1 Alcance temático",
    "    1.5.2 Alcance temporal",
    "    1.5.3 Alcance espacial",
    "1.6 Hipótesis y operacionalización (opcional, según tipo de monografía)",
  ],
  prompt: SISTEMA_SCRIBE_CAP1_CLASICO,
  guia_oficial: GUIA_1_POSGRADO_FCE,
};

const REDUCIDO: Cap1Variant = {
  id: "reducido",
  nombre: "Reducido",
  descripcion:
    "Estilo Céspedes Tapia (Guía 2 UMSS — versión extendida). Mantiene la numeración 1.1–1.5 alineada a UMSS, incluye sistematización del problema (4–5 subpreguntas), justificación metodológica/práctica/social, pero NO incluye hipótesis ni operacionalización de variables. Útil para diplomados y programas con enfoque ejecutivo, cualitativo o documental sin variables medibles.",
  estructura_visible: [
    "Capítulo I: Introducción",
    "1.1 Antecedentes",
    "    1.1.1 Antecedentes generales",
    "    1.1.2 Antecedentes específicos",
    "1.2 Planteamiento del problema",
    "    1.2.1 Descripción del problema",
    "    1.2.2 Árbol de problemas",
    "    1.2.3 Causas y efectos",
    "    1.2.4 Formulación del problema (pregunta central + sistematización)",
    "1.3 Objetivos de investigación",
    "    1.3.1 Objetivo general",
    "    1.3.2 Objetivos específicos",
    "1.4 Justificación de la investigación",
    "    1.4.1 Justificación metodológica",
    "    1.4.2 Justificación práctica",
    "    1.4.3 Justificación social",
    "1.5 Alcances de la investigación",
    "    1.5.1 Alcance temático",
    "    1.5.2 Alcance temporal",
    "    1.5.3 Alcance espacial",
  ],
  prompt: SISTEMA_SCRIBE_CAP1_REDUCIDO,
  nota:
    "Esta variante NO incluye sección 1.6 (Hipótesis ni Operacionalización). Los capítulos II–V se adaptan automáticamente para no asumir hipótesis ni variables operacionalizadas.",
  guia_oficial: GUIA_2_CESPEDES,
};

const UCB_LICENCIATURA: Cap1Variant = {
  id: "ucb_licenciatura",
  nombre: "UCB Licenciatura",
  descripcion:
    "Estructura UCB San Pablo Cochabamba (Guía 6ª edición, Marzo 2020). Cap. I de Introducción con antecedentes, planteamiento del problema, objetivos, justificación y alcances, siguiendo el sistema autor-fecha propio de UCB (APELLIDO en mayúsculas, dos puntos antes de la página). Redacción en primera persona plural o impersonal (nunca singular), sin sangría inicial, sin uso de & ni mayúsculas decorativas. Cuerpo del texto preparado para integrar Tribunal Examinador, Resumen ≤200 palabras + Abstract en inglés + 3-8 palabras clave, hoja separadora antes de anexos y empastado por color según grado académico.",
  estructura_visible: [
    "Capítulo I: Introducción",
    "1.1 Antecedentes",
    "    1.1.1 Antecedentes generales",
    "    1.1.2 Antecedentes específicos",
    "1.2 Planteamiento del problema",
    "    1.2.1 Descripción del problema",
    "    1.2.2 Formulación del problema",
    "1.3 Objetivos",
    "    1.3.1 Objetivo general",
    "    1.3.2 Objetivos específicos",
    "1.4 Justificación",
    "    1.4.1 Justificación teórica",
    "    1.4.2 Justificación metodológica",
    "    1.4.3 Justificación práctica",
    "1.5 Alcances de la investigación",
    "    1.5.1 Alcance temático",
    "    1.5.2 Alcance temporal",
    "    1.5.3 Alcance espacial",
    "1.6 Hipótesis (opcional, según tipo de trabajo)",
  ],
  prompt: SISTEMA_SCRIBE_CAP1_UCB_LICENCIATURA,
  nota:
    "UCB usa sistema autor-fecha propio (no APA 7): citas como (APELLIDO, año: página). Prohíbe primera persona singular, sangría y símbolo &. La extensión definitiva la fija cada carrera UCB.",
  guia_oficial: GUIA_UCB_2020,
};

const REGISTRY: Record<string, Cap1Variant> = {
  clasico: CLASICO,
  reducido: REDUCIDO,
  ucb_licenciatura: UCB_LICENCIATURA,
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
  // UCB — Universidad Católica Boliviana "San Pablo" (Cochabamba)
  "ucb-001": ["ucb_licenciatura"],
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
 * Type guard para distinguir si una guia_oficial es UMSS u otra (UCB).
 * El consumidor (cap1-variants/route.ts, builders) decide qué validator usar.
 */
export function isGuiaUmss(g: GuiaOficial): g is GuiaOficialUmss {
  return "formato_umss" in g;
}

/**
 * Devuelve solo la metadata pública (sin el prompt) — segura para enviar al cliente.
 * Incluye `guia_oficial` para que la UI pueda mostrar a qué guía corresponde.
 */
export function toPublicVariant(v: Cap1Variant): Omit<Cap1Variant, "prompt"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { prompt, ...publica } = v;
  return publica;
}
