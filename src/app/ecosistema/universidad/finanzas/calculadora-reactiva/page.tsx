'use client';

/**
 * Demo de la Calculadora reactiva del Punto de Equilibrio.
 *
 * Finanzas no usa PlatformShell — sigue el patrón del page principal con
 * EcosystemNav + breadcrumb propio.
 */

import Link from 'next/link';
import {
  Sparkles,
  BookOpen,
  TrendingUp,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { EcosystemNav } from '@/components/ecosistema/EcosystemNav';
import CalcPuntoEquilibrio from '@/components/calc-reactivas/CalcPuntoEquilibrio';

const SIMULADOR_URL = 'https://simulador-pro-seven.vercel.app';

export default function Page() {
  return (
    <>
      <EcosystemNav />

      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs sm:px-6">
        <div className="flex items-center gap-2">
          <Link
            href="/ecosistema/universidad"
            className="text-slate-500 transition hover:text-slate-900"
          >
            Universidad
          </Link>
          <span className="text-slate-300">/</span>
          <Link
            href="/ecosistema/universidad/finanzas"
            className="text-slate-500 transition hover:text-slate-900"
          >
            Finanzas para Emprendedores
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-slate-900">Calculadora reactiva</span>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="space-y-8">
          <header className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white p-6 md:p-8">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Calculadora reactiva · Sin guardar nada
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
              ¿Desde cuántas ventas tu negocio deja de perder?
            </h1>
            <p className="mt-2 max-w-3xl text-slate-600">
              Mueve los sliders de precio, costo variable y costos fijos. La gráfica
              de ingresos vs costos se redibuja en vivo y el punto de equilibrio
              aparece marcado. Cero IA, pura matemática contable.
            </p>
            <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
              <div className="rounded-xl bg-white/70 p-3">
                <p className="font-semibold text-slate-900">1. Mide tus fijos</p>
                <p className="text-xs text-slate-600">
                  Alquiler, sueldos, servicios — todo lo que pagas cada mes vendas o no.
                </p>
              </div>
              <div className="rounded-xl bg-white/70 p-3">
                <p className="font-semibold text-slate-900">2. Calcula margen</p>
                <p className="text-xs text-slate-600">
                  La diferencia entre precio y costo variable es lo que aporta cada
                  venta a cubrir tus fijos.
                </p>
              </div>
              <div className="rounded-xl bg-white/70 p-3">
                <p className="font-semibold text-slate-900">3. Verifica margen de seguridad</p>
                <p className="text-xs text-slate-600">
                  Cuánto puedes caer en ventas antes de cruzar a pérdidas.
                </p>
              </div>
            </div>
          </header>

          <CalcPuntoEquilibrio />

          <section className="grid gap-4 md:grid-cols-2">
            <a
              href={SIMULADOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-5 transition hover:border-emerald-400 hover:shadow-md"
            >
              <TrendingUp className="h-6 w-6 flex-shrink-0 text-emerald-600" />
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Aplica esto a tu proyecto</p>
                <p className="mt-1 text-sm text-slate-600">
                  Abre el simuladorPRO y arma el flujo de caja completo con VAN, TIR
                  y sensibilidad sobre tu punto de equilibrio.
                </p>
              </div>
              <ExternalLink className="mt-1 h-5 w-5 text-emerald-600 transition group-hover:translate-x-1" />
            </a>
            <Link
              href="/ecosistema/universidad/finanzas"
              className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-400 hover:shadow-md"
            >
              <BookOpen className="h-6 w-6 flex-shrink-0 text-slate-600" />
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Ver casos reales</p>
                <p className="mt-1 text-sm text-slate-600">
                  26 proyectos de ejemplo dentro del simuladorPRO: cafetería, fábrica,
                  podcast, agricultura y más, con sus números reales.
                </p>
              </div>
              <ArrowRight className="mt-1 h-5 w-5 text-slate-600 transition group-hover:translate-x-1" />
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
