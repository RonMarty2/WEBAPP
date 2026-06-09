'use client';

/**
 * /projects/[id]/simulador-eventos
 *
 * Monta el simulador de eventos sorpresa con el contexto del proyecto
 * REAL del alumno (titulo + idea + sector + segmento). La IA recibe
 * todo ese contexto y los eventos se evaluan contra SU caso concreto,
 * no genericos.
 *
 * Query param ?modulo=idea|marketing|estrategia decide el banco de
 * eventos. Default: 'idea'.
 */

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import SimuladorEventos from '@/components/eventos-sorpresa/SimuladorEventos';
import type { ModuloEvento } from '@/types/evento-sorpresa';

const MODULOS_VALIDOS: ModuloEvento[] = ['idea', 'marketing', 'estrategia'];

interface Proyecto {
  id: string;
  tema_aprobado?: string | null;
  titulo_provisional?: string | null;
  academic_context?: Record<string, unknown>;
}

export default function SimuladorEventosProyectoPage() {
  const params = useParams();
  const router = useRouter();
  const search = useSearchParams();
  const id = (params?.id as string) ?? '';

  const moduloRaw = search?.get('modulo') ?? 'idea';
  const modulo = (MODULOS_VALIDOS.includes(moduloRaw as ModuloEvento)
    ? (moduloRaw as ModuloEvento)
    : 'idea');

  const [cargando, setCargando] = useState(true);
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/projects/${id}`, { credentials: 'include' })
      .then(async (r) => {
        if (r.status === 401) {
          router.replace('/login');
          return null;
        }
        if (!r.ok) {
          setError('No se pudo cargar el proyecto.');
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (cancelled || !data) return;
        setProyecto(data.proyecto ?? data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error inesperado.');
      })
      .finally(() => {
        if (!cancelled) setCargando(false);
      });
    return () => { cancelled = true; };
  }, [id, router]);

  const { titulo, contexto } = useMemo(() => {
    if (!proyecto) return { titulo: '', contexto: '' };
    const t = proyecto.tema_aprobado || proyecto.titulo_provisional || 'Mi proyecto';
    const ctx = (proyecto.academic_context ?? {}) as Record<string, string | undefined>;
    const partes = [
      ctx.idea_base ? `Idea: ${ctx.idea_base}` : '',
      ctx.sector ? `Sector: ${ctx.sector}` : '',
      ctx.segmento ? `Segmento: ${ctx.segmento}` : '',
      ctx.zona ? `Zona: ${ctx.zona}` : '',
      ctx.modalidad ? `Modalidad: ${ctx.modalidad}` : '',
    ].filter(Boolean);
    return {
      titulo: t,
      contexto: partes.join(' · ') || 'Proyecto académico boliviano.',
    };
  }, [proyecto]);

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !proyecto) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-rose-600" />
          <p className="mt-2 text-sm font-semibold text-rose-900">{error ?? 'Proyecto no encontrado'}</p>
          <Link href="/dashboard" className="mt-4 inline-flex items-center gap-1 text-sm text-rose-800 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12 pt-6">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/projects/${id}/workspace`}
            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al workspace
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
            <Sparkles className="h-3.5 w-3.5" />
            Eventos contextualizados a TU proyecto
          </div>
        </div>

        <header className="mb-5 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Simulador de decisiones</p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">{titulo}</h1>
          <p className="mt-2 text-xs text-slate-500">{contexto}</p>
          <p className="mt-3 text-xs text-slate-600">
            Cada turno te lanza un evento sorpresa basado en TU proyecto.
            Eliges una de 3 opciones y la IA evalúa tu decisión con
            consecuencias a corto y largo plazo. Aprende decidiendo en
            lugar de leer.
          </p>
        </header>

        <SimuladorEventos
          modulo={modulo}
          proyectoId={id}
          proyectoTituloExterno={titulo}
          proyectoContexto={contexto}
        />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          <span>Cambiar módulo del simulador:</span>
          {MODULOS_VALIDOS.map((m) => (
            <Link
              key={m}
              href={`/projects/${id}/simulador-eventos?modulo=${m}`}
              className={`rounded-full border px-3 py-1 ${
                m === modulo
                  ? 'border-amber-300 bg-amber-50 font-semibold text-amber-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {m === 'idea' ? '💡 Idea' : m === 'marketing' ? '📣 Marketing' : '🎯 Estrategia'}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
