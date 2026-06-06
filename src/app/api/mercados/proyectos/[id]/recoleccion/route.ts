import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';

/**
 * /api/mercados/proyectos/[id]/recoleccion
 *
 * GET  → estado de recolección de la encuesta del proyecto: publicada,
 *        cerrada, token, conteo de respuestas y las respuestas crudas.
 * POST → { accion: 'publicar' | 'cerrar' | 'reabrir' }.
 *        publicar genera token_publico y mueve estado a 'recoleccion'.
 *
 * Requiere sesión de webapp y que el proyecto sea del usuario.
 */

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

function nuevoToken(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 10);
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
    .select('id, tamano_muestra')
    .eq('id', id)
    .eq('estudiante_id', user.id)
    .maybeSingle();
  if (!proyecto) return NextResponse.json({ error: 'no_encontrado' }, { status: 404 });

  const { data: encuesta } = await sb
    .from('mercados_encuestas')
    .select('*')
    .eq('proyecto_id', id)
    .maybeSingle();

  if (!encuesta) {
    return NextResponse.json({ encuesta: null, respuestas: [], total: 0, meta: proyecto.tamano_muestra });
  }

  const { data: respuestas } = await sb
    .from('mercados_respuestas')
    .select('*')
    .eq('encuesta_id', encuesta.id)
    .order('enviado_en', { ascending: false });

  return NextResponse.json({
    encuesta,
    respuestas: respuestas ?? [],
    total: respuestas?.length ?? 0,
    meta: proyecto.tamano_muestra,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'sin_db' }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const accion = body?.accion as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;

  const { data: proyecto } = await sb
    .from('mercados_proyectos')
    .select('id')
    .eq('id', id)
    .eq('estudiante_id', user.id)
    .maybeSingle();
  if (!proyecto) return NextResponse.json({ error: 'no_encontrado' }, { status: 404 });

  const { data: encuesta } = await sb
    .from('mercados_encuestas')
    .select('*')
    .eq('proyecto_id', id)
    .maybeSingle();
  if (!encuesta) return NextResponse.json({ error: 'sin_encuesta' }, { status: 400 });

  let updates: Record<string, unknown> = {};
  if (accion === 'publicar') {
    updates = {
      publicada: true,
      cerrada: false,
      token_publico: encuesta.token_publico ?? nuevoToken(),
    };
    await sb.from('mercados_proyectos').update({ estado: 'recoleccion' }).eq('id', id);
  } else if (accion === 'cerrar') {
    updates = { cerrada: true };
  } else if (accion === 'reabrir') {
    updates = { cerrada: false, publicada: true };
  } else {
    return NextResponse.json({ error: 'accion_invalida' }, { status: 400 });
  }

  const { data: actualizada, error } = await sb
    .from('mercados_encuestas')
    .update(updates)
    .eq('id', encuesta.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, encuesta: actualizada });
}
