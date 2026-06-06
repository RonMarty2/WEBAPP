import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE, isAdmin } from '@/lib/auth';
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';

/**
 * GET /api/finanzas/perfil
 *
 * Lee la sesión de webapp (cookie lab_session) y devuelve/crea el perfil
 * del módulo Finanzas para ese usuario.
 *
 * AUTO-SYNC del rol: cada vez que se llama, sincroniza el rol del perfil
 * con el JWT de webapp:
 *   webapp role 'admin'      → finanzas rol 'docente' + es_admin: true
 *   webapp role 'docente'    → finanzas rol 'docente'
 *   webapp role 'estudiante' → finanzas rol 'estudiante'
 *
 * Esto permite que un usuario que primero entró como estudiante (cuando
 * webapp aún no lo reconocía como admin) se promueva automáticamente la
 * próxima vez sin pasos manuales.
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;

  // Calcular el rol esperado.
  // CRÍTICO: revalidamos admin por email contra HARDCODED_ADMIN_EMAILS +
  // env var ADMIN_EMAILS, NO confiamos en user.role del JWT (puede estar
  // desactualizado si el usuario entró antes de ser promovido).
  const esSuperAdmin = isAdmin(user.email);
  const rolEsperado: 'docente' | 'estudiante' =
    esSuperAdmin || user.role === 'docente' || user.role === 'admin'
      ? 'docente'
      : 'estudiante';
  const esAdminEsperado = esSuperAdmin || user.role === 'admin';

  // 1) Buscar perfil existente
  const { data: existing, error: errSelect } = await sb
    .from('finanzas_perfiles')
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
    // Sincronizar rol y es_admin si el JWT cambió desde el último login
    const necesitaUpdate =
      existing.rol !== rolEsperado || existing.es_admin !== esAdminEsperado;

    if (necesitaUpdate) {
      const { data: updated, error: errUpdate } = await sb
        .from('finanzas_perfiles')
        .update({ rol: rolEsperado, es_admin: esAdminEsperado })
        .eq('id', user.id)
        .select()
        .single();

      if (errUpdate) {
        // Devolver el perfil existente pero con info de debug en headers/body
        return NextResponse.json({
          user,
          perfil: existing,
          debug: {
            update_attempted: true,
            update_error: errUpdate.message,
            rol_esperado: rolEsperado,
            es_admin_esperado: esAdminEsperado,
          },
        });
      }
      return NextResponse.json({ user, perfil: updated, debug: { update_succeeded: true } });
    }

    return NextResponse.json({ user, perfil: existing });
  }

  // 2) No existe → crearlo con datos del usuario de webapp
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
    .from('finanzas_perfiles')
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
