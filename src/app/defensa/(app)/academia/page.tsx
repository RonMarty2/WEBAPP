'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { CLASES_DEFENSA } from '@/lib/defensa/clases-data';

interface Progreso { clase_slug: string; completada: boolean; quiz_score: number }
const ETIQ_DIF: Record<string, string> = { inicial: 'Inicial', intermedia: 'Intermedia', avanzada: 'Avanzada' };

export default function AcademiaDefensa() {
  const [progreso, setProgreso] = useState<Progreso[]>([]);
  useEffect(() => {
    fetch('/api/defensa/progreso', { credentials: 'include' })
      .then((r) => r.json()).then((d) => setProgreso(d.progreso ?? [])).catch(() => {});
  }, []);
  const completadas = progreso.filter((p) => p.completada).length;

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <p className="def-accent-text text-xs font-semibold uppercase tracking-wider">Academia</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Aprende a defender tu trabajo</h1>
        <p className="def-muted mt-2 text-sm">{completadas} de {CLASES_DEFENSA.length} clases completadas. Luego practica en el simulacro.</p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-indigo-100">
          <div className="def-accent-bg h-full rounded-full transition-all" style={{ width: `${CLASES_DEFENSA.length ? (completadas / CLASES_DEFENSA.length) * 100 : 0}%` }} />
        </div>
      </header>

      <div className="space-y-3">
        {CLASES_DEFENSA.map((clase) => {
          const prog = progreso.find((p) => p.clase_slug === clase.slug);
          const completada = !!prog?.completada;
          return (
            <Link key={clase.slug} href={`/defensa/academia/${clase.slug}`}
              className="def-card group flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-base font-bold ${completada ? 'def-accent-bg text-white' : 'def-accent-soft def-accent-text'}`}>
                {completada ? <CheckCircle2 className="h-5 w-5" /> : clase.numero}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="def-muted font-medium uppercase tracking-wider">Clase {clase.numero}</span>
                  <span className="def-muted">·</span>
                  <span className="def-muted inline-flex items-center gap-1"><Clock className="h-3 w-3" />{clase.duracionMin} min</span>
                  <span className="def-accent-soft def-accent-text rounded-full px-2 py-0.5 font-medium">{ETIQ_DIF[clase.dificultad]}</span>
                  {completada && prog && <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800">Quiz {prog.quiz_score}/3</span>}
                </div>
                <h2 className="mt-1.5 font-semibold group-hover:text-indigo-700">{clase.titulo}</h2>
                <p className="def-muted mt-1 text-sm">{clase.resumen}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="def-card mt-6 p-5 text-center">
        <p className="text-sm font-semibold">¿Listo para practicar?</p>
        <p className="def-muted mt-1 text-sm">Arma tu banco y haz el simulacro evaluado por IA.</p>
        <Link href="/defensa/proyectos" className="def-btn-primary mt-3 inline-block px-5 py-2 text-sm font-medium">Ir a mi defensa →</Link>
      </div>
    </div>
  );
}
