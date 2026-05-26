/**
 * Definición de fases UNIFRANZ por modalidad de titulación.
 *
 * SERVER-ONLY: importa prompts desde `src/lib/prompts/proyectoGrado/unifranz/*`
 * y los resuelve a `PhaseDefinition[]` para que `phaseDefinitionsForProject`
 * los devuelva al workspace.
 *
 * Estructura común a las 5 modalidades:
 *   Preliminares  → Resumen Ejecutivo (250 palabras objetivo)
 *   Apertura      → Introducción (planteamiento + justificación + objetivos +
 *                                 alcances + hipótesis si aplica, en una sola fase)
 *   Cuerpo        → 3 capítulos. La estructura interna varía por modalidad.
 *   Cierre        → Conclusiones, Recomendaciones, Bibliografía
 *   Export        → Compilación final (LaTeX/PDF) y Banco de preguntas defensa
 *
 * IDs siguen la convención: `ph-unifranz-{modalidad-slug}-{seccion}`.
 * NO reutilizar IDs entre modalidades — cada modalidad tiene su propio
 * conjunto aunque las secciones se llamen igual.
 */

import type { PhaseDefinition } from "@/lib/persistence";
import { buildPlaceholderUnifranz } from "@/lib/prompts/proyectoGrado/unifranz/placeholder";
import type { ModalidadUnifranz } from "@/lib/proyectoGrado/unifranz/modalidades";
import { getModalidadUnifranz } from "@/lib/proyectoGrado/unifranz/modalidades";

/** ID del servicio Proyecto de Grado en BD. Reutilizado del flujo existente. */
const SERVICIO_PROYECTO_GRADO = "proy-grado-001";

/** Estructura interna mínima de cada fase antes de resolver el prompt. */
interface FaseUnifranzSpec {
  /** Sufijo único dentro de la modalidad. Se prefija con `ph-unifranz-{mod}-` al construir el ID. */
  slug: string;
  /** Orden de aparición en el sidebar. Múltiplos de 10 con gaps para inserción futura. */
  orden: number;
  /** Etiqueta larga visible en el sidebar. */
  label: string;
  /** Etiqueta corta para chips/tabs. */
  short_label: string;
  /** Grupo para agrupar en el sidebar. */
  grupo: "preliminares" | "apertura" | "cuerpo" | "cierre" | "export";
}

/** Fases comunes a TODAS las modalidades UNIFRANZ (preliminares, apertura, cierre, export). */
const FASES_COMUNES: FaseUnifranzSpec[] = [
  // ── Preliminares ─────────────────────────────────────────────────────────
  { slug: "resumen", orden: 0, label: "Resumen Ejecutivo (250 palabras)", short_label: "Resumen", grupo: "preliminares" },
  // ── Apertura ─────────────────────────────────────────────────────────────
  { slug: "introduccion", orden: 10, label: "Introducción (planteamiento, justificación, objetivos, alcances, hipótesis)", short_label: "Introducción", grupo: "apertura" },
  // ── Cuerpo ───────────────────────────────────────────────────────────────
  //    Los 3 capítulos del cuerpo se inyectan por modalidad (ver más abajo).
  // ── Cierre ───────────────────────────────────────────────────────────────
  { slug: "conclusiones",    orden: 80, label: "Conclusiones",        short_label: "Conclusiones",    grupo: "cierre" },
  { slug: "recomendaciones", orden: 90, label: "Recomendaciones",     short_label: "Recomendaciones", grupo: "cierre" },
  { slug: "bibliografia",    orden: 100, label: "Bibliografía (APA, apellidos en minúscula)", short_label: "Bibliografía", grupo: "cierre" },
  // ── Export ───────────────────────────────────────────────────────────────
  { slug: "compilacion",     orden: 200, label: "Compilación final (LaTeX/PDF)", short_label: "Compilación", grupo: "export" },
  { slug: "defensa",         orden: 210, label: "Banco de preguntas para defensa", short_label: "Defensa", grupo: "export" },
];

