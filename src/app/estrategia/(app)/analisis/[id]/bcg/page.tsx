'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, PieChart, Plus, X, Check } from 'lucide-react';
import type { Bcg } from '@/types/estrategia';

const VACIO: Bcg = { unidades: [] };

/** Cuadrante BCG según crecimiento (Y) y participación relativa (X). */
function cuadrante(crecimiento: number, participacion: number): { nombre: string; color: string; consejo: string } {
  const altoCrec = crecimiento >= 10; // % crecimiento del mercado
  const altaPart = participacion >= 1; // participación relativa (>1 = líder)
  if (altoCrec && altaPart) return { nombre: 'Estrella', color: 'bg-amber-400', consejo: 'Invierte para mantener el liderazgo.' };
  if (altoCrec && !altaPart) return { nombre: 'Interrogante', color: 'bg-sky-400', consejo: 'Decide: invertir fuerte o abandonar.' };
  if (!altoCrec && altaPart) return { nombre: 'Vaca lechera', color: 'bg-emerald-400', consejo: 'Genera caja; ordéñala para financiar otras.' };
  return { nombre: 'Perro', color: 'bg-rose-400', consejo: 'Bajo potencial; considera desinvertir.' };
}

export default function HerramientaBCG() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [bcg, setBcg] = useState<Bcg>(VACIO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState('');

  useEffect(() => {
    fetch(`/api/estrategia/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (d.proyecto?.bcg?.unidades) setBcg({ unidades: d.proyecto.bcg.unidades }); })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const add = () => setBcg((b) => ({ unidades: [...b.unidades, { nombre: 'Producto/Línea', crecimiento: 10, participacion: 1 }] }));
  const upd = (i: number, c: Partial<{ nombre: string; crecimiento: number; participacion: number }>) =>
    setBcg((b) => ({ unidades: b.unidades.map((u, idx) => (idx === i ? { ...u, ...c } : u)) }));
  const del = (i: number) => setBcg((b) => ({ unidades: b.unidades.filter((_, idx) => idx !== i) }));

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false); setErrorGuardar('');
    try {
      const res = await fetch(`/api/estrategia/proyectos/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ bcg }),
      });
      if (res.ok) {
        setGuardado(true);
        if (volver) router.push(`/estrategia/analisis/${params.id}`);
      } else {
        const d = await res.json().catch(() => ({}));
        setErrorGuardar(d.error || `No se pudo guardar (error ${res.status}). Intenta de nuevo.`);
      }
    } catch {
      setErrorGuardar('No se pudo guardar. Verifica tu conexión.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="es-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/estrategia/analisis/${params.id}`} className="es-muted inline-flex items-center gap-1 text-sm hover:text-violet-700">
        <ArrowLeft className="h-4 w-4" /> Volver al análisis
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="es-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <PieChart className="es-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="es-accent-text text-xs font-semibold uppercase tracking-wider">Portafolio</p>
          <h1 className="text-2xl font-bold tracking-tight">Matriz BCG</h1>
        </div>
      </header>
      <p className="es-muted mt-2 text-sm">
        Clasifica tus productos/líneas según el crecimiento del mercado y su
        participación relativa. Útil si tu negocio tiene varias líneas.
      </p>

      {/* Gráfico 2x2 */}
      <div className="es-card mt-5 p-5">
        <div className="relative mx-auto aspect-square w-full max-w-md">
          <div className="grid h-full w-full grid-cols-2 grid-rows-2 overflow-hidden rounded-lg border border-violet-200">
            <div className="border border-violet-100 bg-amber-50/50 p-2 text-[10px] text-amber-700">★ Estrella<br/>(alto crec. · alta part.)</div>
            <div className="border border-violet-100 bg-sky-50/50 p-2 text-[10px] text-sky-700">? Interrogante<br/>(alto crec. · baja part.)</div>
            <div className="border border-violet-100 bg-emerald-50/50 p-2 text-[10px] text-emerald-700">🐄 Vaca lechera<br/>(bajo crec. · alta part.)</div>
            <div className="border border-violet-100 bg-rose-50/50 p-2 text-[10px] text-rose-700">🐕 Perro<br/>(bajo crec. · baja part.)</div>
          </div>
          {bcg.unidades.map((u, i) => {
            const c = cuadrante(u.crecimiento, u.participacion);
            // X: participación 2→0 (izq→der), Y: crecimiento 20→0 (arriba→abajo)
            const x = (1 - Math.min(2, Math.max(0, u.participacion)) / 2) * 100;
            const y = (1 - Math.min(20, Math.max(0, u.crecimiento)) / 20) * 100;
            return (
              <div key={i} className={`absolute flex h-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full px-2 text-[10px] font-bold text-white ring-2 ring-white ${c.color}`}
                style={{ left: `${x}%`, top: `${y}%` }} title={`${u.nombre} — ${c.nombre}`}>
                {i + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabla de unidades */}
      <div className="es-card mt-4 p-4">
        <div className="space-y-2">
          {bcg.unidades.map((u, i) => {
            const c = cuadrante(u.crecimiento, u.participacion);
            return (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <span className="es-accent-soft es-accent-text flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">{i + 1}</span>
                <input value={u.nombre} onChange={(e) => upd(i, { nombre: e.target.value })} className="es-border min-w-32 flex-1 rounded border px-2 py-1 text-sm" />
                <label className="es-muted text-xs">Crec.%
                  <input type="number" value={u.crecimiento} onChange={(e) => upd(i, { crecimiento: parseFloat(e.target.value) || 0 })} className="es-border ml-1 w-16 rounded border px-1.5 py-1 text-sm" />
                </label>
                <label className="es-muted text-xs">Part.rel
                  <input type="number" step="0.1" value={u.participacion} onChange={(e) => upd(i, { participacion: parseFloat(e.target.value) || 0 })} className="es-border ml-1 w-16 rounded border px-1.5 py-1 text-sm" />
                </label>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${c.color}`}>{c.nombre}</span>
                <button onClick={() => del(i)} className="text-slate-300 hover:text-rose-600" aria-label={`Eliminar ${u.nombre || `unidad ${i + 1}`}`}><X className="h-4 w-4" aria-hidden="true" /></button>
              </div>
            );
          })}
        </div>
        <button onClick={add} className="es-btn-ghost mt-3 flex items-center gap-1 px-3 py-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Agregar producto/línea</button>
        <p className="es-muted mt-2 text-xs">Participación relativa &gt;1 = eres líder vs tu mayor competidor. Crecimiento del mercado en % anual.</p>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => guardar(false)} disabled={guardando} className="es-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50">{guardando ? 'Guardando…' : 'Guardar'}</button>
        <button onClick={() => guardar(true)} disabled={guardando} className="es-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50">Guardar y volver →</button>
        {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
        {errorGuardar && (
          <span className="text-sm text-rose-700" role="alert">{errorGuardar}</span>
        )}
      </div>
    </div>
  );
}
