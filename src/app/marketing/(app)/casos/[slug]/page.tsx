'use client';

/**
 * Detalle de un caso de Marketing.
 * Tabs: 1.Personas, 2.Mix, 3.Presupuesto, 4.Calendario, 5.KPIs.
 */

import { useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { buscarCasoMarketing } from '@/lib/casos/marketing';
import type { CasoMarketing, DificultadCaso, BuyerPersona } from '@/lib/casos/types';

const DIFICULTAD_META: Record<DificultadCaso, { label: string; cls: string }> = {
  basico:     { label: 'Básico',     cls: 'bg-emerald-100 text-emerald-800' },
  intermedio: { label: 'Intermedio', cls: 'bg-amber-100 text-amber-800' },
  avanzado:   { label: 'Avanzado',   cls: 'bg-rose-100 text-rose-800' },
};

type TabId = 'personas' | 'mix' | 'presupuesto' | 'calendario' | 'kpis';

export default function DetalleCasoMarketing() {
  const params = useParams<{ slug: string }>();
  const caso = buscarCasoMarketing(params.slug);
  const [tab, setTab] = useState<TabId>('personas');

  if (!caso) return notFound();
  const dif = DIFICULTAD_META[caso.dificultad];

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <Link href="/marketing/casos" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        ← Volver a casos
      </Link>

      <header className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-4xl">
            {caso.emoji ?? '📣'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${dif.cls}`}>Dificultad: {dif.label}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">{caso.rubro}</span>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-700">Bs {caso.presupuesto.total_bs_mes.toLocaleString('es-BO')}/mes</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">ROAS {caso.presupuesto.roas_proyectado.toFixed(1)}x</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{caso.titulo}</h1>
            <p className="mt-1 text-sm text-slate-600">{caso.tagline}</p>
            <p className="mt-3 text-xs text-slate-500">📍 {caso.zona} · 👤 {caso.emprendedor.nombre}, {caso.emprendedor.edad} años</p>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-700">Contexto</h2>
        <p className="mt-1 text-xs italic text-slate-500">{caso.emprendedor.rol}</p>
        <div className="mt-3 space-y-3">
          {caso.contexto.map((p, i) => <p key={i} className="text-sm leading-relaxed text-slate-700">{p}</p>)}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">El problema</p>
            <p className="mt-1 text-sm text-rose-900">{caso.problema}</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Segmento</p>
            <p className="mt-1 text-sm text-emerald-900">{caso.segmento}</p>
          </div>
        </div>
      </section>

      <nav className="flex flex-wrap gap-1 border-b border-slate-200">
        <TabButton activo={tab==='personas'}    onClick={() => setTab('personas')}    icono="👥">Personas</TabButton>
        <TabButton activo={tab==='mix'}         onClick={() => setTab('mix')}         icono="🧩">Mix</TabButton>
        <TabButton activo={tab==='presupuesto'} onClick={() => setTab('presupuesto')} icono="💰">Presupuesto</TabButton>
        <TabButton activo={tab==='calendario'}  onClick={() => setTab('calendario')}  icono="📅">Calendario</TabButton>
        <TabButton activo={tab==='kpis'}        onClick={() => setTab('kpis')}        icono="📊">KPIs</TabButton>
      </nav>

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        {tab==='personas'    && <PersonasView caso={caso} />}
        {tab==='mix'         && <MixView caso={caso} />}
        {tab==='presupuesto' && <PresupuestoView caso={caso} />}
        {tab==='calendario'  && <CalendarioView caso={caso} />}
        {tab==='kpis'        && <KpisView caso={caso} />}
      </section>

      <ConclusionView caso={caso} />

      <div className="flex flex-wrap justify-between gap-3">
        <Link href="/marketing/casos" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          ← Ver otros casos
        </Link>
        <Link href="/marketing" className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">
          📣 Armar mi propio plan
        </Link>
      </div>
    </div>
  );
}

function TabButton({ activo, onClick, icono, children }: { activo: boolean; onClick: () => void; icono: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition ${
        activo ? 'border-rose-500 text-rose-700' : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      <span>{icono}</span>{children}
    </button>
  );
}

function PersonaCard({ p }: { p: BuyerPersona }) {
  return (
    <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/40 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-rose-200 text-lg font-bold text-rose-700">
          {p.nombre.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-900">{p.nombre}</h3>
          <p className="text-xs text-slate-600">{p.edad} años · {p.ocupacion}</p>
          <p className="text-[11px] text-slate-500">📍 {p.ubicacion} · 💰 {p.ingreso_aprox}</p>
        </div>
      </div>

      <blockquote className="mt-3 rounded-lg border-l-4 border-rose-400 bg-white p-2 text-xs italic text-slate-700">
        &ldquo;{p.cita}&rdquo;
      </blockquote>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Motivaciones</p>
          <ul className="mt-1 space-y-0.5">
            {p.motivaciones.map((m, i) => <li key={i} className="text-[11px] text-slate-700">• {m}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">Frustraciones</p>
          <ul className="mt-1 space-y-0.5">
            {p.frustraciones.map((f, i) => <li key={i} className="text-[11px] text-slate-700">• {f}</li>)}
          </ul>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-700">Dónde la encuentras</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {p.canales_consumo.map((c, i) => (
            <span key={i} className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] text-sky-800">{c}</span>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">⚠ Objeción típica</p>
        <p className="mt-1 text-xs italic text-amber-900">&ldquo;{p.objecion_tipica}&rdquo;</p>
      </div>
    </div>
  );
}

function PersonasView({ caso }: { caso: CasoMarketing }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Dos arquetipos de cliente con detalle suficiente para que tu equipo
        sepa exactamente cómo hablarles, qué les preocupa y dónde encontrarlos.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {caso.buyer_personas.map((p, i) => <PersonaCard key={i} p={p} />)}
      </div>
    </div>
  );
}

function MixView({ caso }: { caso: CasoMarketing }) {
  const categorias = Array.from(new Set(caso.mix.map((e) => e.categoria)));
  const emoji: Record<string, string> = {
    Producto: '📦', Precio: '💵', Plaza: '📍', Promocion: '📣',
    Personas: '👥', Procesos: '⚙️', Evidencia_fisica: '🏪',
  };
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Mezcla de marketing ({caso.mix.length} decisiones distribuidas en {categorias.length} variables del modelo {categorias.length === 4 ? '4P' : '7P'}).
      </p>
      {categorias.map((cat) => {
        const items = caso.mix.filter((e) => e.categoria === cat);
        return (
          <div key={cat} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <h3 className="text-sm font-semibold text-slate-900">{emoji[cat] ?? '•'} {cat.replace(/_/g, ' ')}</h3>
            <ul className="mt-2 space-y-2">
              {items.map((e, i) => (
                <li key={i} className="rounded-lg bg-white p-3">
                  <p className="text-sm font-semibold text-slate-900">{e.decision}</p>
                  <p className="mt-1 text-xs italic text-slate-600">{e.justificacion}</p>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function PresupuestoView({ caso }: { caso: CasoMarketing }) {
  const p = caso.presupuesto;
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Total mensual" valor={`Bs ${p.total_bs_mes.toLocaleString('es-BO')}`} color="rose" />
        <Metric label="ROAS proyectado" valor={`${p.roas_proyectado.toFixed(1)}x`} color="emerald" />
        <Metric label="Ingresos esperados" valor={`Bs ${(p.total_bs_mes * p.roas_proyectado).toLocaleString('es-BO', { maximumFractionDigits: 0 })}`} color="sky" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left text-slate-700">Canal</th>
              <th className="px-3 py-2 text-right text-slate-700">Bs/mes</th>
              <th className="px-3 py-2 text-right text-slate-700">% total</th>
              <th className="px-3 py-2 text-left text-slate-700">Resultado esperado</th>
              <th className="px-3 py-2 text-right text-slate-700">CPL</th>
            </tr>
          </thead>
          <tbody>
            {p.desglose.map((d, i) => (
              <tr key={i} className="border-t border-slate-200">
                <td className="px-3 py-2 font-medium text-slate-900">{d.canal}</td>
                <td className="px-3 py-2 text-right text-slate-700">{d.monto_bs_mes.toLocaleString('es-BO')}</td>
                <td className="px-3 py-2 text-right text-slate-600">{((d.monto_bs_mes / p.total_bs_mes) * 100).toFixed(0)}%</td>
                <td className="px-3 py-2 text-slate-700">{d.resultado_esperado}</td>
                <td className="px-3 py-2 text-right text-slate-700">{d.cpl_estimado_bs ? `Bs ${d.cpl_estimado_bs}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CalendarioView({ caso }: { caso: CasoMarketing }) {
  const porSemana: Record<number, typeof caso.calendario> = {};
  for (const a of caso.calendario) {
    if (!porSemana[a.semana]) porSemana[a.semana] = [];
    porSemana[a.semana].push(a);
  }
  const semanas = Object.keys(porSemana).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Calendario editorial concreto con {caso.calendario.length} acciones distribuidas en {semanas.length} semanas.
      </p>
      <div className="space-y-2">
        {semanas.map((s) => (
          <div key={s} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <h4 className="text-sm font-semibold text-slate-900">Semana {s}</h4>
            <ul className="mt-2 space-y-1.5">
              {porSemana[s].map((a, i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg bg-white p-2 text-xs">
                  <span className="rounded bg-rose-100 px-1.5 py-0.5 font-semibold text-rose-700">{a.tipo}</span>
                  <span className="rounded bg-sky-100 px-1.5 py-0.5 font-semibold text-sky-700">{a.canal}</span>
                  <span className="flex-1 text-slate-700">{a.contenido}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function KpisView({ caso }: { caso: CasoMarketing }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Indicadores clave a monitorear mensualmente para evaluar si el plan funciona.</p>
      <ul className="space-y-2">
        {caso.kpis.map((k, i) => (
          <li key={i} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">{i + 1}</div>
            <p className="text-sm text-slate-700">{k}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConclusionView({ caso }: { caso: CasoMarketing }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-700">Conclusión</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{caso.conclusion}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">✓ Lecciones</p>
          <ul className="mt-2 space-y-1.5">
            {caso.lecciones.map((l, i) => (
              <li key={i} className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-2 text-xs text-emerald-900">{l}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">✗ Errores evitados</p>
          <ul className="mt-2 space-y-1.5">
            {caso.errores_evitados.map((e, i) => (
              <li key={i} className="rounded-lg border border-rose-200 bg-rose-50/60 p-2 text-xs text-rose-900">{e}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, valor, color }: { label: string; valor: string; color: 'rose' | 'emerald' | 'sky' }) {
  const cls = {
    rose:    'border-rose-200 bg-rose-50 text-rose-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    sky:     'border-sky-200 bg-sky-50 text-sky-900',
  }[color];
  return (
    <div className={`rounded-lg border p-3 text-center ${cls}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-75">{label}</p>
      <p className="mt-1 text-xl font-bold">{valor}</p>
    </div>
  );
}
