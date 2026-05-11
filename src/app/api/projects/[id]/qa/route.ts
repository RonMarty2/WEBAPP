/**
 * POST /api/projects/[id]/qa
 *
 * Q&A libre sobre el contenido del documento. La IA responde basándose
 * EXCLUSIVAMENTE en el contenido ya generado por el estudiante (capítulos
 * aprobados o en borrador). NO inventa nada que no esté en el texto.
 *
 * body: { pregunta: string }
 * resp: { respuesta: string, fuentes_usadas: string[] }
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import { llamarIA } from "@/lib/aiProvider";

type Params = Promise<{ id: string }>;

const SISTEMA_QA = `Eres un asistente académico que responde preguntas sobre el contenido de una monografía universitaria boliviana.

REGLAS ESTRICTAS:
1. Respondé ÚNICAMENTE basándote en el contenido del documento que se te proporciona como contexto. NUNCA inventes datos, citas o información que no esté en el texto.
2. Si la pregunta requiere información que NO está en el documento, decílo claramente: "Esa información no está en tu documento actual."
3. Cuando hagas referencia a un capítulo o sección, mencionalo (ej: "En el Capítulo II definís...").
4. Sé directo y conciso. Máximo 3-4 párrafos. Si la respuesta cabe en 2 oraciones, mejor.
5. Usá español académico neutro de Bolivia. Tono formal pero accesible.
6. Si te piden un resumen, hacelo enfocado en los puntos clave, no copies fragmentos.
7. Si te piden detectar problemas, citá secciones específicas con texto entre comillas cortas.

NO necesitas justificar tu rol ni hacer preámbulos. Andá directo a la respuesta.`;

function buildContextoDoc(proyecto: Record<string, unknown>): { contexto: string; secciones: string[] } {
  const phaseContents = (proyecto.phase_contents ?? {}) as Record<string, string | null | undefined>;
  const nonEmpty = (s: string | null | undefined): string | null =>
    typeof s === "string" && s.trim() ? s : null;

  const caps345 = [phaseContents["ph-cap3"], phaseContents["ph-cap4"], phaseContents["ph-cap5"]]
    .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
    .join("\n\n") || null;

  // Sondaje más amplio que la defensa (más chars por sección) porque Q&A
  // requiere recordar detalles específicos.
  const MAX_CHARS = 2000;
  const secciones: { id: string; label: string; content: string | null }[] = [
    { id: "tema",          label: "Tema",                              content: nonEmpty(phaseContents["ph-cap0"]) },
    { id: "resumen",       label: "Resumen",                           content: nonEmpty(phaseContents["ph-resumen"]) },
    { id: "cap1",          label: "Capítulo I — Introducción",         content: nonEmpty(phaseContents["ph-cap1"]) },
    { id: "cap2",          label: "Capítulo II — Marco Teórico",       content: nonEmpty(phaseContents["ph-cap2"]) },
    { id: "caps345",       label: "Capítulos III-V — Desarrollo",      content: caps345 },
    { id: "referencias",   label: "Referencias",                       content: nonEmpty(phaseContents["ph-referencias"]) },
  ];

  const partes: string[] = [];
  const fuentesUsadas: string[] = [];
  for (const { id, label, content } of secciones) {
    if (!content) continue;
    fuentesUsadas.push(id);
    const snippet = content.length > MAX_CHARS ? content.slice(0, MAX_CHARS) + "\n…(sección truncada)" : content;
    partes.push(`### ${label}\n${snippet}`);
  }

  const contexto = partes.length > 0
    ? partes.join("\n\n---\n\n")
    : "El proyecto aún no tiene capítulos generados.";

  return { contexto, secciones: fuentesUsadas };
}

export async function POST(req: Request, { params }: { params: Params }) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const proyecto = await dbGetProyecto(id);
    const proyectoRec = proyecto as unknown as Record<string, unknown>;
    if (!proyecto || (proyectoRec.usuario_id !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({})) as { pregunta?: string };
    const pregunta = body.pregunta?.trim();
    if (!pregunta) {
      return NextResponse.json({ error: "Falta el campo 'pregunta'" }, { status: 400 });
    }
    if (pregunta.length > 800) {
      return NextResponse.json({ error: "La pregunta es muy larga (máx 800 caracteres)" }, { status: 400 });
    }

    const { contexto, secciones } = buildContextoDoc(proyectoRec);

    const tema = (proyectoRec.tema_aprobado as string | null)
      ?? (proyectoRec.titulo_provisional as string | null)
      ?? "Tema no definido";

    const userPrompt = `TEMA DE LA MONOGRAFÍA: "${tema}"

--- CONTENIDO ACTUAL DEL DOCUMENTO ---

${contexto}

--- FIN DEL CONTENIDO ---

PREGUNTA DEL ESTUDIANTE:
${pregunta}

Respondé basándote SOLO en el contenido anterior. Si no hay información suficiente para responder, decílo.`;

    const servicioId = proyectoRec.servicio_id as string | undefined;
    const resultado = await llamarIA(SISTEMA_QA, userPrompt, 1500, servicioId);

    return NextResponse.json({
      respuesta: resultado.text.trim(),
      fuentes_usadas: secciones,
      proveedor: `${resultado.provider} / ${resultado.model}`,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
