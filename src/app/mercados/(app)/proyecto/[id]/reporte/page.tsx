'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileText, Download, Check, Sparkles } from 'lucide-react';
import type { ProyectoMercados } from '@/types/mercados';
import { generarReporteMarkdown } from '@/lib/mercados/reporte';
import type { PreguntaParaAnalisis, RespuestaCruda } from '@/lib/mercados/analisis';
import { useMaestroActivo } from '@/lib/maestro/useMaestroActivo';
import { ProgresoFlujo } from '@/components/compartido/ProgresoFlujo';
import { SiguienteModulo } from '@/components/compartido/SiguienteModulo';

export default function EtapaReporte() {
  const params = useParams<{ id: string }>();
  const maestro = useMaestroActivo();
  const [proyecto, setProyecto] = useState<ProyectoMercados | null>(null);
  const [preguntas, setPreguntas] = useState<PreguntaParaAnalisis[]>([]);
  const [respuestas, setRespuestas] = useState<RespuestaCruda[]>([]);
  const [cargando, setCargando] = useState(true);
  const [completado, setCompletado] = useState(false);
  const [marcando, setMarcando] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/mercados/proyectos/${params.id}`, { credentials: 'include' }).then((r) => r.json()),
      fetch(`/api/mercados/proyectos/${params.id}/analisis`, { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([p, a]) => {
        setProyecto(p.proyecto ?? null);
        setPreguntas(a.preguntas ?? []);
        setRespuestas(a.respuestas ?? []);
        if (p.proyecto?.estado === 'completo') setCompletado(true);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const markdown = useMemo(
    () => (proyecto ? generarReporteMarkdown(proyecto, preguntas, respuestas) : ''),
    [proyecto, preguntas, respuestas]
  );

  const descargar = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estudio-mercado-${(proyecto?.titulo ?? 'reporte').replace(/[^\w]+/g, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const marcarCompleto = async () => {
    setMarcando(true);
    try {
      const res = await fetch(`/api/mercados/proyectos/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estado: 'completo' }),
      });
      if (res.ok) setCompletado(true);
    } finally {
      setMarcando(false);
    }
  };

  if (cargando) return <div className="mk-muted py-10 text-center text-sm">Cargando reporte…</div>;
  if (!proyecto) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mk-card p-6 text-center">
          <p className="font-semibold">No encontramos esta investigación</p>
          <Link href="/mercados/proyecto" className="mk-accent-text mt-2 inline-block text-sm">← Mis investigaciones</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <Link href={`/mercados/proyecto/${params.id}`} className="mk-muted inline-flex items-center gap-1 text-sm hover:text-sky-700">
        <ArrowLeft className="h-4 w-4" /> Volver al proyecto
      </Link>

      <div className="mt-3">
        <ProgresoFlujo actual="mercados" modalidad={maestro?.modalidad} tipoTrabajoLabel={maestro?.modalidad ?? undefined} />
      </div>

      <header className="mt-4 flex items-center gap-3">
        <div className="mk-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <FileText className="mk-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="mk-accent-text text-xs font-semibold uppercase tracking-wider">Etapa 6</p>
          <h1 className="text-2xl font-bold tracking-tight">Reporte final</h1>
        </div>
      </header>
      <p className="mk-muted mt-2 text-sm">
        Tu estudio consolidado: objetivos, metodología y resultados en un solo documento,
        listo para descargar y para importar al Generador de tu proyecto.
      </p>

      {/* Acciones */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={descargar} className="mk-btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-medium">
          <Download className="h-4 w-4" /> Descargar reporte (.md)
        </button>
        {!completado ? (
          <button onClick={marcarCompleto} disabled={marcando} className="mk-btn-ghost flex items-center gap-2 px-5 py-2.5 text-sm font-medium disabled:opacity-50">
            {marcando ? 'Guardando…' : 'Marcar como completo'}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-4 py-2.5 text-sm font-medium text-emerald-800">
            <Check className="h-4 w-4" /> Investigación completada
          </span>
        )}
      </div>

      {/* Artefacto para el Generador */}
      <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50/60 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mk-accent-text mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-sky-900">Listo como artefacto</p>
            <p className="mt-0.5 text-xs text-sky-900/80">
              Este estudio queda guardado con tus datos reales. Cuando uses el Generador
              en modo conectado, tu capítulo de Estudio de Mercado se llenará con esto —
              no con datos inventados.
            </p>
          </div>
        </div>
      </div>

      {/* Vista previa del reporte */}
      <div className="mk-card mt-5 p-5">
        <p className="mk-muted mb-3 text-xs uppercase tracking-wider">Vista previa</p>
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
          {markdown}
        </pre>
      </div>

      <SiguienteModulo actual="mercados" modalidad={maestro?.modalidad} />
    </div>
  );
}
