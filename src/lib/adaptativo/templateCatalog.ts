/**
 * Catálogo de plantillas conocidas.
 *
 * Cada entrada describe una plantilla académica ya implementada en el sistema
 * (UMSS clásico/reducido, UCB licenciatura, UNIFRANZ tesis/prefactibilidad,
 * Proyecto de Grado). El catálogo se usa para:
 *  - Matchear contra la guía del estudiante (templateMatcher.ts)
 *  - Construir el plan adaptativo (planBuilder.ts)
 *
 * Cada plantilla tiene:
 *  - `mapeo`: cómo se mapea contra el sistema existente (servicio + variante)
 *  - `features`: huella semántica boolean usada para matching rápido
 *  - `secciones_canonicas`: lista de secciones que la plantilla cubre, con
 *    SINÓNIMOS que ayudan al matcher a reconocerlas en la guía del docente
 *
 * Server-only — no exponer al cliente. La metadata pública (nombre, descripción)
 * sí puede mostrarse en la UI vía /api/adaptativo/analyze-guide.
 */

import type { PlantillaBaseId, TonoDocumento } from './types';

export interface SeccionCanonica {
  /** Identificador estable dentro de la plantilla */
  id: string;
  /** Título principal de la sección */
  titulo: string;
  /** Sinónimos que pueden aparecer en la guía del docente (lowercase, sin acentos) */
  sinonimos: string[];
  /** Si esta sección es obligatoria en la plantilla original */
  obligatoria: boolean;
  /** Orden canónico en el documento final */
  orden: number;
}

export interface PlantillaCatalogo {
  id: PlantillaBaseId;
  nombre: string;
  descripcion: string;
  /** Cómo se conecta con los servicios existentes del sistema */
  mapeo: {
    servicio_id: string;
    variante_id?: string;
    tipo_proyecto_id?: string;
  };
  /** Huella semántica para matching rápido contra GuiaAnalizada */
  features: {
    pide_hipotesis: boolean;
    pide_marco_teorico_extenso: boolean;
    pide_pestel_porter: boolean;
    pide_encuesta: boolean;
    pide_analisis_cuantitativo: boolean;
    paginas_tipicas: { min: number; max: number };
    tono_principal: TonoDocumento;
  };
  /** Secciones canónicas en orden de aparición */
  secciones_canonicas: SeccionCanonica[];
}

