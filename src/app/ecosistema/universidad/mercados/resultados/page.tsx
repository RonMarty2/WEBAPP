import { ARTEFACTO_MERCADOS } from '@/lib/ecosistema/mock-data';

interface Segmento {
  nombre: string;
  porcentaje: number;
  edad: string;
}

interface Competidor {
  nombre: string;
  share: number;
  ubicacion: string;
}

export default function ResultadosMercados() {
  const datos = ARTEFACTO_MERCADOS.contenido as {
    demandaPotencial: number;
    demandaReal: number;
    demandaInsatisfecha: number;
    googleTrendsScore: number;
    segmentos: Segmento[];
    competidores: Competidor[];
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Resultados de la investigación</h1>
        <p className="mt-2 text-slate-600">
          Gráficos vectoriales listos para tu proyecto (en LaTeX se exportan como pgfplots).
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Stat label="Demanda potencial" valor={datos.demandaPotencial} sufijo="clientes/mes" />
        <Stat label="Demanda real cubierta" valor={datos.demandaReal} sufijo="clientes/mes" />
        <Stat label="Demanda insatisfecha" valor={datos.demandaInsatisfecha} sufijo="oportunidad" highlight />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-2 font-semibold text-slate-900">Segmentación del público objetivo</h2>
        <p className="mb-6 text-sm text-slate-600">Distribución del mercado por grupo etario (n = 384).</p>
        <div className="space-y-3">
          {datos.segmentos.map(s => (
            <div key={s.nombre}>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">{s.nombre} ({s.edad})</span>
                <span className="font-semibold text-slate-900">{s.porcentaje}%</span>
              </div>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${s.porcentaje}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-2 font-semibold text-slate-900">Análisis de competencia</h2>
        <p className="mb-6 text-sm text-slate-600">Participación de mercado de los principales actores.</p>
        <div className="grid gap-3">
          {datos.competidores.map(c => (
            <div key={c.nombre} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
              <div>
                <p className="font-medium text-slate-900">{c.nombre}</p>
                <p className="text-xs text-slate-500">{c.ubicacion}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">{(c.share * 100).toFixed(0)}%</p>
                <p className="text-xs text-slate-500">market share</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-sky-200 bg-sky-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Datos externos integrados</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <DataChip label="Google Trends (cafetería Cochabamba)" valor={`${datos.googleTrendsScore}/100`} />
          <DataChip label="Meta Ads (interés café Bolivia)" valor="2.4M usuarios" />
          <DataChip label="TikTok Ads (#cafedealtura)" valor="18K creators" />
        </div>
        <p className="mt-4 text-xs text-sky-900/70">
          En producción, estos números vendrán en vivo de las APIs de Google, Meta y TikTok.
        </p>
      </section>
    </div>
  );
}

function Stat({ label, valor, sufijo, highlight }: { label: string; valor: number; sufijo: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${highlight ? 'text-emerald-700' : 'text-slate-900'}`}>
        {valor.toLocaleString('es-BO')}
      </p>
      <p className="text-xs text-slate-500">{sufijo}</p>
    </div>
  );
}

function DataChip({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{valor}</p>
    </div>
  );
}
