'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, ListChecks, Plus, X, Check, Sparkles, Loader2 } from 'lucide-react';
import type { BancoPreguntas, Pregunta } from '@/types/defensa';

const VACIO: BancoPreguntas = { items: [] };

const CATEGORIAS = ['Marco teórico', 'Metodología', 'Resultados', 'Viabilidad', 'Aporte/Originalidad', 'Personal'];

function nuevoId() {
  return `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export default function HerramientaPreguntas() {
  const params = useParams<{ id: string }>();
  const [banco, setBanco] = useState<BancoPreguntas>(VACIO);
  const [titulo, setTitulo] = useState('');
  const [tema, setTema] = useState('');
  const [carrera, setCarrera] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [generandoIA, setGenerandoIA] = useState(false);

  useEffect(() => {
    fetch(`/api/defensa/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.proyecto) {
          setTitulo(d.proyecto.titulo ?? '');
          setTema(d.proyecto.tema ?? '');
          setCarrera(d.proyecto.carrera ?? '');
          if (d.proyecto.preguntas?.items) setBanco({ items: d.proyecto.preguntas.items });
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const add = () => setBanco((b) => ({ items: [...b.items, { id: nuevoId(), categoria: CATEGORIAS[0], pregunta: '', puntosClave: '' }] }));
  const upd = (id: string, c: Partial<Pregunta>) => setBanco((b) => ({ items: b.items.map((q) => (q.id === id ? { ...q, ...c } : q)) }));
  const del = (id: string) => setBanco((b) => ({ items: b.items.filter((q) => q.id !== id) }));

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const res = await fetch(`/api/defensa/proyectos/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ preguntas: banco, estado: 'preguntas' }),
      });
      if (res.ok) { setGuardado(true); if (volver) window.location.href = `/defensa/proyectos/${params.id}`; }
    } finally { setGuardando(false); }
  };

  const generarIA = async () => {
    setGenerandoIA(true);
    try {
      const tarea =
        'Eres un tribunal de defensa. Genera 8 preguntas difíciles pero justas para defender este trabajo. ' +
        'Devuelve EXACTAMENTE 8 líneas con este formato literal (separadores con |):\n' +
        '<categoría> | <pregunta> | <qué debería incluir una buena respuesta>\n' +
        'Categorías válidas: Marco teórico, Metodología, Resultados, Viabilidad, Aporte/Originalidad, Personal.';
      const instruccion = `Trabajo: ${titulo}. Tema: ${tema || '—'}. Carrera: ${carrera || '—'}.`;
      const res = await fetch('/api/ai/asistir', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ modulo: 'defensa', tarea, instruccion, formato: 'texto' }),
      });
      const d = await res.json();
      if (res.ok && d.texto) {
        const nuevas: Pregunta[] = [];
        for (const l of (d.texto as string).split('\n').map((x) => x.trim()).filter(Boolean)) {
          const limpia = l.replace(/^[-•]\s*|^\d+[.)]\s*/, '');
          const [categoria, pregunta, puntosClave] = limpia.split('|').map((s) => s.trim());
          if (!pregunta) continue;
          nuevas.push({
            id: nuevoId(),
            categoria: CATEGORIAS.includes(categoria) ? categoria : (categoria || 'Marco teórico'),
            pregunta,
            puntosClave: puntosClave ?? '',
          });
        }
        if (nuevas.length) setBanco((b) => ({ items: [...b.items, ...nuevas] }));
      }
    } finally { setGenerandoIA(false); }
  };

  if (cargando) return <div className="def-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/defensa/proyectos/${params.id}`} className="def-muted inline-flex items-center gap-1 text-sm hover:text-indigo-700">
        <ArrowLeft className="h-4 w-4" /> Volver a la preparación
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="def-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <ListChecks className="def-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="def-accent-text text-xs font-semibold uppercase tracking-wider">Anticipa al tribunal</p>
          <h1 className="text-2xl font-bold tracking-tight">Banco de preguntas</h1>
        </div>
      </header>
      <p className="def-muted mt-2 text-sm">
        Reúne las preguntas que podrían hacerte y anota los puntos clave de una
        buena respuesta. Luego las practicas en el simulacro.
      </p>

      <div className="mt-4 flex justify-end">
        <button onClick={generarIA} disabled={generandoIA} className="def-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium disabled:opacity-50">
          {generandoIA ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {generandoIA ? 'Generando…' : 'Generar 8 con IA'}
        </button>
      </div>

      {banco.items.length === 0 && (
        <div className="def-card mt-3 p-8 text-center">
          <p className="text-3xl">🎓</p>
          <p className="mt-3 font-semibold">Aún no hay preguntas</p>
          <p className="def-muted mt-1 text-sm">Genera 8 con IA según tu tema, o agrégalas manualmente.</p>
          <button onClick={add} className="def-btn-ghost mt-3 inline-flex items-center gap-1 px-4 py-2 text-sm"><Plus className="h-4 w-4" /> Agregar pregunta</button>
        </div>
      )}

      {banco.items.length > 0 && (
        <div className="mt-3 space-y-3">
          {banco.items.map((q, i) => (
            <div key={q.id} className="def-card p-4">
              <div className="flex items-start gap-2">
                <span className="def-accent-soft def-accent-text flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">{i + 1}</span>
                <select value={q.categoria} onChange={(e) => upd(q.id, { categoria: e.target.value })}
                  className="def-border rounded border px-2 py-1 text-xs">
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  {!CATEGORIAS.includes(q.categoria) && <option value={q.categoria}>{q.categoria}</option>}
                </select>
                <button onClick={() => del(q.id)} className="ml-auto text-slate-300 hover:text-rose-600"><X className="h-4 w-4" /></button>
              </div>
              <textarea value={q.pregunta} onChange={(e) => upd(q.id, { pregunta: e.target.value })} rows={2} placeholder="Pregunta…"
                className="def-border mt-2 w-full rounded border bg-white px-2 py-1 text-sm font-medium focus:outline-none" />
              <textarea value={q.puntosClave} onChange={(e) => upd(q.id, { puntosClave: e.target.value })} rows={2} placeholder="Puntos clave de una buena respuesta…"
                className="def-border mt-2 w-full rounded border bg-white px-2 py-1 text-sm focus:outline-none" />
            </div>
          ))}
          <button onClick={add} className="def-btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Agregar pregunta</button>
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => guardar(false)} disabled={guardando} className="def-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50">{guardando ? 'Guardando…' : 'Guardar'}</button>
        <button onClick={() => guardar(true)} disabled={guardando} className="def-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50">Guardar y volver →</button>
        {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
      </div>
    </div>
  );
}
