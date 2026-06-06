'use client';

import { useState } from 'react';
import { Sparkles, Loader2, X, Copy, Check } from 'lucide-react';

/**
 * Componente reusable "Sugerir con IA" — para cualquier módulo del laboratorio.
 *
 * Llama al servicio compartido /api/ai/asistir con la tarea y (si hay)
 * el maestroId para contexto cruzado. Muestra la sugerencia en un panel;
 * el estudiante puede copiarla o aplicarla vía onAplicar.
 *
 * Es estéticamente neutro (no usa tokens de un módulo específico) para
 * encajar en cualquiera. El módulo le pasa su color de acento por prop.
 */
export function SugerirIA({
  modulo,
  tarea,
  maestroId,
  formato = 'texto',
  acentoClase = 'bg-slate-900 text-white',
  placeholder = 'Detalle opcional para afinar la sugerencia…',
  onAplicar,
}: {
  modulo: string;
  tarea: string;
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

  const generar = async () => {
    setCargando(true);
    setError(null);
    setResultado(null);
    try {
      const res = await fetch('/api/ai/asistir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ modulo, tarea, instruccion, maestroId: maestroId ?? undefined, formato }),
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
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <pre className="whitespace-pre-wrap text-sm text-slate-700">{resultado}</pre>
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
