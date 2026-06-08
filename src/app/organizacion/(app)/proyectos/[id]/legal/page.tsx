'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Scale, Plus, X, Check } from 'lucide-react';
import type { Legal, Tramite, EstadoTramite } from '@/types/organizacion';

const VACIO: Legal = { tramites: [] };

/** Trámites típicos para formalizar una empresa en Bolivia (costos referenciales Bs). */
const PLANTILLA: Tramite[] = [
  { nombre: 'NIT (Número de Identificación Tributaria)', entidad: 'SIN (Impuestos)', costo: 0, estado: 'pendiente' },
  { nombre: 'Matrícula de Comercio', entidad: 'Fundempresa', costo: 260, estado: 'pendiente' },
  { nombre: 'Registro patronal', entidad: 'Caja Nacional de Salud', costo: 0, estado: 'pendiente' },
  { nombre: 'Registro de empleador', entidad: 'AFP / Gestora', costo: 0, estado: 'pendiente' },
  { nombre: 'Licencia de funcionamiento', entidad: 'Gobierno Municipal', costo: 300, estado: 'pendiente' },
  { nombre: 'Registro sanitario (si aplica)', entidad: 'SENASAG / SEDES', costo: 500, estado: 'pendiente' },
  { nombre: 'Registro de marca', entidad: 'SENAPI', costo: 500, estado: 'pendiente' },
  { nombre: 'Registro de empleadores (Min. Trabajo)', entidad: 'Ministerio de Trabajo', costo: 0, estado: 'pendiente' },
];

const ESTADOS: Array<{ v: EstadoTramite; txt: string; clase: string }> = [
  { v: 'pendiente', txt: 'Pendiente', clase: 'bg-slate-100 text-slate-700' },
  { v: 'en_proceso', txt: 'En proceso', clase: 'bg-amber-100 text-amber-800' },
  { v: 'listo', txt: 'Listo', clase: 'bg-emerald-100 text-emerald-800' },
];

const formatBs = (n: number) => `Bs ${n.toLocaleString('es-BO', { maximumFractionDigits: 0 })}`;

export default function HerramientaLegal() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [legal, setLegal] = useState<Legal>(VACIO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState('');

  useEffect(() => {
    fetch(`/api/organizacion/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (d.proyecto?.legal?.tramites) setLegal({ tramites: d.proyecto.legal.tramites }); })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const add = () => setLegal((l) => ({ tramites: [...l.tramites, { nombre: 'Nuevo trámite', entidad: '', costo: 0, estado: 'pendiente' }] }));
  const upd = (i: number, c: Partial<Tramite>) => setLegal((l) => ({ tramites: l.tramites.map((t, idx) => (idx === i ? { ...t, ...c } : t)) }));
  const del = (i: number) => setLegal((l) => ({ tramites: l.tramites.filter((_, idx) => idx !== i) }));
  const cargarPlantilla = () => setLegal({ tramites: PLANTILLA.map((t) => ({ ...t })) });

  const total = legal.tramites.reduce((s, t) => s + (t.costo || 0), 0);
  const listos = legal.tramites.filter((t) => t.estado === 'listo').length;
  const pct = legal.tramites.length ? Math.round((listos / legal.tramites.length) * 100) : 0;

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const res = await fetch(`/api/organizacion/proyectos/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ legal, estado: 'legal' }),
      });
      if (res.ok) { setGuardado(true); if (volver) router.push(`/organizacion/proyectos/${params.id}`); }
    } finally { setGuardando(false); }
  };

  if (cargando) return <div className="org-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/organizacion/proyectos/${params.id}`} className="org-muted inline-flex items-center gap-1 text-sm hover:text-emerald-700">
        <ArrowLeft className="h-4 w-4" /> Volver al proyecto
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="org-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Scale className="org-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="org-accent-text text-xs font-semibold uppercase tracking-wider">Formalización</p>
          <h1 className="text-2xl font-bold tracking-tight">Legalización</h1>
        </div>
      </header>
      <p className="org-muted mt-2 text-sm">
        Checklist de trámites para formalizar tu empresa en Bolivia. Marca el
        avance y estima el costo total de constitución.
      </p>

      {legal.tramites.length > 0 && (
        <div className="org-card mt-5 flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Avance: {listos}/{legal.tramites.length} listos</span>
              <span className="org-accent-text font-bold">{pct}%</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
              <div className="org-accent-bg h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="text-right">
            <p className="org-muted text-[11px] uppercase tracking-wider">Costo total estimado</p>
            <p className="org-accent-text text-xl font-bold">{formatBs(total)}</p>
          </div>
        </div>
      )}

      {legal.tramites.length === 0 && (
        <div className="org-card mt-5 p-8 text-center">
          <p className="text-3xl">📋</p>
          <p className="mt-3 font-semibold">Aún no hay trámites</p>
          <p className="org-muted mt-1 text-sm">Usa la plantilla con los trámites típicos bolivianos.</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <button onClick={cargarPlantilla} className="org-btn-primary px-4 py-2 text-sm font-medium">Usar plantilla boliviana</button>
            <button onClick={add} className="org-btn-ghost inline-flex items-center gap-1 px-4 py-2 text-sm"><Plus className="h-4 w-4" /> Trámite vacío</button>
          </div>
        </div>
      )}

      {legal.tramites.length > 0 && (
        <div className="org-card mt-4 p-4">
          <div className="space-y-2">
            {legal.tramites.map((t, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 border-b border-emerald-50 pb-2 last:border-0">
                <input value={t.nombre} onChange={(e) => upd(i, { nombre: e.target.value })} placeholder="Trámite"
                  className="org-border min-w-44 flex-1 rounded border px-2 py-1 text-sm" />
                <input value={t.entidad} onChange={(e) => upd(i, { entidad: e.target.value })} placeholder="Entidad"
                  className="org-border w-36 rounded border px-2 py-1 text-sm" />
                <span className="flex items-center gap-1">
                  <span className="org-muted text-xs">Bs</span>
                  <input type="number" min={0} step={10} value={t.costo} onChange={(e) => upd(i, { costo: parseFloat(e.target.value) || 0 })}
                    className="org-border w-20 rounded border px-1.5 py-1 text-sm" />
                </span>
                <select value={t.estado} onChange={(e) => upd(i, { estado: e.target.value as EstadoTramite })}
                  className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${ESTADOS.find((s) => s.v === t.estado)?.clase}`}>
                  {ESTADOS.map((s) => <option key={s.v} value={s.v}>{s.txt}</option>)}
                </select>
                <button onClick={() => del(i)} className="text-slate-300 hover:text-rose-600" aria-label="Eliminar trámite"><X className="h-4 w-4" aria-hidden="true" /></button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={add} className="org-btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Agregar trámite</button>
            <button onClick={cargarPlantilla} className="org-btn-ghost px-3 py-1.5 text-xs">Reemplazar con plantilla</button>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => guardar(false)} disabled={guardando} className="org-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50">{guardando ? 'Guardando…' : 'Guardar'}</button>
        <button onClick={() => guardar(true)} disabled={guardando} className="org-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50">Guardar y volver →</button>
        {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
      </div>
    </div>
  );
}
