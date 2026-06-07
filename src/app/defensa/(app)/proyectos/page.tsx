'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus, Layers, Trash2, ArrowRight } from 'lucide-react';
import type { EstadoDefensa } from '@/types/defensa';

interface ProyectoLista {
  id: string;
  titulo: string;
  tema: string | null;
  carrera: string | null;
  estado: EstadoDefensa;
  actualizado_en: string;
}

const ESTADO_LABEL: Record<EstadoDefensa, { txt: string; clase: string }> = {
  preguntas: { txt: 'Banco de preguntas', clase: 'bg-indigo-100 text-indigo-800' },
  simulacro: { txt: 'Simulacro', clase: 'bg-violet-100 text-violet-800' },
  reporte: { txt: 'Reporte', clase: 'bg-emerald-100 text-emerald-800' },
  completo: { txt: 'Completo', clase: 'bg-emerald-600 text-white' },
};

export default function MisDefensas() {
  const [proyectos, setProyectos] = useState<ProyectoLista[]>([]);
  const [montado, setMontado] = useState(false);
  const [creando, setCreando] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [tema, setTema] = useState('');
  const [carrera, setCarrera] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = () => {
    fetch('/api/defensa/proyectos', { credentials: 'include' })
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
      const res = await fetch('/api/defensa/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ titulo: titulo.trim(), tema: tema.trim() || null, carrera: carrera.trim() || null }),
      });
      if (res.ok) {
        setTitulo(''); setTema(''); setCarrera(''); setCreando(false);
        cargar();
      }
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: string) => {
    if (!window.confirm('¿Eliminar esta preparación? No se puede deshacer.')) return;
    await fetch(`/api/defensa/proyectos/${id}`, { method: 'DELETE', credentials: 'include' });
    cargar();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="def-accent-text text-xs font-semibold uppercase tracking-wider">Laboratorio</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Mis defensas</h1>
          <p className="def-muted mt-2 text-sm">
            Cada preparación recorre: banco de preguntas → simulacro evaluado por
            IA → reporte. Retoma donde lo dejaste.
          </p>
        </div>
        {!creando && (
          <button onClick={() => setCreando(true)} className="def-btn-primary flex flex-shrink-0 items-center gap-1.5 px-4 py-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Nueva
          </button>
        )}
      </header>

      {creando && (
        <form onSubmit={crear} className="def-card mb-5 p-5">
          <label className="text-sm font-medium">Título del trabajo</label>
          <input
            autoFocus value={titulo} onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Defensa — Plan de negocios cafetería La Orquídea"
            className="def-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <label className="mt-3 block text-sm font-medium">Tema del trabajo <span className="def-muted font-normal">(opcional)</span></label>
          <textarea
            value={tema} onChange={(e) => setTema(e.target.value)} rows={2}
            placeholder="De qué trata tu tesis/proyecto, en una o dos frases."
            className="def-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <label className="mt-3 block text-sm font-medium">Carrera <span className="def-muted font-normal">(opcional)</span></label>
          <input
            value={carrera} onChange={(e) => setCarrera(e.target.value)}
            placeholder="Ej: Administración de Empresas"
            className="def-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <div className="mt-3 flex gap-2">
            <button type="submit" disabled={guardando || !titulo.trim()} className="def-btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50">
              {guardando ? 'Creando…' : 'Crear preparación'}
            </button>
            <button type="button" onClick={() => { setCreando(false); setTitulo(''); setTema(''); setCarrera(''); }} className="def-btn-ghost px-4 py-2 text-sm">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {!montado && <div className="def-muted py-10 text-center text-sm">Cargando…</div>}

      {montado && proyectos.length === 0 && !creando && (
        <div className="def-card p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <Layers className="def-accent-text h-6 w-6" />
          </div>
          <p className="mt-3 font-semibold">Aún no tienes preparaciones</p>
          <p className="def-muted mt-1 text-sm">Crea la primera para armar tu banco de preguntas.</p>
          <button onClick={() => setCreando(true)} className="def-btn-primary mt-4 inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Crear preparación
          </button>
        </div>
      )}

      {montado && proyectos.length > 0 && (
        <div className="space-y-3">
          {proyectos.map((p) => {
            const est = ESTADO_LABEL[p.estado];
            return (
              <div key={p.id} className="def-card flex items-center gap-4 p-5">
                <div className="def-accent-soft flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl">
                  <Layers className="def-accent-text h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">{p.titulo}</h2>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className={`rounded-full px-2 py-0.5 font-medium ${est.clase}`}>{est.txt}</span>
                    {(p.tema || p.carrera) && <span className="def-muted truncate">{p.carrera || p.tema}</span>}
                  </div>
                </div>
                <button onClick={() => eliminar(p.id)} className="def-muted flex-shrink-0 rounded-lg p-2 hover:bg-rose-50 hover:text-rose-600" title="Eliminar">
                  <Trash2 className="h-4 w-4" />
                </button>
                <Link href={`/defensa/proyectos/${p.id}`} className="def-btn-primary flex flex-shrink-0 items-center gap-1.5 px-4 py-2 text-sm font-medium">
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
