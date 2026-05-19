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
import { SISTEMA_SCRIBE_CAP1_UNIFRANZ_TESIS } from "@/lib/prompts/scribe/cap1-variantes/unifranz-tesis";

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
 * Mapeo de la variante a la guía oficial UNIFRANZ (Universidad Privada
 * Franz Tamayo, Cochabamba — Guía 2017). Estructura paralela a
 * `GuiaOficialUmss` para que el lookup público en /api/cap1-variants
 * pueda discriminar por el campo `formato_unifranz`.
 */
export interface GuiaOficialUnifranz {
  id: "guia_unifranz_tesis_2017" | "guia_unifranz_proyecto_prefactibilidad_2017";
  nombre: string;
  formato_unifranz: "unifranz_tesis_2017" | "unifranz_proyecto_prefactibilidad_2017";
}

/** Unión discriminada — se distingue por el campo `formato_umss` vs `formato_unifranz`. */
export type GuiaOficial = GuiaOficialUmss | GuiaOficialUnifranz;

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

const GUIA_UNIFRANZ_TESIS: GuiaOficialUnifranz = {
  id: "guia_unifranz_tesis_2017",
  nombre: "Guía UNIFRANZ Cochabamba (2017) — Modalidad Tesis de Grado",
  formato_unifranz: "unifranz_tesis_2017",
};

const GUIA_UNIFRANZ_PROYECTO_PREFACTIBILIDAD: GuiaOficialUnifranz = {
  id: "guia_unifranz_proyecto_prefactibilidad_2017",
  nombre: "Guía UNIFRANZ Cochabamba (2017) — Proyecto de Grado: Pre-Factibilidad",
  formato_unifranz: "unifranz_proyecto_prefactibilidad_2017",
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
   * Guía oficial a la que corresponde esta variante (UMSS o UNIFRANZ).
   * El campo discriminador es `formato_umss` vs `formato_unifranz` —
   * el endpoint público `/api/cap1-variants` usa esto para enriquecer
   * con la metadata correcta (autor, fecha, características, PDF).
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

const UNIFRANZ_TESIS: Cap1Variant = {
  id: "unifranz_tesis",
  nombre: "UNIFRANZ — Tesis de Grado",
  descripcion:
    "Estructura UNIFRANZ Cochabamba (Guía 2017) para modalidad TESIS DE GRADO. La INTRODUCCIÓN reemplaza al 'Capítulo I' UMSS y contiene 5 secciones obligatorias: Planteamiento del Problema, Justificación (Social/Económica/Práctica/Teórica), Objetivos, Alcances (Temporal/Espacial/Temático) e Hipótesis (Variables Independientes y Dependientes). Redacción impersonal en tercera persona singular, tiempo pasado. Citas APA con cursiva en textuales cortas. Verdana 11, márgenes 3.5/2.5, numeración inferior derecha.",
  estructura_visible: [
    "INTRODUCCIÓN",
    "1. Planteamiento del Problema",
    "2. Justificación",
    "    2.1 Justificación Social",
    "    2.2 Justificación Económica",
    "    2.3 Justificación Práctica",
    "    2.4 Justificación Teórica",
    "3. Objetivos",
    "    3.1 Objetivo General",
    "    3.2 Objetivos Específicos",
    "4. Alcances",
    "    4.1 Alcance Temporal",
    "    4.2 Alcance Espacial",
    "    4.3 Alcance Temático",
    "5. Hipótesis",
    "    5.1 Hipótesis General",
    "    5.2 Variables Independientes",
    "    5.3 Variables Dependientes",
  ],
  prompt: SISTEMA_SCRIBE_CAP1_UNIFRANZ_TESIS,
  nota:
    "En UNIFRANZ, lo que UMSS llama 'Capítulo I' se llama 'INTRODUCCIÓN' y contiene las 5 secciones de planteamiento. El Capítulo I del documento físico es el MARCO TEÓRICO.",
  guia_oficial: GUIA_UNIFRANZ_TESIS,
};

const UNIFRANZ_PROYECTO_PREFACTIBILIDAD: Cap1Variant = {
  id: "unifranz_proyecto_prefactibilidad",
  nombre: "UNIFRANZ — Proyecto de Grado: Pre-Factibilidad",
  descripcion:
    "Estructura UNIFRANZ Cochabamba (Guía 2017) para modalidad PROYECTO DE GRADO con finalidad de Estudio de Pre-Factibilidad para Oportunidad de Inversión. Misma INTRODUCCIÓN que la Tesis (Planteamiento + Justificaciones + Objetivos + Alcances + Hipótesis). El cuerpo del proyecto se desarrolla en Cap.II Investigación (macro/microentorno + mercado + producto + marco legal) y Cap.III Plan de Negocios (marketing + operativo + organizacional + financiero).",
  estructura_visible: [
    "INTRODUCCIÓN",
    "1. Planteamiento del Problema",
    "2. Justificación (Social, Económica, Práctica, Teórica)",
    "3. Objetivos (General + Específicos)",
    "4. Alcances (Temporal, Espacial, Temático)",
    "5. Hipótesis (Variables Dependientes e Independientes)",
  ],
  prompt: SISTEMA_SCRIBE_CAP1_UNIFRANZ_TESIS,
  nota:
    "La INTRODUCCIÓN comparte el mismo formato que la Tesis. Lo que cambia entre Tesis y Proyecto Pre-Factibilidad es el cuerpo (Capítulos I-III), no la introducción.",
  guia_oficial: GUIA_UNIFRANZ_PROYECTO_PREFACTIBILIDAD,
};

const REGISTRY: Record<string, Cap1Variant> = {
  clasico: CLASICO,
  reducido: REDUCIDO,
  unifranz_tesis: UNIFRANZ_TESIS,
  unifranz_proyecto_prefactibilidad: UNIFRANZ_PROYECTO_PREFACTIBILIDAD,
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
  // UNIFRANZ — Universidad Privada Franz Tamayo (Cochabamba)
  "unifranz-cba-001": ["unifranz_tesis", "unifranz_proyecto_prefactibilidad"],
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
 * Incluye `guia_oficial` para que la UI pueda mostrar a qué guía corresponde.
 */
export function toPublicVariant(v: Cap1Variant): Omit<Cap1Variant, "prompt"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { prompt, ...publica } = v;
  return publica;
}
