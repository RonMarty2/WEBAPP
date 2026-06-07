'use client';

/**
 * Bloque "Siguiente paso →" — botón grande al final de un reporte que lleva
 * al próximo módulo del flujo según la modalidad del estudiante.
 *
 * Si el módulo actual es el último del flujo (Generador), muestra un mensaje
 * de cierre en vez del botón.
 *
 * **Auto-pre-llenado para plan Pro/Elite**: si el estudiante es premium y
 * recibimos `tituloContexto`, agregamos `?titulo=...&desde=<actual>` a la
 * URL del próximo módulo, para que el formulario "Nueva ..." llegue ya
 * cargado. Los alumnos de cátedra (plan Estándar) llegan vacíos y siguen
 * el proceso a mano — son las dos rutas que el dueño del SaaS pidió.
 */

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { flujoParaModalidad, siguienteModulo, type ModuloId } from '@/lib/flujos/por-modalidad';
import { usePlan, esPremium } from '@/lib/auth/usePlan';

interface Props {
  actual: ModuloId;
  modalidad: string | null | undefined;
  /**
   * Título o tema del proyecto actual. Si el estudiante es Pro/Elite, se
   * pasa al próximo módulo vía URL para que el formulario llegue lleno.
   */
  tituloContexto?: string | null;
}

export function SiguienteModulo({ actual, modalidad, tituloContexto }: Props) {
  const flujo = flujoParaModalidad(modalidad);
  const next = siguienteModulo(flujo, actual);
  const plan = usePlan();
  const premium = esPremium(plan);

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

  // Plan Pro/Elite + título disponible → arrastramos el título por URL para
  // que el módulo destino lo precargue en su formulario "Nuevo X".
  const llevarContexto = premium && !!tituloContexto?.trim();
  const href = llevarContexto
    ? `${next.ruta}?titulo=${encodeURIComponent(tituloContexto!.trim())}&desde=${actual}`
    : next.ruta;

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">¿Y ahora?</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Siguiente paso: <span className="text-lg">{next.emoji}</span> {next.nombre}
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            {llevarContexto
              ? <>Continúa en el módulo recomendado. <span className="inline-flex items-center gap-1 font-medium text-violet-700"><Sparkles className="h-3 w-3" /> Llegará con tu tema ya cargado.</span></>
              : 'Continúa en el módulo recomendado para tu modalidad.'}
          </p>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Ir a {next.nombre} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
