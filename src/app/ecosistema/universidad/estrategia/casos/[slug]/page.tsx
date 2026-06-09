'use client';

/**
 * Detalle de un caso de Estrategia.
 * Tabs siguiendo el flujo metodológico: 1.PESTEL, 2.Porter, 3.MPC,
 * 4.FODA + cruzado, 5.Matriz nivel 3, 6.MCPE, 7.Plan de acción.
 */

import { useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { buscarCasoEstrategia } from '@/lib/casos/estrategia';
import type { CasoEstrategia, DificultadCaso, FactorPESTEL, FuerzaPorter } from '@/lib/casos/types';

const DIFICULTAD_META: Record<DificultadCaso, { label: string; cls: string }> = {
  basico:     { label: 'Básico',     cls: 'bg-emerald-100 text-emerald-800' },
  intermedio: { label: 'Intermedio', cls: 'bg-amber-100 text-amber-800' },
  avanzado:   { label: 'Avanzado',   cls: 'bg-rose-100 text-rose-800' },
};

type TabId = 'pestel' | 'porter' | 'mpc' | 'foda' | 'matriz' | 'mcpe' | 'plan';

export default function DetalleCasoEstrategia() {
  const params = useParams<{ slug: string }>();
  const caso = buscarCasoEstrategia(params.slug);
  const [tab, setTab] = useState<TabId>('pestel');

  if (!caso) return notFound();

  const dif = DIFICULTAD_META[caso.dificultad];

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <Link href="/ecosistema/universidad/estrategia/casos" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        ← Volver a casos
      </Link>

      <header className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-4xl">
            {caso.emoji ?? '🎯'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${dif.cls}`}>Dificultad: {dif.label}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">{caso.rubro}</span>
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">{caso.matriz_nivel3.tipo}: {caso.matriz_nivel3.posicion}</span>
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
        <TabButton activo={tab==='pestel'} onClick={() => setTab('pestel')} icono="🌐">PESTEL</TabButton>
        <TabButton activo={tab==='porter'} onClick={() => setTab('porter')} icono="🛡️">Porter</TabButton>
        <TabButton activo={tab==='mpc'}    onClick={() => setTab('mpc')}    icono="⚖️">MPC</TabButton>
        <TabButton activo={tab==='foda'}   onClick={() => setTab('foda')}   icono="📋">FODA</TabButton>
        <TabButton activo={tab==='matriz'} onClick={() => setTab('matriz')} icono="📐">{caso.matriz_nivel3.tipo}</TabButton>
        <TabButton activo={tab==='mcpe'}   onClick={() => setTab('mcpe')}   icono="🎯">MCPE</TabButton>
        <TabButton activo={tab==='plan'}   onClick={() => setTab('plan')}   icono="🚀">Plan</TabButton>
      </nav>

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        {tab==='pestel' && <PestelView caso={caso} />}
        {tab==='porter' && <PorterView caso={caso} />}
        {tab==='mpc'    && <MpcView caso={caso} />}
        {tab==='foda'   && <FodaView caso={caso} />}
        {tab==='matriz' && <MatrizView caso={caso} />}
        {tab==='mcpe'   && <McpeView caso={caso} />}
        {tab==='plan'   && <PlanView caso={caso} />}
      </section>

      <ConclusionView caso={caso} />

      <div className="flex flex-wrap justify-between gap-3">
        <Link href="/ecosistema/universidad/estrategia/casos" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          ← Ver otros casos
        </Link>
        <Link href="/ecosistema/universidad/estrategia" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">
          🎯 Armar mi propio análisis
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
        activo ? 'border-violet-500 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      <span>{icono}</span>{children}
    </button>
  );
}

function FactorChip({ f }: { f: FactorPESTEL }) {
  const color = f.impacto === 'positivo' ? 'border-emerald-200 bg-emerald-50' : f.impacto === 'negativo' ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50';
  return (
    <div className={`rounded-lg border ${color} p-3`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">{f.nombre}</p>
        <span className="flex-shrink-0 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{f.intensidad}/5</span>
      </div>
      <p className="mt-1 text-xs text-slate-700">{f.descripcion}</p>
      <p className="mt-2 text-[11px] italic text-slate-600">→ {f.implicacion}</p>
    </div>
  );
}

function PestelView({ caso }: { caso: CasoEstrategia }) {
  const p = caso.pestel;
  const bloques: { titulo: string; emoji: string; items: FactorPESTEL[] }[] = [
    { titulo: 'Político',   emoji: '🏛️', items: p.politico },
    { titulo: 'Económico',  emoji: '💰', items: p.economico },
    { titulo: 'Social',     emoji: '👥', items: p.social },
    { titulo: 'Tecnológico', emoji: '💻', items: p.tecnologico },
    { titulo: 'Ecológico',  emoji: '🌱', items: p.ecologico },
    { titulo: 'Legal',      emoji: '⚖️', items: p.legal },
  ];
  return (
    <div className="space-y-4">
      {bloques.map((b) => (
        <div key={b.titulo}>
          <h3 className="text-sm font-semibold text-slate-900">{b.emoji} {b.titulo}</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {b.items.map((f, i) => <FactorChip key={i} f={f} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function FuerzaCard({ titulo, f }: { titulo: string; f: FuerzaPorter }) {
  const intColor = f.intensidad === 'alto' ? 'border-rose-300 bg-rose-50' : f.intensidad === 'medio' ? 'border-amber-300 bg-amber-50' : 'border-emerald-300 bg-emerald-50';
  return (
    <div className={`rounded-xl border-2 ${intColor} p-3`}>
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900">{titulo}</h4>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
          {f.intensidad}
        </span>
      </div>
      <ul className="mt-2 space-y-1">
        {f.justificacion.map((j, i) => <li key={i} className="text-[11px] text-slate-700">• {j}</li>)}
      </ul>
      <p className="mt-2 rounded bg-white/60 p-2 text-xs italic text-slate-700">↳ {f.estrategia}</p>
    </div>
  );
}

function PorterView({ caso }: { caso: CasoEstrategia }) {
  const p = caso.porter;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-violet-300 bg-violet-50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-800">Atractivo del sector</p>
          <span className="text-xl font-bold text-violet-900">{p.atractivo_sector}/5</span>
        </div>
        <p className="mt-1 text-sm text-violet-900">{p.conclusion}</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <FuerzaCard titulo="Rivalidad entre competidores" f={p.rivalidad} />
        <FuerzaCard titulo="Amenaza de nuevos entrantes"  f={p.nuevos_entrantes} />
        <FuerzaCard titulo="Amenaza de sustitutos"        f={p.sustitutos} />
        <FuerzaCard titulo="Poder de proveedores"         f={p.poder_proveedores} />
        <FuerzaCard titulo="Poder de clientes"            f={p.poder_clientes} />
      </div>
    </div>
  );
}

function MpcView({ caso }: { caso: CasoEstrategia }) {
  const m = caso.mpc;
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Matriz de Perfil Competitivo: compara el proyecto con sus competidores
        en los factores críticos de éxito del sector.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-2 py-2 text-left text-slate-700">Factor crítico</th>
              <th className="px-2 py-2 text-center text-slate-700">Peso</th>
              {m.competidores.map((c, i) => (
                <th key={i} className="px-2 py-2 text-center text-slate-700">{c.nombre}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {m.factores.map((f, i) => (
              <tr key={i} className="border-t border-slate-200">
                <td className="px-2 py-2 text-slate-900">{f.nombre}</td>
                <td className="px-2 py-2 text-center text-slate-700">{f.peso.toFixed(2)}</td>
                {m.competidores.map((c, j) => (
                  <td key={j} className="px-2 py-2 text-center text-slate-700">{c.notas[i]}</td>
                ))}
              </tr>
            ))}
            <tr className="border-t-2 border-slate-300 bg-violet-50 font-bold">
              <td className="px-2 py-2 text-slate-900" colSpan={2}>Total ponderado</td>
              {m.competidores.map((c, j) => (
                <td key={j} className="px-2 py-2 text-center text-violet-900">{c.total_ponderado.toFixed(2)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <strong>Conclusión:</strong> {m.conclusion}
      </p>
    </div>
  );
}

function FodaView({ caso }: { caso: CasoEstrategia }) {
  const f = caso.foda;
  const x = caso.foda_cruzado;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Bloque titulo="Fortalezas" items={f.fortalezas} color="emerald" />
        <Bloque titulo="Oportunidades" items={f.oportunidades} color="sky" />
        <Bloque titulo="Debilidades" items={f.debilidades} color="amber" />
        <Bloque titulo="Amenazas" items={f.amenazas} color="rose" />
      </div>
      <div className="rounded-2xl border-2 border-violet-300 bg-violet-50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-800">FODA Cruzado — Estrategias derivadas</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <BloqueCruzado titulo="FO (Ofensivas)" items={x.fo} color="emerald" />
          <BloqueCruzado titulo="DO (Adaptativas)" items={x.do} color="sky" />
          <BloqueCruzado titulo="FA (Defensivas)" items={x.fa} color="amber" />
          <BloqueCruzado titulo="DA (Supervivencia)" items={x.da} color="rose" />
        </div>
      </div>
    </div>
  );
}

function MatrizView({ caso }: { caso: CasoEstrategia }) {
  const m = caso.matriz_nivel3;
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-violet-300 bg-violet-50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-800">Matriz {m.tipo}</p>
        <h3 className="mt-2 text-xl font-bold text-violet-900">Posición: {m.posicion}</h3>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Justificación</p>
        <p className="mt-1 text-sm text-slate-700">{m.justificacion}</p>
      </div>
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Implicación estratégica</p>
        <p className="mt-1 text-sm text-emerald-900">{m.implicacion}</p>
      </div>
    </div>
  );
}

function McpeView({ caso }: { caso: CasoEstrategia }) {
  const m = caso.mcpe;
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Matriz Cuantitativa de Planeamiento Estratégico: compara las estrategias
        candidatas frente a los factores ponderados.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-2 py-2 text-left text-slate-700">Factor</th>
              <th className="px-2 py-2 text-center text-slate-700">Peso</th>
              {m.filas.map((f, i) => (
                <th key={i} className="px-2 py-2 text-center text-slate-700">{f.estrategia}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {m.factores.map((f, i) => (
              <tr key={i} className="border-t border-slate-200">
                <td className="px-2 py-2 text-slate-900">{f.nombre}</td>
                <td className="px-2 py-2 text-center text-slate-700">{f.peso.toFixed(2)}</td>
                {m.filas.map((fi, j) => (
                  <td key={j} className="px-2 py-2 text-center text-slate-700">{fi.notas[i]}</td>
                ))}
              </tr>
            ))}
            <tr className="border-t-2 border-slate-300 bg-violet-50 font-bold">
              <td className="px-2 py-2 text-slate-900" colSpan={2}>Total</td>
              {m.filas.map((f, j) => (
                <td key={j} className={`px-2 py-2 text-center ${f.estrategia === m.estrategia_elegida ? 'bg-emerald-100 text-emerald-900' : 'text-violet-900'}`}>
                  {f.total.toFixed(2)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">Estrategia ganadora</p>
        <h3 className="mt-1 text-lg font-bold text-emerald-900">{m.estrategia_elegida}</h3>
        <p className="mt-2 text-sm text-emerald-900">{m.justificacion}</p>
      </div>
    </div>
  );
}

function PlanView({ caso }: { caso: CasoEstrategia }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Plan de acción concreto resultante del análisis. Cada paso es accionable.</p>
      <ol className="space-y-2">
        {caso.plan_accion.map((p, i) => (
          <li key={i} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
              {i + 1}
            </div>
            <p className="text-sm text-slate-700">{p}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ConclusionView({ caso }: { caso: CasoEstrategia }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-700">Conclusión del caso</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{caso.conclusion}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">✓ Lecciones aplicables</p>
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

type ColorBox = 'emerald' | 'sky' | 'amber' | 'rose';
const COLOR_BOX: Record<ColorBox, { border: string; bg: string; text: string }> = {
  emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  sky:     { border: 'border-sky-200',     bg: 'bg-sky-50',     text: 'text-sky-700' },
  amber:   { border: 'border-amber-200',   bg: 'bg-amber-50',   text: 'text-amber-700' },
  rose:    { border: 'border-rose-200',    bg: 'bg-rose-50',    text: 'text-rose-700' },
};

function Bloque({ titulo, items, color }: { titulo: string; items: string[]; color: ColorBox }) {
  const c = COLOR_BOX[color];
  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} p-3`}>
      <p className={`text-[10px] font-semibold uppercase tracking-wider ${c.text}`}>{titulo}</p>
      <ul className="mt-2 space-y-1">
        {items.map((it, i) => <li key={i} className="text-xs leading-relaxed text-slate-700">• {it}</li>)}
      </ul>
    </div>
  );
}

function BloqueCruzado({ titulo, items, color }: { titulo: string; items: string[]; color: ColorBox }) {
  const c = COLOR_BOX[color];
  return (
    <div className={`rounded-lg border-2 ${c.border} bg-white p-3`}>
      <p className={`text-[10px] font-semibold uppercase tracking-wider ${c.text}`}>{titulo}</p>
      <ul className="mt-2 space-y-1">
        {items.map((it, i) => <li key={i} className="text-xs leading-relaxed text-slate-700">{i + 1}. {it}</li>)}
      </ul>
    </div>
  );
}
