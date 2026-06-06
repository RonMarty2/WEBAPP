'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Target,
  Calculator,
  ClipboardList,
  Share2,
  BarChart3,
  FileText,
  Check,
  Lock,
} from 'lucide-react';
import type { ProyectoMercados, EstadoProyecto } from '@/types/mercados';

/** Orden de las etapas del flujo de investigación. */
const ETAPAS: Array<{
  key: EstadoProyecto;
  label: string;
  desc: string;
  icon: typeof Target;
  ruta: string;
  fase: number; // fase del módulo en que se construye
}> = [
  { key: 'diseno', label: 'Diseño', desc: 'Objetivos, hipótesis y variables', icon: Target, ruta: 'diseno', fase: 2 },
  { key: 'muestreo', label: 'Muestreo', desc: 'Universo y tamaño de muestra', icon: Calculator, ruta: 'muestreo', fase: 2 },
  { key: 'encuesta', label: 'Encuesta', desc: 'Diseña tu instrumento', icon: ClipboardList, ruta: 'encuesta', fase: 3 },
  { key: 'recoleccion', label: 'Recolección', desc: 'Comparte link/QR y recibe respuestas', icon: Share2, ruta: 'recoleccion', fase: 4 },
  { key: 'analisis', label: 'Análisis', desc: 'Tabula y analiza resultados', icon: BarChart3, ruta: 'analisis', fase: 5 },
  { key: 'reporte', label: 'Reporte', desc: 'Estudio final exportable', icon: FileText, ruta: 'reporte', fase: 6 },
];

const ORDEN: EstadoProyecto[] = ['diseno', 'muestreo', 'encuesta', 'recoleccion', 'analisis', 'reporte', 'completo'];

export default function ProyectoDetalle() {
  const params = useParams<{ id: string }>();
  const [proyecto, setProyecto] = useState<ProyectoMercados | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');

  useEffect(() => {
    fetch(`/api/mercados/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setProyecto(d.proyecto); setEstado('ok'); })
      .catch(() => setEstado('error'));
  }, [params.id]);

  if (estado === 'cargando') {
    return <div className="mk-muted py-10 text-center text-sm">Cargando investigación…</div>;
  }
  if (estado === 'error' || !proyecto) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mk-card p-6 text-center">
          <p className="font-semibold">No encontramos esta investigación</p>
          <Link href="/mercados/proyecto" className="mk-accent-text mt-2 inline-block text-sm">
            ← Volver a mis investigaciones
          </Link>
        </div>
      </div>
    );
  }

  const idxActual = ORDEN.indexOf(proyecto.estado);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/mercados/proyecto"
        className="mk-muted inline-flex items-center gap-1 text-sm hover:text-sky-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Mis investigaciones
      </Link>

      <header className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight">{proyecto.titulo}</h1>
        <p className="mk-muted mt-1 text-sm">
          Avanza por las etapas en orden. Cada una alimenta a la siguiente.
        </p>
      </header>

      <div className="mt-6 space-y-3">
        {ETAPAS.map((etapa, i) => {
          const idxEtapa = ORDEN.indexOf(etapa.key);
          const completada = idxActual > idxEtapa;
          const activa = idxActual === idxEtapa;
          // Disponible: etapas hasta FASE 5 (… análisis).
          // La etapa Reporte (fase 6) aún no → bloqueada con candado.
          const disponible = etapa.fase <= 5;
          const Icon = etapa.icon;

          const contenido = (
            <div
              className={`mk-card flex items-center gap-4 p-4 ${
                activa ? 'ring-2 ring-sky-300' : ''
              } ${!disponible ? 'opacity-60' : ''}`}
            >
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                  completada
                    ? 'bg-emerald-500 text-white'
                    : activa
                    ? 'mk-accent-bg text-white'
                    : 'mk-accent-soft mk-accent-text'
                }`}
              >
                {completada ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="mk-muted text-xs font-medium uppercase tracking-wider">
                    Etapa {i + 1}
                  </span>
                  {activa && (
                    <span className="mk-accent-soft mk-accent-text rounded-full px-2 py-0.5 text-xs font-medium">
                      Actual
                    </span>
                  )}
                </div>
                <p className="font-semibold">{etapa.label}</p>
                <p className="mk-muted text-sm">{etapa.desc}</p>
              </div>
              {disponible ? (
                <span className="mk-accent-text flex-shrink-0 text-sm font-medium">
                  {completada ? 'Revisar' : 'Abrir'} →
                </span>
              ) : (
                <span className="mk-muted flex flex-shrink-0 items-center gap-1 text-xs">
                  <Lock className="h-3.5 w-3.5" />
                  Pronto
                </span>
              )}
            </div>
          );

          return disponible ? (
            <Link key={etapa.key} href={`/mercados/proyecto/${proyecto.id}/${etapa.ruta}`}>
              {contenido}
            </Link>
          ) : (
            <div key={etapa.key}>{contenido}</div>
          );
        })}
      </div>
    </div>
  );
}
