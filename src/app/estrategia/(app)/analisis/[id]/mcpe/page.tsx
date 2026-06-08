'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, ListChecks, Plus, X, Check, RefreshCw } from 'lucide-react';
import type { Mcpe, FilaMatriz, Foda } from '@/types/estrategia';

const VACIO: Mcpe = {
  factores: [
    { factor: 'Oportunidad clave del entorno', peso: 0.5, tipo: 'externo' },
    { factor: 'Amenaza clave del entorno', peso: 0.5, tipo: 'externo' },
    { factor: 'Fortaleza interna', peso: 0.5, tipo: 'interno' },
    { factor: 'Debilidad interna', peso: 0.5, tipo: 'interno' },
  ],
  estrategias: [
    { nombre: 'Estrategia A', calificaciones: [0, 0, 0, 0] },
    { nombre: 'Estrategia B', calificaciones: [0, 0, 0, 0] },
  ],
};

/** Construye factores y estrategias candidatas desde MEFE/MEFI/FODA del proyecto. */
function derivar(proyecto: {
  mefe?: { filas?: FilaMatriz[] }; mefi?: { filas?: FilaMatriz[] }; foda?: Partial<Foda>;
}): Mcpe | null {
  const ext = (proyecto.mefe?.filas ?? []).filter((f) => f.factor?.trim());
  const int = (proyecto.mefi?.filas ?? []).filter((f) => f.factor?.trim());
  const factores = [
    ...ext.map((f) => ({ factor: f.factor, peso: f.peso || 0, tipo: 'externo' as const })),
    ...int.map((f) => ({ factor: f.factor, peso: f.peso || 0, tipo: 'interno' as const })),
  ];
  const e = proyecto.foda?.estrategias;
  const candidatas = [
    ...(e?.fo ?? []), ...(e?.do_ ?? []), ...(e?.fa ?? []), ...(e?.da ?? []),
  ].filter(Boolean).slice(0, 6);
  if (!factores.length || !candidatas.length) return null;
  return {
    factores,
    estrategias: candidatas.map((nombre) => ({ nombre, calificaciones: factores.map(() => 0) })),
  };
}

