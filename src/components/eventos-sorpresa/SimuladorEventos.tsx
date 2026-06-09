'use client';

/**
 * Sprint 4 — Componente principal del Simulador de Eventos Sorpresa.
 *
 * Persistencia en localStorage con clave `simulacion-{modulo}-v1`.
 * Sin Supabase, sin migraciones, todo en el navegador.
 *
 * Flujo:
 *  1. Si no hay simulación activa → input para "Título de tu proyecto" + botón Iniciar.
 *  2. Al iniciar se carga un evento aleatorio del banco del módulo.
 *  3. El alumno elige una opción → POST /api/eventos-sorpresa/evaluar.
 *  4. La evaluación se muestra (feedback, consecuencias, lección).
 *  5. Botón "Siguiente turno" carga otro evento sin repetir el historial.
 *  6. Botones secundarios: ver historial, reiniciar (con confirmación).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  EstadoSimulacion,
  EventoSorpresa,
  ModuloEvento,
  OpcionDecision,
  RespuestaEvaluacion,
  TurnoHistorial,
} from '@/types/evento-sorpresa';
import { obtenerEventoAleatorio } from '@/lib/eventos-sorpresa/banco';

interface Props {
  modulo: ModuloEvento;
  /**
   * Cuando se monta desde un proyecto del alumno (ej.
   * /projects/[id]/simulador-eventos), pasamos el título real del proyecto.
   * Si está definido, la simulación arranca automáticamente sin pedir input.
   */
  proyectoTituloExterno?: string;
  /**
   * Contexto adicional del proyecto del alumno (idea base, sector, segmento)
   * que se envía a la IA para que los eventos sean específicos a SU caso
   * en lugar de genéricos.
   */
  proyectoContexto?: string;
  /**
   * ID del proyecto, para que la persistencia en localStorage no se
   * confunda entre proyectos distintos del mismo módulo. Si está, la key
   * pasa a ser `simulacion-{modulo}-{proyectoId}-v1`.
   */
  proyectoId?: string;
}

type FaseUI =
  | 'inicio'              // formulario para iniciar
  | 'evento'              // mostrando evento + opciones
  | 'evaluando'           // esperando respuesta de IA
  | 'resultado'           // mostrando evaluación
  | 'historial';          // viendo timeline

interface EstadoCompleto {
  simulacion: EstadoSimulacion;
  eventoActual: EventoSorpresa;
}

// ── Helpers de localStorage ─────────────────────────────────────────────

function storageKey(modulo: ModuloEvento, proyectoId?: string): string {
  return proyectoId
    ? `simulacion-${modulo}-${proyectoId}-v1`
    : `simulacion-${modulo}-v1`;
}

function cargarEstado(modulo: ModuloEvento, proyectoId?: string): EstadoCompleto | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(storageKey(modulo, proyectoId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EstadoCompleto;
    if (!parsed?.simulacion || !parsed?.eventoActual) return null;
    return parsed;
  } catch {
    return null;
  }
}

function guardarEstado(modulo: ModuloEvento, estado: EstadoCompleto, proyectoId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(modulo, proyectoId), JSON.stringify(estado));
  } catch {
    // ignorar: cuota llena o storage no disponible
  }
}

function borrarEstado(modulo: ModuloEvento, proyectoId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(storageKey(modulo, proyectoId));
  } catch {
    // ignorar
  }
}

// ── Helpers de presentación ─────────────────────────────────────────────

const SEVERIDAD_META = {
  leve:    { emoji: '🌤️', label: 'Leve', color: 'emerald' },
  media:   { emoji: '⚠️',  label: 'Media', color: 'amber' },
  critica: { emoji: '🔥',  label: 'Crítica', color: 'rose' },
} as const;

function clasesSeveridadBadge(severidad: keyof typeof SEVERIDAD_META): string {
  const map = {
    leve:    'bg-emerald-100 text-emerald-800 border-emerald-300',
    media:   'bg-amber-100 text-amber-800 border-amber-300',
    critica: 'bg-rose-100 text-rose-800 border-rose-300',
  } as const;
  return map[severidad];
}

function clasesSeveridadBorde(severidad: keyof typeof SEVERIDAD_META): string {
  const map = {
    leve:    'border-emerald-300',
    media:   'border-amber-300',
    critica: 'border-rose-300',
  } as const;
  return map[severidad];
}

