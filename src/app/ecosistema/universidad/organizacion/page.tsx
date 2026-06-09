import Link from 'next/link';

export default function OrganizacionDashboard() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Organización & RRHH</h1>
        <p className="mt-2 text-slate-600">
          Arma la estructura interna de tu empresa con planilla real boliviana, organigrama editable
          y trámites legales claros. Cada herramienta te deja un artefacto reutilizable.
        </p>
      </header>

      <section className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Tu estructura en curso</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">Cafetería La Orquídea — Estructura organizacional</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs text-slate-500">Planilla mensual</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">Bs 28.450</p>
            <p className="text-xs text-slate-500">incluye aportes patronales</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs text-slate-500">Personas en planilla</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">5</p>
            <p className="text-xs text-slate-500">2 jornada completa · 3 medio tiempo</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs text-slate-500">Costo aportes patronales</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">25,04%</p>
            <p className="text-xs text-slate-500">sobre el salario líquido</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Galería de referencia</h3>
        <Link
          href="/ecosistema/universidad/organizacion/casos"
          className="block rounded-2xl border border-slate-200 bg-white p-5 hover:border-amber-300"
        >
          <p className="font-medium text-slate-900">5 estructuras organizacionales completas de Bolivia</p>
          <p className="mt-1 text-xs text-slate-500">
            Planilla real, FUNDEMPRESA, AFP Futuro/Previsión, SENASAG, branding interno. Mira primero,
            arma después.
          </p>
        </Link>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Próximos pasos sugeridos</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Link
            href="/ecosistema/universidad/organizacion/planilla"
            className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-amber-300"
          >
            <p className="font-medium text-slate-900">Calcular tu planilla mensual</p>
            <p className="mt-1 text-xs text-slate-500">
              Suma sueldos, aportes y provisión de aguinaldo en segundos
            </p>
          </Link>
          <Link
            href="/ecosistema/universidad/organizacion/organigrama"
            className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-amber-300"
          >
            <p className="font-medium text-slate-900">Armar tu organigrama</p>
            <p className="mt-1 text-xs text-slate-500">Define cargos, dependencias y cantidad de personas</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
