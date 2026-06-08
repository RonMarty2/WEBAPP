'use client';

/**
 * Página del alumno: lista de todas las observaciones que sus docentes
 * le han dejado. Puede responder y marcarlas como atendidas.
 *
 * Wave 3 del panel docente — lado del alumno.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Check, CheckCircle2 } from 'lucide-react';

interface Observacion {
  id: string;
  docente_id: string;
  /** Snapshot del nombre del docente que dejó la observación. */
  docente_nombre?: string;
  modulo: string;
  proyecto_id: string;
  proyecto_titulo: string;
  observacion: string;
  estado: 'pendiente' | 'atendida' | 'descartada';
  respuesta_alumno: string | null;
  creada_en: string;
}

const ESTADO_BADGE: Record<Observacion['estado'], { label: string; cls: string }> = {
  pendiente:   { label: 'Pendiente',  cls: 'bg-amber-100 text-amber-800' },
  atendida:    { label: 'Atendida',   cls: 'bg-emerald-100 text-emerald-800' },
  descartada:  { label: 'Descartada', cls: 'bg-slate-100 text-slate-500' },
};

const MODULO_META: Record<string, { nombre: string; emoji: string }> = {
  idea:         { nombre: 'Idea',         emoji: '💡' },
  mercados:     { nombre: 'Mercados',     emoji: '📊' },
  estrategia:   { nombre: 'Estrategia',   emoji: '🎯' },
  marketing:    { nombre: 'Marketing',    emoji: '📣' },
  organizacion: { nombre: 'Organización', emoji: '🏢' },
  finanzas:     { nombre: 'Finanzas',     emoji: '💰' },
  defensa:      { nombre: 'Defensa',      emoji: '🎓' },
  generador:    { nombre: 'Generador',    emoji: '✨' },
};

function fmtFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function MisObservaciones() {
  const router = useRouter();
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<string | null>(null);
  const [respuesta, setRespuesta] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [filtro, setFiltro] = useState<'todas' | 'pendiente' | 'atendida'>('pendiente');

  const cargar = () => {
    setCargando(true);
    fetch('/api/alumno/observaciones', { credentials: 'include' })
      .then(async (r) => {
        if (r.status === 401) { router.replace('/login'); return null; }
        return r.json();
      })
      .then((d) => { if (d) setObservaciones(d.observaciones ?? []); })
      .catch(() => {})
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []); // eslint-disable-line react-hooks/exhaustive-deps

  const guardarRespuesta = async (id: string, nuevoEstado: 'pendiente' | 'atendida') => {
    setEnviando(true);
    try {
      const res = await fetch(`/api/alumno/observaciones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          respuesta_alumno: respuesta.trim() || undefined,
          estado: nuevoEstado,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setObservaciones((prev) => prev.map((o) => o.id === id ? d.observacion : o));
        setEditando(null);
        setRespuesta('');
      }
    } finally {
      setEnviando(false);
    }
  };

  const visibles = observaciones.filter((o) => {
    if (filtro === 'pendiente') return o.estado === 'pendiente';
    if (filtro === 'atendida') return o.estado === 'atendida';
    return true;
  });

  const pendientes = observaciones.filter((o) => o.estado === 'pendiente').length;

  return (
    <div className="mx-auto max-w-3xl p-6 pb-10">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Inicio
      </Link>

      <header className="mt-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">Observaciones de mis docentes</p>
          <h1 className="text-2xl font-bold tracking-tight">Mis observaciones</h1>
          <p className="text-sm text-slate-500">
            {pendientes === 0
              ? 'No tienes observaciones pendientes.'
              : `Tienes ${pendientes} ${pendientes === 1 ? 'observación pendiente' : 'observaciones pendientes'} por atender.`}
          </p>
        </div>
      </header>

      <div className="mt-5 flex flex-wrap gap-2">
        {(['pendiente', 'atendida', 'todas'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filtro === f
                ? 'bg-violet-600 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f === 'pendiente' && `Pendientes (${pendientes})`}
            {f === 'atendida' && 'Atendidas'}
            {f === 'todas' && 'Todas'}
          </button>
        ))}
      </div>

      {cargando ? (
        <p className="mt-5 text-sm text-slate-500">Cargando…</p>
      ) : visibles.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-slate-700">
            {filtro === 'pendiente'
              ? '¡Sin pendientes! Estás al día con tu docente.'
              : filtro === 'atendida'
                ? 'Aún no tienes observaciones atendidas.'
                : 'No tienes observaciones todavía.'}
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {visibles.map((o) => {
            const meta = MODULO_META[o.modulo] ?? { nombre: o.modulo, emoji: '📄' };
            const esEditando = editando === o.id;
            return (
              <li key={o.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-2">
                  <span className="text-lg" aria-hidden="true">{meta.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700">{meta.nombre}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="truncate text-xs text-slate-600">{o.proyecto_titulo}</span>
                      <span className={`ml-auto flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${ESTADO_BADGE[o.estado].cls}`}>
                        {ESTADO_BADGE[o.estado].label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-800">{o.observacion}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      De <strong className="text-slate-600">{o.docente_nombre ?? 'tu docente'}</strong> · Recibida el {fmtFecha(o.creada_en)}
                    </p>

                    {o.respuesta_alumno && !esEditando && (
                      <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-900">
                        <strong>Tu respuesta:</strong> {o.respuesta_alumno}
                      </div>
                    )}

                    {esEditando ? (
                      <div className="mt-3">
                        <textarea
                          value={respuesta}
                          onChange={(e) => setRespuesta(e.target.value)}
                          placeholder="¿Qué hiciste para atender esta observación? (opcional)"
                          rows={3}
                          autoFocus
                          aria-label="Respuesta a la observación"
                          className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-200"
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <button
                            onClick={() => { setEditando(null); setRespuesta(''); }}
                            className="rounded-md px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => guardarRespuesta(o.id, 'atendida')}
                            disabled={enviando}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <Check className="h-3 w-3" aria-hidden="true" />
                            {enviando ? 'Guardando…' : 'Marcar como atendida'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      o.estado === 'pendiente' && (
                        <button
                          onClick={() => { setEditando(o.id); setRespuesta(o.respuesta_alumno ?? ''); }}
                          className="mt-3 inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-medium text-violet-700 hover:bg-violet-100"
                        >
                          <Check className="h-3 w-3" aria-hidden="true" />
                          Responder y marcar como atendida
                        </button>
                      )
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
