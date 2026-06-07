'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Mic, Check, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import type { Pregunta } from '@/types/defensa';

interface ItemSim {
  pregunta: string;
  categoria: string;
  puntosClave: string;
  respuesta: string;
  puntaje: number | null;
  feedback: string;
  evaluando: boolean;
}

function colorPuntaje(p: number): string {
  if (p >= 8) return 'text-emerald-600';
  if (p >= 5) return 'text-amber-600';
  return 'text-rose-600';
}

export default function HerramientaSimulacro() {
  const params = useParams<{ id: string }>();
  const [items, setItems] = useState<ItemSim[]>([]);
  const [banco, setBanco] = useState<Pregunta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    fetch(`/api/defensa/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        const bankItems: Pregunta[] = d.proyecto?.preguntas?.items ?? [];
        setBanco(bankItems);
        const sim = d.proyecto?.simulacro;
        if (sim?.respuestas?.length) {
          // Reanuda el último simulacro; recupera puntosClave desde el banco por texto.
          setItems(sim.respuestas.map((r: { pregunta: string; categoria: string; respuesta: string; puntaje: number; feedback: string }) => ({
            pregunta: r.pregunta,
            categoria: r.categoria,
            puntosClave: bankItems.find((b) => b.pregunta === r.pregunta)?.puntosClave ?? '',
            respuesta: r.respuesta ?? '',
            puntaje: typeof r.puntaje === 'number' ? r.puntaje : null,
            feedback: r.feedback ?? '',
            evaluando: false,
          })));
        } else {
          setItems(bankItems.map((b) => ({
            pregunta: b.pregunta, categoria: b.categoria, puntosClave: b.puntosClave,
            respuesta: '', puntaje: null, feedback: '', evaluando: false,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const reiniciar = () => setItems(banco.map((b) => ({
    pregunta: b.pregunta, categoria: b.categoria, puntosClave: b.puntosClave,
    respuesta: '', puntaje: null, feedback: '', evaluando: false,
  })));

  const setRespuesta = (i: number, v: string) => setItems((p) => p.map((it, idx) => (idx === i ? { ...it, respuesta: v } : it)));

  const evaluar = async (i: number) => {
    const it = items[i];
    if (!it.respuesta.trim()) return;
    setItems((p) => p.map((x, idx) => (idx === i ? { ...x, evaluando: true } : x)));
    try {
      const tarea =
        'Eres un tribunal de defensa universitario, justo y exigente. Evalúa la respuesta del estudiante a la pregunta. ' +
        'Devuelve EXACTAMENTE dos líneas con este formato literal:\n' +
        'Puntaje: <número entero del 0 al 10>\n' +
        'Feedback: <2-3 frases: qué estuvo bien y qué mejorar, en tuteo neutro>';
      const instruccion =
        `Pregunta: ${it.pregunta}\n` +
        (it.puntosClave ? `Puntos clave esperados: ${it.puntosClave}\n` : '') +
        `Respuesta del estudiante: ${it.respuesta}`;
      const res = await fetch('/api/ai/asistir', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ modulo: 'defensa', tarea, instruccion, formato: 'texto' }),
      });
      const d = await res.json();
      let puntaje: number | null = null;
      let feedback = '';
      if (res.ok && d.texto) {
        const t: string = d.texto;
        const mP = t.match(/Puntaje\s*:\s*(\d+(?:\.\d+)?)/i);
        if (mP) puntaje = Math.max(0, Math.min(10, Math.round(parseFloat(mP[1]))));
        const mF = t.match(/Feedback\s*:\s*([\s\S]+)/i);
        feedback = mF ? mF[1].trim() : t.trim();
      }
      setItems((p) => p.map((x, idx) => (idx === i ? { ...x, puntaje, feedback, evaluando: false } : x)));
    } catch {
      setItems((p) => p.map((x, idx) => (idx === i ? { ...x, evaluando: false } : x)));
    }
  };

  const evaluados = items.filter((x) => x.puntaje !== null);
  const promedio = evaluados.length ? evaluados.reduce((s, x) => s + (x.puntaje ?? 0), 0) / evaluados.length : 0;

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const simulacro = {
        respuestas: items.map((x) => ({ pregunta: x.pregunta, categoria: x.categoria, respuesta: x.respuesta, puntaje: x.puntaje ?? 0, feedback: x.feedback })),
        promedio: Math.round(promedio * 10) / 10,
        fecha: new Date().toISOString(),
      };
      const res = await fetch(`/api/defensa/proyectos/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ simulacro, estado: 'simulacro' }),
      });
      if (res.ok) { setGuardado(true); if (volver) window.location.href = `/defensa/proyectos/${params.id}`; }
    } finally { setGuardando(false); }
  };

  if (cargando) return <div className="def-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/defensa/proyectos/${params.id}`} className="def-muted inline-flex items-center gap-1 text-sm hover:text-indigo-700">
        <ArrowLeft className="h-4 w-4" /> Volver a la preparación
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="def-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Mic className="def-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="def-accent-text text-xs font-semibold uppercase tracking-wider">Practica como en el tribunal</p>
          <h1 className="text-2xl font-bold tracking-tight">Simulacro</h1>
        </div>
      </header>
      <p className="def-muted mt-2 text-sm">
        Responde cada pregunta como si estuvieras frente al tribunal. La IA evalúa
        tu respuesta con un puntaje (0-10) y feedback concreto.
      </p>

      {banco.length === 0 && (
        <div className="def-card mt-5 p-8 text-center">
          <p className="text-3xl">📝</p>
          <p className="mt-3 font-semibold">Primero arma tu banco de preguntas</p>
          <p className="def-muted mt-1 text-sm">El simulacro usa las preguntas que tengas en el banco.</p>
          <Link href={`/defensa/proyectos/${params.id}/preguntas`} className="def-btn-primary mt-3 inline-block px-4 py-2 text-sm font-medium">Ir al banco de preguntas</Link>
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className="def-card mt-5 flex items-center justify-between p-4">
            <div>
              <p className="def-muted text-[11px] uppercase tracking-wider">Promedio ({evaluados.length}/{items.length} evaluadas)</p>
              <p className={`text-3xl font-bold ${evaluados.length ? colorPuntaje(promedio) : 'def-muted'}`}>{evaluados.length ? promedio.toFixed(1) : '—'}<span className="def-muted text-base">/10</span></p>
            </div>
            <button onClick={reiniciar} className="def-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"><RefreshCw className="h-3.5 w-3.5" /> Reiniciar desde el banco</button>
          </div>

          <div className="mt-4 space-y-4">
            {items.map((it, i) => (
              <div key={i} className="def-card p-4">
                <div className="flex items-start gap-2">
                  <span className="def-accent-soft def-accent-text flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">{i + 1}</span>
                  <div className="flex-1">
                    <span className="def-accent-soft def-accent-text rounded px-1.5 py-0.5 text-[10px] font-medium">{it.categoria}</span>
                    <p className="mt-1 text-sm font-medium">{it.pregunta}</p>
                  </div>
                  {it.puntaje !== null && <span className={`flex-shrink-0 text-lg font-bold ${colorPuntaje(it.puntaje)}`}>{it.puntaje}/10</span>}
                </div>
                <textarea value={it.respuesta} onChange={(e) => setRespuesta(i, e.target.value)} rows={3} placeholder="Tu respuesta…"
                  className="def-border mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => evaluar(i)} disabled={it.evaluando || !it.respuesta.trim()} className="def-btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium disabled:opacity-50">
                    {it.evaluando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {it.evaluando ? 'Evaluando…' : it.puntaje !== null ? 'Re-evaluar' : 'Evaluar con IA'}
                  </button>
                </div>
                {it.feedback && (
                  <div className="def-accent-soft mt-2 rounded-lg p-3 text-sm">
                    <span className="font-semibold">Feedback del tribunal: </span>{it.feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {items.length > 0 && (
        <div className="mt-6 flex items-center gap-3">
          <button onClick={() => guardar(false)} disabled={guardando} className="def-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50">{guardando ? 'Guardando…' : 'Guardar'}</button>
          <button onClick={() => guardar(true)} disabled={guardando} className="def-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50">Guardar y volver →</button>
          {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
        </div>
      )}
    </div>
  );
}
