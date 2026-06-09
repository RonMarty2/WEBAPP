'use client';

/**
 * Componente <TutorIA /> — Sprint 2a (mejora didáctica).
 *
 * Botón + modal que se puede agregar a cualquier herramienta sin tocar
 * el código existente. Llama a /api/tutor-ia/refinar, muestra 3
 * alternativas con pros/cons, pregunta crítica, lección clave y siguiente
 * paso. Si el alumno elige una, dispara `onInsertar(texto)`.
 *
 * Uso típico en una herramienta:
 *   <TutorIA
 *     modulo="idea"
 *     herramienta="lean-canvas:problema"
 *     contexto={resumenDelProyecto}
 *     contenidoActual={textoActual}
 *     campo="problema principal del cliente"
 *     onInsertar={(t) => setTextoActual(t)}
 *   />
 *
 * Coexiste con el botón "Sugerir IA" existente (no lo reemplaza).
 */

import { useState } from 'react';
import { GraduationCap, Sparkles, X, Loader2, ChevronRight, Lightbulb, Target, ArrowRight, Quote } from 'lucide-react';
import type { ModuloTutor, TutorIAResponse, AlternativaTutor } from '@/types/tutor-ia';

interface TutorIAProps {
  modulo: ModuloTutor;
  /** Identificador de la herramienta + campo. Ej: "lean-canvas:problema" */
  herramienta: string;
  /** Resumen del proyecto del alumno (idea base, contexto). */
  contexto: string;
  /** Lo que el alumno ya escribió. Puede estar vacío. */
  contenidoActual: string;
  /** Descripción humana del campo que se está trabajando. */
  campo?: string;
  /** Llamado cuando el alumno elige una alternativa para insertarla. */
  onInsertar?: (texto: string) => void;
  /** Estilo del botón disparador. */
  variante?: 'compacto' | 'amplio';
  /** Etiqueta del botón. */
  etiqueta?: string;
}

const COLOR_MODULO: Record<ModuloTutor, { acento: string; texto: string; borde: string; bg: string }> = {
  idea:         { acento: 'bg-amber-600',  texto: 'text-amber-700',  borde: 'border-amber-300',  bg: 'bg-amber-50' },
  mercados:     { acento: 'bg-sky-600',    texto: 'text-sky-700',    borde: 'border-sky-300',    bg: 'bg-sky-50' },
  estrategia:   { acento: 'bg-violet-600', texto: 'text-violet-700', borde: 'border-violet-300', bg: 'bg-violet-50' },
  marketing:    { acento: 'bg-rose-600',   texto: 'text-rose-700',   borde: 'border-rose-300',   bg: 'bg-rose-50' },
  organizacion: { acento: 'bg-amber-600',  texto: 'text-amber-700',  borde: 'border-amber-300',  bg: 'bg-amber-50' },
  defensa:      { acento: 'bg-indigo-600', texto: 'text-indigo-700', borde: 'border-indigo-300', bg: 'bg-indigo-50' },
};

