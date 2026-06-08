'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Globe, Plus, X, Check, Lightbulb } from 'lucide-react';
import { DIMENSIONES_PESTEL, ESCALA_IMPACTO } from '@/lib/estrategia/plantillas-pestel';
import { SugerirIA } from '@/components/compartido/SugerirIA';
import type { FactorPestel, Pestel } from '@/types/estrategia';

type PestelKey = (typeof DIMENSIONES_PESTEL)[number]['key'];

const VACIO: Pestel = {
  politico: [], economico: [], social: [], tecnologico: [], ecologico: [], legal: [],
};

export default function HerramientaPestel() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [pestel, setPestel] = useState<Pestel>(VACIO);
  const [titulo, setTitulo] = useState('');
  const [sector, setSector] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState('');

  useEffect(() => {
    fetch(`/api/estrategia/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.proyecto) {
          setTitulo(d.proyecto.titulo ?? '');
          setSector(d.proyecto.sector ?? '');
          const px = d.proyecto.pestel ?? {};
          setPestel({ ...VACIO, ...px });
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const agregar = (key: PestelKey, texto: string, impacto = 0) => {
    if (!texto.trim()) return;
    setPestel((p) => ({ ...p, [key]: [...p[key], { texto: texto.trim(), impacto }] }));
  };
  const actualizar = (key: PestelKey, i: number, cambios: Partial<FactorPestel>) => {
    setPestel((p) => ({ ...p, [key]: p[key].map((f, idx) => (idx === i ? { ...f, ...cambios } : f)) }));
  };
  const eliminar = (key: PestelKey, i: number) => {
    setPestel((p) => ({ ...p, [key]: p[key].filter((_, idx) => idx !== i) }));
  };

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false); setErrorGuardar('');
    try {
      const res = await fetch(`/api/estrategia/proyectos/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pestel }),
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

  // Resumen: cuántas oportunidades vs amenazas
  const todos = Object.values(pestel).flat() as FactorPestel[];
  const oportunidades = todos.filter((f) => f.impacto > 0).length;
  const amenazas = todos.filter((f) => f.impacto < 0).length;
  const scoreNeto = todos.reduce((s, f) => s + f.impacto, 0);

  if (cargando) return <div className="es-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/estrategia/analisis/${params.id}`} className="es-muted inline-flex items-center gap-1 text-sm hover:text-violet-700">
        <ArrowLeft className="h-4 w-4" /> Volver al análisis
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="es-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Globe className="es-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="es-accent-text text-xs font-semibold uppercase tracking-wider">Macroentorno</p>
          <h1 className="text-2xl font-bold tracking-tight">Análisis PESTEL</h1>
        </div>
      </header>
      <p className="es-muted mt-2 text-sm">
        Identifica los factores del entorno que afectan a tu proyecto y califica si son
        oportunidad o amenaza. Tienes sugerencias bolivianas como punto de partida — edítalas.
      </p>

      {/* Resumen vivo */}
      <div className="es-card mt-5 flex flex-wrap items-center gap-4 p-4">
        <Resumen label="Factores" valor={todos.length} />
        <Resumen label="Oportunidades" valor={oportunidades} clase="text-emerald-600" />
        <Resumen label="Amenazas" valor={amenazas} clase="text-rose-600" />
        <Resumen label="Score neto" valor={scoreNeto > 0 ? `+${scoreNeto}` : String(scoreNeto)} clase={scoreNeto >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
      </div>

      {/* Dimensiones */}
      <div className="mt-5 space-y-4">
        {DIMENSIONES_PESTEL.map((dim) => (
          <Dimension
            key={dim.key}
            dim={dim}
            factores={pestel[dim.key]}
            sector={sector}
            titulo={titulo}
            onAgregar={(texto, impacto) => agregar(dim.key, texto, impacto)}
            onActualizar={(i, c) => actualizar(dim.key, i, c)}
            onEliminar={(i) => eliminar(dim.key, i)}
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
        {errorGuardar && (
          <span className="text-sm text-rose-700" role="alert">{errorGuardar}</span>
        )}
      </div>
    </div>
  );
}

function Resumen({ label, valor, clase = '' }: { label: string; valor: number | string; clase?: string }) {
  return (
    <div>
      <p className="es-muted text-[11px] uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold ${clase}`}>{valor}</p>
    </div>
  );
}

function Dimension({
  dim, factores, sector, titulo, onAgregar, onActualizar, onEliminar,
}: {
  dim: (typeof DIMENSIONES_PESTEL)[number];
  factores: FactorPestel[];
  sector: string;
  titulo: string;
  onAgregar: (texto: string, impacto: number) => void;
  onActualizar: (i: number, c: Partial<FactorPestel>) => void;
  onEliminar: (i: number) => void;
}) {
  const [nuevo, setNuevo] = useState('');
  const [verSugerencias, setVerSugerencias] = useState(false);

  return (
    <div className="es-card p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">{dim.label}</h2>
          <p className="es-muted text-xs">{dim.descripcion}</p>
        </div>
        <span className="es-accent-soft es-accent-text rounded-full px-2 py-0.5 text-xs font-medium">{factores.length}</span>
      </div>

      {/* Factores existentes */}
      <div className="mt-3 space-y-2">
        {factores.map((f, i) => (
          <div key={i} className="es-border flex items-center gap-2 rounded-lg border p-2">
            <input
              value={f.texto}
              onChange={(e) => onActualizar(i, { texto: e.target.value })}
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
            <select
              value={f.impacto}
              onChange={(e) => onActualizar(i, { impacto: parseInt(e.target.value, 10) })}
              className="es-border rounded-md border bg-white px-1.5 py-1 text-xs focus:outline-none"
            >
              {ESCALA_IMPACTO.map((e) => (
                <option key={e.valor} value={e.valor}>{e.label}</option>
              ))}
            </select>
            <button onClick={() => onEliminar(i)} className="es-muted rounded p-1 hover:bg-rose-50 hover:text-rose-600" aria-label="Eliminar factor">
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      {/* Agregar manual */}
      <div className="mt-2 flex gap-2">
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAgregar(nuevo, 0); setNuevo(''); } }}
          placeholder={`Agregar factor ${dim.label.toLowerCase()}…`}
          className="es-border flex-1 rounded-lg border bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
        <button onClick={() => { onAgregar(nuevo, 0); setNuevo(''); }} className="es-btn-ghost flex items-center gap-1 px-3 py-2 text-sm">
          <Plus className="h-4 w-4" /> Agregar
        </button>
      </div>

      {/* Sugerencias (plantilla boliviana) */}
      <div className="mt-3">
        <button onClick={() => setVerSugerencias((v) => !v)} className="es-accent-text inline-flex items-center gap-1 text-xs font-medium">
          <Lightbulb className="h-3.5 w-3.5" /> {verSugerencias ? 'Ocultar' : 'Ver'} sugerencias bolivianas
        </button>
        {verSugerencias && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {dim.sugerencias.map((s) => (
              <button
                key={s}
                onClick={() => onAgregar(s, 0)}
                className="es-border rounded-full border px-2.5 py-1 text-xs hover:bg-violet-50"
              >
                + {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sugerir con IA (contexto del proyecto) */}
      <div className="mt-3">
        <SugerirIA
          modulo="estrategia"
          tarea={`Sugiere 3-4 factores del entorno ${dim.label} (PESTEL) relevantes para este proyecto en Bolivia. Uno por línea, concisos.`}
          formato="lista"
          acentoClase="es-accent-bg text-white"
          contexto={
            `PROYECTO: ${titulo}\nSECTOR: ${sector || 'no especificado'}\n\n` +
            'IMPORTANTE: los factores PESTEL deben ser ESPECÍFICOS a este proyecto y sector, no genéricos.'
          }
          placeholder="Detalle opcional…"
          onAplicar={(texto) => {
            texto.split('\n').map((l) => l.replace(/^[-*\d.\s]+/, '').trim()).filter(Boolean)
              .forEach((linea) => onAgregar(linea, 0));
          }}
        />
      </div>
    </div>
  );
}
