'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/ecosistema/PlatformShell';
import { getPlatform } from '@/lib/ecosistema/platforms';
import { CLASES_FINANZAS } from '@/lib/finanzas/clases-data';
import {
  listarArtefactos,
  listarProgresoClases,
  calcularPorcentajeCurso,
  type ArtefactoFinanciero,
  type ProgresoClase,
} from '@/lib/finanzas/artefactos-store';

export default function FinanzasPlatform() {
  const platform = getPlatform('finanzas')!;
  const [artefactos, setArtefactos] = useState<ArtefactoFinanciero[]>([]);
  const [progreso, setProgreso] = useState<ProgresoClase[]>([]);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setArtefactos(listarArtefactos());
    setProgreso(listarProgresoClases());
    setMontado(true);
  }, []);

  const porcentajeCurso = montado ? calcularPorcentajeCurso(CLASES_FINANZAS.length) : 0;
  const clasesCompletadas = progreso.filter(p => p.ejercicioCompletado && p.quizScore >= 2).length;

  return (
    <PlatformShell platform={platform}>
      <header className="mb-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            <span>📈</span>
            <span>Plataforma 1 de 4</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">{platform.nombre}</h1>
          <p className="mt-3 text-lg text-slate-600">{platform.tagline}</p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-700">
            Un curso completo para entender cuándo un proyecto vale la pena y cuándo no.
            Aprendes con casos reales bolivianos y construyes tu propio análisis financiero
            en el SimuladorPRO integrado — listo para presentar a inversionistas, bancos o tu defensa académica.
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-5 md:w-72">
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">Tu progreso</p>
          <p className="mt-2 text-3xl font-bold text-emerald-900">{porcentajeCurso}%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${porcentajeCurso}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-emerald-900/80">
            {clasesCompletadas} de {CLASES_FINANZAS.length} clases completadas
          </p>
          <p className="mt-1 text-sm text-emerald-900/80">
            {artefactos.length} {artefactos.length === 1 ? 'simulación' : 'simulaciones'} guardadas
          </p>
        </div>
      </header>

      <section className="mb-12 grid gap-6 md:grid-cols-3">
        <Link
          href="/ecosistema/universidad/finanzas/clases"
          className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
        >
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-2xl">📚</div>
          <h3 className="text-lg font-semibold text-slate-900">Empieza el curso</h3>
          <p className="mt-1 text-sm text-slate-600">
            6 clases con teoría, ejemplos numéricos, ejercicio interactivo y quiz.
          </p>
          <p className="mt-3 text-sm font-medium text-emerald-700 group-hover:underline">
            Ir a las clases →
          </p>
        </Link>

        <Link
          href="/ecosistema/universidad/finanzas/simulador"
          className="group rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-white transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-white/20 text-2xl">🛠️</div>
          <h3 className="text-lg font-semibold">SimuladorPRO</h3>
          <p className="mt-1 text-sm text-emerald-50">
            La herramienta: VAN, TIR, B/C, Payback y sensibilidad en segundos.
          </p>
          <p className="mt-3 text-sm font-medium text-white group-hover:underline">
            Abrir simulador →
          </p>
        </Link>

        <Link
          href="/ecosistema/universidad/finanzas/mis-artefactos"
          className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
        >
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-2xl">💾</div>
          <h3 className="text-lg font-semibold text-slate-900">Mis artefactos</h3>
          <p className="mt-1 text-sm text-slate-600">
            Tus simulaciones guardadas, listas para exportar al Generador.
          </p>
          <p className="mt-3 text-sm font-medium text-emerald-700 group-hover:underline">
            Ver mis trabajos →
          </p>
        </Link>
      </section>

      <section className="mb-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Las 6 clases del curso</h2>
            <p className="mt-1 text-sm text-slate-600">
              Cada clase combina teoría, ejemplo numérico y práctica. Al terminar las 6, dominas la evaluación financiera de proyectos.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {CLASES_FINANZAS.map(clase => {
            const completada = progreso.find(
              p => p.claseSlug === clase.slug && p.ejercicioCompletado && p.quizScore >= 2
            );
            return (
              <Link
                key={clase.id}
                href={`/ecosistema/universidad/finanzas/clases/${clase.slug}`}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-md"
              >
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-base font-bold ${
                    completada
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {completada ? '✓' : clase.numero}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">
                    Clase {clase.numero} · {clase.duracionMinutos} min · {clase.dificultad}
                  </p>
                  <p className="mt-1 font-semibold text-slate-900 group-hover:text-emerald-700">
                    {clase.titulo}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{clase.resumen}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-amber-700">
              Conexión con el Generador
            </p>
            <h2 className="mt-2 text-2xl font-bold text-amber-900">
              Lo que armas aquí, se importa a tu tesis o proyecto de grado
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-amber-900/80">
              Cada simulación que guardes queda como un artefacto exportable. Cuando uses el Generador
              en modo conectado, tu Plan Financiero del proyecto académico se llena con TUS números
              reales — no con datos genéricos que la IA inventa.
            </p>
          </div>
          <Link
            href="/ecosistema/generador"
            className="rounded-full bg-amber-600 px-6 py-3 text-sm font-medium text-white hover:bg-amber-700"
          >
            Conocer el Generador →
          </Link>
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-8">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">
              Suscripción independiente
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Solo Finanzas, sin paquetes obligatorios
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Acceso completo al curso, al SimuladorPRO y a tus artefactos. Cancelas cuando quieras.
              Si después quieres las otras plataformas, te las llevas con descuento de bundle.
            </p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-slate-900">Bs. {platform.precioStandalone}</p>
            <p className="text-sm text-slate-500">por mes</p>
            <Link
              href="/ecosistema/universidad/finanzas/comprar"
              className="mt-4 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Suscribirme
            </Link>
          </div>
        </div>
      </section>
    </PlatformShell>
  );
}
