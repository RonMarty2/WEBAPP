/** Tipos del dominio del módulo Estrategia / Macroentorno. */

export type RolEstrategia = 'docente' | 'estudiante';

export interface PerfilEstrategia {
  id: string;
  nombre: string;
  apellido: string;
  rol: RolEstrategia;
  email: string;
  universidad: string | null;
  es_admin: boolean;
  creado_en: string;
}

export type EstadoEstrategia =
  | 'pestel'
  | 'porter'
  | 'matrices'
  | 'foda'
  | 'reporte'
  | 'completo';

/** Un factor PESTEL con su impacto (-2 a +2) y descripción. */
export interface FactorPestel {
  texto: string;
  impacto: number; // -2 amenaza fuerte … +2 oportunidad fuerte
}

/** Las 6 dimensiones del PESTEL. */
export interface Pestel {
  politico: FactorPestel[];
  economico: FactorPestel[];
  social: FactorPestel[];
  tecnologico: FactorPestel[];
  ecologico: FactorPestel[];
  legal: FactorPestel[];
}

/** Una fuerza de Porter con intensidad 1-5 y notas. */
export interface FuerzaPorter {
  intensidad: number; // 1 baja … 5 alta
  notas: string;
}

export interface Porter {
  rivalidad: FuerzaPorter;
  nuevosEntrantes: FuerzaPorter;
  sustitutos: FuerzaPorter;
  poderClientes: FuerzaPorter;
  poderProveedores: FuerzaPorter;
}

/** Fila de matriz MEFE/MEFI: factor, peso (0-1) y calificación (1-4). */
export interface FilaMatriz {
  factor: string;
  peso: number; // 0..1
  calificacion: number; // 1..4
}

export interface Foda {
  fortalezas: string[];
  oportunidades: string[];
  debilidades: string[];
  amenazas: string[];
  estrategias: { fo: string[]; do_: string[]; fa: string[]; da: string[] };
}

/** MPC — Matriz de Perfil Competitivo. */
export interface Mpc {
  factores: Array<{ factor: string; peso: number }>;
  // Cada competidor tiene una calificación (1-4) por factor (mismo orden que factores).
  competidores: Array<{ nombre: string; esMiEmpresa?: boolean; calificaciones: number[] }>;
}

/** Cadena de Valor de Porter: notas por actividad. */
export interface CadenaValor {
  primarias: Record<string, string>; // logisticaInterna, operaciones, logisticaExterna, marketing, servicio
  apoyo: Record<string, string>; // infraestructura, rrhh, tecnologia, abastecimiento
}

/** Matriz BCG: unidades de negocio/productos posicionados por crecimiento y participación. */
export interface Bcg {
  unidades: Array<{ nombre: string; crecimiento: number; participacion: number }>;
}

/** Matriz de Ansoff: iniciativas en los 4 cuadrantes. */
export interface Ansoff {
  penetracion: string[];
  desarrolloProducto: string[];
  desarrolloMercado: string[];
  diversificacion: string[];
}

/** PEYEA / SPACE: 4 dimensiones con factores puntuados. */
export interface Peyea {
  // FF financiera (+), VC ventaja competitiva (-), EE estabilidad entorno (-), FI fuerza industria (+)
  ff: number; vc: number; ee: number; fi: number;
}

/** MCPE / QSPM — Matriz Cuantitativa de Planificación Estratégica (decisión final). */
export interface Mcpe {
  // Factores clave (provienen de MEFE/MEFI). El peso es el mismo de esas matrices.
  factores: Array<{ factor: string; peso: number; tipo: 'externo' | 'interno' }>;
  // Cada estrategia candidata con su atractivo (CA: 1-4, o 0 = no afecta) por factor.
  estrategias: Array<{ nombre: string; calificaciones: number[] }>;
}

export interface ProyectoEstrategia {
  id: string;
  estudiante_id: string;
  titulo: string;
  sector: string | null;
  pestel: Partial<Pestel>;
  porter: Partial<Porter>;
  mefe: { filas: FilaMatriz[] };
  mefi: { filas: FilaMatriz[] };
  foda: Partial<Foda>;
  mpc?: Partial<Mpc>;
  cadena_valor?: Partial<CadenaValor>;
  bcg?: Partial<Bcg>;
  ansoff?: Partial<Ansoff>;
  peyea?: Partial<Peyea>;
  mcpe?: Partial<Mcpe>;
  estado: EstadoEstrategia;
  creado_en: string;
  actualizado_en: string;
}
