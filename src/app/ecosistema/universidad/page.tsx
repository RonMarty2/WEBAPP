'use client';

import Link from 'next/link';
import { EcosystemNav } from '@/components/ecosistema/EcosystemNav';
import { ProgressTracker } from '@/components/ecosistema/ProgressTracker';
import { useEcosistema } from '@/lib/ecosistema/mock-state';
import { getUniversidadPlatforms } from '@/lib/ecosistema/platforms';

export default function UniversidadHub() {
  const { user, progreso, artefactos } = useEcosistema();
  const plataformas = getUniversidadPlatforms();

  return (
    <>
      <EcosystemNav />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-wider text-sky-600">Universidad</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Hola{user ? `, ${user.nombre.split(' ')[0]}` : ''}.
          </h1>
          <p className="mt-2 text-slate-600">
            Continúa donde lo dejaste. Cada plataforma guarda tu progreso y los artefactos que vas construyendo.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {plataformas.map(plataforma => {
            const prog = progreso.find(p => p.platformId === plataforma.id);
            const artefactosCount = artefactos.filter(a => a.platformId === plataforma.id).length;
            return (
              <Link
                key={plataforma.id}
                href={plataforma.ruta}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{plataforma.nombre}</h2>
                    <p className="mt-1 text-sm text-slate-600">{plataforma.tagline}</p>
                  </div>
                  <span
                    className="grid h-12 w-12 place-items-center rounded-xl text-xl"
                    style={{ backgroundColor: `${plataforma.colorAccent}15`, color: plataforma.colorAccent }}
                  >
                    {plataforma.icono === 'TrendingUp' && '📈'}
                    {plataforma.icono === 'Compass' && '🧭'}
                    {plataforma.icono === 'Target' && '🎯'}
                    {plataforma.icono === 'Megaphone' && '📣'}
                  </span>
                </div>
                {prog && (
                  <>
                    <ProgressTracker porcentaje={prog.porcentaje} color={plataforma.colorAccent} />
                    <p className="mt-3 text-xs text-slate-500">
                      Última clase: <span className="font-medium text-slate-700">{prog.ultimaClase}</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Artefactos creados: <span className="font-medium text-slate-700">{artefactosCount}</span>
                    </p>
                  </>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-10 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-amber-100 text-xl">✨</span>
            <div className="flex-1">
              <p className="font-semibold text-amber-900">¿Listo para tu proyecto académico?</p>
              <p className="mt-1 text-sm text-amber-900/80">
                Llevas {progreso.length} plataformas trabajadas. El Generador puede importar todo eso
                a las fases de tu tesis o proyecto de grado.
              </p>
            </div>
            <Link
              href="/ecosistema/generador"
              className="rounded-full bg-amber-600 px-5 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              Ir al Generador →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
