/**
 * Librería de ESTRUCTURAS de documento por universidad + modalidad.
 *
 * Cada estructura es la lista ordenada de secciones (capítulos/subsecciones)
 * que el Generador Conectado usa como esqueleto del documento. Vienen de
 * guías oficiales reales:
 *   - UNIFRANZ Cochabamba 2017 (secciones 4.1 y 4.2.x) — ya codificadas en
 *     src/lib/proyectoGrado/unifranz/* y replicadas aquí en formato "secciones".
 *   - UMSS Posgrado FCE 2024 (guías de monografía, tesis y exploración
 *     investigativa) — extraídas de los PDFs oficiales.
 *   - Genéricos bolivianos para universidades no listadas.
 *
 * Client-safe: solo datos, sin prompts ni dependencias de servidor.
 */

export interface FormatoEstructura {
  id: string;
  nombre: string;        // visible en el selector
  universidad: string;   // 'UNIFRANZ' | 'UMSS' | 'Genérico'
  modalidad: string;     // 'Tesis' | 'Proyecto de Grado' | 'Monografía' | …
  fuente: string;        // guía/sección de respaldo
  /** Títulos de sección, en orden. Cada uno será una sección generable. */
  secciones: string[];
}

// Bloques comunes reutilizables
const PRELIMINAR = ['Resumen ejecutivo'];
const CIERRE = ['Conclusiones', 'Recomendaciones', 'Bibliografía (APA)'];
const INTRO_PG = 'Introducción (planteamiento, justificación, objetivos, alcances, hipótesis)';

