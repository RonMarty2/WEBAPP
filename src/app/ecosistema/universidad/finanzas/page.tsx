'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { EcosystemNav } from '@/components/ecosistema/EcosystemNav';

const SIMULADOR_URL = 'https://simulador-pro-seven.vercel.app';
const TIMEOUT_MS = 4000;

export default function FinanzasPlatform() {
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'bloqueado'>('cargando');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setEstado(prev => (prev === 'cargando' ? 'bloqueado' : prev));
    }, TIMEOUT_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onIframeLoad = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setEstado('ok');
  };

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

      {estado === 'bloqueado' ? (
        <FallbackIframe />
      ) : (
        <div className="relative w-full bg-white" style={{ height: 'calc(100vh - 110px)' }}>
          {estado === 'cargando' && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
              <div className="text-sm text-slate-500">Cargando simuladorPRO…</div>
            </div>
          )}
          <iframe
            src={SIMULADOR_URL}
            className="h-full w-full border-0"
            title="Simulador de Proyectos de Inversión"
            allow="clipboard-read; clipboard-write; fullscreen"
            onLoad={onIframeLoad}
          />
        </div>
      )}
    </>
  );
}

function FallbackIframe() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="rounded-lg border border-amber-300 bg-amber-50/60 p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-amber-200 text-lg">
            ⚠️
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-amber-900">
              El simuladorPRO no permite cargarse aquí
            </h2>
            <p className="mt-1 text-sm text-amber-900/80">
              Está protegido por <strong>Vercel Authentication</strong>. Mientras esté activado,
              ningún visitante puede ver el simulador desde dentro de webapp.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-md border border-amber-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Cómo arreglarlo (1 minuto)
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">
            <li>
              Ve a{' '}
              <a
                href="https://vercel.com/ronaldmartinezjimenes-2093s-projects/simulador-pro/settings/deployment-protection"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-amber-900 underline"
              >
                Vercel → simulador-pro → Deployment Protection
              </a>
            </li>
            <li>
              Baja el switch <strong>&ldquo;Require Log In&rdquo;</strong> a OFF
            </li>
            <li>
              <strong>Presiona el botón Save</strong> arriba a la derecha (esto es lo que faltó la
              vez anterior)
            </li>
            <li>Recarga esta página</li>
          </ol>
          <p className="mt-3 rounded bg-slate-50 p-2 text-xs text-slate-600">
            Tu simuladorPRO YA tiene su propio login (Supabase + Google). La protección de Vercel
            encima es redundante y bloquea todo, incluido este iframe.
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <p className="text-sm font-medium text-slate-900">
            Mientras tanto, abre el simuladorPRO en pestaña nueva
          </p>
          <p className="text-xs text-slate-500">Funciona normal porque tú sí tienes acceso</p>
        </div>
        <a
          href={SIMULADOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Abrir simuladorPRO ↗
        </a>
      </div>
    </div>
  );
}
