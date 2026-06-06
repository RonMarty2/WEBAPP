'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Globe, Swords, Crosshair, GitBranch, Grid3x3, Network, PieChart, TrendingUp, Compass, FileText, Lock } from 'lucide-react';
import type { ProyectoEstrategia } from '@/types/estrategia';

/**
 * Herramientas del análisis estratégico, en orden lógico.
 * `disponible` marca cuáles ya están construidas (se irán habilitando por fase).
 */
const HERRAMIENTAS = [
  { ruta: 'pestel', label: 'PESTEL', desc: 'Análisis del macroentorno (6 dimensiones)', icon: Globe, disponible: true },
  { ruta: 'porter', label: '5 Fuerzas de Porter', desc: 'Análisis del microentorno / sector', icon: Swords, disponible: true },
  { ruta: 'mpc', label: 'MPC', desc: 'Matriz de Perfil Competitivo', icon: Crosshair, disponible: false },
  { ruta: 'cadena-valor', label: 'Cadena de Valor', desc: 'Análisis interno de actividades', icon: GitBranch, disponible: false },
  { ruta: 'mefe', label: 'MEFE', desc: 'Evaluación de factores externos', icon: Grid3x3, disponible: true },
  { ruta: 'mefi', label: 'MEFI', desc: 'Evaluación de factores internos', icon: Grid3x3, disponible: true },
  { ruta: 'mie', label: 'MIE', desc: 'Matriz Interna-Externa', icon: Network, disponible: false },
  { ruta: 'foda', label: 'FODA cruzada', desc: 'Síntesis y estrategias FO/DO/FA/DA', icon: PieChart, disponible: true },
  { ruta: 'bcg', label: 'BCG', desc: 'Matriz de portafolio', icon: PieChart, disponible: false },
  { ruta: 'ansoff', label: 'Ansoff', desc: 'Matriz de crecimiento', icon: TrendingUp, disponible: false },
  { ruta: 'peyea', label: 'PEYEA', desc: 'Posición estratégica', icon: Compass, disponible: false },
  { ruta: 'reporte', label: 'Reporte', desc: 'Documento consolidado + artefacto', icon: FileText, disponible: false },
];

export default function AnalisisDetalle() {
  const params = useParams<{ id: string }>();
  const [proyecto, setProyecto] = useState<ProyectoEstrategia | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');

  useEffect(() => {
    fetch(`/api/estrategia/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setProyecto(d.proyecto); setEstado('ok'); })
      .catch(() => setEstado('error'));
  }, [params.id]);

  if (estado === 'cargando') return <div className="es-muted py-10 text-center text-sm">Cargando análisis…</div>;
  if (estado === 'error' || !proyecto) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="es-card p-6 text-center">
          <p className="font-semibold">No encontramos este análisis</p>
          <Link href="/estrategia/analisis" className="es-accent-text mt-2 inline-block text-sm">← Mis análisis</Link>
        </div>
      </div>
    );
  }

  // ¿Qué matrices ya tienen contenido? (para marcar "hecho")
  const tieneContenido = (ruta: string): boolean => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = proyecto as any;
    if (ruta === 'pestel') {
      const px = p.pestel ?? {};
      return Object.values(px).some((arr) => Array.isArray(arr) && arr.length > 0);
    }
    return p[ruta] && Object.keys(p[ruta]).length > 0;
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/estrategia/analisis" className="es-muted inline-flex items-center gap-1 text-sm hover:text-violet-700">
        <ArrowLeft className="h-4 w-4" /> Mis análisis
      </Link>

      <header className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight">{proyecto.titulo}</h1>
        {proyecto.sector && <p className="es-muted mt-1 text-sm">Sector: {proyecto.sector}</p>}
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {HERRAMIENTAS.map((h) => {
          const Icon = h.icon;
          const hecho = h.disponible && tieneContenido(h.ruta);
          const contenido = (
            <div className={`es-card flex h-full items-center gap-3 p-4 ${h.disponible ? '' : 'opacity-55'}`}>
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${hecho ? 'bg-emerald-500 text-white' : 'es-accent-soft es-accent-text'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{h.label}</p>
                <p className="es-muted text-xs">{h.desc}</p>
              </div>
              {h.disponible ? (
                <span className="es-accent-text flex-shrink-0 text-xs font-medium">{hecho ? 'Editar' : 'Abrir'} →</span>
              ) : (
                <span className="es-muted flex flex-shrink-0 items-center gap-1 text-[11px]"><Lock className="h-3 w-3" /> Pronto</span>
              )}
            </div>
          );
          return h.disponible ? (
            <Link key={h.ruta} href={`/estrategia/analisis/${proyecto.id}/${h.ruta}`}>{contenido}</Link>
          ) : (
            <div key={h.ruta}>{contenido}</div>
          );
        })}
      </div>
    </div>
  );
}
