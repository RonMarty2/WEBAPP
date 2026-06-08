'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Users, Plus, X, Check } from 'lucide-react';
import type { Rrhh, Puesto } from '@/types/organizacion';

const APORTES_DEFAULT: Rrhh['aportes'] = {
  cajaSalud: 10, proVivienda: 2, riesgoProfesional: 1.71, aporteSolidario: 3,
  aguinaldo: 8.33, indemnizacion: 8.33,
};

const VACIO: Rrhh = {
  puestos: [{ cargo: 'Gerente General', cantidad: 1, salarioBruto: 6000 }],
  aportes: { ...APORTES_DEFAULT },
};

const APORTE_LABELS: Array<{ key: keyof Rrhh['aportes']; label: string; grupo: 'patronal' | 'provision' }> = [
  { key: 'cajaSalud', label: 'Caja Nacional de Salud', grupo: 'patronal' },
  { key: 'proVivienda', label: 'Aporte Patronal Vivienda', grupo: 'patronal' },
  { key: 'riesgoProfesional', label: 'Riesgo profesional (AFP)', grupo: 'patronal' },
  { key: 'aporteSolidario', label: 'Aporte Patronal Solidario', grupo: 'patronal' },
  { key: 'aguinaldo', label: 'Aguinaldo (provisión 1/12)', grupo: 'provision' },
  { key: 'indemnizacion', label: 'Indemnización (provisión 1/12)', grupo: 'provision' },
];

const formatBs = (n: number) => `Bs ${n.toLocaleString('es-BO', { maximumFractionDigits: 0 })}`;

