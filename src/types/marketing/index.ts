/** Tipos del dominio del módulo Marketing. */

export type RolMarketing = 'docente' | 'estudiante';

export interface PerfilMarketing {
  id: string;
  nombre: string;
  apellido: string;
  rol: RolMarketing;
  email: string;
  universidad: string | null;
  es_admin: boolean;
  creado_en: string;
}

export type EstadoMarketing =
  | 'persona'
  | 'mezcla'
  | 'presupuesto'
  | 'calendario'
  | 'reporte'
  | 'completo';

/** Buyer persona — perfil del cliente ideal. */
export interface BuyerPersona {
  nombre: string;          // nombre ficticio que humaniza al cliente
  edad: string;
  ocupacion: string;
  ubicacion: string;       // ciudad / zona (Bolivia)
  metas: string[];         // qué quiere lograr
  frustraciones: string[]; // qué le duele / qué lo frena
  canales: string[];       // dónde está (redes, lugares)
  cita: string;            // una frase que lo define
}

export type TipoMezcla = '4ps' | '7ps';

/** Mezcla de marketing 4Ps (+3 de servicios = 7Ps). */
export interface Mezcla {
  tipo: TipoMezcla;
  producto: string;
  precio: string;
  plaza: string;
  promocion: string;
  // 7Ps (servicios):
  personas: string;
  procesos: string;
  evidenciaFisica: string;
}

/** Un canal del presupuesto con su costo por lead y conversión. */
export interface CanalPresupuesto {
  canal: string;       // Meta Ads, TikTok Ads, Google, orgánico…
  inversion: number;   // Bs invertidos
  cpl: number;         // costo por lead (Bs)
  conversion: number;  // % de leads que compran (0-100)
  ticket: number;      // Bs por venta promedio
}

export interface Presupuesto {
  canales: CanalPresupuesto[];
}

export type EstadoPublicacion = 'idea' | 'listo' | 'publicado';

export interface PublicacionCalendario {
  /** Identificador estable de la publicación (para edits/deletes seguros). */
  id?: string;
  fecha: string;   // YYYY-MM-DD
  canal: string;
  tipo: string;    // post, reel, historia, video, correo…
  copy: string;    // idea / texto de la pieza
  estado: EstadoPublicacion;
}

export interface Calendario {
  publicaciones: PublicacionCalendario[];
}

export interface PlanMarketing {
  id: string;
  estudiante_id: string;
  titulo: string;
  marca: string | null;
  sector: string | null;
  buyer_persona?: Partial<BuyerPersona>;
  mezcla?: Partial<Mezcla>;
  presupuesto?: Partial<Presupuesto>;
  calendario?: Partial<Calendario>;
  estado: EstadoMarketing;
  creado_en: string;
  actualizado_en: string;
}