/** Cuerpo específico por modalidad. El orden empieza en 20 y va de 10 en 10. */
const CUERPO_POR_MODALIDAD: Record<ModalidadUnifranz, FaseUnifranzSpec[]> = {
  // ── 4.1 — Tesis de Grado ────────────────────────────────────────────────
  "unifranz-tesis": [
    { slug: "cap1", orden: 20, label: "Capítulo I — Marco Teórico",            short_label: "Cap. I",   grupo: "cuerpo" },
    { slug: "cap2", orden: 30, label: "Capítulo II — Marco Práctico (metodología)", short_label: "Cap. II",  grupo: "cuerpo" },
    { slug: "cap3", orden: 40, label: "Capítulo III — Resultados y Discusión", short_label: "Cap. III", grupo: "cuerpo" },
  ],

  // ── 4.2.1 — Proyecto de Grado: Pre-Factibilidad ──────────────────────────
  "unifranz-pg-prefactibilidad": [
    { slug: "cap1",                  orden: 20, label: "Capítulo I — Marco Teórico", short_label: "Cap. I", grupo: "cuerpo" },
    { slug: "cap2-investigacion",    orden: 30, label: "Capítulo II — Investigación", short_label: "Cap. II", grupo: "cuerpo" },
    { slug: "cap2a-macroentorno",    orden: 32, label: "  2.1 Análisis del Macroentorno", short_label: "Macroentorno", grupo: "cuerpo" },
    { slug: "cap2b-microentorno",    orden: 34, label: "  2.2 Análisis del Microentorno", short_label: "Microentorno", grupo: "cuerpo" },
    { slug: "cap2c-matricial",       orden: 36, label: "  2.3 Análisis Matricial",        short_label: "Matricial",    grupo: "cuerpo" },
    { slug: "cap2d-metodologia",     orden: 38, label: "  2.4 Metodología de Investigación", short_label: "Metodología", grupo: "cuerpo" },
    { slug: "cap2e-mercado",         orden: 40, label: "  2.5 Estudio de Mercado",        short_label: "Mercado",      grupo: "cuerpo" },
    { slug: "cap3-plan-estrategico", orden: 50, label: "Capítulo III — Plan Estratégico", short_label: "Cap. III",     grupo: "cuerpo" },
    { slug: "cap3a-organizacional",  orden: 52, label: "  3.1 Estructura Organizacional", short_label: "Organización", grupo: "cuerpo" },
    { slug: "cap3b-marketing",       orden: 54, label: "  3.2 Plan de Marketing",         short_label: "Marketing",    grupo: "cuerpo" },
    { slug: "cap3c-produccion",      orden: 56, label: "  3.3 Plan de Producción",        short_label: "Producción",   grupo: "cuerpo" },
    { slug: "cap3d-financiera",      orden: 58, label: "  3.4 Planificación Financiera",  short_label: "Financiera",   grupo: "cuerpo" },
    { slug: "cap3e-legal",           orden: 60, label: "  3.5 Aspectos Legales",          short_label: "Legal",        grupo: "cuerpo" },
  ],

  // ── 4.2.2 — Proyecto de Grado: Mejora Organizacional ─────────────────────
  "unifranz-pg-mejora-org": [
    { slug: "cap1",                orden: 20, label: "Capítulo I — Marco Teórico", short_label: "Cap. I", grupo: "cuerpo" },
    { slug: "cap2-investigacion",  orden: 30, label: "Capítulo II — Investigación", short_label: "Cap. II", grupo: "cuerpo" },
    { slug: "cap2a-microentorno",  orden: 32, label: "  2.1 Análisis del Microentorno",  short_label: "Microentorno",  grupo: "cuerpo" },
    { slug: "cap2b-institucional", orden: 34, label: "  2.2 Análisis Institucional",     short_label: "Institucional", grupo: "cuerpo" },
    { slug: "cap2c-matricial",     orden: 36, label: "  2.3 Análisis Matricial",         short_label: "Matricial",     grupo: "cuerpo" },
    { slug: "cap2d-metodologia",   orden: 38, label: "  2.4 Metodología de Investigación", short_label: "Metodología", grupo: "cuerpo" },
    { slug: "cap2e-mercado",       orden: 40, label: "  2.5 Estudio de Mercado",         short_label: "Mercado",       grupo: "cuerpo" },
    { slug: "cap3-propuesta",      orden: 50, label: "Capítulo III — Propuesta",         short_label: "Cap. III",      grupo: "cuerpo" },
    { slug: "cap3a-estrategias",   orden: 52, label: "  3.1 Identificación de Estrategias", short_label: "Estrategias", grupo: "cuerpo" },
    { slug: "cap3b-diseno",        orden: 54, label: "  3.2 Diseño de la Propuesta",     short_label: "Diseño",        grupo: "cuerpo" },
    { slug: "cap3c-implementacion", orden: 56, label: "  3.3 Plan de Implementación",    short_label: "Implementación", grupo: "cuerpo" },
    { slug: "cap3d-seguimiento",   orden: 58, label: "  3.4 Plan de Seguimiento y Control", short_label: "Seguimiento", grupo: "cuerpo" },
    { slug: "cap3e-financiera",    orden: 60, label: "  3.5 Evaluación Financiera",      short_label: "Financiera",    grupo: "cuerpo" },
  ],

  // ── 4.2.3 — Proyecto de Grado: Diseño de Artefacto/Sistema ───────────────
  "unifranz-pg-artefacto": [
    { slug: "cap1",                  orden: 20, label: "Capítulo I — Marco Teórico", short_label: "Cap. I", grupo: "cuerpo" },
    { slug: "cap2-investigacion",    orden: 30, label: "Capítulo II — Investigación", short_label: "Cap. II", grupo: "cuerpo" },
    { slug: "cap2a-macroentorno",    orden: 32, label: "  2.1 Análisis del Macroentorno", short_label: "Macroentorno", grupo: "cuerpo" },
    { slug: "cap2b-microentorno",    orden: 34, label: "  2.2 Análisis del Microentorno", short_label: "Microentorno", grupo: "cuerpo" },
    { slug: "cap2c-matricial",       orden: 36, label: "  2.3 Análisis Matricial",        short_label: "Matricial",    grupo: "cuerpo" },
    { slug: "cap2d-metodologia",     orden: 38, label: "  2.4 Metodología de Investigación", short_label: "Metodología", grupo: "cuerpo" },
    { slug: "cap2e-mercado",         orden: 40, label: "  2.5 Estudio de Mercado",        short_label: "Mercado",      grupo: "cuerpo" },
    { slug: "cap3-diseno",           orden: 50, label: "Capítulo III — Diseño de Artefacto o Sistema", short_label: "Cap. III", grupo: "cuerpo" },
    { slug: "cap3a-especificaciones", orden: 52, label: "  3.1 Determinación de Especificaciones", short_label: "Especificaciones", grupo: "cuerpo" },
    { slug: "cap3b-planos",          orden: 54, label: "  3.2 Planos y Especificaciones Constructivas / Sistema Comercial", short_label: "Planos", grupo: "cuerpo" },
    { slug: "cap3c-prototipo",       orden: 56, label: "  3.3 Construcción del Prototipo / Diseño del Sistema Comercial", short_label: "Prototipo", grupo: "cuerpo" },
    { slug: "cap3d-validacion",      orden: 58, label: "  3.4 Validación del Prototipo / Sistema Comercial", short_label: "Validación", grupo: "cuerpo" },
    { slug: "cap3e-financiera",      orden: 60, label: "  3.5 Evaluación Financiera", short_label: "Financiera", grupo: "cuerpo" },
  ],

  // ── 4.2.4 — Trabajo Dirigido ─────────────────────────────────────────────
  // NOTA: estructura IDÉNTICA en cuerpo a Mejora Organizacional, pero
  // mantenemos slugs separados para que en el futuro se pueda divergir
  // (por ejemplo, si TD agrega cap de "Informe institucional").
  "unifranz-trabajo-dirigido": [
    { slug: "cap1",                orden: 20, label: "Capítulo I — Marco Teórico", short_label: "Cap. I", grupo: "cuerpo" },
    { slug: "cap2-investigacion",  orden: 30, label: "Capítulo II — Investigación", short_label: "Cap. II", grupo: "cuerpo" },
    { slug: "cap2a-microentorno",  orden: 32, label: "  2.1 Análisis del Microentorno",  short_label: "Microentorno",  grupo: "cuerpo" },
    { slug: "cap2b-institucional", orden: 34, label: "  2.2 Análisis Institucional",     short_label: "Institucional", grupo: "cuerpo" },
    { slug: "cap2c-matricial",     orden: 36, label: "  2.3 Análisis Matricial",         short_label: "Matricial",     grupo: "cuerpo" },
    { slug: "cap2d-metodologia",   orden: 38, label: "  2.4 Metodología de Investigación", short_label: "Metodología", grupo: "cuerpo" },
    { slug: "cap2e-mercado",       orden: 40, label: "  2.5 Estudio de Mercado",         short_label: "Mercado",       grupo: "cuerpo" },
    { slug: "cap3-propuesta",      orden: 50, label: "Capítulo III — Propuesta",         short_label: "Cap. III",      grupo: "cuerpo" },
    { slug: "cap3a-estrategias",   orden: 52, label: "  3.1 Identificación de Estrategias", short_label: "Estrategias", grupo: "cuerpo" },
    { slug: "cap3b-diseno",        orden: 54, label: "  3.2 Diseño de la Propuesta",     short_label: "Diseño",        grupo: "cuerpo" },
    { slug: "cap3c-implementacion", orden: 56, label: "  3.3 Plan de Implementación",    short_label: "Implementación", grupo: "cuerpo" },
    { slug: "cap3d-seguimiento",   orden: 58, label: "  3.4 Plan de Seguimiento y Control", short_label: "Seguimiento", grupo: "cuerpo" },
    { slug: "cap3e-financiera",    orden: 60, label: "  3.5 Evaluación Financiera",      short_label: "Financiera",    grupo: "cuerpo" },
  ],
};

