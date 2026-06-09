/**
 * Tipos de casos bolivianos pre-resueltos.
 *
 * Los casos son ejemplos completos con datos reales contextualizados en
 * Bolivia (ciudad, rubro, segmento, hipótesis) que el estudiante puede
 * explorar ANTES de armar el suyo. Cada módulo tiene su propio tipo
 * porque las herramientas son distintas (Lean Canvas vs PESTEL vs FODA).
 *
 * Hay un tipo `CasoBase` con metadatos comunes (zona, rubro, dificultad,
 * lecciones) y luego cada módulo lo extiende con sus campos.
 *
 * Los casos viven en /src/lib/casos/<modulo>/*.ts y se exportan por un
 * index para que la galería los liste.
 */

export type DificultadCaso = "basico" | "intermedio" | "avanzado";

export type ModuloCaso =
  | "idea"
  | "mercados"
  | "estrategia"
  | "marketing"
  | "organizacion"
  | "defensa";

export interface Emprendedor {
  /** Nombre ficticio pero verosímil (Daniela Mamani, no Daniel Smith). */
  nombre: string;
  /** Edad o rango. */
  edad: number;
  /** Rol actual y/o trayectoria breve. */
  rol: string;
}

/**
 * Campos comunes a TODO caso, sin importar el módulo. Cada tipo
 * específico (CasoIdea, CasoMercados, etc.) extiende este.
 */
export interface CasoBase {
  /** Slug url-safe único (kebab-case). */
  slug: string;
  /** Módulo al que pertenece. */
  modulo: ModuloCaso;
  /** Título corto y comercial ("Almuerzos al toque"). */
  titulo: string;
  /** Frase de pitch (≤120 chars). */
  tagline: string;
  /** Ciudad o zona específica ("Sopocachi, La Paz"). */
  zona: string;
  /** Rubro general ("Alimentación", "EdTech"). */
  rubro: string;
  /** Para que el alumno elija casos a su nivel. */
  dificultad: DificultadCaso;
  /** Emoji opcional para acompañar el título. */
  emoji?: string;
  /**
   * Persona ficticia detrás de la idea. Da contexto humano y evita el
   * "una empresa" genérico que el usuario crítico.
   */
  emprendedor: Emprendedor;
  /** 2-3 párrafos del contexto. Cada elemento del array es un párrafo. */
  contexto: string[];
  /** Una sola oración: cuál es el problema central. */
  problema: string;
  /** Segmento objetivo en una oración. */
  segmento: string;
  /** Conclusión del análisis aplicado: ¿viable o no? ¿qué pivot? */
  conclusion: string;
  /** 3-5 takeaways aplicables a OTROS proyectos. */
  lecciones: string[];
  /** Qué NO hacer; errores que el alumno debe evitar. */
  errores_evitados: string[];
  /** Etiquetas para filtrar (ej. "delivery", "B2C", "MVP-rapido"). */
  tags: string[];
}

// ─── Módulo IDEA ─────────────────────────────────────────────────────────

export interface LeanCanvas {
  problema: string[];
  segmento: string;
  propuesta_unica: string;
  solucion: string[];
  canales: string[];
  flujo_ingresos: string[];
  estructura_costos: string[];
  metricas_clave: string[];
  ventaja_competitiva: string;
}

export interface PropuestaValor {
  /** Lo que el cliente quiere lograr. */
  trabajos_cliente: string[];
  /** Frustraciones y obstáculos del cliente. */
  dolores: string[];
  /** Beneficios que el cliente busca. */
  ganancias: string[];
  /** Tu oferta concreta. */
  productos: string[];
  /** Cómo alivias los dolores. */
  aliviadores: string[];
  /** Cómo generas las ganancias. */
  creadores: string[];
}

export interface HipotesisValidacion {
  hipotesis: string;
  experimento: string;
  metrica: string;
  resultado_esperado: string;
}

