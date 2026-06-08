'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMaestroActivo } from '@/lib/maestro/useMaestroActivo';
import { useEffect, useState } from 'react';
import { ArrowLeft, PieChart, Plus, X, Check, Sparkles, Loader2 } from 'lucide-react';
import type { Foda } from '@/types/estrategia';

const VACIO: Foda = {
  fortalezas: [], oportunidades: [], debilidades: [], amenazas: [],
  estrategias: { fo: [], do_: [], fa: [], da: [] },
};

export default function HerramientaFoda() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const maestroActivo = useMaestroActivo();
  const [foda, setFoda] = useState<Foda>(VACIO);
  const [titulo, setTitulo] = useState('');
  const [sector, setSector] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState('');
  const [generandoIA, setGenerandoIA] = useState(false);

  useEffect(() => {
    fetch(`/api/estrategia/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.proyecto) {
          setTitulo(d.proyecto.titulo ?? '');
          setSector(d.proyecto.sector ?? '');
          const f = d.proyecto.foda ?? {};
          setFoda({ ...VACIO, ...f, estrategias: { ...VACIO.estrategias, ...(f.estrategias ?? {}) } });
          // Pre-cargar F/O/D/A desde PESTEL (oportunidades/amenazas) si FODA vacío
          if ((!f.oportunidades || f.oportunidades.length === 0) && d.proyecto.pestel) {
            const px = d.proyecto.pestel;
            const todos = Object.values(px).flat() as Array<{ texto: string; impacto: number }>;
            const ops = todos.filter((x) => x.impacto > 0).map((x) => x.texto);
            const ams = todos.filter((x) => x.impacto < 0).map((x) => x.texto);
            if (ops.length || ams.length) {
              setFoda((prev) => ({ ...prev, oportunidades: ops.slice(0, 6), amenazas: ams.slice(0, 6) }));
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false); setErrorGuardar('');
    try {
      const res = await fetch(`/api/estrategia/proyectos/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ foda, estado: 'foda' }),
      });
      if (res.ok) {
        setGuardado(true);
        if (volver) router.push(`/estrategia/analisis/${params.id}`);
      } else {
        const d = await res.json().catch(() => ({}));
        setErrorGuardar(d.error || `No se pudo guardar (error ${res.status}). Intenta de nuevo.`);
      }
    } catch {
      setErrorGuardar('No se pudo guardar. Verifica tu conexión.');
    } finally {
      setGuardando(false);
    }
  };

  // Genera las estrategias cruzadas con IA usando F/O/D/A actuales
  const generarEstrategias = async () => {
    setGenerandoIA(true);
    try {
      const tarea =
        'A partir de este FODA, genera estrategias cruzadas. Devuelve EXACTAMENTE 4 bloques con este formato literal:\n' +
        'FO: <una estrategia ofensiva (fortaleza+oportunidad)>\n' +
        'DO: <una estrategia de reorientación (debilidad+oportunidad)>\n' +
        'FA: <una estrategia defensiva (fortaleza+amenaza)>\n' +
        'DA: <una estrategia de supervivencia (debilidad+amenaza)>';
      const instruccion =
        `PROYECTO: ${titulo}\nSECTOR: ${sector || 'no especificado'}\n\n` +
        `Fortalezas: ${foda.fortalezas.join('; ')}.\nOportunidades: ${foda.oportunidades.join('; ')}.\n` +
        `Debilidades: ${foda.debilidades.join('; ')}.\nAmenazas: ${foda.amenazas.join('; ')}.\n\n` +
        'IMPORTANTE: las estrategias deben ser ESPECÍFICAS a este proyecto y sector, no genéricas.';
      const res = await fetch('/api/ai/asistir', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ modulo: 'estrategia', tarea, instruccion, maestroId: maestroActivo?.id, formato: 'texto' }),
      });
      const d = await res.json();
      if (res.ok && d.texto) {
        const t: string = d.texto;
        const pick = (pref: string) =>
          t.split('\n').filter((l) => l.trim().toUpperCase().startsWith(pref))
            .map((l) => l.replace(new RegExp(`^\\s*${pref}:?\\s*`, 'i'), '').trim()).filter(Boolean);
        setFoda((prev) => ({
          ...prev,
          estrategias: {
            fo: [...prev.estrategias.fo, ...pick('FO')],
            do_: [...prev.estrategias.do_, ...pick('DO')],
            fa: [...prev.estrategias.fa, ...pick('FA')],
            da: [...prev.estrategias.da, ...pick('DA')],
          },
        }));
      }
    } finally { setGenerandoIA(false); }
  };

  if (cargando) return <div className="es-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/estrategia/analisis/${params.id}`} className="es-muted inline-flex items-center gap-1 text-sm hover:text-violet-700">
        <ArrowLeft className="h-4 w-4" /> Volver al análisis
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="es-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <PieChart className="es-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="es-accent-text text-xs font-semibold uppercase tracking-wider">Síntesis</p>
          <h1 className="text-2xl font-bold tracking-tight">FODA cruzada</h1>
        </div>
      </header>
      <p className="es-muted mt-2 text-sm">
        Reúne tus Fortalezas, Oportunidades, Debilidades y Amenazas (pre-cargamos las
        del PESTEL) y genera las estrategias cruzadas FO/DO/FA/DA.
      </p>

      {/* Cuadrantes FODA */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ListaFoda label="Fortalezas" color="emerald" items={foda.fortalezas} onChange={(v) => setFoda({ ...foda, fortalezas: v })} />
        <ListaFoda label="Oportunidades" color="sky" items={foda.oportunidades} onChange={(v) => setFoda({ ...foda, oportunidades: v })} />
        <ListaFoda label="Debilidades" color="amber" items={foda.debilidades} onChange={(v) => setFoda({ ...foda, debilidades: v })} />
        <ListaFoda label="Amenazas" color="rose" items={foda.amenazas} onChange={(v) => setFoda({ ...foda, amenazas: v })} />
      </div>

      {/* Generar estrategias */}
      <div className="es-card mt-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Estrategias cruzadas</h2>
            <p className="es-muted text-xs">FO ofensivas · DO reorientación · FA defensivas · DA supervivencia</p>
          </div>
          <button onClick={generarEstrategias} disabled={generandoIA} className="es-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium disabled:opacity-50">
            {generandoIA ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generandoIA ? 'Generando…' : 'Generar con IA'}
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ListaFoda label="Estrategias FO" color="emerald" items={foda.estrategias.fo} onChange={(v) => setFoda({ ...foda, estrategias: { ...foda.estrategias, fo: v } })} />
          <ListaFoda label="Estrategias DO" color="sky" items={foda.estrategias.do_} onChange={(v) => setFoda({ ...foda, estrategias: { ...foda.estrategias, do_: v } })} />
          <ListaFoda label="Estrategias FA" color="amber" items={foda.estrategias.fa} onChange={(v) => setFoda({ ...foda, estrategias: { ...foda.estrategias, fa: v } })} />
          <ListaFoda label="Estrategias DA" color="rose" items={foda.estrategias.da} onChange={(v) => setFoda({ ...foda, estrategias: { ...foda.estrategias, da: v } })} />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => guardar(false)} disabled={guardando} className="es-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50">
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
        <button onClick={() => guardar(true)} disabled={guardando} className="es-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50">
          Guardar y volver →
        </button>
        {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
        {errorGuardar && (
          <span className="text-sm text-rose-700" role="alert">{errorGuardar}</span>
        )}
      </div>
    </div>
  );
}

