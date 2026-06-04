'use client';

import { useState } from 'react';

export default function MuestreoCalculator() {
  const [poblacion, setPoblacion] = useState(50000);
  const [confianza, setConfianza] = useState(95);
  const [error, setError] = useState(5);
  const [proporcion, setProporcion] = useState(50);

  const z = confianza === 99 ? 2.576 : confianza === 95 ? 1.96 : 1.645;
  const p = proporcion / 100;
  const q = 1 - p;
  const e = error / 100;
  const numerador = z * z * p * q;
  const denominador = e * e;
  const muestraInfinita = Math.ceil(numerador / denominador);
  const muestra = Math.ceil(muestraInfinita / (1 + (muestraInfinita - 1) / poblacion));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Calculadora de tamaño de muestra</h1>
        <p className="mt-2 text-slate-600">Fórmula de Cochran ajustada por población finita. Resultado listo para tu proyecto.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-slate-900">Parámetros</h2>
          <div className="space-y-4">
            <Field label="Tamaño de población (N)" value={poblacion} onChange={setPoblacion} hint="Número total de personas en el universo" />
            <Field label="Nivel de confianza (%)" value={confianza} onChange={setConfianza} hint="90, 95 o 99 — usualmente 95" />
            <Field label="Margen de error (%)" value={error} onChange={setError} hint="3, 5 o 10 — usualmente 5" />
            <Field label="Proporción esperada (%)" value={proporcion} onChange={setProporcion} hint="Si no sabes, usa 50 (caso más conservador)" />
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6">
          <h2 className="mb-4 font-semibold text-sky-900">Resultado</h2>
          <p className="text-sm text-sky-900/80">Tamaño de muestra recomendado:</p>
          <p className="mt-2 text-6xl font-bold text-sky-700">{muestra.toLocaleString('es-BO')}</p>
          <p className="mt-2 text-sm text-sky-900/80">personas</p>

          <div className="mt-6 space-y-2 rounded-xl bg-white p-4 text-sm">
            <p className="font-semibold text-slate-900">Interpretación</p>
            <p className="text-slate-700">
              Con {muestra} encuestas representativas tendrás un nivel de confianza del {confianza}% de que
              el error de tus resultados no superará ±{error}% respecto a la población real de {poblacion.toLocaleString('es-BO')}.
            </p>
          </div>

          <button className="mt-6 w-full rounded-full bg-sky-600 py-3 font-medium text-white hover:bg-sky-700">
            Guardar en mi proyecto →
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, hint }: { label: string; value: number; onChange: (n: number) => void; hint: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:outline-none"
      />
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
