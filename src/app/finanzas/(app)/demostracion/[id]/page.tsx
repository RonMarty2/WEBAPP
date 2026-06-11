'use client';

/**
 * Modo Demostración — presentación a pantalla completa del análisis
 * financiero del alumno, al nivel de una defensa pública de proyecto
 * de grado. Lee el proyecto real de Supabase, calcula KPIs en vivo y
 * arma 10 láminas navegables con teclado ← →, click y fullscreen.
 *
 * Decisión sesión 12 — aprobada por el usuario.
 */

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { useAuthStore } from '@/stores/finanzas/auth-store';
import { obtenerProyectoPorId } from '@/lib/finanzas/proyecto-supabase';
import { calcularKpis, calcularSeries, calcularPuntoEquilibrioSimple, calcularTributacion, formatearBolivianos, formatearPorcentaje } from '@/lib/finanzas/demostracion';
import type { Proyecto } from '@/types/finanzas/proyecto';
import { ArrowLeft, ArrowRight, Maximize2, Minimize2, Printer, X } from 'lucide-react';
import BotonDescargaExcel from '@/components/finanzas/BotonDescargaExcel';
import type { HojaIndividual } from '@/lib/finanzas/excel-exporter';

// ── Lámina base ────────────────────────────────────────────────────────────

interface LaminaProps {
  numero: number;
  total: number;
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
  /** Slot superior derecho: típicamente el botón "Descargar esta tabla". */
  accion?: React.ReactNode;
}

function Lamina({ numero, total, titulo, subtitulo, children, accion }: LaminaProps) {
  return (
    <section className="lamina flex h-full flex-col bg-zinc-900 text-zinc-100 print:break-after-page print:bg-white print:text-black">
      <header className="flex items-end justify-between gap-6 border-b border-zinc-700/60 px-12 py-8 print:border-zinc-300">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/90">
            Lámina {numero} / {total}
          </p>
          <h2 className="mt-2 text-4xl font-bold leading-tight tracking-tight text-white print:text-black">{titulo}</h2>
          {subtitulo && <p className="mt-2 max-w-3xl text-base text-zinc-300 print:text-zinc-700">{subtitulo}</p>}
        </div>
        {accion && <div className="print:hidden">{accion}</div>}
      </header>
      <div className="flex-1 overflow-auto px-12 py-10">{children}</div>
    </section>
  );
}

