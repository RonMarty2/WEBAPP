'use client';

import Link from 'next/link';
import { GraduationCap, Layers, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/defensa/auth-store';

export default function DefensaHub() {
  const perfil = useAuthStore((s) => s.perfil);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <p className="def-accent-text text-xs font-semibold uppercase tracking-wider">
          Defensa
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Hola{perfil ? `, ${perfil.nombre}` : ''} 👋
        </h1>
        <p className="def-muted mt-2 max-w-2xl text-sm leading-relaxed">
          Llega seguro al tribunal. Arma tu banco de preguntas por categoría y
          practica con un simulacro donde la IA evalúa tus respuestas y te dice
          cómo mejorar.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/defensa/academia"
          className="def-card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="def-accent-soft def-accent-text mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold">Academia</h3>
          <p className="def-muted mt-1 flex-1 text-sm">
            Clases sobre cómo defender, qué preguntan los tribunales y cómo responder.
          </p>
          <span className="def-accent-text mt-3 inline-flex items-center gap-1 text-sm font-medium">
            Aprender <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/defensa/proyectos"
          className="def-card group flex flex-col p-5 ring-2 ring-indigo-200 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="def-accent-bg mb-3 flex h-10 w-10 items-center justify-center rounded-lg text-white">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold">Mi defensa</h3>
          <p className="def-muted mt-1 flex-1 text-sm">
            Prepara tu defensa: banco de preguntas y simulacro evaluado por IA.
          </p>
          <span className="def-accent-text mt-3 inline-flex items-center gap-1 text-sm font-medium">
            Empezar <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      <div className="def-card mt-8 p-5">
        <p className="text-sm font-semibold">Tu progreso</p>
        <p className="def-muted mt-1 text-sm">
          Aún no has empezado ninguna preparación. Cuando crees una, aquí verás su avance.
        </p>
      </div>
    </div>
  );
}
