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

/** Tabla del módulo donde vive el proyecto que se está vinculando. */
const TABLA_POR_MODULO: Record<string, string> = {
  idea: 'idea_proyectos',
  mercados: 'mercados_proyectos',
  estrategia: 'estrategia_proyectos',
  marketing: 'marketing_planes',
  organizacion: 'organizacion_proyectos',
  finanzas: 'finanzas_proyectos',
  defensa: 'defensa_proyectos',
};

/**
 * Confirma que el proyecto del módulo (ref_id) pertenece al userId.
 * Previene que un usuario vincule un proyecto ajeno a su maestro y
 * lea su contenido vía contexto cruzado / IA.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function refIdEsDelUsuario(sb: any, modulo: string, refId: string, userId: string): Promise<boolean> {
  const tabla = TABLA_POR_MODULO[modulo];
  if (!tabla) return false;
  try {
    const { data } = await sb
      .from(tabla)
      .select('id')
      .eq('id', refId)
      .eq('estudiante_id', userId)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
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

  // ⚠️ Crítico: el proyecto vinculado DEBE pertenecer al mismo usuario.
  // Sin esta validación, un usuario podría vincular un proyecto ajeno a su
  // propio maestro y leer su contenido vía el contexto cruzado de IA.
  if (!(await refIdEsDelUsuario(sb, modulo, refId, user.id))) {
    return NextResponse.json({ error: 'ref_id_invalido' }, { status: 403 });
  }

  // upsert: un proyecto por módulo por maestro
  const { data, error } = await sb
    .from('proyecto_maestro_vinculos')
    .upsert({ maestro_id: id, modulo, ref_id: refId }, { onConflict: 'maestro_id,modulo' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, vinculo: data });
}

/** DELETE → desvincula un módulo del maestro. Body o query: { modulo }. */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'sin_db' }, { status: 500 });

  const url = new URL(req.url);
  const body = await req.json().catch(() => ({}));
  const modulo = (body?.modulo as string) ?? url.searchParams.get('modulo');
  if (!modulo) return NextResponse.json({ error: 'falta_modulo' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  if (!(await esDueno(sb, id, user.id))) return NextResponse.json({ error: 'no_encontrado' }, { status: 404 });

  const { error } = await sb
    .from('proyecto_maestro_vinculos')
    .delete()
    .eq('maestro_id', id)
    .eq('modulo', modulo);

  if (error) return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
