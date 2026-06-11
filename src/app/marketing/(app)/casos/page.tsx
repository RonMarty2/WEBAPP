'use client';

/**
 * Galería de casos de Marketing.
 * 5 planes con buyer personas + mix + presupuesto + calendario + KPIs.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CASOS_MARKETING } from '@/lib/casos/marketing';
import type { DificultadCaso } from '@/lib/casos/types';

const DIFICULTAD_META: Record<DificultadCaso, { label: string; cls: string }> = {
  basico:     { label: 'Básico',     cls: 'bg-emerald-100 text-emerald-800' },
  intermedio: { label: 'Intermedio', cls: 'bg-amber-100 text-amber-800' },
  avanzado:   { label: 'Avanzado',   cls: 'bg-rose-100 text-rose-800' },
};

export default function GaleriaCasosMarketing() {
  const [filtroPresupuesto, setFiltroPresupuesto] = useState<string>('');

  const filtrados = useMemo(() => {
    return CASOS_MARKETING.filter((c) => {
      if (!filtroPresupuesto) return true;
      const total = c.presupuesto.total_bs_mes;
      if (filtroPresupuesto === 'micro')   return total < 2000;
      if (filtroPresupuesto === 'pequeno') return total >= 2000 && total < 5000;
      if (filtroPresupuesto === 'mediano') return total >= 5000;
      return true;
    });
  }, [filtroPresupuesto]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <Link href="/marketing" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        ← Volver a Marketing
      </Link>

      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">Casos bolivianos pre-resueltos</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Aprende de 5 planes de marketing reales</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Cada caso es un plan completo: 2 buyer personas, mix 4P o 7P, presupuesto
          desglosado, calendario editorial y KPIs. Hay desde Bs 1.500/mes hasta
          Bs 8.000/mes — encuentra el caso con presupuesto similar al tuyo.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filtrar por presupuesto</span>
          <select
            value={filtroPresupuesto}
            onChange={(e) => setFiltroPresupuesto(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
            aria-label="Presupuesto mensual"
          >
            <option value="">Todos</option>
            <option value="micro">Micro (&lt; Bs 2.000/mes)</option>
            <option value="pequeno">Pequeño (Bs 2.000 a 5.000)</option>
            <option value="mediano">Mediano (≥ Bs 5.000)</option>
          </select>
          <span className="ml-auto text-xs text-slate-500">{filtrados.length} de {CASOS_MARKETING.length} casos</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtrados.map((c) => {
          const dif = DIFICULTAD_META[c.dificultad];
          return (
            <Link
              key={c.slug}
              href={`/marketing/casos/${c.slug}`}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-rose-50 text-3xl">
                  {c.emoji ?? '📣'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-slate-900">{c.titulo}</h3>
                  <p className="text-xs text-slate-500">{c.emprendedor.nombre} · {c.zona}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${dif.cls}`}>{dif.label}</span>
              </div>

              <p className="text-sm leading-relaxed text-slate-700">{c.tagline}</p>

              <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3">
                <Stat label="Inversión/mes" valor={`Bs ${c.presupuesto.total_bs_mes.toLocaleString('es-BO')}`} />
                <Stat label="ROAS" valor={`${c.presupuesto.roas_proyectado.toFixed(1)}x`} />
                <Stat label="Personas" valor={String(c.buyer_personas.length)} />
              </div>

              <div className="flex flex-wrap gap-1">
                {c.tags.slice(0, 4).map((t) => (
                  <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{t}</span>
                ))}
              </div>

              <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-rose-700">
                Explorar el plan →
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
      <p className="mt-0.5 text-sm font-bold text-slate-900">{valor}</p>
    </div>
  );
}