/** Construye el ID estable de una fase UNIFRANZ. */
function buildPhaseId(modalidad: ModalidadUnifranz, slug: string): string {
  return `ph-unifranz-${modalidad.replace(/^unifranz-/, "")}-${slug}`;
}

/**
 * Devuelve las `PhaseDefinition[]` para una modalidad UNIFRANZ específica.
 *
 * Mientras los prompts reales no estén implementados, TODAS las fases reciben
 * un placeholder server-only que devuelve un mensaje "en construcción" si la
 * IA es invocada. El contenido real se rellena directamente en
 * `project.phase_contents[phase_id]` desde la sesión de desarrollo (yo
 * actuando como API) o, en producción, conectando el prompt real.
 */
export function getUnifranzPhases(modalidad: ModalidadUnifranz): PhaseDefinition[] {
  const info = getModalidadUnifranz(modalidad);
  if (!info) return [];

  const cuerpo = CUERPO_POR_MODALIDAD[modalidad] ?? [];

  // Unimos comunes + cuerpo y ordenamos por `orden` (los gaps permiten
  // intercalar capítulos del cuerpo entre Apertura y Cierre).
  const todas = [...FASES_COMUNES, ...cuerpo].sort((a, b) => a.orden - b.orden);

  return todas.map((spec) => ({
    id: buildPhaseId(modalidad, spec.slug),
    servicio_id: SERVICIO_PROYECTO_GRADO,
    tipo_proyecto_id: modalidad, // usamos la modalidad como tipo_proyecto_id
    orden: spec.orden,
    label: spec.label,
    short_label: spec.short_label,
    prompt: buildPlaceholderUnifranz({ modalidad: info.nombre, fase_label: spec.label }),
  }));
}

