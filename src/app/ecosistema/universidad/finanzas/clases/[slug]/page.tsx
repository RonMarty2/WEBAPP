'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { PlatformShell } from '@/components/ecosistema/PlatformShell';
import { getPlatform } from '@/lib/ecosistema/platforms';
import { CLASES_FINANZAS, getClasePorSlug } from '@/lib/finanzas/clases-data';
import {
  obtenerProgresoClase,
  registrarProgresoClase,
} from '@/lib/finanzas/artefactos-store';

type Paso = 'teoria' | 'ejercicio' | 'quiz' | 'completada';

interface ResultadoEjercicio {
  correcto: boolean;
  valorEstudiante: number;
  valorCorrecto: number;
  explicacion: string;
  tolerancia: number;
}

export default function ClaseIndividual() {
  const params = useParams<{ slug: string }>();
  const platform = getPlatform('finanzas')!;

  const clase = useMemo(() => getClasePorSlug(params.slug), [params.slug]);

  const [paso, setPaso] = useState<Paso>('teoria');
  const [seccionActiva, setSeccionActiva] = useState(0);
  const [ejercicioInputs, setEjercicioInputs] = useState<Record<string, string>>({});
  const [ejercicioResultado, setEjercicioResultado] = useState<ResultadoEjercicio | null>(null);
  const [quizRespuestas, setQuizRespuestas] = useState<number[]>([]);
  const [quizPreguntaActual, setQuizPreguntaActual] = useState(0);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    if (!clase) return;
    const prog = obtenerProgresoClase(clase.slug);
    if (prog?.ejercicioCompletado && prog.quizScore >= 2) {
      setPaso('completada');
    }
  }, [clase]);

  if (!clase) {
    return (
      <PlatformShell platform={platform}>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <p className="font-semibold text-rose-900">Clase no encontrada</p>
          <p className="mt-1 text-sm text-rose-800">
            La clase &ldquo;{params.slug}&rdquo; no existe en el catálogo.
          </p>
          <Link
            href="/ecosistema/universidad/finanzas/clases"
            className="mt-3 inline-flex text-sm font-medium text-rose-900 hover:underline"
          >
            ← Volver al catálogo
          </Link>
        </div>
      </PlatformShell>
    );
  }

  const seccion = clase.secciones[seccionActiva];
  const esUltimaSeccion = seccionActiva === clase.secciones.length - 1;
  const indiceClase = CLASES_FINANZAS.findIndex(c => c.slug === clase.slug);
  const siguienteClase = CLASES_FINANZAS[indiceClase + 1];

  const verificarEjercicio = () => {
    const inputsNum: Record<string, number> = {};
    for (const campo of clase.ejercicio.campos) {
      inputsNum[campo.id] = parseFloat(ejercicioInputs[campo.id] ?? '0') || 0;
    }
    const resultado = clase.ejercicio.resolver(inputsNum);
    setEjercicioResultado(resultado);
  };

  const responderQuiz = (idxOpcion: number) => {
    const nuevasRespuestas = [...quizRespuestas, idxOpcion];
    setQuizRespuestas(nuevasRespuestas);
    if (clase.quiz[quizPreguntaActual].correcta === idxOpcion) {
      setQuizScore(prev => prev + 1);
    }
  };

  const avanzarQuiz = () => {
    if (quizPreguntaActual < clase.quiz.length - 1) {
      setQuizPreguntaActual(prev => prev + 1);
    } else {
      const ejercicioOk = ejercicioResultado?.correcto ?? false;
      registrarProgresoClase({
        claseSlug: clase.slug,
        ejercicioCompletado: ejercicioOk,
        quizScore,
        fechaCompletada: new Date().toISOString(),
      });
      setPaso('completada');
    }
  };

  return (
    <PlatformShell platform={platform}>
      <header className="mb-6">
        <Link
          href="/ecosistema/universidad/finanzas/clases"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Volver al catálogo
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Clase {clase.numero}
          </span>
          <span className="text-xs text-slate-500">{clase.duracionMinutos} min</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">{clase.titulo}</h1>
        <p className="mt-2 text-slate-600">{clase.resumen}</p>
      </header>

      <div className="mb-8 flex items-center gap-2 rounded-full bg-slate-100 p-1">
        <PasoTab activo={paso === 'teoria'} numero={1} label="Teoría" />
        <PasoTab activo={paso === 'ejercicio'} numero={2} label="Ejercicio" />
        <PasoTab activo={paso === 'quiz'} numero={3} label="Quiz" />
        <PasoTab activo={paso === 'completada'} numero={4} label="Completada" final />
      </div>

      {paso === 'teoria' && (
        <article className="rounded-3xl border border-slate-200 bg-white p-8">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">
              Sección {seccionActiva + 1} de {clase.secciones.length}
            </p>
            <div className="flex gap-1">
              {clase.secciones.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-8 rounded-full ${
                    i <= seccionActiva ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">{seccion.titulo}</h2>
          <div className="mt-5 space-y-4">
            {seccion.parrafos.map((p, i) => (
              <p key={i} className="leading-relaxed text-slate-700">
                {p}
              </p>
            ))}
          </div>

          {seccion.ejemplo && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Ejemplo numérico
              </p>
              <p className="mt-2 text-sm text-slate-700">{seccion.ejemplo.enunciado}</p>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-white p-3 font-mono text-xs text-slate-700">
                {seccion.ejemplo.calculo}
              </pre>
              <p className="mt-3 font-semibold text-emerald-900">→ {seccion.ejemplo.resultado}</p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setSeccionActiva(prev => Math.max(0, prev - 1))}
              disabled={seccionActiva === 0}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Anterior
            </button>
            {esUltimaSeccion ? (
              <button
                onClick={() => setPaso('ejercicio')}
                className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Ir al ejercicio →
              </button>
            ) : (
              <button
                onClick={() => setSeccionActiva(prev => prev + 1)}
                className="rounded-full bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Siguiente sección →
              </button>
            )}
          </div>
        </article>
      )}

      {paso === 'ejercicio' && (
        <article className="rounded-3xl border border-slate-200 bg-white p-8">
          <div className="mb-6 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
              🎯
            </span>
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">
              Ejercicio interactivo
            </p>
          </div>

          <p className="text-lg leading-relaxed text-slate-800">{clase.ejercicio.enunciado}</p>

          <div className="mt-6 space-y-4">
            {clase.ejercicio.campos.map(campo => (
              <div key={campo.id}>
                <label className="block text-sm font-medium text-slate-700">
                  {campo.label} <span className="text-slate-400">({campo.unidad})</span>
                </label>
                {campo.hint && <p className="mt-1 text-xs text-slate-500">{campo.hint}</p>}
                <input
                  type="number"
                  step="any"
                  value={ejercicioInputs[campo.id] ?? ''}
                  onChange={e =>
                    setEjercicioInputs(prev => ({ ...prev, [campo.id]: e.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          {!ejercicioResultado && (
            <button
              onClick={verificarEjercicio}
              className="mt-6 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Verificar respuesta
            </button>
          )}

          {ejercicioResultado && (
            <div
              className={`mt-6 rounded-2xl border p-5 ${
                ejercicioResultado.correcto
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-amber-200 bg-amber-50'
              }`}
            >
              <p
                className={`font-semibold ${
                  ejercicioResultado.correcto ? 'text-emerald-900' : 'text-amber-900'
                }`}
              >
                {ejercicioResultado.correcto ? '✓ Correcto' : '✗ Casi'}
              </p>
              <p className="mt-2 text-sm text-slate-700">{ejercicioResultado.explicacion}</p>
              {!ejercicioResultado.correcto && (
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => {
                      setEjercicioResultado(null);
                      setEjercicioInputs({});
                    }}
                    className="rounded-full border border-amber-300 bg-white px-4 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              )}
              <button
                onClick={() => setPaso('quiz')}
                className="mt-4 rounded-full bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Continuar al quiz →
              </button>
            </div>
          )}
        </article>
      )}

      {paso === 'quiz' && (
        <article className="rounded-3xl border border-slate-200 bg-white p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-sm">❓</span>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">
                Pregunta {quizPreguntaActual + 1} de {clase.quiz.length}
              </p>
            </div>
            <div className="flex gap-1">
              {clase.quiz.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-8 rounded-full ${
                    i <= quizPreguntaActual ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <h2 className="text-xl font-semibold text-slate-900">
            {clase.quiz[quizPreguntaActual].pregunta}
          </h2>

          <div className="mt-5 space-y-3">
            {clase.quiz[quizPreguntaActual].opciones.map((opcion, idx) => {
              const respondida = quizRespuestas.length > quizPreguntaActual;
              const correcta = clase.quiz[quizPreguntaActual].correcta === idx;
              const elegida = quizRespuestas[quizPreguntaActual] === idx;
              let estilo = 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50';
              if (respondida) {
                if (correcta) estilo = 'border-emerald-400 bg-emerald-50';
                else if (elegida) estilo = 'border-rose-400 bg-rose-50';
                else estilo = 'border-slate-200 bg-slate-50 opacity-60';
              }
              return (
                <button
                  key={idx}
                  onClick={() => !respondida && responderQuiz(idx)}
                  disabled={respondida}
                  className={`w-full rounded-xl border p-4 text-left transition ${estilo} ${
                    respondida ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  <span className="text-sm text-slate-800">{opcion}</span>
                  {respondida && correcta && (
                    <span className="ml-2 text-xs font-semibold text-emerald-700">✓ correcta</span>
                  )}
                  {respondida && elegida && !correcta && (
                    <span className="ml-2 text-xs font-semibold text-rose-700">tu elección</span>
                  )}
                </button>
              );
            })}
          </div>

          {quizRespuestas.length > quizPreguntaActual && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Por qué
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {clase.quiz[quizPreguntaActual].explicacion}
              </p>
              <button
                onClick={avanzarQuiz}
                className="mt-4 rounded-full bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                {quizPreguntaActual < clase.quiz.length - 1 ? 'Siguiente pregunta →' : 'Terminar clase →'}
              </button>
            </div>
          )}
        </article>
      )}

      {paso === 'completada' && (
        <article className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-10 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-600 text-3xl text-white">
            ✓
          </div>
          <h2 className="mt-6 text-3xl font-bold text-emerald-900">Clase completada</h2>
          <p className="mt-2 text-emerald-900/80">
            {quizScore > 0
              ? `Acertaste ${quizScore} de ${clase.quiz.length} preguntas del quiz.`
              : 'Repasaste el material. Cuando quieras, vuelve para hacer el quiz.'}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {siguienteClase ? (
              <Link
                href={`/ecosistema/universidad/finanzas/clases/${siguienteClase.slug}`}
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Siguiente clase: {siguienteClase.titulo.split(':')[0]} →
              </Link>
            ) : (
              <Link
                href="/ecosistema/universidad/finanzas/simulador"
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Ir al SimuladorPRO →
              </Link>
            )}
            <Link
              href="/ecosistema/universidad/finanzas/clases"
              className="rounded-full border border-emerald-300 bg-white px-6 py-3 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
            >
              Volver al catálogo
            </Link>
          </div>
        </article>
      )}
    </PlatformShell>
  );

  function PasoTab({
    activo,
    numero,
    label,
    final,
  }: {
    activo: boolean;
    numero: number;
    label: string;
    final?: boolean;
  }) {
    return (
      <div
        className={`flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition ${
          activo
            ? final
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-white'
            : 'text-slate-500'
        }`}
      >
        <span
          className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${
            activo ? 'bg-white/20' : 'bg-slate-200 text-slate-600'
          }`}
        >
          {numero}
        </span>
        <span>{label}</span>
      </div>
    );
  }
}
