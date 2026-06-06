import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE, isAdmin } from '@/lib/auth';
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';

/**
 * GET /api/mercados/perfil
 *
 * Login único: lee la sesión de webapp (cookie lab_session) y devuelve/crea
 * el perfil del módulo Mercados. Auto-sync de rol por email en cada llamada
 * (mismo patrón que /api/finanzas/perfil).
 *
 * El super-admin (isAdmin por email) entra siempre como docente + es_admin.
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;

  const esSuperAdmin = isAdmin(user.email);
  const rolEsperado: 'docente' | 'estudiante' =
    esSuperAdmin || user.role === 'docente' || user.role === 'admin'
      ? 'docente'
      : 'estudiante';
  const esAdminEsperado = esSuperAdmin || user.role === 'admin';

  // 1) Buscar perfil existente
  const { data: existing, error: errSelect } = await sb
    .from('mercados_perfiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (errSelect) {
    return NextResponse.json(
      { error: 'db_select_error', detail: errSelect.message },
      { status: 500 }
    );
  }

  if (existing) {
    const necesitaUpdate =
      existing.rol !== rolEsperado || existing.es_admin !== esAdminEsperado;

    if (necesitaUpdate) {
      const { data: updated, error: errUpdate } = await sb
        .from('mercados_perfiles')
        .update({ rol: rolEsperado, es_admin: esAdminEsperado })
        .eq('id', user.id)
        .select()
        .single();
      if (!errUpdate) {
        return NextResponse.json({ user, perfil: updated });
      }
    }
    return NextResponse.json({ user, perfil: existing });
  }

  // 2) No existe → crear con datos de webapp
  const nombreCompleto = user.name ?? user.email.split('@')[0];
  const partes = nombreCompleto.trim().split(/\s+/);
  const nombre = partes[0] ?? 'Usuario';
  const apellido = partes.slice(1).join(' ') || '—';

  const nuevoPerfil = {
    id: user.id,
    nombre,
    apellido,
    rol: rolEsperado,
    email: user.email,
    universidad: null as string | null,
    es_admin: esAdminEsperado,
  };

  const { data: created, error: errInsert } = await sb
    .from('mercados_perfiles')
    .insert(nuevoPerfil)
    .select()
    .single();

  if (errInsert) {
    return NextResponse.json(
      { error: 'db_insert_error', detail: errInsert.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ user, perfil: created });
}
