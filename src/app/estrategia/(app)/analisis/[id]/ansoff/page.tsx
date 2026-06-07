'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMaestroActivo } from '@/lib/maestro/useMaestroActivo';
import { useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, Plus, X, Check, Sparkles, Loader2 } from 'lucide-react';
import type { Ansoff } from '@/types/estrategia';

const VACIO: Ansoff = { penetracion: [], desarrolloProducto: [], desarrolloMercado: [], diversificacion: [] };

/** Los 4 cuadrantes de Ansoff (riesgo creciente). */
const CUADRANTES = [
  { key: 'penetracion', label: 'Penetración de mercado', sub: 'Producto actual · Mercado actual', riesgo: 'Riesgo bajo', color: 'emerald' },
  { key: 'desarrolloProducto', label: 'Desarrollo de producto', sub: 'Producto nuevo · Mercado actual', riesgo: 'Riesgo medio', color: 'sky' },
  { key: 'desarrolloMercado', label: 'Desarrollo de mercado', sub: 'Producto actual · Mercado nuevo', riesgo: 'Riesgo medio', color: 'amber' },
  { key: 'diversificacion', label: 'Diversificación', sub: 'Producto nuevo · Mercado nuevo', riesgo: 'Riesgo alto', color: 'rose' },
] as const;

export default function HerramientaAnsoff() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const maestroActivo = useMaestroActivo();
  const [ansoff, setAnsoff] = useState<Ansoff>(VACIO);
  const [titulo, setTitulo] = useState('');
  const [sector, setSector] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [generandoIA, setGenerandoIA] = useState(false);

  useEffect(() => {
    fetch(`/api/estrategia/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.proyecto) {
          setTitulo(d.proyecto.titulo ?? '');
          setSector(d.proyecto.sector ?? '');
          const a = d.proyecto.ansoff ?? {};
          setAnsoff({ ...VACIO, ...a });
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const setLista = (key: keyof Ansoff, v: string[]) => setAnsoff((a) => ({ ...a, [key]: v }));

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const res = await fetch(`/api/estrategia/proyectos/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ ansoff }),
      });
      if (res.ok) { setGuardado(true); if (volver) router.push(`/estrategia/analisis/${params.id}`); }
    } finally { setGuardando(false); }
  };

  // Genera iniciativas para los 4 cuadrantes con IA.
  const generarIA = async () => {
    setGenerandoIA(true);
    try {
      const tarea =
        'Para una matriz de Ansoff de este negocio, propón iniciativas de crecimiento. Devuelve EXACTAMENTE 4 bloques con este formato literal (una iniciativa por línea, puedes dar 2 por bloque):\n' +
        'PEN: <iniciativa de penetración de mercado>\n' +
        'PROD: <iniciativa de desarrollo de producto>\n' +
        'MERC: <iniciativa de desarrollo de mercado>\n' +
        'DIV: <iniciativa de diversificación>';
      const instruccion = `Negocio/sector: ${sector || titulo || 'proyecto en Bolivia'}.`;
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
        setAnsoff((prev) => ({
          penetracion: [...prev.penetracion, ...pick('PEN')],
          desarrolloProducto: [...prev.desarrolloProducto, ...pick('PROD')],
          desarrolloMercado: [...prev.desarrolloMercado, ...pick('MERC')],
          diversificacion: [...prev.diversificacion, ...pick('DIV')],
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
          <TrendingUp className="es-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="es-accent-text text-xs font-semibold uppercase tracking-wider">Crecimiento</p>
          <h1 className="text-2xl font-bold tracking-tight">Matriz de Ansoff</h1>
        </div>
      </header>
      <p className="es-muted mt-2 text-sm">
        Define cómo va a crecer tu negocio según combines productos y mercados
        actuales o nuevos. El riesgo aumenta de la penetración a la diversificación.
      </p>

      <div className="mt-4 flex justify-end">
        <button onClick={generarIA} disabled={generandoIA} className="es-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium disabled:opacity-50">
          {generandoIA ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {generandoIA ? 'Generando…' : 'Sugerir con IA'}
        </button>
      </div>

      {/* Cuadrantes 2x2 */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {CUADRANTES.map((c) => (
          <ListaAnsoff
            key={c.key}
            label={c.label}
            sub={c.sub}
            riesgo={c.riesgo}
            color={c.color}
            items={ansoff[c.key]}
            onChange={(v) => setLista(c.key, v)}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => guardar(false)} disabled={guardando} className="es-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50">
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
        <button onClick={() => guardar(true)} disabled={guardando} className="es-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50">
          Guardar y volver →
        </button>
        {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
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
const BADGE: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700',
  sky: 'bg-sky-100 text-sky-700',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-700',
};

function ListaAnsoff({ label, sub, riesgo, color, items, onChange }: {
  label: string; sub: string; riesgo: string; color: string; items: string[]; onChange: (v: string[]) => void;
}) {
  const [nuevo, setNuevo] = useState('');
  return (
    <div className={`rounded-xl border p-3 ${COLORES[color]}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          <p className="text-[11px] text-slate-500">{sub}</p>
        </div>
        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${BADGE[color]}`}>{riesgo}</span>
      </div>
      <ul className="mt-2 space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-1.5 text-sm">
            <span className="flex-1">{it}</span>
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="mt-0.5 rounded p-0.5 text-slate-400 hover:bg-white hover:text-rose-600">
              <X className="h-3 w-3" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-1">
        <input
          value={nuevo} onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && nuevo.trim()) { onChange([...items, nuevo.trim()]); setNuevo(''); } }}
          placeholder="Agregar iniciativa…"
          className="flex-1 rounded-md border border-white/60 bg-white/70 px-2 py-1 text-xs focus:outline-none"
        />
        <button onClick={() => { if (nuevo.trim()) { onChange([...items, nuevo.trim()]); setNuevo(''); } }} className="rounded-md bg-white/70 px-2 py-1 text-xs hover:bg-white">
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
