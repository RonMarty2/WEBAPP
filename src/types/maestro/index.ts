/** Tipos del Proyecto Maestro (contexto compartido entre módulos). */

export interface ProyectoMaestro {
  id: string;
  estudiante_id: string;
  titulo: string;
  tipo_negocio: string | null;
  sector: string | null;
  departamento: string | null;
  municipio: string | null;
  zona: string | null;
  descripcion: string | null;
  universidad: string | null;
  modalidad: string | null;
  creado_en: string;
  actualizado_en: string;
}

export type ModuloId = 'estrategia' | 'mercados' | 'finanzas' | 'marketing' | 'organizacion' | 'idea' | 'defensa';

export interface VinculoModulo {
  id: string;
  maestro_id: string;
  modulo: ModuloId;
  ref_id: string;
  creado_en: string;
}
