'use client';

/**
 * Demo de la Calculadora reactiva de tamaño de muestra (Cochran).
 *
 * Vive dentro del layout de Mercados (PlatformShell con sidebar), por eso
 * NO envolvemos en PlatformShell. Solo renderizamos contenido.
 */

import Link from 'next/link';
import { Sparkles, BookOpen, FlaskConical, ArrowRight } from 'lucide-react';
import CalcMuestraCochran from '@/components/calc-reactivas/CalcMuestraCochran';

export default function Page() {
  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-white p-6 md:p-8">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-sky-600" />
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">
            Calculadora reactiva · Sin guardar nada
          </p>
        </div>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
          ¿Cuántas personas debes encuestar?
        </h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Mueve los sliders y el tamaño de muestra se recalcula en vivo. Sin esperar al
          servidor, sin llamadas a IA: pura fórmula de Cochran con corrección por
          población finita.
        </p>
        <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
          <div className="rounded-xl bg-white/70 p-3">
            <p className="font-semibold text-slate-900">1. Define tu universo</p>
            <p className="text-xs text-slate-600">
              ¿Cuántas personas componen el total que estudias?
            </p>
          </div>
          <div className="rounded-xl bg-white/70 p-3">
            <p className="font-semibold text-slate-900">2. Elige tu rigor</p>
            <p className="text-xs text-slate-600">
              Confianza y margen de error según el nivel académico que necesitas.
            </p>
          </div>
          <div className="rounded-xl bg-white/70 p-3">
            <p className="font-semibold text-slate-900">3. Lee implicaciones</p>
            <p className="text-xs text-slate-600">
              Tiempo, costo y cobertura — antes de salir a campo.
            </p>
          </div>
        </div>
      </header>

      <CalcMuestraCochran />

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/ecosistema/universidad/mercados/muestreo"
          className="group flex items-start gap-3 rounded-2xl border border-sky-200 bg-white p-5 transition hover:border-sky-400 hover:shadow-md"
        >
          <FlaskConical className="h-6 w-6 flex-shrink-0 text-sky-600" />
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Aplica esto a tu proyecto</p>
            <p className="mt-1 text-sm text-slate-600">
              Abre la calculadora de muestreo del módulo y deja el resultado anclado a
              tu artefacto de investigación.
            </p>
          </div>
          <ArrowRight className="mt-1 h-5 w-5 text-sky-600 transition group-hover:translate-x-1" />
        </Link>
        <Link
          href="/ecosistema/universidad/mercados/casos"
          className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-sky-400 hover:shadow-md"
        >
          <BookOpen className="h-6 w-6 flex-shrink-0 text-slate-600" />
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Ver casos reales</p>
            <p className="mt-1 text-sm text-slate-600">
              Cinco investigaciones bolivianas ya resueltas con su tamaño de muestra
              real y justificación académica.
            </p>
          </div>
          <ArrowRight className="mt-1 h-5 w-5 text-slate-600 transition group-hover:translate-x-1" />
        </Link>
      </section>
    </div>
  );
}
