import SimuladorEventos from '@/components/eventos-sorpresa/SimuladorEventos';

export const metadata = {
  title: 'Simulador de eventos · Estrategia Empresarial',
  description:
    'Simulación de decisiones estratégicas frente a eventos sorpresa. La IA evalúa cada turno con consecuencias y lecciones.',
};

export default function SimuladorEventosEstrategiaPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
          Estrategia Empresarial · Modo simulación
        </p>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Simulación de decisiones estratégicas
        </h1>
        <p className="max-w-3xl text-sm text-slate-600 sm:text-base">
          Te lanzamos eventos sorpresa, eliges una respuesta, la IA te evalúa.
          Aprende decidiendo en lugar de leyendo. Cada turno cuenta: tu puntaje
          se acumula y la IA recuerda tu historial para mantener coherencia.
        </p>
      </header>
      <SimuladorEventos modulo="estrategia" />
    </div>
  );
}
