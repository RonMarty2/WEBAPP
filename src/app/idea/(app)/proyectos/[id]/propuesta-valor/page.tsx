'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Gift, Plus, X, Check, User, Package } from 'lucide-react';
import type { PropuestaValor } from '@/types/idea';

const VACIO: PropuestaValor = {
  trabajos: [], dolores: [], alegrias: [],
  productos: [], aliviadores: [], creadores: [],
};

export default function HerramientaPropuestaValor() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [pv, setPv] = useState<PropuestaValor>(VACIO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    fetch(`/api/idea/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (d.proyecto?.propuesta_valor) setPv({ ...VACIO, ...d.proyecto.propuesta_valor }); })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const set = (key: keyof PropuestaValor, v: string[]) => setPv((p) => ({ ...p, [key]: v }));

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
