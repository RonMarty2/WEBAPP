'use client';

/**
 * Calendario de entregas del docente — Wave 4 Pieza 2.
 *
 * Lo que hace:
 *   1) Lista las fechas tope (próximas + vencidas + cumplidas).
 *   2) Permite crear una nueva entrega:
 *      - Para TODOS los alumnos del docente (vinculo_id = null).
 *      - O para UN alumno específico (selector con sus alumnos vinculados).
 *   3) Permite cancelar/eliminar entregas.
 *   4) Muestra contador "faltan X días" o "vencida hace X días".
 *
 * Solo accesible para role docente o admin.
 */

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, X, Calendar, Clock, AlertTriangle, Globe, User, CheckCircle2, AlertOctagon } from 'lucide-react';
import type { SessionUser } from '@/lib/auth';
import type { Entrega, ModuloCalificable, PrioridadEntrega } from '@/types/docente-wave4';

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

interface AlumnoVinculo {
  id: string;
  alumno_nombre: string;
  alumno_email: string;
}

function fmtFechaCorta(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return iso; }
}
function fmtHora(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}
function diasDesdeAhora(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

const ESTADO_BADGE: Record<Entrega['estado'], { cls: string; label: string }> = {
  programada: { cls: 'bg-blue-100 text-blue-800',       label: 'Programada' },
  vencida:    { cls: 'bg-rose-100 text-rose-800',       label: 'Vencida' },
  cumplida:   { cls: 'bg-emerald-100 text-emerald-800', label: 'Cumplida' },
  cancelada:  { cls: 'bg-slate-100 text-slate-500',     label: 'Cancelada' },
};

const PRIORIDAD_BADGE: Record<PrioridadEntrega, { cls: string; label: string }> = {
  alta:  { cls: 'bg-rose-100 text-rose-800',       label: 'Prioridad alta' },
  media: { cls: 'bg-amber-100 text-amber-800',     label: 'Prioridad media' },
  baja:  { cls: 'bg-slate-100 text-slate-600',     label: 'Prioridad baja' },
};

export default function CalendarioDocente() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [cargandoUser, setCargandoUser] = useState(true);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [alumnos, setAlumnos] = useState<AlumnoVinculo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Form crear.
  const [mostrarForm, setMostrarForm] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInput, setFechaInput] = useState('');
  const [horaInput, setHoraInput] = useState('23:59');
  const [prioridad, setPrioridad] = useState<PrioridadEntrega>('media');
  const [moduloSugerido, setModuloSugerido] = useState<ModuloCalificable | ''>('');
  const [vinculoId, setVinculoId] = useState<string>('');  // '' = para todos
  const [guardando, setGuardando] = useState(false);

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

  useEffect(() => {
    if (!user) return;
    const esDocente = user.role === 'docente' || user.role === 'admin';
    if (!esDocente) { setCargando(false); return; }
    Promise.all([
      fetch('/api/docente/entregas', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/docente/alumnos', { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([ents, alms]) => {
        setEntregas(ents.entregas ?? []);
        setAlumnos(alms.alumnos ?? []);
      })
      .catch(() => setError('No se pudo cargar el calendario.'))
      .finally(() => setCargando(false));
  }, [user]);

  // Agrupa por estado para mostrar bloques separados.
  const grupos = useMemo(() => {
    const programadas: Entrega[] = [];
    const vencidas: Entrega[] = [];
    const cumplidasYCanceladas: Entrega[] = [];
    for (const e of entregas) {
      if (e.estado === 'programada') programadas.push(e);
      else if (e.estado === 'vencida') vencidas.push(e);
      else cumplidasYCanceladas.push(e);
    }
    return { programadas, vencidas, cumplidasYCanceladas };
  }, [entregas]);

  async function guardar() {
    if (!titulo.trim()) { setError('Pon un título a la entrega.'); return; }
    if (!fechaInput) { setError('Elige la fecha tope.'); return; }
    const isoLocal = `${fechaInput}T${horaInput || '23:59'}:00`;
    const fechaObj = new Date(isoLocal);
    if (isNaN(fechaObj.getTime())) { setError('Fecha inválida.'); return; }
    setError('');
    setGuardando(true);
    try {
      const res = await fetch('/api/docente/entregas', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descripcion: descripcion.trim() || null,
          fecha_tope: fechaObj.toISOString(),
          prioridad,
          modulo_sugerido: moduloSugerido || null,
          vinculo_id: vinculoId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'No se pudo guardar.'); return; }
      setEntregas((prev) => [data.entrega, ...prev].sort((a, b) =>
        new Date(a.fecha_tope).getTime() - new Date(b.fecha_tope).getTime()
      ));
      setMostrarForm(false);
      setTitulo(''); setDescripcion(''); setFechaInput(''); setHoraInput('23:59');
      setPrioridad('media'); setModuloSugerido(''); setVinculoId('');
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(id: string, estado: Entrega['estado']) {
    const res = await fetch(`/api/docente/entregas/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    if (res.ok) {
      setEntregas((prev) => prev.map((e) => (e.id === id ? { ...e, estado } : e)));
    }
  }

  async function eliminar(id: string) {
    if (!window.confirm('¿Eliminar esta entrega del calendario? Los alumnos dejarán de verla.')) return;
    const res = await fetch(`/api/docente/entregas/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) setEntregas((prev) => prev.filter((e) => e.id !== id));
  }

  if (cargandoUser) return <div className="p-10 text-center text-sm text-slate-500">Cargando…</div>;
  if (!user) return null;

  const esDocente = user.role === 'docente' || user.role === 'admin';
  if (!esDocente) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-700" />
            <h1 className="text-lg font-semibold text-amber-900">Panel solo para docentes</h1>
          </div>
          <p className="mt-2 text-sm text-amber-900">
            Aquí el docente crea fechas tope para sus alumnos. Si lo que buscas es
            ver las tuyas, ve a <Link href="/mis-entregas" className="underline">/mis-entregas</Link>.
          </p>
          <Link href="/dashboard" className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 pb-10">
      <Link href="/docente" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Panel docente
      </Link>

      <header className="mt-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">Modo docente · Wave 4</p>
            <h1 className="text-2xl font-bold tracking-tight">Calendario de entregas</h1>
            <p className="text-sm text-slate-500">
              Define fechas tope para que tus alumnos sepan cuándo entregar cada cosa.
              Pueden ser globales (todos) o privadas (un alumno).
            </p>
          </div>
        </div>
        {!mostrarForm && (
          <button
            onClick={() => setMostrarForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" /> Nueva fecha tope
          </button>
        )}
      </header>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{error}</div>
      )}

      {mostrarForm && (
        <section className="mt-6 rounded-2xl border border-violet-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Nueva fecha tope</h2>
            <button onClick={() => setMostrarForm(false)} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Cerrar">
              <X className="h-4 w-4" />
            </button>
          </div>

          <label className="mt-4 block">
            <span className="text-xs font-medium text-slate-700">Título *</span>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={200}
              placeholder="Ej. Entrega 1: investigación de mercado"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </label>

          <label className="mt-3 block">
            <span className="text-xs font-medium text-slate-700">Descripción (opcional)</span>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              placeholder="Qué debe contener la entrega. El alumno verá esto en su /mis-entregas."
              className="mt-1 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </label>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-700">Fecha *</span>
              <input
                type="date"
                value={fechaInput}
                onChange={(e) => setFechaInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-700">Hora</span>
              <input
                type="time"
                value={horaInput}
                onChange={(e) => setHoraInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-700">Prioridad</span>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as PrioridadEntrega)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </label>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-slate-700">Módulo sugerido</span>
              <select
                value={moduloSugerido}
                onChange={(e) => setModuloSugerido(e.target.value as ModuloCalificable | '')}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              >
                <option value="">— ninguno —</option>
                {MODULOS.map((m) => (
                  <option key={m.valor} value={m.valor}>{m.emoji} {m.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-700">Para quién</span>
              <select
                value={vinculoId}
                onChange={(e) => setVinculoId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              >
                <option value="">🌐 Para todos mis alumnos</option>
                {alumnos.map((a) => (
                  <option key={a.id} value={a.id}>👤 {a.alumno_nombre}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
            <button onClick={() => setMostrarForm(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancelar
            </button>
            <button
              onClick={guardar}
              disabled={guardando || !titulo.trim() || !fechaInput}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {guardando ? 'Guardando…' : 'Guardar fecha tope'}
            </button>
          </div>
        </section>
      )}

      {/* Bloque: vencidas */}
      {grupos.vencidas.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-rose-600" />
            <h2 className="text-sm font-semibold text-rose-800">
              Vencidas <span className="font-normal text-slate-500">({grupos.vencidas.length})</span>
            </h2>
          </div>
          <ul className="mt-3 space-y-2">
            {grupos.vencidas.map((e) => (
              <EntregaItem
                key={e.id}
                entrega={e}
                alumnos={alumnos}
                onMarcarCumplida={() => cambiarEstado(e.id, 'cumplida')}
                onCancelar={() => cambiarEstado(e.id, 'cancelada')}
                onEliminar={() => eliminar(e.id)}
              />
            ))}
          </ul>
        </section>
      )}

      {/* Bloque: próximas */}
      <section className="mt-6">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-blue-800">
            Próximas <span className="font-normal text-slate-500">({grupos.programadas.length})</span>
          </h2>
        </div>
        {cargando ? (
          <p className="mt-4 text-sm text-slate-500">Cargando…</p>
        ) : grupos.programadas.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <Calendar className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-medium text-slate-700">No hay fechas tope próximas</p>
            <p className="mt-1 text-xs text-slate-500">Crea una arriba para que tus alumnos la vean en su panel.</p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {grupos.programadas.map((e) => (
              <EntregaItem
                key={e.id}
                entrega={e}
                alumnos={alumnos}
                onMarcarCumplida={() => cambiarEstado(e.id, 'cumplida')}
                onCancelar={() => cambiarEstado(e.id, 'cancelada')}
                onEliminar={() => eliminar(e.id)}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Bloque: cumplidas + canceladas (collapsed visual) */}
      {grupos.cumplidasYCanceladas.length > 0 && (
        <section className="mt-6">
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-slate-700 hover:text-slate-900">
              Historial <span className="font-normal text-slate-500">({grupos.cumplidasYCanceladas.length})</span>
            </summary>
            <ul className="mt-3 space-y-2">
              {grupos.cumplidasYCanceladas.map((e) => (
                <EntregaItem
                  key={e.id}
                  entrega={e}
                  alumnos={alumnos}
                  onMarcarCumplida={() => cambiarEstado(e.id, 'cumplida')}
                  onCancelar={() => cambiarEstado(e.id, 'cancelada')}
                  onEliminar={() => eliminar(e.id)}
                />
              ))}
            </ul>
          </details>
        </section>
      )}
    </div>
  );
}

function EntregaItem({
  entrega: e,
  alumnos,
  onMarcarCumplida,
  onCancelar,
  onEliminar,
}: {
  entrega: Entrega;
  alumnos: AlumnoVinculo[];
  onMarcarCumplida: () => void;
  onCancelar: () => void;
  onEliminar: () => void;
}) {
  const dias = diasDesdeAhora(e.fecha_tope);
  const alumno = e.vinculo_id ? alumnos.find((a) => a.id === e.vinculo_id) : null;
  const moduloMeta = MODULOS.find((m) => m.valor === e.modulo_sugerido);
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">{e.titulo}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ESTADO_BADGE[e.estado].cls}`}>
              {ESTADO_BADGE[e.estado].label}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORIDAD_BADGE[e.prioridad].cls}`}>
              {PRIORIDAD_BADGE[e.prioridad].label}
            </span>
            {moduloMeta && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                {moduloMeta.emoji} {moduloMeta.label}
              </span>
            )}
          </div>
          {e.descripcion && <p className="mt-1 text-xs text-slate-600">{e.descripcion}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {fmtFechaCorta(e.fecha_tope)} · {fmtHora(e.fecha_tope)}
            </span>
            {e.estado === 'programada' && (
              <span className={`inline-flex items-center gap-1 ${dias <= 3 ? 'font-semibold text-amber-700' : ''}`}>
                <Clock className="h-3 w-3" /> Faltan {dias} día{dias === 1 ? '' : 's'}
              </span>
            )}
            {e.estado === 'vencida' && (
              <span className="inline-flex items-center gap-1 text-rose-700">
                <AlertOctagon className="h-3 w-3" /> Venció hace {-dias} día{-dias === 1 ? '' : 's'}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              {alumno ? (
                <>
                  <User className="h-3 w-3" /> Solo {alumno.alumno_nombre}
                </>
              ) : (
                <>
                  <Globe className="h-3 w-3" /> Todos mis alumnos
                </>
              )}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {e.estado === 'programada' || e.estado === 'vencida' ? (
            <>
              <button
                onClick={onMarcarCumplida}
                className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                title="Marcar cumplida"
              >
                <CheckCircle2 className="h-3 w-3" /> Cumplida
              </button>
              <button
                onClick={onCancelar}
                className="inline-flex items-center gap-1 rounded-md p-1 text-[11px] text-slate-500 hover:bg-slate-100"
                title="Cancelar"
              >
                Cancelar
              </button>
            </>
          ) : null}
          <button
            onClick={onEliminar}
            className="inline-flex items-center gap-1 rounded-md p-1.5 text-rose-600 hover:bg-rose-50"
            title="Eliminar definitivamente"
            aria-label="Eliminar fecha tope"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}

