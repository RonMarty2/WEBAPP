'use client';

/**
 * Calificación de un alumno — Wave 4 Pieza 2.
 *
 * Recibe vinculo_id como [id]. Permite al docente:
 *   1) Elegir la rúbrica a aplicar (default la marcada como default_actual).
 *   2) Elegir el proyecto del alumno a calificar (módulo + proyecto_id).
 *   3) Poner nota por criterio + comentario opcional por criterio.
 *   4) Guardar como borrador o publicar (publicado = el alumno ya lo ve).
 *   5) Ver historial de calificaciones que le dio a este alumno.
 *
 * Si el docente abre con ?modulo=mercados&proyecto=P123&titulo=Mi+plan,
 * pre-llena esos campos (útil para deep-link desde /docente/alumno/[id]).
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Send, Star, GraduationCap, AlertTriangle, CheckCircle2, FileEdit, Trash2, Pencil } from 'lucide-react';
import type { SessionUser } from '@/lib/auth';
import {
  calcularPromedioPonderado,
  type Rubrica,
  type Calificacion,
  type NotaPorCriterio,
  type ModuloCalificable,
} from '@/types/docente-wave4';

const MODULOS: { valor: ModuloCalificable; label: string; emoji: string }[] = [
  { valor: 'idea',         label: 'Idea',         emoji: '💡' },
  { valor: 'mercados',     label: 'Mercados',     emoji: '📊' },
  { valor: 'estrategia',   label: 'Estrategia',   emoji: '🎯' },
  { valor: 'marketing',    label: 'Marketing',    emoji: '📣' },
  { valor: 'organizacion', label: 'Organización', emoji: '🧩' },
  { valor: 'finanzas',     label: 'Finanzas',     emoji: '💰' },
  { valor: 'defensa',      label: 'Defensa',      emoji: '🎓' },
  { valor: 'generador',    label: 'Generador',    emoji: '⚡' },
  { valor: 'otro',         label: 'Otro',         emoji: '📝' },
];

interface AlumnoMini {
  vinculo_id: string;
  nombre: string;
  email: string;
}

interface ProyectoLite {
  modulo: ModuloCalificable;
  proyecto_id: string;
  titulo: string;
}

function fmtFecha(iso: string | null): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

export default function CalificarAlumno() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [cargandoUser, setCargandoUser] = useState(true);

  const [alumno, setAlumno] = useState<AlumnoMini | null>(null);
  const [proyectos, setProyectos] = useState<ProyectoLite[]>([]);
  const [rubricas, setRubricas] = useState<Rubrica[]>([]);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [msgOk, setMsgOk] = useState('');

  // Form de calificación.
  const [rubricaId, setRubricaId] = useState<string>('');
  const [modulo, setModulo] = useState<ModuloCalificable | ''>('');
  const [proyectoId, setProyectoId] = useState<string>('');
  const [proyectoTitulo, setProyectoTitulo] = useState<string>('');
  const [notas, setNotas] = useState<NotaPorCriterio[]>([]);
  const [comentarioGeneral, setComentarioGeneral] = useState('');
  const [guardando, setGuardando] = useState(false);

  const rubricaActiva = useMemo(() => rubricas.find((r) => r.id === rubricaId), [rubricas, rubricaId]);
  const promedioEstimado = useMemo(() => {
    if (!rubricaActiva) return null;
    return calcularPromedioPonderado(rubricaActiva.criterios, notas);
  }, [rubricaActiva, notas]);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) { router.replace('/login'); return; }
        setUser(d.user);
      })
      .catch(() => router.replace('/login'))
      .finally(() => setCargandoUser(false));
  }, [router]);

  const cargar = useCallback(() => {
    setCargando(true);
    Promise.all([
      fetch(`/api/docente/alumnos/${params.id}/proyectos`, { credentials: 'include' }).then((r) => r.ok ? r.json() : null),
      fetch('/api/docente/rubricas', { credentials: 'include' }).then((r) => r.json()),
      fetch(`/api/docente/calificaciones?vinculo_id=${params.id}`, { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([detalle, rubs, califs]) => {
        if (detalle) {
          setAlumno({
            vinculo_id: detalle.alumno.vinculo_id,
            nombre: detalle.alumno.nombre,
            email: detalle.alumno.email,
          });
          // Aplanar proyectos del alumno por módulo.
          const flat: ProyectoLite[] = [];
          for (const m of (detalle.modulos ?? []) as Array<{ modulo: string; proyectos: Array<{ id: string; titulo: string }> }>) {
            for (const p of m.proyectos) {
              flat.push({ modulo: m.modulo as ModuloCalificable, proyecto_id: p.id, titulo: p.titulo });
            }
          }
          setProyectos(flat);
        }
        setRubricas(rubs.rubricas ?? []);
        setCalificaciones(califs.calificaciones ?? []);

        // Pre-llenar rúbrica con la default.
        const def = (rubs.rubricas ?? []).find((r: Rubrica) => r.default_actual);
        if (def) setRubricaId(def.id);

        // Pre-llenar desde query string.
        const moduloQ = search.get('modulo') as ModuloCalificable | null;
        const proyectoQ = search.get('proyecto');
        const tituloQ = search.get('titulo');
        if (moduloQ) setModulo(moduloQ);
        if (proyectoQ) setProyectoId(proyectoQ);
        if (tituloQ) setProyectoTitulo(tituloQ);
      })
      .catch(() => setError('No se pudo cargar la información.'))
      .finally(() => setCargando(false));
  }, [params.id, search]);

  useEffect(() => { if (user) cargar(); }, [user, cargar]);

  // Cuando cambia la rúbrica, reiniciar notas con un slot por criterio.
  useEffect(() => {
    if (!rubricaActiva) { setNotas([]); return; }
    setNotas((prev) => rubricaActiva.criterios.map((c) => {
      const ya = prev.find((n) => n.criterio_id === c.id);
      return ya ?? { criterio_id: c.id, nota: 0, comentario: null };
    }));
  }, [rubricaActiva]);

  // Cuando cambia el (módulo, proyecto), buscar calificación previa para pre-llenar.
  useEffect(() => {
    if (!rubricaId || !modulo || !proyectoId) return;
    const previa = calificaciones.find(
      (c) => c.rubrica_id === rubricaId && c.modulo === modulo && c.proyecto_id === proyectoId,
    );
    if (previa) {
      setNotas(previa.notas_por_criterio);
      setComentarioGeneral(previa.comentario_general ?? '');
    } else {
      setComentarioGeneral('');
    }
  }, [rubricaId, modulo, proyectoId, calificaciones]);

  function actualizarNota(criterioId: string, nota: number) {
    setNotas((prev) => prev.map((n) => (n.criterio_id === criterioId ? { ...n, nota } : n)));
  }
  function actualizarComentario(criterioId: string, comentario: string) {
    setNotas((prev) => prev.map((n) => (n.criterio_id === criterioId ? { ...n, comentario: comentario || null } : n)));
  }

  function elegirProyectoExistente(p: ProyectoLite) {
    setModulo(p.modulo);
    setProyectoId(p.proyecto_id);
    setProyectoTitulo(p.titulo);
  }

  async function enviar(publicar: boolean) {
    if (!rubricaId) { setError('Elige una rúbrica.'); return; }
    if (!modulo || !proyectoId || !proyectoTitulo.trim()) {
      setError('Elige el módulo y el proyecto a calificar.'); return;
    }
    setError(''); setMsgOk('');
    setGuardando(true);
    try {
      const res = await fetch('/api/docente/calificaciones', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vinculo_id: params.id,
          rubrica_id: rubricaId,
          modulo,
          proyecto_id: proyectoId,
          proyecto_titulo: proyectoTitulo.trim(),
          notas_por_criterio: notas,
          comentario_general: comentarioGeneral.trim() || null,
          publicar,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'No se pudo guardar.'); return; }
      // Refrescar lista
      setCalificaciones((prev) => {
        const sin = prev.filter((c) => c.id !== data.calificacion.id);
        return [data.calificacion, ...sin];
      });
      setMsgOk(publicar
        ? `Calificación publicada. ${alumno?.nombre} ya puede verla en /mis-calificaciones.`
        : 'Borrador guardado. El alumno NO la ve hasta que la publiques.');
      setTimeout(() => setMsgOk(''), 4000);
    } finally {
      setGuardando(false);
    }
  }

  async function publicarExistente(id: string) {
    const res = await fetch(`/api/docente/calificaciones/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'publicada' }),
    });
    if (res.ok) {
      const d = await res.json();
      setCalificaciones((prev) => prev.map((c) => (c.id === id ? d.calificacion : c)));
    }
  }

  async function eliminarCalif(id: string) {
    if (!window.confirm('¿Eliminar esta calificación? Si estaba publicada, el alumno dejará de verla.')) return;
    const res = await fetch(`/api/docente/calificaciones/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) setCalificaciones((prev) => prev.filter((c) => c.id !== id));
  }

  if (cargandoUser) return <div className="p-10 text-center text-sm text-slate-500">Cargando…</div>;
  if (!user) return null;

  const esDocente = user.role === 'docente' || user.role === 'admin';
  if (!esDocente) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <AlertTriangle className="h-5 w-5 text-amber-700" />
          <h1 className="mt-2 text-lg font-semibold text-amber-900">Solo para docentes</h1>
          <Link href="/dashboard" className="mt-4 inline-flex items-center gap-1 text-sm text-amber-900 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        </div>
      </div>
    );
  }

  if (cargando) return <div className="p-10 text-center text-sm text-slate-500">Cargando…</div>;

  if (!alumno) {
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

  const escala = rubricaActiva?.escala_max ?? 100;
  const aprueba = rubricaActiva?.nota_aprueba ?? 51;
  const aprobado = promedioEstimado !== null && promedioEstimado >= aprueba;

  return (
    <div className="mx-auto max-w-4xl p-6 pb-10">
      <Link href={`/docente/alumno/${params.id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Volver al alumno
      </Link>

      <header className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-lg font-semibold text-violet-700">
          {alumno.nombre.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">Calificar a</p>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{alumno.nombre}</h1>
          <p className="text-xs text-slate-500">{alumno.email}</p>
        </div>
        <Link
          href="/docente/rubricas"
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <FileEdit className="h-3.5 w-3.5" /> Gestionar rúbricas
        </Link>
      </header>

      {error && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{error}</div>}
      {msgOk && <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{msgOk}</div>}

      {rubricas.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-semibold">Todavía no tienes ninguna rúbrica.</p>
          <p className="mt-1">Para calificar primero necesitas definir los criterios y sus pesos.</p>
          <Link href="/docente/rubricas" className="mt-3 inline-flex items-center gap-1 rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-800">
            <FileEdit className="h-3.5 w-3.5" /> Crear mi primera rúbrica
          </Link>
        </section>
      ) : (
        <>
          {/* Selector rúbrica + proyecto */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-700">1. Elige qué calificar</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-slate-700">Rúbrica</span>
                <select
                  value={rubricaId}
                  onChange={(e) => setRubricaId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                >
                  {rubricas.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.default_actual ? '⭐ ' : ''}{r.nombre} (0–{r.escala_max})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-700">Módulo</span>
                <select
                  value={modulo}
                  onChange={(e) => setModulo(e.target.value as ModuloCalificable | '')}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                >
                  <option value="">— elige —</option>
                  {MODULOS.map((m) => (<option key={m.valor} value={m.valor}>{m.emoji} {m.label}</option>))}
                </select>
              </label>
            </div>

            <label className="mt-3 block">
              <span className="text-xs font-medium text-slate-700">Título del proyecto / entregable</span>
              <input
                value={proyectoTitulo}
                onChange={(e) => setProyectoTitulo(e.target.value)}
                placeholder="Ej. Plan de negocio: cafetería La Recoleta"
                maxLength={200}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </label>
            <label className="mt-2 block">
              <span className="text-xs font-medium text-slate-700">ID del proyecto (sin espacios)</span>
              <input
                value={proyectoId}
                onChange={(e) => setProyectoId(e.target.value)}
                placeholder="Ej. p-mkt-2026-01"
                maxLength={100}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </label>

            {proyectos.length > 0 && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Proyectos del alumno</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {proyectos.map((p) => {
                    const elegido = p.proyecto_id === proyectoId && p.modulo === modulo;
                    return (
                      <button
                        key={`${p.modulo}-${p.proyecto_id}`}
                        type="button"
                        onClick={() => elegirProyectoExistente(p)}
                        className={`rounded-md border px-2 py-1 text-xs ${elegido ? 'border-violet-500 bg-violet-100 text-violet-800' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}
                        title={`${p.modulo} · ${p.proyecto_id}`}
                      >
                        {MODULOS.find((m) => m.valor === p.modulo)?.emoji ?? '📝'} {p.titulo}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Notas por criterio */}
          {rubricaActiva && (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-700">2. Pon nota por criterio</h2>
                  <p className="text-xs text-slate-500">Cada criterio se pondera con su peso. El promedio sale automático.</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500">Promedio ponderado</p>
                  <p className={`text-2xl font-bold ${promedioEstimado === null ? 'text-slate-400' : aprobado ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {promedioEstimado === null ? '—' : promedioEstimado}
                    <span className="text-sm font-normal text-slate-400"> / {escala}</span>
                  </p>
                  {promedioEstimado !== null && (
                    <p className={`text-[11px] font-semibold ${aprobado ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {aprobado ? `Aprueba (≥ ${aprueba})` : `Reprueba (< ${aprueba})`}
                    </p>
                  )}
                </div>
              </div>

              <ul className="mt-4 space-y-3">
                {rubricaActiva.criterios.map((c) => {
                  const n = notas.find((x) => x.criterio_id === c.id) ?? { criterio_id: c.id, nota: 0, comentario: null };
                  return (
                    <li key={c.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900">{c.nombre}</p>
                          {c.descripcion && <p className="mt-0.5 text-xs text-slate-500">{c.descripcion}</p>}
                        </div>
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                          Peso {c.peso_pct}%
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <input
                          type="range"
                          min={0}
                          max={escala}
                          step={escala === 7 ? 0.5 : 1}
                          value={n.nota}
                          onChange={(e) => actualizarNota(c.id, Number(e.target.value))}
                          className="flex-1 accent-violet-600"
                          aria-label={`Nota para ${c.nombre}`}
                        />
                        <input
                          type="number"
                          value={n.nota}
                          onChange={(e) => actualizarNota(c.id, Math.max(0, Math.min(escala, Number(e.target.value) || 0)))}
                          min={0}
                          max={escala}
                          step={escala === 7 ? 0.5 : 1}
                          className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                        />
                        <span className="text-xs text-slate-500">/ {escala}</span>
                      </div>
                      <textarea
                        value={n.comentario ?? ''}
                        onChange={(e) => actualizarComentario(c.id, e.target.value)}
                        rows={1}
                        maxLength={1000}
                        placeholder="Comentario opcional sobre este criterio"
                        className="mt-2 w-full resize-none rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                      />
                    </li>
                  );
                })}
              </ul>

              <label className="mt-4 block">
                <span className="text-xs font-medium text-slate-700">Comentario general (opcional)</span>
                <textarea
                  value={comentarioGeneral}
                  onChange={(e) => setComentarioGeneral(e.target.value)}
                  rows={3}
                  placeholder="Mensaje completo para el alumno, independiente de los criterios."
                  className="mt-1 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </label>
            </section>
          )}

          {/* Acciones */}
          {rubricaActiva && (
            <section className="mt-4 flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => enviar(false)}
                disabled={guardando}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> {guardando ? 'Guardando…' : 'Guardar borrador'}
              </button>
              <button
                onClick={() => enviar(true)}
                disabled={guardando}
                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> {guardando ? 'Publicando…' : 'Publicar al alumno'}
              </button>
            </section>
          )}

          {/* Historial */}
          {calificaciones.length > 0 && (
            <section className="mt-8">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-700">
                  Calificaciones que le has dado <span className="font-normal text-slate-500">({calificaciones.length})</span>
                </h2>
              </div>
              <ul className="mt-3 space-y-2">
                {calificaciones.map((c) => {
                  const rub = rubricas.find((r) => r.id === c.rubrica_id);
                  const esc = rub?.escala_max ?? 100;
                  const aprMin = rub?.nota_aprueba ?? 51;
                  const apr = c.promedio_ponderado !== null && c.promedio_ponderado >= aprMin;
                  const m = MODULOS.find((x) => x.valor === c.modulo);
                  return (
                    <li key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-slate-900">{c.proyecto_titulo}</h3>
                            {m && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{m.emoji} {m.label}</span>}
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.estado === 'publicada' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {c.estado === 'publicada' ? 'Publicada' : 'Borrador'}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {rub?.nombre ?? 'Rúbrica'} · Actualizada {fmtFecha(c.actualizada_en)}
                          </p>
                          {c.comentario_general && <p className="mt-2 text-xs text-slate-600 italic">&ldquo;{c.comentario_general}&rdquo;</p>}
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${apr ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {c.promedio_ponderado ?? '—'}<span className="text-xs font-normal text-slate-400">/{esc}</span>
                          </p>
                          {apr ? <CheckCircle2 className="ml-auto mt-1 h-3.5 w-3.5 text-emerald-600" /> : <Star className="ml-auto mt-1 h-3.5 w-3.5 text-rose-600" />}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-100 pt-2">
                        <button
                          onClick={() => {
                            setRubricaId(c.rubrica_id);
                            setModulo(c.modulo);
                            setProyectoId(c.proyecto_id);
                            setProyectoTitulo(c.proyecto_titulo);
                            setNotas(c.notas_por_criterio);
                            setComentarioGeneral(c.comentario_general ?? '');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-3 w-3" /> Editar
                        </button>
                        {c.estado === 'borrador' && (
                          <button
                            onClick={() => publicarExistente(c.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                          >
                            <Send className="h-3 w-3" /> Publicar
                          </button>
                        )}
                        <button
                          onClick={() => eliminarCalif(c.id)}
                          className="inline-flex items-center gap-1 rounded-md p-1 text-rose-600 hover:bg-rose-50"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
