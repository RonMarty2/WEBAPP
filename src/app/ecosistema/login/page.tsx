'use client';

import { useRouter } from 'next/navigation';
import { EcosystemNav } from '@/components/ecosistema/EcosystemNav';
import { loginMock } from '@/lib/ecosistema/mock-auth';
import { useEcosistema } from '@/lib/ecosistema/mock-state';

export default function LoginPage() {
  const router = useRouter();
  const { refrescarUsuario } = useEcosistema();

  const entrar = (perfil: 'estudiante' | 'emprendedor') => {
    loginMock(perfil);
    refrescarUsuario();
    router.push('/ecosistema/universidad');
  };

  return (
    <>
      <EcosystemNav />
      <section className="mx-auto max-w-md px-6 py-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-slate-900">Entra al ecosistema</h1>
          <p className="mt-2 text-sm text-slate-600">
            En el mockup elige uno de los dos perfiles demo. En producción usarás Google o tu correo institucional.
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => entrar('estudiante')}
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left hover:border-slate-900 hover:bg-slate-50"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-sky-100 text-lg">🎓</span>
              <div>
                <p className="font-semibold text-slate-900">Ana Quispe Mamani</p>
                <p className="text-xs text-slate-600">Estudiante UNIFRANZ · Ing. Comercial</p>
              </div>
            </button>

            <button
              onClick={() => entrar('emprendedor')}
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left hover:border-slate-900 hover:bg-slate-50"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-lg">💼</span>
              <div>
                <p className="font-semibold text-slate-900">Marcos Rojas</p>
                <p className="text-xs text-slate-600">Emprendedor · Café La Orquídea</p>
              </div>
            </button>
          </div>

          <p className="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            Una sola cuenta SSO te da acceso a las 4 plataformas educativas y al Generador.
            Tu progreso y artefactos viajan contigo automáticamente.
          </p>
        </div>
      </section>
    </>
  );
}
