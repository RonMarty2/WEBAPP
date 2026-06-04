'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PlatformShell } from '@/components/ecosistema/PlatformShell';
import { getPlatform } from '@/lib/ecosistema/platforms';
import {
  analizarProyecto,
  formatBs,
  formatMeses,
  formatPorcentaje,
  type ProyectoInput,
  type ResultadoProyecto,
} from '@/lib/finanzas/calculos';
import { guardarArtefacto } from '@/lib/finanzas/artefactos-store';

const HORIZONTE_DEFAULT = 5;

interface FormState {
  titulo: string;
  inversionInicial: string;
  ingresos: string[];
  egresos: string[];
  tasaDescuento: string;
}

function inicial(): FormState {
  return {
    titulo: '',
    inversionInicial: '',
    ingresos: Array(HORIZONTE_DEFAULT).fill(''),
    egresos: Array(HORIZONTE_DEFAULT).fill(''),
    tasaDescuento: '14',
  };
}

export default function SimuladorPro() {
  const platform = getPlatform('finanzas')!;
  const [form, setForm] = useState<FormState>(inicial());
  const [resultado, setResultado] = useState<ResultadoProyecto | null>(null);
  const [guardado, setGuardado] = useState<{ id: string; titulo: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const horizonte = form.ingresos.length;

  const ajustarHorizonte = (anos: number) => {
    const ingresos = Array(anos).fill('').map((_, i) => form.ingresos[i] ?? '');
    const egresos = Array(anos).fill('').map((_, i) => form.egresos[i] ?? '');
    setForm(prev => ({ ...prev, ingresos, egresos }));
  };

  const inputProyecto = useMemo((): ProyectoInput | null => {
    const inv = parseFloat(form.inversionInicial);
    const tasa = parseFloat(form.tasaDescuento) / 100;
    if (!Number.isFinite(inv) || inv <= 0) return null;
    if (!Number.isFinite(tasa)) return null;
    const ingresos = form.ingresos.map(v => parseFloat(v) || 0);
    const egresos = form.egresos.map(v => parseFloat(v) || 0);
    if (ingresos.every(v => v === 0) && egresos.every(v => v === 0)) return null;
    return { inversionInicial: inv, ingresosAnuales: ingresos, egresosAnuales: egresos, tasaDescuento: tasa };
  }, [form]);

  const calcular = () => {
    setError(null);
    if (!inputProyecto) {
      setError('Completa la inversión inicial, la tasa y al menos un año de ingresos o egresos.');
      return;
    }
    setResultado(analizarProyecto(inputProyecto));
    setGuardado(null);
  };

  const reiniciar = () => {
    setForm(inicial());
    setResultado(null);
    setGuardado(null);
    setError(null);
  };

  const guardar = () => {
    if (!resultado || !inputProyecto) return;
    const titulo = form.titulo.trim() || `Análisis financiero ${new Date().toLocaleDateString('es-BO')}`;
    const artefacto = guardarArtefacto({ titulo, input: inputProyecto, resultado });
    setGuardado({ id: artefacto.id, titulo: artefacto.titulo });
  };

  return (
    <PlatformShell platform={platform}>
      <header className="mb-8">
        <Link
          href="/ecosistema/universidad/finanzas"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Volver a Finanzas
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            🛠️ Herramienta
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">SimuladorPRO</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Ingresa los datos de tu proyecto. Calculamos VAN, TIR, B/C, Payback y análisis de sensibilidad
          al instante. Guarda tu simulación como artefacto para importarla al Generador después.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Datos del proyecto</h2>

          <div className="mt-5 space-y-4">
            <Field label="Nombre del proyecto" optional>
              <input
                type="text"
                value={form.titulo}
                onChange={e => setForm(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ej: Cafetería La Orquídea"
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </Field>

            <Field label="Inversión inicial (Bs.)" hint="Todo lo que necesitas desembolsar antes de operar">
              <input
                type="number"
                step="any"
                value={form.inversionInicial}
                onChange={e => setForm(prev => ({ ...prev, inversionInicial: e.target.value }))}
                placeholder="85000"
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </Field>

            <Field label="Tasa de descuento (%)" hint="Tu retorno mínimo exigido. Bolivia típico: 12-18%">
              <input
                type="number"
                step="0.5"
                value={form.tasaDescuento}
                onChange={e => setForm(prev => ({ ...prev, tasaDescuento: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </Field>

            <Field label="Horizonte (años)">
              <div className="flex gap-2">
                {[3, 5, 7, 10].map(anos => (
                  <button
                    key={anos}
                    onClick={() => ajustarHorizonte(anos)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                      horizonte === anos
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {anos}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <h3 className="mt-8 text-sm font-semibold text-slate-700">
            Ingresos y egresos anuales (Bs.)
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500">
                  <th className="text-left font-medium">Año</th>
                  <th className="text-left font-medium">Ingresos</th>
                  <th className="text-left font-medium">Egresos</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: horizonte }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-3 font-medium text-slate-700">{i + 1}</td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        step="any"
                        value={form.ingresos[i] ?? ''}
                        onChange={e => {
                          const nuevos = [...form.ingresos];
                          nuevos[i] = e.target.value;
                          setForm(prev => ({ ...prev, ingresos: nuevos }));
                        }}
                        placeholder="0"
                        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        step="any"
                        value={form.egresos[i] ?? ''}
                        onChange={e => {
                          const nuevos = [...form.egresos];
                          nuevos[i] = e.target.value;
                          setForm(prev => ({ ...prev, egresos: nuevos }));
                        }}
                        placeholder="0"
                        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={calcular}
              className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Calcular indicadores
            </button>
            <button
              onClick={reiniciar}
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Reiniciar
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Resultados</h2>

          {!resultado && (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <p className="text-4xl">📊</p>
              <p className="mt-3 font-medium text-slate-700">Aún no has calculado</p>
              <p className="mt-1 text-sm text-slate-500">
                Llena el formulario y presiona <strong>Calcular indicadores</strong>.
              </p>
            </div>
          )}

          {resultado && <ResultadosBlock resultado={resultado} />}

          {resultado && !guardado && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              <p className="text-sm font-medium text-slate-700">¿Te conviene este proyecto?</p>
              <p className="mt-1 text-xs text-slate-500">
                Guarda esta simulación como artefacto. Cuando uses el Generador en modo conectado,
                tu Plan Financiero se llenará con estos números reales.
              </p>
              <button
                onClick={guardar}
                className="mt-3 inline-flex rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                💾 Guardar como artefacto
              </button>
            </div>
          )}

          {guardado && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-900">
                ✓ Guardado: &ldquo;{guardado.titulo}&rdquo;
              </p>
              <p className="mt-1 text-xs text-emerald-800">
                Disponible en Mis Artefactos para usar en el Generador.
              </p>
              <Link
                href="/ecosistema/universidad/finanzas/mis-artefactos"
                className="mt-3 inline-flex text-sm font-medium text-emerald-900 hover:underline"
              >
                Ver mis artefactos →
              </Link>
            </div>
          )}
        </section>
      </div>
    </PlatformShell>
  );
}

function Field({
  label,
  hint,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {optional && <span className="ml-1 text-xs font-normal text-slate-400">(opcional)</span>}
      </label>
      {hint && <p className="mb-1 mt-0.5 text-xs text-slate-500">{hint}</p>}
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ResultadosBlock({ resultado }: { resultado: ResultadoProyecto }) {
  const colorVer =
    resultado.veredicto.nivel === 'viable'
      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
      : resultado.veredicto.nivel === 'marginal'
      ? 'bg-amber-50 border-amber-300 text-amber-900'
      : 'bg-rose-50 border-rose-300 text-rose-900';

  return (
    <div className="mt-5 space-y-6">
      <div className={`rounded-2xl border p-5 ${colorVer}`}>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Veredicto</p>
        <p className="mt-1 text-xl font-bold">{resultado.veredicto.titulo}</p>
        <p className="mt-2 text-sm leading-relaxed">{resultado.veredicto.mensaje}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric
          label="VAN"
          valor={formatBs(resultado.van)}
          positivo={resultado.van > 0}
          sublabel="Valor Actual Neto"
        />
        <Metric
          label="TIR"
          valor={formatPorcentaje(resultado.tir)}
          positivo={resultado.tir > 0.1}
          sublabel="Tasa Interna de Retorno"
        />
        <Metric
          label="B/C"
          valor={resultado.bc.toFixed(2)}
          positivo={resultado.bc > 1}
          sublabel="Beneficio / Costo"
        />
        <Metric
          label="Payback"
          valor={formatMeses(resultado.paybackMeses)}
          positivo={resultado.paybackMeses > 0 && resultado.paybackMeses < 48}
          sublabel="Recuperación inversión"
        />
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-900">Análisis de sensibilidad</p>
        <p className="mt-1 text-xs text-slate-500">
          Optimista: ingresos +20%, egresos -10%. Pesimista: ingresos -20%, egresos +10%.
        </p>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Escenario</th>
                <th className="px-3 py-2 text-right font-medium text-slate-600">VAN</th>
                <th className="px-3 py-2 text-right font-medium text-slate-600">TIR</th>
                <th className="px-3 py-2 text-right font-medium text-slate-600">B/C</th>
              </tr>
            </thead>
            <tbody>
              <FilaSensibilidad nombre="Optimista" datos={resultado.sensibilidad.optimista} color="emerald" />
              <FilaSensibilidad nombre="Base" datos={resultado.sensibilidad.base} color="slate" />
              <FilaSensibilidad nombre="Pesimista" datos={resultado.sensibilidad.pesimista} color="rose" />
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-900">Flujo de caja acumulado</p>
        <FlujoAcumuladoVisual flujo={resultado.flujoAcumulado} />
      </div>
    </div>
  );
}

function Metric({
  label,
  valor,
  positivo,
  sublabel,
}: {
  label: string;
  valor: string;
  positivo: boolean;
  sublabel: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-0.5 text-xl font-bold ${positivo ? 'text-emerald-700' : 'text-rose-700'}`}>
        {valor}
      </p>
      <p className="mt-0.5 text-xs text-slate-400">{sublabel}</p>
    </div>
  );
}

function FilaSensibilidad({
  nombre,
  datos,
  color,
}: {
  nombre: string;
  datos: { van: number; tir: number; bc: number; paybackMeses: number };
  color: 'emerald' | 'slate' | 'rose';
}) {
  const colores: Record<string, string> = {
    emerald: 'text-emerald-700',
    slate: 'text-slate-700',
    rose: 'text-rose-700',
  };
  return (
    <tr className="border-t border-slate-200">
      <td className={`px-3 py-2 font-medium ${colores[color]}`}>{nombre}</td>
      <td className="px-3 py-2 text-right font-mono">{formatBs(datos.van)}</td>
      <td className="px-3 py-2 text-right font-mono">{formatPorcentaje(datos.tir)}</td>
      <td className="px-3 py-2 text-right font-mono">{datos.bc.toFixed(2)}</td>
    </tr>
  );
}

function FlujoAcumuladoVisual({ flujo }: { flujo: number[] }) {
  const min = Math.min(...flujo, 0);
  const max = Math.max(...flujo, 0);
  const rango = max - min || 1;

  return (
    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-end gap-2" style={{ height: 140 }}>
        {flujo.map((v, i) => {
          const altura = (Math.abs(v) / rango) * 100;
          const positivo = v >= 0;
          return (
            <div key={i} className="flex flex-1 flex-col items-center">
              <div className="flex w-full flex-1 items-end">
                <div
                  className={`w-full rounded-t-md ${positivo ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ height: `${altura}%` }}
                  title={formatBs(v)}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">{i === 0 ? 'Año 0' : `Año ${i}`}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Cuando la barra cruza al verde (positivo), tu inversión ya se recuperó.
      </p>
    </div>
  );
}
