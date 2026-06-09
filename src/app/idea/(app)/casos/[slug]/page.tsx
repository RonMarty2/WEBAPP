'use client';

/**
 * Detalle de un caso boliviano del módulo Idea.
 *
 * Página rica con todo el caso resuelto:
 *   1. Header con emprendedor, contexto y problema.
 *   2. Tabs con Lean Canvas, Propuesta de Valor, Validación y Scorecard.
 *   3. Conclusión + lecciones aplicables + errores evitados.
 *
 * El estudiante NO puede editar el caso (es plantilla). Pero hay un CTA
 * para copiar la estructura como plantilla de su propio proyecto (Sprint 1.5).
 */

import { useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import {
  ArrowLeft, MapPin, Briefcase, User, Award, Lightbulb, AlertOctagon,
  CheckCircle2, Target, Heart, Wrench, BadgeCheck,
} from 'lucide-react';
import { buscarCasoIdea } from '@/lib/casos/idea';
import type { DificultadCaso } from '@/lib/casos/types';

const DIFICULTAD_META: Record<DificultadCaso, { label: string; cls: string }> = {
  basico:     { label: 'Básico',     cls: 'bg-emerald-100 text-emerald-800' },
  intermedio: { label: 'Intermedio', cls: 'bg-amber-100 text-amber-800' },
  avanzado:   { label: 'Avanzado',   cls: 'bg-rose-100 text-rose-800' },
};

type TabId = 'canvas' | 'propuesta' | 'validacion' | 'scorecard';

export default function DetalleCasoIdea() {
  const params = useParams<{ slug: string }>();
  const caso = buscarCasoIdea(params.slug);
  const [tab, setTab] = useState<TabId>('canvas');

  if (!caso) return notFound();

  const dif = DIFICULTAD_META[caso.dificultad];

  return (
    <div className="mx-auto max-w-4xl pb-10">
      <Link href="/idea/casos" className="inline-flex items-center gap-1 text-sm idea-muted hover:opacity-80">
        <ArrowLeft className="h-4 w-4" /> Volver a casos
      </Link>

      {/* Header */}
      <header className="idea-card mt-4 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-4xl">
            {caso.emoji ?? '💡'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${dif.cls}`}>
                Dificultad: {dif.label}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                {caso.rubro}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{caso.titulo}</h1>
            <p className="idea-muted mt-1 text-sm leading-relaxed">{caso.tagline}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs idea-muted">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {caso.zona}
              </span>
              <span className="inline-flex items-center gap-1">
                <Briefcase className="h-3 w-3" /> {caso.rubro}
              </span>
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" /> {caso.emprendedor.nombre}, {caso.emprendedor.edad} años
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Contexto */}
      <section className="idea-card mt-4 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Lightbulb className="h-4 w-4 idea-accent-text" /> Contexto y origen
        </h2>
        <p className="idea-muted mt-1 text-xs italic">{caso.emprendedor.rol}</p>
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

      {/* Tabs de herramientas */}
      <nav className="mt-5 flex flex-wrap gap-1 border-b border-slate-200">
        <TabButton activo={tab === 'canvas'}     onClick={() => setTab('canvas')}     icon={<Wrench className="h-3.5 w-3.5" />}>Lean Canvas</TabButton>
        <TabButton activo={tab === 'propuesta'}  onClick={() => setTab('propuesta')}  icon={<Heart className="h-3.5 w-3.5" />}>Propuesta de Valor</TabButton>
        <TabButton activo={tab === 'validacion'} onClick={() => setTab('validacion')} icon={<Target className="h-3.5 w-3.5" />}>Validación</TabButton>
        <TabButton activo={tab === 'scorecard'}  onClick={() => setTab('scorecard')}  icon={<Award className="h-3.5 w-3.5" />}>Scorecard</TabButton>
      </nav>

      {/* Contenido del tab */}
      <section className="idea-card mt-4 p-5">
        {tab === 'canvas' && <LeanCanvasView caso={caso} />}
        {tab === 'propuesta' && <PropuestaValorView caso={caso} />}
        {tab === 'validacion' && <ValidacionView caso={caso} />}
        {tab === 'scorecard' && <ScorecardView caso={caso} />}
      </section>

      {/* Conclusión + lecciones */}
      <section className="idea-card mt-4 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <BadgeCheck className="h-4 w-4 text-emerald-600" /> Conclusión del caso
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{caso.conclusion}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">✓ Lecciones aplicables</p>
            <ul className="mt-2 space-y-1.5">
              {caso.lecciones.map((l, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed text-slate-700">
                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">✗ Errores que el caso evitó</p>
            <ul className="mt-2 space-y-1.5">
              {caso.errores_evitados.map((e, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed text-slate-700">
                  <AlertOctagon className="h-3.5 w-3.5 flex-shrink-0 text-rose-600" />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <Link href="/idea/casos" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" /> Ver otros casos
        </Link>
        <Link href="/idea/proyectos" className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">
          <Lightbulb className="h-4 w-4" /> Empezar mi propia idea
        </Link>
      </div>
    </div>
  );
}

function TabButton({ activo, onClick, icon, children }: { activo: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition ${
        activo
          ? 'border-amber-500 text-amber-700'
          : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function LeanCanvasView({ caso }: { caso: ReturnType<typeof buscarCasoIdea> & object }) {
  const lc = caso.lean_canvas;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Bloque titulo="Problema" items={lc.problema} colorAccento="rose" />
      <Bloque titulo="Solución" items={lc.solucion} colorAccento="emerald" />
      <BloqueTexto titulo="Propuesta única de valor" texto={lc.propuesta_unica} colorAccento="amber" />
      <BloqueTexto titulo="Segmento de clientes" texto={lc.segmento} colorAccento="violet" />
      <Bloque titulo="Canales" items={lc.canales} colorAccento="sky" />
      <Bloque titulo="Métricas clave" items={lc.metricas_clave} colorAccento="indigo" />
      <Bloque titulo="Flujo de ingresos" items={lc.flujo_ingresos} colorAccento="emerald" />
      <Bloque titulo="Estructura de costos" items={lc.estructura_costos} colorAccento="orange" />
      <BloqueTexto titulo="Ventaja competitiva" texto={lc.ventaja_competitiva} colorAccento="violet" />
    </div>
  );
}

function PropuestaValorView({ caso }: { caso: ReturnType<typeof buscarCasoIdea> & object }) {
  const pv = caso.propuesta_valor;
  return (
    <div>
      <p className="text-xs idea-muted">
        El <strong>perfil del cliente</strong> (izquierda) y el <strong>mapa de valor</strong> (derecha)
        deben encajar como pieza de rompecabezas: cada dolor tiene su aliviador,
        cada ganancia tiene su creador.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border-2 border-dashed border-slate-300 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider idea-muted">Perfil del cliente</p>
          <div className="mt-3 space-y-3">
            <Bloque titulo="Trabajos que quiere lograr" items={pv.trabajos_cliente} colorAccento="sky" />
            <Bloque titulo="Dolores" items={pv.dolores} colorAccento="rose" />
            <Bloque titulo="Ganancias que busca" items={pv.ganancias} colorAccento="emerald" />
          </div>
        </div>
        <div className="rounded-xl border-2 border-dashed border-amber-300 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Mapa de valor</p>
          <div className="mt-3 space-y-3">
            <Bloque titulo="Productos / servicios" items={pv.productos} colorAccento="sky" />
            <Bloque titulo="Aliviadores de dolor" items={pv.aliviadores} colorAccento="rose" />
            <Bloque titulo="Creadores de ganancia" items={pv.creadores} colorAccento="emerald" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ValidacionView({ caso }: { caso: ReturnType<typeof buscarCasoIdea> & object }) {
  const v = caso.validacion;
  return (
    <div>
      <h3 className="text-sm font-semibold">Hipótesis y experimentos</h3>
      <p className="idea-muted mt-1 text-xs">
        Cada hipótesis se valida con un experimento concreto y barato.
        Si el resultado se desvía del esperado, hay que pivotar.
      </p>

      <ul className="mt-4 space-y-3">
        {v.hipotesis.map((h, i) => (
          <li key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Hipótesis {i + 1}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">{h.hipotesis}</p>
            <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
              <div>
                <p className="font-semibold text-sky-700">Experimento</p>
                <p className="mt-0.5 text-slate-700">{h.experimento}</p>
              </div>
              <div>
                <p className="font-semibold text-violet-700">Métrica</p>
                <p className="mt-0.5 text-slate-700">{h.metrica}</p>
              </div>
              <div>
                <p className="font-semibold text-amber-700">Resultado esperado</p>
                <p className="mt-0.5 text-slate-700">{h.resultado_esperado}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">
          Qué pasó en la realidad
        </p>
        <p className="mt-2 text-sm leading-relaxed text-amber-900">{v.resultado}</p>
      </div>
    </div>
  );
}

function ScorecardView({ caso }: { caso: ReturnType<typeof buscarCasoIdea> & object }) {
  const s = caso.scorecard;
  return (
    <div>
      <p className="text-xs idea-muted">
        Tres ejes para evaluar una idea antes de invertir. Cada uno se puntúa
        del 1 (débil) al 5 (fuerte). La nota final es interpretativa, no un promedio.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <ScoreBox label="Deseabilidad" valor={s.deseabilidad} subtitulo="¿Lo quiere el cliente?" />
        <ScoreBox label="Factibilidad" valor={s.factibilidad} subtitulo="¿Lo podemos construir?" />
        <ScoreBox label="Viabilidad"   valor={s.viabilidad}   subtitulo="¿Es rentable?" />
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Interpretación</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{s.nota}</p>
      </div>
    </div>
  );
}

function ScoreBox({ label, valor, subtitulo }: { label: string; valor: number; subtitulo: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
      <p className="text-xs font-semibold text-slate-700">{label}</p>
      <p className="idea-muted mt-0.5 text-[10px]">{subtitulo}</p>
      <p className="mt-3 text-4xl font-bold text-amber-600">{valor}<span className="text-sm font-normal text-slate-400">/5</span></p>
      <div className="mt-3 flex items-center justify-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`h-2 w-6 rounded-full ${i <= valor ? 'bg-amber-500' : 'bg-slate-200'}`}
          />
        ))}
      </div>
    </div>
  );
}

type ColorAccento = 'rose' | 'emerald' | 'amber' | 'violet' | 'sky' | 'indigo' | 'orange';
const ACCENT_CLASSES: Record<ColorAccento, { border: string; bg: string; text: string }> = {
  rose:    { border: 'border-rose-200',    bg: 'bg-rose-50',    text: 'text-rose-700' },
  emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  amber:   { border: 'border-amber-200',   bg: 'bg-amber-50',   text: 'text-amber-700' },
  violet:  { border: 'border-violet-200',  bg: 'bg-violet-50',  text: 'text-violet-700' },
  sky:     { border: 'border-sky-200',     bg: 'bg-sky-50',     text: 'text-sky-700' },
  indigo:  { border: 'border-indigo-200',  bg: 'bg-indigo-50',  text: 'text-indigo-700' },
  orange:  { border: 'border-orange-200',  bg: 'bg-orange-50',  text: 'text-orange-700' },
};

function Bloque({ titulo, items, colorAccento }: { titulo: string; items: string[]; colorAccento: ColorAccento }) {
  const c = ACCENT_CLASSES[colorAccento];
  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} p-3`}>
      <p className={`text-[10px] font-semibold uppercase tracking-wider ${c.text}`}>{titulo}</p>
      <ul className="mt-2 space-y-1">
        {items.map((it, i) => (
          <li key={i} className="text-xs leading-relaxed text-slate-700">• {it}</li>
        ))}
      </ul>
    </div>
  );
}

function BloqueTexto({ titulo, texto, colorAccento }: { titulo: string; texto: string; colorAccento: ColorAccento }) {
  const c = ACCENT_CLASSES[colorAccento];
  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} p-3`}>
      <p className={`text-[10px] font-semibold uppercase tracking-wider ${c.text}`}>{titulo}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-700">{texto}</p>
    </div>
  );
}
