import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';

/**
 * /api/maestro
 *   GET  → lista los proyectos maestros del usuario.
 *   POST → crea un proyecto maestro { titulo, tipo_negocio, sector, ... }.
 *
 * El Proyecto Maestro es la capa de contexto compartido entre módulos.
 * Es OPCIONAL: los módulos funcionan sin él.
 */

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ proyectos: [] });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  const { data } = await sb
    .from('proyecto_maestro')
    .select('*')
    .eq('estudiante_id', user.id)
    .order('actualizado_en', { ascending: false });

  return NextResponse.json({ proyectos: data ?? [] });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'sin_db' }, { status: 500 });

  const body = await req.json().catch(() => null);
  const titulo = (body?.titulo as string | undefined)?.trim();
  if (!titulo) return NextResponse.json({ error: 'falta_titulo' }, { status: 400 });

  const campos = ['tipo_negocio', 'sector', 'departamento', 'municipio', 'zona', 'descripcion', 'universidad', 'modalidad'];
  const fila: Record<string, unknown> = { estudiante_id: user.id, titulo };
  for (const c of campos) if (body[c] != null) fila[c] = body[c];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  const { data, error } = await sb.from('proyecto_maestro').insert(fila).select().single();
  if (error) return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, proyecto: data });
}
