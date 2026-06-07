'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, FlaskConical, Plus, X, Check } from 'lucide-react';
import { SugerirIA } from '@/components/compartido/SugerirIA';
import type { Validacion, Hipotesis, EstadoHipotesis, LeanCanvas, PropuestaValor } from '@/types/idea';

const VACIO: Validacion = { hipotesis: [] };

const ESTADOS: Array<{ v: EstadoHipotesis; txt: string; clase: string }> = [
  { v: 'sin_probar', txt: 'Sin probar', clase: 'bg-slate-100 text-slate-700' },
  { v: 'validada', txt: 'Validada', clase: 'bg-emerald-100 text-emerald-800' },
  { v: 'refutada', txt: 'Refutada', clase: 'bg-rose-100 text-rose-800' },
];

const PLANTILLA: Hipotesis[] = [
  { supuesto: 'Mi cliente tiene este problema y le importa resolverlo', comoProbar: '10 entrevistas a clientes objetivo', criterio: '7 de 10 mencionan el problema sin que lo sugiera', resultado: '', estado: 'sin_probar' },
  { supuesto: 'Pagarían por mi solución al precio previsto', comoProbar: 'Pre-venta o carta de intención', criterio: '5 personas dejan seña o se comprometen', resultado: '', estado: 'sin_probar' },
];

