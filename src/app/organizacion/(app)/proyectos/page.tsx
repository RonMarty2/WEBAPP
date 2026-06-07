'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus, Layers, Trash2, ArrowRight } from 'lucide-react';
import type { EstadoOrganizacion } from '@/types/organizacion';

interface ProyectoLista {
  id: string;
  titulo: string;
  empresa: string | null;
  sector: string | null;
  estado: EstadoOrganizacion;
  actualizado_en: string;
}

const ESTADO_LABEL: Record<EstadoOrganizacion, { txt: string; clase: string }> = {
  organigrama: { txt: 'Organigrama', clase: 'bg-emerald-100 text-emerald-800' },
  rrhh: { txt: 'RRHH', clase: 'bg-teal-100 text-teal-800' },
  legal: { txt: 'Legal', clase: 'bg-amber-100 text-amber-800' },
  tecnico: { txt: 'Técnico', clase: 'bg-sky-100 text-sky-800' },
  branding: { txt: 'Branding', clase: 'bg-rose-100 text-rose-800' },
  reporte: { txt: 'Reporte', clase: 'bg-indigo-100 text-indigo-800' },
  completo: { txt: 'Completo', clase: 'bg-emerald-600 text-white' },
};

export default function MisProyectos() {
  const [proyectos, setProyectos] = useState<ProyectoLista[]>([]);
  const [montado, setMontado] = useState(false);
  const [creando, setCreando] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [sector, setSector] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = () => {
    fetch('/api/organizacion/proyectos', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setProyectos(d.proyectos ?? []))
      .catch(() => {})
      .finally(() => setMontado(true));
  };
  useEffect(cargar, []);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    setGuardando(true);
    try {
      const res = await fetch('/api/organizacion/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ titulo: titulo.trim(), empresa: empresa.trim() || null, sector: sector.trim() || null }),
      });
      if (res.ok) {
        setTitulo(''); setEmpresa(''); setSector(''); setCreando(false);
        cargar();
      }
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: string) => {
    if (!window.confirm('¿Eliminar este proyecto? No se puede deshacer.')) return;
    await fetch(`/api/organizacion/proyectos/${id}`, { method: 'DELETE', credentials: 'include' });
    cargar();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="org-accent-text text-xs font-semibold uppercase tracking-wider">Laboratorio</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Mis proyectos organizacionales</h1>
          <p className="org-muted mt-2 text-sm">
            Cada proyecto recorre las herramientas: organigrama → RRHH → legal →
            técnico → branding → reporte. Retoma donde lo dejaste.
          </p>
        </div>
        {!creando && (
          <button onClick={() => setCreando(true)} className="org-btn-primary flex flex-shrink-0 items-center gap-1.5 px-4 py-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Nuevo
          </button>
        )}
      </header>

      {creando && (
        <form onSubmit={crear} className="org-card mb-5 p-5">
          <label className="text-sm font-medium">Título del proyecto</label>
          <input
            autoFocus value={titulo} onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Estructura — Cafetería La Orquídea"
            className="org-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <label className="mt-3 block text-sm font-medium">Nombre de la empresa <span className="org-muted font-normal">(opcional)</span></label>
          <input
            value={empresa} onChange={(e) => setEmpresa(e.target.value)}
            placeholder="Ej: La Orquídea SRL"
            className="org-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <label className="mt-3 block text-sm font-medium">Sector / rubro <span className="org-muted font-normal">(opcional)</span></label>
          <input
            value={sector} onChange={(e) => setSector(e.target.value)}
            placeholder="Ej: Gastronomía / cafeterías"
            className="org-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <div className="mt-3 flex gap-2">
            <button type="submit" disabled={guardando || !titulo.trim()} className="org-btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50">
              {guardando ? 'Creando…' : 'Crear proyecto'}
            </button>
            <button type="button" onClick={() => { setCreando(false); setTitulo(''); setEmpresa(''); setSector(''); }} className="org-btn-ghost px-4 py-2 text-sm">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {!montado && <div className="org-muted py-10 text-center text-sm">Cargando…</div>}

      {montado && proyectos.length === 0 && !creando && (
        <div className="org-card p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <Layers className="org-accent-text h-6 w-6" />
          </div>
          <p className="mt-3 font-semibold">Aún no tienes proyectos</p>
          <p className="org-muted mt-1 text-sm">Crea el primero para empezar con tu organigrama.</p>
          <button onClick={() => setCreando(true)} className="org-btn-primary mt-4 inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Crear proyecto
          </button>
        </div>
      )}

      {montado && proyectos.length > 0 && (
        <div className="space-y-3">
          {proyectos.map((p) => {
            const est = ESTADO_LABEL[p.estado];
            return (
              <div key={p.id} className="org-card flex items-center gap-4 p-5">
                <div className="org-accent-soft flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl">
                  <Layers className="org-accent-text h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">{p.titulo}</h2>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className={`rounded-full px-2 py-0.5 font-medium ${est.clase}`}>{est.txt}</span>
                    {(p.empresa || p.sector) && <span className="org-muted truncate">{p.empresa || p.sector}</span>}
                  </div>
                </div>
                <button onClick={() => eliminar(p.id)} className="org-muted flex-shrink-0 rounded-lg p-2 hover:bg-rose-50 hover:text-rose-600" title="Eliminar">
                  <Trash2 className="h-4 w-4" />
                </button>
                <Link href={`/organizacion/proyectos/${p.id}`} className="org-btn-primary flex flex-shrink-0 items-center gap-1.5 px-4 py-2 text-sm font-medium">
                  Continuar <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
