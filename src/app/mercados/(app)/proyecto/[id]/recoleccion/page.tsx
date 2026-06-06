'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Share2, Copy, Check, Lock, RefreshCw, ExternalLink } from 'lucide-react';

interface EncuestaRec {
  id: string;
  titulo: string;
  publicada: boolean;
  cerrada: boolean;
  token_publico: string | null;
}

export default function EtapaRecoleccion() {
  const params = useParams<{ id: string }>();
  const [encuesta, setEncuesta] = useState<EncuestaRec | null>(null);
  const [total, setTotal] = useState(0);
  const [meta, setMeta] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [accionando, setAccionando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
  }, []);

  const cargar = () => {
    fetch(`/api/mercados/proyectos/${params.id}/recoleccion`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setEncuesta(d.encuesta);
        setTotal(d.total ?? 0);
        setMeta(d.meta ?? null);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  };

  useEffect(cargar, [params.id]);

  const accion = async (accion: 'publicar' | 'cerrar' | 'reabrir') => {
    setAccionando(true);
    try {
      const res = await fetch(`/api/mercados/proyectos/${params.id}/recoleccion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ accion }),
      });
      if (res.ok) cargar();
    } finally {
      setAccionando(false);
    }
  };

  const linkPublico = encuesta?.token_publico ? `${origin}/mercados/responder/${encuesta.token_publico}` : '';
  const qrUrl = linkPublico
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(linkPublico)}`
    : '';

  const copiar = async () => {
    if (!linkPublico) return;
    await navigator.clipboard.writeText(linkPublico);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };

  if (cargando) return <div className="mk-muted py-10 text-center text-sm">Cargando…</div>;

  if (!encuesta) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link href={`/mercados/proyecto/${params.id}`} className="mk-muted inline-flex items-center gap-1 text-sm hover:text-sky-700">
          <ArrowLeft className="h-4 w-4" /> Volver al proyecto
        </Link>
        <div className="mk-card mt-4 p-6 text-center">
          <p className="font-semibold">Primero diseña tu encuesta</p>
          <p className="mk-muted mt-1 text-sm">Necesitas una encuesta con preguntas antes de recolectar.</p>
          <Link href={`/mercados/proyecto/${params.id}/encuesta`} className="mk-btn-primary mt-4 inline-block px-5 py-2 text-sm font-medium">
            Ir al diseñador de encuesta →
          </Link>
        </div>
      </div>
    );
  }

  const pct = meta && meta > 0 ? Math.min(100, Math.round((total / meta) * 100)) : null;

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <Link href={`/mercados/proyecto/${params.id}`} className="mk-muted inline-flex items-center gap-1 text-sm hover:text-sky-700">
        <ArrowLeft className="h-4 w-4" /> Volver al proyecto
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="mk-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Share2 className="mk-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="mk-accent-text text-xs font-semibold uppercase tracking-wider">Etapa 4</p>
          <h1 className="text-2xl font-bold tracking-tight">Recolección de respuestas</h1>
        </div>
      </header>

      {!encuesta.publicada ? (
        <div className="mk-card mt-5 p-6 text-center">
          <p className="text-3xl">🚀</p>
          <h2 className="mt-3 font-semibold">Tu encuesta está lista para publicar</h2>
          <p className="mk-muted mx-auto mt-1 max-w-md text-sm">
            Al publicar, generamos un link y un código QR. Compártelos por WhatsApp, redes o
            en persona. Cualquiera podrá responder sin necesidad de cuenta.
          </p>
          <button
            onClick={() => accion('publicar')}
            disabled={accionando}
            className="mk-btn-primary mt-4 px-6 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {accionando ? 'Publicando…' : 'Publicar encuesta'}
          </button>
        </div>
      ) : (
        <>
          {/* Contador */}
          <div className="mk-card mt-5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="mk-muted text-xs uppercase tracking-wider">Respuestas recibidas</p>
                <p className="mk-accent-text text-4xl font-bold">{total}</p>
                {meta && <p className="mk-muted text-sm">Meta (tu muestra): {meta}</p>}
              </div>
              <button onClick={cargar} className="mk-btn-ghost flex items-center gap-1.5 px-3 py-2 text-sm">
                <RefreshCw className="h-4 w-4" /> Actualizar
              </button>
            </div>
            {pct !== null && (
              <div className="mt-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-sky-100">
                  <div className="mk-accent-bg h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <p className="mk-muted mt-1 text-xs">{pct}% de tu muestra objetivo</p>
              </div>
            )}
          </div>

          {/* Estado: cerrada o activa */}
          {encuesta.cerrada ? (
            <div className="mk-card mt-4 flex items-center justify-between p-5">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">Encuesta cerrada — ya no recibe respuestas</span>
              </div>
              <button onClick={() => accion('reabrir')} disabled={accionando} className="mk-btn-ghost px-4 py-2 text-sm disabled:opacity-50">
                Reabrir
              </button>
            </div>
          ) : (
            <>
              {/* Link + QR */}
              <div className="mk-card mt-4 p-5">
                <p className="text-sm font-semibold">Comparte tu encuesta</p>
                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
                  {qrUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrUrl} alt="Código QR de la encuesta" width={140} height={140} className="mk-border rounded-lg border bg-white p-2" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="mk-muted text-xs">Link público (cualquiera responde, sin cuenta):</p>
                    <div className="mk-border mt-1 flex items-center gap-2 rounded-lg border bg-white p-2">
                      <span className="mk-accent-text truncate text-xs">{linkPublico}</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={copiar} className="mk-btn-ghost flex items-center gap-1.5 px-3 py-1.5 text-xs">
                        {copiado ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiado ? 'Copiado' : 'Copiar link'}
                      </button>
                      <a href={linkPublico} target="_blank" rel="noopener noreferrer" className="mk-btn-ghost flex items-center gap-1.5 px-3 py-1.5 text-xs">
                        <ExternalLink className="h-3.5 w-3.5" /> Previsualizar
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button onClick={() => accion('cerrar')} disabled={accionando} className="mk-btn-ghost px-4 py-2 text-sm disabled:opacity-50">
                  Cerrar encuesta
                </button>
                {total > 0 && (
                  <Link href={`/mercados/proyecto/${params.id}/analisis`} className="mk-accent-text text-sm font-medium">
                    Ver análisis (pronto) →
                  </Link>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
