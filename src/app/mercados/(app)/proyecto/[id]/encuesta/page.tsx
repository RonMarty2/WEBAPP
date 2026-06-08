'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowLeft, ClipboardList, Plus, Trash2, ChevronUp, ChevronDown, Check, X, GripVertical,
} from 'lucide-react';
import { TIPOS_PREGUNTA, getTipoPregunta } from '@/lib/mercados/tipos-pregunta';
import type { TipoPregunta } from '@/types/mercados';

interface PreguntaEdit {
  texto: string;
  tipo: TipoPregunta;
  opciones: string[];
  obligatoria: boolean;
}

export default function EtapaEncuesta() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState('');

  const [titulo, setTitulo] = useState('Mi encuesta');
  const [descripcion, setDescripcion] = useState('');
  const [preguntas, setPreguntas] = useState<PreguntaEdit[]>([]);
  const [selectorAbierto, setSelectorAbierto] = useState(false);

  useEffect(() => {
    fetch(`/api/mercados/proyectos/${params.id}/encuesta`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.encuesta) {
          setTitulo(d.encuesta.titulo ?? 'Mi encuesta');
          setDescripcion(d.encuesta.descripcion ?? '');
        }
        if (Array.isArray(d.preguntas)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setPreguntas(d.preguntas.map((p: any) => ({
            texto: p.texto,
            tipo: p.tipo,
            opciones: p.opciones ?? [],
            obligatoria: p.obligatoria,
          })));
        }
      })
      .catch(() => setErrorCarga('No se pudo cargar la encuesta. Verifica tu conexión y recarga la página.'))
      .finally(() => setCargando(false));
  }, [params.id]);

  const agregarPregunta = (tipo: TipoPregunta) => {
    const meta = getTipoPregunta(tipo);
    setPreguntas((prev) => [
      ...prev,
      {
        texto: '',
        tipo,
        opciones: meta?.opcionesDefault ? [...meta.opcionesDefault] : [],
        obligatoria: true,
      },
    ]);
    setSelectorAbierto(false);
  };

  const actualizar = (i: number, cambios: Partial<PreguntaEdit>) => {
    setPreguntas((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...cambios } : p)));
  };

  const mover = (i: number, dir: -1 | 1) => {
    setPreguntas((prev) => {
      const arr = [...prev];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  };

  const eliminar = (i: number) => setPreguntas((prev) => prev.filter((_, idx) => idx !== i));

  const guardar = async (avanzar: boolean) => {
    setGuardando(true);
    setGuardado(false);
    setErrorGuardar('');
    try {
      const res = await fetch(`/api/mercados/proyectos/${params.id}/encuesta`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ titulo, descripcion, preguntas }),
      });
      if (res.ok) {
        setGuardado(true);
        if (avanzar) router.push(`/mercados/proyecto/${params.id}`);
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

  if (cargando) {
    return <div className="mk-muted py-10 text-center text-sm">Cargando encuesta…</div>;
  }

  if (errorCarga) {
    return (
      <div className="mx-auto max-w-md py-10">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          {errorCarga}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <Link
        href={`/mercados/proyecto/${params.id}`}
        className="mk-muted inline-flex items-center gap-1 text-sm hover:text-sky-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al proyecto
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="mk-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <ClipboardList className="mk-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="mk-accent-text text-xs font-semibold uppercase tracking-wider">Etapa 3</p>
          <h1 className="text-2xl font-bold tracking-tight">Diseñador de encuesta</h1>
        </div>
      </header>
      <p className="mk-muted mt-2 text-sm">
        Arma tu instrumento. Recuerda las reglas de la clase 6: una idea por pregunta,
        sin inducir la respuesta, lenguaje del encuestado.
      </p>

      {/* Cabecera de la encuesta */}
      <div className="mk-card mt-5 p-5">
        <label className="text-sm font-medium">Título de la encuesta</label>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="mk-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
        <label className="mt-3 block text-sm font-medium">Descripción (opcional)</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={2}
          placeholder="Breve introducción que verá el encuestado antes de responder."
          className="mk-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
      </div>

      {/* Lista de preguntas */}
      <div className="mt-5 space-y-3">
        {preguntas.map((p, i) => (
          <PreguntaEditor
            key={i}
            indice={i}
            total={preguntas.length}
            pregunta={p}
            onActualizar={(c) => actualizar(i, c)}
            onMover={(d) => mover(i, d)}
            onEliminar={() => eliminar(i)}
          />
        ))}
      </div>

      {/* Agregar pregunta */}
      <div className="mt-4">
        {!selectorAbierto ? (
          <button
            onClick={() => setSelectorAbierto(true)}
            className="mk-border flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm font-medium hover:bg-sky-50"
          >
            <Plus className="h-4 w-4" /> Agregar pregunta
          </button>
        ) : (
          <div className="mk-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Elige el tipo de pregunta</p>
              <button onClick={() => setSelectorAbierto(false)} className="mk-muted rounded p-1 hover:bg-slate-100" aria-label="Cerrar selector">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {TIPOS_PREGUNTA.map((t) => (
                <button
                  key={t.id}
                  onClick={() => agregarPregunta(t.id)}
                  className="mk-border flex items-start gap-2 rounded-lg border p-3 text-left hover:bg-sky-50"
                >
                  <span className="text-lg">{t.icono}</span>
                  <span>
                    <span className="block text-sm font-medium">{t.label}</span>
                    <span className="mk-muted block text-xs">{t.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => guardar(false)}
          disabled={guardando}
          className="mk-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
        <button
          onClick={() => guardar(true)}
          disabled={guardando || preguntas.length === 0}
          className="mk-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          Guardar y volver →
        </button>
        {guardado && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
            <Check className="h-4 w-4" aria-hidden="true" /> Guardado
          </span>
        )}
        {errorGuardar && (
          <span className="text-sm text-rose-700" role="alert">{errorGuardar}</span>
        )}
      </div>
      {preguntas.length === 0 && (
        <p className="mk-muted mt-2 text-xs">Agrega al menos una pregunta para continuar.</p>
      )}
    </div>
  );
}

function PreguntaEditor({
  indice,
  total,
  pregunta,
  onActualizar,
  onMover,
  onEliminar,
}: {
  indice: number;
  total: number;
  pregunta: PreguntaEdit;
  onActualizar: (c: Partial<PreguntaEdit>) => void;
  onMover: (d: -1 | 1) => void;
  onEliminar: () => void;
}) {
  const meta = getTipoPregunta(pregunta.tipo);

  return (
    <div className="mk-card p-4">
      <div className="flex items-center gap-2">
        <GripVertical className="mk-muted h-4 w-4 flex-shrink-0" />
        <span className="mk-accent-soft mk-accent-text flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
          {indice + 1}
        </span>
        <span className="mk-accent-text text-xs font-medium">{meta?.label}</span>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => onMover(-1)} disabled={indice === 0} className="mk-muted rounded p-1 hover:bg-slate-100 disabled:opacity-30" aria-label="Mover pregunta arriba">
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          </button>
          <button onClick={() => onMover(1)} disabled={indice === total - 1} className="mk-muted rounded p-1 hover:bg-slate-100 disabled:opacity-30" aria-label="Mover pregunta abajo">
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
          <button onClick={onEliminar} className="mk-muted rounded p-1 hover:bg-rose-50 hover:text-rose-600" aria-label="Eliminar pregunta">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <input
        value={pregunta.texto}
        onChange={(e) => onActualizar({ texto: e.target.value })}
        placeholder="Escribe la pregunta…"
        className="mk-border mt-3 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
      />

      {meta?.guia && (
        <p className="mk-muted mt-1.5 text-xs italic">💡 {meta.guia}</p>
      )}

      {/* Opciones editables (para tipos que las usan) */}
      {meta?.usaOpciones && (
        <div className="mt-3 space-y-1.5">
          {pregunta.opciones.map((op, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <span className="mk-muted text-xs">{oi + 1}.</span>
              <input
                value={op}
                onChange={(e) => {
                  const nuevas = [...pregunta.opciones];
                  nuevas[oi] = e.target.value;
                  onActualizar({ opciones: nuevas });
                }}
                className="mk-border flex-1 rounded-lg border bg-white px-2.5 py-1.5 text-sm focus:border-sky-500 focus:outline-none"
              />
              <button
                onClick={() => onActualizar({ opciones: pregunta.opciones.filter((_, idx) => idx !== oi) })}
                className="mk-muted rounded p-1 hover:bg-rose-50 hover:text-rose-600"
                aria-label="Eliminar opción"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
          <button
            onClick={() => onActualizar({ opciones: [...pregunta.opciones, `Opción ${pregunta.opciones.length + 1}`] })}
            className="mk-accent-text mt-1 inline-flex items-center gap-1 text-xs font-medium"
          >
            <Plus className="h-3 w-3" /> Agregar opción
          </button>
        </div>
      )}

      <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={pregunta.obligatoria}
          onChange={(e) => onActualizar({ obligatoria: e.target.checked })}
          className="accent-sky-600"
        />
        Pregunta obligatoria
      </label>
    </div>
  );
}
