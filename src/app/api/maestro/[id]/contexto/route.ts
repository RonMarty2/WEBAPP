import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { construirContextoMaestro, contextoATexto } from '@/lib/maestro/contexto';

/**
 * GET /api/maestro/[id]/contexto
 * Devuelve el contexto cruzado del proyecto maestro (objeto + texto plano),
 * reuniendo lo trabajado en cada módulo vinculado.
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

  const ctx = await construirContextoMaestro(id, user.id);
  if (!ctx) return NextResponse.json({ error: 'no_encontrado' }, { status: 404 });

  return NextResponse.json({ contexto: ctx, texto: contextoATexto(ctx) });
}
