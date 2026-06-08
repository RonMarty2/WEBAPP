'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Wallet, Plus, X, Check } from 'lucide-react';
import type { Presupuesto, CanalPresupuesto } from '@/types/marketing';

const VACIO: Presupuesto = { canales: [] };

/** Plantilla con canales típicos en Bolivia, con valores razonables iniciales (Bs). */
const PLANTILLA: CanalPresupuesto[] = [
  { canal: 'Meta Ads (Instagram + Facebook)', inversion: 1500, cpl: 8, conversion: 12, ticket: 60 },
  { canal: 'TikTok Ads', inversion: 800, cpl: 6, conversion: 8, ticket: 60 },
  { canal: 'Google Ads (búsqueda)', inversion: 1000, cpl: 15, conversion: 25, ticket: 60 },
  { canal: 'Influencer local', inversion: 600, cpl: 10, conversion: 15, ticket: 60 },
];

const formatBs = (n: number) =>
  `Bs ${n.toLocaleString('es-BO', { maximumFractionDigits: 0 })}`;

/** Métricas derivadas por canal. */
function metrica(c: CanalPresupuesto) {
  // Round en vez de floor: floor sub-estimaba ventas hasta ~22% acumulado.
  const leads = c.cpl > 0 ? Math.round(c.inversion / c.cpl) : 0;
  const ventas = Math.round(leads * (c.conversion / 100));
  const ingreso = ventas * c.ticket;
  const roas = c.inversion > 0 ? ingreso / c.inversion : 0;
  const cac = ventas > 0 ? c.inversion / ventas : 0;
  return { leads, ventas, ingreso, roas, cac };
}

