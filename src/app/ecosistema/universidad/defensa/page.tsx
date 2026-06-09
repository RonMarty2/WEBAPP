'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, GraduationCap } from 'lucide-react';

export default function DefensaHub() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Defensa de Tesis y Proyectos</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Prepárate para enfrentar al tribunal
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          5 defensas reales con preguntas del tribunal, respuestas modelo,
          puntos débiles a manejar y fortalezas a resaltar. Universidades
          bolivianas reales: UMSA, UMSS, UPB, UAJMS, Univalle.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-1">
        <Link
          href="/ecosistema/universidad/defensa/casos"
          className="group flex items-center gap-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 p-6 transition hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md"
        >
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-slate-900">Casos de Bolivia</h3>
            <p className="mt-1 text-sm text-slate-600">
              5 defensas con 18 preguntas tribunal cada una, respuestas modelo,
              y estrategias para manejar puntos débiles.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-indigo-700 transition group-hover:translate-x-1" />
        </Link>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          <GraduationCap className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-2 font-medium text-slate-700">Simulador de defensa próximamente</p>
          <p className="mt-1 text-xs">Simulacro interactivo con IA evaluando tus respuestas viene en la próxima iteración.</p>
        </div>
      </div>
    </div>
  );
}
