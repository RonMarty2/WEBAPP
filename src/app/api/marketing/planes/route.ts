import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';

/**
 * /api/marketing/planes
 *   GET  → lista los planes de marketing del usuario.
 *   POST → crea uno nuevo { titulo, marca?, sector? }.
 * Login único: sesión de webapp.
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
  if (!isSupabaseConfigured()) return NextResponse.json({ planes: [] });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  const { data } = await sb
    .from('marketing_planes')
    .select('id, titulo, marca, sector, estado, creado_en, actualizado_en')
    .eq('estudiante_id', user.id)
    .order('actualizado_en', { ascending: false });

  return NextResponse.json({ planes: data ?? [] });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'sin_db' }, { status: 500 });

  const body = await req.json().catch(() => null);
  const titulo = (body?.titulo as string | undefined)?.trim();
  if (!titulo) return NextResponse.json({ error: 'falta_titulo' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;

  // Auto-onboarding del perfil
  await sb.from('marketing_perfiles').upsert(
    {
      id: user.id,
      nombre: (user.name ?? user.email.split('@')[0]).split(/\s+/)[0],
      email: user.email,
    },
    { onConflict: 'id' }
  );

  const { data, error } = await sb
    .from('marketing_planes')
    .insert({
      estudiante_id: user.id,
      titulo,
      marca: body.marca ?? null,
      sector: body.sector ?? null,
      estado: 'persona',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, plan: data });
}
