'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, FolderGit2, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import type { ProyectoMaestro } from '@/types/maestro';

// IMPORTANTE: estas etiquetas deben coincidir EXACTAMENTE con las claves de
// FLUJO_POR_MODALIDAD en src/lib/flujos/por-modalidad.ts. Antes había un
// casing mismatch ("Proyecto de grado" minúscula vs "Proyecto de Grado")
// que hacía caer al flujo default (todos los módulos) en vez del flujo
// específico de la modalidad.
const MODALIDADES = ['Proyecto de Grado', 'Tesis', 'Monografía', 'Trabajo Dirigido', 'Otro'];

const DESDE_LABEL: Record<string, string> = {
  idea: 'tu Idea',
  mercados: 'tu investigación de Mercados',
  estrategia: 'tu análisis estratégico',
  marketing: 'tu plan de marketing',
  organizacion: 'tu proyecto organizacional',
  finanzas: 'tu simulador financiero',
  defensa: 'tu preparación de defensa',
};

export default function GeneradorHubPage() {
  return (
    <Suspense fallback={null}>
      <GeneradorHub />
    </Suspense>
  );
}

function GeneradorHub() {
  const searchParams = useSearchParams();
  const tituloPrellenado = searchParams.get('titulo') ?? '';
  const desde = searchParams.get('desde');

  const [proyectos, setProyectos] = useState<ProyectoMaestro[]>([]);
  const [montado, setMontado] = useState(false);
  const [creando, setCreando] = useState(!!tituloPrellenado);
  const [form, setForm] = useState({ titulo: tituloPrellenado, tipo_negocio: '', sector: '', descripcion: '', departamento: '', modalidad: '', universidad: '' });
  const [guardando, setGuardando] = useState(false);

  const cargar = () => {
    fetch('/api/maestro', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setProyectos(d.proyectos ?? []))
      .catch(() => {})
      .finally(() => setMontado(true));
  };
  useEffect(cargar, []);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) return;
    setGuardando(true);
    try {
      const body: Record<string, string> = {};
      for (const [k, v] of Object.entries(form)) if (v.trim()) body[k] = v.trim();
      const res = await fetch('/api/maestro', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setForm({ titulo: '', tipo_negocio: '', sector: '', descripcion: '', departamento: '', modalidad: '', universidad: '' });
        setCreando(false);
        cargar();
      }
    } finally { setGuardando(false); }
  };

  const eliminar = async (id: string) => {
    if (!window.confirm('¿Eliminar este proyecto maestro? Se desvincularán sus módulos (no se borran los módulos).')) return;
    await fetch(`/api/maestro/${id}`, { method: 'DELETE', credentials: 'include' });
    cargar();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <p className="gen-accent-text text-xs font-semibold uppercase tracking-wider">Modo conectado</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Tu proyecto, todo junto</h1>
        <p className="gen-muted mt-2 max-w-2xl text-sm leading-relaxed">
          Crea tu proyecto una vez y vincula lo que trabajaste en cada módulo
          (idea, mercados, estrategia, marketing, organización, finanzas y defensa).
          La IA consolidará <strong>tu</strong> trabajo real, no datos inventados.
        </p>
      </header>

      <div className="mb-5 flex justify-end">
        {!creando && (
          <button onClick={() => setCreando(true)} className="gen-btn-primary flex items-center gap-1.5 px-4 py-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Nuevo proyecto
          </button>
        )}
      </div>

      {creando && (
        <form onSubmit={crear} className="gen-card mb-5 p-5">
          {tituloPrellenado && (
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs text-violet-900">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-violet-600" />
              <span>
                Título tomado desde <strong>{(desde && DESDE_LABEL[desde]) || 'tu módulo anterior'}</strong>.
                Completa los demás campos (sector, modalidad, universidad) para enriquecer el contexto que la IA usará.
              </span>
            </div>
          )}
          <h2 className="text-sm font-semibold">Nuevo proyecto maestro</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Campo label="Título *" value={form.titulo} onChange={(v) => set('titulo', v)} placeholder="Ej: Cafetería La Orquídea" full autoFocus />
            <Campo label="Tipo de negocio" value={form.tipo_negocio} onChange={(v) => set('tipo_negocio', v)} placeholder="Ej: Cafetería de especialidad" />
            <Campo label="Sector" value={form.sector} onChange={(v) => set('sector', v)} placeholder="Ej: Gastronomía" />
            <Campo label="Departamento" value={form.departamento} onChange={(v) => set('departamento', v)} placeholder="Ej: Cochabamba" />
            <Campo label="Universidad" value={form.universidad} onChange={(v) => set('universidad', v)} placeholder="Ej: UMSS" />
            <label className="block">
              <span className="gen-muted text-xs font-medium">Modalidad</span>
              <select value={form.modalidad} onChange={(e) => set('modalidad', e.target.value)}
                className="gen-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200">
                <option value="">—</option>
                {MODALIDADES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
          </div>
          <label className="mt-3 block">
            <span className="gen-muted text-xs font-medium">Descripción</span>
            <textarea value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} rows={2}
              placeholder="En una o dos frases, de qué trata tu proyecto."
              className="gen-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200" />
          </label>
          <div className="mt-3 flex gap-2">
            <button type="submit" disabled={guardando || !form.titulo.trim()} className="gen-btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50">
              {guardando ? 'Creando…' : 'Crear proyecto'}
            </button>
            <button type="button" onClick={() => setCreando(false)} className="gen-btn-ghost px-4 py-2 text-sm">Cancelar</button>
          </div>
        </form>
      )}

      {!montado && <div className="gen-muted py-10 text-center text-sm">Cargando…</div>}

      {montado && proyectos.length === 0 && !creando && (
        <div className="gen-card p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
            <Sparkles className="gen-accent-text h-6 w-6" />
          </div>
          <p className="mt-3 font-semibold">Aún no tienes proyectos</p>
          <p className="gen-muted mt-1 text-sm">Crea tu proyecto maestro y empieza a conectar tus módulos.</p>
          <button onClick={() => setCreando(true)} className="gen-btn-primary mt-4 inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Crear proyecto
          </button>
        </div>
      )}

      {montado && proyectos.length > 0 && (
        <div className="space-y-3">
          {proyectos.map((p) => (
            <div key={p.id} className="gen-card flex items-center gap-4 p-5">
              <div className="gen-accent-soft flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl">
                <FolderGit2 className="gen-accent-text h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-semibold">{p.titulo}</h2>
                <p className="gen-muted truncate text-xs">
                  {[p.tipo_negocio, p.sector, p.modalidad].filter(Boolean).join(' · ') || 'Sin detalles aún'}
                </p>
              </div>
              <button onClick={() => eliminar(p.id)} className="gen-muted flex-shrink-0 rounded-lg p-2 hover:bg-rose-50 hover:text-rose-600" title="Eliminar" aria-label={`Eliminar proyecto ${p.titulo}`}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
              <Link href={`/generador/${p.id}`} className="gen-btn-primary flex flex-shrink-0 items-center gap-1.5 px-4 py-2 text-sm font-medium">
                Abrir <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Campo({ label, value, onChange, placeholder, full, autoFocus }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; full?: boolean; autoFocus?: boolean;
}) {
  return (
    <label className={`block ${full ? 'sm:col-span-2' : ''}`}>
      <span className="gen-muted text-xs font-medium">{label}</span>
      <input
        autoFocus={autoFocus} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="gen-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
      />
    </label>
  );
}
