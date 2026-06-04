'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EcosystemNav } from '@/components/ecosistema/EcosystemNav';

const SIMULADOR_URL = 'https://simulador-pro-seven.vercel.app';

export default function FinanzasPlatform() {
  const [errorIframe, setErrorIframe] = useState(false);

  return (
    <>
      <EcosystemNav />

      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs sm:px-6">
        <div className="flex items-center gap-2">
          <Link
            href="/ecosistema/universidad"
            className="text-slate-500 transition hover:text-slate-900"
          >
            Universidad
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-slate-900">Finanzas para Emprendedores</span>
          <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
            simuladorPRO
          </span>
        </div>
        <a
          href={SIMULADOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 transition hover:text-slate-900"
          title="Abrir en pestaña nueva"
        >
          Abrir aparte ↗
        </a>
      </div>

      <div className="relative w-full bg-white" style={{ height: 'calc(100vh - 110px)' }}>
        {!errorIframe ? (
          <iframe
            src={SIMULADOR_URL}
            className="h-full w-full border-0"
            title="Simulador de Proyectos de Inversión"
            allow="clipboard-read; clipboard-write; fullscreen"
            onError={() => setErrorIframe(true)}
          />
        ) : (
          <FallbackIframe />
        )}
      </div>
    </>
  );
}

function FallbackIframe() {
  return (
    <div className="mx-auto max-w-md p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-2xl">
        🔒
      </div>
      <h2 className="mt-4 text-base font-semibold text-slate-900">
        El simuladorPRO no permite cargarse aquí
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Probablemente tiene Vercel Authentication activado o un header
        <code className="mx-1 rounded bg-slate-100 px-1 py-0.5 text-xs">X-Frame-Options</code>
        que bloquea el embedding.
      </p>
      <a
        href={SIMULADOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Abrir el simuladorPRO en pestaña nueva ↗
      </a>
    </div>
  );
}
