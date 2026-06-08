'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, UserRound, Plus, X, Check } from 'lucide-react';
import { SugerirIA } from '@/components/compartido/SugerirIA';
import type { BuyerPersona } from '@/types/marketing';

const VACIO: BuyerPersona = {
  nombre: '', edad: '', ocupacion: '', ubicacion: '',
  metas: [], frustraciones: [], canales: [], cita: '',
};

const SUGERENCIAS_CANALES = [
  'Instagram', 'TikTok', 'Facebook', 'WhatsApp', 'YouTube',
  'Cine en cafés', 'Google Maps', 'Mercado local', 'Voz a voz',
];

export default function HerramientaBuyerPersona() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [bp, setBp] = useState<BuyerPersona>(VACIO);
  const [titulo, setTitulo] = useState('');
  const [marca, setMarca] = useState('');
  const [sector, setSector] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState('');

  useEffect(() => {
    fetch(`/api/marketing/planes/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.plan) {
          setTitulo(d.plan.titulo ?? '');
          setMarca(d.plan.marca ?? '');
          setSector(d.plan.sector ?? '');
          const x = d.plan.buyer_persona;
          if (x && Object.keys(x).length) setBp({ ...VACIO, ...x });
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const set = <K extends keyof BuyerPersona>(key: K, val: BuyerPersona[K]) =>
    setBp((p) => ({ ...p, [key]: val }));

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false); setErrorGuardar('');
    try {
      const res = await fetch(`/api/marketing/planes/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ buyer_persona: bp, estado: 'persona' }),
      });
      if (res.ok) {
        setGuardado(true);
        if (volver) router.push(`/marketing/planes/${params.id}`);
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

  // Aplica una sugerencia IA en texto plano: la IA devuelve líneas tipo
  // "Nombre: …\nEdad: …\nOcupación: …\nMetas: x; y; z\n…"
  const aplicarIA = (texto: string) => {
    const lineas = texto.split('\n').map((l) => l.trim()).filter(Boolean);
    const get = (p: string): string => {
      const l = lineas.find((x) => new RegExp(`^${p}\\s*:`, 'i').test(x));
      return l ? l.replace(new RegExp(`^${p}\\s*:\\s*`, 'i'), '').trim() : '';
    };
    const lista = (p: string): string[] => {
      const v = get(p);
      if (!v) return [];
      return v.split(/[;•]|\s*\d+\.\s*/).map((s) => s.trim()).filter(Boolean);
    };
    setBp((prev) => ({
      ...prev,
      nombre: get('Nombre') || prev.nombre,
      edad: get('Edad') || prev.edad,
      ocupacion: get('Ocupación') || get('Ocupacion') || prev.ocupacion,
      ubicacion: get('Ubicación') || get('Ubicacion') || prev.ubicacion,
      metas: lista('Metas').length ? lista('Metas') : prev.metas,
      frustraciones: lista('Frustraciones').length ? lista('Frustraciones') : prev.frustraciones,
      canales: lista('Canales').length ? lista('Canales') : prev.canales,
      cita: get('Cita') || prev.cita,
    }));
  };

  if (cargando) return <div className="mkt-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/marketing/planes/${params.id}`} className="mkt-muted inline-flex items-center gap-1 text-sm hover:text-rose-700">
        <ArrowLeft className="h-4 w-4" /> Volver al plan
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="mkt-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <UserRound className="mkt-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="mkt-accent-text text-xs font-semibold uppercase tracking-wider">Tu cliente ideal</p>
          <h1 className="text-2xl font-bold tracking-tight">Buyer persona</h1>
        </div>
      </header>
      <p className="mkt-muted mt-2 text-sm">
        Dale rostro y voz a tu cliente. Cuando piensas en una persona concreta,
        tu producto, tu copy y tus canales se vuelven mucho más claros.
      </p>

      {/* Datos básicos */}
      <div className="mkt-card mt-5 p-5">
        <h2 className="text-sm font-semibold">¿Quién es?</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Campo label="Nombre ficticio" value={bp.nombre} onChange={(v) => set('nombre', v)} placeholder="Ej: Daniela Quispe" />
          <Campo label="Edad" value={bp.edad} onChange={(v) => set('edad', v)} placeholder="Ej: 27 años" />
          <Campo label="Ocupación" value={bp.ocupacion} onChange={(v) => set('ocupacion', v)} placeholder="Ej: Diseñadora freelance" />
          <Campo label="Ubicación" value={bp.ubicacion} onChange={(v) => set('ubicacion', v)} placeholder="Ej: Cochabamba, zona Recoleta" />
        </div>
      </div>

      {/* Metas y frustraciones */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Lista label="¿Qué quiere lograr? (metas)" color="emerald" items={bp.metas} onChange={(v) => set('metas', v)} placeholder="Ej: Encontrar un café que se sienta como su oficina" />
        <Lista label="¿Qué le duele o frena? (frustraciones)" color="rose" items={bp.frustraciones} onChange={(v) => set('frustraciones', v)} placeholder="Ej: Que su internet en casa sea inestable" />
      </div>

      {/* Canales */}
      <div className="mkt-card mt-4 p-5">
        <h2 className="text-sm font-semibold">¿Dónde está? (canales)</h2>
        <p className="mkt-muted text-xs">Apps, redes y lugares donde pasa tiempo y toma decisiones.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SUGERENCIAS_CANALES.map((c) => {
            const activo = bp.canales.includes(c);
            return (
              <button
                key={c}
                onClick={() => set('canales', activo ? bp.canales.filter((x) => x !== c) : [...bp.canales, c])}
                className={`rounded-full border px-3 py-1 text-xs transition ${activo ? 'mkt-accent-bg border-transparent text-white' : 'mkt-border mkt-muted hover:bg-rose-50'}`}
              >
                {c}
              </button>
            );
          })}
        </div>
        <ListaCanal items={bp.canales} onChange={(v) => set('canales', v)} />
      </div>

      {/* Cita */}
      <div className="mkt-card mt-4 p-5">
        <h2 className="text-sm font-semibold">Una frase que lo define</h2>
        <p className="mkt-muted text-xs">Como si te la hubiera dicho él/ella en una entrevista.</p>
        <textarea
          value={bp.cita}
          onChange={(e) => set('cita', e.target.value)}
          rows={2}
          placeholder='Ej: "Necesito un lugar tranquilo para trabajar sin que me apuren con la cuenta."'
          className="mkt-border mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm italic focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
      </div>

      {/* IA */}
      <div className="mt-4">
        <SugerirIA
          modulo="marketing"
          tarea={
            'Propón un buyer persona realista para este negocio en Bolivia. Devuelve EXACTAMENTE estas líneas (formato literal):\n' +
            'Nombre: <nombre y apellido ficticios>\nEdad: <edad>\nOcupación: <ocupación>\nUbicación: <ciudad/zona en Bolivia>\n' +
            'Metas: <meta 1>; <meta 2>; <meta 3>\nFrustraciones: <frustración 1>; <frustración 2>; <frustración 3>\n' +
            'Canales: <canal 1>; <canal 2>; <canal 3>\nCita: <frase corta entre comillas>'
          }
          formato="texto"
          acentoClase="mkt-accent-bg text-white"
          contexto={
            `PRODUCTO/MARCA: ${marca || titulo}\nSECTOR: ${sector || 'no especificado'}\n\n` +
            'IMPORTANTE: el buyer persona debe corresponder a ESTE producto/negocio y sector, no a uno genérico.'
          }
          placeholder="Detalle opcional para afinar la sugerencia…"
          onAplicar={aplicarIA}
        />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => guardar(false)} disabled={guardando} className="mkt-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50">
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
        <button onClick={() => guardar(true)} disabled={guardando} className="mkt-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50">
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

