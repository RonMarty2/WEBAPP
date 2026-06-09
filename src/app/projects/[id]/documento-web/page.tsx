'use client';

/**
 * /projects/[id]/documento-web
 *
 * Vista principal del documento para el ALUMNO. Renderiza todo el
 * contenido del proyecto en HTML bonito con índice + numeración +
 * formato académico. Botón "Copiar todo al Word" copia HTML rico al
 * portapapeles.
 *
 * Esta es la vista por defecto del alumno desde el workspace. La vista
 * antigua con LaTeX/PDF (/projects/[id]/documento) sigue accesible
 * para admin y QA.
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import DocumentoCompleto, { type FaseDoc } from '@/components/documento-web/DocumentoCompleto';
import { DEFAULT_UNIVERSITIES } from '@/lib/data';

interface Proyecto {
  id: string;
  usuario_id: string;
  servicio_id?: string;
  tipo_proyecto_id?: string;
  tema_aprobado?: string | null;
  titulo_provisional?: string | null;
  universidad_id?: string | null;
  phase_contents?: Record<string, string | null | undefined>;
  academic_context?: Record<string, unknown>;
}

interface PhaseDef {
  id: string;
  label: string;
  short_label?: string;
  orden: number;
}

export default function DocumentoWebPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) ?? '';

  const [cargando, setCargando] = useState(true);
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [fases, setFases] = useState<PhaseDef[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function cargar() {
      try {
        const [resProy, resFases] = await Promise.all([
          fetch(`/api/projects/${id}`, { credentials: 'include' }),
          fetch(`/api/projects/${id}/phases`, { credentials: 'include' }),
        ]);
        if (resProy.status === 401) {
          router.replace('/login');
          return;
        }
        if (!resProy.ok) {
          setError('No se pudo cargar el proyecto.');
          return;
        }
        const dataProy = await resProy.json();
        const dataFases = resFases.ok ? await resFases.json() : { phases: [] };
        if (cancelled) return;
        setProyecto(dataProy.proyecto ?? dataProy);
        setFases(((dataFases.phases ?? []) as PhaseDef[]).sort((a, b) => a.orden - b.orden));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error inesperado.');
      } finally {
        if (!cancelled) setCargando(false);
      }
    }

    cargar();
    return () => { cancelled = true; };
  }, [id, router]);

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !proyecto) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-rose-600" />
          <p className="mt-2 text-sm font-semibold text-rose-900">{error ?? 'Proyecto no encontrado'}</p>
          <Link href="/dashboard" className="mt-4 inline-flex items-center gap-1 text-sm text-rose-800 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const titulo = proyecto.tema_aprobado || proyecto.titulo_provisional || 'Mi documento';
  const ctx = (proyecto.academic_context ?? {}) as Record<string, string | undefined>;
  const universidadId = proyecto.universidad_id ?? '';
  const univ = DEFAULT_UNIVERSITIES.find((u) => u.id === universidadId);

  const fasesDoc: FaseDoc[] = fases.map((f) => ({
    id: f.id,
    label: f.label,
    short_label: f.short_label,
    orden: f.orden,
  }));

  return (
    <div className="min-h-screen bg-slate-100 pb-12 pt-6">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/projects/${id}/workspace`}
            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al workspace
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <Sparkles className="h-3.5 w-3.5" />
            Vista limpia para entregar
          </div>
        </div>

        <DocumentoCompleto
          titulo={titulo}
          fases={fasesDoc}
          phaseContents={proyecto.phase_contents ?? {}}
          universidadId={universidadId || null}
          caratula={{
            titulo,
            universidad: univ?.name ?? ctx.universidad_nombre,
            facultad: ctx.facultad,
            carrera: ctx.carrera,
            modalidad: ctx.modalidad,
            estudiante: ctx.estudiante_nombre,
            tutor: ctx.tutor_nombre,
            ciudad: ctx.ciudad,
            ano: new Date().getFullYear(),
          }}
          mostrarCaratula
        />
      </div>
    </div>
  );
}
