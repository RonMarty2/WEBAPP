/**
 * Validadores específicos UNIFRANZ — Universidad Privada Franz Tamayo
 * (sede Cochabamba, Guía 2017 — aplicable a todas las carreras de la sede).
 *
 * Estructura paralela a `umssValidators.ts`. Server-only.
 *
 * Fuente: "Guía de Organización y Presentación de Trabajos de Grado",
 * UNIFRANZ Cochabamba, 2017. Cubre 3 modalidades:
 *   - Tesis de Grado
 *   - Proyecto de Grado (3 sub-tipos: pre-factibilidad, mejora, diseño)
 *   - Trabajo Dirigido
 */

export type FormatoUNIFRANZ =
  | "unifranz_tesis_2017"
  | "unifranz_proyecto_prefactibilidad_2017";

// ─── Extensión recomendada ───────────────────────────────────────────────────

/**
 * UNIFRANZ no fija un rango oficial de páginas en la guía. Estos rangos son
 * orientativos basados en buenas prácticas observadas en trabajos aprobados:
 *   - Tesis: 60-120 páginas (cuerpo, sin preliminares ni anexos)
 *   - Proyecto: 80-150 páginas (incluye plan de negocios completo)
 */
export const RANGOS_PAGINAS_UNIFRANZ: Record<FormatoUNIFRANZ, { min: number; max: number; incluye_anexos: boolean }> = {
  unifranz_tesis_2017: { min: 60, max: 120, incluye_anexos: false },
  unifranz_proyecto_prefactibilidad_2017: { min: 80, max: 150, incluye_anexos: false },
};

// ─── Diccionario público de guías UNIFRANZ oficiales ─────────────────────────

/**
 * Metadata pública de las guías UNIFRANZ. La UI consume este diccionario vía
 * `/api/cap1-variants` para mostrar autor/fecha/características al estudiante.
 *
 * IMPORTANTE: ambas variantes apuntan al MISMO PDF físico (la guía 2017 cubre
 * las 5 modalidades en un solo documento). Solo cambia el énfasis textual.
 */
export const GUIAS_UNIFRANZ_OFICIALES: Record<FormatoUNIFRANZ, {
  nombre: string;
  autor: string;
  fecha: string;
  url_referencia?: string;
  url_documento_pdf?: string;
  caracteristicas: string[];
}> = {
  unifranz_tesis_2017: {
    nombre: "Guía UNIFRANZ — Modalidad Tesis de Grado",
    autor: "UNIFRANZ — Universidad Privada Franz Tamayo (Cochabamba)",
    fecha: "Edición 2017",
    url_documento_pdf: "/api/guias-unifranz/guia1",
    caracteristicas: [
      "Tipografía Verdana 11 en todo el cuerpo (único color permitido: negro)",
      "Márgenes: superior 2.5 / izquierdo 3.5 / inferior 2.5 / derecho 2.5 cm",
      "Interlineado 1.5 · 6pt posteriores · sin sangría · numeración inferior derecha",
      "Preliminares en romanos minúsculos (i, ii) · cuerpo en arábigos desde INTRODUCCIÓN",
      "Estructura: INTRODUCCIÓN (Planteamiento + 4 Justificaciones + Objetivos + Alcances + Hipótesis) → Cap.I Marco Teórico → Cap.II Marco Práctico → Cap.III Resultados y Discusión → Conclusiones → Recomendaciones",
      "Citas APA en cursiva entre comillas para textuales cortas (<40 palabras)",
      "Bibliografía APA, apellidos en minúsculas",
      "Redacción impersonal en 3ª persona singular, tiempo pasado",
      "Tapa color plomo con letras doradas, fuente Verdana",
    ],
  },
  unifranz_proyecto_prefactibilidad_2017: {
    nombre: "Guía UNIFRANZ — Proyecto de Grado: Pre-Factibilidad para Oportunidad de Inversión",
    autor: "UNIFRANZ — Universidad Privada Franz Tamayo (Cochabamba)",
    fecha: "Edición 2017",
    url_documento_pdf: "/api/guias-unifranz/guia1",
    caracteristicas: [
      "Tipografía Verdana 11 · márgenes 3.5/2.5 · numeración inferior derecha",
      "Estructura: INTRODUCCIÓN (Planteamiento + 4 Justificaciones + Objetivos + Alcances + Hipótesis)",
      "Cap. I: Marco Teórico",
      "Cap. II: Investigación (macroentorno + microentorno + mercado + necesidades del producto + métodos de elaboración + marco legal)",
      "Cap. III: Plan de Negocios (marketing + operativo + organizacional + financiero)",
      "Conclusiones y Recomendaciones como secciones obligatorias",
      "Bibliografía APA, apellidos en minúsculas",
      "Redacción impersonal en 3ª persona singular",
    ],
  },
};