export default function HerramientaRrhh() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [rrhh, setRrhh] = useState<Rrhh>(VACIO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState('');

  useEffect(() => {
    fetch(`/api/organizacion/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        const x = d.proyecto?.rrhh;
        if (x?.puestos) setRrhh({ puestos: x.puestos, aportes: { ...APORTES_DEFAULT, ...(x.aportes ?? {}) } });
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const addPuesto = () => setRrhh((r) => ({ ...r, puestos: [...r.puestos, { cargo: 'Nuevo cargo', cantidad: 1, salarioBruto: 2500 }] }));
  const updPuesto = (i: number, c: Partial<Puesto>) =>
    setRrhh((r) => ({ ...r, puestos: r.puestos.map((p, idx) => (idx === i ? { ...p, ...c } : p)) }));
  const delPuesto = (i: number) => setRrhh((r) => ({ ...r, puestos: r.puestos.filter((_, idx) => idx !== i) }));
  const setAporte = (key: keyof Rrhh['aportes'], val: number) =>
    setRrhh((r) => ({ ...r, aportes: { ...r.aportes, [key]: val } }));

  // Cálculos
  const a = rrhh.aportes;
  const pctPatronal = a.cajaSalud + a.proVivienda + a.riesgoProfesional + a.aporteSolidario;
  const pctProvision = a.aguinaldo + a.indemnizacion;
  const pctTotal = pctPatronal + pctProvision;
  const baseMensual = rrhh.puestos.reduce((s, p) => s + p.salarioBruto * p.cantidad, 0);
  const costoPatronal = baseMensual * (pctPatronal / 100);
  const costoProvision = baseMensual * (pctProvision / 100);
  const costoTotal = baseMensual + costoPatronal + costoProvision;

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false); setErrorGuardar('');
    try {
      const res = await fetch(`/api/organizacion/proyectos/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ rrhh, estado: 'rrhh' }),
      });
      if (res.ok) {
        setGuardado(true);
        if (volver) router.push(`/organizacion/proyectos/${params.id}`);
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

  if (cargando) return <div className="org-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-4xl pb-10">
      <Link href={`/organizacion/proyectos/${params.id}`} className="org-muted inline-flex items-center gap-1 text-sm hover:text-emerald-700">
        <ArrowLeft className="h-4 w-4" /> Volver al proyecto
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="org-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Users className="org-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="org-accent-text text-xs font-semibold uppercase tracking-wider">Planilla y costos</p>
          <h1 className="text-2xl font-bold tracking-tight">Recursos Humanos</h1>
        </div>
      </header>
      <p className="org-muted mt-2 text-sm">
        Lista tus cargos con su salario bruto. Calculamos el costo real para la
        empresa sumando los aportes patronales y provisiones de Bolivia.
      </p>

      {/* Indicadores */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Indicador label="Planilla bruta" valor={formatBs(baseMensual)} sub="Bs/mes" />
        <Indicador label={`Patronal (${pctPatronal.toFixed(2)}%)`} valor={formatBs(costoPatronal)} sub="Bs/mes" />
        <Indicador label={`Provisiones (${pctProvision.toFixed(2)}%)`} valor={formatBs(costoProvision)} sub="Bs/mes" />
        <Indicador label="Costo empresa" valor={formatBs(costoTotal)} sub={`+${pctTotal.toFixed(2)}% s/ planilla`} acento />
      </div>

      {/* Puestos */}
      <div className="org-card mt-5 overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
              <th className="pb-2 pr-2">Cargo</th>
              <th className="pb-2 pr-2 w-20">Cantidad</th>
              <th className="pb-2 pr-2 w-28">Salario bruto</th>
              <th className="pb-2 pr-2 w-28">Subtotal</th>
              <th className="pb-2 pr-2 w-28">Costo c/ aportes</th>
              <th className="pb-2 pr-2"></th>
            </tr>
          </thead>
          <tbody>
            {rrhh.puestos.map((p, i) => {
              const subtotal = p.salarioBruto * p.cantidad;
              const conAportes = subtotal * (1 + pctTotal / 100);
              return (
                <tr key={i} className="border-t border-emerald-50">
                  <td className="py-1.5 pr-2">
                    <input value={p.cargo} onChange={(e) => updPuesto(i, { cargo: e.target.value })}
                      className="org-border w-full min-w-40 rounded border px-2 py-1 text-sm" />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input type="number" min={0} value={p.cantidad} onChange={(e) => updPuesto(i, { cantidad: parseInt(e.target.value, 10) || 0 })}
                      className="org-border w-16 rounded border px-1.5 py-1 text-sm" />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input type="number" min={0} step={50} value={p.salarioBruto} onChange={(e) => updPuesto(i, { salarioBruto: parseFloat(e.target.value) || 0 })}
                      className="org-border w-24 rounded border px-1.5 py-1 text-sm" />
                  </td>
                  <td className="py-1.5 pr-2 text-slate-500">{formatBs(subtotal)}</td>
                  <td className="py-1.5 pr-2 font-medium org-accent-text">{formatBs(conAportes)}</td>
                  <td className="py-1.5 pr-2"><button onClick={() => delPuesto(i)} className="text-slate-300 hover:text-rose-600" aria-label="Eliminar puesto"><X className="h-3.5 w-3.5" aria-hidden="true" /></button></td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-emerald-200 font-bold">
              <td className="py-2 pr-2">TOTAL</td>
              <td className="py-2 pr-2">{rrhh.puestos.reduce((s, p) => s + p.cantidad, 0)}</td>
              <td></td>
              <td className="py-2 pr-2">{formatBs(baseMensual)}</td>
              <td className="py-2 pr-2 org-accent-text">{formatBs(costoTotal)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <button onClick={addPuesto} className="org-btn-ghost mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Agregar cargo</button>
      </div>

      {/* Aportes config */}
      <div className="org-card mt-4 p-4">
        <p className="text-sm font-semibold">Aportes patronales y provisiones (Bolivia)</p>
        <p className="org-muted text-xs">Porcentajes sobre el total ganado. Ajusta si tu caso difiere.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {APORTE_LABELS.map(({ key, label, grupo }) => (
            <label key={key} className="flex items-center justify-between gap-2 rounded-lg border border-emerald-50 bg-emerald-50/40 px-3 py-1.5">
              <span className="text-xs">
                {label}
                <span className={`ml-1 rounded px-1 py-0.5 text-[9px] font-bold ${grupo === 'patronal' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {grupo === 'patronal' ? 'PATRONAL' : 'PROVISIÓN'}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <input type="number" step={0.01} min={0} value={rrhh.aportes[key]} onChange={(e) => setAporte(key, parseFloat(e.target.value) || 0)}
                  className="org-border w-16 rounded border px-1.5 py-1 text-right text-sm" />
                <span className="org-muted text-xs">%</span>
              </span>
            </label>
          ))}
        </div>
        <p className="org-muted mt-2 text-xs">
          Patronal mensual: <strong>{pctPatronal.toFixed(2)}%</strong> · Provisiones: <strong>{pctProvision.toFixed(2)}%</strong> ·
          Carga total sobre planilla: <strong className="org-accent-text">{pctTotal.toFixed(2)}%</strong>.
        </p>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => guardar(false)} disabled={guardando} className="org-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50">{guardando ? 'Guardando…' : 'Guardar'}</button>
        <button onClick={() => guardar(true)} disabled={guardando} className="org-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50">Guardar y volver →</button>
        {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
        {errorGuardar && (
          <span className="text-sm text-rose-700" role="alert">{errorGuardar}</span>
        )}
      </div>
    </div>
  );
}

function Indicador({ label, valor, sub, acento }: { label: string; valor: string; sub?: string; acento?: boolean }) {
  return (
    <div className="org-card p-3 text-center">
      <p className="org-muted text-[11px] uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-bold ${acento ? 'org-accent-text' : ''}`}>{valor}</p>
      {sub && <p className="org-muted text-[10px]">{sub}</p>}
    </div>
  );
}
