import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';

/**
 * GET /api/mercados/proyectos/[id]/analisis
 * Devuelve las preguntas de la encuesta + todas las respuestas crudas,
 * para que el cliente tabule con lib/mercados/analisis. Requiere ser dueño.
 */

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'sin_db' }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;

  const { data: proyecto } = await sb
    .from('mercados_proyectos')
    .select('id, titulo')
    .eq('id', id)
    .eq('estudiante_id', user.id)
    .maybeSingle();
  if (!proyecto) return NextResponse.json({ error: 'no_encontrado' }, { status: 404 });

  const { data: encuesta } = await sb
    .from('mercados_encuestas')
    .select('id')
    .eq('proyecto_id', id)
    .maybeSingle();
  if (!encuesta) return NextResponse.json({ preguntas: [], respuestas: [] });

  const { data: preguntas } = await sb
    .from('mercados_preguntas')
    .select('id, orden, texto, tipo, opciones')
    .eq('encuesta_id', encuesta.id)
    .order('orden', { ascending: true });

  const { data: respuestasRaw } = await sb
    .from('mercados_respuestas')
    .select('respuestas')
    .eq('encuesta_id', encuesta.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const respuestas = (respuestasRaw ?? []).map((r: any) => r.respuestas ?? {});

  return NextResponse.json({ preguntas: preguntas ?? [], respuestas });
}
