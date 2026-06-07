'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { CLASES_IDEA } from '@/lib/idea/clases-data';

interface Progreso { clase_slug: string; completada: boolean; quiz_score: number }
const ETIQ_DIF: Record<string, string> = { inicial: 'Inicial', intermedia: 'Intermedia', avanzada: 'Avanzada' };

export default function AcademiaIdea() {
  const [progreso, setProgreso] = useState<Progreso[]>([]);
  useEffect(() => {
    fetch('/api/idea/progreso', { credentials: 'include' })
      .then((r) => r.json()).then((d) => setProgreso(d.progreso ?? [])).catch(() => {});
  }, []);
  const completadas = progreso.filter((p) => p.completada).length;

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <p className="idea-accent-text text-xs font-semibold uppercase tracking-wider">Academia</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Aprende a validar tu idea</h1>
        <p className="idea-muted mt-2 text-sm">{completadas} de {CLASES_IDEA.length} clases completadas. Luego valídala en el laboratorio.</p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-amber-100">
          <div className="idea-accent-bg h-full rounded-full transition-all" style={{ width: `${CLASES_IDEA.length ? (completadas / CLASES_IDEA.length) * 100 : 0}%` }} />
        </div>
      </header>

      <div className="space-y-3">
        {CLASES_IDEA.map((clase) => {
          const prog = progreso.find((p) => p.clase_slug === clase.slug);
          const completada = !!prog?.completada;
          return (
            <Link key={clase.slug} href={`/idea/academia/${clase.slug}`}
              className="idea-card group flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-base font-bold ${completada ? 'idea-accent-bg text-white' : 'idea-accent-soft idea-accent-text'}`}>
                {completada ? <CheckCircle2 className="h-5 w-5" /> : clase.numero}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="idea-muted font-medium uppercase tracking-wider">Clase {clase.numero}</span>
                  <span className="idea-muted">·</span>
                  <span className="idea-muted inline-flex items-center gap-1"><Clock className="h-3 w-3" />{clase.duracionMin} min</span>
                  <span className="idea-accent-soft idea-accent-text rounded-full px-2 py-0.5 font-medium">{ETIQ_DIF[clase.dificultad]}</span>
                  {completada && prog && <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800">Quiz {prog.quiz_score}/3</span>}
                </div>
                <h2 className="mt-1.5 font-semibold group-hover:text-amber-700">{clase.titulo}</h2>
                <p className="idea-muted mt-1 text-sm">{clase.resumen}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="idea-card mt-6 p-5 text-center">
        <p className="text-sm font-semibold">¿Listo para validar?</p>
        <p className="idea-muted mt-1 text-sm">Aplica lo aprendido en tu idea.</p>
        <Link href="/idea/proyectos" className="idea-btn-primary mt-3 inline-block px-5 py-2 text-sm font-medium">Ir a mi idea →</Link>
      </div>
    </div>
  );
}
