'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, ListChecks, Mic, FileText } from 'lucide-react';
import type { ProyectoDefensa } from '@/types/defensa';

const HERRAMIENTAS = [
  { ruta: 'preguntas', label: 'Banco de preguntas', desc: 'Reúne y genera preguntas por categoría', icon: ListChecks, campo: 'preguntas' },
  { ruta: 'simulacro', label: 'Simulacro', desc: 'Responde y deja que la IA te evalúe', icon: Mic, campo: 'simulacro' },
  { ruta: 'reporte', label: 'Reporte', desc: 'Documento consolidado + artefacto', icon: FileText, campo: 'reporte' },
];

export default function DefensaDetalle() {
  const params = useParams<{ id: string }>();
  const [proyecto, setProyecto] = useState<ProyectoDefensa | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');

  useEffect(() => {
    fetch(`/api/defensa/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setProyecto(d.proyecto); setEstado('ok'); })
      .catch(() => setEstado('error'));
  }, [params.id]);

  if (estado === 'cargando') return <div className="def-muted py-10 text-center text-sm">Cargando preparación…</div>;
  if (estado === 'error' || !proyecto) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="def-card p-6 text-center">
          <p className="font-semibold">No encontramos esta preparación</p>
          <Link href="/defensa/proyectos" className="def-accent-text mt-2 inline-block text-sm">← Mis defensas</Link>
        </div>
      </div>
    );
  }

  const tieneContenido = (campo: string): boolean => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = proyecto as any;
    if (campo === 'preguntas') return p.preguntas?.items?.length > 0;
    if (campo === 'simulacro') return p.simulacro?.respuestas?.length > 0;
    return false;
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/defensa/proyectos" className="def-muted inline-flex items-center gap-1 text-sm hover:text-indigo-700">
        <ArrowLeft className="h-4 w-4" /> Mis defensas
      </Link>

      <header className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight">{proyecto.titulo}</h1>
        {(proyecto.tema || proyecto.carrera) && (
          <p className="def-muted mt-1 text-sm">{[proyecto.carrera, proyecto.tema].filter(Boolean).join(' · ')}</p>
        )}
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {HERRAMIENTAS.map((h) => {
          const Icon = h.icon;
          const hecho = h.campo !== 'reporte' && tieneContenido(h.campo);
          return (
            <Link key={h.ruta} href={`/defensa/proyectos/${proyecto.id}/${h.ruta}`}>
              <div className="def-card flex h-full items-center gap-3 p-4">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${hecho ? 'bg-emerald-500 text-white' : 'def-accent-soft def-accent-text'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{h.label}</p>
                  <p className="def-muted text-xs">{h.desc}</p>
                </div>
                <span className="def-accent-text flex-shrink-0 text-xs font-medium">{hecho ? 'Editar' : 'Abrir'} →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
