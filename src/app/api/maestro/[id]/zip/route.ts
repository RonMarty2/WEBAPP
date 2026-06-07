import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';
import { armarZipOverleaf } from '@/lib/generador/zip';

/**
 * GET /api/maestro/[id]/zip
 * Devuelve un .zip listo para subir a Overleaf con el documento del maestro,
 * usando la plantilla LaTeX de la universidad detectada (UMSS/UCB/UCATEC/UNIFRANZ)
 * o genérica (article) si no hay match.
 */

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

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

  const secciones = maestro.documento?.secciones ?? [];
  if (!secciones.length) return NextResponse.json({ error: 'sin_documento' }, { status: 400 });

  const nombreEstudiante = (user.name && user.name.trim()) || user.email.split('@')[0];
  const { buffer, filename, plantilla } = await armarZipOverleaf(maestro, secciones, nombreEstudiante);

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(buffer.length),
      'X-Plantilla': plantilla ?? 'generico',
    },
  });
}
