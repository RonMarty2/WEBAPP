/**
 * Tipos del módulo Tutor IA (Sprint 2a — IA tutora aditiva).
 *
 * Diferencia clave con "Sugerir IA" (el botón existente):
 *   - Sugerir IA: devuelve UN texto único. El alumno lo copia y pega.
 *   - Tutor IA: devuelve 3 alternativas con pros/cons, una pregunta crítica,
 *     una lección clave, y un siguiente paso accionable. Enseña, no rellena.
 *
 * Esto NO reemplaza a "Sugerir IA". Vive al lado del botón existente
 * como segunda opción que el alumno elige según prefiera velocidad
 * (Sugerir IA) o aprendizaje (Tutor IA).
 */

export type ModuloTutor =
  | "idea"
  | "mercados"
  | "estrategia"
  | "marketing"
  | "organizacion"
  | "defensa";

export interface TutorIARequest {
  /** Módulo educativo desde el que se solicita la tutoría. */
  modulo: ModuloTutor;
  /** Herramienta específica (ej. "lean-canvas", "buyer-persona"). */
  herramienta: string;
  /** Contexto del proyecto del alumno (descripción, objetivos, idea base). */
  contexto: string;
  /** Lo que el alumno ya escribió o tiene avanzado (puede estar vacío). */
  contenido_actual: string;
  /**
   * Campo específico que el alumno está trabajando. Permite que el tutor
   * se enfoque (ej. "problema principal", "propuesta única de valor",
   * "estrategia FO").
   */
  campo?: string;
}

export interface AlternativaTutor {
  /** Texto de la alternativa, listo para insertarlo si el alumno la elige. */
  texto: string;
  /** Por qué esta alternativa funciona bien (3-4 puntos). */
  fortalezas: string[];
  /** Para qué casos NO es ideal (2-3 puntos). Honestidad pedagógica. */
  debilidades: string[];
  /** Tipo de proyecto que mejor encaja con esta alternativa. */
  para_quien: string;
  /** Etiqueta visual corta (ej. "Conservadora", "Agresiva", "Premium"). */
  etiqueta: string;
}

export interface TutorIAResponse {
  /** Exactamente 3 alternativas distintas. */
  alternativas: AlternativaTutor[];
  /** Pregunta que el tutor le hace al alumno para guiar la decisión. */
  pregunta_critica: string;
  /** Concepto académico clave aplicado a su proyecto, no genérico. */
  leccion_clave: string;
  /** Acción concreta que el alumno debería hacer después de elegir. */
  siguiente_paso: string;
  /** Cuánto duró la generación. */
  tiempo_ms?: number;
}

export interface TutorIAError {
  error: string;
  detalle?: string;
}
