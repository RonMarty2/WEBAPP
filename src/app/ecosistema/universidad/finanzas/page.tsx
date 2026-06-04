import { PlatformShell } from '@/components/ecosistema/PlatformShell';
import { getPlatform } from '@/lib/ecosistema/platforms';
import { ARTEFACTO_FINANZAS } from '@/lib/ecosistema/mock-data';

export default function FinanzasPlatform() {
  const platform = getPlatform('finanzas')!;
  const datos = ARTEFACTO_FINANZAS.contenido as Record<string, number>;

  return (
    <PlatformShell platform={platform}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{platform.nombre}</h1>
        <p className="mt-2 text-slate-600">{platform.descripcionCorta}</p>
      </header>

      <section className="mb-10 rounded-3xl border border-emerald-200 bg-emerald-50/50 p-8">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900">
            Tu último análisis
          </span>
        </div>
        <h2 className="mt-3 text-xl font-bold text-slate-900">{ARTEFACTO_FINANZAS.titulo}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Metric label="VAN" valor={`Bs. ${datos.van.toLocaleString('es-BO')}`} positivo />
          <Metric label="TIR" valor={`${(datos.tir * 100).toFixed(1)}%`} positivo />
          <Metric label="B/C" valor={datos.bc.toFixed(2)} positivo={datos.bc > 1} />
          <Metric label="Payback" valor={`${datos.paybackMeses} meses`} positivo />
        </div>
        <a
          href="https://simulador-pro.tudominio.com"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
        >
          Abrir mi SimuladorPRO →
        </a>
        <p className="mt-3 text-xs text-emerald-900/70">
          SimuladorPRO se abre como herramienta independiente. Cuando guardes, tu resultado vuelve aquí
          y queda listo para importarse al Generador.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Clases del curso</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {['Conceptos básicos: VAN y TIR', 'Flujo de caja proyectado', 'Tasa de descuento adecuada', 'Análisis de sensibilidad', 'Escenarios optimista/base/pesimista', 'Punto de equilibrio'].map((titulo, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-emerald-600">Clase {i + 1}</p>
              <p className="mt-1 font-medium text-slate-900">{titulo}</p>
              <p className="mt-2 text-xs text-slate-500">{i < 5 ? 'Completada ✓' : 'En curso'}</p>
            </div>
          ))}
        </div>
      </section>
    </PlatformShell>
  );
}

function Metric({ label, valor, positivo }: { label: string; valor: string; positivo: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${positivo ? 'text-emerald-700' : 'text-rose-700'}`}>{valor}</p>
    </div>
  );
}
