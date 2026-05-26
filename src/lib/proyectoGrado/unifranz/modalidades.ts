/**
 * Catálogo público de modalidades de titulación UNIFRANZ Cochabamba.
 *
 * Basado en la "Guía de Organización y Presentación de Trabajos de Grado"
 * (UNIFRANZ Cochabamba, 2017) — secciones 1 y 4 del documento oficial.
 *
 * IMPORTANTE: este módulo NO contiene prompts. Es metadata segura para
 * importar desde componentes cliente (`/projects/new`, sidebar, etc.).
 * Los megaprompts viven en `src/lib/prompts/proyectoGrado/unifranz/*`
 * y solo se importan desde API routes (server-only).
 */

/** ID oficial de UNIFRANZ Cochabamba en la tabla de universidades. */
export const UNIFRANZ_UNIVERSITY_ID = "unifranz-cba-001";

/** IDs estables de cada modalidad. NO renombrar (los proyectos viejos los referencian). */
export type ModalidadUnifranz =
  | "unifranz-tesis"
  | "unifranz-pg-prefactibilidad"
  | "unifranz-pg-mejora-org"
  | "unifranz-pg-artefacto"
  | "unifranz-trabajo-dirigido";

/** Información pública de cada modalidad (sin prompts). */
export interface ModalidadUnifranzInfo {
  /** ID estable usado en el store. */
  id: ModalidadUnifranz;
  /** Nombre comercial visible en el wizard. */
  nombre: string;
  /** Texto a imprimir en la portada del documento final. */
  nombre_portada: string;
  /** Descripción de 1–2 líneas para la tarjeta del wizard. */
  descripcion: string;
  /** A quién está dirigida (carrera/escenario típico). */
  pensada_para: string;
  /** Resumen de la estructura del cuerpo (sin preliminares ni cierre). */
  capitulos: string[];
  /** Sello de la guía oficial UNIFRANZ que respalda la modalidad. */
  guia_oficial: {
    nombre: string;
    fecha: string;
    seccion_referencia: string; // ej. "4.1" o "4.2.1"
    url_pdf: string;
  };
}

const GUIA_UNIFRANZ_2017 = {
  nombre: "Guía de Organización y Presentación de Trabajos de Grado — UNIFRANZ Cochabamba",
  fecha: "2017",
  url_pdf: "/guias-unifranz/unifranz-cba-guia-2017.pdf",
};

/**
 * Las 5 modalidades de titulación oficiales según la guía UNIFRANZ 2017.
 * Orden de aparición en el wizard.
 */
