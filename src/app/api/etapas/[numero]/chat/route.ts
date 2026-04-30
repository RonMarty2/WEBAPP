import { NextResponse } from "next/server";
import { llamarIA } from "@/lib/aiProvider";
import { getCapitulo, upsertCapitulo } from "@/lib/memoryStore";

type Params = Promise<{ numero: string }>;

// POST /api/etapas/[numero]/chat
// Modifica el capítulo según la observación del estudiante
export async function POST(req: Request, { params }: { params: Params }) {
  const { numero } = await params;
  const etapa = parseInt(numero, 10);

  if (isNaN(etapa) || etapa < 0 || etapa > 3) {
    return NextResponse.json({ error: "Etapa inválida" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { monografia_id, mensaje, contenido_actual } = body;

    if (!mensaje?.trim() || !contenido_actual?.trim()) {
      return NextResponse.json(
        { error: "mensaje y contenido_actual son requeridos" },
        { status: 400 }
      );
    }

    const systemPrompt = `Eres un asesor académico experto en monografías universitarias. Tu tarea es modificar un capítulo ya generado según las observaciones del estudiante.

REGLAS ESTRICTAS:
1. Mantén el estilo académico formal en todo momento.
2. NO elimines citas, referencias bibliográficas ni datos ya incluidos, a menos que el estudiante lo pida explícitamente.
3. NO inventes autores, estadísticas, URLs ni datos nuevos que no estén en el capítulo original.
4. Aplica EXACTAMENTE lo que pide el estudiante. Si pide hacerlo más corto, hazlo. Si pide agregar una sección, agrégala usando solo la información disponible.
5. Si la solicitud va contra la integridad académica (inventar datos, plagiar, etc.), explica por qué no puedes hacerlo y ofrece una alternativa ética.
6. Devuelve ÚNICAMENTE el texto completo del capítulo modificado, sin explicaciones adicionales, sin saludos, sin notas al final.`;

    const userMessage = `CAPÍTULO ACTUAL (Etapa ${etapa}):
${contenido_actual}

OBSERVACIÓN DEL ESTUDIANTE:
${mensaje}

Devuelve el capítulo completo con las modificaciones solicitadas.`;

    const { text } = await llamarIA(systemPrompt, userMessage, 7000);

    // Actualizar el capítulo en el store preservando el JSON estructurado original
    if (monografia_id) {
      const existing = getCapitulo(monografia_id, etapa);
      upsertCapitulo({
        monografia_id,
        numero: etapa,
        contenido: text,
        contenido_json: existing?.contenido_json,
        status: "draft",
        observaciones: `Modificado por chat: "${mensaje.substring(0, 100)}"`,
      });
    }

    return NextResponse.json({ texto: text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
