'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Copy, Printer, Check } from 'lucide-react';
import type { PlanMarketing, CanalPresupuesto } from '@/types/marketing';

const formatBs = (n: number) =>
  `Bs ${n.toLocaleString('es-BO', { maximumFractionDigits: 0 })}`;

function metrica(c: CanalPresupuesto) {
  const leads = c.cpl > 0 ? Math.round(c.inversion / c.cpl) : 0;
  const ventas = Math.round(leads * (c.conversion / 100));
  const ingreso = ventas * c.ticket;
  const roas = c.inversion > 0 ? ingreso / c.inversion : 0;
  return { leads, ventas, ingreso, roas };
}

const MEZCLA_LABEL: Record<string, string> = {
  producto: 'Producto', precio: 'Precio', plaza: 'Plaza', promocion: 'Promoción',
  personas: 'Personas', procesos: 'Procesos', evidenciaFisica: 'Evidencia física',
};

export default function ReporteMarketing() {
  const params = useParams<{ id: string }>();
  const [p, setP] = useState<PlanMarketing | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    fetch(`/api/marketing/planes/${params.id}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setP(d.plan); setEstado('ok'); })
      .catch(() => setEstado('error'));
  }, [params.id]);

  if (estado === 'cargando') return <div className="mkt-muted py-10 text-center text-sm">Generando reporte…</div>;
  if (estado === 'error' || !p) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mkt-card p-6 text-center">
          <p className="font-semibold">No encontramos este plan</p>
          <Link href="/marketing/planes" className="mkt-accent-text mt-2 inline-block text-sm">← Mis planes</Link>
        </div>
      </div>
    );
  }

  const bp = p.buyer_persona ?? {};
  const mez = p.mezcla ?? {};
  const canales = p.presupuesto?.canales ?? [];
  const totalInv = canales.reduce((s, c) => s + (c.inversion || 0), 0);
  const totalLeads = canales.reduce((s, c) => s + metrica(c).leads, 0);
  const totalVentas = canales.reduce((s, c) => s + metrica(c).ventas, 0);
  const totalIngreso = canales.reduce((s, c) => s + metrica(c).ingreso, 0);
  const roasGlobal = totalInv > 0 ? totalIngreso / totalInv : 0;
  const pubs = (p.calendario?.publicaciones ?? []).slice().sort((a, b) => a.fecha.localeCompare(b.fecha));

  const construirTexto = (): string => {
    const l: string[] = [];
    l.push(`# Plan de Marketing — ${p.titulo}`);
    if (p.marca) l.push(`Marca: ${p.marca}`);
    if (p.sector) l.push(`Sector: ${p.sector}`);
    l.push('');

    if (Object.keys(bp).length) {
      l.push('## Buyer persona');
      if (bp.nombre) l.push(`- Nombre: ${bp.nombre}${bp.edad ? `, ${bp.edad}` : ''}`);
      if (bp.ocupacion) l.push(`- Ocupación: ${bp.ocupacion}`);
      if (bp.ubicacion) l.push(`- Ubicación: ${bp.ubicacion}`);
      if (bp.metas?.length) l.push(`- Metas: ${bp.metas.join('; ')}`);
      if (bp.frustraciones?.length) l.push(`- Frustraciones: ${bp.frustraciones.join('; ')}`);
      if (bp.canales?.length) l.push(`- Canales: ${bp.canales.join(', ')}`);
      if (bp.cita) l.push(`- "${bp.cita}"`);
      l.push('');
    }

    if (Object.keys(mez).length) {
      l.push(`## Mezcla de marketing (${mez.tipo === '7ps' ? '7Ps' : '4Ps'})`);
      const llaves = mez.tipo === '7ps'
        ? ['producto', 'precio', 'plaza', 'promocion', 'personas', 'procesos', 'evidenciaFisica']
        : ['producto', 'precio', 'plaza', 'promocion'];
      for (const k of llaves) {
        const v = (mez as Record<string, string>)[k];
        if (v) l.push(`- ${MEZCLA_LABEL[k]}: ${v}`);
      }
      l.push('');
    }

    if (canales.length) {
      l.push('## Presupuesto y CPL por canal');
      l.push(`Total invertido: ${formatBs(totalInv)} · Leads esperados: ${totalLeads} · Ventas: ${totalVentas} · Ingreso: ${formatBs(totalIngreso)} · ROAS global: ${roasGlobal.toFixed(2)}×`);
      canales.forEach((c) => {
        const m = metrica(c);
        l.push(`- ${c.canal}: ${formatBs(c.inversion)} → ${m.leads} leads → ${m.ventas} ventas (${formatBs(m.ingreso)}, ROAS ${m.roas.toFixed(2)}×)`);
      });
      l.push('');
    }

    if (pubs.length) {
      l.push(`## Calendario editorial (${pubs.length} piezas)`);
      pubs.forEach((x) => {
        l.push(`- ${x.fecha} · ${x.canal} · ${x.tipo} (${x.estado}): ${x.copy}`);
      });
      l.push('');
    }

    return l.join('\n');
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(construirTexto());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch { /* sin clipboard */ }
  };

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <div className="print:hidden">
        <Link href={`/marketing/planes/${params.id}`} className="mkt-muted inline-flex items-center gap-1 text-sm hover:text-rose-700">
          <ArrowLeft className="h-4 w-4" /> Volver al plan
        </Link>
      </div>

      <header className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="mkt-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
            <FileText className="mkt-accent-text h-5 w-5" />
          </div>
          <div>
            <p className="mkt-accent-text text-xs font-semibold uppercase tracking-wider">Documento consolidado</p>
            <h1 className="text-2xl font-bold tracking-tight">{p.titulo}</h1>
            {(p.marca || p.sector) && (
              <p className="mkt-muted text-sm">{[p.marca, p.sector].filter(Boolean).join(' · ')}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={copiar} className="mkt-btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium">
            {copiado ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copiado ? 'Copiado' : 'Copiar'}
          </button>
          <button onClick={() => window.print()} className="mkt-btn-primary inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium">
            <Printer className="h-4 w-4" /> Imprimir
          </button>
        </div>
      </header>

      {/* Resumen */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Indicador label="Inversión" valor={canales.length ? formatBs(totalInv) : '—'} sub="Bs/mes" />
        <Indicador label="Leads" valor={canales.length ? totalLeads.toLocaleString('es-BO') : '—'} sub="esperados" />
        <Indicador label="Ventas" valor={canales.length ? totalVentas.toLocaleString('es-BO') : '—'} sub="esperadas" />
        <Indicador label="ROAS" valor={canales.length ? `${roasGlobal.toFixed(2)}×` : '—'} sub="global" />
      </div>

      {Object.keys(bp).length > 0 && (
        <Seccion titulo="Buyer persona">
          {bp.nombre && <p className="font-semibold">{bp.nombre}{bp.edad ? `, ${bp.edad}` : ''} {bp.ocupacion ? `· ${bp.ocupacion}` : ''}</p>}
          {bp.ubicacion && <p className="mkt-muted text-sm">{bp.ubicacion}</p>}
          {bp.cita && <p className="mt-2 italic">«{bp.cita}»</p>}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {bp.metas?.length ? <Bullets label="Metas" items={bp.metas} /> : null}
            {bp.frustraciones?.length ? <Bullets label="Frustraciones" items={bp.frustraciones} /> : null}
          </div>
          {bp.canales?.length ? (
            <div className="mt-3">
              <p className="font-semibold text-slate-700">Canales</p>
              <p className="mkt-muted text-sm">{bp.canales.join(' · ')}</p>
            </div>
          ) : null}
        </Seccion>
      )}

      {Object.keys(mez).length > 0 && (
        <Seccion titulo={`Mezcla de marketing (${mez.tipo === '7ps' ? '7Ps' : '4Ps'})`}>
          <ul className="space-y-1.5">
            {(mez.tipo === '7ps' ? ['producto', 'precio', 'plaza', 'promocion', 'personas', 'procesos', 'evidenciaFisica'] : ['producto', 'precio', 'plaza', 'promocion'])
              .map((k) => {
                const v = (mez as Record<string, string>)[k];
                return v ? (
                  <li key={k}>
                    <span className="font-medium">{MEZCLA_LABEL[k]}:</span>{' '}
                    <span className="mkt-muted">{v}</span>
                  </li>
                ) : null;
              })}
          </ul>
        </Seccion>
      )}

      {canales.length > 0 && (
        <Seccion titulo="Presupuesto y CPL por canal">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="pb-1 pr-2">Canal</th>
                  <th className="pb-1 pr-2">Inversión</th>
                  <th className="pb-1 pr-2">Leads</th>
                  <th className="pb-1 pr-2">Ventas</th>
                  <th className="pb-1 pr-2">Ingreso</th>
                  <th className="pb-1 pr-2">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {canales.map((c, i) => {
                  const m = metrica(c);
                  return (
                    <tr key={i} className="border-t border-rose-50">
                      <td className="py-1.5 pr-2">{c.canal}</td>
                      <td className="py-1.5 pr-2">{formatBs(c.inversion)}</td>
                      <td className="py-1.5 pr-2">{m.leads.toLocaleString('es-BO')}</td>
                      <td className="py-1.5 pr-2">{m.ventas.toLocaleString('es-BO')}</td>
                      <td className="py-1.5 pr-2">{formatBs(m.ingreso)}</td>
                      <td className={`py-1.5 pr-2 font-semibold ${m.roas >= 1 ? 'text-emerald-600' : 'text-rose-600'}`}>{m.roas.toFixed(2)}×</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Seccion>
      )}

      {pubs.length > 0 && (
        <Seccion titulo={`Calendario editorial (${pubs.length} piezas)`}>
          <ul className="space-y-1.5">
            {pubs.map((x, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mkt-muted w-24 flex-shrink-0">{x.fecha}</span>
                <span className="w-24 flex-shrink-0 font-medium">{x.canal}</span>
                <span className="w-16 flex-shrink-0 text-slate-500">{x.tipo}</span>
                <span className="mkt-muted flex-1">{x.copy}</span>
              </li>
            ))}
          </ul>
        </Seccion>
      )}
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mkt-card mt-4 p-5">
      <h2 className="mkt-accent-text text-sm font-bold uppercase tracking-wider">{titulo}</h2>
      <div className="mt-2 text-sm">{children}</div>
    </section>
  );
}

function Indicador({ label, valor, sub }: { label: string; valor: string; sub: string }) {
  return (
    <div className="mkt-card p-3 text-center">
      <p className="mkt-muted text-[11px] uppercase tracking-wider">{label}</p>
      <p className="mkt-accent-text text-xl font-bold">{valor}</p>
      <p className="mkt-muted text-[10px]">{sub}</p>
    </div>
  );
}

function Bullets({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="font-semibold text-slate-700">{label}</p>
      <ul className="mkt-muted mt-1 space-y-0.5 text-sm">
        {items.map((it, i) => <li key={i}>• {it}</li>)}
      </ul>
    </div>
  );
}
