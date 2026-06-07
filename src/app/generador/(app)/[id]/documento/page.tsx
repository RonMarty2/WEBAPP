'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Sparkles, Loader2, Plus, X, ChevronUp, ChevronDown, Copy, Printer, Download, Check, FileText } from 'lucide-react';
import type { ProyectoMaestro, SeccionDocumento } from '@/types/maestro';

function nuevoId() {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/** Estructura típica de un proyecto de grado boliviano (cada sección mapea a módulos). */
function estructuraDefault(): SeccionDocumento[] {
  return [
    'Resumen ejecutivo',
    'Capítulo I — Generalidades (antecedentes, problema, objetivos, justificación)',
    'Capítulo II — Marco teórico y referencial',
    'Capítulo III — Análisis del entorno y mercado',
    'Capítulo IV — Propuesta estratégica y de marketing',
    'Capítulo V — Estructura organizacional y legal',
    'Capítulo VI — Estudio técnico',
    'Capítulo VII — Evaluación financiera',
    'Capítulo VIII — Conclusiones y recomendaciones',
    'Anexo — Preparación de defensa',
  ].map((titulo) => ({ id: nuevoId(), titulo, contenido: '' }));
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

  // Genera el contenido de una sección con IA usando el contexto del maestro.
  const generarSeccion = async (sec: SeccionDocumento): Promise<string | null> => {
    const tarea =
      `Redacta el contenido de la sección "${sec.titulo}" de un proyecto de grado para este negocio. ` +
      'Usa el trabajo real de los módulos vinculados (idea, mercados, estrategia, marketing, organización, finanzas, defensa) ' +
      'cuando aplique a esta sección. Redacta en prosa académica, español neutro boliviano (tuteo), concreto y sin inventar cifras como si fueran reales. ' +
      'Si falta información de un módulo, indícalo entre [corchetes] como pendiente.';
    const r = await fetch('/api/ai/asistir', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ modulo: 'generador', tarea, instruccion: '', maestroId: params.id, formato: 'texto' }),
    });
    const d = await r.json();
    return r.ok ? (d.texto ?? '') : null;
  };

  const generarUna = async (sec: SeccionDocumento) => {
    setGenerandoId(sec.id);
    try {
      const txt = await generarSeccion(sec);
      if (txt !== null) upd(sec.id, { contenido: txt });
    } finally { setGenerandoId(null); }
  };

  const generarVacias = async () => {
    setGenerandoTodas(true);
    try {
      for (const sec of secciones) {
        if (sec.contenido.trim()) continue;
        const txt = await generarSeccion(sec);
        if (txt !== null) setSecciones((s) => s.map((x) => (x.id === sec.id ? { ...x, contenido: txt } : x)));
      }
    } finally { setGenerandoTodas(false); }
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
    a.download = `${(maestro?.titulo ?? 'proyecto').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.md`;
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
            <button onClick={() => window.print()} className="gen-btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium"><Printer className="h-3.5 w-3.5" /> Imprimir</button>
          </div>
        )}
      </header>

      {secciones.length === 0 && (
        <div className="gen-card mt-6 p-8 text-center">
          <p className="text-3xl">📄</p>
          <p className="mt-3 font-semibold">Arma la estructura de tu proyecto</p>
          <p className="gen-muted mt-1 text-sm">Empieza con la estructura típica de un proyecto de grado y genera cada capítulo con IA, o créala desde cero.</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button onClick={() => setSecciones(estructuraDefault())} className="gen-btn-primary px-4 py-2 text-sm font-medium">Usar estructura de proyecto de grado</button>
            <button onClick={add} className="gen-btn-ghost inline-flex items-center gap-1 px-4 py-2 text-sm"><Plus className="h-4 w-4" /> Sección vacía</button>
          </div>
        </div>
      )}

      {secciones.length > 0 && (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-2 print:hidden">
            <button onClick={generarVacias} disabled={ocupado} className="gen-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium disabled:opacity-50">
              {generandoTodas ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generandoTodas ? 'Generando todas…' : 'Generar las vacías con IA'}
            </button>
            <button onClick={guardar} disabled={guardando} className="gen-btn-ghost px-4 py-2 text-sm font-medium disabled:opacity-50">{guardando ? 'Guardando…' : 'Guardar'}</button>
            {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
          </div>

          <div className="mt-4 space-y-4">
            {secciones.map((sec, i) => (
              <div key={sec.id} className="gen-card p-4">
                <div className="flex items-center gap-2">
                  <span className="gen-accent-soft gen-accent-text flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">{i + 1}</span>
                  <input value={sec.titulo} onChange={(e) => upd(sec.id, { titulo: e.target.value })}
                    className="gen-border flex-1 rounded border bg-white px-2 py-1 text-sm font-semibold focus:outline-none" />
                  <div className="flex flex-shrink-0 items-center gap-0.5 print:hidden">
                    <button onClick={() => mover(i, -1)} disabled={i === 0} className="gen-muted rounded p-1 hover:bg-teal-50 disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
                    <button onClick={() => mover(i, 1)} disabled={i === secciones.length - 1} className="gen-muted rounded p-1 hover:bg-teal-50 disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
                    <button onClick={() => del(sec.id)} className="text-slate-300 hover:text-rose-600"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <textarea value={sec.contenido} onChange={(e) => upd(sec.id, { contenido: e.target.value })} rows={sec.contenido ? 8 : 3}
                  placeholder="Contenido de la sección. Genera con IA o escribe directamente…"
                  className="gen-border mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm leading-relaxed focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200" />
                <div className="mt-2 print:hidden">
                  <button onClick={() => generarUna(sec)} disabled={ocupado} className="gen-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-50">
                    {generandoId === sec.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {generandoId === sec.id ? 'Generando…' : sec.contenido ? 'Regenerar con IA' : 'Generar con IA'}
                  </button>
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
