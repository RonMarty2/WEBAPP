'use client';

/**
 * Selección de Tipografía.
 *
 * El alumno ve 3 combinaciones recomendadas según las personalidades
 * inferidas de su brief (modo "deja que decidamos por ti") + opción
 * de explorar el catálogo completo.
 */

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Type, ArrowRight, AlertCircle, Check } from 'lucide-react';
import type { IdentidadVisual } from '@/types/identidad';
import { inferirPersonalidadesDesdePalabras, type CombinacionTipografica } from '@/lib/identidad/tipografia';

export default function PaginaTipografia() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [identidad, setIdentidad] = useState<IdentidadVisual | null>(null);
  const [recomendaciones, setRecomendaciones] = useState<CombinacionTipografica[]>([]);
  const [catalogo, setCatalogo] = useState<CombinacionTipografica[]>([]);
  const [verCatalogo, setVerCatalogo] = useState(false);
  const [elegidaId, setElegidaId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargar() {
      try {
        // Identidad para inferir personalidades
        const idRes = await fetch(`/api/identidad/${params.id}`, { credentials: 'include' });
        const idData = await idRes.json();
        const id = idData.identidad as IdentidadVisual | null;
        setIdentidad(id);

        // Inferir personalidades de las palabras del brief
        const palabras = [
          id?.brief?.personalidad,
          ...(id?.brief?.atributos ?? []),
        ].filter((p): p is string => typeof p === 'string' && p.length > 0)
          .flatMap((p) => p.split(/[,\s]+/));
        const personalidades = inferirPersonalidadesDesdePalabras(palabras);

        const url = `/api/identidad/${params.id}/tipografia${personalidades.length ? `?personalidades=${personalidades.join(',')}` : ''}`;
        const recRes = await fetch(url, { credentials: 'include' });
        const recData = await recRes.json();
        setRecomendaciones(recData.recomendaciones ?? []);
        setCatalogo(recData.catalogo_completo ?? []);

        // Si ya tenía una elegida, marcarla
        if (id?.tipo_principal_familia) {
          const ya = (recData.catalogo_completo as CombinacionTipografica[])
            .find((c) => c.principal.familia === id.tipo_principal_familia && c.secundaria.familia === id.tipo_secundaria_familia);
          if (ya) setElegidaId(ya.id);
        }
      } catch {
        setError('No se pudieron cargar las recomendaciones');
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [params.id]);

  const guardar = async (avanzar: boolean) => {
    if (!elegidaId) return;
    setGuardando(true);
    setError('');
    try {
      const res = await fetch(`/api/identidad/${params.id}/tipografia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ combinacionId: elegidaId }),
      });
      if (res.ok) {
        if (avanzar) router.push(`/marketing/planes/${params.id}/identidad/logo`);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || 'No se pudo guardar');
      }
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="mkt-muted py-10 text-center text-sm">Cargando recomendaciones…</div>;

  if (!identidad?.brief?.nombre) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <div>
            <p><strong>Primero completa el Brief.</strong></p>
            <Link href={`/marketing/planes/${params.id}/identidad/brief`} className="mt-2 inline-block rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700">
              Ir al Brief →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const visibles = verCatalogo ? catalogo : recomendaciones;

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/marketing/planes/${params.id}/identidad`} className="mkt-muted inline-flex items-center gap-1 text-sm hover:text-rose-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver a Identidad
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="mkt-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Type className="mkt-accent-text h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="mkt-accent-text text-xs font-semibold uppercase tracking-wider">Paso 3</p>
          <h1 className="text-2xl font-bold tracking-tight">Tipografía</h1>
          <p className="mkt-muted mt-1 text-sm">
            Combinaciones probadas de Google Fonts que encajan con tu personalidad de marca.
          </p>
        </div>
      </header>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">
          {verCatalogo ? 'Catálogo completo' : 'Recomendadas para tu marca'}
        </p>
        <button
          onClick={() => setVerCatalogo((v) => !v)}
          className="text-xs font-medium text-rose-700 underline hover:text-rose-900"
        >
          {verCatalogo ? 'Ver solo recomendadas' : 'Ver catálogo completo (10)'}
        </button>
      </div>

      <ul className="mt-3 space-y-3">
        {visibles.map((c) => {
          // Cargar la fuente para preview en vivo
          const elegida = elegidaId === c.id;
          return (
            <li key={c.id}>
              <button
                onClick={() => setElegidaId(c.id)}
                className={`mkt-card flex w-full items-start gap-4 p-5 text-left transition-colors hover:border-rose-300 ${elegida ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
              >
                <link rel="stylesheet" href={c.importUrl} />
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                  {elegida ? <Check className="h-5 w-5" aria-hidden="true" /> : <Type className="h-5 w-5" aria-hidden="true" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{c.nombre}</p>
                    {c.personalidades.map((p) => (
                      <span key={p} className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-700">{p}</span>
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">{c.notas}</p>
                  <div className="mt-3 rounded-lg border border-slate-100 bg-white p-3">
                    <p style={{ fontFamily: `'${c.principal.familia}', sans-serif`, fontWeight: Number(c.principal.peso) }} className="text-2xl text-slate-900">
                      {identidad.brief.nombre}
                    </p>
                    <p style={{ fontFamily: `'${c.secundaria.familia}', sans-serif`, fontWeight: Number(c.secundaria.peso) }} className="mt-1.5 text-sm text-slate-700">
                      {identidad.brief.esencia ?? 'La esencia de tu marca aparecería aquí en cuerpo de texto.'}
                    </p>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => guardar(false)}
          disabled={guardando || !elegidaId}
          className="mkt-btn-ghost inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {guardando ? 'Guardando…' : 'Guardar selección'}
        </button>
        <button
          onClick={() => guardar(true)}
          disabled={guardando || !elegidaId}
          className="mkt-btn-primary inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium disabled:opacity-50"
        >
          Guardar y pasar a Logo <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
