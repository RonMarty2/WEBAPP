import Link from 'next/link';

export default function DefensaDashboard() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Defensa de Tesis y Proyectos</h1>
        <p className="mt-2 text-slate-600">
          Prepárate para el tribunal con preguntas reales, respuestas modelo y estrategias para
          manejar tus puntos débiles. La defensa se gana antes de entrar a la sala.
        </p>
      </header>

      <section className="rounded-3xl border border-indigo-200 bg-indigo-50/50 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Tu defensa en preparación</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">Plan de negocio Cafetería La Orquídea — UMSS</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs text-slate-500">Categoría más frecuente</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">Metodología</p>
            <p className="text-xs text-slate-500">~28% de preguntas tribunal</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs text-slate-500">Duración promedio</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">30-45 min</p>
            <p className="text-xs text-slate-500">20 exposición · 25 preguntas</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs text-slate-500">Tasa de aprobación con preparación</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">92%</p>
            <p className="text-xs text-slate-500">vs 71% sin preparación previa</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Galería de defensas resueltas</h3>
        <Link
          href="/ecosistema/universidad/defensa/casos"
          className="block rounded-2xl border border-slate-200 bg-white p-5 hover:border-indigo-300"
        >
          <p className="font-medium text-slate-900">5 defensas reales con tribunal en vivo</p>
          <p className="mt-1 text-xs text-slate-500">
            UMSS, UMSA, UPB, UAJMS, Univalle. 18 preguntas tribunal por caso con respuesta modelo,
            puntos débiles y fortalezas.
          </p>
        </Link>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Próximos pasos sugeridos</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Link
            href="/ecosistema/universidad/defensa/clases"
            className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-indigo-300"
          >
            <p className="font-medium text-slate-900">Estudiar las 4 clases base</p>
            <p className="mt-1 text-xs text-slate-500">
              Anatomía del tribunal, técnica del puente, metodología y postura
            </p>
          </Link>
          <Link
            href="/ecosistema/universidad/defensa/simulacro"
            className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-indigo-300"
          >
            <p className="font-medium text-slate-900">Probar el simulacro</p>
            <p className="mt-1 text-xs text-slate-500">Pregunta aleatoria del banco, tú respondes, comparas con la modelo</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
