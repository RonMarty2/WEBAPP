'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Calculator, Check, Info } from 'lucide-react';
import type { ProyectoMercados } from '@/types/mercados';
import { calcularTamanoMuestra, TIPOS_MUESTREO, esProbabilistico } from '@/lib/mercados/muestreo';
import { formatNumero } from '@/lib/mercados/utils';

export default function EtapaMuestreo() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const [universo, setUniverso] = useState('');
  const [confianza, setConfianza] = useState(95);
  const [margenError, setMargenError] = useState('5');
  const [tipoMuestreo, setTipoMuestreo] = useState('estratificado');

  useEffect(() => {
    fetch(`/api/mercados/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        const p: ProyectoMercados = d.proyecto;
        if (!p) return;
        if (p.universo) setUniverso(String(p.universo));
        if (p.nivel_confianza) setConfianza(Math.round(p.nivel_confianza * 100));
        if (p.margen_error) setMargenError(String(Math.round(p.margen_error * 100)));
        if (p.tipo_muestreo) setTipoMuestreo(p.tipo_muestreo);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const resultado = useMemo(() => {
    const N = parseInt(universo, 10);
    const e = parseFloat(margenError);
    if (!Number.isFinite(e) || e <= 0) return null;
    return calcularTamanoMuestra({
      universo: Number.isFinite(N) && N > 0 ? N : null,
      confianza,
      margenError: e,
    });
  }, [universo, confianza, margenError]);

  const guardar = async (avanzar: boolean) => {
    if (!resultado) return;
    setGuardando(true);
    setGuardado(false);
    try {
      const body: Record<string, unknown> = {
        universo: parseInt(universo, 10) || null,
        nivel_confianza: confianza / 100,
        margen_error: parseFloat(margenError) / 100,
        tipo_muestreo: tipoMuestreo,
        tamano_muestra: resultado.n,
      };
      if (avanzar) body.estado = 'encuesta';

      const res = await fetch(`/api/mercados/proyectos/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setGuardado(true);
        if (avanzar) router.push(`/mercados/proyecto/${params.id}`);
      }
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <div className="mk-muted py-10 text-center text-sm">Cargando…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <Link
        href={`/mercados/proyecto/${params.id}`}
        className="mk-muted inline-flex items-center gap-1 text-sm hover:text-sky-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al proyecto
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="mk-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Calculator className="mk-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="mk-accent-text text-xs font-semibold uppercase tracking-wider">Etapa 2</p>
          <h1 className="text-2xl font-bold tracking-tight">Cálculo de la muestra</h1>
        </div>
      </header>
      <p className="mk-muted mt-2 text-sm">
        ¿A cuántas personas tienes que encuestar? Usa la misma fórmula de la clase 5.
        Cambia los parámetros y mira cómo varía la muestra al instante.
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-[1fr_1fr]">
        {/* Parámetros */}
        <div className="mk-card p-5">
          <h2 className="text-sm font-semibold">Parámetros</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium">Universo (N)</label>
              <p className="mk-muted text-xs">Tamaño de tu población. Déjalo vacío si es muy grande/desconocido.</p>
              <input
                type="number"
                value={universo}
                onChange={(e) => setUniverso(e.target.value)}
                placeholder="Ej: 50000"
                className="mk-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Nivel de confianza</label>
              <div className="mt-1 flex gap-2">
                {[90, 95, 99].map((c) => (
                  <button
                    key={c}
                    onClick={() => setConfianza(c)}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      confianza === c ? 'mk-accent-bg text-white' : 'mk-border border'
                    }`}
                  >
                    {c}%
                  </button>
                ))}
              </div>
              <p className="mk-muted mt-1 text-xs">95% es el estándar académico.</p>
            </div>

            <div>
              <label className="text-sm font-medium">Margen de error (±%)</label>
              <input
                type="number"
                step="0.5"
                value={margenError}
                onChange={(e) => setMargenError(e.target.value)}
                className="mk-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
              <p className="mk-muted mt-1 text-xs">±5% es lo habitual. Menos error = más encuestas.</p>
            </div>

            <div>
              <label className="text-sm font-medium">Tipo de muestreo</label>
              <select
                value={tipoMuestreo}
                onChange={(e) => setTipoMuestreo(e.target.value)}
                className="mk-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                {TIPOS_MUESTREO.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} {t.probabilistico ? '(probabilístico)' : '(no probabilístico)'}
                  </option>
                ))}
              </select>
              {!esProbabilistico(tipoMuestreo) && (
                <p className="mt-1 flex items-start gap-1 text-xs text-amber-700">
                  <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
                  No probabilístico: no permite generalizar con rigor. Justifícalo ante el tribunal.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Resultado */}
        <div className="mk-card flex flex-col p-5">
          <h2 className="text-sm font-semibold">Resultado</h2>
          {resultado ? (
            <>
              <div className="mt-4 flex-1">
                <p className="mk-muted text-xs uppercase tracking-wider">Tamaño de muestra</p>
                <p className="mk-accent-text mt-1 text-5xl font-bold">{formatNumero(resultado.n)}</p>
                <p className="mk-muted mt-1 text-sm">personas a encuestar</p>

                <div className="mk-accent-soft mt-4 rounded-xl p-3 text-xs text-slate-700">
                  <p className="font-semibold">Cómo se calculó</p>
                  <p className="mt-1">
                    {resultado.universoFinito
                      ? 'Fórmula para población finita:'
                      : 'Fórmula para universo grande/desconocido:'}
                  </p>
                  <code className="mt-1 block rounded bg-white/70 p-2 font-mono text-[11px]">
                    {resultado.universoFinito
                      ? 'n = (N·Z²·p·q) / (e²·(N−1) + Z²·p·q)'
                      : 'n = (Z²·p·q) / e²'}
                  </code>
                  <p className="mt-2">
                    Z = {resultado.Z} ({confianza}%) · p = q = 0.5 · e = {(resultado.e * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="mk-muted mt-4 flex-1 text-sm">
              Ingresa un margen de error válido para ver el resultado.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => guardar(false)}
          disabled={guardando || !resultado}
          className="mk-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
        <button
          onClick={() => guardar(true)}
          disabled={guardando || !resultado}
          className="mk-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          Guardar y volver al proyecto →
        </button>
        {guardado && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
            <Check className="h-4 w-4" /> Guardado
          </span>
        )}
      </div>
    </div>
  );
}
