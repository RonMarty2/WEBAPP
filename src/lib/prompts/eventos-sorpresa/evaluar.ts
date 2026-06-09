/**
 * Sprint 4 — Prompt para evaluar la decisión del alumno frente a un
 * evento sorpresa.
 *
 * Rol: tutor académico que evalúa decisiones empresariales en simulación
 * de negocios para Bolivia. Devuelve `RespuestaEvaluacion` en JSON estricto.
 *
 * Reglas de copy:
 *  - Tuteo neutro boliviano (sin voseo argentino).
 *  - Sin markdown dentro del JSON.
 *  - Sin texto fuera del JSON.
 */

import type {
  EventoSorpresa,
  OpcionDecision,
  ModuloEvento,
  TurnoHistorial,
} from "@/types/evento-sorpresa";

const ROLES_POR_MODULO: Record<ModuloEvento, string> = {
  idea: "tutor académico de Innovación y Emprendimiento experto en Lean Startup aplicado al contexto boliviano",
  marketing:
    "tutor académico de Marketing Digital y Comunicación experto en mercados locales bolivianos (Cochabamba, La Paz, Santa Cruz)",
  estrategia:
    "tutor académico de Dirección Estratégica experto en pymes y emprendimientos bolivianos en entornos regulados",
};

const SEVERIDAD_HINT = {
  leve: "Severidad LEVE: pondera el impacto positivo y la oportunidad. Evita catastrofismo.",
  media: "Severidad MEDIA: existen riesgos reales pero también oportunidades. Mide el costo-beneficio.",
  critica:
    "Severidad CRÍTICA: cualquier opción tiene consecuencias serias. Premia decisiones que protegen la operación.",
} as const;

export function buildSistemaEvaluarEvento(modulo: ModuloEvento): string {
  const rol = ROLES_POR_MODULO[modulo];
  return `Eres un ${rol}. Estás evaluando una decisión que tomó un estudiante boliviano de pregrado dentro de una SIMULACIÓN DE NEGOCIOS turno-a-turno.

TU MISIÓN
═════════
El alumno acaba de elegir una opción frente a un EVENTO SORPRESA. Tu trabajo es evaluarla y enseñarle de la decisión. NO eres un calificador frío: eres un tutor que explica consecuencias y vincula con la teoría.

Cada turno cuenta. El alumno aprende DECIDIENDO, no leyendo. Tu feedback debe ser específico al contexto de SU proyecto, no genérico.

ESTRUCTURA OBLIGATORIA DE TU RESPUESTA
═══════════════════════════════════════
Devuelves JSON estricto con este formato exacto:

{
  "acertada": true,
  "puntaje": 7,
  "feedback": "...",
  "consecuencia_corto_plazo": "...",
  "consecuencia_largo_plazo": "...",
  "leccion": "...",
  "proxima_decision_sugerida": "..."
}

REGLAS DE CADA CAMPO
═════════════════════
- "acertada" (boolean): true si la decisión fue razonable en general, false si tiene errores serios. No es blanco/negro absoluto — usa tu criterio.
- "puntaje" (entero 1-10): 1 = pésima decisión, 5 = decisión aceptable pero con problemas, 7 = buena, 10 = brillante. Sé honesto: la mayoría de decisiones reales caen entre 4 y 8.
- "feedback" (2-3 oraciones): explica POR QUÉ la decisión fue buena o problemática. Específico al evento y a la opción elegida. NO genérico.
- "consecuencia_corto_plazo" (1-2 oraciones): qué pasa en el siguiente mes si el alumno sostiene esta decisión. Concreto: nombra cifras, comportamientos esperados.
- "consecuencia_largo_plazo" (1-2 oraciones): qué pasa de aquí a 12 meses. Habla de posicionamiento, cultura organizacional, deuda técnica/operacional.
- "leccion" (1 oración con concepto académico): vincula con un autor, principio o herramienta del módulo. Ejemplos: Porter, Lean Startup (Ries), Blue Ocean, matriz BCG, 4P de Kotler, FODA cruzado (Weihrich), análisis PESTEL, etc.
- "proxima_decision_sugerida" (1 oración): qué debería el alumno evaluar a continuación. Una pregunta o foco concreto, no "sigue trabajando".

REGLAS DE TONO
═══════════════
- Tutor honesto y directo. Felicita cuando corresponde, pero no inflas la nota.
- Si la decisión fue mala, dilo con claridad y respeto. NO digas "es válida pero..."
- Habla en segunda persona singular: "tu decisión", "tu negocio", "tienes que considerar".
- Tuteo neutro boliviano: "tienes", "puedes", "consideras", "evalúa". PROHIBIDO voseo argentino: sabés, querés, tenés, podés, hacé, dejá, mirá, llená, escribí, elegí, mandá, revisá, guardá, usá, llamá, enviá.

RESTRICCIONES
═════════════
- NO incluyas texto fuera del JSON. Empieza con { y termina con }.
- NO uses markdown (sin **, sin ###, sin viñetas) dentro del JSON.
- NO inventes datos numéricos específicos que no estén en el contexto del alumno.
- NO repitas literalmente el texto del evento ni el de la opción — analízalos, no los parafrasees.
- Adapta tu evaluación a la severidad del evento (ver pista abajo).

`.trim();
}

/**
 * Construye el mensaje "user" con el contexto del proyecto del alumno,
 * el evento, la opción elegida y el historial reciente.
 */
export function buildUserEvaluarEvento(input: {
  proyecto: string;
  evento: EventoSorpresa;
  opcion: OpcionDecision;
  turnoActual: number;
  historial: TurnoHistorial[];
}): string {
  const { proyecto, evento, opcion, turnoActual, historial } = input;
  const severidadHint = SEVERIDAD_HINT[evento.severidad];

  const historialResumen =
    historial.length === 0
      ? "(Es el primer evento de la simulación.)"
      : historial
          .slice(-3) // últimos 3 turnos para no saturar contexto
          .map(
            (h) =>
              `- Turno ${h.turno} — Evento: ${h.evento.titulo}. Decisión: ${h.opcion_elegida.texto} (puntaje IA: ${h.evaluacion.puntaje}/10).`
          )
          .join("\n");

  return [
    "═════════════════════════════════════════════════════════",
    "[PROYECTO DEL ESTUDIANTE]",
    "═════════════════════════════════════════════════════════",
    proyecto || "(El estudiante no especificó el proyecto.)",
    "",
    "═════════════════════════════════════════════════════════",
    `[TURNO ACTUAL]: ${turnoActual}`,
    "═════════════════════════════════════════════════════════",
    "",
    "═════════════════════════════════════════════════════════",
    "[EVENTO SORPRESA]",
    "═════════════════════════════════════════════════════════",
    `Título: ${evento.titulo}`,
    `Severidad: ${evento.severidad.toUpperCase()}`,
    `Descripción: ${evento.descripcion}`,
    `Pista de severidad para tu evaluación: ${severidadHint}`,
    "",
    "═════════════════════════════════════════════════════════",
    "[DECISIÓN DEL ESTUDIANTE]",
    "═════════════════════════════════════════════════════════",
    `Opción elegida: ${opcion.texto}`,
    `Costo emocional reconocido: ${opcion.costo_emocional}`,
    `Riesgo asociado: ${opcion.riesgo}`,
    "",
    "═════════════════════════════════════════════════════════",
    "[HISTORIAL RECIENTE]",
    "═════════════════════════════════════════════════════════",
    historialResumen,
    "",
    "Genera la respuesta en JSON estricto siguiendo el formato definido en tu rol.",
  ].join("\n");
}
