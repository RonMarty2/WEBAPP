'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CASOS_DEFENSA } from '@/lib/casos/defensa';
import type { DificultadCaso } from '@/lib/casos/types';

const DIFICULTAD_META: Record<DificultadCaso, { label: string; cls: string }> = {
  basico:     { label: 'Básico',     cls: 'bg-emerald-100 text-emerald-800' },
  intermedio: { label: 'Intermedio', cls: 'bg-amber-100 text-amber-800' },
  avanzado:   { label: 'Avanzado',   cls: 'bg-rose-100 text-rose-800' },
};

export default function GaleriaCasosDefensa() {
  const [filtroUniversidad, setFiltroUniversidad] = useState<string>('');

  const universidades = Array.from(new Set(CASOS_DEFENSA.map((c) => c.proyecto.universidad))).sort();

  const filtrados = useMemo(() => {
    return CASOS_DEFENSA.filter((c) => !filtroUniversidad || c.proyecto.universidad === filtroUniversidad);
  }, [filtroUniversidad]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <Link href="/defensa" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        ← Volver
      </Link>

      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Casos bolivianos pre-resueltos</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">5 defensas reales con tribunal en vivo</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Cada caso es una defensa completa: datos del proyecto, 18 preguntas
          tribunal cubriendo las 7 categorías (problema/metodología/marco teórico/
          resultados/conclusiones/viabilidad/personal), respuestas modelo, puntos
          débiles + cómo manejarlos y fortalezas + cómo resaltarlas.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filtrar por universidad</span>
          <select
            value={filtroUniversidad}
            onChange={(e) => setFiltroUniversidad(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
          >
            <option value="">Todas</option>
            {universidades.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <span className="ml-auto text-xs text-slate-500">{filtrados.length} de {CASOS_DEFENSA.length} casos</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtrados.map((c) => {
          const dif = DIFICULTAD_META[c.dificultad];
          return (
            <Link
              key={c.slug}
              href={`/defensa/casos/${c.slug}`}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-3xl">
                  {c.emoji ?? '🎓'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-slate-900">{c.titulo}</h3>
                  <p className="text-xs text-slate-500">{c.proyecto.universidad} · {c.proyecto.carrera}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${dif.cls}`}>{dif.label}</span>
              </div>

              <p className="text-sm leading-relaxed text-slate-700">{c.tagline}</p>

              <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3">
                <Stat label="Modalidad" valor={c.proyecto.modalidad} />
                <Stat label="Preguntas" valor={String(c.preguntas.length)} />
                <Stat label="Año" valor={String(c.proyecto.ano)} />
              </div>

              <div className="flex flex-wrap gap-1">
                {c.tags.slice(0, 4).map((t) => (
                  <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{t}</span>
                ))}
              </div>

              <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-indigo-700">
                Ver defensa completa →
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
