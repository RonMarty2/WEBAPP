'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, FolderSearch, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import type { EstadoProyecto } from '@/types/mercados';

interface ProyectoLista {
  id: string;
  titulo: string;
  estado: EstadoProyecto;
  creado_en: string;
  actualizado_en: string;
}

const ESTADO_LABEL: Record<EstadoProyecto, { txt: string; clase: string }> = {
  diseno: { txt: 'Diseño', clase: 'bg-slate-100 text-slate-700' },
  muestreo: { txt: 'Muestreo', clase: 'bg-sky-100 text-sky-800' },
  encuesta: { txt: 'Encuesta', clase: 'bg-violet-100 text-violet-800' },
  recoleccion: { txt: 'Recolección', clase: 'bg-amber-100 text-amber-800' },
  analisis: { txt: 'Análisis', clase: 'bg-indigo-100 text-indigo-800' },
  reporte: { txt: 'Reporte', clase: 'bg-emerald-100 text-emerald-800' },
  completo: { txt: 'Completo', clase: 'bg-emerald-600 text-white' },
};

// Wrapper que envuelve el componente real en <Suspense> porque
// useSearchParams() requiere boundary explícito en Next.js 16 strict
// para que la página pueda generarse estáticamente.
export default function MisInvestigacionesPage() {
  return (
    <Suspense fallback={null}>
      <MisInvestigaciones />
    </Suspense>
  );
}

function MisInvestigaciones() {
  const searchParams = useSearchParams();
  // Si llegamos desde otro módulo (ej. Idea) con ?titulo=...&desde=idea,
  // abrimos el formulario "Nueva" ya pre-llenado. Solo lo verán los
  // estudiantes Pro/Elite porque SiguienteModulo solo agrega los params
  // cuando el plan es premium.
  const tituloPrellenado = searchParams.get('titulo') ?? '';
  const desde = searchParams.get('desde');

  const [proyectos, setProyectos] = useState<ProyectoLista[]>([]);
  const [montado, setMontado] = useState(false);
  const [creando, setCreando] = useState(!!tituloPrellenado);
  const [titulo, setTitulo] = useState(tituloPrellenado);
  const [guardando, setGuardando] = useState(false);

  const cargar = () => {
    fetch('/api/mercados/proyectos', { credentials: 'include' })
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
      const res = await fetch('/api/mercados/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ titulo: titulo.trim() }),
      });
      if (res.ok) {
        setTitulo('');
        setCreando(false);
        cargar();
      }
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: string) => {
    if (!window.confirm('¿Eliminar esta investigación? No se puede deshacer.')) return;
    await fetch(`/api/mercados/proyectos/${id}`, { method: 'DELETE', credentials: 'include' });
    cargar();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mk-accent-text text-xs font-semibold uppercase tracking-wider">
            Laboratorio
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Mis investigaciones</h1>
          <p className="mk-muted mt-2 text-sm">
            Cada investigación avanza por etapas: diseño → muestreo → encuesta →
            recolección → análisis → reporte. Retoma donde la dejaste.
          </p>
        </div>
        {!creando && (
          <button
            onClick={() => setCreando(true)}
            className="mk-btn-primary flex flex-shrink-0 items-center gap-1.5 px-4 py-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Nueva
          </button>
        )}
      </header>

      {creando && (
        <form onSubmit={crear} className="mk-card mb-5 p-5">
          {tituloPrellenado && (
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs text-violet-900">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-violet-600" />
              <span>
                Título tomado desde <strong>{desde === 'idea' ? 'tu Idea' : 'tu módulo anterior'}</strong>.
                Puedes editarlo si quieres ajustarlo para esta investigación.
              </span>
            </div>
          )}
          <label className="text-sm font-medium">Título de la investigación</label>
          <p className="mk-muted text-xs">Ej: Demanda de cafetería en la zona norte de Cochabamba</p>
          <input
            autoFocus
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Escribe un título descriptivo"
            className="mk-border mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={guardando || !titulo.trim()}
              className="mk-btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {guardando ? 'Creando…' : 'Crear investigación'}
            </button>
            <button
              type="button"
              onClick={() => { setCreando(false); setTitulo(''); }}
              className="mk-btn-ghost px-4 py-2 text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {!montado && (
        <div className="mk-muted py-10 text-center text-sm">Cargando…</div>
      )}

      {montado && proyectos.length === 0 && !creando && (
        <div className="mk-card p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
            <FolderSearch className="mk-accent-text h-6 w-6" />
          </div>
          <p className="mt-3 font-semibold">Aún no tienes investigaciones</p>
          <p className="mk-muted mt-1 text-sm">
            Crea tu primera para empezar a diseñar tu estudio de mercado.
          </p>
          <button
            onClick={() => setCreando(true)}
            className="mk-btn-primary mt-4 inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Crear investigación
          </button>
        </div>
      )}

      {montado && proyectos.length > 0 && (
        <div className="space-y-3">
          {proyectos.map((p) => {
            const est = ESTADO_LABEL[p.estado];
            return (
              <div key={p.id} className="mk-card flex items-center gap-4 p-5">
                <div className="mk-accent-soft flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl">
                  <FolderSearch className="mk-accent-text h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">{p.titulo}</h2>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className={`rounded-full px-2 py-0.5 font-medium ${est.clase}`}>
                      {est.txt}
                    </span>
                    <span className="mk-muted">
                      Actualizada {new Date(p.actualizado_en).toLocaleDateString('es-BO')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => eliminar(p.id)}
                  className="mk-muted flex-shrink-0 rounded-lg p-2 hover:bg-rose-50 hover:text-rose-600"
                  title="Eliminar"
                  aria-label={`Eliminar investigación ${p.titulo}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
                <Link
                  href={`/mercados/proyecto/${p.id}`}
                  className="mk-btn-primary flex flex-shrink-0 items-center gap-1.5 px-4 py-2 text-sm font-medium"
                >
                  Continuar
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
