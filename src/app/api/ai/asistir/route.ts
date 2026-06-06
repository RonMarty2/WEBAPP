import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { llamarIA } from '@/lib/aiProvider';
import { construirContextoMaestro, contextoATexto } from '@/lib/maestro/contexto';

/**
 * POST /api/ai/asistir  — Servicio de IA compartido por TODOS los módulos.
 *
 * Body: {
 *   modulo: 'estrategia' | 'mercados' | 'finanzas' | ...,
 *   tarea: string,           // qué generar, ej. "sugerir factores PESTEL"
 *   instruccion: string,     // detalle/datos puntuales del usuario
 *   maestroId?: string,      // si hay proyecto maestro vinculado → contexto cruzado
 *   formato?: 'lista' | 'texto'  // pista de formato de salida
 * }
 *
 * Reúne el contexto del proyecto maestro (si lo hay) + la tarea, arma el
 * prompt y llama a la cascada de IA de webapp (Groq→Gemini→Anthropic→OpenAI).
 * El estudiante SIEMPRE edita/aprueba lo que vuelve. Devuelve { texto, provider }.
 */

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const modulo = (body?.modulo as string) ?? 'general';
  const tarea = (body?.tarea as string)?.trim();
  const instruccion = (body?.instruccion as string) ?? '';
  const maestroId = body?.maestroId as string | undefined;
  const formato = (body?.formato as string) ?? 'texto';

  if (!tarea) return NextResponse.json({ error: 'falta_tarea' }, { status: 400 });

  // Contexto cruzado del proyecto maestro (si hay), validando dueño.
  let contextoTxt = 'Sin proyecto maestro: trabaja de forma genérica y pide datos si faltan.';
  if (maestroId) {
    const ctx = await construirContextoMaestro(maestroId, user.id);
    contextoTxt = contextoATexto(ctx);
  }

  const formatoHint =
    formato === 'lista'
      ? 'Devuelve SOLO una lista, un ítem por línea, sin numeración ni viñetas ni texto extra.'
      : 'Devuelve texto claro y conciso, sin preámbulos.';

  const system = [
    'Eres un asistente académico experto en proyectos de grado para universidades bolivianas.',
    'Ayudas a estudiantes a construir su proyecto con rigor metodológico y contexto boliviano real.',
    'Tus sugerencias son un PUNTO DE PARTIDA: el estudiante las editará y aprobará.',
    'No inventes datos numéricos precisos como si fueran reales; si sugieres cifras, acláralo.',
    `Módulo actual: ${modulo}.`,
    formatoHint,
  ].join(' ');

  const userPrompt = [
    `CONTEXTO DEL PROYECTO:\n${contextoTxt}`,
    '',
    `TAREA: ${tarea}`,
    instruccion ? `DETALLE DEL ESTUDIANTE: ${instruccion}` : '',
  ].filter(Boolean).join('\n');

  try {
    const resultado = await llamarIA(system, userPrompt, 1500, `modulo-${modulo}`);
    return NextResponse.json({
      texto: resultado.text,
      provider: resultado.provider,
      model: resultado.model,
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'ai_error', detail: (e as Error).message },
      { status: 502 }
    );
  }
}
