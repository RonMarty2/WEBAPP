import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';

/**
 * /api/mercados/proyectos
 *   GET  → lista las investigaciones del usuario actual.
 *   POST → crea una nueva investigación { titulo }.
 * Login único: usa la sesión de webapp.
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
  const { data, error } = await sb
    .from('mercados_proyectos')
    .select('*')
    .eq('estudiante_id', user.id)
    .order('actualizado_en', { ascending: false });

  if (error) return NextResponse.json({ proyectos: [] });
  return NextResponse.json({ proyectos: data ?? [] });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'supabase_not_configured' }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const titulo = (body?.titulo as string | undefined)?.trim();
  if (!titulo) {
    return NextResponse.json({ error: 'falta_titulo' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;

  // Asegurar que el perfil exista (auto-onboarding por si entra directo aquí)
  await sb
    .from('mercados_perfiles')
    .upsert(
      {
        id: user.id,
        nombre: (user.name ?? user.email.split('@')[0]).split(/\s+/)[0],
        email: user.email,
      },
      { onConflict: 'id' }
    );

  const { data, error } = await sb
    .from('mercados_proyectos')
    .insert({ estudiante_id: user.id, titulo, estado: 'diseno' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, proyecto: data });
}
