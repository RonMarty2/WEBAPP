'use client';

/**
 * CalcPESTELScore
 *
 * El alumno escribe 6 factores (uno por dimensión PESTEL) y para cada uno mueve
 * un slider de impacto en rango [-5, +5]. El componente calcula:
 *   - Score total (suma algebraica)
 *   - Top 3 oportunidades (positivos) y Top 3 amenazas (negativos)
 *   - Recomendación estratégica según el rango del score
 *
 * Cero IA: matemática + ordenamiento en cliente.
 */

import { useMemo, useState } from 'react';
import {
  Compass,
  TrendingUp,
  AlertTriangle,
  Scale,
  Sparkles,
} from 'lucide-react';

type DimensionKey = 'politico' | 'economico' | 'social' | 'tecnologico' | 'ecologico' | 'legal';

interface Dimension {
  key: DimensionKey;
  letra: string;
  nombre: string;
  ejemplo: string;
  color: string;
}

const DIMENSIONES: Dimension[] = [
  {
    key: 'politico',
    letra: 'P',
    nombre: 'Político',
    ejemplo: 'Ej. nueva ley de impuestos a importación',
    color: 'violet',
  },
  {
    key: 'economico',
    letra: 'E',
    nombre: 'Económico',
    ejemplo: 'Ej. inflación 8% anual en Bolivia',
    color: 'sky',
  },
  {
    key: 'social',
    letra: 'S',
    nombre: 'Social',
    ejemplo: 'Ej. crecimiento de clase media urbana',
    color: 'rose',
  },
  {
    key: 'tecnologico',
    letra: 'T',
    nombre: 'Tecnológico',
    ejemplo: 'Ej. adopción de pagos QR en jóvenes',
    color: 'amber',
  },
  {
    key: 'ecologico',
    letra: 'E',
    nombre: 'Ecológico',
    ejemplo: 'Ej. sequía en Cochabamba afecta agua',
    color: 'emerald',
  },
  {
    key: 'legal',
    letra: 'L',
    nombre: 'Legal',
    ejemplo: 'Ej. regulación sobre delivery en La Paz',
    color: 'indigo',
  },
];

interface Factor {
  texto: string;
  impacto: number; // -5 a +5
}

type Factores = Record<DimensionKey, Factor>;

const FACTORES_INICIALES: Factores = {
  politico: { texto: '', impacto: 0 },
  economico: { texto: '', impacto: 0 },
  social: { texto: '', impacto: 0 },
  tecnologico: { texto: '', impacto: 0 },
  ecologico: { texto: '', impacto: 0 },
  legal: { texto: '', impacto: 0 },
};

