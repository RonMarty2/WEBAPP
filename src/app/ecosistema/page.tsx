import Link from 'next/link';
import { EcosystemNav } from '@/components/ecosistema/EcosystemNav';
import { PlatformCard } from '@/components/ecosistema/PlatformCard';
import { PricingCard } from '@/components/ecosistema/PricingCard';
import { getUniversidadPlatforms, getPlatform, BUNDLE_PRECIO_MENSUAL } from '@/lib/ecosistema/platforms';

export default function EcosistemaLanding() {
  const plataformas = getUniversidadPlatforms();
  const generador = getPlatform('generador')!;

  return (
    <>
      <EcosystemNav />
      <section className="mx-auto max-w-7xl px-6 pt-[5rem] pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            🇧🇴 Hecho en Cochabamba para Latinoamérica
          </span>
          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-slate-900">
            Aprende las materias.
            <br />
            <span className="bg-gradient-to-r from-amber-500 via-rose-500 to-violet-500 bg-clip-text text-transparent">
              Tu proyecto sale como consecuencia.
            </span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Un ecosistema de plataformas educativas + un generador de tesis y proyectos de grado.
            Tú trabajas datos reales en cada materia. La IA solo consolida.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/ecosistema/login"
              className="rounded-full bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800"
            >
              Probar el demo
            </Link>
            <Link
              href="#plataformas"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 font-medium text-slate-900 hover:bg-slate-50"
            >
              Ver plataformas
            </Link>
          </div>
        </div>
      </section>

      <section id="plataformas" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-amber-600">Mundo 1 · Universidad</p>
            <h2 className="text-3xl font-bold text-slate-900">4 plataformas educativas</h2>
            <p className="mt-2 text-slate-600">Cada materia es una plataforma. Aprendes haciendo, no copiando.</p>
          </div>
          <div className="hidden text-right md:block">
            <p className="text-sm text-slate-500">Bundle completo</p>
            <p className="text-2xl font-bold text-slate-900">Bs. {BUNDLE_PRECIO_MENSUAL}/mes</p>
            <p className="text-xs text-slate-500">Las 4 plataformas + generador</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {plataformas.map((p, i) => (
            <PlatformCard key={p.id} platform={p} index={i} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-10">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-amber-700">Mundo 2 · Generador</p>
          <div className="grid items-end gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{generador.nombre}</h2>
              <p className="mt-3 text-lg text-amber-900/80">{generador.tagline}</p>
              <p className="mt-4 leading-relaxed text-slate-700">
                Importa el simulador financiero que armaste, tu estudio de mercado con datos reales,
                tu FODA cruzada, tu plan de marketing. La IA cose todo en un documento académico
                con el formato exacto de tu universidad (UMSS o UNIFRANZ).
              </p>
              <Link
                href={generador.ruta}
                className="mt-6 inline-flex rounded-full bg-amber-600 px-6 py-3 font-medium text-white hover:bg-amber-700"
              >
                Ver el generador
              </Link>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-white p-6">
              <p className="mb-4 text-sm font-medium text-amber-700">¿Cómo funciona?</p>
              <ol className="space-y-3 text-sm text-slate-700">
                <li className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">1</span>
                  <span>Aprendes y trabajas en cada plataforma educativa</span>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">2</span>
                  <span>Eliges tu universidad y modalidad (UMSS / UNIFRANZ)</span>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">3</span>
                  <span>El Generador importa tus artefactos a las fases correspondientes</span>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">4</span>
                  <span>La IA consolida en un documento LaTeX listo para defensa</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16" id="pricing">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Tres formas de empezar</h2>
          <p className="mt-2 text-slate-600">Standalone para una plataforma · Bundle para todas · Generador para tu proyecto académico.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <PricingCard
            nombre="Plataforma individual"
            precio={49}
            periodo="mes"
            descripcion="Acceso a una plataforma educativa específica."
            features={[
              'Una plataforma a elegir',
              'Clases ilimitadas',
              'Artefactos exportables (PDF, JSON)',
              'Soporte por correo',
            ]}
            cta="Elegir plataforma"
          />
          <PricingCard
            nombre="Bundle Universidad"
            precio={99}
            periodo="mes"
            descripcion="Las 4 plataformas educativas en una sola cuenta."
            features={[
              'Finanzas + Mercados + Estrategia + Marketing',
              'SimuladorPRO integrado',
              'APIs de mercado en vivo',
              'Soporte prioritario',
            ]}
            destacado
            cta="Empezar bundle"
          />
          <PricingCard
            nombre="Ecosistema completo"
            precio={199}
            periodo="mes"
            descripcion="Universidad + Generador. Para tesistas y consultores."
            features={[
              'Todo del Bundle Universidad',
              'Generador de proyectos UMSS/UNIFRANZ',
              'Exportación LaTeX/PDF ilimitada',
              'Consolidación con IA avanzada',
              'Asesoría 1:1 mensual',
            ]}
            cta="Hablar con ventas"
          />
        </div>
        <p className="mt-8 text-center text-sm text-slate-500">
          Plan estudiantil: 50% de descuento con correo institucional UMSS o UNIFRANZ.
        </p>
      </section>
    </>
  );
}
