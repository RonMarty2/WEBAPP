'use client';

import Link from 'next/link';
import { GraduationCap, FolderSearch, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/mercados/auth-store';

/**
 * Hub del módulo Mercados (FASE 0).
 * Dashboard de entrada: saludo + 3 accesos grandes a las áreas del módulo.
 * Las áreas internas (academia, proyecto, datos) se construyen en fases
 * siguientes; por ahora los accesos están presentes y navegables.
 */
export default function MercadosHub() {
  const perfil = useAuthStore((s) => s.perfil);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <p className="mk-accent-text text-xs font-semibold uppercase tracking-wider">
          Investigación de Mercados
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Hola{perfil ? `, ${perfil.nombre}` : ''} 👋
        </h1>
        <p className="mk-muted mt-2 max-w-2xl text-sm leading-relaxed">
          Aquí aprendes a investigar un mercado de verdad y construyes tu propio
          estudio: defines objetivos, calculas tu muestra, diseñas tu encuesta,
          recolectas respuestas reales y analizas la demanda. Con datos abiertos
          de Bolivia.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <AccesoCard
          href="/mercados/academia"
          icon={<GraduationCap className="h-5 w-5" />}
          titulo="Academia"
          desc="13 clases: del muestreo al análisis de demanda."
          cta="Aprender"
        />
        <AccesoCard
          href="/mercados/proyecto"
          icon={<FolderSearch className="h-5 w-5" />}
          titulo="Mi investigación"
          desc="Construye tu estudio paso a paso."
          cta="Empezar"
          destacado
        />
        {/* Card "Datos abiertos" se ocultó del hub porque la página solo
            muestra "En construcción" y confundía al estudiante. Reactivar
            cuando se construya la integración real con INE/datos.gob.bo. */}
      </div>

      <div className="mk-card mt-8 p-5">
        <p className="text-sm font-semibold">Tu progreso</p>
        <p className="mk-muted mt-1 text-sm">
          Aún no has empezado ninguna investigación. Cuando crees tu primer
          proyecto, aquí verás su avance por etapas.
        </p>
      </div>
    </div>
  );
}

function AccesoCard({
  href,
  icon,
  titulo,
  desc,
  cta,
  destacado,
}: {
  href: string;
  icon: React.ReactNode;
  titulo: string;
  desc: string;
  cta: string;
  destacado?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`mk-card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md ${
        destacado ? 'ring-2 ring-sky-200' : ''
      }`}
    >
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${
          destacado ? 'mk-accent-bg text-white' : 'mk-accent-soft mk-accent-text'
        }`}
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold">{titulo}</h3>
      <p className="mk-muted mt-1 flex-1 text-sm">{desc}</p>
      <span className="mk-accent-text mt-3 inline-flex items-center gap-1 text-sm font-medium">
        {cta}
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
