/** Tipos del dominio del módulo Organización. */

export type RolOrganizacion = 'docente' | 'estudiante';

export interface PerfilOrganizacion {
  id: string;
  nombre: string;
  apellido: string;
  rol: RolOrganizacion;
  email: string;
  universidad: string | null;
  es_admin: boolean;
  creado_en: string;
}

export type EstadoOrganizacion =
  | 'organigrama'
  | 'rrhh'
  | 'legal'
  | 'tecnico'
  | 'branding'
  | 'reporte'
  | 'completo';

/** Nodo del organigrama: cargo + reportes directos. */
export interface NodoOrganigrama {
  id: string;
  cargo: string;
  area: string;       // ej: Gerencia, Ventas, Producción
  nombre?: string;    // opcional: nombre del titular
  reportaA?: string;  // id del nodo superior (raíz si vacío)
}

export interface Organigrama {
  nodos: NodoOrganigrama[];
}

/** Cargo del staff con su salario y aportes patronales bolivianos. */
export interface Puesto {
  cargo: string;
  cantidad: number;     // cuántas personas en este cargo
  salarioBruto: number; // Bs por persona/mes
}

export interface Rrhh {
  puestos: Puesto[];
  /**
   * Aportes patronales en Bolivia (% sobre el total ganado). Editables.
   * Los 4 primeros son el aporte patronal mensual (≈16.71%); aguinaldo e
   * indemnización son provisiones anuales prorrateadas (1/12 ≈ 8.33% c/u).
   */
  aportes: {
    cajaSalud: number;         // 10%   — Caja Nacional de Salud
    proVivienda: number;       // 2%    — Aporte Patronal Vivienda
    riesgoProfesional: number; // 1.71% — Prima de riesgo profesional (AFP)
    aporteSolidario: number;   // 3%    — Aporte Patronal Solidario
    aguinaldo: number;         // 8.33% — provisión aguinaldo (1 sueldo/año)
    indemnizacion: number;     // 8.33% — provisión indemnización (1 sueldo/año)
  };
}

/** Trámite legal con su estado. */
export type EstadoTramite = 'pendiente' | 'en_proceso' | 'listo';
export interface Tramite {
  nombre: string;       // NIT, Fundempresa, AFP, Licencia funcionamiento…
  entidad: string;      // SIN, Fundempresa, Min. Trabajo, GAMC…
  costo: number;        // Bs aprox
  estado: EstadoTramite;
  notas?: string;
}
export interface Legal {
  tramites: Tramite[];
}

/** Aspectos técnicos del proyecto. */
export interface Tecnico {
  proceso: string;       // descripción del proceso productivo / servicio
  capacidad: string;     // capacidad instalada / esperada
  equipos: string;       // lista textual de equipos clave
  layout: string;        // distribución física
  proveedores: string;   // proveedores clave
}

/** Branding e identidad. */
export interface Branding {
  nombre: string;          // nombre comercial
  esencia: string;         // qué resuelve / por qué existe
  valores: string[];       // valores de marca
  personalidad: string;    // tono (cercano, técnico, juvenil…)
  promesa: string;         // promesa de marca
  paletaPrincipal: string; // descripción / códigos
  tipografia: string;
}

export interface ProyectoOrganizacion {
  id: string;
  estudiante_id: string;
  titulo: string;
  empresa: string | null;
  sector: string | null;
  organigrama?: Partial<Organigrama>;
  rrhh?: Partial<Rrhh>;
  legal?: Partial<Legal>;
  tecnico?: Partial<Tecnico>;
  branding?: Partial<Branding>;
  estado: EstadoOrganizacion;
  creado_en: string;
  actualizado_en: string;
}