/** Helper público: ¿este servicio + tipo corresponde a una modalidad UNIFRANZ? */
export function esTipoModalidadUnifranz(tipoProyectoId: string | null | undefined): tipoProyectoId is ModalidadUnifranz {
  if (!tipoProyectoId) return false;
  return getModalidadUnifranz(tipoProyectoId) !== null;
}

/** Devuelve los IDs de fase con su grupo (para el sidebar agrupado). */
export function getUnifranzPhaseGroups(modalidad: ModalidadUnifranz): Array<{
  grupo: FaseUnifranzSpec["grupo"];
  fases: Array<{ id: string; label: string; short_label: string; orden: number }>;
}> {
  const cuerpo = CUERPO_POR_MODALIDAD[modalidad] ?? [];
  const todas = [...FASES_COMUNES, ...cuerpo].sort((a, b) => a.orden - b.orden);

  const gruposOrden: Array<FaseUnifranzSpec["grupo"]> = [
    "preliminares",
    "apertura",
    "cuerpo",
    "cierre",
    "export",
  ];

  return gruposOrden.map((grupo) => ({
    grupo,
    fases: todas
      .filter((f) => f.grupo === grupo)
      .map((f) => ({
        id: buildPhaseId(modalidad, f.slug),
        label: f.label,
        short_label: f.short_label,
        orden: f.orden,
      })),
  })).filter((g) => g.fases.length > 0);
}
