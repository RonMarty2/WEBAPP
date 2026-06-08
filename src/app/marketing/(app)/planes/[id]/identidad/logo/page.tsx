'use client';

/**
 * Generación de Logo (con IA) + Mockups (sin IA).
 *
 * Estructura: arriba está el área de logo (generar + ver alternativas
 * + elegir principal). Abajo, área de mockups (botón "Generar
 * aplicaciones" + grilla).
 */

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Sparkles, AlertCircle, ImageIcon, Check, Loader2, ArrowRight, ExternalLink } from 'lucide-react';
import type { IdentidadVisual, Mockup } from '@/types/identidad';

export default function PaginaLogo() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [identidad, setIdentidad] = useState<IdentidadVisual | null>(null);
  const [cargando, setCargando] = useState(true);
  const [conceptoExtra, setConceptoExtra] = useState('');
  const [generandoLogo, setGenerandoLogo] = useState(false);
  const [generandoMockups, setGenerandoMockups] = useState(false);
  const [error, setError] = useState('');
  const [errorMockup, setErrorMockup] = useState('');
  const [restantes, setRestantes] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/identidad/${params.id}`, { credentials: 'include' })
      .then(async (r) => {
        const d = await r.json();
        if (r.ok) setIdentidad(d.identidad);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const generarLogo = async () => {
    setGenerandoLogo(true);
    setError('');
    try {
      const res = await fetch(`/api/identidad/${params.id}/logo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ conceptoExtra: conceptoExtra.trim() || undefined }),
      });
      const d = await res.json();
      if (res.ok) {
        setIdentidad(d.identidad);
        if (typeof d.generaciones_restantes === 'number') setRestantes(d.generaciones_restantes);
      } else {
        setError(d.error || 'No se pudo generar el logo');
        if (Array.isArray(d.modelos_disponibles)) {
          setError(`${d.error}. Modelos disponibles: ${d.modelos_disponibles.join(', ')}`);
        }
      }
    } catch {
      setError('Error de conexión generando logo');
    } finally {
      setGenerandoLogo(false);
    }
  };

  const elegirPrincipal = async (url: string) => {
    const res = await fetch(`/api/identidad/${params.id}/logo`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ url }),
    });
    if (res.ok) {
      const d = await res.json();
      setIdentidad(d.identidad);
    }
  };

  const generarMockups = async () => {
    setGenerandoMockups(true);
    setErrorMockup('');
    try {
      const res = await fetch(`/api/identidad/${params.id}/mockups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });
      const d = await res.json();
      if (res.ok) {
        setIdentidad(d.identidad);
      } else {
        setErrorMockup(d.error || 'No se pudieron generar los mockups');
      }
    } catch {
      setErrorMockup('Error de conexión generando mockups');
    } finally {
      setGenerandoMockups(false);
    }
  };

  if (cargando) return <div className="mkt-muted py-10 text-center text-sm">Cargando…</div>;

  if (!identidad?.brief?.nombre || !identidad?.paleta_primario) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <div>
            <p><strong>Antes de generar logo, completa Brief y Paleta.</strong></p>
            <p className="mt-1">La IA necesita el contexto de marca + los colores para producir algo coherente.</p>
            <div className="mt-3 flex gap-2">
              {!identidad?.brief?.nombre && (
                <Link href={`/marketing/planes/${params.id}/identidad/brief`} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700">
                  Ir al Brief →
                </Link>
              )}
              {identidad?.brief?.nombre && !identidad?.paleta_primario && (
                <Link href={`/marketing/planes/${params.id}/identidad/paleta`} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700">
                  Ir a Paleta →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const alternativas = identidad.logo_alternativas ?? [];
  const mockups = (identidad.mockups ?? []) as Mockup[];

  return (
    <div className="mx-auto max-w-4xl pb-10">
      <Link href={`/marketing/planes/${params.id}/identidad`} className="mkt-muted inline-flex items-center gap-1 text-sm hover:text-rose-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver a Identidad
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="mkt-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Sparkles className="mkt-accent-text h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="mkt-accent-text text-xs font-semibold uppercase tracking-wider">Pasos 4 y 5</p>
          <h1 className="text-2xl font-bold tracking-tight">Logo y Aplicaciones</h1>
          <p className="mkt-muted mt-1 text-sm">
            Generar logo con IA + mockups de aplicación de tu marca.
          </p>
        </div>
      </header>

      {/* SECCIÓN LOGO */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Logo (con IA)</h2>
          {restantes !== null && (
            <span className="text-xs text-slate-500">{restantes} {restantes === 1 ? 'generación restante' : 'generaciones restantes'}</span>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Cada generación cuesta tokens reales de IA. Tu plan determina cuántas puedes hacer.
        </p>

        <label className="mt-4 block">
          <span className="text-xs font-medium text-slate-700">Dirección conceptual extra (opcional)</span>
          <textarea
            value={conceptoExtra}
            onChange={(e) => setConceptoExtra(e.target.value)}
            placeholder='Ej: "logo isotipo con forma de hoja de café estilizada", "tipográfico minimalista"'
            rows={2}
            className="mkt-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-xs focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
        </label>

        <button
          onClick={generarLogo}
          disabled={generandoLogo}
          className="mkt-btn-primary mt-3 inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium disabled:opacity-50"
        >
          {generandoLogo ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Generando…</> : <><Sparkles className="h-4 w-4" aria-hidden="true" /> Generar nueva alternativa</>}
        </button>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Alternativas */}
        {alternativas.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold text-slate-700">Alternativas generadas ({alternativas.length})</p>
            <p className="text-[11px] text-slate-500">Click en una para marcarla como principal.</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {alternativas.map((alt, i) => {
                const elegida = alt.url === identidad.logo_principal_url;
                return (
                  <button
                    key={i}
                    onClick={() => elegirPrincipal(alt.url)}
                    className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${elegida ? 'border-emerald-400' : 'border-slate-200 hover:border-rose-300'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={alt.url} alt={`Alternativa ${i + 1}`} className="h-full w-full object-contain bg-white p-2" />
                    {elegida && (
                      <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                        <Check className="h-3 w-3" aria-hidden="true" /> Principal
                      </span>
                    )}
                    <span className="absolute bottom-1 left-1 right-1 truncate rounded bg-slate-900/60 px-1.5 py-0.5 text-center text-[10px] text-white">
                      {alt.modelo}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {alternativas.length === 0 && (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-500">
            Aún no has generado ninguna alternativa. Aprieta el botón de arriba para crear la primera.
          </div>
        )}
      </section>

      {/* SECCIÓN MOCKUPS */}
      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Mockups de aplicación</h2>
          <span className="text-[10px] uppercase tracking-wider text-slate-400">SIN IA · cero costo</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Tarjeta, post de Instagram, empaque, polo, taza y banner. Aplicamos tu paleta y nombre. Se regenera todo cada vez.
        </p>

        <button
          onClick={generarMockups}
          disabled={generandoMockups}
          className="mkt-btn-ghost mt-3 inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium disabled:opacity-50"
        >
          {generandoMockups ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Generando…</> : <><ImageIcon className="h-4 w-4" aria-hidden="true" /> Generar / actualizar mockups</>}
        </button>

        {errorMockup && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span>{errorMockup}</span>
          </div>
        )}

        {mockups.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mockups.map((m, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.descripcion} className="block h-auto w-full" />
                <p className="border-t border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600">{m.descripcion}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer: ir al manual */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">¿Listo para descargar el manual?</p>
          <p className="text-xs text-slate-500">Compila todo lo decidido en un documento .md imprimible.</p>
        </div>
        <Link
          href={`/marketing/planes/${params.id}/identidad/manual`}
          className="mkt-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium"
        >
          Ir al Manual <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-500">
        <ExternalLink className="mt-0.5 h-3 w-3 flex-shrink-0" aria-hidden="true" />
        <span>
          Si no tienes credenciales de OpenAI/Gemini/Flux configuradas, el sistema genera un placeholder SVG
          con la inicial de tu marca — útil para hacer la demo del flujo. Para logos reales, configura
          <code className="mx-1 rounded bg-slate-200 px-1">OPENAI_API_KEY</code> o
          <code className="mx-1 rounded bg-slate-200 px-1">GOOGLE_AI_API_KEY</code> en las variables de entorno.
        </span>
      </div>
    </div>
  );
}
