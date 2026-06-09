'use client';

/**
 * Mis entregas — Wave 4 Pieza 2 (vista del alumno).
 *
 * El alumno ve fechas tope que sus docentes le han asignado:
 *   - Globales del docente (vinculo_id IS NULL) que aplican a todos.
 *   - Privadas que apuntan a SU vínculo específicamente.
 *
 * El backend auto-marca como `vencida` las que ya pasaron.
 *
 * Se agrupan en bloques:
 *   - Vencidas (rojo) — venció y todavía está marcada como pendiente.
 *   - Esta semana (amber) — vence ≤ 7 días.
 *   - Próximas (azul) — vence > 7 días.
 *   - Historial (cumplidas / canceladas).
 */

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, AlertOctagon, CheckCircle2, Globe, User, Flame } from 'lucide-react';
import type { SessionUser } from '@/lib/auth';
import type { Entrega, PrioridadEntrega } from '@/types/docente-wave4';

interface EntregaEnriquecida extends Entrega {
  docente_nombre: string;
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

const PRIORIDAD_META: Record<PrioridadEntrega, { cls: string; label: string }> = {
  alta:  { cls: 'bg-rose-100 text-rose-800',       label: 'Prioridad alta' },
  media: { cls: 'bg-amber-100 text-amber-800',     label: 'Prioridad media' },
  baja:  { cls: 'bg-slate-100 text-slate-600',     label: 'Prioridad baja' },
};

function fmtFechaCorta(iso: string): string {
  try { return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}
function fmtHora(iso: string): string {
  try { return new Date(iso).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}
function diasDesdeAhora(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

export default function MisEntregas() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [cargandoUser, setCargandoUser] = useState(true);
  const [entregas, setEntregas] = useState<EntregaEnriquecida[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

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
    fetch('/api/alumno/entregas', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setEntregas(d.entregas ?? []))
      .catch(() => setError('No se pudo cargar tus entregas.'))
      .finally(() => setCargando(false));
  }, [user]);

  const grupos = useMemo(() => {
    const vencidas: EntregaEnriquecida[] = [];
    const estaSemana: EntregaEnriquecida[] = [];
    const proximas: EntregaEnriquecida[] = [];
    const historial: EntregaEnriquecida[] = [];
    for (const e of entregas) {
      if (e.estado === 'cumplida' || e.estado === 'cancelada') {
        historial.push(e); continue;
      }
      if (e.estado === 'vencida') { vencidas.push(e); continue; }
      // programada
      const d = diasDesdeAhora(e.fecha_tope);
      if (d <= 7) estaSemana.push(e);
      else proximas.push(e);
    }
    return { vencidas, estaSemana, proximas, historial };
  }, [entregas]);

  if (cargandoUser) return <div className="p-10 text-center text-sm text-slate-500">Cargando…</div>;
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl p-6 pb-10">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Inicio
      </Link>

      <header className="mt-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <Calendar className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">Calendario</p>
          <h1 className="text-2xl font-bold tracking-tight">Mis entregas</h1>
          <p className="text-sm text-slate-500">
            Las fechas tope que tus docentes te asignaron. Las vencidas aparecen primero.
          </p>
        </div>
      </header>

      {error && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{error}</div>}

      {!cargando && entregas.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <Calendar className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm font-medium text-slate-700">Sin fechas tope por ahora</p>
          <p className="mt-1 text-xs text-slate-500">
            Cuando un docente te asigne una entrega, aparecerá aquí. Si todavía no estás vinculado,
            pega su código en <Link href="/unirse-docente" className="text-violet-700 underline">/unirse-docente</Link>.
          </p>
        </div>
      )}

      {cargando && <p className="mt-6 text-sm text-slate-500">Cargando…</p>}

      {grupos.vencidas.length > 0 && (
        <Bloque titulo="Vencidas" icono={<AlertOctagon className="h-4 w-4 text-rose-600" />} colorTitulo="text-rose-800">
          {grupos.vencidas.map((e) => <EntregaCard key={e.id} entrega={e} />)}
        </Bloque>
      )}

      {grupos.estaSemana.length > 0 && (
        <Bloque titulo="Esta semana" icono={<Flame className="h-4 w-4 text-amber-600" />} colorTitulo="text-amber-800">
          {grupos.estaSemana.map((e) => <EntregaCard key={e.id} entrega={e} />)}
        </Bloque>
      )}

      {grupos.proximas.length > 0 && (
        <Bloque titulo="Próximas" icono={<Clock className="h-4 w-4 text-blue-600" />} colorTitulo="text-blue-800">
          {grupos.proximas.map((e) => <EntregaCard key={e.id} entrega={e} />)}
        </Bloque>
      )}

      {grupos.historial.length > 0 && (
        <section className="mt-6">
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-slate-700 hover:text-slate-900">
              Historial <span className="font-normal text-slate-500">({grupos.historial.length})</span>
            </summary>
            <ul className="mt-3 space-y-2">
              {grupos.historial.map((e) => <EntregaCard key={e.id} entrega={e} />)}
            </ul>
          </details>
        </section>
      )}
    </div>
  );
}

function Bloque({ titulo, icono, colorTitulo, children }: { titulo: string; icono: React.ReactNode; colorTitulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <div className="flex items-center gap-2">
        {icono}
        <h2 className={`text-sm font-semibold ${colorTitulo}`}>{titulo}</h2>
      </div>
      <ul className="mt-3 space-y-2">{children}</ul>
    </section>
  );
}

function EntregaCard({ entrega: e }: { entrega: EntregaEnriquecida }) {
  const dias = diasDesdeAhora(e.fecha_tope);
  const m = e.modulo_sugerido ? MODULO_META[e.modulo_sugerido] : null;
  const esVencida = e.estado === 'vencida';
  const esCumplida = e.estado === 'cumplida';
  const esCancelada = e.estado === 'cancelada';
  return (
    <li className={`rounded-xl border bg-white p-4 ${esVencida ? 'border-rose-200' : esCumplida ? 'border-emerald-200' : esCancelada ? 'border-slate-200 opacity-60' : 'border-slate-200'}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">{e.titulo}</h3>
            {esCumplida && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                <CheckCircle2 className="h-3 w-3" /> Cumplida
              </span>
            )}
            {esCancelada && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Cancelada</span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORIDAD_META[e.prioridad].cls}`}>
              {PRIORIDAD_META[e.prioridad].label}
            </span>
            {m && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                {m.emoji} {m.label}
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
            {esVencida && (
              <span className="inline-flex items-center gap-1 text-rose-700">
                <AlertOctagon className="h-3 w-3" /> Venció hace {-dias} día{-dias === 1 ? '' : 's'}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              {e.vinculo_id === null ? (
                <>
                  <Globe className="h-3 w-3" /> Para todos los alumnos
                </>
              ) : (
                <>
                  <User className="h-3 w-3" /> Solo para ti
                </>
              )}
            </span>
            <span className="text-slate-400">· {e.docente_nombre}</span>
          </div>
        </div>
      </div>
    </li>
  );
}
