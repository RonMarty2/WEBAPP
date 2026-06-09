/**
 * Sprint 4 — POST /api/eventos-sorpresa/evaluar
 *
 * Recibe la decisión del alumno frente a un evento sorpresa y devuelve una
 * evaluación tipo `RespuestaEvaluacion` generada por IA.
 *
 * Body:
 * {
 *   proyecto: string,
 *   evento: EventoSorpresa,
 *   opcion: OpcionDecision,
 *   turnoActual: number,
 *   historial: TurnoHistorial[]
 * }
 *
 * Respuesta (200):
 * {
 *   acertada: boolean,
 *   puntaje: number,    // 1-10
 *   feedback: string,
 *   consecuencia_corto_plazo: string,
 *   consecuencia_largo_plazo: string,
 *   leccion: string,
 *   proxima_decision_sugerida: string,
 *   tiempo_ms: number
 * }
 *
 * Errores:
 *  400 si falta algún campo del body o el módulo no es válido.
 *  502 si la IA falla irrecuperablemente.
 */

import { NextResponse } from "next/server";
import { llamarIA } from "@/lib/aiProvider";
import {
  buildSistemaEvaluarEvento,
  buildUserEvaluarEvento,
} from "@/lib/prompts/eventos-sorpresa/evaluar";
import type {
  EvaluarEventoRequest,
  EvaluarEventoResponse,
  ModuloEvento,
  RespuestaEvaluacion,
} from "@/types/evento-sorpresa";

export const runtime = "nodejs";

const MODULOS_VALIDOS: ModuloEvento[] = ["idea", "marketing", "estrategia"];

function extraerJsonDeTexto(texto: string): unknown {
  // Estrategia tolerante: si la IA devuelve markdown ```json ... ``` o
  // texto antes/después, extraemos el primer bloque { ... } balanceado.
  const limpio = texto.trim();

  // 1) Intento directo
  try {
    return JSON.parse(limpio);
  } catch {
    // continuar
  }

  // 2) Quitar fences markdown si los hay
  const sinFences = limpio.replace(/```(?:json)?\s*/gi, "").replace(/```\s*$/g, "");
  try {
    return JSON.parse(sinFences.trim());
  } catch {
    // continuar
  }

  // 3) Buscar primer { ... } balanceado
  const inicio = sinFences.indexOf("{");
  if (inicio === -1) return null;
  let nivel = 0;
  for (let i = inicio; i < sinFences.length; i++) {
    if (sinFences[i] === "{") nivel++;
    else if (sinFences[i] === "}") {
      nivel--;
      if (nivel === 0) {
        const candidato = sinFences.slice(inicio, i + 1);
        try {
          return JSON.parse(candidato);
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function validarEvaluacion(raw: unknown): RespuestaEvaluacion | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const acertada = obj.acertada;
  const puntaje = obj.puntaje;
  const feedback = obj.feedback;
  const corto = obj.consecuencia_corto_plazo;
  const largo = obj.consecuencia_largo_plazo;
  const leccion = obj.leccion;
  const proxima = obj.proxima_decision_sugerida;

  if (
    typeof acertada !== "boolean" ||
    typeof puntaje !== "number" ||
    typeof feedback !== "string" ||
    typeof corto !== "string" ||
    typeof largo !== "string" ||
    typeof leccion !== "string" ||
    typeof proxima !== "string"
  ) {
    return null;
  }

  const puntajeClamp = Math.max(1, Math.min(10, Math.round(puntaje)));
  return {
    acertada,
    puntaje: puntajeClamp,
    feedback: feedback.trim(),
    consecuencia_corto_plazo: corto.trim(),
    consecuencia_largo_plazo: largo.trim(),
    leccion: leccion.trim(),
    proxima_decision_sugerida: proxima.trim(),
  };
}

export async function POST(req: Request) {
  const startedAt = Date.now();
  const body = (await req.json().catch(() => null)) as EvaluarEventoRequest | null;
  if (!body) {
    return NextResponse.json({ error: "body_invalido" }, { status: 400 });
  }

  const { proyecto, evento, opcion, turnoActual, historial } = body;
  if (
    typeof proyecto !== "string" ||
    !evento ||
    !opcion ||
    typeof turnoActual !== "number"
  ) {
    return NextResponse.json({ error: "campos_faltantes" }, { status: 400 });
  }
  if (!MODULOS_VALIDOS.includes(evento.modulo)) {
    return NextResponse.json({ error: "modulo_invalido" }, { status: 400 });
  }
  if (!Array.isArray(evento.opciones) || evento.opciones.length === 0) {
    return NextResponse.json({ error: "evento_sin_opciones" }, { status: 400 });
  }

  const historialSeguro = Array.isArray(historial) ? historial : [];

  const system = buildSistemaEvaluarEvento(evento.modulo);
  const user = buildUserEvaluarEvento({
    proyecto,
    evento,
    opcion,
    turnoActual,
    historial: historialSeguro,
  });

  try {
    const resultado = await llamarIA(system, user, 1200, `eventos-sorpresa-${evento.modulo}`);
    const parsed = extraerJsonDeTexto(resultado.text);
    const evaluacion = validarEvaluacion(parsed);
    if (!evaluacion) {
      return NextResponse.json(
        { error: "ia_formato_invalido", raw: resultado.text.slice(0, 400) },
        { status: 502 }
      );
    }
    const response: EvaluarEventoResponse = {
      ...evaluacion,
      tiempo_ms: Date.now() - startedAt,
    };
    return NextResponse.json(response);
  } catch (e) {
    return NextResponse.json(
      { error: "ai_error", detail: (e as Error).message },
      { status: 502 }
    );
  }
}
