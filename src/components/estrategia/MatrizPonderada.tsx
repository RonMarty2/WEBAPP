'use client';

import { useState } from 'react';
import { Plus, X, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SugerirIA } from '@/components/compartido/SugerirIA';
import type { FilaMatriz } from '@/types/estrategia';

/**
 * Componente reusable de matriz ponderada (MEFE y MEFI comparten lógica):
 * filas con factor + peso (0-1) + calificación (1-4). Total ponderado = Σ(peso×calif).
 * Promedio de referencia = 2.5. Mayor = mejor posición.
 */
export function MatrizPonderada({
  proyectoId,
  campo,
  titulo,
  subtitulo,
  descripcion,
  sugerencias,
  tareaIA,
  interpretacion,
}: {
  proyectoId: string;
  campo: 'mefe' | 'mefi';
  titulo: string;
  subtitulo: string;
  descripcion: string;
  sugerencias: string[];
  tareaIA: string;
  interpretacion: { alto: string; bajo: string };
}) {
  const [filas, setFilas] = useState<FilaMatriz[]>([]);
  const [titProyecto, setTitProyecto] = useState('');
  const [sector, setSector] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [nuevo, setNuevo] = useState('');
  const [verSug, setVerSug] = useState(false);

  // Carga inicial
  useState(() => {
    fetch(`/api/estrategia/proyectos/${proyectoId}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.proyecto) {
          setTitProyecto(d.proyecto.titulo ?? '');
          setSector(d.proyecto.sector ?? '');
          const m = d.proyecto[campo];
          if (m?.filas) setFilas(m.filas);
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  });

  const agregar = (factor: string) => {
    if (!factor.trim()) return;
    setFilas((f) => [...f, { factor: factor.trim(), peso: 0, calificacion: 3 }]);
  };
  const actualizar = (i: number, c: Partial<FilaMatriz>) =>
    setFilas((f) => f.map((row, idx) => (idx === i ? { ...row, ...c } : row)));
  const eliminar = (i: number) => setFilas((f) => f.filter((_, idx) => idx !== i));

  const sumaPesos = filas.reduce((s, f) => s + (f.peso || 0), 0);
  const totalPonderado = filas.reduce((s, f) => s + (f.peso || 0) * (f.calificacion || 0), 0);
  const pesosOk = Math.abs(sumaPesos - 1) < 0.02;

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const res = await fetch(`/api/estrategia/proyectos/${proyectoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [campo]: { filas } }),
      });
      if (res.ok) {
        setGuardado(true);
        if (volver) window.location.href = `/estrategia/analisis/${proyectoId}`;
      }
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="es-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/estrategia/analisis/${proyectoId}`} className="es-muted inline-flex items-center gap-1 text-sm hover:text-violet-700">
        <ArrowLeft className="h-4 w-4" /> Volver al análisis
      </Link>

      <header className="mt-4">
        <p className="es-accent-text text-xs font-semibold uppercase tracking-wider">{subtitulo}</p>
        <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
        <p className="es-muted mt-2 text-sm">{descripcion}</p>
      </header>

      {/* Resumen */}
      <div className="es-card mt-5 flex flex-wrap items-center gap-5 p-4">
        <div>
          <p className="es-muted text-[11px] uppercase tracking-wider">Total ponderado</p>
          <p className="es-accent-text text-3xl font-bold">{totalPonderado.toFixed(2)}</p>
        </div>
        <div>
          <p className="es-muted text-[11px] uppercase tracking-wider">Suma de pesos</p>
          <p className={`text-lg font-bold ${pesosOk ? 'text-emerald-600' : 'text-amber-600'}`}>
            {sumaPesos.toFixed(2)} {pesosOk ? '✓' : '(debe sumar 1.00)'}
          </p>
        </div>
        <p className="es-muted flex-1 text-xs">
          {totalPonderado >= 2.5 ? interpretacion.alto : interpretacion.bajo}
        </p>
      </div>

      {/* Tabla de factores */}
      <div className="es-card mt-5 p-5">
        <div className="mb-2 hidden grid-cols-[1fr_70px_70px_70px_28px] gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-400 sm:grid">
          <span>Factor</span><span>Peso</span><span>Calif.</span><span>Pond.</span><span></span>
        </div>
        <div className="space-y-2">
          {filas.map((f, i) => (
            <div key={i} className="grid grid-cols-[1fr_70px_70px_70px_28px] items-center gap-2">
              <input
                value={f.factor}
                onChange={(e) => actualizar(i, { factor: e.target.value })}
                className="es-border rounded-lg border bg-white px-2 py-1.5 text-sm focus:border-violet-500 focus:outline-none"
              />
              <input
                type="number" step="0.05" min="0" max="1" value={f.peso}
                onChange={(e) => actualizar(i, { peso: parseFloat(e.target.value) || 0 })}
                className="es-border rounded-lg border bg-white px-2 py-1.5 text-sm focus:border-violet-500 focus:outline-none"
              />
              <select
                value={f.calificacion}
                onChange={(e) => actualizar(i, { calificacion: parseInt(e.target.value, 10) })}
                className="es-border rounded-lg border bg-white px-1 py-1.5 text-sm focus:outline-none"
              >
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="text-center text-sm font-medium">{((f.peso || 0) * (f.calificacion || 0)).toFixed(2)}</span>
              <button onClick={() => eliminar(i)} className="es-muted rounded p-1 hover:bg-rose-50 hover:text-rose-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={nuevo} onChange={(e) => setNuevo(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregar(nuevo); setNuevo(''); } }}
            placeholder="Agregar factor…"
            className="es-border flex-1 rounded-lg border bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
          <button onClick={() => { agregar(nuevo); setNuevo(''); }} className="es-btn-ghost flex items-center gap-1 px-3 py-2 text-sm">
            <Plus className="h-4 w-4" /> Agregar
          </button>
        </div>

        <p className="es-muted mt-2 text-xs">
          Peso: importancia relativa (0 a 1, todos suman 1). Calificación: 1=responde mal, 4=responde muy bien.
        </p>
      </div>

      {/* Sugerencias + IA */}
      <div className="mt-4 space-y-3">
        <div className="es-card p-4">
          <button onClick={() => setVerSug((v) => !v)} className="es-accent-text text-xs font-medium">
            💡 {verSug ? 'Ocultar' : 'Ver'} sugerencias bolivianas
          </button>
          {verSug && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {sugerencias.map((s) => (
                <button key={s} onClick={() => agregar(s)} className="es-border rounded-full border px-2.5 py-1 text-xs hover:bg-violet-50">+ {s}</button>
              ))}
            </div>
          )}
        </div>
        <SugerirIA
          modulo="estrategia"
          tarea={tareaIA}
          formato="lista"
          acentoClase="es-accent-bg text-white"
          placeholder={`Sector: ${sector || titProyecto || 'tu proyecto'}…`}
          onAplicar={(texto) => {
            texto.split('\n').map((l) => l.replace(/^[-*\d.\s]+/, '').trim()).filter(Boolean).forEach(agregar);
          }}
        />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => guardar(false)} disabled={guardando} className="es-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50">
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
        <button onClick={() => guardar(true)} disabled={guardando} className="es-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50">
          Guardar y volver →
        </button>
        {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
      </div>
    </div>
  );
}