export default function HerramientaPresupuesto() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [pres, setPres] = useState<Presupuesto>(VACIO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    fetch(`/api/marketing/planes/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        const p = d.plan?.presupuesto;
        if (p?.canales?.length) setPres({ canales: p.canales });
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const addCanal = () => setPres((p) => ({ canales: [...p.canales, { canal: 'Nuevo canal', inversion: 0, cpl: 0, conversion: 0, ticket: 0 }] }));
  const upd = (i: number, c: Partial<CanalPresupuesto>) =>
    setPres((p) => ({ canales: p.canales.map((x, idx) => (idx === i ? { ...x, ...c } : x)) }));
  const del = (i: number) => setPres((p) => ({ canales: p.canales.filter((_, idx) => idx !== i) }));
  const cargarPlantilla = () => setPres({ canales: PLANTILLA });

  // Totales
  const totalInv = pres.canales.reduce((s, c) => s + (c.inversion || 0), 0);
  const totalLeads = pres.canales.reduce((s, c) => s + metrica(c).leads, 0);
  const totalVentas = pres.canales.reduce((s, c) => s + metrica(c).ventas, 0);
  const totalIngreso = pres.canales.reduce((s, c) => s + metrica(c).ingreso, 0);
  const roasGlobal = totalInv > 0 ? totalIngreso / totalInv : 0;
  const cacGlobal = totalVentas > 0 ? totalInv / totalVentas : 0;

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const res = await fetch(`/api/marketing/planes/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ presupuesto: pres, estado: 'presupuesto' }),
      });
      if (res.ok) { setGuardado(true); if (volver) router.push(`/marketing/planes/${params.id}`); }
    } finally { setGuardando(false); }
  };

  if (cargando) return <div className="mkt-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-4xl pb-10">
      <Link href={`/marketing/planes/${params.id}`} className="mkt-muted inline-flex items-center gap-1 text-sm hover:text-rose-700">
        <ArrowLeft className="h-4 w-4" /> Volver al plan
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="mkt-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Wallet className="mkt-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="mkt-accent-text text-xs font-semibold uppercase tracking-wider">Inversión y resultados</p>
          <h1 className="text-2xl font-bold tracking-tight">Presupuesto y CPL por canal</h1>
        </div>
      </header>
      <p className="mkt-muted mt-2 text-sm">
        Para cada canal, ingresa cuánto inviertes y tu costo por lead (CPL), tasa
        de conversión a cliente y ticket promedio. Calculamos leads, ventas,
        ingresos, ROAS y CAC. Todo en bolivianos.
      </p>

      {/* Totales */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Indicador label="Inversión total" valor={formatBs(totalInv)} sub="Bs/mes" />
        <Indicador label="Leads esperados" valor={totalLeads.toLocaleString('es-BO')} sub="contactos" />
        <Indicador label="Ventas esperadas" valor={totalVentas.toLocaleString('es-BO')} sub="clientes" />
        <Indicador label="ROAS global" valor={`${roasGlobal.toFixed(2)}×`} sub={`CAC ${cacGlobal > 0 ? formatBs(cacGlobal) : '—'}`} acento={roasGlobal >= 1} />
      </div>

      {pres.canales.length === 0 && (
        <div className="mkt-card mt-5 p-8 text-center">
          <p className="text-3xl">💸</p>
          <p className="mt-3 font-semibold">Aún no agregas canales</p>
          <p className="mkt-muted mt-1 text-sm">Empieza desde cero o usa la plantilla con canales típicos en Bolivia.</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <button onClick={cargarPlantilla} className="mkt-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium">
              Usar plantilla boliviana
            </button>
            <button onClick={addCanal} className="mkt-btn-ghost inline-flex items-center gap-1 px-4 py-2 text-sm">
              <Plus className="h-4 w-4" /> Agregar canal vacío
            </button>
          </div>
        </div>
      )}

      {pres.canales.length > 0 && (
        <>
          <div className="mkt-card mt-5 overflow-x-auto p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="pb-2 pr-2">Canal</th>
                  <th className="pb-2 pr-2 w-24">Inversión (Bs)</th>
                  <th className="pb-2 pr-2 w-20">CPL (Bs)</th>
                  <th className="pb-2 pr-2 w-20">Conv. %</th>
                  <th className="pb-2 pr-2 w-24">Ticket (Bs)</th>
                  <th className="pb-2 pr-2 w-16">Leads</th>
                  <th className="pb-2 pr-2 w-16">Ventas</th>
                  <th className="pb-2 pr-2 w-24">Ingreso</th>
                  <th className="pb-2 pr-2 w-16">ROAS</th>
                  <th className="pb-2 pr-2"></th>
                </tr>
              </thead>
              <tbody>
                {pres.canales.map((c, i) => {
                  const m = metrica(c);
                  const roasOk = m.roas >= 1;
                  return (
                    <tr key={i} className="border-t border-rose-50">
                      <td className="py-1.5 pr-2">
                        <input value={c.canal} onChange={(e) => upd(i, { canal: e.target.value })}
                          className="mkt-border w-full min-w-40 rounded border px-1.5 py-1 text-sm" />
                      </td>
                      <td className="py-1.5 pr-2"><Num value={c.inversion} onChange={(v) => upd(i, { inversion: v })} /></td>
                      <td className="py-1.5 pr-2"><Num value={c.cpl} onChange={(v) => upd(i, { cpl: v })} step={0.5} /></td>
                      <td className="py-1.5 pr-2"><Num value={c.conversion} onChange={(v) => upd(i, { conversion: v })} step={1} /></td>
                      <td className="py-1.5 pr-2"><Num value={c.ticket} onChange={(v) => upd(i, { ticket: v })} /></td>
                      <td className="py-1.5 pr-2 text-slate-500">{m.leads.toLocaleString('es-BO')}</td>
                      <td className="py-1.5 pr-2 text-slate-500">{m.ventas.toLocaleString('es-BO')}</td>
                      <td className="py-1.5 pr-2 text-slate-500">{formatBs(m.ingreso)}</td>
                      <td className={`py-1.5 pr-2 font-semibold ${roasOk ? 'text-emerald-600' : 'text-rose-600'}`}>{m.roas.toFixed(2)}×</td>
                      <td className="py-1.5 pr-2"><button onClick={() => del(i)} className="text-slate-300 hover:text-rose-600" aria-label="Eliminar canal"><X className="h-3.5 w-3.5" aria-hidden="true" /></button></td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-rose-200 font-bold">
                  <td className="py-2 pr-2">TOTAL</td>
                  <td className="py-2 pr-2">{formatBs(totalInv)}</td>
                  <td colSpan={3}></td>
                  <td className="py-2 pr-2">{totalLeads.toLocaleString('es-BO')}</td>
                  <td className="py-2 pr-2">{totalVentas.toLocaleString('es-BO')}</td>
                  <td className="py-2 pr-2">{formatBs(totalIngreso)}</td>
                  <td className={`py-2 pr-2 ${roasGlobal >= 1 ? 'text-emerald-600' : 'text-rose-600'}`}>{roasGlobal.toFixed(2)}×</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={addCanal} className="mkt-btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Agregar canal
            </button>
            <button onClick={cargarPlantilla} className="mkt-btn-ghost px-3 py-1.5 text-xs">
              Reemplazar con plantilla
            </button>
          </div>

          <p className="mkt-muted mt-3 text-xs">
            <strong>CPL</strong>: lo que cuesta conseguir un contacto interesado.{' '}
            <strong>Conversión</strong>: % de leads que terminan comprando.{' '}
            <strong>ROAS</strong> = ingreso / inversión (1× = empatas, 3× = bueno).{' '}
            <strong>CAC</strong>: costo de adquisición por cliente.
          </p>
        </>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => guardar(false)} disabled={guardando} className="mkt-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50">
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
        <button onClick={() => guardar(true)} disabled={guardando} className="mkt-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50">
          Guardar y volver →
        </button>
        {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
      </div>
    </div>
  );
}

function Indicador({ label, valor, sub, acento }: { label: string; valor: string; sub?: string; acento?: boolean }) {
  return (
    <div className="mkt-card p-3 text-center">
      <p className="mkt-muted text-[11px] uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold ${acento === undefined ? 'mkt-accent-text' : acento ? 'text-emerald-600' : 'text-rose-600'}`}>{valor}</p>
      {sub && <p className="mkt-muted text-[10px]">{sub}</p>}
    </div>
  );
}

function Num({ value, onChange, step = 1 }: { value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <input
      type="number" min={0} step={step} value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="mkt-border w-full rounded border px-1.5 py-1 text-sm"
    />
  );
}
