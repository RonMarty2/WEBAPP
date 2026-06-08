'use client';

/**
 * Detalle del alumno — Wave 2 del panel docente.
 *
 * El docente entra acá desde "Mis alumnos" y ve TODOS los proyectos del
 * alumno agrupados por módulo (idea → mercados → estrategia → marketing →
 * organización → defensa → proyecto maestro). Por cada proyecto: título,
 * estado y última actualización.
 *
 * Permite editar inline la "nota privada del docente" sobre el alumno
 * (PATCH al endpoint del vínculo).
 *
 * Pendiente Wave 3: dejar observaciones por reporte (no por alumno).
 * Pendiente Wave 4: calificación con rúbrica.
 *
 * Finanzas se omite hasta resolver el bridge entre auth.users (UUID) y
 * el JWT propio de webapp (TEXT). Se muestra un aviso explicando que
 * el docente debe abrir el simulador con el alumno por ahora.
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Layers, FolderOpen, Save, AlertTriangle, GraduationCap } from 'lucide-react';

interface ProyectoResumen {
  id: string;
  titulo: string;
  estado: string | null;
  actualizado_en: string | null;
}

interface ModuloResumen {
  modulo: string;
  nombre: string;
  emoji: string;
  ruta: string;
  proyectos: ProyectoResumen[];
}

interface AlumnoDetalle {
  alumno: {
    vinculo_id: string;
    alumno_id: string;
    nombre: string;
    email: string;
    universidad: string | null;
    codigo_usado: string;
    vinculado_en: string;
    nota_docente: string | null;
    archivado: boolean;
  };
  total_proyectos: number;
  modulos: ModuloResumen[];
  sin_finanzas?: boolean;
}

function fmtFecha(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function DetalleAlumno() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<AlumnoDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [nota, setNota] = useState('');
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [notaGuardada, setNotaGuardada] = useState(false);

  const cargar = useCallback(() => {
    setCargando(true);
    fetch(`/api/docente/alumnos/${params.id}/proyectos`, { credentials: 'include' })
      .then(async (r) => {
        if (r.status === 401) { router.replace('/login'); return null; }
        if (r.status === 403) { router.replace('/docente'); return null; }
        const d = await r.json();
        if (!r.ok) {
          setError(d.error || 'No se pudo cargar el alumno');
          return null;
        }
        return d as AlumnoDetalle;
      })
      .then((d) => {
        if (d) {
          setData(d);
          setNota(d.alumno.nota_docente ?? '');
        }
      })
      .catch(() => setError('No se pudo cargar el alumno'))
      .finally(() => setCargando(false));
  }, [params.id, router]);

  useEffect(() => { cargar(); }, [cargar]);

  const guardarNota = async () => {
    if (!data) return;
    setGuardandoNota(true);
    setNotaGuardada(false);
    try {
      const res = await fetch(`/api/docente/alumnos/${data.alumno.vinculo_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nota_docente: nota.trim() }),
      });
      if (res.ok) {
        setNotaGuardada(true);
        setTimeout(() => setNotaGuardada(false), 2000);
      }
    } finally {
      setGuardandoNota(false);
    }
  };

  if (cargando) {
    return <div className="mx-auto max-w-4xl p-6 text-center text-sm text-slate-500">Cargando alumno…</div>;
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <AlertTriangle className="mx-auto h-6 w-6 text-rose-600" />
          <p className="mt-2 text-sm font-semibold text-rose-900">{error || 'Alumno no encontrado'}</p>
          <Link href="/docente" className="mt-3 inline-flex items-center gap-1 text-sm text-rose-800 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Volver a Mis alumnos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 pb-10">
      <Link href="/docente" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Mis alumnos
      </Link>

      <header className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-xl font-semibold text-violet-700">
          {(data.alumno.nombre || '?').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight text-slate-900">{data.alumno.nombre}</h1>
          <p className="truncate text-sm text-slate-500">{data.alumno.email}</p>
          <p className="mt-1 text-xs text-slate-400">
            {data.alumno.universidad && <>{data.alumno.universidad} · </>}
            Vinculado {fmtFecha(data.alumno.vinculado_en)} · código {data.alumno.codigo_usado}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">Proyectos</p>
          <p className="text-2xl font-bold text-slate-900">{data.total_proyectos}</p>
        </div>
      </header>

      {/* Nota privada del docente */}
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Nota privada (solo tú la ves)</h2>
          <button
            onClick={guardarNota}
            disabled={guardandoNota || nota === (data.alumno.nota_docente ?? '')}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Save className="h-3 w-3" />
            {guardandoNota ? 'Guardando…' : notaGuardada ? '✓ Guardada' : 'Guardar'}
          </button>
        </div>
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder='Ej: "está atrasado en mercados, le pedí ajustar la muestra el viernes"'
          rows={2}
          className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
      </section>

      {/* Aviso de Finanzas */}
      {data.sin_finanzas && (
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
          <span>
            <strong>Finanzas no aparece todavía.</strong> El simulador usa otra
            base de datos (Supabase Auth) y aún no está conectado al panel
            docente. Por ahora, pídele al alumno que abra el simulador contigo.
          </span>
        </div>
      )}

      {/* Proyectos por módulo */}
      <section className="mt-5 space-y-4">
        {data.modulos.map((m) => (
          <div key={m.modulo} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <span className="text-xl">{m.emoji}</span>
              <h3 className="flex-1 text-sm font-semibold text-slate-700">{m.nombre}</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {m.proyectos.length} {m.proyectos.length === 1 ? 'proyecto' : 'proyectos'}
              </span>
            </div>

            {m.proyectos.length === 0 ? (
              <p className="mt-3 text-xs text-slate-400">Aún no tiene proyectos en este módulo.</p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {m.proyectos.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
                    <FolderOpen className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                    <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{p.titulo}</span>
                    {p.estado && (
                      <span className="flex-shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200">
                        {p.estado}
                      </span>
                    )}
                    <span className="flex-shrink-0 text-[10px] text-slate-400">
                      {fmtFecha(p.actualizado_en)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* Footer */}
      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-500">
        <Layers className="mx-auto h-4 w-4 text-slate-400" />
        <p className="mt-1">
          Próximamente: dejar observaciones por reporte y calificar con rúbrica.
        </p>
        <p className="mt-0.5 text-[10px] text-slate-400">
          Si necesitas leer el contenido completo de un proyecto, abre el reporte del alumno
          con él (no podemos mostrar contenido privado sin su confirmación explícita).
        </p>
      </div>

      {/* Nota de privacidad — diseño Wave 2 */}
      <div className="mt-3 flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-[11px] text-slate-500">
        <GraduationCap className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-400" />
        <span>
          Esta vista te muestra <strong>solo los metadatos</strong> de los
          proyectos del alumno (títulos, estado, fecha). No accedemos al
          contenido de cada herramienta sin su autorización. Eso vendrá en
          una próxima entrega con un permiso explícito del alumno.
        </span>
      </div>
    </div>
  );
}
