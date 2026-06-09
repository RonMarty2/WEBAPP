'use client';

/**
 * Galería de casos de Estrategia Empresarial.
 * 5 análisis estratégicos completos con PESTEL + Porter + MPC + FODA +
 * FODA cruzado + matriz de nivel 3 + MCPE + plan de acción.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CASOS_ESTRATEGIA } from '@/lib/casos/estrategia';
import type { DificultadCaso, MatrizDeNivel3 } from '@/lib/casos/types';

const DIFICULTAD_META: Record<DificultadCaso, { label: string; cls: string }> = {
  basico:     { label: 'Básico',     cls: 'bg-emerald-100 text-emerald-800' },
  intermedio: { label: 'Intermedio', cls: 'bg-amber-100 text-amber-800' },
  avanzado:   { label: 'Avanzado',   cls: 'bg-rose-100 text-rose-800' },
};

export default function GaleriaCasosEstrategia() {
  const [filtroMatriz, setFiltroMatriz] = useState<MatrizDeNivel3 | ''>('');

  const filtrados = useMemo(() => {
    return CASOS_ESTRATEGIA.filter((c) => !filtroMatriz || c.matriz_nivel3.tipo === filtroMatriz);
  }, [filtroMatriz]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <Link href="/ecosistema/universidad/estrategia" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        ← Volver a Estrategia
      </Link>

      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">Casos bolivianos pre-resueltos</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Aprende de 5 análisis estratégicos reales</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Cada caso es un análisis estratégico completo: PESTEL, Porter, MPC,
          FODA cruzado, una matriz de nivel 3 (BCG / Ansoff / PEYEA) y MCPE
          para decidir la mejor estrategia. Mira cómo se aplican las matrices
          a proyectos bolivianos reales antes de armar el tuyo.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filtrar por matriz</span>
          <select
            value={filtroMatriz}
            onChange={(e) => setFiltroMatriz(e.target.value as MatrizDeNivel3 | '')}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
            aria-label="Matriz de nivel 3"
          >
            <option value="">Todas las matrices</option>
            <option value="BCG">BCG (cartera de productos)</option>
            <option value="Ansoff">Ansoff (crecimiento)</option>
            <option value="PEYEA">PEYEA (posición estratégica)</option>
          </select>
          <span className="ml-auto text-xs text-slate-500">{filtrados.length} de {CASOS_ESTRATEGIA.length} casos</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtrados.map((c) => {
          const dif = DIFICULTAD_META[c.dificultad];
          return (
            <Link
              key={c.slug}
              href={`/ecosistema/universidad/estrategia/casos/${c.slug}`}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-violet-50 text-3xl">
                  {c.emoji ?? '🎯'}
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
                <Stat label="Matriz" valor={c.matriz_nivel3.tipo} />
                <Stat label="Posición" valor={c.matriz_nivel3.posicion} />
                <Stat label="Atractivo sector" valor={`${c.porter.atractivo_sector}/5`} />
              </div>

              <div className="flex flex-wrap gap-1">
                {c.tags.slice(0, 4).map((t) => (
                  <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{t}</span>
                ))}
              </div>

              <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-violet-700">
                Explorar el análisis →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-0.5 truncate text-sm font-bold text-slate-900" title={valor}>{valor}</p>
    </div>
  );
}
