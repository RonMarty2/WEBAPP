'use client';

/**
 * Detalle del alumno — Waves 2 y 3 del panel docente.
 *
 * Wave 2: muestra metadatos de los proyectos del alumno por módulo.
 * Wave 3: el docente puede dejar observaciones por proyecto + ver las
 *          que ya dejó (con su estado: pendiente/atendida/descartada).
 *          Permite editar la nota privada del docente inline.
 *
 * Pendiente Wave 4: rúbrica de calificación.
 *
 * Finanzas se omite del agregado por ahora (bridge UUID ↔ TEXT pendiente).
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Layers, FolderOpen, Save, AlertTriangle, GraduationCap, MessageSquare, X, Check, Trash2 } from 'lucide-react';

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
  /**
   * El alumno permite que este docente vea el CONTENIDO de sus proyectos
   * (no solo metadatos). El alumno controla este flag en `/unirse-docente`.
   * Por defecto false hasta que el alumno active el toggle.
   */
  consentimiento_ver_contenido?: boolean;
}

interface Observacion {
  id: string;
  vinculo_id: string;
  docente_id: string;
  alumno_id: string;
  modulo: string;
  proyecto_id: string;
  proyecto_titulo: string;
  observacion: string;
  estado: 'pendiente' | 'atendida' | 'descartada';
  respuesta_alumno: string | null;
  creada_en: string;
  actualizada_en: string;
}

