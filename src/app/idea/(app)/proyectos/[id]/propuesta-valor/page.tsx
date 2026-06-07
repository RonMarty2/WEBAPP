'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Gift, Plus, X, Check, User, Package } from 'lucide-react';
import { SugerirIA } from '@/components/compartido/SugerirIA';
import type { PropuestaValor, LeanCanvas } from '@/types/idea';

const VACIO: PropuestaValor = {
  trabajos: [], dolores: [], alegrias: [],
  productos: [], aliviadores: [], creadores: [],
};

export default function HerramientaPropuestaValor() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [pv, setPv] = useState<PropuestaValor>(VACIO);
  const [titulo, setTitulo] = useState('');
  const [idea, setIdea] = useState('');
  const [sector, setSector] = useState('');
  const [leanCanvas, setLeanCanvas] = useState<Partial<LeanCanvas>>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    fetch(`/api/idea/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.proyecto) {
          setTitulo(d.proyecto.titulo ?? '');
          setIdea(d.proyecto.idea ?? '');
          setSector(d.proyecto.sector ?? '');
          setLeanCanvas(d.proyecto.lean_canvas ?? {});
          if (d.proyecto.propuesta_valor) setPv({ ...VACIO, ...d.proyecto.propuesta_valor });
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const set = (key: keyof PropuestaValor, v: string[]) => setPv((p) => ({ ...p, [key]: v }));

  /**
   * Aplica la sugerencia de la IA AGREGANDO items a las listas (no reemplaza).
   * El estudiante puede quitar lo que no le sirva con el botón X de cada item.
   */
  const aplicarIA = (texto: string) => {
    const get = (etiqueta: string): string[] => {
      const re = new RegExp(`^\\s*${etiqueta}\\s*:\\s*(.+)$`, 'im');
      const m = texto.match(re);
      if (!m) return [];
      return m[1].split(/[;,•]/).map((s) => s.replace(/^[-•]\s*/, '').trim()).filter(Boolean);
    };
    // Dedup case-insensitive con lo que ya existe.
    const merge = (actuales: string[], nuevos: string[]): string[] => {
      const yaPresentes = new Set(actuales.map((x) => x.toLowerCase()));
      return [...actuales, ...nuevos.filter((n) => !yaPresentes.has(n.toLowerCase()))];
    };
    setPv((prev) => ({
      trabajos: merge(prev.trabajos, get('Trabajos')),
      dolores: merge(prev.dolores, get('Dolores')),
      alegrias: merge(prev.alegrias, get('Alegr[íi]as')),
      productos: merge(prev.productos, get('Productos')),
      aliviadores: merge(prev.aliviadores, get('Aliviadores')),
      creadores: merge(prev.creadores, get('Creadores')),
    }));
  };

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const res = await fetch(`/api/idea/proyectos/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ propuesta_valor: pv, estado: 'valor' }),
      });
      if (res.ok) { setGuardado(true); if (volver) router.push(`/idea/proyectos/${params.id}`); }
    } finally { setGuardando(false); }
  };

  if (cargando) return <div className="idea-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-4xl pb-10">
      <Link href={`/idea/proyectos/${params.id}`} className="idea-muted inline-flex items-center gap-1 text-sm hover:text-amber-700">
        <ArrowLeft className="h-4 w-4" /> Volver a la idea
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="idea-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Gift className="idea-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="idea-accent-text text-xs font-semibold uppercase tracking-wider">Encaje cliente-producto</p>
          <h1 className="text-2xl font-bold tracking-tight">Propuesta de valor</h1>
        </div>
      </header>
      <p className="idea-muted mt-2 text-sm">
        A la izquierda, lo que vive tu cliente. A la derecha, cómo tu oferta
        responde. Hay encaje cuando tus aliviadores y creadores atacan los
        dolores y alegrías reales.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {/* Perfil del cliente */}
        <div className="idea-card p-4">
          <div className="flex items-center gap-2">
            <User className="idea-accent-text h-4 w-4" />
            <h2 className="text-sm font-semibold">Perfil del cliente</h2>
          </div>
          <Lista label="Trabajos (qué intenta lograr)" color="sky" items={pv.trabajos} onChange={(v) => set('trabajos', v)} placeholder="Ej: Comer sano sin perder tiempo" />
          <Lista label="Dolores (frustraciones)" color="rose" items={pv.dolores} onChange={(v) => set('dolores', v)} placeholder="Ej: Las filas al mediodía" />
          <Lista label="Alegrías (beneficios deseados)" color="emerald" items={pv.alegrias} onChange={(v) => set('alegrias', v)} placeholder="Ej: Sentirse con energía en la tarde" />
        </div>

        {/* Mapa de valor */}
        <div className="idea-card p-4">
          <div className="flex items-center gap-2">
            <Package className="idea-accent-text h-4 w-4" />
            <h2 className="text-sm font-semibold">Mapa de valor</h2>
          </div>
          <Lista label="Productos y servicios" color="amber" items={pv.productos} onChange={(v) => set('productos', v)} placeholder="Ej: Almuerzo casero a domicilio" />
          <Lista label="Aliviadores de dolores" color="rose" items={pv.aliviadores} onChange={(v) => set('aliviadores', v)} placeholder="Ej: Pre-pedido sin filas" />
          <Lista label="Creadores de alegrías" color="emerald" items={pv.creadores} onChange={(v) => set('creadores', v)} placeholder="Ej: Menú balanceado por nutricionista" />
        </div>
      </div>

      {/* Sugerir con IA — agrega items a las 6 listas sin reemplazar lo existente */}
      <div className="mt-4">
        <SugerirIA
          modulo="idea"
          tarea={
            'Para una Propuesta de Valor (VPC) de esta idea en Bolivia, propón ítems concretos. ' +
            'Devuelve EXACTAMENTE 6 líneas con este formato literal (separa con punto y coma):\n' +
            'Trabajos: trabajo 1; trabajo 2; trabajo 3\n' +
            'Dolores: dolor 1; dolor 2; dolor 3\n' +
            'Alegrías: alegría 1; alegría 2; alegría 3\n' +
            'Productos: producto 1; producto 2\n' +
            'Aliviadores: aliviador 1; aliviador 2; aliviador 3\n' +
            'Creadores: creador 1; creador 2; creador 3\n' +
            'Sé específico y aterrizado al contexto, no genérico.'
          }
          formato="texto"
          acentoClase="idea-accent-bg text-white"
          placeholder={
            `Idea: ${idea || titulo}. Sector: ${sector || '—'}.` +
            (leanCanvas.problema ? ` Problema del Lean Canvas: ${leanCanvas.problema}.` : '') +
            (leanCanvas.segmentos ? ` Segmento: ${leanCanvas.segmentos}.` : '') +
            (pv.trabajos.length || pv.dolores.length
              ? ` Ya tengo: trabajos=[${pv.trabajos.join(', ')}], dolores=[${pv.dolores.join(', ')}]. Complementa, no repitas.`
              : '')
          }
          onAplicar={aplicarIA}
        />
        <p className="idea-muted mt-2 text-xs">
          La IA <strong>agrega</strong> sugerencias a tus listas sin borrar lo que ya tienes.
          Usa el botón <X className="inline h-3 w-3" /> de cada ítem para quitar lo que no te sirva.
        </p>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => guardar(false)} disabled={guardando} className="idea-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50">{guardando ? 'Guardando…' : 'Guardar'}</button>
        <button onClick={() => guardar(true)} disabled={guardando} className="idea-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50">Guardar y volver →</button>
        {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
      </div>
    </div>
  );
}

const COLORES: Record<string, string> = {
  sky: 'border-sky-200 bg-sky-50',
  rose: 'border-rose-200 bg-rose-50',
  emerald: 'border-emerald-200 bg-emerald-50',
  amber: 'border-amber-200 bg-amber-50',
};

function Lista({ label, color, items, onChange, placeholder }: {
  label: string; color: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [nuevo, setNuevo] = useState('');
  return (
    <div className={`mt-3 rounded-xl border p-3 ${COLORES[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">{label}</p>
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
          placeholder={placeholder ?? 'Agregar…'}
          className="flex-1 rounded-md border border-white/60 bg-white/70 px-2 py-1 text-xs focus:outline-none"
        />
        <button onClick={() => { if (nuevo.trim()) { onChange([...items, nuevo.trim()]); setNuevo(''); } }} className="rounded-md bg-white/70 px-2 py-1 text-xs hover:bg-white">
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
