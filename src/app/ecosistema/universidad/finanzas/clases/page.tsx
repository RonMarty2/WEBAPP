'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/ecosistema/PlatformShell';
import { getPlatform } from '@/lib/ecosistema/platforms';
import { CLASES_FINANZAS } from '@/lib/finanzas/clases-data';
import { listarProgresoClases, type ProgresoClase } from '@/lib/finanzas/artefactos-store';

const ETIQUETAS_DIFICULTAD: Record<string, { label: string; color: string }> = {
  inicial: { label: 'Inicial', color: 'bg-emerald-100 text-emerald-800' },
  intermedia: { label: 'Intermedia', color: 'bg-amber-100 text-amber-800' },
  avanzada: { label: 'Avanzada', color: 'bg-rose-100 text-rose-800' },
};

export default function CatalogoClases() {
  const platform = getPlatform('finanzas')!;
  const [progreso, setProgreso] = useState<ProgresoClase[]>([]);

  useEffect(() => {
    setProgreso(listarProgresoClases());
  }, []);

  const totalCompletadas = progreso.filter(p => p.ejercicioCompletado && p.quizScore >= 2).length;

  return (
    <PlatformShell platform={platform}>
      <header className="mb-8">
        <Link
          href="/ecosistema/universidad/finanzas"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Volver a Finanzas
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Las 6 clases del curso</h1>
        <p className="mt-2 text-slate-600">
          {totalCompletadas} de {CLASES_FINANZAS.length} completadas. Las clases se desbloquean en orden
          para que cada concepto descanse en el anterior.
        </p>
      </header>

      <div className="space-y-4">
        {CLASES_FINANZAS.map(clase => {
          const prog = progreso.find(p => p.claseSlug === clase.slug);
          const completada = prog && prog.ejercicioCompletado && prog.quizScore >= 2;
          const dif = ETIQUETAS_DIFICULTAD[clase.dificultad];
          return (
            <Link
              key={clase.id}
              href={`/ecosistema/universidad/finanzas/clases/${clase.slug}`}
              className="group block rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
            >
              <div className="flex items-start gap-5">
                <div
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-bold ${
                    completada
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                  }`}
                >
                  {completada ? '✓' : clase.numero}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Clase {clase.numero}
                    </span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-500">{clase.duracionMinutos} min</span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${dif.color}`}>
                      {dif.label}
                    </span>
                    {completada && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                        Completada · quiz {prog!.quizScore}/3
                      </span>
                    )}
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-emerald-700">
                    {clase.titulo}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{clase.resumen}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>📖 {clase.secciones.length} secciones</span>
                    <span>🎯 1 ejercicio interactivo</span>
                    <span>❓ {clase.quiz.length} preguntas de quiz</span>
                  </div>
                </div>
                <div className="hidden self-center text-sm font-medium text-emerald-700 group-hover:underline md:block">
                  {completada ? 'Repasar →' : 'Empezar →'}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 text-center">
        <p className="text-sm text-emerald-800">
          Después de terminar las 6 clases, abre el SimuladorPRO con tu propio proyecto.
        </p>
        <Link
          href="/ecosistema/universidad/finanzas/simulador"
          className="mt-3 inline-flex rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Ir al SimuladorPRO →
        </Link>
      </div>
    </PlatformShell>
  );
}
