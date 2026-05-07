/**
 * POST /api/projects/[id]/defensa
 *
 * Simulador de defensa oral. La IA actúa como tribunal boliviano.
 *
 * body { accion: "iniciar" }
 *   → Genera la primera pregunta del tribunal basada en los capítulos.
 *
 * body { accion: "responder", respuesta: string, historial: TurnMsg[] }
 *   → Evalúa la respuesta y genera la siguiente pregunta o el cierre con puntaje.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import { llamarIA } from "@/lib/aiProvider";

type Params = Promise<{ id: string }>;

interface TurnMsg {
  rol: "tribunal" | "estudiante";
  texto: string;
}

const MAX_PREGUNTAS = 6;

const SISTEMA_TRIBUNAL = `Eres un tribunal académico boliviano que evalúa la defensa oral de una monografía de postgrado/diplomado. \
Tu rol es ser riguroso, formal y justo — como un verdadero tribunal universitario boliviano. \
REGLAS ESTRICTAS:
- Haz UNA sola pregunta por turno. Nunca hagas dos preguntas en el mismo mensaje.
- Antes de cada pregunta (excepto la primera), comenta brevemente (1-2 oraciones) la calidad de la respuesta anterior.
- Las preguntas deben cubrir diferentes aspectos: marco teórico, metodología, resultados, justificación, coherencia, aplicabilidad.
- No repitas preguntas ya hechas.
- Sé directo, sin preámbulos largos.
- Usa lenguaje académico formal pero claro.`;

function buildContexto(proyecto: Record<string, unknown>): string {
  const phaseContents = proyecto.phase_contents as Record<string, string | null> | undefined;

  // Legacy fields fallback
  const legacyMap: Record<string, string> = {
    fase_0: "contenido_fase_0",
    fase_1: "contenido_fase_1",
    fase_2: "contenido_fase_2",
    fase_3: "contenido_fase_3",
    fase_4: "contenido_fase_4",
    fase_5: "contenido_fase_5",
  };

  const faseLabels: Record<string, string> = {
    fase_0: "Planteamiento del Tema",
    fase_1: "Capítulo I — Marco Referencial",
    fase_2: "Capítulo II — Marco Teórico",
    fase_3: "Capítulos III-V — Desarrollo",
    fase_4: "Revisión",
    fase_5: "Conclusiones y Bibliografía",
  };

  const partes: string[] = [];
  for (const [phaseId, label] of Object.entries(faseLabels)) {
    const content = phaseContents?.[phaseId] ?? (proyecto[legacyMap[phaseId]] as string | null) ?? null;
    if (!content) continue;
    // Max 800 chars per phase to keep prompt manageable
    const snippet = content.length > 800 ? content.slice(0, 800) + "…(truncado)" : content;
    partes.push(`### ${label}\n${snippet}`);
  }

  return partes.length > 0
    ? partes.join("\n\n")
    : "El proyecto aún no tiene capítulos generados.";
}

export async function POST(req: Request, { params }: { params: Params }) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const proyecto = await dbGetProyecto(id);
    if (!proyecto || ((proyecto as unknown as Record<string, unknown>).usuario_id !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({})) as {
      accion?: "iniciar" | "responder" | "cerrar";
      respuesta?: string;
      historial?: TurnMsg[];
    };

    const proyectoData = proyecto as unknown as Record<string, unknown>;
    const tema = (proyectoData.tema_aprobado as string | null)
      ?? (proyectoData.titulo_provisional as string | null)
      ?? "Tema no definido";
    const contexto = buildContexto(proyectoData);
    const servicioId = proyectoData.servicio_id as string | undefined;

    // ── INICIAR ──────────────────────────────────────────────────────────────

    if (body.accion === "iniciar") {
      const userMsg = `MONOGRAFÍA DEL ESTUDIANTE:
Tema: ${tema}

${contexto}

---
Inicia la defensa con una pregunta de apertura formal y concisa. \
Preséntate brevemente como tribunal (una oración) y formula la primera pregunta \
sobre el planteamiento del problema o la justificación del tema.`;

      const result = await llamarIA(SISTEMA_TRIBUNAL, userMsg, 600, servicioId);
      return NextResponse.json({ ok: true, pregunta: result.text, turno: 1, cerrado: false });
    }

    // ── RESPONDER ────────────────────────────────────────────────────────────

    if (body.accion === "responder") {
      const { respuesta, historial = [] } = body;
      if (!respuesta?.trim()) {
        return NextResponse.json({ error: "La respuesta no puede estar vacía" }, { status: 400 });
      }

      const turnoActual = Math.floor(historial.length / 2) + 1;
      const esCierre = turnoActual >= MAX_PREGUNTAS;

      // Build conversation history for context
      const historialTexto = historial.map(t =>
        `${t.rol === "tribunal" ? "TRIBUNAL" : "ESTUDIANTE"}: ${t.texto}`
      ).join("\n\n");

      let userMsg: string;
      if (esCierre) {
        userMsg = `MONOGRAFÍA — Tema: ${tema}

HISTORIAL DE LA DEFENSA:
${historialTexto}

ÚLTIMA RESPUESTA DEL ESTUDIANTE: ${respuesta}

---
Esta fue la última ronda. Ahora debes:
1. Comentar brevemente (2-3 oraciones) la calidad de esta última respuesta.
2. Dar una evaluación final global de la defensa con:
   - Puntaje numérico del 0 al 100
   - 2-3 fortalezas observadas
   - 1-2 aspectos a mejorar
   - Veredicto: APROBADO / APROBADO CON OBSERVACIONES / REPROBADO
Sé justo y académico. Formato claro.`;
      } else {
        userMsg = `MONOGRAFÍA — Tema: ${tema}

FRAGMENTOS DEL TRABAJO:
${contexto.slice(0, 1200)}

HISTORIAL DE LA DEFENSA:
${historialTexto}

ÚLTIMA RESPUESTA DEL ESTUDIANTE: ${respuesta}

---
Comenta brevemente la respuesta anterior (1-2 oraciones) y formula la siguiente pregunta \
sobre un aspecto diferente a los ya tratados. Turno ${turnoActual} de ${MAX_PREGUNTAS}.`;
      }

      const result = await llamarIA(SISTEMA_TRIBUNAL, userMsg, 700, servicioId);
      return NextResponse.json({
        ok: true,
        pregunta: result.text,
        turno: turnoActual,
        cerrado: esCierre,
      });
    }

    return NextResponse.json({ error: "accion inválida" }, { status: 400 });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[defensa]", e);
    return NextResponse.json({ error: (e as Error).message || "Error interno" }, { status: 500 });
  }
}
