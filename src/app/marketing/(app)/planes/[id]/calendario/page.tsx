'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Plus, X, Check, Sparkles, Loader2 } from 'lucide-react';
import type { Calendario, EstadoPublicacion, PublicacionCalendario } from '@/types/marketing';

const VACIO: Calendario = { publicaciones: [] };

const TIPOS = ['Post', 'Reel', 'Historia', 'Video', 'Carrusel', 'Correo', 'Blog'];
const CANALES = ['Instagram', 'TikTok', 'Facebook', 'YouTube', 'WhatsApp', 'Correo', 'Blog'];

const ESTADO_LABEL: Record<EstadoPublicacion, { txt: string; clase: string }> = {
  idea: { txt: 'Idea', clase: 'bg-slate-100 text-slate-700' },
  listo: { txt: 'Listo', clase: 'bg-amber-100 text-amber-800' },
  publicado: { txt: 'Publicado', clase: 'bg-emerald-100 text-emerald-800' },
};

function hoy() { return new Date().toISOString().slice(0, 10); }
function masDias(d: string, n: number) {
  const fecha = new Date(d); fecha.setDate(fecha.getDate() + n);
  return fecha.toISOString().slice(0, 10);
}

export default function HerramientaCalendario() {
  const params = useParams<{ id: string }>();
  const [cal, setCal] = useState<Calendario>(VACIO);
  const [titulo, setTitulo] = useState('');
  const [marca, setMarca] = useState('');
  const [sector, setSector] = useState('');
  const [filtro, setFiltro] = useState<EstadoPublicacion | 'todos'>('todos');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [generandoIA, setGenerandoIA] = useState(false);

  useEffect(() => {
    fetch(`/api/marketing/planes/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.plan) {
          setTitulo(d.plan.titulo ?? '');
          setMarca(d.plan.marca ?? '');
          setSector(d.plan.sector ?? '');
          const c = d.plan.calendario;
          if (c?.publicaciones?.length) setCal({ publicaciones: c.publicaciones });
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const ordenadas = [...cal.publicaciones].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const filtradas = filtro === 'todos' ? ordenadas : ordenadas.filter((p) => p.estado === filtro);

  const conteo = (e: EstadoPublicacion) => cal.publicaciones.filter((p) => p.estado === e).length;

  const addPub = () => setCal((c) => ({
    publicaciones: [...c.publicaciones, { fecha: hoy(), canal: 'Instagram', tipo: 'Post', copy: '', estado: 'idea' }],
  }));
  const upd = (idx: number, c: Partial<PublicacionCalendario>) => {
    // El índice se aplica sobre el array ordenado mostrado → traducir al original
    const original = cal.publicaciones.indexOf(filtradas[idx]);
    if (original < 0) return;
    setCal((prev) => ({
      publicaciones: prev.publicaciones.map((p, i) => (i === original ? { ...p, ...c } : p)),
    }));
  };
  const del = (idx: number) => {
    const original = cal.publicaciones.indexOf(filtradas[idx]);
    if (original < 0) return;
    setCal((prev) => ({ publicaciones: prev.publicaciones.filter((_, i) => i !== original) }));
  };

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const res = await fetch(`/api/marketing/planes/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ calendario: cal, estado: 'calendario' }),
      });
      if (res.ok) { setGuardado(true); if (volver) window.location.href = `/marketing/planes/${params.id}`; }
    } finally { setGuardando(false); }
  };

  /** Genera un calendario base de 4 semanas (12 piezas) con IA. */
  const generarIA = async () => {
    setGenerandoIA(true);
    try {
      const tarea =
        'Para el plan de contenidos de las próximas 4 semanas de este negocio en Bolivia, propón 12 piezas. Devuelve EXACTAMENTE 12 líneas con este formato literal (una pieza por línea):\n' +
        '<canal> | <tipo> | <copy de 1-2 líneas>\n' +
        'Donde canal ∈ {Instagram, TikTok, Facebook, WhatsApp}, tipo ∈ {Post, Reel, Historia, Carrusel, Video}.';
      const instruccion = `Producto/marca: ${marca || titulo}. Sector: ${sector || '—'}.`;
      const res = await fetch('/api/ai/asistir', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ modulo: 'marketing', tarea, instruccion, formato: 'texto' }),
      });
      const d = await res.json();
      if (res.ok && d.texto) {
        const lineas: string[] = d.texto.split('\n').map((l: string) => l.trim()).filter(Boolean);
        const nuevas: PublicacionCalendario[] = [];
        let dia = 0;
        for (const l of lineas) {
          if (nuevas.length >= 12) break;
          // Limpia bullets como "- ", "• ", "1. "
          const limpia = l.replace(/^[-•]\s*|^\d+[.)]\s*/, '');
          const [canal, tipo, ...rest] = limpia.split('|').map((s) => s.trim());
          if (!canal || !tipo || rest.length === 0) continue;
          nuevas.push({
            fecha: masDias(hoy(), dia),
            canal: canal.slice(0, 60),
            tipo: tipo.slice(0, 30),
            copy: rest.join(' | ').slice(0, 400),
            estado: 'idea',
          });
          dia += Math.ceil(28 / 12); // ~12 piezas en 28 días
        }
        if (nuevas.length) setCal((prev) => ({ publicaciones: [...prev.publicaciones, ...nuevas] }));
      }
    } finally { setGenerandoIA(false); }
  };

  if (cargando) return <div className="mkt-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-4xl pb-10">
      <Link href={`/marketing/planes/${params.id}`} className="mkt-muted inline-flex items-center gap-1 text-sm hover:text-rose-700">
        <ArrowLeft className="h-4 w-4" /> Volver al plan
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="mkt-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <CalendarDays className="mkt-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="mkt-accent-text text-xs font-semibold uppercase tracking-wider">Plan de contenidos</p>
          <h1 className="text-2xl font-bold tracking-tight">Calendario editorial</h1>
        </div>
      </header>
      <p className="mkt-muted mt-2 text-sm">
        Programa tus publicaciones por fecha, canal y tipo. El estado te muestra
        qué falta producir y qué ya está en la calle.
      </p>

      {/* Resumen */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(['todos', 'idea', 'listo', 'publicado'] as const).map((e) => {
            const activo = filtro === e;
            const txt = e === 'todos' ? `Todos · ${cal.publicaciones.length}` : `${ESTADO_LABEL[e].txt} · ${conteo(e)}`;
            return (
              <button
                key={e}
                onClick={() => setFiltro(e)}
                className={`rounded-full border px-3 py-1 text-xs transition ${activo ? 'mkt-accent-bg border-transparent text-white' : 'mkt-border mkt-muted hover:bg-rose-50'}`}
              >
                {txt}
              </button>
            );
          })}
        </div>
        <button onClick={generarIA} disabled={generandoIA} className="mkt-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium disabled:opacity-50">
          {generandoIA ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {generandoIA ? 'Generando…' : 'Generar 4 semanas con IA'}
        </button>
      </div>

      {filtradas.length === 0 && (
        <div className="mkt-card mt-5 p-8 text-center">
          <p className="text-3xl">🗓️</p>
          <p className="mt-3 font-semibold">{filtro === 'todos' ? 'Aún no hay publicaciones' : 'No hay publicaciones con ese estado'}</p>
          <p className="mkt-muted mt-1 text-sm">{filtro === 'todos' ? 'Empieza agregando una o genera 4 semanas con IA.' : 'Cambia el filtro o agrega una nueva.'}</p>
          {filtro === 'todos' && (
            <button onClick={addPub} className="mkt-btn-ghost mt-3 inline-flex items-center gap-1 px-4 py-2 text-sm">
              <Plus className="h-4 w-4" /> Agregar publicación
            </button>
          )}
        </div>
      )}

      {filtradas.length > 0 && (
        <div className="mt-4 space-y-2">
          {filtradas.map((p, i) => (
            <div key={`${p.fecha}-${i}`} className="mkt-card flex flex-wrap items-start gap-2 p-3">
              <input
                type="date" value={p.fecha} onChange={(e) => upd(i, { fecha: e.target.value })}
                className="mkt-border w-36 rounded border px-2 py-1 text-sm"
              />
              <select value={p.canal} onChange={(e) => upd(i, { canal: e.target.value })} className="mkt-border rounded border px-2 py-1 text-sm">
                {CANALES.map((c) => <option key={c} value={c}>{c}</option>)}
                {!CANALES.includes(p.canal) && <option value={p.canal}>{p.canal}</option>}
              </select>
              <select value={p.tipo} onChange={(e) => upd(i, { tipo: e.target.value })} className="mkt-border rounded border px-2 py-1 text-sm">
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                {!TIPOS.includes(p.tipo) && <option value={p.tipo}>{p.tipo}</option>}
              </select>
              <select value={p.estado} onChange={(e) => upd(i, { estado: e.target.value as EstadoPublicacion })}
                className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${ESTADO_LABEL[p.estado].clase}`}>
                <option value="idea">Idea</option>
                <option value="listo">Listo</option>
                <option value="publicado">Publicado</option>
              </select>
              <textarea
                value={p.copy} onChange={(e) => upd(i, { copy: e.target.value })}
                rows={2} placeholder="Idea o copy de la pieza…"
                className="mkt-border w-full flex-1 rounded border px-2 py-1 text-sm sm:w-auto"
              />
              <button onClick={() => del(i)} className="mkt-muted rounded p-1 hover:bg-rose-50 hover:text-rose-600" title="Eliminar">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button onClick={addPub} className="mkt-btn-ghost mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Agregar publicación
          </button>
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => guardar(false)} disabled={guardando} className="mkt-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50">
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
        <button onClick={() => guardar(true)} disabled={guardando} className="mkt-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50">
          Guardar y volver →
        </button>
        {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
      </div>
    </div>
  );
}
