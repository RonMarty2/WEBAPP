'use client';

import Link from 'next/link';
import { EcosystemNav } from '@/components/ecosistema/EcosystemNav';
import { useEcosistema } from '@/lib/ecosistema/mock-state';
import { PROYECTO_UNIFRANZ_DEMO } from '@/lib/ecosistema/mock-data';

export default function GeneradorWorkspace() {
  const { artefactos } = useEcosistema();
  const proyecto = PROYECTO_UNIFRANZ_DEMO;
  const completadas = proyecto.fases.filter(f => f.estado === 'completada').length;
  const total = proyecto.fases.length;

  return (
    <>
      <EcosystemNav />
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-amber-700">
            UNIFRANZ · Pre-Factibilidad
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{proyecto.titulo}</h1>
          <p className="mt-2 text-slate-600">
            {completadas} de {total} fases completas — el {Math.round((completadas / total) * 100)}% importado desde tus plataformas.
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-amber-500" style={{ width: `${(completadas / total) * 100}%` }} />
          </div>
        </div>

        <div className="space-y-3">
          {proyecto.fases.map(f => {
            const artefacto = artefactos.find(a => a.id === f.fuenteArtefacto);
            const colorClasses =
              f.estado === 'completada' ? 'bg-emerald-100 text-emerald-700' :
              f.estado === 'en-progreso' ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-700';
            const btnClasses =
              f.estado === 'completada' ? 'bg-emerald-100 text-emerald-800' :
              f.estado === 'en-progreso' ? 'bg-amber-100 text-amber-800' :
              'bg-slate-100 text-slate-700';
            return (
              <div key={f.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-sm font-bold ${colorClasses}`}>
                  {f.numero}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{f.titulo}</p>
                  {f.contenidoPreview && (
                    <p className="mt-1 text-xs text-slate-500">{f.contenidoPreview}</p>
                  )}
                  {artefacto && (
                    <p className="mt-1 text-xs font-medium text-emerald-700">
                      ✓ Importado desde {artefacto.platformId}
                    </p>
                  )}
                </div>
                <button className={`rounded-full px-4 py-1.5 text-xs font-medium ${btnClasses}`}>
                  {f.estado === 'completada' ? 'Ver / editar' : f.estado === 'en-progreso' ? 'Continuar' : 'Comenzar'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <p className="font-semibold text-amber-900">¿Listo para consolidar?</p>
          <p className="mt-1 text-sm text-amber-900/80">
            Cuando todas las fases estén completas, la IA cose tu documento final en formato UNIFRANZ.
          </p>
          <Link
            href="/ecosistema/generador/consolidar"
            className="mt-4 inline-flex rounded-full bg-amber-600 px-6 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Pre-visualizar consolidación →
          </Link>
        </div>
      </section>
    </>
  );
}
