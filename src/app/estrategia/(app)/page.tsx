'use client';

import Link from 'next/link';
import { GraduationCap, Layers, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/estrategia/auth-store';

export default function EstrategiaHub() {
  const perfil = useAuthStore((s) => s.perfil);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <p className="es-accent-text text-xs font-semibold uppercase tracking-wider">
          Estrategia Empresarial
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Hola{perfil ? `, ${perfil.nombre}` : ''} 👋
        </h1>
        <p className="es-muted mt-2 max-w-2xl text-sm leading-relaxed">
          Aprende a analizar el entorno de un negocio y construye tu estrategia paso a paso:
          PESTEL del macroentorno, las 5 Fuerzas de Porter, matrices MEFE/MEFI y la
          FODA cruzada que genera tus estrategias.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/estrategia/academia"
          className="es-card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="es-accent-soft es-accent-text mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold">Academia</h3>
          <p className="es-muted mt-1 flex-1 text-sm">
            Clases sobre PESTEL, Porter, matrices y FODA con ejemplos bolivianos.
          </p>
          <span className="es-accent-text mt-3 inline-flex items-center gap-1 text-sm font-medium">
            Aprender <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/estrategia/analisis"
          className="es-card group flex flex-col p-5 ring-2 ring-violet-200 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="es-accent-bg mb-3 flex h-10 w-10 items-center justify-center rounded-lg text-white">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold">Mi análisis</h3>
          <p className="es-muted mt-1 flex-1 text-sm">
            Construye tu análisis estratégico completo, etapa por etapa.
          </p>
          <span className="es-accent-text mt-3 inline-flex items-center gap-1 text-sm font-medium">
            Empezar <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      <div className="es-card mt-8 p-5">
        <p className="text-sm font-semibold">Tu progreso</p>
        <p className="es-muted mt-1 text-sm">
          Aún no has empezado ningún análisis. Cuando crees uno, aquí verás su avance.
        </p>
      </div>
    </div>
  );
}
