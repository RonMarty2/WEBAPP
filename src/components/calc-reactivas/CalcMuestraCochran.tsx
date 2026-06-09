'use client';

/**
 * CalcMuestraCochran
 *
 * Calculadora reactiva del tamaño de muestra usando la fórmula de Cochran (1977)
 * con corrección para población finita.
 *
 * - Cero llamadas a IA: pura matemática en cliente con useMemo.
 * - Sliders/inputs que recalculan en vivo.
 * - Indicadores de color y cuadro de implicaciones (tiempo, costo).
 *
 * Fórmula:
 *   n₀ = (Z² · p · (1-p)) / e²
 *   n  = n₀ / (1 + (n₀ - 1) / N)
 */

import { useMemo, useState } from 'react';
import { Calculator, Users, Clock, Coins, Info, Target } from 'lucide-react';

type NivelConfianza = 90 | 95 | 99;

const Z_POR_CONFIANZA: Record<NivelConfianza, number> = {
  90: 1.645,
  95: 1.96,
  99: 2.576,
};

const ENCUESTAS_POR_DIA_POR_ENCUESTADOR = 8;
const COSTO_INCENTIVO_BS = 3;

interface Props {
  defaultN?: number;
  onResultado?: (n: number) => void;
}

export default function CalcMuestraCochran({ defaultN = 5000, onResultado }: Props) {
  const [N, setN] = useState<number>(defaultN);
  const [confianza, setConfianza] = useState<NivelConfianza>(95);
  const [errorPct, setErrorPct] = useState<number>(5);
  const [p, setP] = useState<number>(0.5);

  const resultado = useMemo(() => {
    const Z = Z_POR_CONFIANZA[confianza];
    const e = errorPct / 100;
    const n0 = (Z * Z * p * (1 - p)) / (e * e);
    const NSeguro = Math.max(N, 1);
    const nAjustado = n0 / (1 + (n0 - 1) / NSeguro);
    const n = Math.ceil(Math.min(nAjustado, NSeguro));
    return { Z, n0: Math.ceil(n0), n };
  }, [N, confianza, errorPct, p]);

  // Notificar al padre si lo pidió.
  useMemo(() => {
    if (onResultado) onResultado(resultado.n);
  }, [resultado.n, onResultado]);

  const semaforo = useMemo(() => {
    if (resultado.n <= 400) {
      return {
        nivel: 'razonable',
        color: 'emerald',
        mensaje: 'Tamaño razonable: aplicable en pocas semanas con un equipo pequeño.',
      };
    }
    if (resultado.n <= 800) {
      return {
        nivel: 'exigente',
        color: 'amber',
        mensaje: 'Tamaño exigente: requiere planificación logística y presupuesto medio.',
      };
    }
    return {
      nivel: 'oneroso',
      color: 'rose',
      mensaje: 'Tamaño elevado: considera relajar el margen de error o usar muestreo por conglomerados.',
    };
  }, [resultado.n]);

  // Implicaciones: días con 1 y con 3 encuestadores, costo con incentivo.
  const dias1Encuestador = Math.ceil(resultado.n / ENCUESTAS_POR_DIA_POR_ENCUESTADOR);
  const dias3Encuestadores = Math.ceil(resultado.n / (ENCUESTAS_POR_DIA_POR_ENCUESTADOR * 3));
  const costoIncentivo = resultado.n * COSTO_INCENTIVO_BS;

  const colorSemaforo: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    rose: 'bg-rose-50 border-rose-200 text-rose-900',
  };

  const colorNumero: Record<string, string> = {
    emerald: 'text-emerald-700',
    amber: 'text-amber-700',
    rose: 'text-rose-700',
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="space-y-5 lg:col-span-3">
          <div className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-sky-600" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                Parámetros del muestreo
              </h3>
            </div>

            {/* Población N */}
            <div className="mb-5">
              <label className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Población total <span className="text-slate-400">(N)</span>
                </span>
                <span className="text-xs text-slate-500">Universo que estudias</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={50}
                  max={5000000}
                  step={100}
                  value={N}
                  onChange={(e) => setN(Math.max(50, Number(e.target.value) || 0))}
                  className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
                <input
                  type="range"
                  min={100}
                  max={100000}
                  step={100}
                  value={Math.min(N, 100000)}
                  onChange={(e) => setN(Number(e.target.value))}
                  className="flex-1 accent-sky-600"
                />
              </div>
            </div>

            {/* Nivel de confianza */}
            <div className="mb-5">
              <label className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Nivel de confianza <span className="text-slate-400">(Z)</span>
                </span>
                <span className="text-xs text-slate-500">Probabilidad de acierto</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([90, 95, 99] as NivelConfianza[]).map((nivel) => {
                  const activo = confianza === nivel;
                  return (
                    <button
                      key={nivel}
                      type="button"
                      onClick={() => setConfianza(nivel)}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        activo
                          ? 'border-sky-500 bg-sky-50 text-sky-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-sky-300'
                      }`}
                    >
                      {nivel}% <span className="ml-1 text-xs text-slate-400">Z={Z_POR_CONFIANZA[nivel]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Margen de error */}
            <div className="mb-5">
              <label className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Margen de error <span className="text-slate-400">(e)</span>
                </span>
                <span className="text-base font-semibold text-sky-700">{errorPct}%</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={errorPct}
                onChange={(e) => setErrorPct(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>1% (preciso)</span>
                <span>10% (laxo)</span>
              </div>
            </div>

            {/* Proporción p */}
            <div>
              <label className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Proporción esperada <span className="text-slate-400">(p)</span>
                </span>
                <span className="text-base font-semibold text-sky-700">{p.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min={0.1}
                max={0.9}
                step={0.05}
                value={p}
                onChange={(e) => setP(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>0.1</span>
                <span>0.5 (máxima incertidumbre)</span>
                <span>0.9</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
            <p>
              <span className="font-semibold text-slate-700">Cochran (1977).</span>{' '}
              Para poblaciones grandes la fórmula tiende a{' '}
              <span className="font-mono text-slate-800">n = Z² · p(1−p) / e²</span>. Cuando N es
              finita aplicamos la corrección por finitud para evitar sobre-muestrear.
            </p>
          </div>
        </div>

        {/* Resultado */}
        <div className="space-y-4 lg:col-span-2">
          <div className={`rounded-3xl border-2 p-6 ${colorSemaforo[semaforo.color]}`}>
            <div className="mb-2 flex items-center gap-2">
              <Target className={`h-5 w-5 ${colorNumero[semaforo.color]}`} />
              <p className="text-xs font-semibold uppercase tracking-wider">
                Muestra recomendada
              </p>
            </div>
            <p className={`text-6xl font-extrabold tabular-nums ${colorNumero[semaforo.color]}`}>
              {resultado.n.toLocaleString('es-BO')}
            </p>
            <p className="mt-1 text-sm">encuestas a aplicar</p>
            <p className="mt-3 text-xs opacity-80">{semaforo.mensaje}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-current/20 pt-3 text-xs">
              <div>
                <p className="opacity-70">Sin corrección (n₀)</p>
                <p className="font-mono font-semibold">{resultado.n0.toLocaleString('es-BO')}</p>
              </div>
              <div>
                <p className="opacity-70">Z aplicado</p>
                <p className="font-mono font-semibold">{resultado.Z}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Implicaciones prácticas
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-600" />
                <div>
                  <p className="text-slate-900">
                    <span className="font-semibold">{dias1Encuestador}</span> días con 1 encuestador
                  </p>
                  <p className="text-xs text-slate-500">
                    {dias3Encuestadores} días con un equipo de 3
                    (8 encuestas/día por persona)
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Coins className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                <div>
                  <p className="text-slate-900">
                    <span className="font-semibold">
                      Bs {costoIncentivo.toLocaleString('es-BO')}
                    </span>{' '}
                    en incentivos
                  </p>
                  <p className="text-xs text-slate-500">
                    Asumiendo Bs {COSTO_INCENTIVO_BS} por respuesta completada
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-600" />
                <div>
                  <p className="text-slate-900">
                    Cobertura:{' '}
                    <span className="font-semibold">
                      {((resultado.n / Math.max(N, 1)) * 100).toFixed(1)}%
                    </span>{' '}
                    de N
                  </p>
                  <p className="text-xs text-slate-500">
                    Mientras menor sea N, mayor el peso relativo de la muestra
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
