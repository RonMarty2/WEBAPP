'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { CLASES_MERCADOS, getClaseMercados } from '@/lib/mercados/clases-data';

type Paso = 'teoria' | 'ejercicio' | 'quiz' | 'fin';

export default function ClasePage() {
  const params = useParams<{ slug: string }>();
  const clase = useMemo(() => getClaseMercados(params.slug), [params.slug]);

  const [paso, setPaso] = useState<Paso>('teoria');
  const [seccionIdx, setSeccionIdx] = useState(0);
  const [ejInput, setEjInput] = useState('');
  const [ejResultado, setEjResultado] = useState<{ correcto: boolean; valorCorrecto: number; explicacion: string } | null>(null);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizRespuestas, setQuizRespuestas] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [guardado, setGuardado] = useState(false);

  if (!clase) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mk-card p-6 text-center">
          <p className="font-semibold">Clase no encontrada</p>
          <Link href="/mercados/academia" className="mk-accent-text mt-2 inline-block text-sm">
            ← Volver a la academia
          </Link>
        </div>
      </div>
    );
  }

  const seccion = clase.secciones[seccionIdx];
  const esUltimaSeccion = seccionIdx === clase.secciones.length - 1;
  const idx = CLASES_MERCADOS.findIndex((c) => c.slug === clase.slug);
  const siguiente = CLASES_MERCADOS[idx + 1];

  // Si la clase no tiene ejercicio, saltamos directo de teoría a quiz.
  const irDespuesDeTeoria = () => setPaso(clase.ejercicio ? 'ejercicio' : 'quiz');

  const verificarEjercicio = () => {
    if (!clase.ejercicio) return;
    const inputs: Record<string, number> = {};
    for (const campo of clase.ejercicio.campos) {
      inputs[campo.id] = parseFloat(ejInput) || 0;
    }
    setEjResultado(clase.ejercicio.resolver(inputs));
  };

  const responderQuiz = (opcion: number) => {
    const nuevas = [...quizRespuestas, opcion];
    setQuizRespuestas(nuevas);
    if (clase.quiz[quizIdx].correcta === opcion) setQuizScore((s) => s + 1);
  };

  const avanzarQuiz = async () => {
    if (quizIdx < clase.quiz.length - 1) {
      setQuizIdx((i) => i + 1);
      return;
    }
    // Fin del quiz → guardar progreso
    try {
      await fetch('/api/mercados/progreso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ claseSlug: clase.slug, quizScore }),
      });
      setGuardado(true);
    } catch {
      /* no bloqueamos */
    }
    setPaso('fin');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/mercados/academia"
        className="mk-muted inline-flex items-center gap-1 text-sm hover:text-sky-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la academia
      </Link>

      <header className="mt-4">
        <span className="mk-accent-soft mk-accent-text rounded-full px-2.5 py-1 text-xs font-medium">
          Clase {clase.numero}
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">{clase.titulo}</h1>
      </header>

      {/* Stepper */}
      <div className="mk-card mt-5 flex items-center gap-1 p-1">
        <PasoTab activo={paso === 'teoria'} label="Teoría" n={1} />
        {clase.ejercicio && <PasoTab activo={paso === 'ejercicio'} label="Práctica" n={2} />}
        <PasoTab activo={paso === 'quiz'} label="Quiz" n={clase.ejercicio ? 3 : 2} />
        <PasoTab activo={paso === 'fin'} label="✓" n={clase.ejercicio ? 4 : 3} />
      </div>

      {/* TEORÍA */}
      {paso === 'teoria' && (
        <article className="mk-card mt-5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="mk-accent-text text-xs font-semibold uppercase tracking-wider">
              Sección {seccionIdx + 1} de {clase.secciones.length}
            </p>
            <div className="flex gap-1">
              {clase.secciones.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-7 rounded-full ${i <= seccionIdx ? 'mk-accent-bg' : 'bg-sky-100'}`}
                />
              ))}
            </div>
          </div>

          <h2 className="text-xl font-bold">{seccion.titulo}</h2>
          <div className="mt-4 space-y-3">
            {seccion.parrafos.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-slate-700">
                {p}
              </p>
            ))}
          </div>

          {seccion.ejemplo && (
            <div className="mk-accent-soft mt-5 rounded-xl p-4">
              <p className="mk-accent-text text-xs font-semibold uppercase tracking-wider">Ejemplo</p>
              <p className="mt-2 text-sm font-medium text-slate-800">{seccion.ejemplo.enunciado}</p>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg bg-white/70 p-3 font-mono text-xs text-slate-700">
                {seccion.ejemplo.desarrollo}
              </pre>
              <p className="mt-2 text-sm font-semibold text-sky-900">→ {seccion.ejemplo.resultado}</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setSeccionIdx((i) => Math.max(0, i - 1))}
              disabled={seccionIdx === 0}
              className="mk-btn-ghost px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Anterior
            </button>
            {esUltimaSeccion ? (
              <button onClick={irDespuesDeTeoria} className="mk-btn-primary px-5 py-2 text-sm font-medium">
                {clase.ejercicio ? 'Ir a la práctica →' : 'Ir al quiz →'}
              </button>
            ) : (
              <button
                onClick={() => setSeccionIdx((i) => i + 1)}
                className="mk-btn-primary px-5 py-2 text-sm font-medium"
              >
                Siguiente →
              </button>
            )}
          </div>
        </article>
      )}

      {/* EJERCICIO */}
      {paso === 'ejercicio' && clase.ejercicio && (
        <article className="mk-card mt-5 p-6">
          <p className="mk-accent-text text-xs font-semibold uppercase tracking-wider">
            Práctica
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-800">{clase.ejercicio.enunciado}</p>

          <div className="mt-4 space-y-3">
            {clase.ejercicio.campos.map((campo) => (
              <div key={campo.id}>
                <label className="text-sm font-medium">
                  {campo.label} <span className="mk-muted">({campo.unidad})</span>
                </label>
                {campo.hint && <p className="mk-muted text-xs">{campo.hint}</p>}
                <input
                  type="number"
                  step="any"
                  value={ejInput}
                  onChange={(e) => setEjInput(e.target.value)}
                  placeholder="0"
                  className="mk-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
            ))}
          </div>

          {!ejResultado ? (
            <button onClick={verificarEjercicio} className="mk-btn-primary mt-4 px-5 py-2 text-sm font-medium">
              Verificar
            </button>
          ) : (
            <div
              className={`mt-4 rounded-xl border p-4 ${
                ejResultado.correcto ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
              }`}
            >
              <p className={`text-sm font-semibold ${ejResultado.correcto ? 'text-emerald-900' : 'text-amber-900'}`}>
                {ejResultado.correcto ? '✓ Correcto' : '✗ Revisa'}
              </p>
              <p className="mt-1 text-sm text-slate-700">{ejResultado.explicacion}</p>
              <div className="mt-3 flex gap-2">
                {!ejResultado.correcto && (
                  <button
                    onClick={() => { setEjResultado(null); setEjInput(''); }}
                    className="mk-btn-ghost px-4 py-1.5 text-xs"
                  >
                    Reintentar
                  </button>
                )}
                <button onClick={() => setPaso('quiz')} className="mk-btn-primary px-5 py-1.5 text-xs font-medium">
                  Continuar al quiz →
                </button>
              </div>
            </div>
          )}
        </article>
      )}

      {/* QUIZ */}
      {paso === 'quiz' && (
        <article className="mk-card mt-5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="mk-accent-text text-xs font-semibold uppercase tracking-wider">
              Pregunta {quizIdx + 1} de {clase.quiz.length}
            </p>
            <div className="flex gap-1">
              {clase.quiz.map((_, i) => (
                <div key={i} className={`h-1.5 w-7 rounded-full ${i <= quizIdx ? 'mk-accent-bg' : 'bg-sky-100'}`} />
              ))}
            </div>
          </div>

          <h2 className="text-lg font-semibold">{clase.quiz[quizIdx].pregunta}</h2>

          <div className="mt-4 space-y-2">
            {clase.quiz[quizIdx].opciones.map((opcion, i) => {
              const respondida = quizRespuestas.length > quizIdx;
              const correcta = clase.quiz[quizIdx].correcta === i;
              const elegida = quizRespuestas[quizIdx] === i;
              let estilo = 'mk-border bg-white hover:bg-sky-50';
              if (respondida) {
                if (correcta) estilo = 'border-emerald-400 bg-emerald-50';
                else if (elegida) estilo = 'border-rose-400 bg-rose-50';
                else estilo = 'mk-border bg-slate-50 opacity-60';
              }
              return (
                <button
                  key={i}
                  onClick={() => !respondida && responderQuiz(i)}
                  disabled={respondida}
                  className={`w-full rounded-lg border p-3 text-left text-sm transition ${estilo}`}
                >
                  {opcion}
                  {respondida && correcta && <span className="ml-2 text-xs font-semibold text-emerald-700">✓</span>}
                </button>
              );
            })}
          </div>

          {quizRespuestas.length > quizIdx && (
            <div className="mk-accent-soft mt-4 rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-800">Por qué</p>
              <p className="mt-1 text-sm text-slate-700">{clase.quiz[quizIdx].explicacion}</p>
              <button onClick={avanzarQuiz} className="mk-btn-primary mt-3 px-5 py-1.5 text-sm font-medium">
                {quizIdx < clase.quiz.length - 1 ? 'Siguiente →' : 'Terminar clase →'}
              </button>
            </div>
          )}
        </article>
      )}

      {/* FIN */}
      {paso === 'fin' && (
        <article className="mk-card mt-5 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-2xl font-bold">Clase completada</h2>
          <p className="mk-muted mt-1 text-sm">
            Acertaste {quizScore} de {clase.quiz.length} en el quiz.
            {guardado ? ' Tu progreso quedó guardado.' : ''}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {siguiente ? (
              <Link href={`/mercados/academia/${siguiente.slug}`} className="mk-btn-primary px-5 py-2.5 text-sm font-medium">
                Siguiente clase →
              </Link>
            ) : (
              <Link href="/mercados/proyecto" className="mk-btn-primary px-5 py-2.5 text-sm font-medium">
                Empezar mi investigación →
              </Link>
            )}
            <Link href="/mercados/academia" className="mk-btn-ghost px-5 py-2.5 text-sm font-medium">
              Volver a la academia
            </Link>
          </div>
        </article>
      )}
    </div>
  );
}

function PasoTab({ activo, label, n }: { activo: boolean; label: string; n: number }) {
  return (
    <div
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium ${
        activo ? 'mk-accent-bg text-white' : 'mk-muted'
      }`}
    >
      <span className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${activo ? 'bg-white/25' : 'bg-sky-100'}`}>
        {n}
      </span>
      {label}
    </div>
  );
}