const COLORES: Record<string, string> = {
  emerald: 'border-emerald-200 bg-emerald-50',
  sky: 'border-sky-200 bg-sky-50',
  amber: 'border-amber-200 bg-amber-50',
  rose: 'border-rose-200 bg-rose-50',
};

function ListaFoda({ label, color, items, onChange }: { label: string; color: string; items: string[]; onChange: (v: string[]) => void }) {
  const [nuevo, setNuevo] = useState('');
  return (
    <div className={`rounded-xl border p-3 ${COLORES[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">{label}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-1.5 text-sm">
            <span className="flex-1">{it}</span>
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="mt-0.5 rounded p-0.5 text-slate-400 hover:bg-white hover:text-rose-600" aria-label={`Eliminar ${it}`}>
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-1">
        <input
          value={nuevo} onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && nuevo.trim()) { onChange([...items, nuevo.trim()]); setNuevo(''); } }}
          placeholder="Agregar…"
          className="flex-1 rounded-md border border-white/60 bg-white/70 px-2 py-1 text-xs focus:outline-none"
        />
        <button onClick={() => { if (nuevo.trim()) { onChange([...items, nuevo.trim()]); setNuevo(''); } }} className="rounded-md bg-white/70 px-2 py-1 text-xs hover:bg-white">
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