export const FORMATOS: FormatoEstructura[] = [
  // ───────────────────────── UNIFRANZ ─────────────────────────
  {
    id: 'unifranz-tesis',
    nombre: 'UNIFRANZ — Tesis de Grado',
    universidad: 'UNIFRANZ',
    modalidad: 'Tesis',
    fuente: 'Guía UNIFRANZ 2017, sección 4.1',
    secciones: [
      ...PRELIMINAR,
      INTRO_PG,
      'Capítulo I — Marco Teórico',
      'Capítulo II — Marco Práctico (metodología)',
      'Capítulo III — Resultados y Discusión',
      ...CIERRE,
    ],
  },
  {
    id: 'unifranz-pg-prefactibilidad',
    nombre: 'UNIFRANZ — Proyecto de Grado (Pre-Factibilidad)',
    universidad: 'UNIFRANZ',
    modalidad: 'Proyecto de Grado',
    fuente: 'Guía UNIFRANZ 2017, sección 4.2.1',
    secciones: [
      ...PRELIMINAR,
      INTRO_PG,
      'Capítulo I — Marco Teórico',
      'Capítulo II — Investigación',
      '2.1 Análisis del Macroentorno',
      '2.2 Análisis del Microentorno',
      '2.3 Análisis Matricial',
      '2.4 Metodología de Investigación',
      '2.5 Estudio de Mercado',
      'Capítulo III — Plan Estratégico',
      '3.1 Estructura Organizacional',
      '3.2 Plan de Marketing',
      '3.3 Plan de Producción',
      '3.4 Planificación Financiera',
      '3.5 Aspectos Legales',
      ...CIERRE,
    ],
  },
  {
    id: 'unifranz-pg-mejora-org',
    nombre: 'UNIFRANZ — Proyecto de Grado (Mejora Organizacional)',
    universidad: 'UNIFRANZ',
    modalidad: 'Proyecto de Grado',
    fuente: 'Guía UNIFRANZ 2017, sección 4.2.2',
    secciones: [
      ...PRELIMINAR,
      INTRO_PG,
      'Capítulo I — Marco Teórico',
      'Capítulo II — Investigación',
      '2.1 Análisis del Microentorno',
      '2.2 Análisis Institucional',
      '2.3 Análisis Matricial',
      '2.4 Metodología de Investigación',
      '2.5 Estudio de Mercado',
      'Capítulo III — Propuesta',
      '3.1 Identificación de Estrategias',
      '3.2 Diseño de la Propuesta',
      '3.3 Plan de Implementación',
      '3.4 Plan de Seguimiento y Control',
      '3.5 Evaluación Financiera',
      ...CIERRE,
    ],
  },
  {
    id: 'unifranz-pg-artefacto',
    nombre: 'UNIFRANZ — Proyecto de Grado (Diseño de Artefacto)',
    universidad: 'UNIFRANZ',
    modalidad: 'Proyecto de Grado',
    fuente: 'Guía UNIFRANZ 2017, sección 4.2.3',
    secciones: [
      ...PRELIMINAR,
      INTRO_PG,
      'Capítulo I — Marco Teórico',
      'Capítulo II — Investigación',
      '2.1 Análisis del Macroentorno',
      '2.2 Análisis del Microentorno',
      '2.3 Análisis Matricial',
      '2.4 Metodología de Investigación',
      '2.5 Estudio de Mercado',
      'Capítulo III — Diseño de Artefacto o Sistema',
      '3.1 Especificaciones técnicas',
      '3.2 Planos / diagramas',
      '3.3 Prototipo',
      '3.4 Validación funcional',
      '3.5 Evaluación Financiera',
      ...CIERRE,
    ],
  },
  {
    id: 'unifranz-trabajo-dirigido',
    nombre: 'UNIFRANZ — Trabajo Dirigido',
    universidad: 'UNIFRANZ',
    modalidad: 'Trabajo Dirigido',
    fuente: 'Guía UNIFRANZ 2017, sección 4.2.4',
    secciones: [
      ...PRELIMINAR,
      INTRO_PG,
      'Capítulo I — Marco Teórico',
      'Capítulo II — Investigación',
      '2.1 Análisis del Microentorno',
      '2.2 Análisis Institucional',
      '2.3 Análisis Matricial',
      '2.4 Metodología de Investigación',
      '2.5 Estudio de Mercado',
      'Capítulo III — Propuesta',
      '3.1 Identificación de Estrategias',
      '3.2 Diseño de la Propuesta',
      '3.3 Plan de Implementación',
      '3.4 Plan de Seguimiento y Control',
      '3.5 Evaluación Financiera',
      ...CIERRE,
    ],
  },

  // ───────────────────────── UMSS Posgrado FCE ─────────────────────────
  {
    id: 'umss-monografia',
    nombre: 'UMSS Posgrado FCE — Monografía',
    universidad: 'UMSS',
    modalidad: 'Monografía',
    fuente: 'Guía de Monografía UMSS Posgrado FCE, 2024',
    secciones: [
      ...PRELIMINAR,
      'Capítulo I — Introducción',
      'Capítulo II — Marco Teórico y Referencial',
      'Capítulo III — Diseño de la Investigación',
      'Capítulo IV — Análisis de Resultados',
      'Capítulo V — Conclusiones y Recomendaciones',
      'Referencias Bibliográficas',
    ],
  },
  {
    id: 'umss-tesis',
    nombre: 'UMSS Posgrado FCE — Tesis (Maestría)',
    universidad: 'UMSS',
    modalidad: 'Tesis',
    fuente: 'Guía de Estructura de Tesis UMSS Posgrado FCE, 2024',
    secciones: [
      ...PRELIMINAR,
      'Capítulo I — Introducción (justificación, problema, objetivos, hipótesis, metodología)',
      'Capítulo II — Marco Teórico, Contextual y/o Referencial',
      'Capítulo III — Generación de Información y Metodología',
      'Capítulo IV — Resultados, Discusión y/o Propuesta',
      'Capítulo V — Conclusiones y Recomendaciones',
      'Referencias Bibliográficas',
    ],
  },
  {
    id: 'umss-exploracion',
    nombre: 'UMSS Posgrado FCE — Exploración Investigativa e Intervención',
    universidad: 'UMSS',
    modalidad: 'Exploración Investigativa e Intervención',
    fuente: 'Guía de Estructura UMSS Posgrado FCE, 2024',
    secciones: [
      ...PRELIMINAR,
      'Capítulo I — Introducción',
      '1.1 Justificación (teórica, económica/práctica, social)',
      '1.2 Planteamiento y formulación del problema',
      '1.3 Planteamiento de objetivos',
      '1.4 Alcances y delimitación',
      'Capítulo II — Marco Teórico, Contextual y/o Referencial',
      'Capítulo III — Diagnóstico / Análisis situacional',
      'Capítulo IV — Propuesta de Intervención',
      'Capítulo V — Conclusiones y Recomendaciones',
      'Referencias Bibliográficas',
    ],
  },

  // ───────────────────────── Genéricos ─────────────────────────
  {
    id: 'generico-proyecto-grado',
    nombre: 'Genérico — Proyecto de Grado / Plan de Negocio',
    universidad: 'Genérico',
    modalidad: 'Proyecto de Grado',
    fuente: 'Estructura estándar boliviana',
    secciones: [
      ...PRELIMINAR,
      INTRO_PG,
      'Capítulo I — Marco Teórico y Referencial',
      'Capítulo II — Diagnóstico (entorno y mercado)',
      'Capítulo III — Propuesta (estrategia, marketing, organización, técnico)',
      'Capítulo IV — Evaluación Financiera',
      ...CIERRE,
    ],
  },
  {
    id: 'generico-monografia',
    nombre: 'Genérico — Monografía',
    universidad: 'Genérico',
    modalidad: 'Monografía',
    fuente: 'Estructura estándar boliviana',
    secciones: [
      ...PRELIMINAR,
      'Introducción',
      'Capítulo I — Marco Teórico',
      'Capítulo II — Desarrollo',
      'Capítulo III — Análisis',
      ...CIERRE,
    ],
  },
  {
    id: 'generico-tesis',
    nombre: 'Genérico — Tesis',
    universidad: 'Genérico',
    modalidad: 'Tesis',
    fuente: 'Estructura estándar boliviana',
    secciones: [
      ...PRELIMINAR,
      'Capítulo I — Introducción y planteamiento del problema',
      'Capítulo II — Marco Teórico',
      'Capítulo III — Metodología',
      'Capítulo IV — Resultados y Discusión',
      'Capítulo V — Conclusiones y Recomendaciones',
      'Referencias Bibliográficas',
    ],
  },
];

