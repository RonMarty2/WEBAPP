import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE, isAdmin } from '@/lib/auth';
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';

/**
 * GET /api/estrategia/perfil — login único (patrón Finanzas/Mercados).
 * Crea/sincroniza el perfil del módulo desde la sesión de webapp.
 * Super-admin por email → docente + es_admin.
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'no_session' }, { status: 401 });

  const user = await verifySessionToken(token);
  if (!user) return NextResponse.json({ error: 'invalid_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'supabase_not_configured' }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;

  const esSuperAdmin = isAdmin(user.email);
  const rolEsperado: 'docente' | 'estudiante' =
    esSuperAdmin || user.role === 'docente' || user.role === 'admin' ? 'docente' : 'estudiante';
  const esAdminEsperado = esSuperAdmin || user.role === 'admin';

  const { data: existing } = await sb
    .from('estrategia_perfiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (existing) {
    if (existing.rol !== rolEsperado || existing.es_admin !== esAdminEsperado) {
      const { data: updated } = await sb
        .from('estrategia_perfiles')
        .update({ rol: rolEsperado, es_admin: esAdminEsperado })
        .eq('id', user.id)
        .select()
        .single();
      if (updated) return NextResponse.json({ user, perfil: updated });
    }
    return NextResponse.json({ user, perfil: existing });
  }

  const nombreCompleto = user.name ?? user.email.split('@')[0];
  const partes = nombreCompleto.trim().split(/\s+/);
  const { data: created, error } = await sb
    .from('estrategia_perfiles')
    .insert({
      id: user.id,
      nombre: partes[0] ?? 'Usuario',
      apellido: partes.slice(1).join(' ') || '—',
      rol: rolEsperado,
      email: user.email,
      universidad: null,
      es_admin: esAdminEsperado,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'db_insert_error', detail: error.message }, { status: 500 });
  return NextResponse.json({ user, perfil: created });
}
