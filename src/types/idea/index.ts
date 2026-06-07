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

/** Scorecard de viabilidad (1-5 por dimensión). */
export interface Scorecard {
  deseabilidad: number; // ¿lo quieren? (cliente)
  factibilidad: number; // ¿podemos hacerlo? (técnico/operativo)
  viabilidad: number;   // ¿es rentable/sostenible? (negocio)
  notas: string;
}

export interface ProyectoIdea {
  id: string;
  estudiante_id: string;
  titulo: string;
  idea: string | null;
  sector: string | null;
  lean_canvas?: Partial<LeanCanvas>;
  propuesta_valor?: Partial<PropuestaValor>;
  validacion?: Partial<Validacion>;
  scorecard?: Partial<Scorecard>;
  estado: EstadoIdea;
  creado_en: string;
  actualizado_en: string;
}