export default function CalcPESTELScore() {
  const [factores, setFactores] = useState<Factores>(FACTORES_INICIALES);

  const setTexto = (key: DimensionKey, texto: string) =>
    setFactores((prev) => ({ ...prev, [key]: { ...prev[key], texto } }));

  const setImpacto = (key: DimensionKey, impacto: number) =>
    setFactores((prev) => ({ ...prev, [key]: { ...prev[key], impacto } }));

  const analisis = useMemo(() => {
    const items = DIMENSIONES.map((d) => ({
      dim: d,
      texto: factores[d.key].texto,
      impacto: factores[d.key].impacto,
    }));
    const score = items.reduce((acc, it) => acc + it.impacto, 0);
    const positivos = items
      .filter((it) => it.impacto > 0)
      .sort((a, b) => b.impacto - a.impacto)
      .slice(0, 3);
    const negativos = items
      .filter((it) => it.impacto < 0)
      .sort((a, b) => a.impacto - b.impacto)
      .slice(0, 3);
    return { items, score, positivos, negativos };
  }, [factores]);

  const semaforo = useMemo(() => {
    const s = analisis.score;
    if (s >= 10) {
      return {
        tono: 'emerald',
        titulo: 'Entorno favorable',
        icon: Sparkles,
        recomendacion:
          'Capitaliza la coyuntura: invierte en crecimiento y consolida ventaja antes de que la ventana se cierre.',
      };
    }
    if (s <= -10) {
      return {
        tono: 'rose',
        titulo: 'Entorno hostil',
        icon: AlertTriangle,
        recomendacion:
          'Adopta postura defensiva: reduce gastos fijos, prioriza efectivo y diversifica para mitigar las amenazas.',
      };
    }
    if (s > 0) {
      return {
        tono: 'sky',
        titulo: 'Entorno levemente positivo',
        icon: TrendingUp,
        recomendacion:
          'Avanza con prudencia: aprovecha oportunidades concretas y vigila el flanco débil de mayor riesgo.',
      };
    }
    if (s < 0) {
      return {
        tono: 'amber',
        titulo: 'Entorno levemente adverso',
        icon: AlertTriangle,
        recomendacion:
          'Refuerza los puntos vulnerables y posterga inversiones de alto riesgo hasta estabilizar el contexto.',
      };
    }
    return {
      tono: 'slate',
      titulo: 'Entorno neutro',
      icon: Scale,
      recomendacion:
        'No hay fuerzas dominantes: enfócate en ejecución impecable y construir ventajas internas.',
    };
  }, [analisis.score]);

  const colorTono: Record<string, { bg: string; border: string; text: string; numero: string }> = {
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
      text: 'text-emerald-900',
      numero: 'text-emerald-700',
    },
    sky: {
      bg: 'bg-sky-50',
      border: 'border-sky-300',
      text: 'text-sky-900',
      numero: 'text-sky-700',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      text: 'text-amber-900',
      numero: 'text-amber-700',
    },
    rose: {
      bg: 'bg-rose-50',
      border: 'border-rose-300',
      text: 'text-rose-900',
      numero: 'text-rose-700',
    },
    slate: {
      bg: 'bg-slate-50',
      border: 'border-slate-300',
      text: 'text-slate-900',
      numero: 'text-slate-700',
    },
  };

  const colorDim: Record<string, string> = {
    violet: 'border-violet-300 bg-violet-50 text-violet-800',
    sky: 'border-sky-300 bg-sky-50 text-sky-800',
    rose: 'border-rose-300 bg-rose-50 text-rose-800',
    amber: 'border-amber-300 bg-amber-50 text-amber-800',
    emerald: 'border-emerald-300 bg-emerald-50 text-emerald-800',
    indigo: 'border-indigo-300 bg-indigo-50 text-indigo-800',
  };

  const IconoSem = semaforo.icon;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Inputs por dimensión */}
        <div className="space-y-3 lg:col-span-3">
          {DIMENSIONES.map((d) => {
            const f = factores[d.key];
            const colorImpacto =
              f.impacto > 0
                ? 'text-emerald-700'
                : f.impacto < 0
                  ? 'text-rose-700'
                  : 'text-slate-500';
            return (
              <div key={d.key} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border text-lg font-extrabold ${colorDim[d.color]}`}
                  >
                    {d.letra}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">{d.nombre}</p>
                      <span className={`text-base font-bold tabular-nums ${colorImpacto}`}>
                        {f.impacto > 0 ? '+' : ''}
                        {f.impacto}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={f.texto}
                      onChange={(e) => setTexto(d.key, e.target.value)}
                      placeholder={d.ejemplo}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
                    />
                    <div className="mt-2">
                      <input
                        type="range"
                        min={-5}
                        max={5}
                        step={1}
                        value={f.impacto}
                        onChange={(e) => setImpacto(d.key, Number(e.target.value))}
                        className="w-full accent-violet-600"
                      />
                      <div className="mt-0.5 flex justify-between text-[10px] text-slate-400">
                        <span>−5 amenaza</span>
                        <span>0 neutro</span>
                        <span>+5 oportunidad</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Score + listas */}
        <div className="space-y-4 lg:col-span-2">
          <div
            className={`rounded-3xl border-2 p-6 ${colorTono[semaforo.tono].bg} ${colorTono[semaforo.tono].border} ${colorTono[semaforo.tono].text}`}
          >
            <div className="flex items-center gap-2">
              <Compass className={`h-5 w-5 ${colorTono[semaforo.tono].numero}`} />
              <p className="text-xs font-semibold uppercase tracking-wider">PESTEL Score</p>
            </div>
            <p
              className={`mt-2 text-6xl font-extrabold tabular-nums ${colorTono[semaforo.tono].numero}`}
            >
              {analisis.score > 0 ? '+' : ''}
              {analisis.score}
            </p>
            <p className="text-xs opacity-80">rango posible −30 a +30</p>

            {/* Barra de score */}
            <div className="mt-4">
              <div className="relative h-3 overflow-hidden rounded-full bg-white/60">
                <div
                  className="absolute top-0 h-full bg-current opacity-60"
                  style={{
                    left: '50%',
                    width: `${Math.min(50, Math.abs(analisis.score) * (50 / 30))}%`,
                    transform: analisis.score < 0 ? 'translateX(-100%)' : 'none',
                  }}
                />
                <div className="absolute left-1/2 top-0 h-full w-px bg-slate-900/30" />
              </div>
              <div className="mt-1 flex justify-between text-[10px] opacity-70">
                <span>−30</span>
                <span>0</span>
                <span>+30</span>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 border-t border-current/20 pt-3">
              <IconoSem className={`mt-0.5 h-4 w-4 flex-shrink-0 ${colorTono[semaforo.tono].numero}`} />
              <div>
                <p className="text-sm font-bold">{semaforo.titulo}</p>
                <p className="text-xs opacity-90">{semaforo.recomendacion}</p>
              </div>
            </div>
          </div>

          {/* Oportunidades */}
          <div className="rounded-2xl border border-emerald-200 bg-white p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <TrendingUp className="h-4 w-4" /> Top oportunidades
            </p>
            {analisis.positivos.length === 0 ? (
              <p className="mt-2 text-xs italic text-slate-400">
                Aún no marcas factores positivos.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {analisis.positivos.map((it) => (
                  <li
                    key={it.dim.key}
                    className="flex items-start justify-between gap-2 rounded-lg bg-emerald-50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-emerald-900">{it.dim.nombre}</p>
                      <p className="truncate text-xs text-emerald-800/80">
                        {it.texto || <span className="italic opacity-60">Sin descripción</span>}
                      </p>
                    </div>
                    <span className="flex-shrink-0 rounded-md bg-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-900">
                      +{it.impacto}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Amenazas */}
          <div className="rounded-2xl border border-rose-200 bg-white p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-700">
              <AlertTriangle className="h-4 w-4" /> Top amenazas
            </p>
            {analisis.negativos.length === 0 ? (
              <p className="mt-2 text-xs italic text-slate-400">
                Aún no marcas factores negativos.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {analisis.negativos.map((it) => (
                  <li
                    key={it.dim.key}
                    className="flex items-start justify-between gap-2 rounded-lg bg-rose-50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-rose-900">{it.dim.nombre}</p>
                      <p className="truncate text-xs text-rose-800/80">
                        {it.texto || <span className="italic opacity-60">Sin descripción</span>}
                      </p>
                    </div>
                    <span className="flex-shrink-0 rounded-md bg-rose-200 px-2 py-0.5 text-xs font-bold text-rose-900">
                      {it.impacto}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