export default function HerramientaValidacion() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [val, setVal] = useState<Validacion>(VACIO);
  const [titulo, setTitulo] = useState('');
  const [idea, setIdea] = useState('');
  const [sector, setSector] = useState('');
  const [leanCanvas, setLeanCanvas] = useState<Partial<LeanCanvas>>({});
  const [propVal, setPropVal] = useState<Partial<PropuestaValor>>({});
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
          if (d.proyecto.validacion?.hipotesis) setVal({ hipotesis: d.proyecto.validacion.hipotesis });
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const add = () => setVal((v) => ({ hipotesis: [...v.hipotesis, { supuesto: '', comoProbar: '', criterio: '', resultado: '', estado: 'sin_probar' }] }));
  const upd = (i: number, c: Partial<Hipotesis>) => setVal((v) => ({ hipotesis: v.hipotesis.map((h, idx) => (idx === i ? { ...h, ...c } : h)) }));
  const del = (i: number) => setVal((v) => ({ hipotesis: v.hipotesis.filter((_, idx) => idx !== i) }));
  const cargarPlantilla = () => setVal({ hipotesis: PLANTILLA.map((h) => ({ ...h })) });

  /**
   * AGREGA hipótesis sugeridas por la IA a las existentes. El estudiante puede
   * quitar las que no le sirvan con el botón X de cada una.
   * Formato esperado: bloques "H<n>: <supuesto> | Probar: <…> | Criterio: <…>".
   */
  const aplicarIA = (texto: string) => {
    const bloques = texto.split(/\n\s*(?=H\d)|(?<=\n)(?=\d+\.\s*Hip[oó]tesis)/i);
    const nuevas: Hipotesis[] = [];
    for (const b of bloques) {
      const supuesto = b.match(/(?:^H\d+|Hip[oó]tesis(?:\s*\d+)?)\s*:?\s*([^\n|]+)/i)?.[1]?.trim()
        ?? b.match(/Supuesto\s*:\s*([^\n|]+)/i)?.[1]?.trim();
      const comoProbar = b.match(/(?:Probar|Experimento|C[oó]mo probar)\s*:\s*([^\n|]+)/i)?.[1]?.trim() ?? '';
      const criterio = b.match(/Criterio(?:\s*de\s*[eé]xito)?\s*:\s*([^\n|]+)/i)?.[1]?.trim() ?? '';
      if (supuesto && supuesto.length > 5) {
        nuevas.push({ supuesto, comoProbar, criterio, resultado: '', estado: 'sin_probar' });
      }
    }
    if (nuevas.length === 0) return;
    setVal((prev) => {
      // Dedup case-insensitive por supuesto.
      const ya = new Set(prev.hipotesis.map((h) => h.supuesto.toLowerCase().trim()));
      const filtradas = nuevas.filter((n) => !ya.has(n.supuesto.toLowerCase().trim()));
      return { hipotesis: [...prev.hipotesis, ...filtradas] };
    });
  };

  const validadas = val.hipotesis.filter((h) => h.estado === 'validada').length;

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const res = await fetch(`/api/idea/proyectos/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ validacion: val, estado: 'validacion' }),
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
          <FlaskConical className="idea-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="idea-accent-text text-xs font-semibold uppercase tracking-wider">Probar antes de construir</p>
          <h1 className="text-2xl font-bold tracking-tight">Validación</h1>
        </div>
      </header>
      <p className="idea-muted mt-2 text-sm">
        Lista tus supuestos más riesgosos (los que, si son falsos, hunden la idea)
        y define cómo probarlos con un criterio de éxito claro.
      </p>

      {val.hipotesis.length > 0 && (
        <p className="idea-muted mt-4 text-xs font-medium">Validadas: {validadas}/{val.hipotesis.length}</p>
      )}

      {val.hipotesis.length === 0 && (
        <div className="idea-card mt-5 p-8 text-center">
          <p className="text-3xl">🔬</p>
          <p className="mt-3 font-semibold">Aún no hay hipótesis</p>
          <p className="idea-muted mt-1 text-sm">Empieza con las dos hipótesis críticas de cualquier idea.</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <button onClick={cargarPlantilla} className="idea-btn-primary px-4 py-2 text-sm font-medium">Usar plantilla</button>
            <button onClick={add} className="idea-btn-ghost inline-flex items-center gap-1 px-4 py-2 text-sm"><Plus className="h-4 w-4" /> Hipótesis vacía</button>
          </div>
        </div>
      )}

      {val.hipotesis.length > 0 && (
        <div className="mt-4 space-y-3">
          {val.hipotesis.map((h, i) => (
            <div key={i} className="idea-card p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="idea-accent-soft idea-accent-text flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">{i + 1}</span>
                <textarea value={h.supuesto} onChange={(e) => upd(i, { supuesto: e.target.value })} rows={1} placeholder="Supuesto: creemos que…"
                  className="idea-border flex-1 rounded border bg-white px-2 py-1 text-sm font-medium focus:outline-none" />
                <select value={h.estado} onChange={(e) => upd(i, { estado: e.target.value as EstadoHipotesis })}
                  className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${ESTADOS.find((s) => s.v === h.estado)?.clase}`}>
                  {ESTADOS.map((s) => <option key={s.v} value={s.v}>{s.txt}</option>)}
                </select>
                <button onClick={() => del(i)} className="text-slate-300 hover:text-rose-600"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <label className="text-xs">
                  <span className="idea-muted">Cómo probarlo</span>
                  <textarea value={h.comoProbar} onChange={(e) => upd(i, { comoProbar: e.target.value })} rows={2} placeholder="Experimento…"
                    className="idea-border mt-0.5 w-full rounded border bg-white px-2 py-1 text-sm focus:outline-none" />
                </label>
                <label className="text-xs">
                  <span className="idea-muted">Criterio de éxito</span>
                  <textarea value={h.criterio} onChange={(e) => upd(i, { criterio: e.target.value })} rows={2} placeholder="Métrica que confirma…"
                    className="idea-border mt-0.5 w-full rounded border bg-white px-2 py-1 text-sm focus:outline-none" />
                </label>
                <label className="text-xs">
                  <span className="idea-muted">Resultado</span>
                  <textarea value={h.resultado} onChange={(e) => upd(i, { resultado: e.target.value })} rows={2} placeholder="Qué pasó…"
                    className="idea-border mt-0.5 w-full rounded border bg-white px-2 py-1 text-sm focus:outline-none" />
                </label>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={add} className="idea-btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Agregar hipótesis</button>
          </div>
        </div>
      )}

      {/* Sugerir con IA — agrega hipótesis sin reemplazar */}
      <div className="mt-4">
        <SugerirIA
          modulo="idea"
          tarea={
            'Para validar esta idea, propón 3 hipótesis priorizadas (las más riesgosas: si son falsas, hunden la idea). ' +
            'Devuelve EXACTAMENTE 3 bloques con este formato literal, uno por línea:\n' +
            'H1: <supuesto> | Probar: <experimento concreto y barato> | Criterio: <métrica de éxito>\n' +
            'H2: <supuesto> | Probar: <…> | Criterio: <…>\n' +
            'H3: <supuesto> | Probar: <…> | Criterio: <…>'
          }
          formato="texto"
          acentoClase="idea-accent-bg text-white"
          contexto={
            `MI IDEA: ${idea || titulo}. SECTOR: ${sector || 'no especificado'}.` +
            (leanCanvas.problema ? `\nPROBLEMA: ${leanCanvas.problema}` : '') +
            (leanCanvas.segmentos ? `\nSEGMENTO: ${leanCanvas.segmentos}` : '') +
            (propVal.dolores?.length ? `\nDolores del cliente: ${propVal.dolores.join(', ')}` : '') +
            (propVal.aliviadores?.length ? `\nAliviadores propuestos: ${propVal.aliviadores.join(', ')}` : '') +
            (val.hipotesis.length ? `\nHipótesis que ya tengo: ${val.hipotesis.map((h) => h.supuesto).join(' | ')}` : '') +
            '\n\nIMPORTANTE: Hipótesis específicas a ESTA idea, no genéricas. Las más riesgosas: si son falsas, hunden la idea.'
          }
          placeholder="Detalle opcional (ej: enfócate en hipótesis de precio)…"
          onAplicar={aplicarIA}
        />
        <p className="idea-muted mt-2 text-xs">
          La IA <strong>agrega</strong> hipótesis a tu lista. Usa el botón <X className="inline h-3 w-3" /> de cada una para quitar lo que no te sirva.
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
