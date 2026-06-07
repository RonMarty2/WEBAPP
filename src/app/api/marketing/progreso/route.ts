import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';

/** Progreso de la Academia de Marketing. GET lista, POST registra { claseSlug, quizScore }. */

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ progreso: [] });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  const { data, error } = await sb.from('marketing_progreso_clases').select('*').eq('estudiante_id', user.id);
  if (error) return NextResponse.json({ progreso: [] });
  return NextResponse.json({ progreso: data ?? [] });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'supabase_not_configured' }, { status: 500 });

  const body = await req.json().catch(() => null);
  const claseSlug = body?.claseSlug as string | undefined;
  const quizScore = Number(body?.quizScore ?? 0);
  if (!claseSlug) return NextResponse.json({ error: 'falta_clase_slug' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  await sb.from('marketing_perfiles').upsert(
    { id: user.id, nombre: (user.name ?? user.email.split('@')[0]).split(/\s+/)[0], email: user.email },
    { onConflict: 'id' }
  );
  const { data, error } = await sb
    .from('marketing_progreso_clases')
    .upsert(
      { estudiante_id: user.id, clase_slug: claseSlug, completada: true, quiz_score: quizScore, actualizado_en: new Date().toISOString() },
      { onConflict: 'estudiante_id,clase_slug' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, progreso: data });
}
