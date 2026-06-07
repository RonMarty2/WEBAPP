import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';

/**
 * GET /api/maestro/disponibles
 * Lista los proyectos del usuario en cada módulo, para poder vincularlos a un
 * proyecto maestro. Devuelve { disponibles: { <modulo>: [{ id, titulo }] } }.
 */

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// modulo → tabla. Todas usan estudiante_id + titulo.
const TABLAS: Array<{ modulo: string; tabla: string }> = [
  { modulo: 'idea', tabla: 'idea_proyectos' },
  { modulo: 'mercados', tabla: 'mercados_proyectos' },
  { modulo: 'estrategia', tabla: 'estrategia_proyectos' },
  { modulo: 'marketing', tabla: 'marketing_planes' },
  { modulo: 'organizacion', tabla: 'organizacion_proyectos' },
  { modulo: 'finanzas', tabla: 'finanzas_proyectos' },
  { modulo: 'defensa', tabla: 'defensa_proyectos' },
];

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ disponibles: {} });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  const disponibles: Record<string, Array<{ id: string; titulo: string }>> = {};

  for (const { modulo, tabla } of TABLAS) {
    try {
      const { data, error } = await sb
        .from(tabla)
        .select('id, titulo')
        .eq('estudiante_id', user.id)
        .order('actualizado_en', { ascending: false });
      disponibles[modulo] = error ? [] : (data ?? []);
    } catch {
      disponibles[modulo] = [];
    }
  }

  return NextResponse.json({ disponibles });
}
