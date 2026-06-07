'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Crosshair, Plus, X, Check } from 'lucide-react';
import type { Mpc } from '@/types/estrategia';

const VACIO: Mpc = {
  factores: [{ factor: 'Precio', peso: 0.25 }, { factor: 'Calidad', peso: 0.25 }, { factor: 'Ubicación', peso: 0.25 }, { factor: 'Atención al cliente', peso: 0.25 }],
  competidores: [
    { nombre: 'Mi empresa', esMiEmpresa: true, calificaciones: [3, 3, 3, 3] },
    { nombre: 'Competidor 1', calificaciones: [3, 3, 3, 3] },
  ],
};

export default function HerramientaMPC() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [mpc, setMpc] = useState<Mpc>(VACIO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    fetch(`/api/estrategia/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        const m = d.proyecto?.mpc;
        if (m?.factores?.length) setMpc({ factores: m.factores, competidores: m.competidores ?? VACIO.competidores });
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const totalPeso = mpc.factores.reduce((s, f) => s + (f.peso || 0), 0);
  const pesosOk = Math.abs(totalPeso - 1) < 0.02;
  const puntaje = (calif: number[]) => mpc.factores.reduce((s, f, i) => s + (f.peso || 0) * (calif[i] || 0), 0);

  const setFactor = (i: number, c: Partial<{ factor: string; peso: number }>) =>
    setMpc((m) => ({ ...m, factores: m.factores.map((f, idx) => (idx === i ? { ...f, ...c } : f)) }));
  const addFactor = () =>
    setMpc((m) => ({
      ...m,
      factores: [...m.factores, { factor: 'Nuevo factor', peso: 0 }],
      competidores: m.competidores.map((c) => ({ ...c, calificaciones: [...c.calificaciones, 3] })),
    }));
  const delFactor = (i: number) =>
    setMpc((m) => ({
      ...m,
      factores: m.factores.filter((_, idx) => idx !== i),
      competidores: m.competidores.map((c) => ({ ...c, calificaciones: c.calificaciones.filter((_, idx) => idx !== i) })),
    }));
  const setCalif = (ci: number, fi: number, val: number) =>
    setMpc((m) => ({ ...m, competidores: m.competidores.map((c, idx) => idx === ci ? { ...c, calificaciones: c.calificaciones.map((k, kid) => kid === fi ? val : k) } : c) }));
  const setNombre = (ci: number, nombre: string) =>
    setMpc((m) => ({ ...m, competidores: m.competidores.map((c, idx) => idx === ci ? { ...c, nombre } : c) }));
  const addComp = () =>
    setMpc((m) => ({ ...m, competidores: [...m.competidores, { nombre: `Competidor ${m.competidores.length}`, calificaciones: m.factores.map(() => 3) }] }));
  const delComp = (ci: number) =>
    setMpc((m) => ({ ...m, competidores: m.competidores.filter((_, idx) => idx !== ci) }));

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const res = await fetch(`/api/estrategia/proyectos/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ mpc }),
      });
      if (res.ok) { setGuardado(true); if (volver) router.push(`/estrategia/analisis/${params.id}`); }
    } finally { setGuardando(false); }
  };

  if (cargando) return <div className="es-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/estrategia/analisis/${params.id}`} className="es-muted inline-flex items-center gap-1 text-sm hover:text-violet-700">
        <ArrowLeft className="h-4 w-4" /> Volver al análisis
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="es-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Crosshair className="es-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="es-accent-text text-xs font-semibold uppercase tracking-wider">Microentorno</p>
          <h1 className="text-2xl font-bold tracking-tight">Matriz de Perfil Competitivo</h1>
        </div>
      </header>
      <p className="es-muted mt-2 text-sm">
        Compara tu empresa con los competidores en los factores críticos de éxito.
        Peso (suman 1) × calificación (1-4) = puntaje. El mayor total gana el sector.
      </p>

      <div className={`mt-4 text-xs font-medium ${pesosOk ? 'text-emerald-600' : 'text-amber-600'}`}>
        Suma de pesos: {totalPeso.toFixed(2)} {pesosOk ? '✓' : '(debe sumar 1.00)'}
      </div>

      {/* Tabla MPC */}
      <div className="es-card mt-3 overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
              <th className="pb-2 pr-2">Factor</th>
              <th className="pb-2 pr-2 w-16">Peso</th>
              {mpc.competidores.map((c, ci) => (
                <th key={ci} className="pb-2 pr-2">
                  <div className="flex items-center gap-1">
                    <input value={c.nombre} onChange={(e) => setNombre(ci, e.target.value)}
                      className={`w-24 rounded border px-1 py-0.5 text-xs ${c.esMiEmpresa ? 'border-violet-300 font-bold' : 'es-border'}`} />
                    {!c.esMiEmpresa && mpc.competidores.length > 1 && (
                      <button onClick={() => delComp(ci)} className="text-slate-300 hover:text-rose-600"><X className="h-3 w-3" /></button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mpc.factores.map((f, fi) => (
              <tr key={fi} className="border-t border-violet-50">
                <td className="py-1.5 pr-2">
                  <div className="flex items-center gap-1">
                    <input value={f.factor} onChange={(e) => setFactor(fi, { factor: e.target.value })} className="es-border w-full rounded border px-1.5 py-1 text-sm" />
                    <button onClick={() => delFactor(fi)} className="text-slate-300 hover:text-rose-600"><X className="h-3 w-3" /></button>
                  </div>
                </td>
                <td className="py-1.5 pr-2">
                  <input type="number" step="0.05" min="0" max="1" value={f.peso}
                    onChange={(e) => setFactor(fi, { peso: parseFloat(e.target.value) || 0 })}
                    className="es-border w-14 rounded border px-1 py-1 text-sm" />
                </td>
                {mpc.competidores.map((c, ci) => (
                  <td key={ci} className="py-1.5 pr-2">
                    <select value={c.calificaciones[fi] ?? 3} onChange={(e) => setCalif(ci, fi, parseInt(e.target.value, 10))}
                      className="es-border rounded border px-1 py-1 text-sm">
                      {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
            {/* Totales */}
            <tr className="border-t-2 border-violet-200 font-bold">
              <td className="py-2 pr-2">TOTAL</td>
              <td className="py-2 pr-2">{totalPeso.toFixed(2)}</td>
              {mpc.competidores.map((c, ci) => {
                const total = puntaje(c.calificaciones);
                const max = Math.max(...mpc.competidores.map((x) => puntaje(x.calificaciones)));
                return (
                  <td key={ci} className={`py-2 pr-2 ${total === max ? 'es-accent-text' : ''}`}>
                    {total.toFixed(2)}{total === max ? ' 🏆' : ''}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex gap-2">
        <button onClick={addFactor} className="es-btn-ghost flex items-center gap-1 px-3 py-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Factor</button>
        <button onClick={addComp} className="es-btn-ghost flex items-center gap-1 px-3 py-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Competidor</button>
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