/** Normaliza texto para comparar (sin acentos, minúsculas). */
function norm(s: string | null | undefined): string {
  return (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * Sugiere los formatos más relevantes según universidad + modalidad del maestro.
 * Devuelve TODOS los formatos, pero ordenados: primero los que mejor calzan.
 * `recomendadoId` marca el match más fuerte (si lo hay).
 */
export function ordenarFormatos(
  universidad: string | null | undefined,
  modalidad: string | null | undefined,
): { formatos: FormatoEstructura[]; recomendadoId: string | null } {
  const u = norm(universidad);
  const m = norm(modalidad);

  const score = (f: FormatoEstructura): number => {
    let s = 0;
    const fu = norm(f.universidad);
    if (fu !== 'generico' && u.includes(fu)) s += 10;             // misma universidad
    if (u.includes('franz') && f.universidad === 'UNIFRANZ') s += 10;
    if (u.includes('san simon') && f.universidad === 'UMSS') s += 10;
    if (m && norm(f.modalidad).includes(m)) s += 5;               // misma modalidad
    if (m && m.includes(norm(f.modalidad))) s += 5;
    if (f.universidad === 'Genérico') s += 1;                     // desempate suave
    return s;
  };

  const conScore = FORMATOS.map((f) => ({ f, s: score(f) }));
  conScore.sort((a, b) => b.s - a.s);
  const mejor = conScore[0];
  const recomendadoId = mejor && mejor.s >= 5 ? mejor.f.id : null;
  return { formatos: conScore.map((x) => x.f), recomendadoId };
}

export function getFormato(id: string): FormatoEstructura | undefined {
  return FORMATOS.find((f) => f.id === id);
}
