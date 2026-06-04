'use client';

import Link from 'next/link';
import { EcosystemNav } from '@/components/ecosistema/EcosystemNav';
import { IAConsolidacionPreview } from '@/components/ecosistema/IAConsolidacionPreview';

export default function GeneradorConsolidar() {
  return (
    <>
      <EcosystemNav />
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <Link href="/ecosistema/generador/workspace" className="text-sm text-slate-500 hover:text-slate-900">
            ← Volver al workspace
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Consolidación con IA</h1>
          <p className="mt-2 text-slate-600">
            La IA toma todas tus fases (importadas + las que completaste) y las cose en un documento académico final.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <IAConsolidacionPreview />

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-3 font-semibold text-slate-900">Documento generado</h2>
            <div className="rounded-xl bg-slate-50 p-4 font-mono text-xs text-slate-700">
              <p className="font-bold">CAFETERÍA LA ORQUÍDEA</p>
              <p>Plan de Negocio · Pre-Factibilidad</p>
              <p className="mt-2 text-slate-500">UNIFRANZ Cochabamba · 2026</p>
              <hr className="my-3 border-slate-300" />
              <p className="font-semibold">Resumen Ejecutivo</p>
              <p className="mt-1">El presente plan presenta la propuesta de implementación de una cafetería especializada en la zona norte de Cochabamba. El análisis de mercado realizado con una muestra de 384 personas revela una demanda insatisfecha de 3,720 clientes/mes...</p>
              <p className="mt-3 text-slate-500">[114 páginas generadas]</p>
            </div>

            <div className="mt-5 space-y-2">
              <button className="w-full rounded-full bg-amber-600 py-3 font-medium text-white hover:bg-amber-700">
                Descargar PDF
              </button>
              <button className="w-full rounded-full border border-slate-300 bg-white py-3 font-medium text-slate-900 hover:bg-slate-50">
                Abrir en Overleaf (LaTeX)
              </button>
              <button className="w-full rounded-full border border-slate-300 bg-white py-3 font-medium text-slate-900 hover:bg-slate-50">
                Editar antes de exportar
              </button>
            </div>
          </div>
        </div>

        <section className="mt-10 rounded-3xl border border-sky-200 bg-sky-50 p-6">
          <p className="font-semibold text-sky-900">Trazabilidad: por qué este documento es defendible</p>
          <ul className="mt-3 space-y-1 text-sm text-sky-900/80">
            <li>· El estudio de mercado proviene de TU encuesta real con 384 respuestas (no inventada).</li>
            <li>· El análisis financiero proviene de TU simulación en SimuladorPRO (con tus parámetros).</li>
            <li>· El PESTEL y FODA los validaste en la plataforma de Estrategia con scoring guiado.</li>
            <li>· El plan de marketing se basa en datos reales de Meta Ads y TikTok Ads.</li>
            <li>· Si tu tutor pregunta "¿de dónde sacaste esto?", tienes evidencia en cada plataforma.</li>
          </ul>
        </section>
      </section>
    </>
  );
}
