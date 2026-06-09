import SimuladorEventos from '@/components/eventos-sorpresa/SimuladorEventos';

export const metadata = {
  title: 'Simulador de eventos · Idea de Negocio',
  description:
    'Simulación de decisiones de validación de idea frente a eventos sorpresa. La IA evalúa cada turno con consecuencias y lecciones.',
};

export default function SimuladorEventosIdeaPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
          Idea de Negocio · Modo simulación
        </p>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Simulación de decisiones tempranas
        </h1>
        <p className="max-w-3xl text-sm text-slate-600 sm:text-base">
          Te lanzamos eventos sorpresa, eliges una respuesta, la IA te evalúa.
          Aprende decidiendo en lugar de leyendo. Pivotes, copias de competencia,
          oportunidades virales y subidas de insumos: cada turno te entrena.
        </p>
      </header>
      <SimuladorEventos modulo="idea" />
    </div>
  );
}
