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
  estado: EstadoEstrategia;
  creado_en: string;
  actualizado_en: string;
}
