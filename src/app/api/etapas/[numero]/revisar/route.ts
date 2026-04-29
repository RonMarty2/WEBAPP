import { NextResponse } from "next/server";
import { llamarIA, extraerJSON, extraerCitas } from "@/lib/aiProvider";
import { detectarAlucinaciones } from "@/lib/validaciones";
import {
  SISTEMA_ETAPA_0,
  SISTEMA_ETAPA_1,
  SISTEMA_ETAPA_2,
  SISTEMA_ETAPA_3,
} from "@/lib/prompts";
import {
  getMonografia,
  getCapitulo,
  upsertCapitulo,
  getCitas,
  addCita,
} from "@/lib/memoryStore";

type Params = Promise<{ numero: string }>;

// POST /api/etapas/[numero]/revisar
// Body: { monografia_id, observaciones, seccion_modificar? }
export async function POST(req: Request, { params }: { params: Params }) {
  const { numero } = await params;
  const etapa = parseInt(numero, 10);

  if (isNaN(etapa) || etapa < 0 || etapa > 3) {
    return NextResponse.json({ error: "Etapa debe ser 0, 1, 2 o 3" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { monografia_id, observaciones, seccion_modificar } = body;

    if (!monografia_id || !observaciones) {
      return NextResponse.json(
        { error: "monografia_id y observaciones son requeridos" },
        { status: 400 }
      );
    }

    const monografia = getMonografia(monografia_id);
    if (!monografia) {
      return NextResponse.json({ error: "Monografía no encontrada" }, { status: 404 });
    }

    const capituloActual = getCapitulo(monografia_id, etapa);
    if (!capituloActual?.contenido) {
      return NextResponse.json(
        { error: `La Etapa ${etapa} aún no ha sido generada. Usa /generar primero.` },
        { status: 400 }
      );
    }

    // Select system prompt for this stage
    const sistemasMap: Record<number, string> = {
      0: SISTEMA_ETAPA_0,
      1: SISTEMA_ETAPA_1,
      2: SISTEMA_ETAPA_2,
      3: SISTEMA_ETAPA_3,
    };
    const systemPrompt = sistemasMap[etapa];

    // Build revision user message
    const seccionMsg = seccion_modificar
      ? `\nSECCIÓN A MODIFICAR: ${seccion_modificar}`
      : "";

    const userMessage = `CONTENIDO PREVIO GENERADO (Etapa ${etapa}):
${capituloActual.contenido.slice(0, 6000)}

OBSERVACIONES DEL USUARIO — CAMBIOS REQUERIDOS:
${observaciones}${seccionMsg}

CITAS YA REGISTRADAS (NO duplicar):
${JSON.stringify(getCitas(monografia_id).filter(c => c.capitulo === etapa), null, 2)}

INSTRUCCIÓN: Aplica las observaciones del usuario y regenera ${seccion_modificar ? `solo la sección "${seccion_modificar}"` : "el capítulo completo"}.
Mantén el resto del contenido sin cambios. Conserva todas las citas ya registradas.
Al final, incluye el bloque JSON de salida con las citas actualizadas.`;

    // Call AI
    const { text, provider } = await llamarIA(systemPrompt, userMessage, 7000);

    // Anti-hallucination check
    const { limpio, alertas } = detectarAlucinaciones(text);

    // Extract JSON
    const outputJson = extraerJSON(text);

    // Update chapter with revision
    const capActualizado = upsertCapitulo({
      monografia_id,
      numero: etapa,
      contenido: text,
      contenido_json: outputJson ?? capituloActual.contenido_json,
      status: "revision",
      observaciones,
    });

    // Register any new citations
    let citasNuevas = 0;
    if (outputJson) {
      const citas = extraerCitas(outputJson);
      const citasExistentes = getCitas(monografia_id).filter(c => c.capitulo === etapa);
      for (const cita of citas) {
        const yaExiste = citasExistentes.some(
          ce => ce.autor === cita.autor && ce.ano === cita.ano
        );
        if (!yaExiste && cita.autor && cita.titulo_obra) {
          addCita({
            monografia_id,
            autor: cita.autor,
            ano: cita.ano,
            titulo_obra: cita.titulo_obra,
            fuente: cita.fuente,
            tipo: cita.tipo ?? "libro",
            formato_apa: cita.formato_apa,
            capitulo: etapa,
            es_consultado: true,
          });
          citasNuevas++;
        }
      }
    }

    return NextResponse.json({
      etapa,
      capitulo_id: capActualizado.id,
      texto: text,
      output_json: outputJson,
      citas_nuevas: citasNuevas,
      proveedor_ia: provider,
      advertencias_alucinacion: limpio ? [] : alertas,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: `Error revisando Etapa ${etapa}: ${message}` }, { status: 500 });
  }
}