export interface Scorecard {
  /** ¿Lo quiere el cliente? */
  deseabilidad: number;
  /** ¿Lo podemos construir? */
  factibilidad: number;
  /** ¿Es rentable? */
  viabilidad: number;
  /** Resumen interpretativo de la nota. */
  nota: string;
}

export interface CasoIdea extends CasoBase {
  modulo: "idea";
  lean_canvas: LeanCanvas;
  propuesta_valor: PropuestaValor;
  validacion: {
    hipotesis: HipotesisValidacion[];
    /** Qué pasó cuando el emprendedor corrió el experimento. */
    resultado: string;
  };
  scorecard: Scorecard;
}

// Helper para chequear tipo en runtime cuando se carga un caso genérico.
export function esCasoIdea(c: CasoBase): c is CasoIdea {
  return c.modulo === "idea";
}

// ─── Módulo MERCADOS ─────────────────────────────────────────────────────

export type TipoEstudio = "exploratorio" | "descriptivo" | "causal";
export type EnfoqueEstudio = "cualitativo" | "cuantitativo" | "mixto";

export interface DisenoInvestigacion {
  /** Pregunta de investigación en formato interrogativo. */
  pregunta: string;
  /** Tipo de estudio según objetivo. */
  tipo: TipoEstudio;
  /** Enfoque metodológico. */
  enfoque: EnfoqueEstudio;
  /** Objetivo general en una oración. */
  objetivo_general: string;
  /** 3-5 objetivos específicos. */
  objetivos_especificos: string[];
  /** Hipótesis a contrastar (1-3). */
  hipotesis: string[];
}

export type TecnicaMuestreo =
  | "aleatorio_simple"
  | "estratificado"
  | "conglomerados"
  | "sistematico"
  | "por_conveniencia"
  | "bola_nieve";

export interface DisenoMuestral {
  /** Población objetivo definida con criterios concretos. */
  poblacion: string;
  /** Tamaño estimado de la población. */
  N_poblacion: number;
  /** Tamaño de muestra calculado. */
  n_muestra: number;
  /** Cómo se llegó al n (Cochran, Slovin, judgment). */
  formula_usada: string;
  /** Nivel de confianza usado (90/95/99). */
  nivel_confianza: number;
  /** Margen de error usado (típicamente 3-10%). */
  margen_error: number;
  /** Técnica de muestreo elegida. */
  tecnica: TecnicaMuestreo;
  /** Justificación de la técnica elegida. */
  justificacion_tecnica: string;
}

export type TipoPregunta =
  | "abierta"
  | "cerrada_si_no"
  | "opcion_multiple"
  | "likert"
  | "ranking"
  | "escala_numerica";

export interface PreguntaEncuesta {
  numero: number;
  texto: string;
  tipo: TipoPregunta;
  /** Opciones cuando aplica (Likert, opción múltiple). */
  opciones?: string[];
  /** Qué objetivo específico ataca esta pregunta. */
  objetivo_que_ataca?: string;
}

export interface ResultadoClave {
  /** Pregunta o variable analizada. */
  variable: string;
  /** Hallazgo cuantitativo principal. */
  hallazgo: string;
  /** Interpretación en lenguaje de negocio. */
  interpretacion: string;
}

export interface CasoMercados extends CasoBase {
  modulo: "mercados";
  diseno: DisenoInvestigacion;
  muestreo: DisenoMuestral;
  /** Selección representativa de preguntas (5-10) — no la encuesta completa. */
  encuesta: PreguntaEncuesta[];
  /** Canal y forma de recolección. */
  recoleccion: {
    canal: string;
    duracion_promedio_min: number;
    incentivo?: string;
    tasa_respuesta_pct: number;
  };
  /** 4-6 resultados clave del análisis. */
  resultados_clave: ResultadoClave[];
  /** Insight de cruce de variables (la "tabla cruzada" típica). */
  cruce_destacado: {
    variables: [string, string];
    hallazgo: string;
  };
  /** Recomendación final basada en datos. */
  recomendacion: string;
}

export function esCasoMercados(c: CasoBase): c is CasoMercados {
  return c.modulo === "mercados";
}
