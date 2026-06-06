'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';

interface PreguntaPub {
  id: string;
  texto: string;
  tipo: string;
  opciones: string[];
  obligatoria: boolean;
}

/**
 * Página PÚBLICA de respuesta a una encuesta (sin login).
 * Vive bajo /mercados/layout.tsx (scope visual) pero FUERA del grupo (app),
 * así que NO pasa por ProtectedRoute. Cualquiera con el link/QR responde.
 */
export default function ResponderEncuesta() {
  const params = useParams<{ token: string }>();
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'cerrada' | 'no_disponible' | 'enviada'>('cargando');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [preguntas, setPreguntas] = useState<PreguntaPub[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, string | string[]>>({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/mercados/publico/${params.token}`)
      .then(async (r) => {
        if (r.status === 410) { setEstado('cerrada'); return null; }
        if (!r.ok) { setEstado('no_disponible'); return null; }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setTitulo(d.encuesta.titulo);
        setDescripcion(d.encuesta.descripcion ?? '');
        setPreguntas(d.preguntas);
        setEstado('ok');
      })
      .catch(() => setEstado('no_disponible'));
  }, [params.token]);

  const setR = (id: string, val: string | string[]) =>
    setRespuestas((prev) => ({ ...prev, [id]: val }));

  const toggleMultiple = (id: string, opcion: string) => {
    setRespuestas((prev) => {
      const actual = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      return {
        ...prev,
        [id]: actual.includes(opcion) ? actual.filter((o) => o !== opcion) : [...actual, opcion],
      };
    });
  };

  const enviar = async () => {
    // Validar obligatorias
    for (const p of preguntas) {
      if (p.obligatoria) {
        const v = respuestas[p.id];
        const vacio = v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
        if (vacio) {
          setError('Por favor responde todas las preguntas obligatorias.');
          return;
        }
      }
    }
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch(`/api/mercados/publico/${params.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuestas }),
      });
      if (res.ok) setEstado('enviada');
      else setError('No se pudo enviar. Intenta de nuevo.');
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  if (estado === 'cargando') {
    return <Centro><p className="mk-muted text-sm">Cargando encuesta…</p></Centro>;
  }
  if (estado === 'no_disponible') {
    return (
      <Centro>
        <div className="text-4xl">🔍</div>
        <h1 className="mt-3 text-lg font-semibold">Encuesta no disponible</h1>
        <p className="mk-muted mt-1 text-sm">El enlace no es válido o la encuesta aún no fue publicada.</p>
      </Centro>
    );
  }
  if (estado === 'cerrada') {
    return (
      <Centro>
        <div className="text-4xl">🔒</div>
        <h1 className="mt-3 text-lg font-semibold">Esta encuesta ya cerró</h1>
        <p className="mk-muted mt-1 text-sm">Gracias por tu interés. La recolección de respuestas finalizó.</p>
      </Centro>
    );
  }
  if (estado === 'enviada') {
    return (
      <Centro>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-xl font-bold">¡Gracias por responder!</h1>
        <p className="mk-muted mt-1 text-sm">Tu respuesta fue registrada. Puedes cerrar esta página.</p>
      </Centro>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 py-10">
      <div className="mk-card p-6">
        <h1 className="text-xl font-bold tracking-tight">{titulo}</h1>
        {descripcion && <p className="mk-muted mt-1 text-sm">{descripcion}</p>}
        <p className="mk-muted mt-2 text-xs">Tus respuestas son anónimas.</p>
      </div>

      <div className="mt-4 space-y-3">
        {preguntas.map((p, i) => (
          <div key={p.id} className="mk-card p-5">
            <p className="text-sm font-medium">
              <span className="mk-accent-text">{i + 1}.</span> {p.texto}
              {p.obligatoria && <span className="ml-1 text-rose-500">*</span>}
            </p>
            <div className="mt-3">
              {(p.tipo === 'opcion_unica' || p.tipo === 'likert' || p.tipo === 'escala') && (
                <div className="space-y-2">
                  {p.opciones.map((op) => (
                    <label key={op} className="mk-border flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm hover:bg-sky-50">
                      <input
                        type="radio"
                        name={p.id}
                        checked={respuestas[p.id] === op}
                        onChange={() => setR(p.id, op)}
                        className="accent-sky-600"
                      />
                      {op}
                    </label>
                  ))}
                </div>
              )}
              {p.tipo === 'opcion_multiple' && (
                <div className="space-y-2">
                  {p.opciones.map((op) => {
                    const sel = Array.isArray(respuestas[p.id]) && (respuestas[p.id] as string[]).includes(op);
                    return (
                      <label key={op} className="mk-border flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm hover:bg-sky-50">
                        <input type="checkbox" checked={sel} onChange={() => toggleMultiple(p.id, op)} className="accent-sky-600" />
                        {op}
                      </label>
                    );
                  })}
                </div>
              )}
              {p.tipo === 'abierta' && (
                <textarea
                  rows={3}
                  value={(respuestas[p.id] as string) ?? ''}
                  onChange={(e) => setR(p.id, e.target.value)}
                  className="mk-border w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              )}
              {p.tipo === 'numerica' && (
                <input
                  type="number"
                  value={(respuestas[p.id] as string) ?? ''}
                  onChange={(e) => setR(p.id, e.target.value)}
                  className="mk-border w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {error}
        </div>
      )}

      <button
        onClick={enviar}
        disabled={enviando}
        className="mk-btn-primary mt-5 flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {enviando ? 'Enviando…' : 'Enviar respuesta'}
      </button>
    </div>
  );
}

function Centro({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      {children}
    </div>
  );
}
