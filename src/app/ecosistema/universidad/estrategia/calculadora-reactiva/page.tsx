'use client';

/**
 * Demo de la Calculadora reactiva PESTEL Score.
 *
 * Estrategia no tiene layout propio: envolvemos en PlatformShell.
 */

import Link from 'next/link';
import { Sparkles, BookOpen, Compass, ArrowRight } from 'lucide-react';
import { PlatformShell } from '@/components/ecosistema/PlatformShell';
import { getPlatform } from '@/lib/ecosistema/platforms';
import CalcPESTELScore from '@/components/calc-reactivas/CalcPESTELScore';

export default function Page() {
  const platform = getPlatform('estrategia');
  if (!platform) return null;

  return (
    <PlatformShell platform={platform}>
      <div className="space-y-8">
        <header className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-white p-6 md:p-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">
              Calculadora reactiva · Cálculos vivos
            </p>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            ¿El entorno juega a tu favor o en tu contra?
          </h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Escribe un factor por cada dimensión PESTEL y ajusta su impacto con un
            slider de −5 a +5. El score total, las oportunidades, amenazas y la
            recomendación estratégica se recalculan en cada cambio.
          </p>
          <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
            <div className="rounded-xl bg-white/70 p-3">
              <p className="font-semibold text-slate-900">1. Investiga cada dimensión</p>
              <p className="text-xs text-slate-600">
                Político, económico, social, tecnológico, ecológico y legal — con
                fuentes reales.
              </p>
            </div>
            <div className="rounded-xl bg-white/70 p-3">
              <p className="font-semibold text-slate-900">2. Califica el impacto</p>
              <p className="text-xs text-slate-600">
                Negativo si frena tu negocio, positivo si lo impulsa. Honestidad mata
                a optimismo.
              </p>
            </div>
            <div className="rounded-xl bg-white/70 p-3">
              <p className="font-semibold text-slate-900">3. Lee la recomendación</p>
              <p className="text-xs text-slate-600">
                Según el score total, ¿debes acelerar, esperar o blindar?
              </p>
            </div>
          </div>
        </header>

        <CalcPESTELScore />

        <section className="grid gap-4 md:grid-cols-2">
          <Link
            href="/ecosistema/universidad/estrategia"
            className="group flex items-start gap-3 rounded-2xl border border-violet-200 bg-white p-5 transition hover:border-violet-400 hover:shadow-md"
          >
            <Compass className="h-6 w-6 flex-shrink-0 text-violet-600" />
            <div className="flex-1">
              <p className="font-semibold text-slate-900">Aplica esto a tu proyecto</p>
              <p className="mt-1 text-sm text-slate-600">
                Abre el módulo de estrategia y arma PESTEL, Porter, MEFE/MEFI y FODA
                cruzada con scoring guiado.
              </p>
            </div>
            <ArrowRight className="mt-1 h-5 w-5 text-violet-600 transition group-hover:translate-x-1" />
          </Link>
          <Link
            href="/ecosistema/universidad/estrategia/casos"
            className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-violet-400 hover:shadow-md"
          >
            <BookOpen className="h-6 w-6 flex-shrink-0 text-slate-600" />
            <div className="flex-1">
              <p className="font-semibold text-slate-900">Ver casos reales</p>
              <p className="mt-1 text-sm text-slate-600">
                Casos bolivianos con análisis PESTEL completo y la decisión
                estratégica que tomaron.
              </p>
            </div>
            <ArrowRight className="mt-1 h-5 w-5 text-slate-600 transition group-hover:translate-x-1" />
          </Link>
        </section>
      </div>
    </PlatformShell>
  );
}
