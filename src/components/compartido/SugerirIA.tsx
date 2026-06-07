'use client';

import { useState } from 'react';
import { Sparkles, Loader2, X, Copy, Check, Target } from 'lucide-react';
import { useMaestroActivo } from '@/lib/maestro/useMaestroActivo';

/**
 * Componente reusable "Sugerir con IA" — para cualquier módulo del laboratorio.
 *
 * Llama al servicio compartido /api/ai/asistir con la tarea y (si hay)
 * el maestroId para contexto cruzado. Muestra la sugerencia en un panel;
 * el estudiante puede copiarla o aplicarla vía onAplicar.
 *
 * **Auto-conexión al Proyecto Maestro:** si no se pasa `maestroId` por prop,
 * el componente usa AUTOMÁTICAMENTE el proyecto maestro activo del widget
 * (localStorage). Así todas las herramientas comparten contexto cruzado sin
 * que cada módulo tenga que cablearlo a mano.
 *
 * Es estéticamente neutro (no usa tokens de un módulo específico) para
 * encajar en cualquiera. El módulo le pasa su color de acento por prop.
 */
export function SugerirIA({
  modulo,
  tarea,
  contexto,
  maestroId,
  formato = 'texto',
  acentoClase = 'bg-slate-900 text-white',
  placeholder = 'Detalle opcional para afinar la sugerencia…',
  onAplicar,
}: {
  modulo: string;
  tarea: string;
  /**
   * Contexto del proyecto local (idea, sector, lo ya construido en otras
   * herramientas, etc.) que SIEMPRE se envía al servicio de IA, aunque el
   * estudiante no escriba nada en el textarea. Si lo pones aquí, llega al
   * backend; si lo pones en `placeholder`, solo es UI y no llega.
   */
  contexto?: string;
  /** Si no se pasa, usa automáticamente el maestro activo del widget. */
  maestroId?: string | null;
  formato?: 'lista' | 'texto';
  /** Clase Tailwind para el botón de acento del módulo. */
  acentoClase?: string;
  placeholder?: string;
  /** Si se provee, muestra botón "Aplicar" que entrega el texto al módulo. */
  onAplicar?: (texto: string) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [instruccion, setInstruccion] = useState('');
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Maestro activo del widget — solo se usa si la prop no lo definió.
  const maestroAuto = useMaestroActivo();
  const maestroIdEfectivo = maestroId ?? maestroAuto?.id ?? null;
  const tituloMaestro = maestroId ? null : maestroAuto?.titulo ?? null;

  const generar = async () => {
    setCargando(true);
    setError(null);
    setResultado(null);
    try {
      const res = await fetch('/api/ai/asistir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          modulo,
          tarea,
          // Antepone el contexto del proyecto (si la herramienta lo pasó) a la
          // instrucción que el estudiante escribió. Así la IA siempre tiene
          // los datos del proyecto local aunque el textarea esté vacío.
          instruccion: [contexto, instruccion].filter((s) => s && s.trim()).join('\n\n').trim(),
          maestroId: maestroIdEfectivo ?? undefined,
          formato,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d?.detail ?? 'No se pudo generar. Intenta de nuevo.');
      } else {
        setResultado(d.texto);
        setProvider(d.provider);
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setCargando(false);
    }
  };

  const copiar = async () => {
    if (!resultado) return;
    await navigator.clipboard.writeText(resultado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition hover:opacity-90 ${acentoClase}`}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Sugerir con IA
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          <Sparkles className="h-4 w-4" /> Asistente IA
        </p>
        <button onClick={() => setAbierto(false)} className="rounded p-1 text-slate-400 hover:bg-slate-100" aria-label="Cerrar">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-500">{tarea}</p>

      {tituloMaestro && (
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600" title="Tu trabajo en otros módulos vinculados a este proyecto alimentará la sugerencia">
          <Target className="h-3 w-3" />
          Usando contexto de <strong className="font-semibold">{tituloMaestro}</strong>
        </div>
      )}

      <textarea
        value={instruccion}
        onChange={(e) => setInstruccion(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
      />

      <button
        onClick={generar}
        disabled={cargando}
        className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition hover:opacity-90 disabled:opacity-50 ${acentoClase}`}
      >
        {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {cargando ? 'Generando…' : 'Generar sugerencia'}
      </button>

      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}

      {resultado && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <SugerenciaFormateada texto={resultado} />
          <div className="mt-2 flex items-center gap-2">
            {onAplicar && (
              <button
                onClick={() => { onAplicar(resultado); setAbierto(false); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${acentoClase}`}
              >
                Aplicar
              </button>
            )}
            <button onClick={copiar} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100">
              {copiado ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copiado ? 'Copiado' : 'Copiar'}
            </button>
            {provider && <span className="ml-auto text-[10px] text-slate-400">vía {provider}</span>}
          </div>
          <p className="mt-2 text-[10px] text-slate-400">
            Revisa y edita: la IA es un punto de partida, tú apruebas el contenido.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Renderiza la sugerencia con tipografía leíble (no monoespaciada como el `<pre>`
 * que usábamos antes). Si detecta líneas con formato `Etiqueta: contenido`,
 * las muestra con la etiqueta en semibold para escanear más fácil.
 */
function SugerenciaFormateada({ texto }: { texto: string }) {
  const lineas = texto.split('\n');
  // Heurística: si ≥ 2 líneas tienen formato "Palabra:" o "Palabras palabras:",
  // tratamos como respuesta etiquetada (Lean Canvas, FODA, etc.).
  const conteoEtiquetadas = lineas.filter((l) => /^[A-ZÁÉÍÓÚÑa-záéíóúñ][A-ZÁÉÍÓÚÑa-záéíóúñ\s]{0,30}:\s/.test(l.trim())).length;
  const esEtiquetado = conteoEtiquetadas >= 2;

  if (esEtiquetado) {
    return (
      <div className="space-y-2 text-sm leading-relaxed text-slate-700">
        {lineas.map((l, i) => {
          const trimmed = l.trim();
          if (!trimmed) return null;
          const m = trimmed.match(/^([A-ZÁÉÍÓÚÑa-záéíóúñ][A-ZÁÉÍÓÚÑa-záéíóúñ\s]{0,30}):\s*(.*)$/);
          if (m) {
            return (
              <p key={i}>
                <span className="font-semibold text-slate-900">{m[1]}:</span>{' '}
                <span>{m[2]}</span>
              </p>
            );
          }
          return <p key={i}>{trimmed}</p>;
        })}
      </div>
    );
  }

  // Texto libre: preserva saltos, pero con tipografía y leading agradables.
  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
      {texto}
    </div>
  );
}
