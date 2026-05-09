/**
 * POST /api/projects/[id]/observaciones/[obsId]/atender
 * La IA sugiere cómo corregir el capítulo para atender la observación del tribunal.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import { dbGetObservacion, dbUpdateObservacion } from "@/lib/db/observaciones";
import { llamarIA } from "@/lib/aiProvider";

type Params = Promise<{ id: string; obsId: string }>;

const SISTEMA = `Eres un experto en metodología académica boliviana. \
Tu tarea es ayudar a un estudiante a atender las observaciones que el tribunal hizo \
a su trabajo de grado. Debes proponer una corrección concreta, directa y académica. \
No expliques qué harás — escribe directamente el texto corregido o la sugerencia de \
mejora, con lenguaje formal propio de una monografía académica de postgrado boliviano. \
Si la observación requiere agregar contenido, escríbelo completo. \
Si requiere reformular, ofrece la versión reformulada. \
Máximo 600 palabras. Sin encabezados innecesarios.`;

export async function POST(req: Request, { params }: { params: Params }) {
  try {
    const { user } = await requireAuth();
    const { id, obsId } = await params;

    const proyecto = await dbGetProyecto(id);
    if (!proyecto || (proyecto.usuario_id !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    const obs = dbGetObservacion(obsId);
    if (!obs || obs.proyecto_id !== id) {
      return NextResponse.json({ error: "Observación no encontrada" }, { status: 404 });
    }

    // VALIDACIÓN: "Título Inviolable" — para observaciones TIPO 3
    if (obs.tipo === 3) {
      const tema = (proyecto as unknown as Record<string, unknown>).tema_aprobado as string | null
        ?? (proyecto as unknown as Record<string, unknown>).titulo_provisional as string | null
        ?? "Tema no definido";

      const validacionPrompt = `Título central del documento: "${tema}"
Observación a aplicar: "${obs.texto}"

¿Esta observación contradice o cambia la dirección central del documento?
Responde SOLO: "compatible" o "contradice: [razón breve]"`;

      const validacionResult = await llamarIA(
        "Eres un validador académico. Verifica si una observación contradice el título central.",
        validacionPrompt,
        300,
        proyecto.servicio_id ?? "mono-001"
      );

      if (validacionResult.text.toLowerCase().includes("contradice")) {
        return NextResponse.json({
          ok: false,
          error: "Esta observación contradice el título central del documento. No puede aplicarse.",
          detalle: validacionResult.text,
        }, { status: 409 });
      }
    }

    // Build chapter context — look in phase_contents first, then legacy fields
    const phaseContents = (proyecto as unknown as Record<string, unknown>).phase_contents as Record<string, string> | undefined;
    let chapterContext = "";
    if (obs.capitulo_afectado && phaseContents?.[obs.capitulo_afectado]) {
      const raw = phaseContents[obs.capitulo_afectado];
      // Send max 2000 chars to avoid token overflow
      chapterContext = raw.length > 2000 ? raw.slice(0, 2000) + "\n...(truncado)" : raw;
    }

    const tema = (proyecto as unknown as Record<string, unknown>).tema_aprobado as string | null
      ?? (proyecto as unknown as Record<string, unknown>).titulo_provisional as string | null
      ?? "Tema no definido";

    const userMsg = [
      `TEMA DEL TRABAJO: ${tema}`,
      `\nOBSERVACIÓN DEL TRIBUNAL:\n"${obs.texto}"`,
      chapterContext
        ? `\nCONTENIDO ACTUAL DEL CAPÍTULO AFECTADO (fragmento):\n${chapterContext}`
        : "",
      obs.notas_usuario
        ? `\nNOTAS DEL ESTUDIANTE: ${obs.notas_usuario}`
        : "",
      "\nPor favor, proporciona una corrección o mejora concreta para atender esta observación.",
    ].filter(Boolean).join("\n");

    const result = await llamarIA(SISTEMA, userMsg, 1500, proyecto.servicio_id as string | undefined);

    // Persist the AI response in the observation
    const updated = dbUpdateObservacion(obsId, { respuesta_ia: result.text });

    return NextResponse.json({ ok: true, respuesta_ia: result.text, observacion: updated });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[atender-obs]", e);
    return NextResponse.json({ error: (e as Error).message || "Error interno" }, { status: 500 });
  }
}
