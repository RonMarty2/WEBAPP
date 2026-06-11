'use client';

import Link from 'next/link';
import { GraduationCap, Layers, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/organizacion/auth-store';

export default function OrganizacionHub() {
  const perfil = useAuthStore((s) => s.perfil);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <p className="org-accent-text text-xs font-semibold uppercase tracking-wider">
          Organización
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Hola{perfil ? `, ${perfil.nombre}` : ''} 👋
        </h1>
        <p className="org-muted mt-2 max-w-2xl text-sm leading-relaxed">
          Diseña la estructura de tu empresa: organigrama, recursos humanos
          (con aportes patronales bolivianos), legalización (NIT, Fundempresa,
          AFP), aspectos técnicos y branding.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/organizacion/academia"
          className="org-card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="org-accent-soft org-accent-text mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold">Academia</h3>
          <p className="org-muted mt-1 flex-1 text-sm">
            Clases sobre estructura organizacional, RRHH y legal en Bolivia.
          </p>
          <span className="org-accent-text mt-3 inline-flex items-center gap-1 text-sm font-medium">
            Aprender <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/organizacion/casos"
          className="org-card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="org-accent-soft org-accent-text mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold">Casos de Bolivia</h3>
          <p className="org-muted mt-1 flex-1 text-sm">
            5 empresas reales: organigrama, planilla con aportes, legal y branding.
          </p>
          <span className="org-accent-text mt-3 inline-flex items-center gap-1 text-sm font-medium">
            Explorar <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/organizacion/proyectos"
          className="org-card group flex flex-col p-5 ring-2 ring-emerald-200 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="org-accent-bg mb-3 flex h-10 w-10 items-center justify-center rounded-lg text-white">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold">Mi proyecto</h3>
          <p className="org-muted mt-1 flex-1 text-sm">
            Construye la estructura completa de tu empresa, herramienta por herramienta.
          </p>
          <span className="org-accent-text mt-3 inline-flex items-center gap-1 text-sm font-medium">
            Empezar <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      <div className="org-card mt-8 p-5">
        <p className="text-sm font-semibold">Tu progreso</p>
        <p className="org-muted mt-1 text-sm">
          Aún no has empezado ningún proyecto. Cuando crees uno, aquí verás su avance.
        </p>
      </div>
    </div>
  );
}
