'use client';

/**
 * Demo de la Calculadora reactiva de ROAS / Embudo.
 *
 * Marketing no tiene layout propio, así que envolvemos en PlatformShell.
 */

import Link from 'next/link';
import { Sparkles, BookOpen, Megaphone, ArrowRight } from 'lucide-react';
import { PlatformShell } from '@/components/ecosistema/PlatformShell';
import { getPlatform } from '@/lib/ecosistema/platforms';
import CalcROASEmbudo from '@/components/calc-reactivas/CalcROASEmbudo';

export default function Page() {
  const platform = getPlatform('marketing');
  if (!platform) return null;

  return (
    <PlatformShell platform={platform}>
      <div className="space-y-8">
        <header className="rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-white p-6 md:p-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-rose-600" />
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Calculadora reactiva · Cálculos vivos
            </p>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            ¿Tu campaña deja utilidad o quema dinero?
          </h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Simula el embudo completo: clicks, leads, ventas, ingresos. El ROAS y el
            diagnóstico se actualizan en cada movimiento de slider — sin esperar a la
            IA, sin guardar nada todavía.
          </p>
          <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
            <div className="rounded-xl bg-white/70 p-3">
              <p className="font-semibold text-slate-900">1. Ajusta presupuesto</p>
              <p className="text-xs text-slate-600">
                Define cuánto invertirás y a qué CPC realista podrás llegar.
              </p>
            </div>
            <div className="rounded-xl bg-white/70 p-3">
              <p className="font-semibold text-slate-900">2. Estima conversiones</p>
              <p className="text-xs text-slate-600">
                Tasa de click a lead y de lead a venta — usa tus benchmarks o los del
                rubro.
              </p>
            </div>
            <div className="rounded-xl bg-white/70 p-3">
              <p className="font-semibold text-slate-900">3. Lee el diagnóstico</p>
              <p className="text-xs text-slate-600">
                Si el ROAS no llega a 1.5x, ajusta antes de lanzar.
              </p>
            </div>
          </div>
        </header>

        <CalcROASEmbudo />

        <section className="grid gap-4 md:grid-cols-2">
          <Link
            href="/ecosistema/universidad/marketing"
            className="group flex items-start gap-3 rounded-2xl border border-rose-200 bg-white p-5 transition hover:border-rose-400 hover:shadow-md"
          >
            <Megaphone className="h-6 w-6 flex-shrink-0 text-rose-600" />
            <div className="flex-1">
              <p className="font-semibold text-slate-900">Aplica esto a tu proyecto</p>
              <p className="mt-1 text-sm text-slate-600">
                Construye el plan de medios real: canales, presupuesto y calendario
                editorial conectados a tu artefacto.
              </p>
            </div>
            <ArrowRight className="mt-1 h-5 w-5 text-rose-600 transition group-hover:translate-x-1" />
          </Link>
          <Link
            href="/ecosistema/universidad/marketing/casos"
            className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-rose-400 hover:shadow-md"
          >
            <BookOpen className="h-6 w-6 flex-shrink-0 text-slate-600" />
            <div className="flex-1">
              <p className="font-semibold text-slate-900">Ver casos reales</p>
              <p className="mt-1 text-sm text-slate-600">
                Campañas bolivianas con sus métricas reales: CPC, CPL, ROAS y aprendizajes.
              </p>
            </div>
            <ArrowRight className="mt-1 h-5 w-5 text-slate-600 transition group-hover:translate-x-1" />
          </Link>
        </section>
      </div>
    </PlatformShell>
  );
}