export const CATALOGO_PLANTILLAS: PlantillaCatalogo[] = [
  // ───────────────────────────────────────────────────────────────────
  // UMSS Clásico — Guía 1 Posgrado FCE (Doble Titulación)
  // ───────────────────────────────────────────────────────────────────
  {
    id: 'umss-clasico',
    nombre: 'UMSS · Estilo Clásico (Posgrado FCE)',
    descripcion:
      'Estructura completa con hipótesis, marco teórico extenso y metodología detallada. Recomendado para tesis y trabajos de posgrado.',
    mapeo: {
      servicio_id: 'mono-001',
      variante_id: 'clasico',
      tipo_proyecto_id: 'tipo-monografia',
    },
    features: {
      pide_hipotesis: true,
      pide_marco_teorico_extenso: true,
      pide_pestel_porter: false,
      pide_encuesta: false,
      pide_analisis_cuantitativo: true,
      paginas_tipicas: { min: 60, max: 120 },
      tono_principal: 'academico',
    },
    secciones_canonicas: [
      {
        id: 'antecedentes',
        titulo: 'Antecedentes',
        sinonimos: ['antecedentes', 'estado del arte', 'estudios previos', 'investigaciones anteriores'],
        obligatoria: true,
        orden: 1,
      },
      {
        id: 'planteamiento',
        titulo: 'Planteamiento del problema',
        sinonimos: ['planteamiento', 'problema', 'descripcion del problema', 'situacion problematica'],
        obligatoria: true,
        orden: 2,
      },
      {
        id: 'formulacion',
        titulo: 'Formulación del problema',
        sinonimos: ['formulacion', 'pregunta de investigacion', 'preguntas'],
        obligatoria: true,
        orden: 3,
      },
      {
        id: 'objetivos',
        titulo: 'Objetivos (general y específicos)',
        sinonimos: ['objetivos', 'objetivo general', 'objetivos especificos', 'meta'],
        obligatoria: true,
        orden: 4,
      },
      {
        id: 'justificacion',
        titulo: 'Justificación',
        sinonimos: ['justificacion', 'importancia', 'relevancia', 'aporte'],
        obligatoria: true,
        orden: 5,
      },
      {
        id: 'alcances',
        titulo: 'Alcances y delimitaciones',
        sinonimos: ['alcances', 'delimitaciones', 'limitaciones', 'alcance'],
        obligatoria: true,
        orden: 6,
      },
      {
        id: 'hipotesis',
        titulo: 'Hipótesis',
        sinonimos: ['hipotesis', 'h1', 'h0', 'supuestos', 'conjeturas'],
        obligatoria: true,
        orden: 7,
      },
      {
        id: 'marco_teorico',
        titulo: 'Marco teórico',
        sinonimos: ['marco teorico', 'fundamentacion teorica', 'bases conceptuales', 'fundamentos'],
        obligatoria: true,
        orden: 8,
      },
      {
        id: 'metodologia',
        titulo: 'Diseño metodológico',
        sinonimos: ['metodologia', 'diseno metodologico', 'tipo de investigacion', 'metodo'],
        obligatoria: true,
        orden: 9,
      },
      {
        id: 'resultados',
        titulo: 'Resultados y análisis',
        sinonimos: ['resultados', 'analisis', 'hallazgos', 'discusion'],
        obligatoria: true,
        orden: 10,
      },
      {
        id: 'conclusiones',
        titulo: 'Conclusiones y recomendaciones',
        sinonimos: ['conclusiones', 'recomendaciones', 'cierre', 'reflexion final'],
        obligatoria: true,
        orden: 11,
      },
      {
        id: 'bibliografia',
        titulo: 'Bibliografía APA 7',
        sinonimos: ['bibliografia', 'referencias', 'fuentes', 'apa'],
        obligatoria: true,
        orden: 12,
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────
  // UMSS Reducido — Guía 2 Céspedes
  // ───────────────────────────────────────────────────────────────────
  {
    id: 'umss-reducido',
    nombre: 'UMSS · Estilo Reducido (Céspedes)',
    descripcion:
      'Versión simplificada: sin hipótesis explícita, marco teórico breve, metodología directa. Recomendado para monografías cortas y trabajos de pregrado.',
    mapeo: {
      servicio_id: 'mono-001',
      variante_id: 'reducido',
      tipo_proyecto_id: 'tipo-monografia',
    },
    features: {
      pide_hipotesis: false,
      pide_marco_teorico_extenso: false,
      pide_pestel_porter: false,
      pide_encuesta: false,
      pide_analisis_cuantitativo: false,
      paginas_tipicas: { min: 20, max: 50 },
      tono_principal: 'academico',
    },
    secciones_canonicas: [
      {
        id: 'introduccion',
        titulo: 'Introducción / Planteamiento',
        sinonimos: ['introduccion', 'planteamiento', 'contexto', 'presentacion'],
        obligatoria: true,
        orden: 1,
      },
      {
        id: 'objetivos',
        titulo: 'Objetivos',
        sinonimos: ['objetivos', 'objetivo general', 'meta'],
        obligatoria: true,
        orden: 2,
      },
      {
        id: 'justificacion',
        titulo: 'Justificación',
        sinonimos: ['justificacion', 'importancia', 'relevancia'],
        obligatoria: true,
        orden: 3,
      },
      {
        id: 'marco_teorico',
        titulo: 'Marco teórico (breve)',
        sinonimos: ['marco teorico', 'fundamentacion', 'bases conceptuales'],
        obligatoria: true,
        orden: 4,
      },
      {
        id: 'desarrollo',
        titulo: 'Desarrollo / Análisis',
        sinonimos: ['desarrollo', 'analisis', 'cuerpo', 'contenido principal'],
        obligatoria: true,
        orden: 5,
      },
      {
        id: 'conclusiones',
        titulo: 'Conclusiones',
        sinonimos: ['conclusiones', 'cierre', 'reflexion'],
        obligatoria: true,
        orden: 6,
      },
      {
        id: 'bibliografia',
        titulo: 'Bibliografía APA 7',
        sinonimos: ['bibliografia', 'referencias', 'fuentes', 'apa'],
        obligatoria: true,
        orden: 7,
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────
  // UCB Licenciatura — Guía 6ª edición Marzo 2020
  // ───────────────────────────────────────────────────────────────────
  {
    id: 'ucb-licenciatura',
    nombre: 'UCB · Licenciatura (San Pablo)',
    descripcion:
      'Tesina de licenciatura UCB San Pablo Cochabamba. Estructura intermedia entre UMSS clásico y reducido, con marco teórico aplicado y metodología cualitativa o mixta.',
    mapeo: {
      servicio_id: 'mono-001',
      variante_id: 'ucb_licenciatura',
      tipo_proyecto_id: 'tipo-monografia',
    },
    features: {
      pide_hipotesis: false,
      pide_marco_teorico_extenso: true,
      pide_pestel_porter: false,
      pide_encuesta: true,
      pide_analisis_cuantitativo: false,
      paginas_tipicas: { min: 40, max: 80 },
      tono_principal: 'academico',
    },
    secciones_canonicas: [
      {
        id: 'introduccion',
        titulo: 'Introducción',
        sinonimos: ['introduccion', 'presentacion', 'contexto'],
        obligatoria: true,
        orden: 1,
      },
      {
        id: 'problema',
        titulo: 'Planteamiento del problema',
        sinonimos: ['planteamiento', 'problema', 'pregunta'],
        obligatoria: true,
        orden: 2,
      },
      {
        id: 'objetivos',
        titulo: 'Objetivos',
        sinonimos: ['objetivos', 'meta'],
        obligatoria: true,
        orden: 3,
      },
      {
        id: 'justificacion',
        titulo: 'Justificación',
        sinonimos: ['justificacion', 'importancia', 'aporte'],
        obligatoria: true,
        orden: 4,
      },
      {
        id: 'marco_teorico',
        titulo: 'Marco teórico',
        sinonimos: ['marco teorico', 'fundamentacion teorica', 'bases conceptuales'],
        obligatoria: true,
        orden: 5,
      },
      {
        id: 'metodologia',
        titulo: 'Metodología',
        sinonimos: ['metodologia', 'enfoque', 'metodo', 'diseno'],
        obligatoria: true,
        orden: 6,
      },
      {
        id: 'analisis',
        titulo: 'Análisis / Resultados',
        sinonimos: ['analisis', 'resultados', 'hallazgos'],
        obligatoria: true,
        orden: 7,
      },
      {
        id: 'conclusiones',
        titulo: 'Conclusiones',
        sinonimos: ['conclusiones', 'cierre'],
        obligatoria: true,
        orden: 8,
      },
      {
        id: 'bibliografia',
        titulo: 'Bibliografía APA 7',
        sinonimos: ['bibliografia', 'referencias', 'apa'],
        obligatoria: true,
        orden: 9,
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────
  // UNIFRANZ Tesis — Guía 2017 Modalidad Tesis
  // ───────────────────────────────────────────────────────────────────
  {
    id: 'unifranz-tesis',
    nombre: 'UNIFRANZ · Tesis de Grado',
    descripcion:
      'Tesis UNIFRANZ Cochabamba (2017). Estructura extensa con estado del arte, marco teórico profundo, metodología cuantitativa y discusión de resultados.',
    mapeo: {
      servicio_id: 'mono-001',
      variante_id: 'unifranz_tesis',
      tipo_proyecto_id: 'tipo-monografia',
    },
    features: {
      pide_hipotesis: true,
      pide_marco_teorico_extenso: true,
      pide_pestel_porter: false,
      pide_encuesta: true,
      pide_analisis_cuantitativo: true,
      paginas_tipicas: { min: 80, max: 150 },
      tono_principal: 'academico',
    },
    secciones_canonicas: [
      {
        id: 'introduccion',
        titulo: 'Introducción',
        sinonimos: ['introduccion', 'presentacion'],
        obligatoria: true,
        orden: 1,
      },
      {
        id: 'antecedentes',
        titulo: 'Antecedentes / Estado del arte',
        sinonimos: ['antecedentes', 'estado del arte', 'estudios previos'],
        obligatoria: true,
        orden: 2,
      },
      {
        id: 'problema',
        titulo: 'Planteamiento del problema',
        sinonimos: ['planteamiento', 'problema'],
        obligatoria: true,
        orden: 3,
      },
      {
        id: 'objetivos',
        titulo: 'Objetivos generales y específicos',
        sinonimos: ['objetivos', 'meta'],
        obligatoria: true,
        orden: 4,
      },
      {
        id: 'hipotesis',
        titulo: 'Hipótesis',
        sinonimos: ['hipotesis', 'h1', 'supuestos'],
        obligatoria: true,
        orden: 5,
      },
      {
        id: 'justificacion',
        titulo: 'Justificación',
        sinonimos: ['justificacion'],
        obligatoria: true,
        orden: 6,
      },
      {
        id: 'marco_teorico',
        titulo: 'Marco teórico',
        sinonimos: ['marco teorico', 'fundamentacion'],
        obligatoria: true,
        orden: 7,
      },
      {
        id: 'metodologia',
        titulo: 'Diseño metodológico',
        sinonimos: ['metodologia', 'diseno metodologico'],
        obligatoria: true,
        orden: 8,
      },
      {
        id: 'resultados',
        titulo: 'Resultados',
        sinonimos: ['resultados', 'hallazgos'],
        obligatoria: true,
        orden: 9,
      },
      {
        id: 'discusion',
        titulo: 'Discusión',
        sinonimos: ['discusion', 'analisis critico'],
        obligatoria: true,
        orden: 10,
      },
      {
        id: 'conclusiones',
        titulo: 'Conclusiones y recomendaciones',
        sinonimos: ['conclusiones', 'recomendaciones'],
        obligatoria: true,
        orden: 11,
      },
      {
        id: 'bibliografia',
        titulo: 'Bibliografía APA 7',
        sinonimos: ['bibliografia', 'referencias', 'apa'],
        obligatoria: true,
        orden: 12,
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────
  // UNIFRANZ Prefactibilidad — Guía 2017 Proyecto Prefactibilidad
  // ───────────────────────────────────────────────────────────────────
  {
    id: 'unifranz-prefactibilidad',
    nombre: 'UNIFRANZ · Proyecto de Prefactibilidad',
    descripcion:
      'Proyecto de prefactibilidad UNIFRANZ. Enfocado en evaluación de viabilidad: estudio de mercado, análisis técnico, organizacional, financiero y evaluación económica.',
    mapeo: {
      servicio_id: 'mono-001',
      variante_id: 'unifranz_proyecto_prefactibilidad',
      tipo_proyecto_id: 'tipo-monografia',
    },
    features: {
      pide_hipotesis: false,
      pide_marco_teorico_extenso: false,
      pide_pestel_porter: true,
      pide_encuesta: true,
      pide_analisis_cuantitativo: true,
      paginas_tipicas: { min: 60, max: 120 },
      tono_principal: 'tecnico',
    },
    secciones_canonicas: [
      {
        id: 'resumen_ejecutivo',
        titulo: 'Resumen ejecutivo',
        sinonimos: ['resumen ejecutivo', 'sintesis', 'abstract'],
        obligatoria: true,
        orden: 1,
      },
      {
        id: 'idea',
        titulo: 'Idea del proyecto',
        sinonimos: ['idea', 'idea de negocio', 'propuesta', 'descripcion del proyecto'],
        obligatoria: true,
        orden: 2,
      },
      {
        id: 'estudio_mercado',
        titulo: 'Estudio de mercado',
        sinonimos: ['estudio de mercado', 'analisis de mercado', 'demanda', 'oferta'],
        obligatoria: true,
        orden: 3,
      },
      {
        id: 'estudio_tecnico',
        titulo: 'Estudio técnico',
        sinonimos: ['estudio tecnico', 'analisis tecnico', 'ingenieria'],
        obligatoria: true,
        orden: 4,
      },
      {
        id: 'organizacional',
        titulo: 'Estudio organizacional',
        sinonimos: ['organizacional', 'organigrama', 'estructura'],
        obligatoria: true,
        orden: 5,
      },
      {
        id: 'legal',
        titulo: 'Estudio legal',
        sinonimos: ['legal', 'normativo', 'tributario'],
        obligatoria: false,
        orden: 6,
      },
      {
        id: 'financiero',
        titulo: 'Estudio financiero',
        sinonimos: ['financiero', 'inversiones', 'costos', 'ingresos'],
        obligatoria: true,
        orden: 7,
      },
      {
        id: 'evaluacion',
        titulo: 'Evaluación económica',
        sinonimos: ['evaluacion', 'van', 'tir', 'rentabilidad'],
        obligatoria: true,
        orden: 8,
      },
      {
        id: 'conclusiones',
        titulo: 'Conclusiones',
        sinonimos: ['conclusiones'],
        obligatoria: true,
        orden: 9,
      },
      {
        id: 'bibliografia',
        titulo: 'Bibliografía APA 7',
        sinonimos: ['bibliografia', 'referencias'],
        obligatoria: true,
        orden: 10,
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────
  // PG Plan de Negocio — 23 fases (Proyecto de Grado)
  // ───────────────────────────────────────────────────────────────────
  {
    id: 'pg-plan-negocio',
    nombre: 'Proyecto de Grado · Plan de Negocio',
    descripcion:
      'Plan de negocio completo: PESTEL, Porter, matrices, encuestas, análisis organizacional, branding, marketing, financiero y evaluación. Ideal para emprendimientos.',
    mapeo: {
      servicio_id: 'proy-grado-001',
      tipo_proyecto_id: 'proy-prod-001',
    },
    features: {
      pide_hipotesis: false,
      pide_marco_teorico_extenso: true,
      pide_pestel_porter: true,
      pide_encuesta: true,
      pide_analisis_cuantitativo: true,
      paginas_tipicas: { min: 100, max: 200 },
      tono_principal: 'tecnico',
    },
    secciones_canonicas: [
      {
        id: 'idea',
        titulo: 'Idea de negocio',
        sinonimos: ['idea', 'idea de negocio', 'propuesta', 'oportunidad'],
        obligatoria: true,
        orden: 1,
      },
      {
        id: 'marco_referencial',
        titulo: 'Marco referencial',
        sinonimos: ['marco referencial', 'antecedentes', 'contexto'],
        obligatoria: true,
        orden: 2,
      },
      {
        id: 'marco_teorico',
        titulo: 'Marco teórico',
        sinonimos: ['marco teorico', 'fundamentacion teorica'],
        obligatoria: true,
        orden: 3,
      },
      {
        id: 'pestel',
        titulo: 'Análisis PESTEL',
        sinonimos: ['pestel', 'analisis pestel', 'macroentorno'],
        obligatoria: true,
        orden: 4,
      },
      {
        id: 'porter',
        titulo: 'Cinco fuerzas de Porter',
        sinonimos: ['porter', 'cinco fuerzas', '5 fuerzas', 'microentorno'],
        obligatoria: true,
        orden: 5,
      },
      {
        id: 'matrices',
        titulo: 'Matrices estratégicas',
        sinonimos: ['matrices', 'foda', 'dofa', 'bcg', 'efe', 'efi'],
        obligatoria: true,
        orden: 6,
      },
      {
        id: 'encuesta',
        titulo: 'Diseño y análisis de encuesta',
        sinonimos: ['encuesta', 'cuestionario', 'investigacion de mercado', 'muestra'],
        obligatoria: true,
        orden: 7,
      },
      {
        id: 'demanda',
        titulo: 'Demanda y cuota de mercado',
        sinonimos: ['demanda', 'cuota de mercado', 'market share', 'segmentacion'],
        obligatoria: true,
        orden: 8,
      },
      {
        id: 'organizacional',
        titulo: 'Diseño organizacional',
        sinonimos: ['organizacional', 'organigrama', 'estructura'],
        obligatoria: true,
        orden: 9,
      },
      {
        id: 'rrhh',
        titulo: 'Recursos humanos',
        sinonimos: ['rrhh', 'recursos humanos', 'personal', 'puestos'],
        obligatoria: true,
        orden: 10,
      },
      {
        id: 'legal',
        titulo: 'Análisis legal',
        sinonimos: ['legal', 'normativo', 'juridico', 'tributario'],
        obligatoria: true,
        orden: 11,
      },
      {
        id: 'tecnico',
        titulo: 'Diseño técnico',
        sinonimos: ['tecnico', 'ingenieria', 'proceso productivo'],
        obligatoria: true,
        orden: 12,
      },
      {
        id: 'branding',
        titulo: 'Branding',
        sinonimos: ['branding', 'marca', 'identidad'],
        obligatoria: true,
        orden: 13,
      },
      {
        id: 'marketing',
        titulo: 'Plan de marketing',
        sinonimos: ['marketing', 'mercadeo', '4ps', 'mix de marketing'],
        obligatoria: true,
        orden: 14,
      },
      {
        id: 'financiero',
        titulo: 'Plan financiero',
        sinonimos: ['financiero', 'inversion', 'costos', 'flujo de caja'],
        obligatoria: true,
        orden: 15,
      },
      {
        id: 'evaluacion',
        titulo: 'Evaluación económica',
        sinonimos: ['evaluacion', 'van', 'tir', 'rentabilidad', 'payback'],
        obligatoria: true,
        orden: 16,
      },
      {
        id: 'conclusiones',
        titulo: 'Conclusiones',
        sinonimos: ['conclusiones', 'cierre'],
        obligatoria: true,
        orden: 17,
      },
      {
        id: 'bibliografia',
        titulo: 'Bibliografía APA 7',
        sinonimos: ['bibliografia', 'referencias', 'apa'],
        obligatoria: true,
        orden: 18,
      },
    ],
  },
];

/**
 * Lookup helper: obtiene una plantilla por su id.
 */
export function getPlantillaById(id: PlantillaBaseId): PlantillaCatalogo | undefined {
  return CATALOGO_PLANTILLAS.find((p) => p.id === id);
}

/**
 * Normaliza un texto para comparación: lowercase, sin acentos, sin puntuación.
 * Usado por el matcher para comparar secciones contra sinónimos.
 */
export function normalizarTextoParaMatching(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
