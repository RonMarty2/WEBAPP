import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';

/**
 * /api/mercados/proyectos/[id]/encuesta
 *
 * GET → devuelve la encuesta del proyecto (la crea vacía si no existe) + preguntas.
 * PUT → guarda la encuesta completa { titulo, descripcion, preguntas[] }.
 *       Estrategia simple: reemplaza todas las preguntas (borra + reinserta).
 *
 * Valida que el proyecto pertenezca al usuario de la sesión de webapp.
 */

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function proyectoDelUsuario(sb: any, proyectoId: string, userId: string) {
  const { data } = await sb
    .from('mercados_proyectos')
    .select('id')
    .eq('id', proyectoId)
    .eq('estudiante_id', userId)
    .maybeSingle();
  return !!data;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'sin_db' }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  if (!(await proyectoDelUsuario(sb, id, user.id))) {
    return NextResponse.json({ error: 'no_encontrado' }, { status: 404 });
  }

  // Buscar encuesta existente
  let { data: encuesta } = await sb
    .from('mercados_encuestas')
    .select('*')
    .eq('proyecto_id', id)
    .maybeSingle();

  // Crear vacía si no existe
  if (!encuesta) {
    const { data: creada } = await sb
      .from('mercados_encuestas')
      .insert({ proyecto_id: id, titulo: 'Mi encuesta' })
      .select()
      .single();
    encuesta = creada;
  }

  const { data: preguntas } = await sb
    .from('mercados_preguntas')
    .select('*')
    .eq('encuesta_id', encuesta.id)
    .order('orden', { ascending: true });

  return NextResponse.json({ encuesta, preguntas: preguntas ?? [] });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'sin_db' }, { status: 500 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'body_invalido' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  if (!(await proyectoDelUsuario(sb, id, user.id))) {
    return NextResponse.json({ error: 'no_encontrado' }, { status: 404 });
  }

  // Asegurar encuesta
  let { data: encuesta } = await sb
    .from('mercados_encuestas')
    .select('*')
    .eq('proyecto_id', id)
    .maybeSingle();
  if (!encuesta) {
    const { data: creada } = await sb
      .from('mercados_encuestas')
      .insert({ proyecto_id: id, titulo: body.titulo ?? 'Mi encuesta' })
      .select()
      .single();
    encuesta = creada;
  }

  // Actualizar título/descripción
  await sb
    .from('mercados_encuestas')
    .update({
      titulo: body.titulo ?? encuesta.titulo,
      descripcion: body.descripcion ?? null,
    })
    .eq('id', encuesta.id);

  // Reemplazar preguntas: borrar e insertar de nuevo
  await sb.from('mercados_preguntas').delete().eq('encuesta_id', encuesta.id);

  const preguntas = Array.isArray(body.preguntas) ? body.preguntas : [];
  if (preguntas.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filas = preguntas.map((p: any, i: number) => ({
      encuesta_id: encuesta.id,
      orden: i,
      texto: String(p.texto ?? ''),
      tipo: String(p.tipo ?? 'opcion_unica'),
      opciones: Array.isArray(p.opciones) ? p.opciones : [],
      obligatoria: p.obligatoria !== false,
    }));
    await sb.from('mercados_preguntas').insert(filas);
  }

  // Si el proyecto estaba en 'encuesta' o antes, dejarlo listo para recolección
  await sb
    .from('mercados_proyectos')
    .update({ estado: 'encuesta', actualizado_en: new Date().toISOString() })
    .eq('id', id)
    .in('estado', ['diseno', 'muestreo', 'encuesta']);

  const { data: preguntasGuardadas } = await sb
    .from('mercados_preguntas')
    .select('*')
    .eq('encuesta_id', encuesta.id)
    .order('orden', { ascending: true });

  return NextResponse.json({ ok: true, encuesta, preguntas: preguntasGuardadas ?? [] });
}
