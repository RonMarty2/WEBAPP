'use client';

import Link from 'next/link';
import { PlatformShell } from '@/components/ecosistema/PlatformShell';
import { getPlatform } from '@/lib/ecosistema/platforms';
import { ARTEFACTO_MARKETING } from '@/lib/ecosistema/mock-data';
import { TutorIA } from '@/components/tutor-ia/TutorIA';

interface CanalData {
  canal: string;
  presupuesto: number;
  alcance: number;
  cpl: number;
}

interface CalendarioItem {
  semana: number;
  accion: string;
}

export default function MarketingPlatform() {
  const platform = getPlatform('marketing')!;
  const datos = ARTEFACTO_MARKETING.contenido as {
    segmento: string;
    canales: CanalData[];
    calendario: CalendarioItem[];
  };
  const totalPresupuesto = datos.canales.reduce((acc, c) => acc + c.presupuesto, 0);
  const totalAlcance = datos.canales.reduce((acc, c) => acc + c.alcance, 0);

  return (
    <PlatformShell platform={platform}>
      <header className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{platform.nombre}</h1>
            <p className="mt-2 text-slate-600">{platform.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/ecosistema/universidad/marketing/calculadora-reactiva"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              🎚️ ROAS + embudo interactivo
            </Link>
            <Link
              href="/ecosistema/universidad/marketing/casos"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-rose-300 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
            >
              🇧🇴 Ver 5 casos bolivianos →
            </Link>
          </div>
        </div>
      </header>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-xs font-medium text-rose-700">Segmento objetivo</p>
          <p className="mt-1 font-bold text-slate-900">{datos.segmento}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Presupuesto mensual</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">Bs. {totalPresupuesto.toLocaleString('es-BO')}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Alcance estimado</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalAlcance.toLocaleString('es-BO')} usuarios</p>
        </div>
      </section>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Distribución por canal</h2>
        <div className="space-y-4">
          {datos.canales.map(c => (
            <div key={c.canal} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900">{c.canal}</p>
                <p className="font-semibold text-slate-900">Bs. {c.presupuesto.toLocaleString('es-BO')}/mes</p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Alcance</p>
                  <p className="font-medium text-slate-900">{c.alcance.toLocaleString('es-BO')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">CPL (costo por lead)</p>
                  <p className="font-medium text-slate-900">Bs. {c.cpl}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">% del presupuesto</p>
                  <p className="font-medium text-slate-900">{((c.presupuesto / totalPresupuesto) * 100).toFixed(0)}%</p>
                </div>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-rose-500" style={{ width: `${(c.presupuesto / totalPresupuesto) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          Alcance y CPL provienen de Meta Ads API + TikTok Ads API + Google Ads Insights (en producción).
        </p>
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">¿Quieres entender el porqué?</p>
              <p className="mt-1 text-sm text-slate-600">
                El tutor te propone 3 caminos para repartir el presupuesto por canal según objetivo, CPL y tipo de cliente.
              </p>
            </div>
            <TutorIA
              modulo="marketing"
              herramienta="canales:asignacion-presupuesto"
              campo="asignación del presupuesto por canal"
              etiqueta="Tutor: ¿en qué canal invertir más?"
              variante="amplio"
              contexto={`Plan de marketing del sector cafetería en Cochabamba, Bolivia. Segmento: ${datos.segmento}. Presupuesto mensual total: Bs. ${totalPresupuesto.toLocaleString('es-BO')}. Alcance estimado total: ${totalAlcance.toLocaleString('es-BO')} usuarios.`}
              contenidoActual={datos.canales
                .map(c => `${c.canal}: Bs. ${c.presupuesto.toLocaleString('es-BO')}/mes (${((c.presupuesto / totalPresupuesto) * 100).toFixed(0)}% del presupuesto) · alcance ${c.alcance.toLocaleString('es-BO')} · CPL Bs. ${c.cpl}`)
                .join('\n')}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Calendario editorial — Primer mes</h2>
        <ol className="space-y-3">
          {datos.calendario.map(item => (
            <li key={item.semana} className="flex items-start gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">
                S{item.semana}
              </span>
              <div className="flex-1 rounded-xl border border-slate-100 p-3">
                <p className="text-sm text-slate-700">{item.accion}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">¿Quieres entender el porqué?</p>
              <p className="mt-1 text-sm text-slate-600">
                El tutor te muestra 3 caminos para ordenar las acciones del primer mes y priorizar qué lanzar primero.
              </p>
            </div>
            <TutorIA
              modulo="marketing"
              herramienta="calendario:planificacion"
              campo="planificación de acciones del primer mes"
              etiqueta="Tutor: orden de acciones"
              variante="amplio"
              contexto={`Calendario editorial del primer mes para el sector cafetería en Cochabamba, Bolivia. Segmento: ${datos.segmento}. Presupuesto mensual: Bs. ${totalPresupuesto.toLocaleString('es-BO')}.`}
              contenidoActual={datos.calendario
                .map(item => `Semana ${item.semana}: ${item.accion}`)
                .join('\n')}
            />
          </div>
        </div>
      </section>
    </PlatformShell>
  );
}
