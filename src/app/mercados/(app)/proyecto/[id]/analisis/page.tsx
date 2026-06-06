'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import {
  analizarPregunta,
  type PreguntaParaAnalisis,
  type RespuestaCruda,
  type ResultadoPregunta,
} from '@/lib/mercados/analisis';
import { getTipoPregunta } from '@/lib/mercados/tipos-pregunta';

export default function EtapaAnalisis() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [preguntas, setPreguntas] = useState<PreguntaParaAnalisis[]>([]);
  const [respuestas, setRespuestas] = useState<RespuestaCruda[]>([]);
  const [cargando, setCargando] = useState(true);
  const [marcando, setMarcando] = useState(false);

  useEffect(() => {
    fetch(`/api/mercados/proyectos/${params.id}/analisis`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setPreguntas(d.preguntas ?? []);
        setRespuestas(d.respuestas ?? []);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const analisis = useMemo(
    () => preguntas.map((p) => ({ pregunta: p, resultado: analizarPregunta(p, respuestas) })),
    [preguntas, respuestas]
  );

  const marcarListo = async () => {
    setMarcando(true);
    try {
      await fetch(`/api/mercados/proyectos/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estado: 'analisis' }),
      });
      router.push(`/mercados/proyecto/${params.id}`);
    } finally {
      setMarcando(false);
    }
  };

  if (cargando) return <div className="mk-muted py-10 text-center text-sm">Cargando análisis…</div>;

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <Link href={`/mercados/proyecto/${params.id}`} className="mk-muted inline-flex items-center gap-1 text-sm hover:text-sky-700">
        <ArrowLeft className="h-4 w-4" /> Volver al proyecto
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="mk-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <BarChart3 className="mk-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="mk-accent-text text-xs font-semibold uppercase tracking-wider">Etapa 5</p>
          <h1 className="text-2xl font-bold tracking-tight">Análisis de resultados</h1>
        </div>
      </header>
      <p className="mk-muted mt-2 text-sm">
        Tabulación automática de las {respuestas.length} respuestas recolectadas.
        Lee cada variable por separado (análisis univariado, clase 10).
      </p>

      {respuestas.length === 0 ? (
        <div className="mk-card mt-5 p-8 text-center">
          <p className="text-3xl">📭</p>
          <p className="mt-3 font-semibold">Aún no hay respuestas</p>
          <p className="mk-muted mt-1 text-sm">Vuelve a la etapa de recolección y comparte tu encuesta.</p>
          <Link href={`/mercados/proyecto/${params.id}/recoleccion`} className="mk-btn-primary mt-4 inline-block px-5 py-2 text-sm font-medium">
            Ir a recolección →
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-4">
            {analisis.map(({ pregunta, resultado }, i) => (
              <BloquePregunta key={pregunta.id} indice={i} pregunta={pregunta} resultado={resultado} />
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button onClick={marcarListo} disabled={marcando} className="mk-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50">
              {marcando ? 'Guardando…' : 'Marcar análisis listo →'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function BloquePregunta({
  indice,
  pregunta,
  resultado,
}: {
  indice: number;
  pregunta: PreguntaParaAnalisis;
  resultado: ResultadoPregunta;
}) {
  const meta = getTipoPregunta(pregunta.tipo);
  return (
    <div className="mk-card p-5">
      <div className="flex items-center gap-2 text-xs">
        <span className="mk-accent-soft mk-accent-text flex h-6 w-6 items-center justify-center rounded-full font-bold">
          {indice + 1}
        </span>
        <span className="mk-muted font-medium">{meta?.label}</span>
      </div>
      <h2 className="mt-2 text-sm font-semibold">{pregunta.texto}</h2>

      <div className="mt-3">
        {resultado.tipo === 'categorica' && (
          <div className="space-y-2">
            {resultado.conteos.map((c) => (
              <div key={c.opcion}>
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate pr-2">{c.opcion}</span>
                  <span className="mk-muted flex-shrink-0 font-medium">
                    {c.n} · {c.pct}%
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-sky-100">
                  <div className="mk-accent-bg h-full rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
            <p className="mk-muted mt-2 text-xs">Total respuestas: {resultado.total}</p>
          </div>
        )}

        {resultado.tipo === 'numerica' && (
          resultado.stats ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatMini label="Promedio" valor={resultado.stats.promedio.toFixed(1)} />
              <StatMini label="Mediana" valor={resultado.stats.mediana.toFixed(1)} />
              <StatMini label="Mínimo" valor={String(resultado.stats.min)} />
              <StatMini label="Máximo" valor={String(resultado.stats.max)} />
            </div>
          ) : (
            <p className="mk-muted text-xs">Sin datos numéricos.</p>
          )
        )}

        {resultado.tipo === 'abierta' && (
          <div className="space-y-1.5">
            {resultado.respuestas.length === 0 ? (
              <p className="mk-muted text-xs">Sin respuestas.</p>
            ) : (
              resultado.respuestas.slice(0, 30).map((r, i) => (
                <p key={i} className="mk-border rounded-lg border bg-white px-3 py-2 text-xs">
                  &ldquo;{r}&rdquo;
                </p>
              ))
            )}
            {resultado.respuestas.length > 30 && (
              <p className="mk-muted text-xs">… y {resultado.respuestas.length - 30} más</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatMini({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="mk-accent-soft rounded-lg p-2.5 text-center">
      <p className="mk-muted text-[10px] uppercase tracking-wider">{label}</p>
      <p className="mk-accent-text mt-0.5 text-lg font-bold">{valor}</p>
    </div>
  );
}
