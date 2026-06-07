'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Link2, Unlink, Layers, Sparkles, Loader2, Copy, Check, FileText } from 'lucide-react';
import { MODULOS } from '@/lib/generador/utils';
import type { ProyectoMaestro, VinculoModulo } from '@/types/maestro';

type Disponibles = Record<string, Array<{ id: string; titulo: string }>>;

export default function GeneradorWorkspace() {
  const params = useParams<{ id: string }>();
  const [maestro, setMaestro] = useState<ProyectoMaestro | null>(null);
  const [vinculos, setVinculos] = useState<VinculoModulo[]>([]);
  const [disponibles, setDisponibles] = useState<Disponibles>({});
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');
  const [seleccion, setSeleccion] = useState<Record<string, string>>({});

  const [contextoTxt, setContextoTxt] = useState<string | null>(null);
  const [cargandoCtx, setCargandoCtx] = useState(false);

  const [borrador, setBorrador] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const cargarMaestro = useCallback(async () => {
    const r = await fetch(`/api/maestro/${params.id}`, { credentials: 'include' });
    if (!r.ok) { setEstado('error'); return; }
    const d = await r.json();
    setMaestro(d.maestro);
    setVinculos(d.vinculos ?? []);
    setEstado('ok');
  }, [params.id]);

  useEffect(() => {
    cargarMaestro();
    fetch('/api/maestro/disponibles', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setDisponibles(d.disponibles ?? {}))
      .catch(() => {});
  }, [cargarMaestro]);

  const vinculado = (modulo: string) => vinculos.find((v) => v.modulo === modulo);
  const tituloVinculado = (modulo: string, refId: string) =>
    disponibles[modulo]?.find((p) => p.id === refId)?.titulo ?? 'Proyecto vinculado';

  const vincular = async (modulo: string) => {
    const refId = seleccion[modulo];
    if (!refId) return;
    await fetch(`/api/maestro/${params.id}/vincular`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ modulo, ref_id: refId }),
    });
    setContextoTxt(null); setBorrador(null);
    await cargarMaestro();
  };

  const desvincular = async (modulo: string) => {
    await fetch(`/api/maestro/${params.id}/vincular`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ modulo }),
    });
    setContextoTxt(null); setBorrador(null);
    await cargarMaestro();
  };

  const cargarContexto = async () => {
    setCargandoCtx(true);
    try {
      const r = await fetch(`/api/maestro/${params.id}/contexto`, { credentials: 'include' });
      const d = await r.json();
      if (r.ok) setContextoTxt(d.texto ?? '');
    } finally { setCargandoCtx(false); }
  };

  const generar = async () => {
    setGenerando(true); setBorrador(null);
    try {
      const tarea =
        'Genera un BORRADOR de la estructura (índice) del proyecto de grado para este negocio, capítulo por capítulo. ' +
        'Integra EXPLÍCITAMENTE el trabajo ya hecho en los módulos vinculados: en cada capítulo indica qué incluir y de qué módulo ' +
        'proviene el insumo (idea, mercados, estrategia, marketing, organización, finanzas, defensa). ' +
        'Si falta un módulo, indícalo como pendiente. Usa español neutro boliviano (tuteo).';
      const r = await fetch('/api/ai/asistir', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ modulo: 'generador', tarea, instruccion: '', maestroId: params.id, formato: 'texto' }),
      });
      const d = await r.json();
      if (r.ok) setBorrador(d.texto ?? '');
      else setBorrador(`No se pudo generar: ${d?.detail ?? 'intenta de nuevo'}`);
    } finally { setGenerando(false); }
  };

  const copiar = async () => {
    if (!borrador) return;
    try { await navigator.clipboard.writeText(borrador); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch { /* */ }
  };

  if (estado === 'cargando') return <div className="gen-muted py-10 text-center text-sm">Cargando proyecto…</div>;
  if (estado === 'error' || !maestro) {
    return (
      <div className="gen-card p-6 text-center">
        <p className="font-semibold">No encontramos este proyecto</p>
        <Link href="/generador" className="gen-accent-text mt-2 inline-block text-sm">← Mis proyectos</Link>
      </div>
    );
  }

  const conectados = vinculos.length;

  return (
    <div>
      <Link href="/generador" className="gen-muted inline-flex items-center gap-1 text-sm hover:text-teal-700">
        <ArrowLeft className="h-4 w-4" /> Mis proyectos
      </Link>

      <header className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight">{maestro.titulo}</h1>
        <p className="gen-muted mt-1 text-sm">
          {[maestro.tipo_negocio, maestro.sector, [maestro.zona, maestro.municipio, maestro.departamento].filter(Boolean).join(', '), maestro.modalidad].filter(Boolean).join(' · ') || 'Sin detalles aún'}
        </p>
        {maestro.descripcion && <p className="gen-muted mt-1 text-sm">{maestro.descripcion}</p>}
      </header>

      {/* Módulos conectados */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Módulos conectados <span className="gen-muted font-normal">({conectados}/{MODULOS.length})</span></h2>
        </div>
        <div className="mt-3 space-y-2">
          {MODULOS.map((m) => {
            const v = vinculado(m.id);
            const opciones = disponibles[m.id] ?? [];
            return (
              <div key={m.id} className="gen-card flex flex-wrap items-center gap-3 p-3">
                <span className="text-xl">{m.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{m.label}</p>
                  {v ? (
                    <p className="gen-accent-text text-xs">✓ {tituloVinculado(m.id, v.ref_id)}</p>
                  ) : opciones.length === 0 ? (
                    <p className="gen-muted text-xs">Sin proyectos. <Link href={m.ruta} className="underline">Crear en el módulo →</Link></p>
                  ) : (
                    <p className="gen-muted text-xs">No vinculado</p>
                  )}
                </div>
                {v ? (
                  <button onClick={() => desvincular(m.id)} className="gen-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">
                    <Unlink className="h-3.5 w-3.5" /> Desvincular
                  </button>
                ) : opciones.length > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <select
                      value={seleccion[m.id] ?? ''}
                      onChange={(e) => setSeleccion((s) => ({ ...s, [m.id]: e.target.value }))}
                      className="gen-border max-w-44 rounded border px-2 py-1.5 text-sm"
                    >
                      <option value="">Elegir proyecto…</option>
                      {opciones.map((o) => <option key={o.id} value={o.id}>{o.titulo}</option>)}
                    </select>
                    <button onClick={() => vincular(m.id)} disabled={!seleccion[m.id]} className="gen-btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium disabled:opacity-40">
                      <Link2 className="h-3.5 w-3.5" /> Vincular
                    </button>
                  </div>
                ) : (
                  <Link href={m.ruta} className="gen-btn-ghost px-3 py-1.5 text-xs">Ir al módulo</Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contexto consolidado */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Contexto consolidado</h2>
          <button onClick={cargarContexto} disabled={cargandoCtx} className="gen-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-50">
            {cargandoCtx ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Layers className="h-3.5 w-3.5" />}
            {cargandoCtx ? 'Cargando…' : 'Ver contexto'}
          </button>
        </div>
        {contextoTxt !== null && (
          <div className="gen-card mt-3 p-4">
            <pre className="gen-muted whitespace-pre-wrap break-words text-xs leading-relaxed">{contextoTxt}</pre>
          </div>
        )}
        {contextoTxt === null && (
          <p className="gen-muted mt-2 text-xs">Es lo que la IA leerá de tus módulos vinculados para generar con coherencia.</p>
        )}
      </section>

      {/* Generar borrador */}
      <section className="mt-6">
        <div className="gen-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-1.5 text-sm font-semibold"><FileText className="h-4 w-4" /> Borrador rápido del índice</h2>
              <p className="gen-muted mt-0.5 text-xs">Vista rápida del índice integrando tus módulos. Para redactar capítulo por capítulo y guardarlo, abre el documento completo.</p>
              <Link href={`/generador/${params.id}/documento`} className="gen-accent-text mt-1 inline-flex items-center gap-1 text-xs font-medium hover:underline">
                Abrir documento completo →
              </Link>
            </div>
            <button onClick={generar} disabled={generando || conectados === 0} className="gen-btn-primary inline-flex flex-shrink-0 items-center gap-1.5 px-4 py-2 text-sm font-medium disabled:opacity-50">
              {generando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generando ? 'Generando…' : 'Generar borrador'}
            </button>
          </div>
          {conectados === 0 && <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">Vincula al menos un módulo para generar con tu trabajo real.</p>}
          {borrador && (
            <div className="mt-4">
              <div className="mb-2 flex justify-end">
                <button onClick={copiar} className="gen-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">
                  {copiado ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiado ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <div className="gen-accent-soft rounded-lg p-4">
                <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed">{borrador}</pre>
              </div>
              <p className="gen-muted mt-2 text-[11px]">Borrador generado por IA a partir de tu trabajo. Revísalo y edítalo: tú apruebas el contenido final.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
