'use client';

import Link from 'next/link';
import { EcosystemNav } from '@/components/ecosistema/EcosystemNav';

const SIMULADOR_URL = 'https://simulador-pro-seven.vercel.app';

const FEATURES = [
  { emoji: '🏗️', label: 'Constructor de proyectos en 9 pasos' },
  { emoji: '🎲', label: 'Simulación turno-a-turno con eventos económicos bolivianos reales' },
  { emoji: '📊', label: 'VAN, TIR, B/C, Payback, WACC, sensibilidad' },
  { emoji: '🏆', label: 'Ranking, podio y casos compartidos del curso' },
  { emoji: '🎓', label: '26 proyectos de ejemplo (cafetería, fábrica, podcast, agricultura…)' },
  { emoji: '📥', label: 'Exportación a Excel + Entregas evaluadas por el docente' },
];

export default function FinanzasPlatform() {
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
          <span className="font-medium text-slate-900">Finanzas para Emprendedores</span>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <header>
          <div className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Plataforma activa
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Finanzas para Emprendedores
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Curso + herramienta para construir proyectos de inversión y ponerlos a prueba con eventos
            económicos reales de Bolivia. El estudiante aprende haciendo, no copiando.
          </p>
        </header>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-slate-900 text-xl text-white">
              📈
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold tracking-tight text-slate-900">
                Simulador de Proyectos de Inversión
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                La herramienta completa de esta plataforma. Constructor + Simulación + Evaluación.
              </p>
            </div>
          </div>

          <ul className="mt-6 space-y-2.5">
            {FEATURES.map(f => (
              <li key={f.label} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5 text-base leading-none">{f.emoji}</span>
                <span>{f.label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 border-t border-slate-100 pt-5">
            <a
              href={SIMULADOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 sm:w-auto"
            >
              Abrir simuladorPRO
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </a>
            <p className="mt-2 text-[11px] text-slate-500">
              Se abre en pestaña nueva. Usas tu cuenta del simuladorPRO (Google o email).
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 via-violet-50 to-fuchsia-50 p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-base text-white shadow-sm">
              🔗
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700">
                Próximamente — Modo conectado
              </p>
              <p className="mt-1 text-sm font-semibold text-indigo-900">
                Tus proyectos del simuladorPRO se importan al Generador
              </p>
              <p className="mt-1 text-xs leading-relaxed text-indigo-900/80">
                Cuando armes tu tesis o proyecto de grado, el Plan Financiero se llenará con tus
                números reales del simulador — no con datos genéricos que la IA inventa.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 flex items-center justify-between rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-xs">
          <p className="text-slate-600">
            ¿Aún no tienes cuenta en el simuladorPRO?
          </p>
          <a
            href={`${SIMULADOR_URL}/registro`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-900 underline hover:text-slate-700"
          >
            Registrarte ↗
          </a>
        </div>
      </main>
    </>
  );
}
