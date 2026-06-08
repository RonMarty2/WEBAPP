'use client';

/**
 * Generación de Paleta de Colores.
 *
 * El alumno elige un color seed (sugerido por sector) + un esquema
 * cromático y el servidor genera 5 colores armoniosos con teoría del
 * color. Cero costo IA.
 */

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Palette, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import type { IdentidadVisual, EsquemaPaleta } from '@/types/identidad';
import { generarPaleta, sugerirSemillaPorSector, contrasteWCAG } from '@/lib/identidad/paleta';

const ESQUEMAS: { id: EsquemaPaleta; label: string; ayuda: string }[] = [
  { id: 'monocromatica',  label: 'Monocromática',  ayuda: 'Variaciones del mismo color. Calmo, profesional, fácil de combinar.' },
  { id: 'analoga',        label: 'Análoga',        ayuda: 'Colores vecinos en la rueda. Armoniosa, suave, agradable.' },
  { id: 'complementaria', label: 'Complementaria', ayuda: 'Opuestos en la rueda. Alto contraste, vibrante, llamativa.' },
  { id: 'triada',         label: 'Triada',         ayuda: 'Tres colores equidistantes. Rica, dinámica, requiere balance.' },
  { id: 'tetrada',        label: 'Tetrada',        ayuda: 'Cuatro colores en rectángulo. Muy rica, ideal para campañas amplias.' },
];

export default function PaginaPaleta() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [identidad, setIdentidad] = useState<IdentidadVisual | null>(null);
  const [cargando, setCargando] = useState(true);
  const [seed, setSeed] = useState('#7c3aed');
  const [esquema, setEsquema] = useState<EsquemaPaleta>('analoga');
  const [previewLocal, setPreviewLocal] = useState<ReturnType<typeof generarPaleta> | null>(null);
  const [seedSugerido, setSeedSugerido] = useState<{ hex: string; razon: string } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/identidad/${params.id}`, { credentials: 'include' })
      .then(async (r) => {
        const d = await r.json();
        const id = d.identidad as IdentidadVisual | null;
        if (id) {
          setIdentidad(id);
          if (id.paleta_primario) {
            setSeed(id.paleta_primario);
            setEsquema((id.paleta_esquema ?? 'analoga') as EsquemaPaleta);
          } else if (id.brief?.sector) {
            const sug = sugerirSemillaPorSector(id.brief.sector);
            setSeedSugerido(sug);
            setSeed(sug.hex);
          }
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  // Preview local cada vez que cambia seed o esquema
  useEffect(() => {
    try {
      setPreviewLocal(generarPaleta(seed, esquema));
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setPreviewLocal(null);
    }
  }, [seed, esquema]);

  const guardar = async (avanzar: boolean) => {
    if (!previewLocal) return;
    setGuardando(true);
    setError('');
    try {
      const res = await fetch(`/api/identidad/${params.id}/paleta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ seed, esquema }),
      });
      if (res.ok) {
        if (avanzar) router.push(`/marketing/planes/${params.id}/identidad/tipografia`);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || 'No se pudo guardar');
      }
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="mkt-muted py-10 text-center text-sm">Cargando…</div>;

  if (!identidad?.brief?.nombre) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <div>
            <p><strong>Primero completa el Brief.</strong></p>
            <p className="mt-1">Sin nombre y esencia, la paleta no tendrá contexto.</p>
            <Link href={`/marketing/planes/${params.id}/identidad/brief`} className="mt-2 inline-block rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700">
              Ir al Brief →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/marketing/planes/${params.id}/identidad`} className="mkt-muted inline-flex items-center gap-1 text-sm hover:text-rose-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver a Identidad
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="mkt-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Palette className="mkt-accent-text h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="mkt-accent-text text-xs font-semibold uppercase tracking-wider">Paso 2</p>
          <h1 className="text-2xl font-bold tracking-tight">Paleta de Colores</h1>
          <p className="mkt-muted mt-1 text-sm">
            Elige un color base + un esquema. El sistema genera 5 colores armoniosos.
          </p>
        </div>
      </header>

      {/* Sugerencia por sector */}
      {seedSugerido && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs text-violet-900">
          <Palette className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-violet-600" aria-hidden="true" />
          <div>
            <p><strong>Sugerencia para {identidad.brief.sector}:</strong> <code>{seedSugerido.hex}</code></p>
            <p className="mt-0.5">{seedSugerido.razon}</p>
          </div>
        </div>
      )}

      {/* Seed picker */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Color base (seed)</span>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="color"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              className="h-12 w-20 cursor-pointer rounded-lg border border-slate-300"
              aria-label="Color base"
            />
            <input
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="#7c3aed"
              className="mkt-border flex-1 rounded-lg border bg-white px-3 py-2 text-sm font-mono focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </label>

        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-slate-700">Esquema cromático</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {ESQUEMAS.map((e) => (
              <label key={e.id} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 transition-colors ${esquema === e.id ? 'border-rose-400 bg-rose-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input
                  type="radio"
                  name="esquema"
                  value={e.id}
                  checked={esquema === e.id}
                  onChange={() => setEsquema(e.id)}
                  className="mt-1 accent-rose-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">{e.label}</p>
                  <p className="text-[11px] text-slate-500">{e.ayuda}</p>
                </div>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Preview */}
      {previewLocal && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Vista previa</p>
            <span className="text-[10px] uppercase tracking-wider text-slate-400">{esquema}</span>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            <Swatch label="Primario" hex={previewLocal.primario} />
            <Swatch label="Secundario" hex={previewLocal.secundario} />
            <Swatch label="Acento" hex={previewLocal.acento} />
            <Swatch label="Neutro claro" hex={previewLocal.neutroClaro} contrasteCon={previewLocal.neutroOscuro} />
            <Swatch label="Neutro oscuro" hex={previewLocal.neutroOscuro} contrasteCon={previewLocal.neutroClaro} />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => guardar(false)}
          disabled={guardando || !previewLocal}
          className="mkt-btn-ghost inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {guardando ? 'Guardando…' : 'Guardar paleta'}
        </button>
        <button
          onClick={() => guardar(true)}
          disabled={guardando || !previewLocal}
          className="mkt-btn-primary inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium disabled:opacity-50"
        >
          Guardar y pasar a Tipografía <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function Swatch({ label, hex, contrasteCon }: { label: string; hex: string; contrasteCon?: string }) {
  const ratio = contrasteCon ? contrasteWCAG(hex, contrasteCon) : null;
  const ok = ratio ? ratio >= 4.5 : null;
  return (
    <div className="text-center">
      <div
        className="h-20 w-full rounded-lg border border-slate-200 shadow-sm"
        style={{ background: hex }}
        title={hex}
        role="img"
        aria-label={`${label}: ${hex}`}
      />
      <p className="mt-1.5 text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-[11px] font-mono text-slate-700">{hex}</p>
      {ratio !== null && (
        <p className={`mt-0.5 text-[10px] ${ok ? 'text-emerald-700' : 'text-amber-700'}`}>
          contraste {ratio.toFixed(1)}:1
        </p>
      )}
    </div>
  );
}
