/**
 * Construye el CONTEXTO CRUZADO de un proyecto maestro: reúne lo que el
 * estudiante hizo en cada módulo vinculado (estrategia, mercados, finanzas…)
 * en un objeto y un texto que el servicio de IA usará como contexto.
 *
 * Solo se usa en server (lee Supabase con service role). Si no hay proyecto
 * maestro, el contexto es null y la IA trabaja en modo genérico.
 */
import { isSupabaseConfigured, createAdminClient } from '@/lib/supabase';

export interface ContextoMaestro {
  maestro: {
    titulo: string;
    tipo_negocio: string | null;
    sector: string | null;
    ubicacion: string | null;
    descripcion: string | null;
    universidad: string | null;
    modalidad: string | null;
  };
  // Resúmenes por módulo vinculado (módulos internos de WEBAPP).
  modulos: Record<string, unknown>;
  // Artefactos de cerebros externos (simuladorPRO, MIE, etc.)
  // Clave: cerebroId ('simuladorPRO', 'market-intelligence-engine', ...)
  cerebros: Record<string, {
    titulo: string;
    resumen: string | null;
    key_metrics: Array<{ label: string; value: string | number; unit?: string }>;
    feeds_sections: string[];
    content: Record<string, unknown>;
    status: string;
    completeness_pct: number;
    artifact_fetched_at: string;
  }>;
}

/**
 * Devuelve el contexto cruzado para un maestroId, o null si no existe.
 * verificaUserId: si se pasa, valida que el maestro sea de ese usuario.
 */
export async function construirContextoMaestro(
  maestroId: string,
  verificaUserId?: string
): Promise<ContextoMaestro | null> {
  if (!isSupabaseConfigured()) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createAdminClient() as any;

  const { data: maestro } = await sb
    .from('proyecto_maestro')
    .select('*')
    .eq('id', maestroId)
    .maybeSingle();
  if (!maestro) return null;
  if (verificaUserId && maestro.estudiante_id !== verificaUserId) return null;

  const ubicacion = [maestro.zona, maestro.municipio, maestro.departamento].filter(Boolean).join(', ') || null;

  const ctx: ContextoMaestro = {
    maestro: {
      titulo: maestro.titulo,
      tipo_negocio: maestro.tipo_negocio,
      sector: maestro.sector,
      ubicacion,
      descripcion: maestro.descripcion,
      universidad: maestro.universidad,
      modalidad: maestro.modalidad,
    },
    modulos: {},
    cerebros: {},
  };

  // Vínculos a módulos
  const { data: vinculos } = await sb
    .from('proyecto_maestro_vinculos')
    .select('modulo, ref_id')
    .eq('maestro_id', maestroId);

  for (const v of vinculos ?? []) {
    try {
      if (v.modulo === 'estrategia') {
        const { data } = await sb.from('estrategia_proyectos').select('titulo, sector, estado, pestel, porter, foda, mcpe').eq('id', v.ref_id).maybeSingle();
        if (data) ctx.modulos.estrategia = data;
      } else if (v.modulo === 'mercados') {
        const { data } = await sb.from('mercados_proyectos').select('titulo, tipo_estudio, objetivo_general, universo, tamano_muestra, estado').eq('id', v.ref_id).maybeSingle();
        if (data) ctx.modulos.mercados = data;
      } else if (v.modulo === 'finanzas') {
        const { data } = await sb.from('finanzas_proyectos').select('*').eq('id', v.ref_id).maybeSingle();
        if (data) ctx.modulos.finanzas = data;
      } else if (v.modulo === 'marketing') {
        const { data } = await sb.from('marketing_planes').select('titulo, marca, sector, buyer_persona, mezcla, presupuesto, estado').eq('id', v.ref_id).maybeSingle();
        if (data) ctx.modulos.marketing = data;
      } else if (v.modulo === 'organizacion') {
        const { data } = await sb.from('organizacion_proyectos').select('titulo, empresa, sector, organigrama, rrhh, legal, tecnico, branding, estado').eq('id', v.ref_id).maybeSingle();
        if (data) ctx.modulos.organizacion = data;
      } else if (v.modulo === 'idea') {
        const { data } = await sb.from('idea_proyectos').select('titulo, idea, sector, lean_canvas, propuesta_valor, scorecard, estado').eq('id', v.ref_id).maybeSingle();
        if (data) ctx.modulos.idea = data;
      } else if (v.modulo === 'defensa') {
        const { data } = await sb.from('defensa_proyectos').select('titulo, tema, carrera, preguntas, simulacro, estado').eq('id', v.ref_id).maybeSingle();
        if (data) ctx.modulos.defensa = data;
      }
    } catch {
      // módulo sin tabla todavía: lo ignoramos
    }
  }

  // ── Cerebros externos vinculados ─────────────────────────────────────────
  const { data: cerebros } = await sb
    .from('proyecto_maestro_cerebros')
    .select('cerebro_id, titulo, resumen, key_metrics, feeds_sections, content, status, completeness_pct, artifact_fetched_at')
    .eq('maestro_id', maestroId);

  for (const c of cerebros ?? []) {
    ctx.cerebros[c.cerebro_id] = {
      titulo: c.titulo,
      resumen: c.resumen,
      key_metrics: c.key_metrics ?? [],
      feeds_sections: c.feeds_sections ?? [],
      content: c.content ?? {},
      status: c.status,
      completeness_pct: c.completeness_pct,
      artifact_fetched_at: c.artifact_fetched_at,
    };
  }

  return ctx;
}

/** Convierte el contexto en texto plano para inyectar en un prompt de IA. */
export function contextoATexto(ctx: ContextoMaestro | null): string {
  if (!ctx) return 'Sin proyecto maestro: trabaja de forma genérica.';
  const m = ctx.maestro;
  const L: string[] = [];
  L.push(`Proyecto: ${m.titulo}.`);
  if (m.tipo_negocio) L.push(`Tipo de negocio: ${m.tipo_negocio}.`);
  if (m.sector) L.push(`Sector: ${m.sector}.`);
  if (m.ubicacion) L.push(`Ubicación: ${m.ubicacion} (Bolivia).`);
  if (m.descripcion) L.push(`Descripción: ${m.descripcion}.`);
  if (m.modalidad) L.push(`Modalidad académica: ${m.modalidad}.`);

  const mods = Object.keys(ctx.modulos);
  if (mods.length > 0) {
    L.push('Trabajo previo en módulos internos (úsalo para dar coherencia):');
    L.push(JSON.stringify(ctx.modulos));
  }

  const cerebs = Object.entries(ctx.cerebros);
  if (cerebs.length > 0) {
    L.push('Datos reales del estudiante desde cerebros especializados:');
    for (const [cerebroId, c] of cerebs) {
      L.push(`[${cerebroId}] ${c.titulo} (${c.status}, ${c.completeness_pct}% completo)`);
      if (c.resumen) L.push(`  Resumen: ${c.resumen}`);
      if (c.key_metrics.length > 0) {
        const metricas = c.key_metrics.map(m => `${m.label}: ${m.value}${m.unit ? ' ' + m.unit : ''}`).join(', ');
        L.push(`  Métricas clave: ${metricas}`);
      }
    }
  }

  return L.join('\n');
}
