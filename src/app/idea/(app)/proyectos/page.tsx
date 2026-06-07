'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus, Layers, Trash2, ArrowRight } from 'lucide-react';
import type { EstadoIdea } from '@/types/idea';
import { MODALIDADES, UNIVERSIDADES } from '@/lib/idea/catalogos';

interface ProyectoLista {
  id: string;
  titulo: string;
  idea: string | null;
  sector: string | null;
  tipo_trabajo: string | null;
  universidad: string | null;
  estado: EstadoIdea;
  actualizado_en: string;
}

const ESTADO_LABEL: Record<EstadoIdea, { txt: string; clase: string }> = {
  canvas: { txt: 'Lean Canvas', clase: 'bg-amber-100 text-amber-800' },
  valor: { txt: 'Propuesta de valor', clase: 'bg-orange-100 text-orange-800' },
  validacion: { txt: 'Validación', clase: 'bg-sky-100 text-sky-800' },
  scorecard: { txt: 'Scorecard', clase: 'bg-violet-100 text-violet-800' },
  reporte: { txt: 'Reporte', clase: 'bg-emerald-100 text-emerald-800' },
  completo: { txt: 'Completo', clase: 'bg-emerald-600 text-white' },
};

export default function MisIdeas() {
  const [proyectos, setProyectos] = useState<ProyectoLista[]>([]);
  const [montado, setMontado] = useState(false);
  const [creando, setCreando] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [idea, setIdea] = useState('');
  const [sector, setSector] = useState('');
  const [tipoTrabajo, setTipoTrabajo] = useState('');
  const [tipoOtro, setTipoOtro] = useState('');
  const [universidad, setUniversidad] = useState('');
  const [uniOtra, setUniOtra] = useState('');
  const [guardando, setGuardando] = useState(false);

  const tipoFinal = tipoTrabajo === '__otra__' ? tipoOtro.trim() : tipoTrabajo;
  const uniFinal = universidad === '__otra__' ? uniOtra.trim() : universidad;

  const cargar = () => {
    fetch('/api/idea/proyectos', { credentials: 'include' })
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
      const res = await fetch('/api/idea/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          titulo: titulo.trim(),
          idea: idea.trim() || null,
          sector: sector.trim() || null,
          tipo_trabajo: tipoFinal || null,
          universidad: uniFinal || null,
        }),
      });
      if (res.ok) {
        setTitulo(''); setIdea(''); setSector(''); setTipoTrabajo(''); setTipoOtro(''); setUniversidad(''); setUniOtra(''); setCreando(false);
        cargar();
      }
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: string) => {
    if (!window.confirm('¿Eliminar esta idea? No se puede deshacer.')) return;
    await fetch(`/api/idea/proyectos/${id}`, { method: 'DELETE', credentials: 'include' });
    cargar();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="idea-accent-text text-xs font-semibold uppercase tracking-wider">Laboratorio</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Mis ideas</h1>
          <p className="idea-muted mt-2 text-sm">
            Cada idea recorre: Lean Canvas → propuesta de valor → validación →
            scorecard → reporte. Retoma donde lo dejaste.
          </p>
        </div>
        {!creando && (
          <button onClick={() => setCreando(true)} className="idea-btn-primary flex flex-shrink-0 items-center gap-1.5 px-4 py-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Nueva
          </button>
        )}
      </header>

      {creando && (
        <form onSubmit={crear} className="idea-card mb-5 p-5">
          <p className="idea-accent-text text-xs font-semibold uppercase tracking-wider">Define tu trabajo</p>

          {/* Tipo de trabajo + Universidad */}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">¿Qué trabajo final harás?</label>
              <select
                value={tipoTrabajo} onChange={(e) => setTipoTrabajo(e.target.value)}
                className="idea-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                <option value="">Elegir…</option>
                {MODALIDADES.map((m) => <option key={m.valor} value={m.valor}>{m.label}</option>)}
                <option value="__otra__">Otra…</option>
              </select>
              {tipoTrabajo === '__otra__' && (
                <input
                  value={tipoOtro} onChange={(e) => setTipoOtro(e.target.value)} placeholder="Escribe tu modalidad"
                  className="idea-border mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              )}
              {tipoTrabajo && tipoTrabajo !== '__otra__' && (
                <p className="idea-muted mt-1 text-xs">{MODALIDADES.find((m) => m.valor === tipoTrabajo)?.ayuda}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Universidad <span className="idea-muted font-normal">(opcional)</span></label>
              <select
                value={universidad} onChange={(e) => setUniversidad(e.target.value)}
                className="idea-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                <option value="">Elegir…</option>
                {UNIVERSIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                <option value="__otra__">Otra…</option>
              </select>
              {universidad === '__otra__' && (
                <input
                  value={uniOtra} onChange={(e) => setUniOtra(e.target.value)} placeholder="Escribe tu universidad"
                  className="idea-border mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              )}
            </div>
          </div>

          <label className="mt-4 block text-sm font-medium">Título de tu trabajo</label>
          <input
            autoFocus value={titulo} onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Delivery de almuerzos caseros para oficinistas"
            className="idea-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
          <label className="mt-3 block text-sm font-medium">¿Cuál es la idea? <span className="idea-muted font-normal">(opcional)</span></label>
          <textarea
            value={idea} onChange={(e) => setIdea(e.target.value)} rows={2}
            placeholder="En una frase: a quién ayudas y cómo. (Si aún no la tienes clara, la armas en el Lean Canvas.)"
            className="idea-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
          <label className="mt-3 block text-sm font-medium">Sector / rubro <span className="idea-muted font-normal">(opcional)</span></label>
          <input
            value={sector} onChange={(e) => setSector(e.target.value)}
            placeholder="Ej: Comida / delivery"
            className="idea-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={guardando || !titulo.trim()} className="idea-btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50">
              {guardando ? 'Creando…' : 'Crear y empezar →'}
            </button>
            <button type="button" onClick={() => { setCreando(false); setTitulo(''); setIdea(''); setSector(''); setTipoTrabajo(''); setTipoOtro(''); setUniversidad(''); setUniOtra(''); }} className="idea-btn-ghost px-4 py-2 text-sm">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {!montado && <div className="idea-muted py-10 text-center text-sm">Cargando…</div>}

      {montado && proyectos.length === 0 && !creando && (
        <div className="idea-card p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Layers className="idea-accent-text h-6 w-6" />
          </div>
          <p className="mt-3 font-semibold">Aún no tienes ideas</p>
          <p className="idea-muted mt-1 text-sm">Crea la primera para empezar con tu Lean Canvas.</p>
          <button onClick={() => setCreando(true)} className="idea-btn-primary mt-4 inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Crear idea
          </button>
        </div>
      )}

      {montado && proyectos.length > 0 && (
        <div className="space-y-3">
          {proyectos.map((p) => {
            const est = ESTADO_LABEL[p.estado];
            return (
              <div key={p.id} className="idea-card flex items-center gap-4 p-5">
                <div className="idea-accent-soft flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl">
                  <Layers className="idea-accent-text h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">{p.titulo}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-2 py-0.5 font-medium ${est.clase}`}>{est.txt}</span>
                    {p.tipo_trabajo && <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700 ring-1 ring-amber-200">{p.tipo_trabajo}</span>}
                    {(p.idea || p.sector) && <span className="idea-muted truncate">{p.idea || p.sector}</span>}
                  </div>
                </div>
                <button onClick={() => eliminar(p.id)} className="idea-muted flex-shrink-0 rounded-lg p-2 hover:bg-rose-50 hover:text-rose-600" title="Eliminar">
                  <Trash2 className="h-4 w-4" />
                </button>
                <Link href={`/idea/proyectos/${p.id}`} className="idea-btn-primary flex flex-shrink-0 items-center gap-1.5 px-4 py-2 text-sm font-medium">
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
