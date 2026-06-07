import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';

/**
 * /api/maestro/[id]
 *   GET    → un proyecto maestro con sus vínculos.
 *   PATCH  → edita campos del maestro (whitelist).
 *   DELETE → elimina (cascade borra vínculos).
 */

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

const CAMPOS = new Set([
  'titulo', 'tipo_negocio', 'sector', 'departamento', 'municipio', 'zona',
  'descripcion', 'universidad', 'modalidad', 'documento',
]);

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

  const { data: vinculos } = await sb
    .from('proyecto_maestro_vinculos')
    .select('*')
    .eq('maestro_id', id);

  return NextResponse.json({ maestro, vinculos: vinculos ?? [] });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'sin_db' }, { status: 500 });

  const body = await req.json().catch(() => ({}));

  // Límite duro de tamaño: 2 MB del documento JSONB. Un proyecto de grado
  // realista cabe en ~200 KB; 2 MB es 10x ese límite. Sin esto, un bug o
  // ataque podría meter MB en JSONB y degradar Supabase.
  if (body?.documento) {
    const bytes = Buffer.byteLength(JSON.stringify(body.documento), 'utf8');
    if (bytes > 2_000_000) {
      return NextResponse.json(
        { error: 'documento_demasiado_grande', detail: `Máximo 2 MB, recibido ${(bytes / 1_000_000).toFixed(2)} MB` },
        { status: 413 },
      );
    }
  }

  const updates: Record<string, unknown> = { actualizado_en: new Date().toISOString() };
  for (const [k, v] of Object.entries(body)) if (CAMPOS.has(k)) updates[k] = v;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  const { data, error } = await sb
    .from('proyecto_maestro')
    .update(updates)
    .eq('id', id)
    .eq('estudiante_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, maestro: data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'sin_db' }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  const { error } = await sb
    .from('proyecto_maestro')
    .delete()
    .eq('id', id)
    .eq('estudiante_id', user.id);

  if (error) return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