function Pill({ children, color = 'zinc' }: { children: React.ReactNode; color?: 'zinc' | 'amber' | 'emerald' | 'rose' | 'sky' }) {
  const colorMap = {
    zinc:    'bg-zinc-800 text-zinc-200 ring-zinc-700',
    amber:   'bg-amber-500/15 text-amber-300 ring-amber-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
    rose:    'bg-rose-500/15 text-rose-300 ring-rose-500/30',
    sky:     'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  };
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${colorMap[color]}`}>{children}</span>;
}

function MetricCard({ label, value, sub, semaforo }: { label: string; value: string; sub?: string; semaforo?: 'verde' | 'amber' | 'rojo' }) {
  const borderCol =
    semaforo === 'verde' ? 'border-emerald-500/40 bg-emerald-500/5'
    : semaforo === 'rojo' ? 'border-rose-500/40 bg-rose-500/5'
    : semaforo === 'amber' ? 'border-amber-500/40 bg-amber-500/5'
    : 'border-zinc-700/60 bg-zinc-800/50';
  return (
    <div className={`rounded-2xl border ${borderCol} p-6`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
      <p className="mt-2 text-4xl font-bold tabular-nums text-white">{value}</p>
      {sub && <p className="mt-1 text-sm text-zinc-400">{sub}</p>}
    </div>
  );
}

function EmptyData({ msg }: { msg: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-600 bg-zinc-900/40 p-10 text-center text-zinc-400">
      {msg}
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────

export default function ModoDemostracionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'noEncontrado'>('cargando');
  const [lamina, setLamina] = useState(0);
  const [esFullscreen, setEsFullscreen] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  // Carga el proyecto por id directo: el Modo Demostración es accesible para
  // cualquier usuario autenticado del módulo (estudiante, docente o admin),
  // no solo para el dueño. Así el docente puede proyectar el trabajo del
  // alumno en clase o en la defensa.
  useEffect(() => {
    if (!user) return;
    let cancelado = false;
    obtenerProyectoPorId(params.id)
      .then((p) => {
        if (cancelado) return;
        if (p) {
          setProyecto(p);
          setEstado('listo');
        } else {
          setEstado('noEncontrado');
        }
      })
      .catch(() => {
        if (!cancelado) setEstado('noEncontrado');
      });
    return () => { cancelado = true; };
  }, [user, params.id]);

  // Navegación con teclado.
  const total = 11;
  const irAnterior = useCallback(() => setLamina((n) => Math.max(0, n - 1)), []);
  const irSiguiente = useCallback(() => setLamina((n) => Math.min(total - 1, n + 1)), [total]);
  const salir = useCallback(() => router.back(), [router]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') irAnterior();
      else if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); irSiguiente(); }
      else if (e.key === 'Escape') salir();
      else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      else if (e.key === 'p' || e.key === 'P') { e.preventDefault(); window.print(); }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [irAnterior, irSiguiente, salir]);

  // Fullscreen API
  function toggleFullscreen() {
    const el = contenedorRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setEsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setEsFullscreen(false)).catch(() => {});
    }
  }
  useEffect(() => {
    function onChange() { setEsFullscreen(!!document.fullscreenElement); }
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // KPIs y series — solo cuando hay proyecto.
  const kpis = useMemo(() => (proyecto ? calcularKpis(proyecto) : null), [proyecto]);
  const series = useMemo(() => (proyecto ? calcularSeries(proyecto) : null), [proyecto]);
  const peq = useMemo(() => (proyecto ? calcularPuntoEquilibrioSimple(proyecto) : null), [proyecto]);
  const trib = useMemo(() => (proyecto ? calcularTributacion(proyecto) : null), [proyecto]);

  if (estado === 'cargando') {
    return <div className="flex h-screen items-center justify-center bg-zinc-900 text-zinc-400">Cargando proyecto…</div>;
  }
  if (estado === 'noEncontrado' || !proyecto || !kpis || !series) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-zinc-900 text-zinc-300">
        <p className="text-lg">No encontramos ese proyecto.</p>
        <button onClick={() => router.push('/finanzas/simular')} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400">Volver al simulador</button>
      </div>
    );
  }

  const totalCostos = (proyecto.costosDirectos?.length ?? 0) + (proyecto.costosAdministracion?.length ?? 0) + (proyecto.costosComercializacion?.length ?? 0);

  const accionDescarga = (hoja: HojaIndividual) => (
    <BotonDescargaExcel proyecto={proyecto} hoja={hoja} tono="neutral" etiqueta="Descargar tabla" />
  );

  return (
    <div ref={contenedorRef} className="fixed inset-0 z-50 flex flex-col bg-zinc-900 text-zinc-100">
      {/* Barra superior — se oculta al imprimir */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-950/80 px-6 py-3 print:hidden">
        <button onClick={salir} className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700" title="Salir (Esc)">
          <X className="h-3.5 w-3.5" /> Salir
        </button>
        <p className="text-xs text-zinc-400">
          <kbd className="rounded bg-zinc-800 px-1.5 py-0.5">←</kbd> <kbd className="rounded bg-zinc-800 px-1.5 py-0.5">→</kbd> mover ·{' '}
          <kbd className="rounded bg-zinc-800 px-1.5 py-0.5">F</kbd> pantalla completa ·{' '}
          <kbd className="rounded bg-zinc-800 px-1.5 py-0.5">P</kbd> imprimir
        </p>
        <div className="flex items-center gap-2">
          <BotonDescargaExcel proyecto={proyecto} tono="neutral" etiqueta="Excel completo" />
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700" title="Imprimir respaldo (P)">
            <Printer className="h-3.5 w-3.5" /> Imprimir
          </button>
          <button onClick={toggleFullscreen} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-amber-400" title="Pantalla completa (F)">
            {esFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />} {esFullscreen ? 'Salir' : 'Pantalla completa'}
          </button>
        </div>
      </div>

      {/* Lámina activa */}
      <div className="flex-1 overflow-hidden">
        {lamina === 0 && (
          <Lamina numero={1} total={total} titulo={proyecto.nombre || 'Análisis financiero del proyecto'} subtitulo={proyecto.descripcion || undefined}>
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="space-y-4">
                <p className="text-xl text-zinc-300">{proyecto.ubicacion || 'Bolivia'}</p>
                <p className="text-base text-zinc-400">Sector: <span className="font-semibold capitalize text-zinc-200">{proyecto.sector}</span></p>
                <p className="mt-12 text-sm uppercase tracking-[0.4em] text-amber-400">Defensa pública · Análisis financiero</p>
              </div>
            </div>
          </Lamina>
        )}

        {lamina === 1 && (
          <Lamina numero={2} total={total} titulo="La idea de negocio" subtitulo="Qué proponemos hacer y dónde">
            <div className="grid grid-cols-2 gap-8">
              <div className="rounded-2xl border border-zinc-700/60 bg-zinc-800/40 p-8">
                <p className="text-[11px] uppercase tracking-wider text-zinc-400">Descripción</p>
                <p className="mt-3 text-lg leading-relaxed text-zinc-100">{proyecto.descripcion || 'Sin descripción registrada.'}</p>
              </div>
              <div className="space-y-4">
                <MetricCard label="Sector" value={proyecto.sector || '—'} />
                <MetricCard label="Ubicación" value={proyecto.ubicacion || '—'} />
                <div className="flex flex-wrap gap-2">
                  {proyecto.modeloIngreso && <Pill color="sky">Modelo: {proyecto.modeloIngreso}</Pill>}
                  {proyecto.version && <Pill>Versión {proyecto.version}</Pill>}
                </div>
              </div>
            </div>
          </Lamina>
        )}

        {lamina === 2 && (
          <Lamina numero={3} total={total} titulo="Inversión inicial" subtitulo="Cuánto capital necesita arrancar" accion={accionDescarga('inversiones')}>
            <div className="grid grid-cols-3 gap-6">
              <MetricCard label="Inversión total" value={formatearBolivianos(kpis.inversionInicial)} semaforo="amber" />
              <MetricCard label="Capital propio" value={formatearBolivianos(kpis.capitalPropio)} sub={formatearPorcentaje(kpis.ratioPropio)} semaforo="verde" />
              <MetricCard label="Préstamo" value={formatearBolivianos(kpis.capitalPrestamo)} sub={formatearPorcentaje(1 - kpis.ratioPropio)} semaforo="rojo" />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div className="rounded-2xl border border-zinc-700/60 bg-zinc-800/40 p-6">
                <p className="text-[11px] uppercase tracking-wider text-zinc-400">Categorías</p>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  {Object.entries(proyecto.inversiones ?? {}).map(([cat, items]) => {
                    const total = (items as Array<{ costoTotal?: number }>).reduce((s, it) => s + (Number(it.costoTotal ?? 0) || 0), 0);
                    if (total === 0) return null;
                    return (
                      <li key={cat} className="flex items-center justify-between">
                        <span className="capitalize">{cat}</span>
                        <span className="font-mono tabular-nums text-zinc-100">{formatearBolivianos(total)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="rounded-2xl border border-zinc-700/60 bg-zinc-800/40 p-6">
                <p className="text-[11px] uppercase tracking-wider text-zinc-400">Estructura</p>
                <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-zinc-700">
                  <div className="h-full bg-emerald-500" style={{ width: `${kpis.ratioPropio * 100}%` }} />
                </div>
                <p className="mt-3 text-sm text-zinc-400">{Math.round(kpis.ratioPropio * 100)}% capital propio · {Math.round((1 - kpis.ratioPropio) * 100)}% deuda</p>
              </div>
            </div>
          </Lamina>
        )}

        {lamina === 3 && (
          <Lamina numero={4} total={total} titulo="Proyección de ingresos" subtitulo="Crecimiento de ventas año a año" accion={accionDescarga('demanda')}>
            {series.ingresos.length > 0 ? (
              <div className="h-[60vh]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={series.ingresos}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="anio" stroke="#a1a1aa" />
                    <YAxis stroke="#a1a1aa" tickFormatter={(v: number) => Math.round(v / 1000) + "k"} />
                    <Tooltip formatter={(v: unknown) => formatearBolivianos(Number(v) || 0)} contentStyle={{ background: '#18181b', border: '1px solid #3f3f46' }} />
                    <Bar dataKey="valor" name="Ingresos" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyData msg="Completa el Paso 5 (productos) para ver esta lámina." />
            )}
          </Lamina>
        )}

        {lamina === 4 && (
          <Lamina numero={5} total={total} titulo="Costos y gastos" subtitulo="Estructura de egresos" accion={accionDescarga('costos_directos')}>
            {series.costos.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-6">
                  <MetricCard label="Costos directos" value={String(proyecto.costosDirectos?.length ?? 0)} sub="ítems" />
                  <MetricCard label="Administración" value={String(proyecto.costosAdministracion?.length ?? 0)} sub="ítems" />
                  <MetricCard label="Comercialización" value={String(proyecto.costosComercializacion?.length ?? 0)} sub="ítems" />
                </div>
                <div className="mt-8 h-[42vh]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={series.costos}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                      <XAxis dataKey="anio" stroke="#a1a1aa" />
                      <YAxis stroke="#a1a1aa" tickFormatter={(v: number) => Math.round(v / 1000) + "k"} />
                      <Tooltip formatter={(v: unknown) => formatearBolivianos(Number(v) || 0)} contentStyle={{ background: '#18181b', border: '1px solid #3f3f46' }} />
                      <Bar dataKey="valor" name="Costos totales" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <EmptyData msg={`Sin costos cargados todavía (${totalCostos} ítems en total). Completa los Pasos 6 y 7.`} />
            )}
          </Lamina>
        )}

        {lamina === 5 && (
          <Lamina numero={6} total={total} titulo="Flujo de caja proyectado" subtitulo="Ingresos vs. costos a lo largo del horizonte" accion={accionDescarga('flujo_caja')}>
            {series.utilidad.length > 0 ? (
              <div className="h-[60vh]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series.utilidad.map((u, i) => ({ anio: u.anio, ingresos: series.ingresos[i]?.valor ?? 0, costos: series.costos[i]?.valor ?? 0, utilidad: u.valor }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="anio" stroke="#a1a1aa" />
                    <YAxis stroke="#a1a1aa" tickFormatter={(v: number) => Math.round(v / 1000) + "k"} />
                    <Tooltip formatter={(v: unknown) => formatearBolivianos(Number(v) || 0)} contentStyle={{ background: '#18181b', border: '1px solid #3f3f46' }} />
                    <Legend wrapperStyle={{ color: '#a1a1aa' }} />
                    <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="#10b981" strokeWidth={3} />
                    <Line type="monotone" dataKey="costos" name="Costos" stroke="#f43f5e" strokeWidth={3} />
                    <Line type="monotone" dataKey="utilidad" name="Utilidad" stroke="#fbbf24" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyData msg="Faltan datos para proyectar utilidad. Completa la información de productos y costos." />
            )}
          </Lamina>
        )}

        {lamina === 6 && (
          <Lamina numero={7} total={total} titulo="Carga tributaria boliviana" accion={accionDescarga('tributacion')} subtitulo={
            trib?.regimen === 'general' ? 'IVA 13% débito/crédito · IT 3% · IUE 25% (Ley 843)'
            : trib?.regimen === 'rts' ? 'Régimen Tributario Simplificado · cuota fija bimensual'
            : trib?.regimen === 'rau' ? 'Régimen Agropecuario Unificado · cuota anual por hectárea'
            : 'Proyecto sin actividad fiscal (caso académico)'
          }>
            {!trib || trib.regimen === 'sin_actividad' ? (
              <EmptyData msg="El proyecto no tiene régimen tributario asignado. Para ver la carga real, ve al Paso 1 y elige Régimen General, RTS o RAU." />
            ) : trib.regimen === 'general' ? (
              <>
                <div className="grid grid-cols-3 gap-6">
                  <MetricCard label="IVA pagado (5 años)" value={formatearBolivianos(trib.ivaTotal)} sub="13% débito − crédito + arrastre" semaforo="amber" />
                  <MetricCard label="IT pagado (5 años)" value={formatearBolivianos(trib.itTotal)} sub="3% sobre ingresos con factura" semaforo="amber" />
                  <MetricCard label="Compras con factura" value={formatearBolivianos(trib.comprasConFacturaTotal)} sub="base del crédito fiscal" semaforo="verde" />
                </div>
                {trib.cargaPorAnio.length > 0 && (
                  <div className="mt-8 h-[42vh]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trib.cargaPorAnio.map((c, i) => ({ anio: c.anio, IVA: trib.serieIVA[i]?.valor ?? 0, IT: trib.serieIT[i]?.valor ?? 0 }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                        <XAxis dataKey="anio" stroke="#a1a1aa" />
                        <YAxis stroke="#a1a1aa" tickFormatter={(v: number) => Math.round(v / 1000) + "k"} />
                        <Tooltip formatter={(v: unknown) => formatearBolivianos(Number(v) || 0)} contentStyle={{ background: '#18181b', border: '1px solid #3f3f46' }} />
                        <Legend wrapperStyle={{ color: '#a1a1aa' }} />
                        <Bar dataKey="IVA" name="IVA a pagar" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="IT" name="IT" stackId="a" fill="#ef4444" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <MetricCard label={trib.regimen === 'rts' ? 'Cuota RTS (5 años)' : 'Cuota RAU (5 años)'} value={formatearBolivianos(trib.cuotaFijaTotal)} sub={trib.regimen === 'rts' ? 'pagos bimensuales acumulados' : 'cuota anual por hectárea'} semaforo="amber" />
                  <MetricCard label="Ingresos totales" value={formatearBolivianos(trib.ingresosConFacturaTotal || 0)} sub="referencia (no genera IVA en este régimen)" />
                </div>
                <p className="mt-6 max-w-3xl text-base leading-relaxed text-zinc-300">
                  En este régimen el alumno paga una <strong className="text-amber-300">cuota fija</strong> en lugar de IVA, IT e IUE.
                  Es el régimen pensado para comercios y productores pequeños en Bolivia.
                </p>
              </>
            )}
          </Lamina>
        )}

        {lamina === 7 && (
          <Lamina numero={8} total={total} titulo="Indicadores financieros" subtitulo="VAN, TIR, Payback, IR y B/C" accion={accionDescarga('indicadores')}>
            <div className="grid grid-cols-3 gap-6">
              <MetricCard label="VAN" value={formatearBolivianos(kpis.van)} sub={`a ${formatearPorcentaje(kpis.tasaDescuento)} de descuento`} semaforo={kpis.van > 0 ? 'verde' : 'rojo'} />
              <MetricCard label="TIR" value={kpis.tir !== null ? formatearPorcentaje(kpis.tir) : '—'} sub={kpis.tir !== null ? (kpis.tir > kpis.tasaDescuento ? '✓ supera el costo del capital' : '✗ por debajo del costo del capital') : 'No se pudo calcular'} semaforo={kpis.tir !== null && kpis.tir > kpis.tasaDescuento ? 'verde' : 'rojo'} />
              <MetricCard label="Payback" value={`${kpis.payback.toFixed(1)} años`} sub="recuperación de la inversión" semaforo={kpis.payback > 0 && kpis.payback < 5 ? 'verde' : 'amber'} />
              <MetricCard label="Índice de Rentabilidad" value={kpis.ir.toFixed(2)} sub="IR > 1 = viable" semaforo={kpis.ir > 1 ? 'verde' : 'rojo'} />
              <MetricCard label="Relación B/C" value={kpis.rbc.toFixed(2)} sub="beneficio por cada Bs invertido" semaforo={kpis.rbc > 1 ? 'verde' : 'rojo'} />
              <MetricCard label="Tasa de descuento" value={formatearPorcentaje(kpis.tasaDescuento)} sub="costo de oportunidad" />
            </div>
          </Lamina>
        )}

        {lamina === 8 && (
          <Lamina numero={9} total={total} titulo="Recuperación de la inversión" subtitulo="Flujo acumulado a lo largo del horizonte" accion={accionDescarga('flujo_caja')}>
            {series.flujoAcumulado.length > 0 ? (
              <div className="h-[60vh]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series.flujoAcumulado.map((f) => ({ anio: f.anio, acumulado: f.valor }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="anio" stroke="#a1a1aa" />
                    <YAxis stroke="#a1a1aa" tickFormatter={(v: number) => Math.round(v / 1000) + "k"} />
                    <Tooltip formatter={(v: unknown) => formatearBolivianos(Number(v) || 0)} contentStyle={{ background: '#18181b', border: '1px solid #3f3f46' }} />
                    <Line type="monotone" dataKey="acumulado" name="Flujo acumulado" stroke="#38bdf8" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyData msg="No hay flujo proyectado." />
            )}
          </Lamina>
        )}

        {lamina === 9 && (
          <Lamina numero={10} total={total} titulo="Punto de equilibrio" subtitulo="Mínimo de unidades para cubrir costos fijos" accion={accionDescarga('equilibrio')}>
            {peq ? (
              <div className="grid grid-cols-2 gap-8">
                <MetricCard label="Unidades de equilibrio" value={Math.round(peq.unidades).toLocaleString('es-BO')} sub="unidades anuales" semaforo="amber" />
                <MetricCard label="Ingreso de equilibrio" value={formatearBolivianos(peq.ingresoEquilibrio)} sub="ventas anuales mínimas" semaforo="amber" />
              </div>
            ) : (
              <EmptyData msg="Sin datos suficientes para calcular el punto de equilibrio (necesitas un producto con precio y costo variable)." />
            )}
          </Lamina>
        )}

        {lamina === 10 && (
          <Lamina numero={11} total={total} titulo={kpis.veredictoViable ? '✓ Proyecto viable' : '⚠ Revisar viabilidad'} subtitulo={kpis.veredictoViable ? 'Los indicadores respaldan la decisión de invertir.' : 'Los indicadores recomiendan ajustar el modelo antes de invertir.'}>
            <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
              <p className="text-7xl">{kpis.veredictoViable ? '🚀' : '⚠️'}</p>
              <p className="max-w-2xl text-xl leading-relaxed text-zinc-300">
                {kpis.veredictoViable
                  ? <>Con un VAN de <strong className="text-emerald-400">{formatearBolivianos(kpis.van)}</strong> y una TIR de <strong className="text-emerald-400">{kpis.tir !== null ? formatearPorcentaje(kpis.tir) : '—'}</strong> (superior al costo del capital <strong>{formatearPorcentaje(kpis.tasaDescuento)}</strong>), el proyecto genera valor económico. La inversión se recupera en aproximadamente <strong>{kpis.payback.toFixed(1)} años</strong>.</>
                  : <>El VAN es <strong className="text-rose-400">{formatearBolivianos(kpis.van)}</strong> y la TIR estimada es <strong className="text-rose-400">{kpis.tir !== null ? formatearPorcentaje(kpis.tir) : '—'}</strong>. Antes de avanzar, conviene revisar precios, costos o nivel de inversión.</>
                }
              </p>
              <p className="mt-4 text-sm uppercase tracking-[0.4em] text-amber-400">Gracias por la atención</p>
            </div>
          </Lamina>
        )}
      </div>

      {/* Navegación inferior */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-zinc-800 bg-zinc-950/80 px-6 py-3 print:hidden">
        <button onClick={irAnterior} disabled={lamina === 0} className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-700 disabled:opacity-30">
          <ArrowLeft className="h-4 w-4" /> Anterior
        </button>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }, (_, i) => (
            <button key={i} onClick={() => setLamina(i)} className={`h-2 w-8 rounded-full transition ${i === lamina ? 'bg-amber-500' : 'bg-zinc-700 hover:bg-zinc-600'}`} aria-label={`Ir a la lámina ${i + 1}`} />
          ))}
        </div>
        <button onClick={irSiguiente} disabled={lamina === total - 1} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-30">
          Siguiente <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Print styles globales — una lámina por página */}
      <style jsx global>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          html, body { background: white !important; }
          .lamina { background: white !important; color: black !important; min-height: 100vh; page-break-after: always; }
          .lamina header { border-color: #d4d4d8 !important; }
          .lamina header p { color: #b45309 !important; }
          .lamina header h2, .lamina header h2 * { color: black !important; }
        }
      `}</style>
    </div>
  );
}
