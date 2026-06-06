'use client';

import Link from 'next/link';
import { EcosystemNav } from '@/components/ecosistema/EcosystemNav';
import { useEcosistema } from '@/lib/ecosistema/mock-state';
import { getPlatform } from '@/lib/ecosistema/platforms';

export default function GeneradorLanding() {
  const { user, artefactos } = useEcosistema();
  const conectado = user !== null;

  return (
    <>
      <EcosystemNav />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-amber-700">Mundo 2 · Generador</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Tu proyecto académico, con tus datos.
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            El Generador toma lo que aprendiste y trabajaste en las plataformas educativas
            y lo consolida en un documento académico con formato UMSS o UNIFRANZ.
          </p>
        </div>

        {conectado ? (
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900">
                ✓ Detectados en tu Universidad
              </span>
            </div>
            <p className="mt-3 text-slate-700">
              Encontramos <strong>{artefactos.length} artefactos</strong> listos para importarse a tu proyecto.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {artefactos.map(a => {
                const plat = getPlatform(a.platformId);
                return (
                  <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium" style={{ color: plat?.colorAccent }}>
                      {plat?.nombre}
                    </p>
                    <p className="mt-1 font-medium text-slate-900">{a.titulo}</p>
                    <p className="mt-1 text-xs text-slate-500">{a.preview}</p>
                  </div>
                );
              })}
            </div>
            <Link
              href="/ecosistema/generador/wizard"
              className="mt-6 inline-flex rounded-full bg-amber-600 px-6 py-3 font-medium text-white hover:bg-amber-700"
            >
              Empezar mi proyecto importando estos artefactos →
            </Link>
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-slate-700">Necesitas iniciar sesión para que el Generador detecte tu trabajo en las plataformas.</p>
            <Link href="/ecosistema/login" className="mt-4 inline-flex rounded-full bg-slate-900 px-6 py-3 text-white">
              Iniciar sesión
            </Link>
          </section>
        )}

        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-slate-900">¿No vienes de la Universidad?</h2>
          <p className="text-slate-600">El Generador también funciona empezando desde cero. Te guiamos por cada fase.</p>
          <Link
            href="/ecosistema/generador/wizard"
            className="mt-4 inline-flex rounded-full border border-slate-300 bg-white px-6 py-3 font-medium text-slate-900 hover:bg-slate-50"
          >
            Empezar desde cero →
          </Link>
        </section>
      </section>
    </>
  );
}
