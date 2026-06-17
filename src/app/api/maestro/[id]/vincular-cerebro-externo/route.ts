import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';

/**
 * POST /api/maestro/[id]/vincular-cerebro-externo
 *
 * Vincula un proyecto de un cerebro externo (simuladorPRO, MIE, etc.) al
 * Proyecto Maestro. Llama al endpoint export-artifact del cerebro, guarda
 * el artefacto como caché en WEBAPP y lo deja disponible para el contexto
 * cruzado y la generación del documento.
 *
 * Body:
 *   {
 *     cerebroId:  "simuladorPRO",          // CerebroId del contrato C0
 *     projectId:  "uuid-del-proyecto",     // id dentro del cerebro
 *   }
 *
 * GET /api/maestro/[id]/vincular-cerebro-externo
 *   → lista los cerebros externos vinculados al maestro
 */

// URLs y claves de cada cerebro externo (configurar en .env.local / Vercel)
const CEREBRO_CONFIG: Record<string, { url: string; apiKey: string }> = {
  simuladorPRO: {
    url: process.env.SIMULADOR_PRO_ARTIFACT_URL ?? '',
    apiKey: process.env.SIMULADOR_PRO_API_KEY ?? '',
  },
  'market-intelligence-engine': {
    url: process.env.MIE_ARTIFACT_URL ?? '',
    apiKey: process.env.MIE_API_KEY ?? '',
  },
  // Agregar los demás cerebros aquí cuando implementen el endpoint
};

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function esDueno(sb: any, maestroId: string, userId: string) {
  const { data } = await sb
    .from('proyecto_maestro')
    .select('id')
    .eq('id', maestroId)
    .eq('estudiante_id', userId)
    .maybeSingle();
  return !!data;
}

// ── GET — lista cerebros vinculados ────────────────────────────────────────

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ cerebros: [] });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  if (!(await esDueno(sb, id, user.id))) {
    return NextResponse.json({ error: 'no_autorizado' }, { status: 403 });
  }

  const { data } = await sb
    .from('proyecto_maestro_cerebros')
    .select('cerebro_id, project_id, titulo, resumen, key_metrics, feeds_sections, status, completeness_pct, artifact_fetched_at')
    .eq('maestro_id', id)
    .order('creado_en', { ascending: true });

  return NextResponse.json({ cerebros: data ?? [] });
}

// ── POST — vincular cerebro externo ───────────────────────────────────────

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: maestroId } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'sin_db' }, { status: 500 });

  const body = await req.json().catch(() => null);
  const cerebroId = (body?.cerebroId as string | undefined)?.trim();
  const projectId = (body?.projectId as string | undefined)?.trim();

  if (!cerebroId || !projectId) {
    return NextResponse.json({ error: 'faltan_campos', detail: 'cerebroId y projectId son requeridos' }, { status: 400 });
  }

  const config = CEREBRO_CONFIG[cerebroId];
  if (!config) {
    return NextResponse.json({ error: 'cerebro_no_soportado', detail: `El cerebro '${cerebroId}' no está configurado en WEBAPP` }, { status: 400 });
  }
  if (!config.url) {
    return NextResponse.json({ error: 'cerebro_no_configurado', detail: `Falta la variable de entorno para '${cerebroId}'` }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;
  if (!(await esDueno(sb, maestroId, user.id))) {
    return NextResponse.json({ error: 'no_autorizado' }, { status: 403 });
  }

  // ── Llamar al cerebro externo para obtener el artefacto ────────────────
  let artifact: Record<string, unknown>;
  try {
    const url = new URL(config.url);
    url.searchParams.set('email', user.email);
    url.searchParams.set('projectId', projectId);

    const resp = await fetch(url.toString(), {
      headers: { 'X-Webapp-Key': config.apiKey },
      signal: AbortSignal.timeout(15_000),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'cerebro_error', detail: err.error ?? `HTTP ${resp.status} desde ${cerebroId}` },
        { status: 502 }
      );
    }

    artifact = await resp.json();
  } catch (e) {
    return NextResponse.json(
      { error: 'cerebro_inaccesible', detail: `No se pudo conectar a ${cerebroId}: ${(e as Error).message}` },
      { status: 502 }
    );
  }

  // ── Guardar / actualizar el artefacto en la DB de WEBAPP ───────────────
  const fila = {
    maestro_id: maestroId,
    cerebro_id: cerebroId,
    project_id: projectId,
    titulo: artifact.titulo ?? '',
    resumen: artifact.resumen ?? null,
    key_metrics: artifact.key_metrics ?? [],
    feeds_sections: artifact.feeds_sections ?? [],
    content: artifact.content ?? {},
    status: artifact.status ?? 'en_progreso',
    completeness_pct: artifact.completeness_pct ?? 0,
    artifact_fetched_at: new Date().toISOString(),
    artifact_updated_at: artifact.updated_at ?? null,
  };

  const { data, error } = await sb
    .from('proyecto_maestro_cerebros')
    .upsert(fila, { onConflict: 'maestro_id,cerebro_id' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, cerebro: data, artifact });
}
