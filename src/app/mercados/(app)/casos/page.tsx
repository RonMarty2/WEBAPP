'use client';

/**
 * Galería de casos bolivianos del módulo Mercados.
 *
 * Cinco estudios completos con diseño + muestreo + encuesta + resultados
 * para que el estudiante vea CÓMO se hace una investigación real antes
 * de armar la propia. Identidad visual del módulo (prefijo mk-, acento sky).
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { CASOS_MERCADOS } from '@/lib/casos/mercados';
import type { DificultadCaso, TipoEstudio, EnfoqueEstudio } from '@/lib/casos/types';

const DIFICULTAD_META: Record<DificultadCaso, { label: string; cls: string }> = {
  basico:     { label: 'Básico',     cls: 'bg-emerald-100 text-emerald-800' },
  intermedio: { label: 'Intermedio', cls: 'bg-amber-100 text-amber-800' },
  avanzado:   { label: 'Avanzado',   cls: 'bg-rose-100 text-rose-800' },
};

const TIPO_LABEL: Record<TipoEstudio, string> = {
  exploratorio: 'Exploratorio',
  descriptivo:  'Descriptivo',
  causal:       'Causal',
};

const ENFOQUE_LABEL: Record<EnfoqueEstudio, string> = {
  cualitativo:  'Cualitativo',
  cuantitativo: 'Cuantitativo',
  mixto:        'Mixto',
};

export default function GaleriaCasosMercados() {
  const [filtroTipo, setFiltroTipo] = useState<TipoEstudio | ''>('');
  const [filtroEnfoque, setFiltroEnfoque] = useState<EnfoqueEstudio | ''>('');

  const filtrados = useMemo(() => {
    return CASOS_MERCADOS.filter((c) => {
      if (filtroTipo && c.diseno.tipo !== filtroTipo) return false;
      if (filtroEnfoque && c.diseno.enfoque !== filtroEnfoque) return false;
      return true;
    });
  }, [filtroTipo, filtroEnfoque]);

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/mercados" className="mk-muted inline-flex items-center gap-1 text-sm hover:opacity-80">
        <ArrowLeft className="h-4 w-4" /> Hub de Mercados
      </Link>

      <header className="mt-4 mb-6">
        <p className="mk-accent-text text-xs font-semibold uppercase tracking-wider">
          Casos bolivianos pre-resueltos
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Aprende de 5 investigaciones reales
        </h1>
        <p className="mk-muted mt-2 max-w-2xl text-sm leading-relaxed">
          Cada caso es un estudio de mercado con su pregunta de investigación,
          diseño metodológico, muestra calculada, encuesta aplicada, resultados
          analizados y recomendación final. Antes de armar el tuyo, mira cómo
          se ven los datos reales.
        </p>
      </header>

      {/* Filtros */}
      <div className="mk-card mb-5 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="mk-muted text-xs font-semibold uppercase tracking-wider">Filtrar</span>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as TipoEstudio | '')}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            aria-label="Tipo de estudio"
          >
            <option value="">Todos los tipos</option>
            <option value="exploratorio">Exploratorio</option>
            <option value="descriptivo">Descriptivo</option>
            <option value="causal">Causal</option>
          </select>
          <select
            value={filtroEnfoque}
            onChange={(e) => setFiltroEnfoque(e.target.value as EnfoqueEstudio | '')}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            aria-label="Enfoque"
          >
            <option value="">Todos los enfoques</option>
            <option value="cuantitativo">Cuantitativo</option>
            <option value="cualitativo">Cualitativo</option>
            <option value="mixto">Mixto</option>
          </select>
          <span className="mk-muted ml-auto text-xs">
            {filtrados.length} de {CASOS_MERCADOS.length} casos
          </span>
        </div>
      </div>

      {/* Cards */}
      {filtrados.length === 0 ? (
        <div className="mk-card p-8 text-center">
          <Sparkles className="mk-muted mx-auto h-8 w-8" />
          <p className="mt-2 text-sm font-medium">Ningún caso coincide con esos filtros.</p>
          <button
            onClick={() => { setFiltroTipo(''); setFiltroEnfoque(''); }}
            className="mk-accent-text mt-3 text-sm font-medium hover:underline"
          >
            Ver todos los casos
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtrados.map((c) => {
            const dif = DIFICULTAD_META[c.dificultad];
            return (
              <Link
                key={c.slug}
                href={`/mercados/casos/${c.slug}`}
                className="mk-card group flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="mk-accent-soft flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl">
                    {c.emoji ?? '📊'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold leading-tight">{c.titulo}</h3>
                    <p className="mk-muted mt-0.5 text-xs">{c.emprendedor.nombre} · {c.zona}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${dif.cls}`}>
                    {dif.label}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-slate-700">{c.tagline}</p>

                <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3">
                  <Stat label="Tipo" valor={TIPO_LABEL[c.diseno.tipo]} />
                  <Stat label="Enfoque" valor={ENFOQUE_LABEL[c.diseno.enfoque]} />
                  <Stat label="n" valor={String(c.muestreo.n_muestra)} />
                </div>

                <div className="flex flex-wrap gap-1">
                  {c.tags.slice(0, 4).map((t) => (
                    <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                      {t}
                    </span>
                  ))}
                </div>

                <span className="mk-accent-text mt-1 inline-flex items-center gap-1 text-sm font-medium">
                  Explorar el estudio <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-900">{valor}</p>
    </div>
  );
}
