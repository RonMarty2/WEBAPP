/**
 * Tipos del dominio del módulo Mercados.
 */

export type RolMercados = 'docente' | 'estudiante';

export interface PerfilMercados {
  id: string;
  nombre: string;
  apellido: string;
  rol: RolMercados;
  email: string;
  universidad: string | null;
  es_admin: boolean;
  creado_en: string;
}

export type TipoEstudio = 'exploratorio' | 'descriptivo' | 'causal';

export type EstadoProyecto =
  | 'diseno'
  | 'muestreo'
  | 'encuesta'
  | 'recoleccion'
  | 'analisis'
  | 'reporte'
  | 'completo';

export interface ProyectoMercados {
  id: string;
  estudiante_id: string;
  titulo: string;
  tipo_estudio: TipoEstudio | null;
  objetivo_general: string | null;
  objetivos_especificos: string[];
  hipotesis: string[];
  variables: string[];
  departamento: string | null;
  municipio: string | null;
  zona: string | null;
  universo: number | null;
  nivel_confianza: number | null;
  margen_error: number | null;
  tipo_muestreo: string | null;
  tamano_muestra: number | null;
  estado: EstadoProyecto;
  creado_en: string;
  actualizado_en: string;
}

export type TipoPregunta =
  | 'opcion_unica'
  | 'opcion_multiple'
  | 'likert'
  | 'abierta'
  | 'numerica'
  | 'escala';

export interface PreguntaMercados {
  id: string;
  encuesta_id: string;
  orden: number;
  texto: string;
  tipo: TipoPregunta;
  opciones: string[];
  obligatoria: boolean;
}

export interface EncuestaMercados {
  id: string;
  proyecto_id: string;
  titulo: string;
  descripcion: string | null;
  token_publico: string | null;
  publicada: boolean;
  cerrada: boolean;
  creado_en: string;
}
