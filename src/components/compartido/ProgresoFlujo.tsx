'use client';

/**
 * Barra de "Progreso del proyecto" — muestra el flujo de módulos según la
 * modalidad del estudiante, con el módulo actual marcado.
 *
 * Visualmente: `Idea ✓  ›  Mercados (estás aquí)  ›  Estrategia  ›  ...`
 *
 * Si no se sabe la modalidad, no renderiza nada (no estorba).
 */

import Link from 'next/link';
import { ChevronRight, MapPin, Info } from 'lucide-react';
import { flujoParaModalidad, MODULOS_META, type ModuloId } from '@/lib/flujos/por-modalidad';

interface Props {
  /** Módulo que se está mostrando AHORA (uno de 'idea', 'mercados', etc.). */
  actual: ModuloId;
  /** Modalidad del proyecto (ej. "Proyecto de Grado", "Tesis"). */
  modalidad: string | null | undefined;
  /** Texto del trabajo (ej. "Proyecto de Grado", "Tesis") para mostrar al lado. Opcional. */
  tipoTrabajoLabel?: string;
}

export function ProgresoFlujo({ actual, modalidad, tipoTrabajoLabel }: Props) {
  const flujo = flujoParaModalidad(modalidad);
  const idxActual = flujo.indexOf(actual);

  // Si el módulo actual no está en el flujo recomendado para esta modalidad,
  // mostramos una advertencia (ej: estudiante de Tesis abrió Marketing).
  const moduloNoEnFlujo = idxActual < 0;

  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">Progreso del proyecto</span>
          {tipoTrabajoLabel && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              {tipoTrabajoLabel}
            </span>
          )}
        </div>
      </div>

      {moduloNoEnFlujo && (
        <div className="mt-2 flex items-start gap-2 rounded-md bg-amber-50 p-2 text-[11px] text-amber-900">
          <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
          <span>
            Este módulo no está en el flujo recomendado para tu modalidad <strong>{modalidad || '—'}</strong>.
            Igual lo puedes usar; queda como complemento opcional.
          </span>
        </div>
      )}

      <ol className="mt-2 flex flex-wrap items-center gap-1 text-xs">
        {flujo.map((id, i) => {
          const m = MODULOS_META[id];
          const esActual = id === actual;
          const yaPasado = idxActual >= 0 && i < idxActual;
          const pendiente = idxActual >= 0 && i > idxActual;
          let estilo = 'border-slate-200 bg-white text-slate-500';
          if (esActual) estilo = 'border-amber-300 bg-amber-50 text-amber-800 ring-1 ring-amber-300';
          else if (yaPasado) estilo = 'border-emerald-200 bg-emerald-50 text-emerald-700';
          else if (pendiente) estilo = 'border-slate-200 bg-white text-slate-400';

          return (
            <li key={id} className="flex items-center gap-1">
              <Link
                href={m.ruta}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 transition hover:opacity-90 ${estilo}`}
                title={esActual ? `Estás aquí: ${m.nombre}` : `Ir a ${m.nombre}`}
              >
                <span className="text-[10px]">{m.emoji}</span>
                <span className="font-medium">{m.nombre.replace(' / Pre-validación', '').replace(' Conectado', '')}</span>
                {yaPasado && <span className="text-emerald-600">✓</span>}
                {esActual && <span className="text-[9px] uppercase tracking-wider">aquí</span>}
              </Link>
              {i < flujo.length - 1 && <ChevronRight className="h-3 w-3 flex-shrink-0 text-slate-300" />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
