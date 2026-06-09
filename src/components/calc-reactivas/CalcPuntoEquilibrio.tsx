'use client';

/**
 * CalcPuntoEquilibrio
 *
 * Calculadora reactiva del punto de equilibrio operativo.
 *   PE (unidades) = Costos fijos / (Precio − Costo variable unitario)
 *   PE (Bs)       = PE_uds × Precio
 *
 * Incluye un gráfico SVG inline con la línea de costos totales vs ingresos
 * y un cálculo de margen de seguridad sobre una proyección.
 *
 * Cero IA: matemática pura con useMemo.
 */

import { useMemo, useState } from 'react';
import {
  Calculator,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

const ANCHO_GRAFICA = 560;
const ALTO_GRAFICA = 280;
const MARGEN = { top: 20, right: 24, bottom: 36, left: 56 };

export default function CalcPuntoEquilibrio() {
  const [costosFijos, setCostosFijos] = useState<number>(3000);
  const [precio, setPrecio] = useState<number>(25);
  const [costoVar, setCostoVar] = useState<number>(12);
  const [proyeccion, setProyeccion] = useState<number>(400);

  // Restringir costoVar < precio para que el margen contribución sea positivo.
  const cvSeguro = Math.min(costoVar, precio - 1);

  const calc = useMemo(() => {
    const mc = precio - cvSeguro;
    const peUnidades = mc > 0 ? Math.ceil(costosFijos / mc) : Infinity;
    const peBs = isFinite(peUnidades) ? peUnidades * precio : Infinity;
    const margenSeguridadUds = proyeccion - peUnidades;
    const margenSeguridadPct =
      proyeccion > 0 && isFinite(peUnidades)
        ? ((proyeccion - peUnidades) / proyeccion) * 100
        : 0;
    return {
      mc,
      peUnidades,
      peBs,
      margenSeguridadUds,
      margenSeguridadPct,
      utilidadProyectada: proyeccion * mc - costosFijos,
    };
  }, [costosFijos, precio, cvSeguro, proyeccion]);

  // Datos para la gráfica: barrer de 0 a 2 × PE (o 2 × proyección si es mayor).
  const maxX = useMemo(() => {
    if (!isFinite(calc.peUnidades)) return Math.max(proyeccion * 2, 100);
    return Math.max(calc.peUnidades * 2, proyeccion * 1.2, 50);
  }, [calc.peUnidades, proyeccion]);

  const maxY = useMemo(() => {
    return Math.max(precio * maxX, costosFijos + cvSeguro * maxX, 1);
  }, [precio, cvSeguro, costosFijos, maxX]);

  const xToPx = (x: number) =>
    MARGEN.left + ((ANCHO_GRAFICA - MARGEN.left - MARGEN.right) * x) / maxX;
  const yToPx = (y: number) =>
    ALTO_GRAFICA - MARGEN.bottom - ((ALTO_GRAFICA - MARGEN.top - MARGEN.bottom) * y) / maxY;

  // Líneas: ingresos = precio · x ; costos = CF + cv · x
  const lineaIngresos = `M ${xToPx(0)} ${yToPx(0)} L ${xToPx(maxX)} ${yToPx(precio * maxX)}`;
  const lineaCostos = `M ${xToPx(0)} ${yToPx(costosFijos)} L ${xToPx(maxX)} ${yToPx(costosFijos + cvSeguro * maxX)}`;

  const formatNum = (n: number, dec = 0) =>
    n.toLocaleString('es-BO', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  // Diagnóstico margen de seguridad.
  const diagMS = useMemo(() => {
    if (!isFinite(calc.peUnidades)) {
      return {
        tono: 'rose',
        titulo: 'Margen de contribución no positivo',
        mensaje:
          'El costo variable iguala o supera al precio. Ajusta uno de los dos antes de continuar.',
        icon: AlertTriangle,
      };
    }
    if (calc.margenSeguridadPct < 0) {
      return {
        tono: 'rose',
        titulo: 'Por debajo del punto de equilibrio',
        mensaje: 'Tu proyección no cubre los costos fijos. Sube precio, baja CV o aumenta volumen.',
        icon: AlertTriangle,
      };
    }
    if (calc.margenSeguridadPct < 20) {
      return {
        tono: 'amber',
        titulo: 'Margen estrecho',
        mensaje: 'Cualquier caída leve en ventas te lleva a pérdidas. Refuerza la previsión.',
        icon: AlertTriangle,
      };
    }
    return {
      tono: 'emerald',
      titulo: 'Margen saludable',
      mensaje: 'Tu proyección está bien por encima del PE. Buen colchón ante variabilidad.',
      icon: CheckCircle2,
    };
  }, [calc.peUnidades, calc.margenSeguridadPct]);

  const colorTono: Record<string, { bg: string; border: string; text: string }> = {
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900' },
  };
  const IconoMS = diagMS.icon;

  const pePxX = isFinite(calc.peUnidades) ? xToPx(calc.peUnidades) : null;
  const pePxY = isFinite(calc.peUnidades) ? yToPx(precio * calc.peUnidades) : null;
  const proyPxX = xToPx(proyeccion);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                Estructura de costos
              </h3>
            </div>

            <Field
              label="Costos fijos mensuales"
              destacado={`Bs ${formatNum(costosFijos)}`}
              hint="Alquiler, sueldos base, servicios"
            >
              <input
                type="range"
                min={500}
                max={50000}
                step={100}
                value={costosFijos}
                onChange={(e) => setCostosFijos(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </Field>

            <Field
              label="Precio de venta unitario"
              destacado={`Bs ${formatNum(precio)}`}
              hint="Lo que cobras por unidad"
            >
              <input
                type="range"
                min={5}
                max={500}
                step={1}
                value={precio}
                onChange={(e) => {
                  const nuevo = Number(e.target.value);
                  setPrecio(nuevo);
                  if (costoVar >= nuevo) setCostoVar(nuevo - 1);
                }}
                className="w-full accent-emerald-600"
              />
            </Field>

            <Field
              label="Costo variable unitario"
              destacado={`Bs ${formatNum(cvSeguro)}`}
              hint={`Materiales y producción · máx Bs ${precio - 1}`}
            >
              <input
                type="range"
                min={1}
                max={Math.max(1, precio - 1)}
                step={0.5}
                value={cvSeguro}
                onChange={(e) => setCostoVar(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </Field>

            <Field
              label="Proyección de ventas"
              destacado={`${formatNum(proyeccion)} uds`}
              hint="Cuántas unidades proyectas vender"
              last
            >
              <input
                type="range"
                min={0}
                max={Math.max(1000, isFinite(calc.peUnidades) ? calc.peUnidades * 3 : 1000)}
                step={10}
                value={proyeccion}
                onChange={(e) => setProyeccion(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </Field>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-4 lg:col-span-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Margen contribución
              </p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums text-emerald-800">
                Bs {formatNum(calc.mc, 2)}
              </p>
              <p className="text-xs text-emerald-700/80">por unidad vendida</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                PE en unidades
              </p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums text-slate-900">
                {isFinite(calc.peUnidades) ? formatNum(calc.peUnidades) : '—'}
              </p>
              <p className="text-xs text-slate-500">unidades/mes</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                PE en bolivianos
              </p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums text-slate-900">
                {isFinite(calc.peBs) ? `Bs ${formatNum(calc.peBs)}` : '—'}
              </p>
              <p className="text-xs text-slate-500">ingresos/mes</p>
            </div>
          </div>

          {/* Gráfica SVG */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ingresos vs costos totales
            </p>
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${ANCHO_GRAFICA} ${ALTO_GRAFICA}`}
                className="block h-auto w-full min-w-[480px]"
                role="img"
                aria-label="Gráfica del punto de equilibrio"
              >
                {/* Ejes */}
                <line
                  x1={MARGEN.left}
                  y1={ALTO_GRAFICA - MARGEN.bottom}
                  x2={ANCHO_GRAFICA - MARGEN.right}
                  y2={ALTO_GRAFICA - MARGEN.bottom}
                  stroke="#cbd5e1"
                  strokeWidth={1}
                />
                <line
                  x1={MARGEN.left}
                  y1={MARGEN.top}
                  x2={MARGEN.left}
                  y2={ALTO_GRAFICA - MARGEN.bottom}
                  stroke="#cbd5e1"
                  strokeWidth={1}
                />

                {/* Grid Y */}
                {[0.25, 0.5, 0.75, 1].map((f) => (
                  <line
                    key={f}
                    x1={MARGEN.left}
                    y1={yToPx(maxY * f)}
                    x2={ANCHO_GRAFICA - MARGEN.right}
                    y2={yToPx(maxY * f)}
                    stroke="#f1f5f9"
                    strokeWidth={1}
                  />
                ))}

                {/* Línea de costos totales */}
                <path d={lineaCostos} stroke="#f59e0b" strokeWidth={2.5} fill="none" />
                {/* Línea de ingresos */}
                <path d={lineaIngresos} stroke="#059669" strokeWidth={2.5} fill="none" />

                {/* Punto de equilibrio */}
                {pePxX !== null && pePxY !== null && (
                  <>
                    <line
                      x1={pePxX}
                      y1={pePxY}
                      x2={pePxX}
                      y2={ALTO_GRAFICA - MARGEN.bottom}
                      stroke="#0f172a"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                    />
                    <circle cx={pePxX} cy={pePxY} r={6} fill="#0f172a" />
                    <text
                      x={pePxX + 8}
                      y={pePxY - 8}
                      fontSize={11}
                      fontWeight={600}
                      fill="#0f172a"
                    >
                      PE: {formatNum(calc.peUnidades)} uds
                    </text>
                  </>
                )}

                {/* Línea de proyección */}
                <line
                  x1={proyPxX}
                  y1={MARGEN.top}
                  x2={proyPxX}
                  y2={ALTO_GRAFICA - MARGEN.bottom}
                  stroke="#7c3aed"
                  strokeDasharray="2 4"
                  strokeWidth={1.5}
                />
                <text
                  x={proyPxX + 4}
                  y={MARGEN.top + 12}
                  fontSize={10}
                  fill="#7c3aed"
                  fontWeight={600}
                >
                  Proyección: {formatNum(proyeccion)}
                </text>

                {/* Labels ejes */}
                <text
                  x={ANCHO_GRAFICA / 2}
                  y={ALTO_GRAFICA - 6}
                  fontSize={11}
                  fill="#64748b"
                  textAnchor="middle"
                >
                  Unidades vendidas
                </text>
                <text
                  x={14}
                  y={ALTO_GRAFICA / 2}
                  fontSize={11}
                  fill="#64748b"
                  textAnchor="middle"
                  transform={`rotate(-90 14 ${ALTO_GRAFICA / 2})`}
                >
                  Bolivianos
                </text>

                {/* Leyenda */}
                <g transform={`translate(${ANCHO_GRAFICA - 180}, ${MARGEN.top + 6})`}>
                  <rect width={170} height={44} rx={6} fill="white" stroke="#e2e8f0" />
                  <line x1={10} y1={16} x2={28} y2={16} stroke="#059669" strokeWidth={2.5} />
                  <text x={34} y={20} fontSize={11} fill="#0f172a">
                    Ingresos
                  </text>
                  <line x1={10} y1={34} x2={28} y2={34} stroke="#f59e0b" strokeWidth={2.5} />
                  <text x={34} y={38} fontSize={11} fill="#0f172a">
                    Costos totales
                  </text>
                </g>
              </svg>
            </div>
          </div>

          {/* Margen de seguridad */}
          <div
            className={`rounded-2xl border p-5 ${colorTono[diagMS.tono].bg} ${colorTono[diagMS.tono].border} ${colorTono[diagMS.tono].text}`}
          >
            <div className="flex items-start gap-3">
              <Shield className="mt-1 h-5 w-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                  Margen de seguridad
                </p>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs opacity-70">Sobre el PE</p>
                    <p className="text-xl font-bold tabular-nums">
                      {isFinite(calc.peUnidades) ? formatNum(calc.margenSeguridadUds) : '—'} uds
                    </p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Margen %</p>
                    <p className="text-xl font-bold tabular-nums">
                      {calc.margenSeguridadPct.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Utilidad proyectada</p>
                    <p className="text-xl font-bold tabular-nums">
                      Bs {formatNum(calc.utilidadProyectada, 0)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-start gap-2 border-t border-current/20 pt-3">
                  <IconoMS className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{diagMS.titulo}</p>
                    <p className="text-xs opacity-80">{diagMS.mensaje}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
        <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
        <span>
          El punto de equilibrio es donde tus ingresos cubren exactamente todos tus costos. Más
          allá, cada unidad vendida es utilidad.
        </span>
      </p>
    </div>
  );
}

/* ---------- Subcomponente Field ---------- */

function Field({
  label,
  destacado,
  hint,
  children,
  last,
}: {
  label: string;
  destacado: string;
  hint?: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={last ? '' : 'mb-5'}>
      <label className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-base font-semibold text-emerald-700">{destacado}</span>
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
