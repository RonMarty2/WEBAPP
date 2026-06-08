'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { ArrowLeft, Sparkles, Loader2, Plus, X, ChevronUp, ChevronDown, Copy, Printer, Download, Check, FileText } from 'lucide-react';
import type { ProyectoMaestro, SeccionDocumento } from '@/types/maestro';
import { ordenarFormatos, getFormato, type FormatoEstructura } from '@/lib/formatos/estructuras';

function nuevoId() {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/** Convierte un formato (lista de títulos) en secciones del documento. */
function formatoASecciones(f: FormatoEstructura): SeccionDocumento[] {
  return f.secciones.map((titulo) => ({ id: nuevoId(), titulo, contenido: '' }));
}

export default function DocumentoProyecto() {
  const params = useParams<{ id: string }>();
  const [maestro, setMaestro] = useState<ProyectoMaestro | null>(null);
  const [secciones, setSecciones] = useState<SeccionDocumento[]>([]);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');
  const [generandoId, setGenerandoId] = useState<string | null>(null);
  const [generandoTodas, setGenerandoTodas] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const cargar = useCallback(async () => {
    const r = await fetch(`/api/maestro/${params.id}`, { credentials: 'include' });
    if (!r.ok) { setEstado('error'); return; }
    const d = await r.json();
    setMaestro(d.maestro);
    setSecciones(d.maestro?.documento?.secciones ?? []);
    setEstado('ok');
  }, [params.id]);

  useEffect(() => { cargar(); }, [cargar]);

  // Formatos ordenados según la universidad + modalidad del maestro.
  const { formatos, recomendadoId } = useMemo(
    () => ordenarFormatos(maestro?.universidad, maestro?.modalidad),
    [maestro?.universidad, maestro?.modalidad],
  );
  const [formatoSel, setFormatoSel] = useState<string>('');
  useEffect(() => {
    // Preselecciona el formato recomendado cuando carga el maestro.
    if (!formatoSel) setFormatoSel(recomendadoId ?? 'generico-proyecto-grado');
  }, [recomendadoId, formatoSel]);

  const upd = (id: string, c: Partial<SeccionDocumento>) => setSecciones((s) => s.map((x) => (x.id === id ? { ...x, ...c } : x)));
  const del = (id: string) => setSecciones((s) => s.filter((x) => x.id !== id));
  const add = () => setSecciones((s) => [...s, { id: nuevoId(), titulo: 'Nueva sección', contenido: '' }]);
  const mover = (i: number, dir: -1 | 1) => setSecciones((s) => {
    const j = i + dir;
    if (j < 0 || j >= s.length) return s;
    const copia = [...s];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    return copia;
  });

  // Errores visibles para el estudiante (en lugar de tragárselos silenciosamente).
  const [errorGen, setErrorGen] = useState<string | null>(null);
  const [progresoLote, setProgresoLote] = useState<{ hechos: number; total: number; fallos: number } | null>(null);
  // AbortControllers para cancelar generaciones largas (botón cancelar y unmount).
  const [aborterUno, setAborterUno] = useState<AbortController | null>(null);
  const [aborterTodas, setAborterTodas] = useState<AbortController | null>(null);
  const cancelarUna = () => { aborterUno?.abort(); };
  const cancelarTodas = () => { aborterTodas?.abort(); };

  // Genera el contenido de una sección con IA usando el contexto del maestro.
  // Devuelve null si falla; el llamador surface el error al usuario.
  const generarSeccion = async (sec: SeccionDocumento, signal?: AbortSignal): Promise<string | null> => {
    const tarea =
      `Redacta el contenido de la sección "${sec.titulo}" de un proyecto de grado para este negocio. ` +
      'Usa el trabajo real de los módulos vinculados (idea, mercados, estrategia, marketing, organización, finanzas, defensa) ' +
      'cuando aplique a esta sección. Redacta en prosa académica, español neutro boliviano (tuteo), concreto y sin inventar cifras como si fueran reales. ' +
      'Si falta información de un módulo, indícalo entre [corchetes] como pendiente.';
    try {
      const r = await fetch('/api/ai/asistir', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ modulo: 'generador', tarea, instruccion: '', maestroId: params.id, formato: 'texto' }),
        signal,
      });
      if (!r.ok) {
        const d = await r.json().catch(() => null);
        throw new Error(d?.detail ?? `Error ${r.status}`);
      }
      const d = await r.json();
      return d.texto ?? '';
    } catch (e) {
      if ((e as { name?: string }).name === 'AbortError') return null;
      throw e;
    }
  };

  const generarUna = async (sec: SeccionDocumento) => {
    const ctrl = new AbortController();
    setAborterUno(ctrl);
    setGenerandoId(sec.id); setErrorGen(null);
    try {
      const txt = await generarSeccion(sec, ctrl.signal);
      if (txt !== null) upd(sec.id, { contenido: txt });
    } catch (e) {
      setErrorGen(`No se pudo generar "${sec.titulo}": ${(e as Error).message}`);
    } finally { setGenerandoId(null); setAborterUno(null); }
  };

  const generarVacias = async () => {
    const vacias = secciones.filter((s) => !s.contenido.trim());
    if (vacias.length === 0) return;
    const ctrl = new AbortController();
    setAborterTodas(ctrl);
    setGenerandoTodas(true); setErrorGen(null);
    setProgresoLote({ hechos: 0, total: vacias.length, fallos: 0 });
    let hechos = 0, fallos = 0;
    const erroresAcum: string[] = [];
    try {
      for (const sec of vacias) {
        if (ctrl.signal.aborted) break;
        try {
          const txt = await generarSeccion(sec, ctrl.signal);
          if (txt !== null) {
            setSecciones((s) => s.map((x) => (x.id === sec.id ? { ...x, contenido: txt } : x)));
            hechos++;
          }
        } catch (e) {
          fallos++;
          erroresAcum.push(`"${sec.titulo}": ${(e as Error).message}`);
        }
        setProgresoLote({ hechos, total: vacias.length, fallos });
      }
      if (ctrl.signal.aborted) {
        setErrorGen(`Cancelado. ${hechos} de ${vacias.length} generadas antes de detener.`);
      } else if (erroresAcum.length) {
        setErrorGen(`${hechos} de ${vacias.length} generadas. Fallaron: ${erroresAcum.slice(0, 3).join(' · ')}${erroresAcum.length > 3 ? '…' : ''}`);
      }
    } finally {
      setGenerandoTodas(false);
      setAborterTodas(null);
      setTimeout(() => setProgresoLote(null), 3000);
    }
  };

  const guardar = async () => {
    setGuardando(true); setGuardado(false);
    try {
      const documento = { secciones, actualizado: new Date().toISOString() };
      const res = await fetch(`/api/maestro/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ documento }),
      });
      if (res.ok) { setGuardado(true); setTimeout(() => setGuardado(false), 2000); }
    } finally { setGuardando(false); }
  };

  const construirMarkdown = (): string => {
    const l: string[] = [];
    l.push(`# ${maestro?.titulo ?? 'Proyecto'}`);
    if (maestro?.tipo_negocio || maestro?.sector) l.push(`_${[maestro?.tipo_negocio, maestro?.sector].filter(Boolean).join(' · ')}_`);
    l.push('');
    secciones.forEach((s) => {
      l.push(`## ${s.titulo}`);
      l.push(s.contenido || '_(pendiente)_');
      l.push('');
    });
    return l.join('\n');
  };

  const copiar = async () => {
    try { await navigator.clipboard.writeText(construirMarkdown()); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch { /* */ }
  };

  const descargar = () => {
    const blob = new Blob([construirMarkdown()], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Nombre seguro: quita acentos y caracteres especiales (consistente con .tex y .zip).
    const base = (maestro?.titulo ?? 'proyecto')
      .normalize('NFD').replace(/[^ -~]/g, '')
      .replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'proyecto';
    a.download = `${base}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [descargandoTex, setDescargandoTex] = useState(false);
  const descargarTex = async () => {
    setDescargandoTex(true);
    try {
      const r = await fetch(`/api/maestro/${params.id}/latex`, { credentials: 'include' });
      if (!r.ok) return;
      const d = await r.json();
      const blob = new Blob([d.tex], { type: 'application/x-tex;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = d.filename ?? 'proyecto.tex';
      a.click();
      URL.revokeObjectURL(url);
    } finally { setDescargandoTex(false); }
  };

  const [descargandoZip, setDescargandoZip] = useState(false);
  const descargarZip = async () => {
    setDescargandoZip(true);
    try {
      const r = await fetch(`/api/maestro/${params.id}/zip`, { credentials: 'include' });
      if (!r.ok) return;
      const blob = await r.blob();
      // Extrae nombre del Content-Disposition; si no, usa fallback.
      const cd = r.headers.get('Content-Disposition') ?? '';
      const m = cd.match(/filename="([^"]+)"/);
      const fname = m?.[1] ?? `${(maestro?.titulo ?? 'proyecto').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-overleaf.zip`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fname;
      a.click();
      URL.revokeObjectURL(url);
    } finally { setDescargandoZip(false); }
  };

  if (estado === 'cargando') return <div className="gen-muted py-10 text-center text-sm">Cargando documento…</div>;
  if (estado === 'error' || !maestro) {
    return (
      <div className="gen-card p-6 text-center">
        <p className="font-semibold">No encontramos este proyecto</p>
        <Link href="/generador" className="gen-accent-text mt-2 inline-block text-sm">← Mis proyectos</Link>
      </div>
    );
  }

  const ocupado = generandoTodas || generandoId !== null;

  return (
    <div>
      <Link href={`/generador/${params.id}`} className="gen-muted inline-flex items-center gap-1 text-sm hover:text-teal-700">
        <ArrowLeft className="h-4 w-4" /> Volver al proyecto
      </Link>

      <header className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="gen-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
            <FileText className="gen-accent-text h-5 w-5" />
          </div>
          <div>
            <p className="gen-accent-text text-xs font-semibold uppercase tracking-wider">Documento del proyecto</p>
            <h1 className="text-2xl font-bold tracking-tight">{maestro.titulo}</h1>
          </div>
        </div>
        {secciones.length > 0 && (
          <div className="flex flex-wrap gap-2 print:hidden">
            <button onClick={copiar} className="gen-btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium">
              {copiado ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />} {copiado ? 'Copiado' : 'Copiar'}
            </button>
            <button onClick={descargar} className="gen-btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium"><Download className="h-3.5 w-3.5" /> .md</button>
            <button onClick={descargarTex} disabled={descargandoTex} className="gen-btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium disabled:opacity-50">
              {descargandoTex ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} .tex (Overleaf)
            </button>
            <button onClick={descargarZip} disabled={descargandoZip} className="gen-btn-primary inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium disabled:opacity-50" title="ZIP listo para subir a Overleaf, con plantilla de tu universidad si la detectamos">
              {descargandoZip ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} ZIP Overleaf
            </button>
            <button
              onClick={() => window.print()}
              className="gen-btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium"
              title="Abre el diálogo de impresión del navegador. Elige 'Guardar como PDF' como destino para descargar el documento."
              aria-label="Imprimir o guardar como PDF"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" /> Imprimir / PDF
            </button>
          </div>
        )}
      </header>

      {secciones.length === 0 && (() => {
        const fmt = getFormato(formatoSel);
        return (
          <div className="gen-card mt-6 p-6">
            <div className="text-center">
              <p className="text-3xl">📄</p>
              <p className="mt-3 font-semibold">Arma la estructura de tu proyecto</p>
              <p className="gen-muted mt-1 text-sm">
                Elige el formato de tu universidad y modalidad. Usamos la estructura
                oficial de capítulos; luego generas cada uno con IA.
              </p>
            </div>

            <div className="mx-auto mt-5 max-w-xl">
              <label className="block text-sm font-medium">Formato del documento</label>
              <select
                value={formatoSel}
                onChange={(e) => setFormatoSel(e.target.value)}
                className="gen-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
              >
                {formatos.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.id === recomendadoId ? '⭐ ' : ''}{f.nombre}
                  </option>
                ))}
              </select>

              {fmt && (
                <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50/50 p-3 text-left">
                  <p className="gen-muted text-xs">
                    <strong>Fuente:</strong> {fmt.fuente}
                    {fmt.id === recomendadoId && <span className="ml-1 text-teal-700">· recomendado para tu proyecto</span>}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-700">{fmt.secciones.length} secciones:</p>
                  <p className="gen-muted mt-0.5 text-xs leading-relaxed">{fmt.secciones.join(' · ')}</p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => { if (fmt) setSecciones(formatoASecciones(fmt)); }}
                  disabled={!fmt}
                  className="gen-btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  Usar esta estructura
                </button>
                <button onClick={add} className="gen-btn-ghost inline-flex items-center gap-1 px-4 py-2 text-sm"><Plus className="h-4 w-4" /> Empezar en blanco</button>
              </div>
            </div>
          </div>
        );
      })()}

      {secciones.length > 0 && (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-2 print:hidden">
            <button onClick={generarVacias} disabled={ocupado} className="gen-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium disabled:opacity-50">
              {generandoTodas ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generandoTodas && progresoLote
                ? `Generando ${progresoLote.hechos + progresoLote.fallos + 1}/${progresoLote.total}…`
                : generandoTodas ? 'Generando todas…' : 'Generar las vacías con IA'}
            </button>
            {generandoTodas && (
              <button onClick={cancelarTodas} className="gen-btn-ghost px-3 py-2 text-xs font-medium">Cancelar</button>
            )}
            <button onClick={guardar} disabled={guardando} className="gen-btn-ghost px-4 py-2 text-sm font-medium disabled:opacity-50">{guardando ? 'Guardando…' : 'Guardar'}</button>
            {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
          </div>

          {errorGen && (
            <div className="mt-3 rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-900">
              <div className="flex items-start justify-between gap-2">
                <span>⚠️ {errorGen}</span>
                <button onClick={() => setErrorGen(null)} className="text-rose-700 hover:text-rose-900">✕</button>
              </div>
            </div>
          )}

          <div className="mt-4 space-y-4">
            {secciones.map((sec, i) => (
              <div key={sec.id} className="gen-card p-4">
                <div className="flex items-center gap-2">
                  <span className="gen-accent-soft gen-accent-text flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">{i + 1}</span>
                  <input value={sec.titulo} onChange={(e) => upd(sec.id, { titulo: e.target.value })}
                    className="gen-border flex-1 rounded border bg-white px-2 py-1 text-sm font-semibold focus:outline-none" />
                  <div className="flex flex-shrink-0 items-center gap-0.5 print:hidden">
                    <button onClick={() => mover(i, -1)} disabled={i === 0} className="gen-muted rounded p-1 hover:bg-teal-50 disabled:opacity-30" aria-label="Mover sección arriba"><ChevronUp className="h-4 w-4" aria-hidden="true" /></button>
                    <button onClick={() => mover(i, 1)} disabled={i === secciones.length - 1} className="gen-muted rounded p-1 hover:bg-teal-50 disabled:opacity-30" aria-label="Mover sección abajo"><ChevronDown className="h-4 w-4" aria-hidden="true" /></button>
                    <button onClick={() => del(sec.id)} className="text-slate-300 hover:text-rose-600" aria-label="Eliminar sección"><X className="h-4 w-4" aria-hidden="true" /></button>
                  </div>
                </div>
                <textarea value={sec.contenido} onChange={(e) => upd(sec.id, { contenido: e.target.value })} rows={sec.contenido ? 8 : 3}
                  placeholder="Contenido de la sección. Genera con IA o escribe directamente…"
                  className="gen-border mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm leading-relaxed focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200" />
                <div className="mt-2 flex items-center gap-2 print:hidden">
                  <button onClick={() => generarUna(sec)} disabled={ocupado} className="gen-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-50">
                    {generandoId === sec.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {generandoId === sec.id ? 'Generando…' : sec.contenido ? 'Regenerar con IA' : 'Generar con IA'}
                  </button>
                  {generandoId === sec.id && (
                    <button onClick={cancelarUna} className="text-xs text-slate-500 hover:text-rose-600">Cancelar</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 print:hidden">
            <button onClick={add} className="gen-btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Agregar sección</button>
            <button onClick={guardar} disabled={guardando} className="gen-btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50">{guardando ? 'Guardando…' : 'Guardar documento'}</button>
            {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
          </div>

          <p className="gen-muted mt-3 text-[11px] print:hidden">
            La IA redacta a partir de tu trabajo real en los módulos. Revisa y edita cada sección: tú apruebas el contenido final.
          </p>
        </>
      )}
    </div>
  );
}
