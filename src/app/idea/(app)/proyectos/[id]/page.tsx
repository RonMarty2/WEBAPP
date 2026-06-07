'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, LayoutGrid, Gift, FlaskConical, Gauge, FileText, Lock } from 'lucide-react';
import type { ProyectoIdea } from '@/types/idea';

const HERRAMIENTAS = [
  { ruta: 'lean-canvas', label: 'Lean Canvas', desc: 'El modelo de negocio en 9 bloques', icon: LayoutGrid, disponible: true, campo: 'lean_canvas' },
  { ruta: 'propuesta-valor', label: 'Propuesta de valor', desc: 'Encaja lo que ofreces con lo que el cliente necesita', icon: Gift, disponible: true, campo: 'propuesta_valor' },
  { ruta: 'validacion', label: 'Validación', desc: 'Hipótesis y experimentos para probar la idea', icon: FlaskConical, disponible: true, campo: 'validacion' },
  { ruta: 'scorecard', label: 'Scorecard', desc: 'Deseabilidad, factibilidad y viabilidad', icon: Gauge, disponible: true, campo: 'scorecard' },
  { ruta: 'reporte', label: 'Reporte', desc: 'Documento consolidado + artefacto', icon: FileText, disponible: true, campo: 'reporte' },
];

export default function IdeaDetalle() {
  const params = useParams<{ id: string }>();
  const [proyecto, setProyecto] = useState<ProyectoIdea | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');

  useEffect(() => {
    fetch(`/api/idea/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setProyecto(d.proyecto); setEstado('ok'); })
      .catch(() => setEstado('error'));
  }, [params.id]);

  if (estado === 'cargando') return <div className="idea-muted py-10 text-center text-sm">Cargando idea…</div>;
  if (estado === 'error' || !proyecto) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="idea-card p-6 text-center">
          <p className="font-semibold">No encontramos esta idea</p>
          <Link href="/idea/proyectos" className="idea-accent-text mt-2 inline-block text-sm">← Mis ideas</Link>
        </div>
      </div>
    );
  }

  const tieneContenido = (campo: string): boolean => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = proyecto as any;
    return p[campo] && Object.keys(p[campo]).length > 0;
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/idea/proyectos" className="idea-muted inline-flex items-center gap-1 text-sm hover:text-amber-700">
        <ArrowLeft className="h-4 w-4" /> Mis ideas
      </Link>

      <header className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight">{proyecto.titulo}</h1>
        {(proyecto.idea || proyecto.sector) && (
          <p className="idea-muted mt-1 text-sm">{[proyecto.idea, proyecto.sector].filter(Boolean).join(' · ')}</p>
        )}
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {HERRAMIENTAS.map((h) => {
          const Icon = h.icon;
          const hecho = h.campo !== 'reporte' && tieneContenido(h.campo);
          const contenido = (
            <div className={`idea-card flex h-full items-center gap-3 p-4 ${h.disponible ? '' : 'opacity-55'}`}>
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${hecho ? 'bg-emerald-500 text-white' : 'idea-accent-soft idea-accent-text'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{h.label}</p>
                <p className="idea-muted text-xs">{h.desc}</p>
              </div>
              {h.disponible ? (
                <span className="idea-accent-text flex-shrink-0 text-xs font-medium">{hecho ? 'Editar' : 'Abrir'} →</span>
              ) : (
                <span className="idea-muted flex flex-shrink-0 items-center gap-1 text-[11px]"><Lock className="h-3 w-3" /> Pronto</span>
              )}
            </div>
          );
          return h.disponible ? (
            <Link key={h.ruta} href={`/idea/proyectos/${proyecto.id}/${h.ruta}`}>{contenido}</Link>
          ) : (
            <div key={h.ruta}>{contenido}</div>
          );
        })}
      </div>
    </div>
  );
}
