'use client';

/**
 * Galería de casos bolivianos del módulo Mercados.
 *
 * Cinco estudios completos con diseño + muestreo + encuesta + resultados
 * para que el estudiante vea CÓMO se hace una investigación real antes
 * de armar la propia.
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
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
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Casos bolivianos pre-resueltos</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Aprende de 5 investigaciones reales</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Cada caso es un estudio de mercado con su pregunta de investigación,
          diseño metodológico, muestra calculada, encuesta aplicada, resultados
          analizados y recomendación final. Antes de armar el tuyo, mira cómo
          se ven los datos reales.
        </p>
      </header>

      {/* Filtros */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filtrar</span>
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
          <span className="ml-auto text-xs text-slate-500">
            {filtrados.length} de {CASOS_MERCADOS.length} casos
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filtrados.map((c) => {
          const dif = DIFICULTAD_META[c.dificultad];
          return (
            <Link
              key={c.slug}
              href={`/ecosistema/universidad/mercados/casos/${c.slug}`}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-sky-50 text-3xl">
                  {c.emoji ?? '📊'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-slate-900">{c.titulo}</h3>
                  <p className="text-xs text-slate-500">{c.emprendedor.nombre} · {c.zona}</p>
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

              <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-sky-700">
                Explorar el estudio →
              </span>
            </Link>
          );
        })}
      </div>

      {filtrados.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm font-medium text-slate-700">Ningún caso coincide con esos filtros.</p>
          <button
            onClick={() => { setFiltroTipo(''); setFiltroEnfoque(''); }}
            className="mt-2 text-sm font-medium text-sky-700 hover:underline"
          >
            Limpiar filtros
          </button>
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
