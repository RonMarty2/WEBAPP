import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';
import { documentoALatex, nombreTex } from '@/lib/generador/latex';

/**
 * GET /api/maestro/[id]/latex
 * Devuelve el .tex compilable del documento del proyecto (para Overleaf).
 */

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'sin_db' }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  const { data: maestro } = await sb
    .from('proyecto_maestro')
    .select('*')
    .eq('id', id)
    .eq('estudiante_id', user.id)
    .maybeSingle();

  if (!maestro) return NextResponse.json({ error: 'no_encontrado' }, { status: 404 });

  const secciones = maestro.documento?.secciones ?? [];
  if (!secciones.length) return NextResponse.json({ error: 'sin_documento' }, { status: 400 });

  const tex = documentoALatex(maestro, secciones);
  return NextResponse.json({ tex, filename: nombreTex(maestro.titulo) });
}
