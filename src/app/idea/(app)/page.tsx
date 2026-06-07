'use client';

import Link from 'next/link';
import { GraduationCap, Layers, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/idea/auth-store';

export default function IdeaHub() {
  const perfil = useAuthStore((s) => s.perfil);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <p className="idea-accent-text text-xs font-semibold uppercase tracking-wider">
          Idea & Pre-validación
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Hola{perfil ? `, ${perfil.nombre}` : ''} 👋
        </h1>
        <p className="idea-muted mt-2 max-w-2xl text-sm leading-relaxed">
          Antes de invertir tiempo y dinero, valida que tu idea resuelve un
          problema real: Lean Canvas, propuesta de valor, hipótesis a probar y
          un scorecard de viabilidad.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/idea/academia"
          className="idea-card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="idea-accent-soft idea-accent-text mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold">Academia</h3>
          <p className="idea-muted mt-1 flex-1 text-sm">
            Clases sobre Lean Canvas, propuesta de valor y validación de ideas.
          </p>
          <span className="idea-accent-text mt-3 inline-flex items-center gap-1 text-sm font-medium">
            Aprender <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/idea/proyectos"
          className="idea-card group flex flex-col p-5 ring-2 ring-amber-200 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="idea-accent-bg mb-3 flex h-10 w-10 items-center justify-center rounded-lg text-white">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold">Mi idea</h3>
          <p className="idea-muted mt-1 flex-1 text-sm">
            Valida tu idea paso a paso, herramienta por herramienta.
          </p>
          <span className="idea-accent-text mt-3 inline-flex items-center gap-1 text-sm font-medium">
            Empezar <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      <div className="idea-card mt-8 p-5">
        <p className="text-sm font-semibold">Tu progreso</p>
        <p className="idea-muted mt-1 text-sm">
          Aún no has empezado ninguna validación. Cuando crees una, aquí verás su avance.
        </p>
      </div>
    </div>
  );
}