export default function HerramientaMCPE() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [mcpe, setMcpe] = useState<Mcpe>(VACIO);
  const [derivado, setDerivado] = useState<Mcpe | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    fetch(`/api/estrategia/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.proyecto) {
          const der = derivar(d.proyecto);
          setDerivado(der);
          const m = d.proyecto.mcpe;
          if (m?.factores?.length) setMcpe({ factores: m.factores, estrategias: m.estrategias ?? VACIO.estrategias });
          else if (der) setMcpe(der);
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const totalPeso = mcpe.factores.reduce((s, f) => s + (f.peso || 0), 0);
  const tca = (calif: number[]) => mcpe.factores.reduce((s, f, i) => s + (f.peso || 0) * (calif[i] || 0), 0);
  const totales = mcpe.estrategias.map((e) => tca(e.calificaciones));
  const maxTotal = totales.length ? Math.max(...totales) : 0;

  const setFactor = (i: number, c: Partial<{ factor: string; peso: number }>) =>
    setMcpe((m) => ({ ...m, factores: m.factores.map((f, idx) => (idx === i ? { ...f, ...c } : f)) }));
  const addFactor = (tipo: 'externo' | 'interno') =>
    setMcpe((m) => ({
      ...m,
      factores: [...m.factores, { factor: tipo === 'externo' ? 'Nuevo factor externo' : 'Nuevo factor interno', peso: 0, tipo }],
      estrategias: m.estrategias.map((e) => ({ ...e, calificaciones: [...e.calificaciones, 0] })),
    }));
  const delFactor = (i: number) =>
    setMcpe((m) => ({
      ...m,
      factores: m.factores.filter((_, idx) => idx !== i),
      estrategias: m.estrategias.map((e) => ({ ...e, calificaciones: e.calificaciones.filter((_, idx) => idx !== i) })),
    }));
  const setCA = (ei: number, fi: number, val: number) =>
    setMcpe((m) => ({ ...m, estrategias: m.estrategias.map((e, idx) => idx === ei ? { ...e, calificaciones: e.calificaciones.map((k, kid) => kid === fi ? val : k) } : e) }));
  const setNombre = (ei: number, nombre: string) =>
    setMcpe((m) => ({ ...m, estrategias: m.estrategias.map((e, idx) => idx === ei ? { ...e, nombre } : e) }));
  const addEstrategia = () =>
    setMcpe((m) => ({ ...m, estrategias: [...m.estrategias, { nombre: `Estrategia ${String.fromCharCode(65 + m.estrategias.length)}`, calificaciones: m.factores.map(() => 0) }] }));
  const delEstrategia = (ei: number) =>
    setMcpe((m) => ({ ...m, estrategias: m.estrategias.filter((_, idx) => idx !== ei) }));

  const recargar = () => { if (derivado) setMcpe(derivado); };

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const res = await fetch(`/api/estrategia/proyectos/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ mcpe }),
      });
      if (res.ok) { setGuardado(true); if (volver) router.push(`/estrategia/analisis/${params.id}`); }
    } finally { setGuardando(false); }
  };

  if (cargando) return <div className="es-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-4xl pb-10">
      <Link href={`/estrategia/analisis/${params.id}`} className="es-muted inline-flex items-center gap-1 text-sm hover:text-violet-700">
        <ArrowLeft className="h-4 w-4" /> Volver al análisis
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="es-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <ListChecks className="es-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="es-accent-text text-xs font-semibold uppercase tracking-wider">Decisión final</p>
          <h1 className="text-2xl font-bold tracking-tight">MCPE / QSPM</h1>
        </div>
      </header>
      <p className="es-muted mt-2 text-sm">
        Matriz Cuantitativa de Planificación Estratégica. Puntúa cada estrategia
        candidata frente a los factores clave: peso × atractivo (CA 1-4, o «—» si
        el factor no influye). La estrategia con mayor total es la más conveniente.
      </p>

      {derivado && (
        <button onClick={recargar} className="es-btn-ghost mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Recargar factores y estrategias desde MEFE/MEFI/FODA
        </button>
      )}
      {!derivado && (
        <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Para autocompletar, primero llena <strong>MEFE</strong>, <strong>MEFI</strong> y las
          estrategias cruzadas del <strong>FODA</strong>. Mientras tanto puedes trabajar con la plantilla.
        </div>
      )}

      <div className="mt-3 text-xs font-medium text-slate-500">Suma de pesos: {totalPeso.toFixed(2)} <span className="es-muted">(en QSPM externos e internos suman 1.00 cada bloque → 2.00 en total)</span></div>

      {/* Tabla MCPE */}
      <div className="es-card mt-3 overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
              <th className="pb-2 pr-2">Factor clave</th>
              <th className="pb-2 pr-2 w-14">Peso</th>
              {mcpe.estrategias.map((e, ei) => (
                <th key={ei} className="pb-2 pr-2">
                  <div className="flex items-center gap-1">
                    <input value={e.nombre} onChange={(ev) => setNombre(ei, ev.target.value)} className="es-border w-28 rounded border px-1 py-0.5 text-xs" />
                    {mcpe.estrategias.length > 1 && (
                      <button onClick={() => delEstrategia(ei)} className="text-slate-300 hover:text-rose-600" aria-label="Eliminar estrategia"><X className="h-3 w-3" aria-hidden="true" /></button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mcpe.factores.map((f, fi) => (
              <tr key={fi} className="border-t border-violet-50">
                <td className="py-1.5 pr-2">
                  <div className="flex items-center gap-1">
                    <span className={`flex-shrink-0 rounded px-1 py-0.5 text-[9px] font-bold ${f.tipo === 'externo' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'}`}>{f.tipo === 'externo' ? 'EXT' : 'INT'}</span>
                    <input value={f.factor} onChange={(e) => setFactor(fi, { factor: e.target.value })} className="es-border w-full min-w-40 rounded border px-1.5 py-1 text-sm" />
                    <button onClick={() => delFactor(fi)} className="text-slate-300 hover:text-rose-600" aria-label="Eliminar factor"><X className="h-3 w-3" aria-hidden="true" /></button>
                  </div>
                </td>
                <td className="py-1.5 pr-2">
                  <input type="number" step="0.05" min="0" max="1" value={f.peso}
                    onChange={(e) => setFactor(fi, { peso: parseFloat(e.target.value) || 0 })}
                    className="es-border w-14 rounded border px-1 py-1 text-sm" />
                </td>
                {mcpe.estrategias.map((e, ei) => (
                  <td key={ei} className="py-1.5 pr-2">
                    <select value={e.calificaciones[fi] ?? 0} onChange={(ev) => setCA(ei, fi, parseInt(ev.target.value, 10))}
                      className="es-border rounded border px-1 py-1 text-sm">
                      <option value={0}>—</option>
                      {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
            {/* Totales TCA */}
            <tr className="border-t-2 border-violet-200 font-bold">
              <td className="py-2 pr-2">TOTAL (TCA)</td>
              <td className="py-2 pr-2">{totalPeso.toFixed(2)}</td>
              {totales.map((t, ei) => (
                <td key={ei} className={`py-2 pr-2 ${t === maxTotal && maxTotal > 0 ? 'es-accent-text' : ''}`}>
                  {t.toFixed(2)}{t === maxTotal && maxTotal > 0 ? ' 🏆' : ''}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => addFactor('externo')} className="es-btn-ghost flex items-center gap-1 px-3 py-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Factor externo</button>
        <button onClick={() => addFactor('interno')} className="es-btn-ghost flex items-center gap-1 px-3 py-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Factor interno</button>
        <button onClick={addEstrategia} className="es-btn-ghost flex items-center gap-1 px-3 py-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Estrategia</button>
      </div>

      {maxTotal > 0 && (
        <div className="es-card mt-4 p-5">
          <p className="text-sm font-semibold">Estrategia recomendada</p>
          <p className="es-muted mt-1 text-sm">
            Con mayor puntaje total ({maxTotal.toFixed(2)}):{' '}
            <strong className="es-accent-text">
              {mcpe.estrategias[totales.indexOf(maxTotal)]?.nombre}
            </strong>. Es la opción más atractiva según los factores y sus pesos.
          </p>
        </div>
      )}

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
