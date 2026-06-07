'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Gauge, Check, X } from 'lucide-react';
import { SugerirIA } from '@/components/compartido/SugerirIA';
import type { Scorecard, LeanCanvas, PropuestaValor, Validacion } from '@/types/idea';

const VACIO: Scorecard = { deseabilidad: 3, factibilidad: 3, viabilidad: 3, notas: '' };

const DIMENSIONES: Array<{ key: keyof Omit<Scorecard, 'notas'>; label: string; desc: string }> = [
  { key: 'deseabilidad', label: 'Deseabilidad', desc: '¿El cliente lo quiere de verdad? (lo necesita y lo valoraría)' },
  { key: 'factibilidad', label: 'Factibilidad', desc: '¿Puedes construirlo y operarlo con lo que tienes o consigues?' },
  { key: 'viabilidad', label: 'Viabilidad', desc: '¿Es rentable y sostenible en el tiempo?' },
];

function veredicto(prom: number): { txt: string; clase: string; consejo: string } {
  if (prom >= 4) return { txt: 'Idea sólida', clase: 'text-emerald-600', consejo: 'Buen punto de partida. Avanza a un prototipo o piloto pequeño.' };
  if (prom >= 3) return { txt: 'Prometedora con riesgos', clase: 'text-amber-600', consejo: 'Hay potencial pero también dudas. Valida las hipótesis más débiles antes de invertir.' };
  return { txt: 'Necesita más trabajo', clase: 'text-rose-600', consejo: 'Una o más dimensiones están flojas. Repensar el problema, la solución o el modelo.' };
}