function calcularRacha(historial: TurnoHistorial[]): number {
  let racha = 0;
  for (let i = historial.length - 1; i >= 0; i--) {
    if (historial[i].evaluacion.acertada) racha++;
    else break;
  }
  return racha;
}

const MODULO_NOMBRE: Record<ModuloEvento, string> = {
  idea: 'Idea de Negocio',
  marketing: 'Marketing Digital',
  estrategia: 'Estrategia Empresarial',
};

// ── Componente ──────────────────────────────────────────────────────────

export default function SimuladorEventos({ modulo, proyectoTituloExterno, proyectoContexto, proyectoId }: Props) {
  const [fase, setFase] = useState<FaseUI>('inicio');
  const [tituloProyecto, setTituloProyecto] = useState(proyectoTituloExterno ?? '');
  const [estado, setEstado] = useState<EstadoCompleto | null>(null);
  const [opcionElegida, setOpcionElegida] = useState<OpcionDecision | null>(null);
  const [evaluacion, setEvaluacion] = useState<RespuestaEvaluacion | null>(null);
  const [errorIA, setErrorIA] = useState<string | null>(null);
  const [confirmarReset, setConfirmarReset] = useState(false);
  const [hidratado, setHidratado] = useState(false);

  // Cargar estado del localStorage al montar
  useEffect(() => {
    const guardado = cargarEstado(modulo, proyectoId);
    if (guardado) {
      setEstado(guardado);
      setTituloProyecto(guardado.simulacion.proyecto_titulo);
      setFase('evento');
    } else if (proyectoTituloExterno) {
      // Si viene un título externo (desde un proyecto real) y no hay estado
      // previo, lo usamos directamente como inicio implícito.
      setTituloProyecto(proyectoTituloExterno);
    }
    setHidratado(true);
  }, [modulo, proyectoId, proyectoTituloExterno]);

  const racha = useMemo(
    () => (estado ? calcularRacha(estado.simulacion.historial) : 0),
    [estado]
  );

  const iniciarSimulacion = useCallback(() => {
    const titulo = tituloProyecto.trim();
    if (!titulo) return;
    const primerEvento = obtenerEventoAleatorio(modulo, 1, []);
    const simulacion: EstadoSimulacion = {
      proyecto_titulo: titulo,
      modulo,
      turno: 1,
      puntaje_total: 0,
      historial: [],
    };
    const nuevoEstado: EstadoCompleto = {
      simulacion,
      eventoActual: primerEvento,
    };
    setEstado(nuevoEstado);
    guardarEstado(modulo, nuevoEstado, proyectoId);
    setOpcionElegida(null);
    setEvaluacion(null);
    setErrorIA(null);
    setFase('evento');
  }, [modulo, tituloProyecto]);

  const elegirOpcion = useCallback(
    async (opcion: OpcionDecision) => {
      if (!estado) return;
      setOpcionElegida(opcion);
      setErrorIA(null);
      setFase('evaluando');
      try {
        const res = await fetch('/api/eventos-sorpresa/evaluar', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            proyecto: estado.simulacion.proyecto_titulo,
            proyectoContexto: proyectoContexto ?? '',
            evento: estado.eventoActual,
            opcion,
            turnoActual: estado.simulacion.turno,
            historial: estado.simulacion.historial,
          }),
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status}: ${txt.slice(0, 200)}`);
        }
        const data = (await res.json()) as RespuestaEvaluacion;
        setEvaluacion(data);

        // Actualizamos historial y puntaje, pero NO avanzamos turno aún
        // (el turno avanza cuando el alumno pulsa "Siguiente turno").
        const turnoNuevo: TurnoHistorial = {
          evento: estado.eventoActual,
          opcion_elegida: opcion,
          evaluacion: data,
          turno: estado.simulacion.turno,
        };
        const simulacionActualizada: EstadoSimulacion = {
          ...estado.simulacion,
          puntaje_total: estado.simulacion.puntaje_total + data.puntaje,
          historial: [...estado.simulacion.historial, turnoNuevo],
        };
        const estadoActualizado: EstadoCompleto = {
          ...estado,
          simulacion: simulacionActualizada,
        };
        setEstado(estadoActualizado);
        guardarEstado(modulo, estadoActualizado, proyectoId);
        setFase('resultado');
      } catch (e) {
        setErrorIA((e as Error).message);
        setFase('evento');
      }
    },
    [estado, modulo]
  );

  const siguienteTurno = useCallback(() => {
    if (!estado) return;
    const proximoTurno = estado.simulacion.turno + 1;
    const proximoEvento = obtenerEventoAleatorio(
      modulo,
      proximoTurno,
      estado.simulacion.historial
    );
    const estadoActualizado: EstadoCompleto = {
      simulacion: { ...estado.simulacion, turno: proximoTurno },
      eventoActual: proximoEvento,
    };
    setEstado(estadoActualizado);
    guardarEstado(modulo, estadoActualizado, proyectoId);
    setOpcionElegida(null);
    setEvaluacion(null);
    setErrorIA(null);
    setFase('evento');
  }, [estado, modulo]);

  const resetSimulacion = useCallback(() => {
    borrarEstado(modulo, proyectoId);
    setEstado(null);
    setOpcionElegida(null);
    setEvaluacion(null);
    setErrorIA(null);
    setTituloProyecto('');
    setConfirmarReset(false);
    setFase('inicio');
  }, [modulo]);

  // Evitar parpadeo SSR/CSR: esperamos a hidratar antes de renderizar la UI
  if (!hidratado) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Cargando simulación…
      </div>
    );
  }

  // ── Pantalla inicio (sin simulación activa) ──────────────────────────
  if (fase === 'inicio' || !estado) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
        <div className="mb-3 text-5xl">🎮</div>
        <h2 className="text-2xl font-bold text-slate-900">Empieza tu simulación</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
          Te lanzaremos eventos sorpresa de {MODULO_NOMBRE[modulo]}. Eliges una respuesta y la IA te evalúa con consecuencias a corto y largo plazo. Aprende decidiendo.
        </p>
        <div className="mx-auto mt-6 max-w-md">
          <label className="block text-left text-sm font-medium text-slate-700">
            Título de tu proyecto
          </label>
          <input
            type="text"
            value={tituloProyecto}
            onChange={(e) => setTituloProyecto(e.target.value)}
            placeholder="Ej: Empanadas veganas en Cochabamba"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            autoFocus
          />
          <button
            type="button"
            onClick={iniciarSimulacion}
            disabled={!tituloProyecto.trim()}
            className="mt-4 w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Iniciar simulación
          </button>
        </div>
      </div>
    );
  }

  // ── Pantalla historial ───────────────────────────────────────────────
  if (fase === 'historial') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Tu historial</h2>
          <button
            type="button"
            onClick={() => setFase(evaluacion ? 'resultado' : 'evento')}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ← Volver
          </button>
        </div>
        {estado.simulacion.historial.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            Aún no tienes turnos jugados.
          </p>
        ) : (
          <ol className="space-y-3">
            {estado.simulacion.historial.map((h) => {
              const meta = SEVERIDAD_META[h.evento.severidad];
              return (
                <li
                  key={`${h.turno}-${h.evento.id}`}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                      Turno {h.turno}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium ${clasesSeveridadBadge(h.evento.severidad)}`}
                    >
                      {meta.emoji} {meta.label}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-semibold ${
                        h.evaluacion.acertada
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {h.evaluacion.puntaje}/10
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-slate-900">
                    {h.evento.titulo}
                  </h3>
                  <p className="mt-1 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Decisión:</span>{' '}
                    {h.opcion_elegida.texto}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 italic">
                    {h.evaluacion.feedback}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    );
  }

  const evento = estado.eventoActual;
  const meta = SEVERIDAD_META[evento.severidad];

  return (
    <div className="space-y-4">
      {/* Barra superior con estadísticas */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        <Stat label="Proyecto" value={estado.simulacion.proyecto_titulo} truncate />
        <Stat label="Turno" value={`#${estado.simulacion.turno}`} />
        <Stat label="Puntaje" value={`${estado.simulacion.puntaje_total} pts`} />
        <Stat label="Racha" value={`${racha} 🔥`} />
      </div>

      {/* Acciones secundarias */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFase('historial')}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Ver mi historial ({estado.simulacion.historial.length})
        </button>
        <button
          type="button"
          onClick={() => setConfirmarReset(true)}
          className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
        >
          Empezar de nuevo
        </button>
      </div>

      {confirmarReset && (
        <div className="rounded-xl border-2 border-rose-300 bg-rose-50 p-4">
          <p className="text-sm font-medium text-rose-900">
            ¿Reiniciar la simulación? Perderás el historial actual.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={resetSimulacion}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
            >
              Sí, reiniciar
            </button>
            <button
              type="button"
              onClick={() => setConfirmarReset(false)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Evento + opciones */}
      <div
        key={`evento-${estado.simulacion.turno}-${evento.id}`}
        className={`animate-[fade-in_0.4s_ease-out] rounded-2xl border-2 bg-white p-6 shadow-md ${clasesSeveridadBorde(evento.severidad)}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${clasesSeveridadBadge(evento.severidad)}`}
          >
            {meta.emoji} Severidad {meta.label}
          </span>
          <span className="text-xs text-slate-500">Turno #{estado.simulacion.turno}</span>
        </div>
        <h2 className="mt-3 text-2xl font-bold text-slate-900">{evento.titulo}</h2>
        <p className="mt-2 text-base text-slate-700">{evento.descripcion}</p>

        {errorIA && (
          <div className="mt-4 rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
            La IA no pudo evaluar la decisión: {errorIA}. Intenta de nuevo.
          </div>
        )}

        {fase === 'evento' && (
          <>
            <h3 className="mt-6 text-sm font-semibold text-slate-900">
              ¿Qué decides? (elige una opción)
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {evento.opciones.map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => elegirOpcion(op)}
                  className="group flex h-full flex-col items-start gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-violet-400 hover:bg-white hover:shadow-lg"
                >
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-violet-700">
                    {op.texto}
                  </p>
                  <div className="space-y-1 text-xs text-slate-600">
                    <p>
                      <span className="font-medium text-slate-900">Costo:</span>{' '}
                      {op.costo_emocional}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Riesgo:</span>{' '}
                      {op.riesgo}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {fase === 'evaluando' && (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-300 border-t-violet-600" />
            <p className="text-sm font-medium text-slate-700">
              La IA evalúa tu decisión y proyecta consecuencias…
            </p>
            {opcionElegida && (
              <p className="text-xs italic text-slate-500">
                Decidiste: {opcionElegida.texto}
              </p>
            )}
          </div>
        )}

        {fase === 'resultado' && evaluacion && opcionElegida && (
          <div className="mt-6 space-y-4">
            <div
              className={`rounded-xl border-2 p-4 ${
                evaluacion.acertada
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-amber-300 bg-amber-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {evaluacion.acertada ? '✅' : '⚠️'}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    Decisión {evaluacion.acertada ? 'acertada' : 'cuestionable'}
                  </span>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-lg font-bold text-slate-900 shadow-sm">
                  {evaluacion.puntaje}/10
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-800">{evaluacion.feedback}</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <CardConsecuencia
                titulo="Próximo mes"
                emoji="📅"
                tone="amber"
                texto={evaluacion.consecuencia_corto_plazo}
              />
              <CardConsecuencia
                titulo="En 12 meses"
                emoji="🗓️"
                tone="indigo"
                texto={evaluacion.consecuencia_largo_plazo}
              />
            </div>

            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                💡 Lección académica
              </p>
              <p className="mt-1 text-sm text-violet-900">{evaluacion.leccion}</p>
            </div>

            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                🎯 Próxima decisión a considerar
              </p>
              <p className="mt-1 text-sm text-sky-900">
                {evaluacion.proxima_decision_sugerida}
              </p>
            </div>

            <button
              type="button"
              onClick={siguienteTurno}
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              Siguiente turno →
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// ── Subcomponentes ──────────────────────────────────────────────────────

function Stat({
  label,
  value,
  truncate,
}: {
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`text-sm font-bold text-slate-900 ${truncate ? 'truncate' : ''}`}
        title={truncate ? value : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function CardConsecuencia({
  titulo,
  emoji,
  tone,
  texto,
}: {
  titulo: string;
  emoji: string;
  tone: 'amber' | 'indigo';
  texto: string;
}) {
  const tones = {
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-900',
  } as const;
  const headTone = {
    amber: 'text-amber-700',
    indigo: 'text-indigo-700',
  } as const;
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${headTone[tone]}`}
      >
        {emoji} {titulo}
      </p>
      <p className="mt-1 text-sm">{texto}</p>
    </div>
  );
}
