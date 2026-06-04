'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PlatformShell } from '@/components/ecosistema/PlatformShell';
import { getPlatform } from '@/lib/ecosistema/platforms';
import {
  listarArtefactos,
  eliminarArtefacto,
  type ArtefactoFinanciero,
} from '@/lib/finanzas/artefactos-store';
import { formatBs, formatMeses, formatPorcentaje } from '@/lib/finanzas/calculos';

export default function MisArtefactos() {
  const platform = getPlatform('finanzas')!;
  const [artefactos, setArtefactos] = useState<ArtefactoFinanciero[]>([]);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setArtefactos(listarArtefactos());
    setMontado(true);
  }, []);

  const eliminar = (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('¿Eliminar este artefacto? No se puede deshacer.')) return;
    eliminarArtefacto(id);
    setArtefactos(listarArtefactos());
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
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Mis artefactos</h1>
        <p className="mt-2 text-slate-600">
          Cada simulación que guardas se conserva aquí. Desde aquí puedes revisar, eliminar o
          exportar al Generador en modo conectado.
        </p>
      </header>

      {!montado && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
          Cargando...
        </div>
      )}

      {montado && artefactos.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="text-5xl">📂</p>
          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            Aún no tienes simulaciones guardadas
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Crea tu primer análisis financiero en el SimuladorPRO. Tarda menos de 5 minutos.
          </p>
          <Link
            href="/ecosistema/universidad/finanzas/simulador"
            className="mt-6 inline-flex rounded-full bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Abrir SimuladorPRO →
          </Link>
        </div>
      )}

      {montado && artefactos.length > 0 && (
        <div className="space-y-4">
          {artefactos.map(art => (
            <div
              key={art.id}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">
                    Análisis financiero · {new Date(art.fechaCreacion).toLocaleDateString('es-BO', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{art.titulo}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Inversión {formatBs(art.input.inversionInicial)} · Horizonte {art.input.ingresosAnuales.length}{' '}
                    años · Tasa {formatPorcentaje(art.input.tasaDescuento)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => eliminar(art.id)}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <MetricMini label="VAN" valor={formatBs(art.resultado.van)} positivo={art.resultado.van > 0} />
                <MetricMini label="TIR" valor={formatPorcentaje(art.resultado.tir)} positivo={art.resultado.tir > art.input.tasaDescuento} />
                <MetricMini label="B/C" valor={art.resultado.bc.toFixed(2)} positivo={art.resultado.bc > 1} />
                <MetricMini label="Payback" valor={formatMeses(art.resultado.paybackMeses)} positivo={art.resultado.paybackMeses > 0} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    art.resultado.veredicto.nivel === 'viable'
                      ? 'bg-emerald-100 text-emerald-800'
                      : art.resultado.veredicto.nivel === 'marginal'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {art.resultado.veredicto.titulo}
                </span>
                <Link
                  href="/ecosistema/generador"
                  className="ml-auto text-xs font-medium text-amber-700 hover:underline"
                >
                  Importar al Generador →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {montado && artefactos.length > 0 && (
        <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50/50 p-6">
          <p className="text-sm font-semibold text-amber-900">
            ¿Listo para llevar tus análisis al Generador?
          </p>
          <p className="mt-1 text-sm text-amber-900/80">
            Tus {artefactos.length} simulaciones pueden importarse directamente al Plan Financiero
            de tu tesis o proyecto de grado.
          </p>
          <Link
            href="/ecosistema/generador"
            className="mt-3 inline-flex rounded-full bg-amber-600 px-5 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Ir al Generador →
          </Link>
        </div>
      )}
    </PlatformShell>
  );
}

function MetricMini({ label, valor, positivo }: { label: string; valor: string; positivo: boolean }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2.5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-0.5 text-sm font-bold ${positivo ? 'text-emerald-700' : 'text-rose-700'}`}>
        {valor}
      </p>
    </div>
  );
}
