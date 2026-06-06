'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2, Lock, Clock } from 'lucide-react';
import { CLASES_MERCADOS, TOTAL_CLASES_PLANEADAS } from '@/lib/mercados/clases-data';

interface Progreso {
  clase_slug: string;
  completada: boolean;
  quiz_score: number;
}

const ETIQ_DIF: Record<string, string> = {
  inicial: 'Inicial',
  intermedia: 'Intermedia',
  avanzada: 'Avanzada',
};

export default function AcademiaPage() {
  const [progreso, setProgreso] = useState<Progreso[]>([]);

  useEffect(() => {
    fetch('/api/mercados/progreso', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setProgreso(d.progreso ?? []))
      .catch(() => {});
  }, []);

  const completadas = progreso.filter((p) => p.completada).length;

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <p className="mk-accent-text text-xs font-semibold uppercase tracking-wider">Academia</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Aprende a investigar un mercado</h1>
        <p className="mk-muted mt-2 text-sm">
          {completadas} de {CLASES_MERCADOS.length} clases disponibles completadas.
          La academia completa tendrá {TOTAL_CLASES_PLANEADAS} clases.
        </p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-sky-100">
          <div
            className="mk-accent-bg h-full rounded-full transition-all"
            style={{
              width: `${CLASES_MERCADOS.length ? (completadas / CLASES_MERCADOS.length) * 100 : 0}%`,
            }}
          />
        </div>
      </header>

      <div className="space-y-3">
        {CLASES_MERCADOS.map((clase) => {
          const prog = progreso.find((p) => p.clase_slug === clase.slug);
          const completada = !!prog?.completada;
          return (
            <Link
              key={clase.slug}
              href={`/mercados/academia/${clase.slug}`}
              className="mk-card group flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-base font-bold ${
                  completada ? 'mk-accent-bg text-white' : 'mk-accent-soft mk-accent-text'
                }`}
              >
                {completada ? <CheckCircle2 className="h-5 w-5" /> : clase.numero}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="mk-muted font-medium uppercase tracking-wider">
                    Clase {clase.numero}
                  </span>
                  <span className="mk-muted">·</span>
                  <span className="mk-muted inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {clase.duracionMin} min
                  </span>
                  <span className="mk-accent-soft mk-accent-text rounded-full px-2 py-0.5 font-medium">
                    {ETIQ_DIF[clase.dificultad]}
                  </span>
                  {completada && prog && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800">
                      Quiz {prog.quiz_score}/3
                    </span>
                  )}
                </div>
                <h2 className="mt-1.5 font-semibold group-hover:text-sky-700">{clase.titulo}</h2>
                <p className="mk-muted mt-1 text-sm">{clase.resumen}</p>
              </div>
            </Link>
          );
        })}

        {/* Clases planeadas pero aún no construidas (olas 1B + 1C) */}
        {Array.from({ length: TOTAL_CLASES_PLANEADAS - CLASES_MERCADOS.length }).map((_, i) => (
          <div key={`pendiente-${i}`} className="mk-card flex items-center gap-4 p-5 opacity-50">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <span className="mk-muted text-xs font-medium uppercase tracking-wider">
                Clase {CLASES_MERCADOS.length + i + 1}
              </span>
              <p className="mk-muted text-sm">Próximamente</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