function Campo({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mkt-muted text-xs font-medium">{label}</span>
      <input
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mkt-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
      />
    </label>
  );
}

const COLORES_LISTA: Record<string, string> = {
  emerald: 'border-emerald-200 bg-emerald-50',
  rose: 'border-rose-200 bg-rose-50',
};

function Lista({ label, color, items, onChange, placeholder }: {
  label: string; color: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [nuevo, setNuevo] = useState('');
  return (
    <div className={`rounded-xl border p-3 ${COLORES_LISTA[color]}`}>
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
          placeholder={placeholder ?? 'Agregar…'}
          className="flex-1 rounded-md border border-white/60 bg-white/70 px-2 py-1 text-xs focus:outline-none"
        />
        <button onClick={() => { if (nuevo.trim()) { onChange([...items, nuevo.trim()]); setNuevo(''); } }} className="rounded-md bg-white/70 px-2 py-1 text-xs hover:bg-white" aria-label={`Agregar a ${label}`}>
          <Plus className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function ListaCanal({ items, onChange }: { items: string[]; onChange: (v: string[]) => void }) {
  const [nuevo, setNuevo] = useState('');
  // Solo muestra los canales personalizados (no estándar) para no duplicar las píldoras.
  const personalizados = items.filter((c) => !SUGERENCIAS_CANALES.includes(c));
  return (
    <div className="mt-3">
      {personalizados.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-2">
          {personalizados.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-700">
              {c}
              <button onClick={() => onChange(items.filter((x) => x !== c))} className="rounded p-0.5 hover:bg-white" aria-label={`Eliminar canal ${c}`}>
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="mt-2 flex gap-1">
        <input
          value={nuevo} onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && nuevo.trim() && !items.includes(nuevo.trim())) { onChange([...items, nuevo.trim()]); setNuevo(''); } }}
          placeholder="Otro canal…"
          className="mkt-border flex-1 rounded-md border bg-white px-2 py-1 text-xs focus:outline-none"
        />
        <button onClick={() => { const v = nuevo.trim(); if (v && !items.includes(v)) { onChange([...items, v]); setNuevo(''); } }} className="mkt-border rounded-md border px-2 py-1 text-xs hover:bg-rose-50">
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
