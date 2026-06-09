'use client';

import { useMemo, useState } from 'react';

interface Cargo {
  id: string;
  nombre: string;
  salarioLiquido: number;
  cantidad: number;
}

const APORTE_PATRONAL = 0.1671; // 16,71%
const PROVISION_AGUINALDO = 0.0833; // 8,33%

const CARGOS_INICIALES: Cargo[] = [
  { id: 'c1', nombre: 'Gerente General', salarioLiquido: 6000, cantidad: 1 },
  { id: 'c2', nombre: 'Barista jefe', salarioLiquido: 3500, cantidad: 1 },
  { id: 'c3', nombre: 'Cajero / Atención', salarioLiquido: 2500, cantidad: 2 },
];

export default function CalculadoraPlanilla() {
  const [cargos, setCargos] = useState<Cargo[]>(CARGOS_INICIALES);

  const totales = useMemo(() => {
    const filas = cargos.map(c => {
      const liquidoMensual = c.salarioLiquido * c.cantidad;
      const aportes = liquidoMensual * APORTE_PATRONAL;
      const provisionAguinaldo = liquidoMensual * PROVISION_AGUINALDO;
      const costoMensual = liquidoMensual + aportes + provisionAguinaldo;
      return { ...c, liquidoMensual, aportes, provisionAguinaldo, costoMensual };
    });
    const totalMensual = filas.reduce((acc, f) => acc + f.costoMensual, 0);
    const totalLiquido = filas.reduce((acc, f) => acc + f.liquidoMensual, 0);
    const totalAportes = filas.reduce((acc, f) => acc + f.aportes, 0);
    const totalAguinaldo = filas.reduce((acc, f) => acc + f.provisionAguinaldo, 0);
    const totalAnual = totalMensual * 12;
    return { filas, totalMensual, totalLiquido, totalAportes, totalAguinaldo, totalAnual };
  }, [cargos]);

  const agregarCargo = () => {
    const id = `c${Date.now()}`;
    setCargos([...cargos, { id, nombre: 'Nuevo cargo', salarioLiquido: 2500, cantidad: 1 }]);
  };

  const eliminarCargo = (id: string) => {
    setCargos(cargos.filter(c => c.id !== id));
  };

  const actualizarCargo = (id: string, patch: Partial<Cargo>) => {
    setCargos(cargos.map(c => (c.id === id ? { ...c, ...patch } : c)));
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Calculadora de planilla</h1>
        <p className="mt-2 text-slate-600">
          Suma sueldos, aportes patronales (16,71%) y provisión de aguinaldo (8,33%). Resultado en
          bolivianos, listo para tu plan financiero.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Cargos de tu empresa</h2>
          <button
            onClick={agregarCargo}
            className="rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
          >
            + Agregar cargo
          </button>
        </div>

        <div className="space-y-3">
          {cargos.map(c => (
            <div key={c.id} className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[2fr_1fr_1fr_auto]">
              <div>
                <label className="text-xs font-medium text-slate-500">Nombre del cargo</label>
                <input
                  type="text"
                  value={c.nombre}
                  onChange={e => actualizarCargo(c.id, { nombre: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Salario líquido (Bs)</label>
                <input
                  type="number"
                  value={c.salarioLiquido}
                  onChange={e => actualizarCargo(c.id, { salarioLiquido: Number(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Personas</label>
                <input
                  type="number"
                  min={1}
                  value={c.cantidad}
                  onChange={e => actualizarCargo(c.id, { cantidad: Math.max(1, Number(e.target.value) || 1) })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => eliminarCargo(c.id)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {cargos.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              Aún no agregaste cargos. Pulsa "Agregar cargo" para empezar.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-semibold text-amber-900">Desglose por cargo</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-amber-200 text-left text-xs uppercase tracking-wider text-amber-800">
                <th className="pb-2 pr-3">Cargo</th>
                <th className="pb-2 pr-3 text-right">Personas</th>
                <th className="pb-2 pr-3 text-right">Líquido</th>
                <th className="pb-2 pr-3 text-right">Aportes 16,71%</th>
                <th className="pb-2 pr-3 text-right">Aguinaldo 8,33%</th>
                <th className="pb-2 pr-3 text-right">Costo mensual</th>
                <th className="pb-2">% del total</th>
              </tr>
            </thead>
            <tbody>
              {totales.filas.map(f => {
                const pct = totales.totalMensual > 0 ? (f.costoMensual / totales.totalMensual) * 100 : 0;
                return (
                  <tr key={f.id} className="border-b border-amber-100">
                    <td className="py-2 pr-3 font-medium text-slate-900">{f.nombre}</td>
                    <td className="py-2 pr-3 text-right text-slate-700">{f.cantidad}</td>
                    <td className="py-2 pr-3 text-right text-slate-700">Bs {f.liquidoMensual.toLocaleString('es-BO')}</td>
                    <td className="py-2 pr-3 text-right text-slate-700">Bs {Math.round(f.aportes).toLocaleString('es-BO')}</td>
                    <td className="py-2 pr-3 text-right text-slate-700">Bs {Math.round(f.provisionAguinaldo).toLocaleString('es-BO')}</td>
                    <td className="py-2 pr-3 text-right font-semibold text-slate-900">Bs {Math.round(f.costoMensual).toLocaleString('es-BO')}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-amber-200">
                          <div className="h-2 rounded-full bg-amber-600" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-10 text-right text-xs text-amber-900">{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Líquidos mensuales</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">Bs {Math.round(totales.totalLiquido).toLocaleString('es-BO')}</p>
          <p className="mt-1 text-xs text-slate-500">lo que reciben los empleados</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Costo total mensual</p>
          <p className="mt-2 text-2xl font-bold text-amber-900">Bs {Math.round(totales.totalMensual).toLocaleString('es-BO')}</p>
          <p className="mt-1 text-xs text-amber-700">líquido + aportes + provisión aguinaldo</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Costo total anual</p>
          <p className="mt-2 text-2xl font-bold text-emerald-900">Bs {Math.round(totales.totalAnual).toLocaleString('es-BO')}</p>
          <p className="mt-1 text-xs text-emerald-700">costo mensual × 12</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Cómo se calcula</p>
        <ul className="mt-2 space-y-1 text-xs">
          <li>• Aporte patronal 16,71% = Caja Nacional de Salud (10%) + AFP patronal (1,71%) + INFOCAL (1%) + Pro-Vivienda (2%) + Riesgo profesional y otros (2%).</li>
          <li>• Provisión mensual de aguinaldo 8,33% = 1 sueldo extra al año dividido entre 12 meses.</li>
          <li>• El costo total NO incluye indemnización (otro mes por año) ni quinquenio (5 años). Si los provisionas, suma ~10% más.</li>
        </ul>
      </div>
    </div>
  );
}
