'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Layers, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import type { EstadoEstrategia } from '@/types/estrategia';

interface AnalisisLista {
  id: string;
  titulo: string;
  sector: string | null;
  estado: EstadoEstrategia;
  actualizado_en: string;
}

const ESTADO_LABEL: Record<EstadoEstrategia, { txt: string; clase: string }> = {
  pestel: { txt: 'PESTEL', clase: 'bg-violet-100 text-violet-800' },
  porter: { txt: 'Porter', clase: 'bg-violet-100 text-violet-800' },
  matrices: { txt: 'Matrices', clase: 'bg-indigo-100 text-indigo-800' },
  foda: { txt: 'FODA', clase: 'bg-fuchsia-100 text-fuchsia-800' },
  reporte: { txt: 'Reporte', clase: 'bg-emerald-100 text-emerald-800' },
  completo: { txt: 'Completo', clase: 'bg-emerald-600 text-white' },
};

export default function MiAnalisisPage() {
  return (
    <Suspense fallback={null}>
      <MiAnalisis />
    </Suspense>
  );
}

function MiAnalisis() {
  const searchParams = useSearchParams();
  const tituloPrellenado = searchParams.get('titulo') ?? '';
  const desde = searchParams.get('desde');

  const [proyectos, setProyectos] = useState<AnalisisLista[]>([]);
  const [montado, setMontado] = useState(false);
  const [creando, setCreando] = useState(!!tituloPrellenado);
  const [titulo, setTitulo] = useState(tituloPrellenado);
  const [sector, setSector] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = () => {
    fetch('/api/estrategia/proyectos', { credentials: 'include' })
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
      const res = await fetch('/api/estrategia/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ titulo: titulo.trim(), sector: sector.trim() || null }),
      });
      if (res.ok) {
        setTitulo(''); setSector(''); setCreando(false);
        cargar();
      }
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: string) => {
    if (!window.confirm('¿Eliminar este análisis? No se puede deshacer.')) return;
    await fetch(`/api/estrategia/proyectos/${id}`, { method: 'DELETE', credentials: 'include' });
    cargar();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="es-accent-text text-xs font-semibold uppercase tracking-wider">Laboratorio</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Mis análisis estratégicos</h1>
          <p className="es-muted mt-2 text-sm">
            Cada análisis recorre las herramientas: PESTEL → Porter → matrices → FODA → reporte.
            Retoma donde lo dejaste.
          </p>
        </div>
        {!creando && (
          <button onClick={() => setCreando(true)} className="es-btn-primary flex flex-shrink-0 items-center gap-1.5 px-4 py-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Nuevo
          </button>
        )}
      </header>

      {creando && (
        <form onSubmit={crear} className="es-card mb-5 p-5">
          {tituloPrellenado && (
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs text-violet-900">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-violet-600" />
              <span>
                Título tomado desde <strong>{desde === 'mercados' ? 'tu investigación de Mercados' : 'tu módulo anterior'}</strong>.
                Puedes editarlo si quieres ajustarlo para este análisis.
              </span>
            </div>
          )}
          <label className="text-sm font-medium">Título del análisis</label>
          <input
            autoFocus value={titulo} onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Análisis estratégico — Cafetería La Orquídea"
            className="es-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
          <label className="mt-3 block text-sm font-medium">Sector / industria <span className="es-muted font-normal">(opcional)</span></label>
          <input
            value={sector} onChange={(e) => setSector(e.target.value)}
            placeholder="Ej: Gastronomía / cafeterías de especialidad"
            className="es-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
          <div className="mt-3 flex gap-2">
            <button type="submit" disabled={guardando || !titulo.trim()} className="es-btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50">
              {guardando ? 'Creando…' : 'Crear análisis'}
            </button>
            <button type="button" onClick={() => { setCreando(false); setTitulo(''); setSector(''); }} className="es-btn-ghost px-4 py-2 text-sm">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {!montado && <div className="es-muted py-10 text-center text-sm">Cargando…</div>}

      {montado && proyectos.length === 0 && !creando && (
        <div className="es-card p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
            <Layers className="es-accent-text h-6 w-6" />
          </div>
          <p className="mt-3 font-semibold">Aún no tienes análisis</p>
          <p className="es-muted mt-1 text-sm">Crea el primero para empezar con tu PESTEL.</p>
          <button onClick={() => setCreando(true)} className="es-btn-primary mt-4 inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Crear análisis
          </button>
        </div>
      )}

      {montado && proyectos.length > 0 && (
        <div className="space-y-3">
          {proyectos.map((p) => {
            const est = ESTADO_LABEL[p.estado];
            return (
              <div key={p.id} className="es-card flex items-center gap-4 p-5">
                <div className="es-accent-soft flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl">
                  <Layers className="es-accent-text h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">{p.titulo}</h2>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className={`rounded-full px-2 py-0.5 font-medium ${est.clase}`}>{est.txt}</span>
                    {p.sector && <span className="es-muted truncate">{p.sector}</span>}
                  </div>
                </div>
                <button onClick={() => eliminar(p.id)} className="es-muted flex-shrink-0 rounded-lg p-2 hover:bg-rose-50 hover:text-rose-600" title="Eliminar" aria-label={`Eliminar análisis ${p.titulo}`}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
                <Link href={`/estrategia/analisis/${p.id}`} className="es-btn-primary flex flex-shrink-0 items-center gap-1.5 px-4 py-2 text-sm font-medium">
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
