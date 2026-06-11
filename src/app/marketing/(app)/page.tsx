'use client';

import Link from 'next/link';
import { GraduationCap, Layers, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/marketing/auth-store';

export default function MarketingHub() {
  const perfil = useAuthStore((s) => s.perfil);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <p className="mkt-accent-text text-xs font-semibold uppercase tracking-wider">
          Marketing
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Hola{perfil ? `, ${perfil.nombre}` : ''} 👋
        </h1>
        <p className="mkt-muted mt-2 max-w-2xl text-sm leading-relaxed">
          Arma el plan de marketing de tu producto o marca paso a paso: define a tu
          cliente ideal, tu mezcla 4Ps/7Ps, el presupuesto y costo por lead de cada
          canal (Meta, TikTok, Google) y tu calendario de contenidos.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/marketing/academia"
          className="mkt-card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="mkt-accent-soft mkt-accent-text mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold">Academia</h3>
          <p className="mkt-muted mt-1 flex-1 text-sm">
            Clases sobre buyer persona, mezcla de marketing, presupuesto/CPL y
            contenidos, con ejemplos bolivianos.
          </p>
          <span className="mkt-accent-text mt-3 inline-flex items-center gap-1 text-sm font-medium">
            Aprender <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/marketing/casos"
          className="mkt-card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="mkt-accent-soft mkt-accent-text mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold">Casos de Bolivia</h3>
          <p className="mkt-muted mt-1 flex-1 text-sm">
            5 planes reales con buyer persona, mix 4P/7P, presupuesto, CPL y ROAS.
          </p>
          <span className="mkt-accent-text mt-3 inline-flex items-center gap-1 text-sm font-medium">
            Explorar <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/marketing/planes"
          className="mkt-card group flex flex-col p-5 ring-2 ring-rose-200 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="mkt-accent-bg mb-3 flex h-10 w-10 items-center justify-center rounded-lg text-white">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold">Mi plan</h3>
          <p className="mkt-muted mt-1 flex-1 text-sm">
            Construye tu plan de marketing completo, herramienta por herramienta.
          </p>
          <span className="mkt-accent-text mt-3 inline-flex items-center gap-1 text-sm font-medium">
            Empezar <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      <div className="mkt-card mt-8 p-5">
        <p className="text-sm font-semibold">Tu progreso</p>
        <p className="mkt-muted mt-1 text-sm">
          Aún no has empezado ningún plan. Cuando crees uno, aquí verás su avance.
        </p>
      </div>
    </div>
  );
}