function fmtFecha(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

const ESTADO_BADGE: Record<Observacion['estado'], { label: string; cls: string }> = {
  pendiente:   { label: 'Pendiente',  cls: 'bg-amber-100 text-amber-800' },
  atendida:    { label: 'Atendida',   cls: 'bg-emerald-100 text-emerald-800' },
  descartada:  { label: 'Descartada', cls: 'bg-slate-100 text-slate-500' },
};

export default function DetalleAlumno() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<AlumnoDetalle | null>(null);
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [nota, setNota] = useState('');
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [notaGuardada, setNotaGuardada] = useState(false);

  // Estado del form de "nueva observación" por proyecto. La clave es
  // `${modulo}::${proyecto_id}` para distinguir entre múltiples proyectos
  // del mismo módulo.
  const [obsAbierta, setObsAbierta] = useState<string | null>(null);
  const [obsTexto, setObsTexto] = useState('');
  const [obsEnviando, setObsEnviando] = useState(false);

  const cargar = useCallback(() => {
    setCargando(true);
    Promise.all([
      fetch(`/api/docente/alumnos/${params.id}/proyectos`, { credentials: 'include' }).then(async (r) => {
        if (r.status === 401) { router.replace('/login'); return null; }
        if (r.status === 403) { router.replace('/docente'); return null; }
        const d = await r.json();
        return r.ok ? (d as AlumnoDetalle) : null;
      }),
      fetch(`/api/docente/observaciones?vinculo_id=${params.id}`, { credentials: 'include' })
        .then((r) => r.ok ? r.json() : { observaciones: [] }),
    ])
      .then(([detalle, obs]) => {
        if (detalle) {
          setData(detalle);
          setNota(detalle.alumno.nota_docente ?? '');
        } else {
          setError('No se pudo cargar el alumno');
        }
        setObservaciones(obs.observaciones ?? []);
      })
      .catch(() => setError('No se pudo cargar el alumno'))
      .finally(() => setCargando(false));
  }, [params.id, router]);

  useEffect(() => { cargar(); }, [cargar]);

  const obsPorProyecto = useMemo(() => {
    const m = new Map<string, Observacion[]>();
    for (const o of observaciones) {
      const k = `${o.modulo}::${o.proyecto_id}`;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(o);
    }
    return m;
  }, [observaciones]);

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

  const abrirObs = (modulo: string, proyectoId: string) => {
    setObsAbierta(`${modulo}::${proyectoId}`);
    setObsTexto('');
  };

  const cancelarObs = () => {
    setObsAbierta(null);
    setObsTexto('');
  };

  const enviarObs = async (modulo: string, proyecto: ProyectoResumen) => {
    if (!data || !obsTexto.trim()) return;
    setObsEnviando(true);
    try {
      const res = await fetch('/api/docente/observaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          vinculo_id: data.alumno.vinculo_id,
          modulo,
          proyecto_id: proyecto.id,
          proyecto_titulo: proyecto.titulo,
          observacion: obsTexto.trim(),
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setObservaciones((prev) => [d.observacion, ...prev]);
        cancelarObs();
      } else {
        alert(d.error || 'No se pudo crear la observación');
      }
    } finally {
      setObsEnviando(false);
    }
  };

  const descartarObs = async (id: string) => {
    if (!window.confirm('¿Descartar esta observación? El alumno seguirá viéndola pero marcada como descartada.')) return;
    const res = await fetch(`/api/docente/observaciones/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ estado: 'descartada' }),
    });
    if (res.ok) {
      const d = await res.json();
      setObservaciones((prev) => prev.map((o) => o.id === id ? d.observacion : o));
    }
  };

  const eliminarObs = async (id: string) => {
    if (!window.confirm('¿Eliminar esta observación definitivamente?')) return;
    const res = await fetch(`/api/docente/observaciones/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) setObservaciones((prev) => prev.filter((o) => o.id !== id));
  };

  if (cargando) {
    return <div className="mx-auto max-w-4xl p-6 text-center text-sm text-slate-500">Cargando alumno…</div>;
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <AlertTriangle className="mx-auto h-6 w-6 text-rose-600" aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-rose-900">{error || 'Alumno no encontrado'}</p>
          <Link href="/docente" className="mt-3 inline-flex items-center gap-1 text-sm text-rose-800 hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver a Mis alumnos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 pb-10">
      <Link href="/docente" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Mis alumnos
      </Link>

      <header className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-xl font-semibold text-violet-700" aria-hidden="true">
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

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Nota privada (solo tú la ves)</h2>
          <button
            onClick={guardarNota}
            disabled={guardandoNota || nota === (data.alumno.nota_docente ?? '')}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            aria-label="Guardar nota privada"
          >
            <Save className="h-3 w-3" aria-hidden="true" />
            {guardandoNota ? 'Guardando…' : notaGuardada ? '✓ Guardada' : 'Guardar'}
          </button>
        </div>
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder='Ej: "está atrasado en mercados, le pedí ajustar la muestra el viernes"'
          rows={2}
          aria-label="Nota privada sobre el alumno"
          className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
      </section>

      {data.sin_finanzas && (
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" aria-hidden="true" />
          <span>
            <strong>Finanzas no aparece todavía.</strong> El simulador usa otra
            base de datos (Supabase Auth) y aún no está conectado al panel
            docente. Por ahora, pídele al alumno que abra el simulador contigo.
          </span>
        </div>
      )}

      <section className="mt-5 space-y-4">
        {data.modulos.map((m) => (
          <div key={m.modulo} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">{m.emoji}</span>
              <h3 className="flex-1 text-sm font-semibold text-slate-700">{m.nombre}</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {m.proyectos.length} {m.proyectos.length === 1 ? 'proyecto' : 'proyectos'}
              </span>
            </div>

            {m.proyectos.length === 0 ? (
              <p className="mt-3 text-xs text-slate-400">Aún no tiene proyectos en este módulo.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {m.proyectos.map((p) => {
                  const obsKey = `${m.modulo}::${p.id}`;
                  const obsAbiertaActiva = obsAbierta === obsKey;
                  const obsExistentes = obsPorProyecto.get(obsKey) ?? [];
                  return (
                    <li key={p.id} className="rounded-lg border border-slate-100 bg-slate-50">
                      <div className="flex items-center gap-3 px-3 py-2 text-xs">
                        <FolderOpen className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{p.titulo}</span>
                        {p.estado && (
                          <span className="flex-shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200">
                            {p.estado}
                          </span>
                        )}
                        <span className="hidden flex-shrink-0 text-[10px] text-slate-400 sm:inline">
                          {fmtFecha(p.actualizado_en)}
                        </span>
                        {obsExistentes.length > 0 && (
                          <span className="flex-shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                            {obsExistentes.length} obs.
                          </span>
                        )}
                        <button
                          onClick={() => obsAbiertaActiva ? cancelarObs() : abrirObs(m.modulo, p.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-white px-2 py-0.5 text-[10px] font-medium text-violet-700 hover:bg-violet-50"
                          aria-label={`Dejar observación sobre ${p.titulo}`}
                        >
                          <MessageSquare className="h-3 w-3" aria-hidden="true" />
                          {obsAbiertaActiva ? 'Cerrar' : 'Observar'}
                        </button>
                      </div>

                      {obsAbiertaActiva && (
                        <div className="border-t border-slate-200 bg-white p-3">
                          <textarea
                            value={obsTexto}
                            onChange={(e) => setObsTexto(e.target.value)}
                            placeholder='Ej: "Revisa la sección de competencia — falta justificar por qué los excluiste"'
                            rows={3}
                            autoFocus
                            aria-label="Texto de la observación"
                            className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-200"
                          />
                          <div className="mt-2 flex justify-end gap-2">
                            <button
                              onClick={cancelarObs}
                              className="rounded-md px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => enviarObs(m.modulo, p)}
                              disabled={obsEnviando || !obsTexto.trim()}
                              className="inline-flex items-center gap-1 rounded-md bg-violet-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                            >
                              {obsEnviando ? 'Enviando…' : 'Enviar observación'}
                            </button>
                          </div>
                        </div>
                      )}

                      {obsExistentes.length > 0 && (
                        <ul className="space-y-1.5 border-t border-slate-200 bg-white px-3 py-2">
                          {obsExistentes.map((o) => (
                            <li key={o.id} className="flex items-start gap-2 text-[11px]">
                              <span className={`mt-0.5 flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${ESTADO_BADGE[o.estado].cls}`}>
                                {ESTADO_BADGE[o.estado].label}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-slate-700">{o.observacion}</p>
                                {o.respuesta_alumno && (
                                  <p className="mt-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] text-emerald-900">
                                    <strong>Respuesta del alumno:</strong> {o.respuesta_alumno}
                                  </p>
                                )}
                                <p className="mt-0.5 text-[10px] text-slate-400">{fmtFecha(o.creada_en)}</p>
                              </div>
                              {o.estado !== 'descartada' && (
                                <button
                                  onClick={() => descartarObs(o.id)}
                                  className="rounded p-0.5 text-slate-400 hover:bg-slate-100"
                                  title="Descartar"
                                  aria-label="Descartar observación"
                                >
                                  <X className="h-3 w-3" aria-hidden="true" />
                                </button>
                              )}
                              <button
                                onClick={() => eliminarObs(o.id)}
                                className="rounded p-0.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                title="Eliminar definitivamente"
                                aria-label="Eliminar observación"
                              >
                                <Trash2 className="h-3 w-3" aria-hidden="true" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </section>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-500">
        <Layers className="mx-auto h-4 w-4 text-slate-400" aria-hidden="true" />
        <p className="mt-1">
          Próximamente: rúbrica de calificación y calendario de entregas.
        </p>
      </div>

      <div className={`mt-3 flex items-start gap-2 rounded-lg border p-3 text-[11px] ${
        data.consentimiento_ver_contenido
          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
          : 'border-slate-200 bg-white text-slate-500'
      }`}>
        <GraduationCap className="mt-0.5 h-3 w-3 flex-shrink-0" aria-hidden="true" />
        {data.consentimiento_ver_contenido ? (
          <span>
            <strong>Consentimiento del alumno: activo.</strong> El alumno te
            autorizó a ver el contenido de sus proyectos. La integración con la
            lectura del contenido completo de cada herramienta se entregará en
            una próxima Wave. Por ahora ves los mismos metadatos, pero tus
            permisos están registrados.
          </span>
        ) : (
          <span>
            Esta vista te muestra <strong>solo los metadatos</strong> de los
            proyectos del alumno. El contenido completo se habilita solo si el
            alumno te da permiso explícito en su pantalla <strong>Mis docentes</strong>
            (por defecto está apagado). <Check className="inline h-3 w-3 text-emerald-600" aria-hidden="true" /> Tus observaciones SÍ
            le llegan en cualquier caso.
          </span>
        )}
      </div>
    </div>
  );
}
