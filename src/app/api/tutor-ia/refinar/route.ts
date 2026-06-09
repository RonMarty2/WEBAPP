/**
 * POST /api/tutor-ia/refinar
 *
 * Sprint 2a: Tutor IA aditivo. El alumno manda su contexto + lo que ya
 * escribió, recibe 3 alternativas con pros/cons + pregunta crítica +
 * lección clave + siguiente paso.
 *
 * NO toca el endpoint /api/ai/asistir existente (Sugerir IA). Vive en
 * paralelo. El alumno elige cuál usar según el momento.
 */

import { NextResponse } from "next/server";
import { llamarIA } from "@/lib/aiProvider";
import { buildSistemaTutorIA, buildUserTutorIA } from "@/lib/prompts/tutor-ia/refinar";
import type { TutorIARequest, TutorIAResponse, ModuloTutor } from "@/types/tutor-ia";

const MODULOS_VALIDOS: ModuloTutor[] = [
  "idea", "mercados", "estrategia", "marketing", "organizacion", "defensa",
];

const MAX_CONTENIDO = 8000;
const MAX_CONTEXTO = 4000;

export async function POST(req: Request) {
  const inicio = Date.now();
  try {
    const body = (await req.json().catch(() => ({}))) as Partial<TutorIARequest>;

    const modulo = body.modulo;
    if (!modulo || !MODULOS_VALIDOS.includes(modulo)) {
      return NextResponse.json({ error: "Módulo inválido" }, { status: 400 });
    }
    const herramienta = typeof body.herramienta === "string" ? body.herramienta.trim().slice(0, 100) : "";
    if (!herramienta) {
      return NextResponse.json({ error: "Falta la herramienta" }, { status: 400 });
    }

    const contexto = typeof body.contexto === "string" ? body.contexto.trim().slice(0, MAX_CONTEXTO) : "";
    const contenido_actual = typeof body.contenido_actual === "string" ? body.contenido_actual.trim().slice(0, MAX_CONTENIDO) : "";
    const campo = typeof body.campo === "string" ? body.campo.trim().slice(0, 200) : undefined;

    const system = buildSistemaTutorIA(modulo);
    const user = buildUserTutorIA({ herramienta, contexto, contenido_actual, campo });

    const { text } = await llamarIA(system, user, 3000);

    // Parseo robusto: a veces los modelos envuelven el JSON en ```json ... ```
    const limpio = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    let parsed: TutorIAResponse;
    try {
      parsed = JSON.parse(limpio) as TutorIAResponse;
    } catch {
      // Intento más agresivo: extraer el primer objeto JSON que aparezca.
      const match = limpio.match(/\{[\s\S]*\}/);
      if (!match) {
        return NextResponse.json({
          error: "La IA devolvió una respuesta no estructurada. Intenta de nuevo.",
          detalle: limpio.slice(0, 200),
        }, { status: 502 });
      }
      try {
        parsed = JSON.parse(match[0]) as TutorIAResponse;
      } catch {
        return NextResponse.json({
          error: "La IA devolvió JSON inválido. Intenta de nuevo.",
        }, { status: 502 });
      }
    }

    // Validación mínima de estructura.
    if (!Array.isArray(parsed.alternativas) || parsed.alternativas.length === 0) {
      return NextResponse.json({
        error: "La IA no generó alternativas. Intenta de nuevo.",
      }, { status: 502 });
    }

    parsed.tiempo_ms = Date.now() - inicio;
    return NextResponse.json(parsed);
  } catch (e) {
    const detalle = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({
      error: "No se pudo generar la tutoría. Reintenta en un momento.",
      detalle: detalle.slice(0, 200),
    }, { status: 500 });
  }
}
