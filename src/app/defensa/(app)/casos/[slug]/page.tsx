'use client';

/**
 * Detalle de un caso de Defensa.
 * Tabs: 1.Proyecto, 2.Preguntas (filtrables por categoría y dificultad),
 * 3.Puntos débiles, 4.Fortalezas, 5.Cierre psicológico.
 */

import { useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { buscarCasoDefensa } from '@/lib/casos/defensa';
import type {
  CasoDefensa, DificultadCaso, PreguntaTribunal,
  CategoriaPreguntaTribunal, DificultadPregunta, PuntoDefendible,
} from '@/lib/casos/types';

const DIFICULTAD_META: Record<DificultadCaso, { label: string; cls: string }> = {
  basico:     { label: 'Básico',     cls: 'bg-emerald-100 text-emerald-800' },
  intermedio: { label: 'Intermedio', cls: 'bg-amber-100 text-amber-800' },
  avanzado:   { label: 'Avanzado',   cls: 'bg-rose-100 text-rose-800' },
};

const CATEGORIA_LABEL: Record<CategoriaPreguntaTribunal, { label: string; emoji: string }> = {
  problema:      { label: 'Problema',       emoji: '🎯' },
  metodologia:   { label: 'Metodología',    emoji: '🔬' },
  marco_teorico: { label: 'Marco teórico',  emoji: '📚' },
  resultados:    { label: 'Resultados',     emoji: '📊' },
  conclusiones:  { label: 'Conclusiones',   emoji: '🏁' },
  viabilidad:    { label: 'Viabilidad',     emoji: '💼' },
  personal:      { label: 'Personal',       emoji: '👤' },
};

const DIF_PREGUNTA_META: Record<DificultadPregunta, { label: string; cls: string }> = {
  facil:   { label: 'Fácil',   cls: 'bg-emerald-100 text-emerald-800' },
  media:   { label: 'Media',   cls: 'bg-sky-100 text-sky-800' },
  dificil: { label: 'Difícil', cls: 'bg-amber-100 text-amber-800' },
  trampa:  { label: '⚠ Trampa', cls: 'bg-rose-100 text-rose-800' },
};

type TabId = 'proyecto' | 'preguntas' | 'debiles' | 'fortalezas' | 'cierre';

export default function DetalleCasoDefensa() {
  const params = useParams<{ slug: string }>();
  const caso = buscarCasoDefensa(params.slug);
  const [tab, setTab] = useState<TabId>('proyecto');

  if (!caso) return notFound();
  const dif = DIFICULTAD_META[caso.dificultad];

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <Link href="/defensa/casos" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        ← Volver a casos
      </Link>

      <header className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-4xl">
            {caso.emoji ?? '🎓'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${dif.cls}`}>Dificultad: {dif.label}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">{caso.proyecto.universidad}</span>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">{caso.proyecto.carrera}</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">{caso.preguntas.length} preguntas</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{caso.titulo}</h1>
            <p className="mt-1 text-sm text-slate-600">{caso.tagline}</p>
            <p className="mt-3 text-xs text-slate-500">👤 {caso.emprendedor.nombre}, {caso.emprendedor.edad} años</p>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-700">Contexto</h2>
        <p className="mt-1 text-xs italic text-slate-500">{caso.emprendedor.rol}</p>
        <div className="mt-3 space-y-3">
          {caso.contexto.map((p, i) => <p key={i} className="text-sm leading-relaxed text-slate-700">{p}</p>)}
        </div>
      </section>

      <nav className="flex flex-wrap gap-1 border-b border-slate-200">
        <TabButton activo={tab==='proyecto'}   onClick={() => setTab('proyecto')}   icono="📄">Proyecto</TabButton>
        <TabButton activo={tab==='preguntas'}  onClick={() => setTab('preguntas')}  icono="❓">Preguntas ({caso.preguntas.length})</TabButton>
        <TabButton activo={tab==='debiles'}    onClick={() => setTab('debiles')}    icono="⚠️">Puntos débiles</TabButton>
        <TabButton activo={tab==='fortalezas'} onClick={() => setTab('fortalezas')} icono="💪">Fortalezas</TabButton>
        <TabButton activo={tab==='cierre'}     onClick={() => setTab('cierre')}     icono="🧘">Cierre</TabButton>
      </nav>

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        {tab==='proyecto'   && <ProyectoView caso={caso} />}
        {tab==='preguntas'  && <PreguntasView caso={caso} />}
        {tab==='debiles'    && <PuntosView puntos={caso.puntos_debiles} color="rose" titulo="Puntos débiles del proyecto" />}
        {tab==='fortalezas' && <PuntosView puntos={caso.fortalezas} color="emerald" titulo="Fortalezas del proyecto" />}
        {tab==='cierre'     && <CierreView caso={caso} />}
      </section>

      <ConclusionView caso={caso} />

      <div className="flex flex-wrap justify-between gap-3">
        <Link href="/defensa/casos" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          ← Otros casos
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
        activo ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      <span>{icono}</span>{children}
    </button>
  );
}

function ProyectoView({ caso }: { caso: CasoDefensa }) {
  const p = caso.proyecto;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-800">Título del proyecto</p>
        <h3 className="mt-1 text-base font-bold text-indigo-900">{p.titulo}</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Carrera</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{p.carrera}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Universidad</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{p.universidad}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Modalidad</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{p.modalidad}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Año de defensa</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{p.ano}</p>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Resumen del proyecto</p>
        <p className="mt-1 text-sm text-amber-900">{p.resumen_proyecto}</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Cómo será el tribunal</p>
        <p className="mt-1 text-sm text-slate-700">{caso.segmento}</p>
      </div>
    </div>
  );
}

function PreguntasView({ caso }: { caso: CasoDefensa }) {
  const [filtroCat, setFiltroCat] = useState<CategoriaPreguntaTribunal | ''>('');
  const [filtroDif, setFiltroDif] = useState<DificultadPregunta | ''>('');
  const [abierta, setAbierta] = useState<number | null>(null);

  const filtradas = caso.preguntas.filter((p) => {
    if (filtroCat && p.categoria !== filtroCat) return false;
    if (filtroDif && p.dificultad !== filtroDif) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Filtros</span>
        <select
          value={filtroCat}
          onChange={(e) => setFiltroCat(e.target.value as CategoriaPreguntaTribunal | '')}
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
        >
          <option value="">Todas las categorías</option>
          {Object.entries(CATEGORIA_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v.emoji} {v.label}</option>
          ))}
        </select>
        <select
          value={filtroDif}
          onChange={(e) => setFiltroDif(e.target.value as DificultadPregunta | '')}
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
        >
          <option value="">Todas las dificultades</option>
          <option value="facil">Fácil</option>
          <option value="media">Media</option>
          <option value="dificil">Difícil</option>
          <option value="trampa">⚠ Trampa</option>
        </select>
        <span className="ml-auto text-xs text-slate-500">{filtradas.length} / {caso.preguntas.length}</span>
      </div>

      <ol className="space-y-2">
        {filtradas.map((p) => <PreguntaCard key={p.numero} p={p} abierta={abierta === p.numero} onToggle={() => setAbierta(abierta === p.numero ? null : p.numero)} />)}
      </ol>
    </div>
  );
}

function PreguntaCard({ p, abierta, onToggle }: { p: PreguntaTribunal; abierta: boolean; onToggle: () => void }) {
  const cat = CATEGORIA_LABEL[p.categoria];
  const dif = DIF_PREGUNTA_META[p.dificultad];
  return (
    <li className="rounded-xl border border-slate-200 bg-white">
      <button onClick={onToggle} className="flex w-full items-start gap-3 p-3 text-left" aria-expanded={abierta}>
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
          {p.numero}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-slate-700">{cat.emoji} {cat.label}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase ${dif.cls}`}>{dif.label}</span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-slate-900">{p.pregunta}</p>
        </div>
        <span className={`text-slate-400 transition ${abierta ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {abierta && (
        <div className="space-y-3 border-t border-slate-200 p-3">
          <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Respuesta modelo</p>
            <p className="mt-1 text-sm leading-relaxed text-emerald-900">{p.respuesta_modelo}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-700">Qué evalúa el tribunal</p>
              <p className="mt-1 text-xs text-sky-900">{p.que_evalua}</p>
            </div>
            {p.trampa_evitar && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">⚠ Trampa a evitar</p>
                <p className="mt-1 text-xs text-rose-900">{p.trampa_evitar}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

function PuntosView({ puntos, color, titulo }: { puntos: PuntoDefendible[]; color: 'rose' | 'emerald'; titulo: string }) {
  const cls = color === 'rose' ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50';
  const txt = color === 'rose' ? 'text-rose-900' : 'text-emerald-900';
  const hd  = color === 'rose' ? 'text-rose-700' : 'text-emerald-700';
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">{titulo}</p>
      <div className="space-y-3">
        {puntos.map((p, i) => (
          <div key={i} className={`rounded-xl border ${cls} p-4`}>
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${hd}`}>Punto {i + 1}</p>
            <p className={`mt-1 text-sm font-semibold ${txt}`}>{p.punto}</p>
            <div className="mt-3 rounded-lg bg-white p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Cómo manejarlo</p>
              <p className="mt-1 text-sm text-slate-700">{p.como_manejarlo}</p>
            </div>
            {p.frase_clave && (
              <div className="mt-2 rounded-lg border-l-4 border-violet-500 bg-violet-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-700">💬 Frase clave (memorizable)</p>
                <p className="mt-1 text-sm italic text-violet-900">&ldquo;{p.frase_clave}&rdquo;</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CierreView({ caso }: { caso: CasoDefensa }) {
  return (
    <div className="rounded-2xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 text-center">
      <p className="text-3xl">🧘</p>
      <p className="mt-3 text-base leading-relaxed text-indigo-900">{caso.cierre}</p>
    </div>
  );
}

function ConclusionView({ caso }: { caso: CasoDefensa }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-700">Conclusión del caso</h2>
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
