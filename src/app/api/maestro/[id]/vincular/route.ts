import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';

/**
 * POST /api/maestro/[id]/vincular
 * Vincula un proyecto de un módulo al proyecto maestro.
 * Body: { modulo: 'mercados'|'estrategia'|..., ref_id: '<id del proyecto del módulo>' }
 *
 * GET → lista los vínculos del maestro (qué módulos tiene conectados).
 */

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function esDueno(sb: any, maestroId: string, userId: string) {
  const { data } = await sb
    .from('proyecto_maestro')
    .select('id')
    .eq('id', maestroId)
    .eq('estudiante_id', userId)
    .maybeSingle();
  return !!data;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ vinculos: [] });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  if (!(await esDueno(sb, id, user.id))) return NextResponse.json({ error: 'no_encontrado' }, { status: 404 });

  const { data } = await sb.from('proyecto_maestro_vinculos').select('*').eq('maestro_id', id);
  return NextResponse.json({ vinculos: data ?? [] });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'sin_db' }, { status: 500 });

  const body = await req.json().catch(() => null);
  const modulo = body?.modulo as string;
  const refId = body?.ref_id as string;
  if (!modulo || !refId) return NextResponse.json({ error: 'faltan_datos' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  if (!(await esDueno(sb, id, user.id))) return NextResponse.json({ error: 'no_encontrado' }, { status: 404 });

  // upsert: un proyecto por módulo por maestro
  const { data, error } = await sb
    .from('proyecto_maestro_vinculos')
    .upsert({ maestro_id: id, modulo, ref_id: refId }, { onConflict: 'maestro_id,modulo' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, vinculo: data });
}
