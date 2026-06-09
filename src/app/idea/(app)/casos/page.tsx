'use client';

/**
 * Galería de casos bolivianos del módulo Idea.
 *
 * Muestra los 5 casos pre-resueltos en cards visuales con filtros
 * básicos (dificultad, rubro) para que el estudiante encuentre el
 * más parecido a su idea.
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MapPin, Briefcase, Sparkles, Filter, X } from 'lucide-react';
import { CASOS_IDEA } from '@/lib/casos/idea';
import type { DificultadCaso } from '@/lib/casos/types';

const DIFICULTAD_META: Record<DificultadCaso, { label: string; cls: string }> = {
  basico:     { label: 'Básico',     cls: 'bg-emerald-100 text-emerald-800' },
  intermedio: { label: 'Intermedio', cls: 'bg-amber-100 text-amber-800' },
  avanzado:   { label: 'Avanzado',   cls: 'bg-rose-100 text-rose-800' },
};

export default function GaleriaCasosIdea() {
  const [filtroDificultad, setFiltroDificultad] = useState<DificultadCaso | ''>('');
  const [filtroRubro, setFiltroRubro] = useState<string>('');

  const rubrosDisponibles = useMemo(() => {
    return Array.from(new Set(CASOS_IDEA.map((c) => c.rubro))).sort();
  }, []);

  const casosFiltrados = useMemo(() => {
    return CASOS_IDEA.filter((c) => {
      if (filtroDificultad && c.dificultad !== filtroDificultad) return false;
      if (filtroRubro && c.rubro !== filtroRubro) return false;
      return true;
    });
  }, [filtroDificultad, filtroRubro]);

  const hayFiltro = filtroDificultad || filtroRubro;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/idea" className="inline-flex items-center gap-1 text-sm idea-muted hover:opacity-80">
        <ArrowLeft className="h-4 w-4" /> Hub de Idea
      </Link>

      <header className="mt-4 mb-6">
        <p className="idea-accent-text text-xs font-semibold uppercase tracking-wider">
          Casos bolivianos pre-resueltos
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Aprende de 5 emprendimientos reales
        </h1>
        <p className="idea-muted mt-2 max-w-2xl text-sm leading-relaxed">
          Cada caso es un emprendimiento boliviano con su Lean Canvas, propuesta
          de valor, hipótesis validadas y scorecard. Explora, compara y usa el
          que más se parezca a tu idea como punto de partida.
        </p>
      </header>

      {/* Filtros */}
      <div className="idea-card mb-5 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 idea-muted" />
            <span className="text-xs font-semibold uppercase tracking-wider idea-muted">Filtros</span>
          </div>

          <select
            value={filtroDificultad}
            onChange={(e) => setFiltroDificultad(e.target.value as DificultadCaso | '')}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            aria-label="Filtrar por dificultad"
          >
            <option value="">Toda dificultad</option>
            <option value="basico">Básico</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>

          <select
            value={filtroRubro}
            onChange={(e) => setFiltroRubro(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            aria-label="Filtrar por rubro"
          >
            <option value="">Todos los rubros</option>
            {rubrosDisponibles.map((r) => (<option key={r} value={r}>{r}</option>))}
          </select>

          {hayFiltro && (
            <button
              onClick={() => { setFiltroDificultad(''); setFiltroRubro(''); }}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <X className="h-3 w-3" /> Limpiar
            </button>
          )}

          <span className="ml-auto text-xs idea-muted">
            {casosFiltrados.length} de {CASOS_IDEA.length} casos
          </span>
        </div>
      </div>

      {/* Cards de casos */}
      {casosFiltrados.length === 0 ? (
        <div className="idea-card p-8 text-center">
          <Sparkles className="mx-auto h-8 w-8 idea-muted" />
          <p className="mt-2 text-sm font-medium">No hay casos que coincidan con esos filtros.</p>
          <button
            onClick={() => { setFiltroDificultad(''); setFiltroRubro(''); }}
            className="idea-accent-text mt-3 text-sm font-medium hover:underline"
          >
            Ver todos los casos
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {casosFiltrados.map((c) => {
            const dif = DIFICULTAD_META[c.dificultad];
            return (
              <Link
                key={c.slug}
                href={`/idea/casos/${c.slug}`}
                className="idea-card group flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 text-2xl">
                    {c.emoji ?? '💡'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold leading-tight">{c.titulo}</h3>
                    <p className="idea-muted mt-0.5 text-xs">{c.emprendedor.nombre} · {c.emprendedor.edad} años</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${dif.cls}`}>
                    {dif.label}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-slate-700">{c.tagline}</p>

                <div className="flex flex-wrap items-center gap-3 text-xs idea-muted">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {c.zona}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-3 w-3" /> {c.rubro}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {c.tags.slice(0, 4).map((t) => (
                    <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                      {t}
                    </span>
                  ))}
                </div>

                <span className="idea-accent-text mt-1 inline-flex items-center gap-1 text-sm font-medium">
                  Explorar el caso <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-center text-xs idea-muted">
        Próximamente: galería de casos para Mercados, Estrategia, Marketing, Organización y Defensa.
      </p>
    </div>
  );
}