export const MODALIDADES_UNIFRANZ: readonly ModalidadUnifranzInfo[] = [
  {
    id: "unifranz-tesis",
    nombre: "Tesis de Grado",
    nombre_portada: "TESIS DE GRADO",
    descripcion:
      "Trabajo de investigación con rigurosidad científica que da solución y respuestas demostrables a un problema científico, con hipótesis verificable.",
    pensada_para:
      "Estudiantes que desean realizar investigación pura, con planteamiento de hipótesis, marco teórico amplio y discusión crítica de resultados.",
    capitulos: [
      "Capítulo I — Marco Teórico",
      "Capítulo II — Marco Práctico (metodología)",
      "Capítulo III — Resultados y Discusión",
    ],
    guia_oficial: { ...GUIA_UNIFRANZ_2017, seccion_referencia: "4.1" },
  },
  {
    id: "unifranz-pg-prefactibilidad",
    nombre: "Proyecto de Grado — Pre-Factibilidad",
    nombre_portada: "PROYECTO DE GRADO",
    descripcion:
      "Estudio de pre-factibilidad para una oportunidad de inversión. Analiza viabilidad de mercado, técnica, organizacional, legal y financiera de un nuevo emprendimiento.",
    pensada_para:
      "Estudiantes que proponen crear un negocio nuevo y necesitan probar su viabilidad antes de la inversión.",
    capitulos: [
      "Capítulo I — Marco Teórico",
      "Capítulo II — Investigación (macroentorno, microentorno, matricial, metodología, mercado)",
      "Capítulo III — Plan Estratégico (organización, marketing, producción, financiera, legal)",
    ],
    guia_oficial: { ...GUIA_UNIFRANZ_2017, seccion_referencia: "4.2.1" },
  },
  {
    id: "unifranz-pg-mejora-org",
    nombre: "Proyecto de Grado — Mejora Organizacional",
    nombre_portada: "PROYECTO DE GRADO",
    descripcion:
      "Propuesta o implementación de mejora o innovación organizacional para una empresa o institución existente. Se enfoca en intervenir un sistema actual, no en crear uno nuevo.",
    pensada_para:
      "Estudiantes que identifican un problema en una organización real y proponen un plan de mejora con estrategias, implementación y seguimiento.",
    capitulos: [
      "Capítulo I — Marco Teórico",
      "Capítulo II — Investigación (microentorno, institucional, matricial, metodología, mercado)",
      "Capítulo III — Propuesta (estrategias, diseño, implementación, seguimiento, evaluación financiera)",
    ],
    guia_oficial: { ...GUIA_UNIFRANZ_2017, seccion_referencia: "4.2.2" },
  },
  {
    id: "unifranz-pg-artefacto",
    nombre: "Proyecto de Grado — Diseño de Artefacto",
    nombre_portada: "PROYECTO DE GRADO",
    descripcion:
      "Diseño de un artefacto, sistema o dispositivo. Incluye especificaciones, planos, prototipo y validación funcional.",
    pensada_para:
      "Estudiantes de ingenierías y carreras técnicas que desean construir un prototipo o sistema con valor comercial demostrable.",
    capitulos: [
      "Capítulo I — Marco Teórico",
      "Capítulo II — Investigación (macroentorno, microentorno, matricial, metodología, mercado)",
      "Capítulo III — Diseño de Artefacto o Sistema (especificaciones, planos, prototipo, validación, evaluación financiera)",
    ],
    guia_oficial: { ...GUIA_UNIFRANZ_2017, seccion_referencia: "4.2.3" },
  },
  {
    id: "unifranz-trabajo-dirigido",
    nombre: "Trabajo Dirigido",
    nombre_portada: "TRABAJO DIRIGIDO",
    descripcion:
      "Trabajo sistemático realizado en una institución o empresa acreditada, que plantea una propuesta de intervención aplicable al problema detectado.",
    pensada_para:
      "Estudiantes que ya están trabajando en una empresa o institución y desean titular en base a su experiencia real con una propuesta de intervención.",
    capitulos: [
      "Capítulo I — Marco Teórico",
      "Capítulo II — Investigación (microentorno, institucional, matricial, metodología, mercado)",
      "Capítulo III — Propuesta (estrategias, diseño, implementación, seguimiento, evaluación financiera)",
    ],
    guia_oficial: { ...GUIA_UNIFRANZ_2017, seccion_referencia: "4.2.4" },
  },
];

/** Lookup helper: encuentra una modalidad por su ID. */
export function getModalidadUnifranz(id: string | null | undefined): ModalidadUnifranzInfo | null {
  if (!id) return null;
  return MODALIDADES_UNIFRANZ.find((m) => m.id === id) ?? null;
}

/** ¿El proyecto pertenece a UNIFRANZ + Proyecto de Grado y tiene modalidad asignada? */
export function esProyectoUnifranz(args: {
  universidad_id?: string | null;
  servicio_id?: string | null;
  modalidad_titulacion?: string | null;
}): boolean {
  return (
    args.universidad_id === UNIFRANZ_UNIVERSITY_ID
    && args.servicio_id === "proy-grado-001"
    && getModalidadUnifranz(args.modalidad_titulacion) !== null
  );
}

/**
 * Reglas inmutables de formato según la guía UNIFRANZ 2017 (sección 3.2).
 * Se expone como metadata pública para que la UI muestre la guía al estudiante.
 */
export const FORMATO_UNIFRANZ_OFICIAL = {
  procesador: "MS Word",
  papel: "Bond carta (215.9 × 279.4 mm), impresión una sola cara",
  margenes: { superior: 2.5, inferior: 2.5, izquierdo: 3.5, derecho: 2.5, unidad: "cm" as const },
  tipografia: { familia: "Verdana", tamano: 10, color: "negro" as const },
  parrafo: {
    interlineado: 1.5,
    espaciado_antes: 6,
    espaciado_despues: 6,
    sangria_izquierda: 0,
    sangria_derecha: 0,
    unidad_espaciado: "pt" as const,
  },
  numeracion_paginas: {
    posicion: "inferior-derecha" as const,
    preliminares: "romanos minúsculos (i, ii, iii)" as const,
    cuerpo: "arábigos desde 1 en INTRODUCCIÓN" as const,
  },
  redaccion: {
    persona: "tercera persona singular" as const,
    tiempo: "pasado" as const,
    prohibido: ["primera persona", "exclamaciones", "preguntas en primera persona"],
  },
  citas_apa: {
    estilo: "APA con apellidos en minúsculas en bibliografía",
    cita_corta: "≤ 40 palabras: entre comillas y en cursiva, con (Apellido, año, p.)",
    cita_larga: "> 40 palabras: sangría 5–6 espacios izq y 1cm der, en cursiva, sin comillas",
  },
  resumen: { palabras_objetivo: 250 },
} as const;
