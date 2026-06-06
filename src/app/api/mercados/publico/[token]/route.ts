import { NextResponse } from 'next/server';
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';

/**
 * /api/mercados/publico/[token]  — ENDPOINT PÚBLICO (sin login)
 *
 * GET  → devuelve la encuesta + preguntas si está publicada y no cerrada.
 *        Cualquiera con el token puede leerla para responder.
 * POST → guarda una respuesta { respuestas: { preguntaId: valor } }.
 *
 * No expone datos del dueño ni del proyecto, solo lo necesario para responder.
 */

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'sin_db' }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  const { data: encuesta } = await sb
    .from('mercados_encuestas')
    .select('id, titulo, descripcion, publicada, cerrada')
    .eq('token_publico', token)
    .maybeSingle();

  if (!encuesta || !encuesta.publicada) {
    return NextResponse.json({ error: 'no_disponible' }, { status: 404 });
  }
  if (encuesta.cerrada) {
    return NextResponse.json({ error: 'cerrada', titulo: encuesta.titulo }, { status: 410 });
  }

  const { data: preguntas } = await sb
    .from('mercados_preguntas')
    .select('id, orden, texto, tipo, opciones, obligatoria')
    .eq('encuesta_id', encuesta.id)
    .order('orden', { ascending: true });

  return NextResponse.json({
    encuesta: { titulo: encuesta.titulo, descripcion: encuesta.descripcion },
    preguntas: preguntas ?? [],
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'sin_db' }, { status: 500 });

  const body = await req.json().catch(() => null);
  const respuestas = body?.respuestas;
  if (!respuestas || typeof respuestas !== 'object') {
    return NextResponse.json({ error: 'respuestas_invalidas' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  const { data: encuesta } = await sb
    .from('mercados_encuestas')
    .select('id, publicada, cerrada')
    .eq('token_publico', token)
    .maybeSingle();

  if (!encuesta || !encuesta.publicada || encuesta.cerrada) {
    return NextResponse.json({ error: 'no_disponible' }, { status: 404 });
  }

  const { error } = await sb.from('mercados_respuestas').insert({
    encuesta_id: encuesta.id,
    respuestas,
    completada: true,
  });

  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
