import Link from 'next/link';
import { ARTEFACTO_MERCADOS } from '@/lib/ecosistema/mock-data';

export default function MercadosDashboard() {
  const datos = ARTEFACTO_MERCADOS.contenido as Record<string, number>;
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Investigación de Mercados</h1>
        <p className="mt-2 text-slate-600">
          Aprende a tomar decisiones con datos reales. Cada clase te deja un artefacto utilizable en tu proyecto.
        </p>
      </header>

      <section className="rounded-3xl border border-sky-200 bg-sky-50/50 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Tu estudio en curso</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">{ARTEFACTO_MERCADOS.titulo}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs text-slate-500">Tamaño de muestra</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{datos.tamanoMuestra}</p>
            <p className="text-xs text-slate-500">IC 95% · margen 5%</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs text-slate-500">Demanda potencial</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{datos.demandaPotencial.toLocaleString('es-BO')}</p>
            <p className="text-xs text-slate-500">clientes/mes</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs text-slate-500">Demanda insatisfecha</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{datos.demandaInsatisfecha.toLocaleString('es-BO')}</p>
            <p className="text-xs text-slate-500">oportunidad de mercado</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Próximos pasos sugeridos</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Link href="/ecosistema/universidad/mercados/clases" className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-sky-300">
            <p className="font-medium text-slate-900">Completar clase: Análisis de competencia</p>
            <p className="mt-1 text-xs text-slate-500">15 min · agrega contenido al artefacto</p>
          </Link>
          <Link href="/ecosistema/universidad/mercados/resultados" className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-sky-300">
            <p className="font-medium text-slate-900">Ver tabulación cruzada</p>
            <p className="mt-1 text-xs text-slate-500">Gráficos listos para tu proyecto</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