export default function HerramientaScorecard() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [s, setS] = useState<Scorecard>(VACIO);
  const [titulo, setTitulo] = useState('');
  const [idea, setIdea] = useState('');
  const [sector, setSector] = useState('');
  const [leanCanvas, setLeanCanvas] = useState<Partial<LeanCanvas>>({});
  const [propVal, setPropVal] = useState<Partial<PropuestaValor>>({});
  const [validac, setValidac] = useState<Partial<Validacion>>({});
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
          setPropVal(d.proyecto.propuesta_valor ?? {});
          setValidac(d.proyecto.validacion ?? {});
          const x = d.proyecto.scorecard;
          if (x && typeof x.deseabilidad === 'number') setS({ ...VACIO, ...x });
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const prom = (s.deseabilidad + s.factibilidad + s.viabilidad) / 3;
  const v = veredicto(prom);
  const set = (key: keyof Scorecard, val: number | string) => setS((p) => ({ ...p, [key]: val }));

  /**
   * La IA sugiere puntajes y agrega su razonamiento a las notas SIN borrar
   * lo que ya escribió el estudiante.
   */
  const aplicarIA = (texto: string) => {
    const get = (etq: string): number | null => {
      const m = texto.match(new RegExp(`${etq}\\s*:\\s*(\\d)`, 'i'));
      const n = m ? parseInt(m[1], 10) : null;
      return n !== null && n >= 1 && n <= 5 ? n : null;
    };
    const d = get('Deseabilidad'); const f = get('Factibilidad'); const vi = get('Viabilidad');
    const notasIA = texto.match(/Notas?\s*:\s*([\s\S]+)/i)?.[1]?.trim();
    setS((prev) => ({
      deseabilidad: d ?? prev.deseabilidad,
      factibilidad: f ?? prev.factibilidad,
      viabilidad: vi ?? prev.viabilidad,
      notas: prev.notas
        ? `${prev.notas}\n\n— Sugerencia IA —\n${notasIA ?? ''}`.trim()
        : (notasIA ?? prev.notas),
    }));
  };

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const res = await fetch(`/api/idea/proyectos/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ scorecard: s, estado: 'scorecard' }),
      });
      if (res.ok) { setGuardado(true); if (volver) router.push(`/idea/proyectos/${params.id}`); }
    } finally { setGuardando(false); }
  };

  if (cargando) return <div className="idea-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/idea/proyectos/${params.id}`} className="idea-muted inline-flex items-center gap-1 text-sm hover:text-amber-700">
        <ArrowLeft className="h-4 w-4" /> Volver a la idea
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="idea-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Gauge className="idea-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="idea-accent-text text-xs font-semibold uppercase tracking-wider">Veredicto</p>
          <h1 className="text-2xl font-bold tracking-tight">Scorecard de viabilidad</h1>
        </div>
      </header>
      <p className="idea-muted mt-2 text-sm">
        Puntúa con honestidad las tres preguntas clave de toda idea. El promedio
        te da una señal de qué tan lista está para avanzar.
      </p>

      <div className="idea-card mt-5 space-y-5 p-5">
        {DIMENSIONES.map((d) => (
          <div key={d.key}>
            <div className="flex items-baseline justify-between">
              <label className="text-sm font-semibold">{d.label}</label>
              <span className="idea-accent-text text-lg font-bold">{s[d.key]}/5</span>
            </div>
            <p className="idea-muted text-xs">{d.desc}</p>
            <input type="range" min={1} max={5} step={1} value={s[d.key]}
              onChange={(e) => set(d.key, parseInt(e.target.value, 10))}
              className="mt-2 w-full accent-amber-600" />
          </div>
        ))}
      </div>

      {/* Veredicto */}
      <div className="idea-card mt-4 p-5 text-center">
        <p className="idea-muted text-[11px] uppercase tracking-wider">Promedio</p>
        <p className={`text-4xl font-bold ${v.clase}`}>{prom.toFixed(1)}<span className="idea-muted text-lg">/5</span></p>
        <p className={`mt-1 text-lg font-semibold ${v.clase}`}>{v.txt}</p>
        <p className="idea-muted mx-auto mt-2 max-w-md text-sm">{v.consejo}</p>
      </div>

      <div className="idea-card mt-4 p-4">
        <p className="text-sm font-semibold">Notas / decisión</p>
        <textarea value={s.notas} onChange={(e) => set('notas', e.target.value)} rows={5}
          placeholder="¿Avanzas, pivoteas o paras? ¿Qué falta validar primero?"
          className="idea-border mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200" />
      </div>

      {/* Sugerir puntajes con IA — lee todo lo previo del proyecto */}
      <div className="mt-4">
        <SugerirIA
          modulo="idea"
          tarea={
            'Considerando todo el trabajo previo de la idea, propón puntajes (1-5) con justificación corta. ' +
            'Devuelve EXACTAMENTE estas líneas con este formato literal:\n' +
            'Deseabilidad: <1-5>\nFactibilidad: <1-5>\nViabilidad: <1-5>\n' +
            'Notas: <2-3 frases justificando el promedio y diciendo si conviene avanzar, pivotear o parar>'
          }
          formato="texto"
          acentoClase="idea-accent-bg text-white"
          placeholder={
            `Idea: ${idea || titulo}. Sector: ${sector || '—'}.` +
            (leanCanvas.problema ? ` Problema: ${leanCanvas.problema}.` : '') +
            (leanCanvas.segmentos ? ` Segmento: ${leanCanvas.segmentos}.` : '') +
            (propVal.dolores?.length ? ` Dolores: ${propVal.dolores.join(', ')}.` : '') +
            (propVal.aliviadores?.length ? ` Aliviadores: ${propVal.aliviadores.join(', ')}.` : '') +
            (validac.hipotesis?.length ? ` Hipótesis: ${validac.hipotesis.map((h) => `${h.supuesto} [${h.estado}]`).join('; ')}.` : '')
          }
          onAplicar={aplicarIA}
        />
        <p className="idea-muted mt-2 text-xs">
          La IA propone puntajes y agrega su razonamiento a tus notas <strong>sin borrar lo tuyo</strong>.
          Usa los sliders para ajustar lo que no te convenza, o limpia el texto de la nota manualmente <X className="inline h-3 w-3" />.
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
