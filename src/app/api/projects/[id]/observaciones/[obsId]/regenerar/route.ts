/**
 * POST /api/projects/[id]/observaciones/[obsId]/regenerar
 *
 * Regeneración INCREMENTAL de un capítulo aplicando una observación de
 * fondo del tutor/tribunal. Diferencia con /atender:
 *  - /atender devuelve un mini-comentario de la IA ("se puede reforzar…").
 *  - /regenerar devuelve el capítulo COMPLETO ya mejorado + el detalle de
 *    qué se cambió, sin reescribir todo.
 *
 * REGLA CRÍTICA del prompt: la IA NO reemplaza el capítulo entero. Conserva
 * el texto válido y solo edita/agrega/quita lo necesario para atender la
 * observación. Cada quita lleva justificación.
 *
 * NO escribe nada al proyecto — solo devuelve la propuesta. Aplicar el
 * cambio queda a cargo del estudiante mediante /aplicar.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import { dbGetObservacion } from "@/lib/db/observaciones";
import { llamarIA, hydrateAIConfigAsync } from "@/lib/aiProvider";

type Params = Promise<{ id: string; obsId: string }>;

const SISTEMA = `Eres un editor académico boliviano que MEJORA capítulos de
forma INCREMENTAL, no de cero. Tu regla más importante: preservar todo el
texto válido del capítulo original y modificar SOLO lo necesario para
atender la observación del tutor.

REGLAS DE EDICIÓN INCREMENTAL — son ABSOLUTAS:
1. NO reescribas párrafos ya correctos. Cópialos tal cual.
2. AGREGA contenido nuevo solo donde la observación lo exige.
3. EDITA un párrafo solo si su redacción actual impide cumplir la observación.
4. QUITA texto solo si es estrictamente necesario. Cada borrado obliga a
   declarar el motivo en el bloque CAMBIOS.
5. Mantén el estilo, tono, vocabulario y voz del autor original.
6. Mantén las citas APA 7 ya presentes; solo agrega nuevas si la observación
   exige nueva evidencia.
7. Conserva la numeración de subtítulos, tablas y figuras.

FORMATO DE SALIDA OBLIGATORIO (exactamente en este orden):

### CAMBIOS
- agregado: <descripción breve de qué se agregó y por qué>
- editado: <descripción de qué se reformuló y por qué>
- quitado: <texto eliminado entrecomillado + motivo justificado>
(Lista los cambios reales realizados — máximo 8 ítems.)

### CAPITULO_MEJORADO
<El capítulo completo en su versión nueva, listo para reemplazar al actual.
Sin marcadores [AGREGADO], sin etiquetas, sin meta-comentarios. Solo el
texto académico final con sus subtítulos, párrafos y tablas.>

Si la observación se podía atender solo agregando uno o dos párrafos, eso
es lo que debe verse: el capítulo original íntegro con esos dos párrafos
añadidos donde corresponde. NO regeneres todo "de paso".`;

export async function POST(_req: Request, { params }: { params: Params }) {
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

    if (!obs.capitulo_afectado) {
      return NextResponse.json(
        { error: "Esta observación no tiene capítulo asignado. Asigna primero el capítulo afectado para regenerar." },
        { status: 400 },
      );
    }

    const phaseContents = (proyecto as unknown as Record<string, unknown>).phase_contents as
      | Record<string, string>
      | undefined;
    const textoActual = phaseContents?.[obs.capitulo_afectado];
    if (!textoActual || !textoActual.trim()) {
      return NextResponse.json(
        { error: "El capítulo afectado todavía no tiene contenido. Genéralo antes de regenerar." },
        { status: 400 },
      );
    }

    await hydrateAIConfigAsync();

    const tema =
      ((proyecto as unknown as Record<string, unknown>).tema_aprobado as string | null) ??
      ((proyecto as unknown as Record<string, unknown>).titulo_provisional as string | null) ??
      "Tema no definido";

    // Contexto del Cap. II para que la IA pueda anclar nuevas conexiones
    // teóricas (necesario cuando la observación pide contraste con teoría).
    const cap2Content =
      phaseContents?.["ph-cap2"] ??
      phaseContents?.["cap2"] ??
      "";
    const cap2Resumen = cap2Content.slice(0, 3000);

    const userMsg = [
      `TEMA DEL TRABAJO: ${tema}`,
      "",
      `OBSERVACIÓN DEL TUTOR (a aplicar al capítulo "${obs.capitulo_afectado}"):`,
      `"${obs.texto.trim()}"`,
      obs.notas_usuario ? `\nNOTAS DEL ESTUDIANTE: ${obs.notas_usuario}` : "",
      "",
      cap2Resumen
        ? "MARCO TEÓRICO DISPONIBLE (Cap. II, primeros 3000 caracteres — úsalo para anclar referencias si la observación pide contraste teórico):\n" +
          cap2Resumen
        : "",
      "",
      "═══════════════════════════════════════════════════════════════",
      "TEXTO ACTUAL DEL CAPÍTULO — EDÍTALO DE FORMA INCREMENTAL",
      "═══════════════════════════════════════════════════════════════",
      "",
      textoActual,
      "",
      "═══════════════════════════════════════════════════════════════",
      "FIN DEL TEXTO ACTUAL",
      "═══════════════════════════════════════════════════════════════",
      "",
      "Ahora produce ### CAMBIOS y ### CAPITULO_MEJORADO según el formato indicado.",
      "Recuerda: NO reescribas todo. Conserva lo válido. Modifica lo mínimo necesario.",
    ]
      .filter(Boolean)
      .join("\n");

    const result = await llamarIA(SISTEMA, userMsg, 6000, proyecto.servicio_id ?? "mono-001");

    // Parser: separa los dos bloques. Tolerante a variantes de heading.
    const respuesta = result.text;
    const matchCambios = respuesta.match(/###\s*CAMBIOS\s*\n([\s\S]*?)(?=###\s*CAPITULO_MEJORADO|$)/i);
    const matchTexto = respuesta.match(/###\s*CAPITULO_MEJORADO\s*\n([\s\S]*)$/i);

    if (!matchTexto) {
      return NextResponse.json(
        {
          error:
            "La IA devolvió la propuesta en formato no parseable. Intenta de nuevo.",
          raw: respuesta.slice(0, 500),
        },
        { status: 502 },
      );
    }

    const cambiosTexto = matchCambios?.[1]?.trim() ?? "";
    const textoNuevo = matchTexto[1].trim();

    // Cambios como lista de líneas no vacías (la UI los muestra como bullets).
    const cambios = cambiosTexto
      .split("\n")
      .map((l) => l.replace(/^[-•]\s*/, "").trim())
      .filter((l) => l.length > 0);

    return NextResponse.json({
      ok: true,
      capitulo: obs.capitulo_afectado,
      texto_nuevo: textoNuevo,
      cambios,
      proveedor: `${result.provider} / ${result.model}`,
      // Métricas para que la UI muestre "delta" tranquilizador
      longitud_actual: textoActual.length,
      longitud_nueva: textoNuevo.length,
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[regenerar-obs]", e);
    return NextResponse.json({ error: (e as Error).message ?? "Error interno" }, { status: 500 });
  }
}
