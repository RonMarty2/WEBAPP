import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';

/**
 * GET /api/finanzas/perfil
 *
 * Lee la sesión de webapp (cookie lab_session) y devuelve el perfil del
 * módulo Finanzas para ese usuario. Si el perfil no existe, lo crea
 * automáticamente usando los datos del usuario de webapp.
 *
 * Esto desacopla el módulo Finanzas de Supabase Auth: una vez que el
 * estudiante se logueó en webapp con Google, el módulo /finanzas lo
 * reconoce sin pedir un segundo login.
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: 'no_session' }, { status: 401 });
  }

  const user = await verifySessionToken(token);
  if (!user) {
    return NextResponse.json({ error: 'invalid_session' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'supabase_not_configured' }, { status: 500 });
  }

  // Cast genérico: el cliente Supabase tipado no conoce las tablas finanzas_*
  // (son nuevas), así que las queries se hacen sin tipos estrictos.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;

  // 1) Buscar perfil existente
  const { data: existing, error: errSelect } = await sb
    .from('finanzas_perfiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (errSelect) {
    return NextResponse.json({ error: 'db_select_error', detail: errSelect.message }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json({ user, perfil: existing });
  }

  // 2) No existe → crearlo con datos del usuario de webapp
  const nombreCompleto = user.name ?? user.email.split('@')[0];
  const partes = nombreCompleto.trim().split(/\s+/);
  const nombre = partes[0] ?? 'Usuario';
  const apellido = partes.slice(1).join(' ') || '—';

  const rol: 'docente' | 'estudiante' = user.role === 'docente' ? 'docente' : 'estudiante';
  const esAdmin = user.role === 'admin';

  const nuevoPerfil = {
    id: user.id,
    nombre,
    apellido,
    rol,
    email: user.email,
    universidad: null as string | null,
    es_admin: esAdmin,
  };

  const { data: created, error: errInsert } = await sb
    .from('finanzas_perfiles')
    .insert(nuevoPerfil)
    .select()
    .single();

  if (errInsert) {
    return NextResponse.json({ error: 'db_insert_error', detail: errInsert.message }, { status: 500 });
  }

  return NextResponse.json({ user, perfil: created });
}
