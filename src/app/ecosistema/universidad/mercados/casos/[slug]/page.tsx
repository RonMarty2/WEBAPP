'use client';

/**
 * Detalle de un caso boliviano del módulo Mercados.
 *
 * Página rica con 5 tabs siguiendo el flujo metodológico:
 *   1. Diseño (pregunta, tipo, objetivos, hipótesis).
 *   2. Muestreo (población, n, técnica, justificación).
 *   3. Encuesta (selección de preguntas con tipo y opciones).
 *   4. Resultados (hallazgos + interpretación + cruce destacado).
 *   5. Conclusión y lecciones.
 */

import { useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { buscarCasoMercados } from '@/lib/casos/mercados';
import type { DificultadCaso, TipoPregunta, CasoMercados } from '@/lib/casos/types';

const DIFICULTAD_META: Record<DificultadCaso, { label: string; cls: string }> = {
  basico:     { label: 'Básico',     cls: 'bg-emerald-100 text-emerald-800' },
  intermedio: { label: 'Intermedio', cls: 'bg-amber-100 text-amber-800' },
  avanzado:   { label: 'Avanzado',   cls: 'bg-rose-100 text-rose-800' },
};

const TIPO_PREGUNTA_LABEL: Record<TipoPregunta, string> = {
  abierta: 'Pregunta abierta',
  cerrada_si_no: 'Sí / No',
  opcion_multiple: 'Opción múltiple',
  likert: 'Escala Likert',
  ranking: 'Ranking',
  escala_numerica: 'Escala numérica',
};

type TabId = 'diseno' | 'muestreo' | 'encuesta' | 'resultados' | 'conclusion';

export default function DetalleCasoMercados() {
  const params = useParams<{ slug: string }>();
  const caso = buscarCasoMercados(params.slug);
  const [tab, setTab] = useState<TabId>('diseno');

  if (!caso) return notFound();

  const dif = DIFICULTAD_META[caso.dificultad];

  return (
    <div className="space-y-6">
      <Link href="/ecosistema/universidad/mercados/casos" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        ← Volver a casos
      </Link>

      {/* Header */}
      <header className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-4xl">
            {caso.emoji ?? '📊'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${dif.cls}`}>
                Dificultad: {dif.label}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">{caso.rubro}</span>
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">n = {caso.muestreo.n_muestra}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{caso.titulo}</h1>
            <p className="mt-1 text-sm text-slate-600">{caso.tagline}</p>
            <p className="mt-3 text-xs text-slate-500">
              📍 {caso.zona} · 👤 {caso.emprendedor.nombre}, {caso.emprendedor.edad} años
            </p>
          </div>
        </div>
      </header>

      {/* Contexto */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-700">Contexto del estudio</h2>
        <p className="mt-1 text-xs italic text-slate-500">{caso.emprendedor.rol}</p>
        <div className="mt-3 space-y-3">
          {caso.contexto.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-slate-700">{p}</p>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">El problema</p>
            <p className="mt-1 text-sm text-rose-900">{caso.problema}</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Segmento objetivo</p>
            <p className="mt-1 text-sm text-emerald-900">{caso.segmento}</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <nav className="flex flex-wrap gap-1 border-b border-slate-200">
        <TabButton activo={tab === 'diseno'}      onClick={() => setTab('diseno')}      icono="📐">1. Diseño</TabButton>
        <TabButton activo={tab === 'muestreo'}    onClick={() => setTab('muestreo')}    icono="🎯">2. Muestreo</TabButton>
        <TabButton activo={tab === 'encuesta'}    onClick={() => setTab('encuesta')}    icono="📝">3. Encuesta</TabButton>
        <TabButton activo={tab === 'resultados'}  onClick={() => setTab('resultados')}  icono="📊">4. Resultados</TabButton>
        <TabButton activo={tab === 'conclusion'}  onClick={() => setTab('conclusion')}  icono="🎓">5. Conclusión</TabButton>
      </nav>

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        {tab === 'diseno'     && <DisenoView caso={caso} />}
        {tab === 'muestreo'   && <MuestreoView caso={caso} />}
        {tab === 'encuesta'   && <EncuestaView caso={caso} />}
        {tab === 'resultados' && <ResultadosView caso={caso} />}
        {tab === 'conclusion' && <ConclusionView caso={caso} />}
      </section>

      <div className="flex flex-wrap justify-between gap-3">
        <Link href="/ecosistema/universidad/mercados/casos" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          ← Ver otros casos
        </Link>
        <Link href="/ecosistema/universidad/mercados/muestreo" className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
          🔢 Calcular MI muestra
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
        activo ? 'border-sky-500 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      <span>{icono}</span>
      {children}
    </button>
  );
}

function DisenoView({ caso }: { caso: CasoMercados }) {
  const d = caso.diseno;
  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">Pregunta de investigación</p>
        <p className="mt-1 text-base font-semibold text-amber-900">{d.pregunta}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-700">Tipo de estudio</p>
          <p className="mt-1 text-sm font-semibold capitalize text-sky-900">{d.tipo}</p>
        </div>
        <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-700">Enfoque metodológico</p>
          <p className="mt-1 text-sm font-semibold capitalize text-violet-900">{d.enfoque}</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Objetivo general</p>
        <p className="mt-1 text-sm text-slate-900">{d.objetivo_general}</p>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Objetivos específicos</p>
        <ol className="mt-2 space-y-1.5">
          {d.objetivos_especificos.map((o, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-700">
              <span className="font-mono text-sky-600">{i + 1}.</span>
              <span>{o}</span>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Hipótesis a contrastar</p>
        <ul className="mt-2 space-y-1.5">
          {d.hipotesis.map((h, i) => (
            <li key={i} className="rounded-lg border border-amber-200 bg-amber-50/60 p-2 text-sm text-amber-900">
              <span className="font-semibold">H{i + 1}.</span> {h}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MuestreoView({ caso }: { caso: CasoMercados }) {
  const m = caso.muestreo;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Población (N)" valor={m.N_poblacion.toLocaleString('es-BO')} color="sky" />
        <Metric label="Muestra (n)" valor={m.n_muestra.toLocaleString('es-BO')} color="emerald" />
        <Metric label="Confianza / error" valor={m.nivel_confianza > 0 ? `${m.nivel_confianza}% / ±${m.margen_error}%` : 'n/a (cualitativo)'} color="violet" />
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Población objetivo</p>
        <p className="mt-1 text-sm text-slate-900">{m.poblacion}</p>
      </div>

      <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-700">Fórmula y cálculo</p>
        <p className="mt-1 text-sm text-sky-900">{m.formula_usada}</p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
          Técnica de muestreo: {m.tecnica.replace(/_/g, ' ')}
        </p>
        <p className="mt-1 text-sm text-amber-900">{m.justificacion_tecnica}</p>
      </div>

      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Cómo se recolectó</p>
        <p className="mt-1 text-sm text-emerald-900">{caso.recoleccion.canal}</p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-emerald-800">
          <div>⏱ Duración: <strong>{caso.recoleccion.duracion_promedio_min} min</strong></div>
          <div>📈 Tasa respuesta: <strong>{caso.recoleccion.tasa_respuesta_pct}%</strong></div>
          {caso.recoleccion.incentivo && (
            <div>🎁 Incentivo: <strong>{caso.recoleccion.incentivo}</strong></div>
          )}
        </div>
      </div>
    </div>
  );
}

function EncuestaView({ caso }: { caso: CasoMercados }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Selección representativa de las preguntas aplicadas ({caso.encuesta.length} mostradas).
        La encuesta completa puede tener más ítems demográficos y de control.
      </p>
      <ol className="space-y-3">
        {caso.encuesta.map((p) => (
          <li key={p.numero} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Pregunta {p.numero} · {TIPO_PREGUNTA_LABEL[p.tipo]}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{p.texto}</p>
                {p.opciones && (
                  <ul className="mt-2 space-y-1">
                    {p.opciones.map((o, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="mt-0.5 inline-block h-3 w-3 flex-shrink-0 rounded border border-slate-400" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {p.objetivo_que_ataca && (
                  <p className="mt-2 text-[11px] italic text-sky-700">↳ Ataca: {p.objetivo_que_ataca}</p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ResultadosView({ caso }: { caso: CasoMercados }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Hallazgos clave</p>
        {caso.resultados_clave.map((r, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">{r.variable}</p>
            <p className="mt-1 rounded-lg bg-sky-50 p-2 text-sm font-medium text-sky-900">
              📊 {r.hallazgo}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Interpretación:</span> {r.interpretacion}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">
          🔀 Cruce destacado: {caso.cruce_destacado.variables.join(' × ')}
        </p>
        <p className="mt-2 text-sm text-amber-900">{caso.cruce_destacado.hallazgo}</p>
      </div>
    </div>
  );
}

function ConclusionView({ caso }: { caso: CasoMercados }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">Recomendación final</p>
        <p className="mt-2 text-sm leading-relaxed text-emerald-900">{caso.recomendacion}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Conclusión del estudio</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{caso.conclusion}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">✓ Lecciones metodológicas</p>
          <ul className="mt-2 space-y-1.5">
            {caso.lecciones.map((l, i) => (
              <li key={i} className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-2 text-xs text-emerald-900">
                {l}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">✗ Errores evitados</p>
          <ul className="mt-2 space-y-1.5">
            {caso.errores_evitados.map((e, i) => (
              <li key={i} className="rounded-lg border border-rose-200 bg-rose-50/60 p-2 text-xs text-rose-900">
                {e}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, valor, color }: { label: string; valor: string; color: 'sky' | 'emerald' | 'violet' }) {
  const cls = {
    sky:     'border-sky-200 bg-sky-50 text-sky-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    violet:  'border-violet-200 bg-violet-50 text-violet-900',
  }[color];
  return (
    <div className={`rounded-lg border p-3 text-center ${cls}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-75">{label}</p>
      <p className="mt-1 text-xl font-bold">{valor}</p>
    </div>
  );
}
