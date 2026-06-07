'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, GitBranch, Users, Scale, Cog, Palette, FileText, Lock } from 'lucide-react';
import type { ProyectoOrganizacion } from '@/types/organizacion';

/**
 * Herramientas del proyecto organizacional, en orden lógico.
 * `disponible` marca cuáles ya están construidas.
 */
const HERRAMIENTAS = [
  { ruta: 'organigrama', label: 'Organigrama', desc: 'Estructura jerárquica de la empresa', icon: GitBranch, disponible: true },
  { ruta: 'rrhh', label: 'Recursos Humanos', desc: 'Cargos, salarios y aportes patronales (Bolivia)', icon: Users, disponible: true },
  { ruta: 'legal', label: 'Legalización', desc: 'NIT, Fundempresa, AFP, licencias', icon: Scale, disponible: true },
  { ruta: 'tecnico', label: 'Aspectos técnicos', desc: 'Proceso productivo, capacidad, layout', icon: Cog, disponible: true },
  { ruta: 'branding', label: 'Branding', desc: 'Identidad, valores, tono', icon: Palette, disponible: true },
  { ruta: 'reporte', label: 'Reporte', desc: 'Documento consolidado + artefacto', icon: FileText, disponible: true },
];

export default function ProyectoDetalle() {
  const params = useParams<{ id: string }>();
  const [proyecto, setProyecto] = useState<ProyectoOrganizacion | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');

  useEffect(() => {
    fetch(`/api/organizacion/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setProyecto(d.proyecto); setEstado('ok'); })
      .catch(() => setEstado('error'));
  }, [params.id]);

  if (estado === 'cargando') return <div className="org-muted py-10 text-center text-sm">Cargando proyecto…</div>;
  if (estado === 'error' || !proyecto) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="org-card p-6 text-center">
          <p className="font-semibold">No encontramos este proyecto</p>
          <Link href="/organizacion/proyectos" className="org-accent-text mt-2 inline-block text-sm">← Mis proyectos</Link>
        </div>
      </div>
    );
  }

  const tieneContenido = (ruta: string): boolean => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = proyecto as any;
    return p[ruta] && Object.keys(p[ruta]).length > 0;
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/organizacion/proyectos" className="org-muted inline-flex items-center gap-1 text-sm hover:text-emerald-700">
        <ArrowLeft className="h-4 w-4" /> Mis proyectos
      </Link>

      <header className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight">{proyecto.titulo}</h1>
        {(proyecto.empresa || proyecto.sector) && (
          <p className="org-muted mt-1 text-sm">{[proyecto.empresa, proyecto.sector].filter(Boolean).join(' · ')}</p>
        )}
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {HERRAMIENTAS.map((h) => {
          const Icon = h.icon;
          const hecho = h.disponible && tieneContenido(h.ruta);
          const contenido = (
            <div className={`org-card flex h-full items-center gap-3 p-4 ${h.disponible ? '' : 'opacity-55'}`}>
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${hecho ? 'bg-emerald-500 text-white' : 'org-accent-soft org-accent-text'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{h.label}</p>
                <p className="org-muted text-xs">{h.desc}</p>
              </div>
              {h.disponible ? (
                <span className="org-accent-text flex-shrink-0 text-xs font-medium">{hecho ? 'Editar' : 'Abrir'} →</span>
              ) : (
                <span className="org-muted flex flex-shrink-0 items-center gap-1 text-[11px]"><Lock className="h-3 w-3" /> Pronto</span>
              )}
            </div>
          );
          return h.disponible ? (
            <Link key={h.ruta} href={`/organizacion/proyectos/${proyecto.id}/${h.ruta}`}>{contenido}</Link>
          ) : (
            <div key={h.ruta}>{contenido}</div>
          );
        })}
      </div>
    </div>
  );
}
