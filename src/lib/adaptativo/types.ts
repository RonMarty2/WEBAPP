/**
 * Tipos compartidos del servicio "Documento Adaptativo".
 *
 * El estudiante define libremente su trabajo y sube la guía del docente.
 * El sistema extrae la estructura, la matchea contra plantillas conocidas
 * (UMSS clásico/reducido, UCB, UNIFRANZ tesis/prefactibilidad, PG) y genera
 * un plan adaptativo que reutiliza prompts existentes + improvisa lo nuevo.
 */

export type FormatoCitas = 'APA' | 'vancouver' | 'icontec' | 'otro' | 'no_especificado';
export type TonoDocumento = 'academico' | 'reflexivo' | 'tecnico' | 'divulgativo' | 'mixto';

/**
 * Estructura semántica que extraemos de la guía del docente.
 * Es el resultado del endpoint POST /api/adaptativo/analyze-guide.
 */
export interface GuiaAnalizada {
  /** Lista ordenada de secciones que pide la guía */
  secciones: SeccionRequerida[];
  /** Si la guía menciona explícitamente imágenes/figuras */
  pide_imagenes: boolean;
  /** Si la guía pide tablas/cuadros comparativos */
  pide_tablas: boolean;
  /** Si la guía pide encuestas/entrevistas */
  pide_encuesta: boolean;
  /** Si la guía pide bibliografía explícita */
  pide_bibliografia: boolean;
  /** Si la guía pide hipótesis (clave para distinguir UMSS clásico vs reducido) */
  pide_hipotesis: boolean;
  /** Si la guía pide marco teórico extenso */
  pide_marco_teorico: boolean;
  /** Si la guía pide análisis cuantitativo/estadístico */
  pide_analisis_cuantitativo: boolean;
  /** Si la guía pide conclusiones o cierre */
  pide_conclusiones: boolean;
  /** Páginas estimadas (min/max si se especifica, sino aproximado) */
  paginas_estimadas: { min: number; max: number };
  /** Formato de citas detectado */
  formato_citas: FormatoCitas;
  /** Tono del documento esperado */
  tono: TonoDocumento;
  /** Resumen ejecutivo en 1-2 frases de lo que pide la guía (para mostrar al usuario) */
  resumen: string;
  /** Si la IA encontró requisitos contradictorios o ambiguos */
  advertencias: string[];
}

/**
 * Una sección requerida por la guía del estudiante.
 */
export interface SeccionRequerida {
  /** Título tal como aparece (o se infiere) en la guía */
  titulo: string;
  /** Descripción breve de qué debe contener */
  descripcion: string;
  /** Requisitos específicos (mín. de citas, casos, ejemplos, etc.) */
  requisitos: string[];
  /** Orden estimado en el documento final (1-indexed) */
  orden: number;
}

/**
 * Identificador de una plantilla conocida en el catálogo.
 * Se mapea 1:1 contra los prompts existentes en src/lib/prompts/.
 */
export type PlantillaBaseId =
  | 'umss-clasico'
  | 'umss-reducido'
  | 'ucb-licenciatura'
  | 'unifranz-tesis'
  | 'unifranz-prefactibilidad'
  | 'pg-plan-negocio';

/**
 * Resultado de matchear la guía contra el catálogo.
 */
export interface ResultadoMatching {
  /** Plantilla elegida (la de mayor score) */
  plantilla_elegida: PlantillaBaseId;
  /** Score de similitud 0-1 de la plantilla elegida */
  score: number;
  /** Razonamiento de por qué se eligió esa plantilla (mostrable al usuario) */
  razonamiento: string;
  /** Score de todas las plantillas del catálogo, ordenadas desc */
  ranking: { plantilla: PlantillaBaseId; nombre: string; score: number }[];
}

/**
 * Una fase del plan adaptativo (lo que se generará).
 * Mapea 1:1 con `phase_contents[phase_id]` en ProyectoRecord.
 */
export interface FaseAdaptativa {
  /** ID único de la fase (ej: "adapt-001", "adapt-002") */
  phase_id: string;
  /** Título visible al usuario */
  titulo: string;
  /** De dónde sale el contenido */
  origen: OrigenFase;
  /** Si origen='base': qué prompt de qué plantilla usar */
  prompt_ref?: { plantilla: PlantillaBaseId; prompt_id: string };
  /** Descripción de qué se va a generar */
  descripcion: string;
  /** Requisitos extraídos de la guía */
  requisitos: string[];
  /** Páginas estimadas */
  paginas_estimadas?: string;
  /** Orden en el documento final */
  orden: number;
}

export type OrigenFase =
  | 'base' // Prompt de una plantilla existente (UMSS, UCB, etc.)
  | 'adaptativo' // IA improvisa porque ninguna plantilla la tiene
  | 'componente'; // Reutiliza un subcomponente (tablas, encuestas, APA, etc.)

/**
 * Plan adaptativo completo: lo que se persiste en el proyecto al crearlo.
 */
export interface PlanAdaptativo {
  /** Nombre libre del trabajo (lo que escribió el estudiante) */
  nombre_trabajo: string;
  /** Estructura semántica de la guía */
  guia_analizada: GuiaAnalizada;
  /** Resultado del matching */
  matching: ResultadoMatching;
  /** Lista ordenada de fases a generar */
  fases: FaseAdaptativa[];
  /** Timestamp ISO de creación del plan */
  creado_en: string;
}
