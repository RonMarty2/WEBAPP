'use client';

/**
 * Manual de Marca — exportación final.
 *
 * Resumen visual + botón para descargar el .md.
 */

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Download, Check, AlertCircle, Printer } from 'lucide-react';
import type { IdentidadVisual } from '@/types/identidad';

export default function PaginaManual() {
  const params = useParams<{ id: string }>();
  const [identidad, setIdentidad] = useState<IdentidadVisual | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    fetch(`/api/identidad/${params.id}`, { credentials: 'include' })
      .then(async (r) => {
        const d = await r.json();
        if (r.ok) setIdentidad(d.identidad);
        else setError(d.error || 'No se pudo cargar');
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setCargando(false));
  }, [params.id]);

  const descargar = async () => {
    setDescargando(true);
    try {
      const res = await fetch(`/api/identidad/${params.id}/manual`, { credentials: 'include' });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // El server pone el Content-Disposition; aquí solo damos fallback
        a.download = `manual-de-marca-${identidad?.brief?.nombre ?? 'marca'}.md`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        setError('No se pudo generar el manual');
      }
    } finally {
      setDescargando(false);
    }
  };

  if (cargando) return <div className="mkt-muted py-10 text-center text-sm">Cargando…</div>;

  if (!identidad) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error || 'Identidad no encontrada'}</span>
        </div>
      </div>
    );
  }

  const piezas = [
    { label: 'Brief de marca', listo: !!identidad.brief?.nombre },
    { label: 'Paleta de colores', listo: !!identidad.paleta_primario },
    { label: 'Tipografía', listo: !!identidad.tipo_principal_familia },
    { label: 'Logo principal', listo: !!identidad.logo_principal_url },
    { label: 'Mockups de aplicación', listo: Array.isArray(identidad.mockups) && identidad.mockups.length > 0 },
  ];

  const todoListo = piezas.every((p) => p.listo);

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/marketing/planes/${params.id}/identidad`} className="mkt-muted inline-flex items-center gap-1 text-sm hover:text-rose-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver a Identidad
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="mkt-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <FileText className="mkt-accent-text h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="mkt-accent-text text-xs font-semibold uppercase tracking-wider">Paso 6</p>
          <h1 className="text-2xl font-bold tracking-tight">Manual de Marca</h1>
          <p className="mkt-muted mt-1 text-sm">
            Compila todo lo decidido en un documento listo para imprimir.
          </p>
        </div>
      </header>

      {/* Checklist */}
      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-700">Piezas incluidas en el manual</p>
        <ul className="mt-3 space-y-2">
          {piezas.map((p, i) => (
            <li key={i} className="flex items-center gap-2">
              {p.listo ? (
                <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              ) : (
                <span className="inline-block h-4 w-4 rounded-full border-2 border-slate-300" aria-hidden="true" />
              )}
              <span className={`text-sm ${p.listo ? 'text-slate-900' : 'text-slate-500'}`}>{p.label}</span>
              {!p.listo && (
                <span className="text-[10px] text-amber-700">— pendiente</span>
              )}
            </li>
          ))}
        </ul>

        {!todoListo && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            Puedes descargar el manual aunque falten piezas, pero quedará incompleto. Te recomendamos completar todos los pasos antes.
          </div>
        )}
      </section>

      {/* Acciones */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={descargar}
          disabled={descargando}
          className="mkt-btn-primary inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium disabled:opacity-50"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {descargando ? 'Descargando…' : 'Descargar manual (.md)'}
        </button>
        <button
          onClick={() => window.print()}
          className="mkt-btn-ghost inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium"
          title="Abre el diálogo de impresión. Elige 'Guardar como PDF' como destino."
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          Imprimir / PDF
        </button>
      </div>

      {/* Preview visual del manual */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Vista previa</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">{identidad.brief?.nombre ?? 'Sin nombre'}</h2>
        {identidad.brief?.esencia && (
          <p className="mt-1 text-sm italic text-slate-600">"{identidad.brief.esencia}"</p>
        )}

        {/* Paleta */}
        {identidad.paleta_primario && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Paleta</p>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {[
                identidad.paleta_primario,
                identidad.paleta_secundario,
                identidad.paleta_acento,
                identidad.paleta_neutro_claro,
                identidad.paleta_neutro_oscuro,
              ].filter(Boolean).map((c, i) => (
                <div key={i} className="text-center">
                  <div className="h-16 w-full rounded-md border border-slate-200" style={{ background: c! }} />
                  <p className="mt-1 font-mono text-[10px] text-slate-600">{c}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tipografía */}
        {identidad.tipo_principal_familia && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tipografía</p>
            <p className="mt-1 text-sm text-slate-700">
              Principal: <strong>{identidad.tipo_principal_familia}</strong> ({identidad.tipo_principal_peso}).
              {identidad.tipo_secundaria_familia && (
                <> Secundaria: <strong>{identidad.tipo_secundaria_familia}</strong> ({identidad.tipo_secundaria_peso}).</>
              )}
            </p>
          </div>
        )}

        {/* Logo */}
        {identidad.logo_principal_url && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Logo principal</p>
            <div className="mt-2 flex h-44 w-44 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={identidad.logo_principal_url} alt="Logo principal" className="max-h-full max-w-full object-contain" />
            </div>
          </div>
        )}

        {/* Mockups */}
        {Array.isArray(identidad.mockups) && identidad.mockups.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Mockups ({identidad.mockups.length})
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {identidad.mockups.slice(0, 6).map((m, i) => (
                <div key={i} className="overflow-hidden rounded border border-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.descripcion} className="block h-auto w-full" />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