export function TutorIA({
  modulo,
  herramienta,
  contexto,
  contenidoActual,
  campo,
  onInsertar,
  variante = 'compacto',
  etiqueta = 'Tutor IA',
}: TutorIAProps) {
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<TutorIAResponse | null>(null);

  const colores = COLOR_MODULO[modulo];

  async function pedirTutoria() {
    setError(null);
    setResultado(null);
    setCargando(true);
    setAbierto(true);
    try {
      const res = await fetch('/api/tutor-ia/refinar', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modulo, herramienta, contexto, contenido_actual: contenidoActual, campo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No se pudo generar la tutoría.');
        return;
      }
      setResultado(data as TutorIAResponse);
    } catch {
      setError('Sin conexión. Intenta otra vez.');
    } finally {
      setCargando(false);
    }
  }

  function cerrar() {
    setAbierto(false);
    // Mantén el resultado por si el alumno reabre el modal sin refrescar.
  }

  function elegir(alt: AlternativaTutor) {
    if (onInsertar) onInsertar(alt.texto);
    cerrar();
  }

  return (
    <>
      <button
        type="button"
        onClick={pedirTutoria}
        disabled={cargando}
        className={
          variante === 'amplio'
            ? `inline-flex items-center gap-2 rounded-xl border-2 ${colores.borde} ${colores.bg} px-4 py-2 text-sm font-semibold ${colores.texto} hover:opacity-90 disabled:opacity-50`
            : `inline-flex items-center gap-1.5 rounded-lg border ${colores.borde} ${colores.bg} px-3 py-1.5 text-xs font-semibold ${colores.texto} hover:opacity-90 disabled:opacity-50`
        }
        title="3 alternativas con pros, contras y una pregunta crítica para que decidas con criterio"
      >
        {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <GraduationCap className="h-4 w-4" />}
        🎓 {etiqueta}
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
          onClick={cerrar}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 ${colores.bg} px-5 py-4`}>
              <div className="flex items-center gap-2">
                <GraduationCap className={`h-5 w-5 ${colores.texto}`} />
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${colores.texto}`}>Tutor IA</p>
                  <h2 className="text-base font-bold text-slate-900">
                    3 caminos posibles {campo && `· ${campo}`}
                  </h2>
                </div>
              </div>
              <button
                onClick={cerrar}
                className="rounded-full p-1.5 text-slate-500 hover:bg-white"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              {cargando && (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <Loader2 className={`h-8 w-8 animate-spin ${colores.texto}`} />
                  <p className="text-sm text-slate-600">El tutor está pensando 3 caminos para tu proyecto…</p>
                  <p className="text-xs text-slate-400">Suele tomar 8-15 segundos.</p>
                </div>
              )}

              {error && !cargando && (
                <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-5 text-center">
                  <p className="text-sm font-semibold text-rose-900">{error}</p>
                  <button
                    onClick={pedirTutoria}
                    className="mt-3 inline-flex items-center gap-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {resultado && !cargando && (
                <div className="space-y-5">
                  {/* Pregunta crítica destacada */}
                  <div className={`rounded-2xl border-2 ${colores.borde} ${colores.bg} p-4`}>
                    <div className="flex items-start gap-3">
                      <Quote className={`h-5 w-5 flex-shrink-0 ${colores.texto}`} />
                      <div>
                        <p className={`text-[10px] font-semibold uppercase tracking-wider ${colores.texto}`}>Pregunta crítica que tu tutor te hace</p>
                        <p className="mt-1 text-base font-semibold leading-snug text-slate-900">
                          {resultado.pregunta_critica}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3 alternativas */}
                  <div className="grid gap-4 lg:grid-cols-3">
                    {resultado.alternativas.map((alt, i) => (
                      <AlternativaCard
                        key={i}
                        alt={alt}
                        indice={i}
                        colores={colores}
                        onElegir={() => elegir(alt)}
                      />
                    ))}
                  </div>

                  {/* Lección clave */}
                  <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 flex-shrink-0 text-emerald-700" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">Lección clave aplicada a tu proyecto</p>
                        <p className="mt-1 text-sm leading-relaxed text-emerald-900">{resultado.leccion_clave}</p>
                      </div>
                    </div>
                  </div>

                  {/* Siguiente paso */}
                  <div className="rounded-2xl border-2 border-sky-300 bg-sky-50 p-4">
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 flex-shrink-0 text-sky-700" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-800">Siguiente paso accionable</p>
                        <p className="mt-1 text-sm leading-relaxed text-sky-900">{resultado.siguiente_paso}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pie con metadatos */}
                  {resultado.tiempo_ms && (
                    <p className="text-center text-[10px] text-slate-400">
                      Generado en {(resultado.tiempo_ms / 1000).toFixed(1)} s · El tutor IA no reemplaza al humano. Usa el material como inspiración, decide tú.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AlternativaCard({
  alt,
  indice,
  colores,
  onElegir,
}: {
  alt: AlternativaTutor;
  indice: number;
  colores: { acento: string; texto: string; borde: string; bg: string };
  onElegir: () => void;
}) {
  const [expandido, setExpandido] = useState(false);
  return (
    <div className={`flex flex-col rounded-2xl border-2 ${colores.borde} bg-white p-4`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded-full ${colores.acento} text-xs font-bold text-white`}>
          {indice + 1}
        </span>
        <span className={`rounded-full ${colores.bg} px-2 py-0.5 text-[10px] font-semibold uppercase ${colores.texto}`}>
          {alt.etiqueta}
        </span>
      </div>

      <p className="mt-3 text-xs italic text-slate-500">{alt.para_quien}</p>

      <div className="mt-3 flex-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Propuesta del tutor</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-800">
          {expandido || alt.texto.length <= 220 ? alt.texto : `${alt.texto.slice(0, 220)}…`}
        </p>
        {alt.texto.length > 220 && (
          <button
            type="button"
            onClick={() => setExpandido((v) => !v)}
            className={`mt-1 text-[11px] font-medium ${colores.texto} hover:underline`}
          >
            {expandido ? 'Ver menos' : 'Ver completo'}
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">✓ Fortalezas</p>
          <ul className="mt-1 space-y-0.5">
            {alt.fortalezas.map((f, i) => <li key={i} className="text-[11px] text-emerald-900">• {f}</li>)}
          </ul>
        </div>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">⚠ Debilidades</p>
          <ul className="mt-1 space-y-0.5">
            {alt.debilidades.map((d, i) => <li key={i} className="text-[11px] text-rose-900">• {d}</li>)}
          </ul>
        </div>
      </div>

      <button
        type="button"
        onClick={onElegir}
        className={`mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg ${colores.acento} px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90`}
      >
        Usar esta opción <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// Re-export del icono Sparkles para que las herramientas puedan usarlo si quieren
// componer el botón Tutor IA junto al botón Sugerir IA existente.
export { Sparkles, ArrowRight };
