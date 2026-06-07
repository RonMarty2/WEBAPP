'use client';

/**
 * Bloque "Siguiente paso →" — botón grande al final de un reporte que lleva
 * al próximo módulo del flujo según la modalidad del estudiante.
 *
 * Si el módulo actual es el último del flujo (Generador), muestra un mensaje
 * de cierre en vez del botón.
 */

import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { flujoParaModalidad, siguienteModulo, type ModuloId } from '@/lib/flujos/por-modalidad';

interface Props {
  actual: ModuloId;
  modalidad: string | null | undefined;
}

export function SiguienteModulo({ actual, modalidad }: Props) {
  const flujo = flujoParaModalidad(modalidad);
  const next = siguienteModulo(flujo, actual);

  if (!next) {
    return (
      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
        <p className="mt-2 text-sm font-semibold text-emerald-900">Llegaste al final del flujo</p>
        <p className="mt-1 text-xs text-emerald-800">
          {actual === 'generador'
            ? 'El documento ya está consolidado. Exporta a Markdown, .tex o ZIP Overleaf cuando quieras.'
            : `Para tu modalidad${modalidad ? ` (${modalidad})` : ''}, este era el último módulo recomendado.`}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">¿Y ahora?</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Siguiente paso: <span className="text-lg">{next.emoji}</span> {next.nombre}
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            Continúa en el módulo recomendado para tu modalidad.
          </p>
        </div>
        <Link
          href={next.ruta}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Ir a {next.nombre} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
