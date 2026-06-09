/**
 * Sprint 4 — Tipos del sistema "Evento Sorpresa".
 *
 * Modo de simulación turno-a-turno aplicable a 3 módulos
 * (idea, marketing, estrategia). Replica el patrón didáctico
 * del simulador de Finanzas pero sin tocar nada existente.
 *
 * Estado de la simulación se persiste en localStorage del
 * navegador con clave `simulacion-{modulo}-v1`. No hay BD.
 */

export type ModuloEvento = "idea" | "marketing" | "estrategia";

export type SeveridadEvento = "leve" | "media" | "critica";

export interface OpcionDecision {
  /** Identificador estable de la opción dentro del evento. */
  id: string;
  /** Texto principal que ve el alumno como acción concreta. */
  texto: string;
  /** Qué cuesta emocionalmente tomar esta decisión (1 oración). */
  costo_emocional: string;
  /** Qué puede salir mal si se elige (1 oración). */
  riesgo: string;
}

export interface EventoSorpresa {
  id: string;
  titulo: string;
  descripcion: string;
  severidad: SeveridadEvento;
  modulo: ModuloEvento;
  opciones: OpcionDecision[];
}

export interface RespuestaEvaluacion {
  /** ¿Fue una buena decisión en general? */
  acertada: boolean;
  /** 1 = pésima, 10 = brillante. */
  puntaje: number;
  /** Párrafo del tutor (2-3 oraciones). */
  feedback: string;
  /** Qué pasa en el próximo mes. */
  consecuencia_corto_plazo: string;
  /** Qué pasa de aquí a 1 año. */
  consecuencia_largo_plazo: string;
  /** Concepto académico o regla aplicada. */
  leccion: string;
  /** Pregunta o tema que el alumno debería evaluar ahora. */
  proxima_decision_sugerida: string;
}

export interface TurnoHistorial {
  evento: EventoSorpresa;
  opcion_elegida: OpcionDecision;
  evaluacion: RespuestaEvaluacion;
  turno: number;
}

export interface EstadoSimulacion {
  proyecto_titulo: string;
  modulo: ModuloEvento;
  turno: number;
  puntaje_total: number;
  historial: TurnoHistorial[];
}

export interface EvaluarEventoRequest {
  proyecto: string;
  evento: EventoSorpresa;
  opcion: OpcionDecision;
  turnoActual: number;
  historial: TurnoHistorial[];
}

export interface EvaluarEventoResponse extends RespuestaEvaluacion {
  tiempo_ms?: number;
}
