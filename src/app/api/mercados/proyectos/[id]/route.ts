import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';

/**
 * /api/mercados/proyectos/[id]
 *   GET   → devuelve un proyecto (solo si es del usuario).
 *   PATCH → actualiza campos del proyecto { ...campos }.
 *   DELETE → elimina el proyecto.
 */

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// Campos que el cliente puede actualizar (whitelist defensiva).
const CAMPOS_EDITABLES = new Set([
  'titulo',
  'tipo_estudio',
  'objetivo_general',
  'objetivos_especificos',
  'hipotesis',
  'variables',
  'departamento',
  'municipio',
  'zona',
  'universo',
  'nivel_confianza',
  'margen_error',
  'tipo_muestreo',
  'tamano_muestra',
  'estado',
]);

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
  const { data, error } = await sb
    .from('mercados_proyectos')
    .select('*')
    .eq('id', id)
    .eq('estudiante_id', user.id)
    .maybeSingle();

  if (error || !data) return NextResponse.json({ error: 'no_encontrado' }, { status: 404 });
  return NextResponse.json({ proyecto: data });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'sin_db' }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, unknown> = { actualizado_en: new Date().toISOString() };
  for (const [k, v] of Object.entries(body)) {
    if (CAMPOS_EDITABLES.has(k)) updates[k] = v;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  const { data, error } = await sb
    .from('mercados_proyectos')
    .update(updates)
    .eq('id', id)
    .eq('estudiante_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, proyecto: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'sin_db' }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  const { error } = await sb
    .from('mercados_proyectos')
    .delete()
    .eq('id', id)
    .eq('estudiante_id', user.id);

  if (error) return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
