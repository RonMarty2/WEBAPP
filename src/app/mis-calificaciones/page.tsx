'use client';

/**
 * Mis calificaciones — Wave 4 Pieza 2 (vista del alumno).
 *
 * El alumno ve TODAS las calificaciones que sus docentes han publicado.
 * Las borradores no aparecen aquí.
 *
 * Por cada calificación muestra:
 *   - Nombre del docente.
 *   - Proyecto + módulo.
 *   - Nota promedio + estado (aprobado / reprobado).
 *   - Detalle por criterio con su peso.
 *   - Comentario general del docente.
 *
 * Si el alumno todavía no tiene calificaciones, ve un empty-state que
 * lo lleva a /unirse-docente.
 */

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, GraduationCap, CheckCircle2, AlertOctagon, ChevronRight, ScrollText } from 'lucide-react';
import type { SessionUser } from '@/lib/auth';
import type { Calificacion, CriterioRubrica } from '@/types/docente-wave4';

interface CalificacionEnriquecida extends Calificacion {
  docente_nombre: string;
  rubrica: {
    nombre: string;
    criterios: CriterioRubrica[];
    escala_max: number;
  } | null;
}

const MODULO_META: Record<string, { label: string; emoji: string }> = {
  idea:         { label: 'Idea',         emoji: '💡' },
  mercados:     { label: 'Mercados',     emoji: '📊' },
  estrategia:   { label: 'Estrategia',   emoji: '🎯' },
  marketing:    { label: 'Marketing',    emoji: '📣' },
  organizacion: { label: 'Organización', emoji: '🧩' },
  finanzas:     { label: 'Finanzas',     emoji: '💰' },
  defensa:      { label: 'Defensa',      emoji: '🎓' },
  generador:    { label: 'Generador',    emoji: '⚡' },
  otro:         { label: 'Otro',         emoji: '📝' },
};

function fmtFecha(iso: string | null): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

export default function MisCalificaciones() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [cargandoUser, setCargandoUser] = useState(true);
  const [items, setItems] = useState<CalificacionEnriquecida[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [abierta, setAbierta] = useState<string | null>(null);

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
    fetch('/api/alumno/calificaciones', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setItems(d.calificaciones ?? []))
      .catch(() => setError('No se pudo cargar tus calificaciones.'))
      .finally(() => setCargando(false));
  }, [user]);

  const estadisticas = useMemo(() => {
    const total = items.length;
    let aprobadas = 0;
    let suma = 0;
    let conPromedio = 0;
    for (const c of items) {
      if (c.promedio_ponderado === null) continue;
      conPromedio++;
      suma += Number(c.promedio_ponderado);
      const aprMin = 51; // si no hay rúbrica, asumir escala 100
      const min = c.rubrica ? Math.round(c.rubrica.escala_max * 0.51) : aprMin;
      if (Number(c.promedio_ponderado) >= min) aprobadas++;
    }
    return {
      total,
      aprobadas,
      promedio: conPromedio > 0 ? Math.round((suma / conPromedio) * 100) / 100 : null,
    };
  }, [items]);

  if (cargandoUser) return <div className="p-10 text-center text-sm text-slate-500">Cargando…</div>;
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl p-6 pb-10">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Inicio
      </Link>

      <header className="mt-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">Tus notas</p>
          <h1 className="text-2xl font-bold tracking-tight">Mis calificaciones</h1>
          <p className="text-sm text-slate-500">
            Aquí ves las notas que tus docentes te dejaron. Solo aparecen las que ya publicaron.
          </p>
        </div>
      </header>

      {error && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{error}</div>}

      {!cargando && items.length > 0 && (
        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">Calificaciones</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{estadisticas.total}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-[11px] uppercase tracking-wider text-emerald-700">Aprobadas</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{estadisticas.aprobadas} / {estadisticas.total}</p>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
            <p className="text-[11px] uppercase tracking-wider text-violet-700">Promedio general</p>
            <p className="mt-1 text-2xl font-bold text-violet-700">{estadisticas.promedio ?? '—'}</p>
          </div>
        </section>
      )}

      <section className="mt-6">
        {cargando ? (
          <p className="text-sm text-slate-500">Cargando…</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <ScrollText className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-medium text-slate-700">Todavía no tienes calificaciones</p>
            <p className="mt-1 text-xs text-slate-500">
              Cuando un docente te ponga nota, aparecerá aquí. Si todavía no estás vinculado a un docente,
              pide su código y pégalo en{' '}
              <Link href="/unirse-docente" className="text-violet-700 underline">/unirse-docente</Link>.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((c) => {
              const rub = c.rubrica;
              const esc = rub?.escala_max ?? 100;
              const aprMin = rub ? Math.round(esc * 0.51) : 51;
              const aprobado = c.promedio_ponderado !== null && Number(c.promedio_ponderado) >= aprMin;
              const m = MODULO_META[c.modulo] ?? MODULO_META.otro;
              const open = abierta === c.id;
              return (
                <li key={c.id} className={`rounded-2xl border bg-white ${aprobado ? 'border-emerald-200' : 'border-rose-200'}`}>
                  <button
                    type="button"
                    onClick={() => setAbierta(open ? null : c.id)}
                    className="flex w-full items-center gap-3 p-4 text-left"
                    aria-expanded={open}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">{c.proyecto_titulo}</h3>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{m.emoji} {m.label}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {c.docente_nombre} · {rub?.nombre ?? 'Rúbrica'} · Publicada {fmtFecha(c.publicada_en)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <div>
                        <p className={`text-2xl font-bold ${aprobado ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {c.promedio_ponderado ?? '—'}
                          <span className="text-xs font-normal text-slate-400"> / {esc}</span>
                        </p>
                        <p className={`text-[10px] font-semibold ${aprobado ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {aprobado ? 'Aprobado' : 'Reprobado'}
                        </p>
                      </div>
                      {aprobado ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertOctagon className="h-5 w-5 text-rose-600" />}
                      <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {open && (
                    <div className="border-t border-slate-200 p-4">
                      {c.comentario_general && (
                        <div className="mb-4 rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">
                          <p className="text-[11px] font-semibold uppercase tracking-wider">Comentario de tu docente</p>
                          <p className="mt-1 italic">&ldquo;{c.comentario_general}&rdquo;</p>
                        </div>
                      )}
                      {rub && (
                        <>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Detalle por criterio</p>
                          <ul className="mt-2 space-y-2">
                            {rub.criterios.map((cr) => {
                              const n = c.notas_por_criterio.find((x) => x.criterio_id === cr.id);
                              const valor = n ? Number(n.nota) : null;
                              const pct = valor !== null ? Math.round((valor / esc) * 100) : 0;
                              return (
                                <li key={cr.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold text-slate-900">{cr.nombre}</p>
                                      <p className="text-[11px] text-slate-500">{cr.descripcion}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-bold text-slate-900">
                                        {valor ?? '—'}<span className="text-[11px] font-normal text-slate-400">/{esc}</span>
                                      </p>
                                      <p className="text-[10px] text-slate-500">Peso {cr.peso_pct}%</p>
                                    </div>
                                  </div>
                                  {valor !== null && (
                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                                      <div
                                        className={`h-full ${pct >= 51 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                        style={{ width: `${Math.min(100, pct)}%` }}
                                      />
                                    </div>
                                  )}
                                  {n?.comentario && (
                                    <p className="mt-2 text-[11px] italic text-slate-600">&ldquo;{n.comentario}&rdquo;</p>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
