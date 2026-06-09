/**
 * Tipos del Wave 4 del panel docente.
 *
 * Tres piezas independientes que el docente puede usar por separado:
 *   - Rúbrica: criterios + pesos para evaluar
 *   - Calificación: aplicación de una rúbrica a un alumno
 *   - Entrega: fecha tope en el calendario
 *
 * Cada pieza tiene su tipo separado para que se pueda iterar sin tocar
 * las demás.
 */

// ─── Rúbrica ─────────────────────────────────────────────────────────────

export type EscalaCalificacion = 7 | 10 | 20 | 100;

export interface CriterioRubrica {
  /** ID local del criterio (no es FK; se serializa con la rúbrica). */
  id: string;
  /** Nombre corto (ej. "Originalidad"). */
  nombre: string;
  /** Descripción larga visible al alumno al ver su nota. */
  descripcion: string;
  /** Peso en porcentaje 0-100. La suma de todos los criterios debe ser 100. */
  peso_pct: number;
}

export interface Rubrica {
  id: string;
  docente_id: string;
  nombre: string;
  descripcion: string | null;
  criterios: CriterioRubrica[];
  escala_max: EscalaCalificacion;
  nota_aprueba: number;
  default_actual: boolean;
  archivada: boolean;
  creada_en: string;
  actualizada_en: string;
}

// ─── Calificación ────────────────────────────────────────────────────────

export type ModuloCalificable =
  | "idea" | "mercados" | "estrategia" | "marketing"
  | "organizacion" | "finanzas" | "defensa" | "generador" | "otro";

export interface NotaPorCriterio {
  criterio_id: string;
  /** Nota en la escala de la rúbrica (0..escala_max). */
  nota: number;
  /** Comentario específico de este criterio (opcional). */
  comentario: string | null;
}

export type EstadoCalificacion = "borrador" | "publicada";

export interface Calificacion {
  id: string;
  vinculo_id: string;
  docente_id: string;
  alumno_id: string;
  rubrica_id: string;
  modulo: ModuloCalificable;
  proyecto_id: string;
  proyecto_titulo: string;
  notas_por_criterio: NotaPorCriterio[];
  /** Promedio ponderado en la escala de la rúbrica. Calculado en backend. */
  promedio_ponderado: number | null;
  comentario_general: string | null;
  estado: EstadoCalificacion;
  publicada_en: string | null;
  creada_en: string;
  actualizada_en: string;
}

// ─── Entregas (calendario) ───────────────────────────────────────────────

export type EstadoEntrega = "programada" | "vencida" | "cumplida" | "cancelada";
export type PrioridadEntrega = "baja" | "media" | "alta";

export interface Entrega {
  id: string;
  docente_id: string;
  /**
   * Si null, aplica a TODOS los alumnos del docente.
   * Si tiene valor, solo a ese alumno (vínculo específico).
   */
  vinculo_id: string | null;
  titulo: string;
  descripcion: string | null;
  modulo_sugerido: ModuloCalificable | null;
  fecha_tope: string;
  estado: EstadoEntrega;
  prioridad: PrioridadEntrega;
  creada_en: string;
  actualizada_en: string;
}

// ─── Helpers (puros, sin dependencias) ───────────────────────────────────

/**
 * Calcula el promedio ponderado de una calificación.
 * Devuelve null si no hay suficiente data para calcular.
 */
export function calcularPromedioPonderado(
  criterios: CriterioRubrica[],
  notas: NotaPorCriterio[],
): number | null {
  if (criterios.length === 0 || notas.length === 0) return null;
  let suma = 0;
  let pesoTotal = 0;
  for (const c of criterios) {
    const n = notas.find((x) => x.criterio_id === c.id);
    if (!n) continue; // criterio sin nota → se ignora
    suma += n.nota * c.peso_pct;
    pesoTotal += c.peso_pct;
  }
  if (pesoTotal === 0) return null;
  return Math.round((suma / pesoTotal) * 100) / 100;
}

/**
 * Valida que la suma de pesos sea 100. Devuelve la suma actual (para
 * mostrar feedback en la UI: "Te faltan 15 pts").
 */
export function sumaDePesos(criterios: CriterioRubrica[]): number {
  return criterios.reduce((s, c) => s + (Number(c.peso_pct) || 0), 0);
}

/**
 * Genera un ID local para un criterio nuevo (sin tocar la BD; el id
 * vive dentro del JSONB de la rúbrica).
 */
export function nuevoCriterioId(): string {
  return "c_" + Date.now().toString(36) + "_" + Math.floor(Math.random() * 1e6).toString(36);
}

/**
 * Convierte el promedio entre escalas. Útil cuando el docente cambió la
 * escala de la rúbrica después de calificar.
 */
export function convertirEscala(valor: number, desde: EscalaCalificacion, hasta: EscalaCalificacion): number {
  if (desde === hasta) return valor;
  return Math.round((valor / desde) * hasta * 100) / 100;
}
