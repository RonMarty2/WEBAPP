/** Tipos del dominio del módulo Idea / Pre-validación. */

export type RolIdea = 'docente' | 'estudiante';

export interface PerfilIdea {
  id: string;
  nombre: string;
  apellido: string;
  rol: RolIdea;
  email: string;
  universidad: string | null;
  es_admin: boolean;
  creado_en: string;
}

export type EstadoIdea =
  | 'canvas'
  | 'valor'
  | 'validacion'
  | 'scorecard'
  | 'reporte'
  | 'completo';

/** Lean Canvas: 9 bloques (texto libre por bloque). */
export interface LeanCanvas {
  problema: string;
  segmentos: string;
  propuestaValor: string;
  solucion: string;
  canales: string;
  ingresos: string;
  costos: string;
  metricas: string;
  ventaja: string;
}

/** Value Proposition Canvas (simplificado). */
export interface PropuestaValor {
  // Perfil del cliente
  trabajos: string[];   // tareas/objetivos del cliente
  dolores: string[];    // frustraciones
  alegrias: string[];   // beneficios esperados
  // Mapa de valor
  productos: string[];      // productos/servicios
  aliviadores: string[];    // cómo alivian dolores
  creadores: string[];      // cómo crean alegrías
}

/** Una hipótesis a validar con su experimento. */
export type EstadoHipotesis = 'sin_probar' | 'validada' | 'refutada';
export interface Hipotesis {
  supuesto: string;     // lo que asumimos como cierto
  comoProbar: string;   // experimento / forma de probarlo
  criterio: string;     // criterio de éxito (métrica)
  resultado: string;    // qué pasó
  estado: EstadoHipotesis;
}

export interface Validacion {
  hipotesis: Hipotesis[];
}

/**
 * Análisis de Viabilidad (Scorecard formal con rúbrica).
 *
 * Cada dimensión guarda no solo el puntaje 1-5, sino la EVIDENCIA que lo
 * respalda — necesaria para defender el resultado ante el tribunal y para
 * usarlo como sección formal en proyectos de grado / planes de negocio.
 */
export interface Scorecard {
  deseabilidad: number; // 1..5 según rúbrica
  factibilidad: number;
  viabilidad: number;
  /** Evidencia que respalda cada puntaje. Opcionales para compatibilidad con scorecards viejos. */
  evidencia_deseabilidad?: string;
  evidencia_factibilidad?: string;
  evidencia_viabilidad?: string;
  notas: string;
}

export interface ProyectoIdea {
  id: string;
  estudiante_id: string;
  titulo: string;
  idea: string | null;
  sector: string | null;
  tipo_trabajo: string | null;
  universidad: string | null;
  lean_canvas?: Partial<LeanCanvas>;
  propuesta_valor?: Partial<PropuestaValor>;
  validacion?: Partial<Validacion>;
  scorecard?: Partial<Scorecard>;
  estado: EstadoIdea;
  creado_en: string;
  actualizado_en: string;
}
