'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, GitBranch, Plus, X, Check } from 'lucide-react';
import type { Organigrama, NodoOrganigrama } from '@/types/organizacion';

const VACIO: Organigrama = { nodos: [] };

function nuevoId() {
  return `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

const PLANTILLA = (): NodoOrganigrama[] => {
  const g = nuevoId(), op = nuevoId(), ad = nuevoId(), cm = nuevoId();
  return [
    { id: g, cargo: 'Gerente General', area: 'Dirección', reportaA: '' },
    { id: op, cargo: 'Jefe de Operaciones', area: 'Operaciones', reportaA: g },
    { id: ad, cargo: 'Administrador/Contador', area: 'Administración', reportaA: g },
    { id: cm, cargo: 'Encargado Comercial', area: 'Comercial', reportaA: g },
    { id: nuevoId(), cargo: 'Personal de planta', area: 'Operaciones', reportaA: op },
    { id: nuevoId(), cargo: 'Vendedor/a', area: 'Comercial', reportaA: cm },
  ];
};

export default function HerramientaOrganigrama() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [org, setOrg] = useState<Organigrama>(VACIO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState('');

  useEffect(() => {
    fetch(`/api/organizacion/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (d.proyecto?.organigrama?.nodos) setOrg({ nodos: d.proyecto.organigrama.nodos }); })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const add = () => setOrg((o) => ({ nodos: [...o.nodos, { id: nuevoId(), cargo: 'Nuevo cargo', area: '', reportaA: o.nodos[0]?.id ?? '' }] }));
  const upd = (id: string, c: Partial<NodoOrganigrama>) =>
    setOrg((o) => ({ nodos: o.nodos.map((n) => (n.id === id ? { ...n, ...c } : n)) }));
  const del = (id: string) =>
    setOrg((o) => ({ nodos: o.nodos.filter((n) => n.id !== id).map((n) => (n.reportaA === id ? { ...n, reportaA: '' } : n)) }));
  const cargarPlantilla = () => setOrg({ nodos: PLANTILLA() });

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false); setErrorGuardar('');
    try {
      const res = await fetch(`/api/organizacion/proyectos/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ organigrama: org, estado: 'organigrama' }),
      });
      if (res.ok) {
        setGuardado(true);
        if (volver) router.push(`/organizacion/proyectos/${params.id}`);
      } else {
        const d = await res.json().catch(() => ({}));
        setErrorGuardar(d.error || `No se pudo guardar (error ${res.status}). Intenta de nuevo.`);
      }
    } catch {
      setErrorGuardar('No se pudo guardar. Verifica tu conexión.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="org-muted py-10 text-center text-sm">Cargando…</div>;

  // Árbol derivado de reportaA (con límite de profundidad por seguridad).
  const ids = new Set(org.nodos.map((n) => n.id));
  const raices = org.nodos.filter((n) => !n.reportaA || !ids.has(n.reportaA));
  const hijos = (pid: string) => org.nodos.filter((n) => n.reportaA === pid);

  const renderNodo = (n: NodoOrganigrama, nivel: number): React.ReactNode => {
    if (nivel > 6) return null;
    return (
      <div key={n.id} style={{ marginLeft: nivel * 18 }} className="mt-1.5">
        <div className="org-card inline-flex items-center gap-2 px-3 py-1.5">
          {nivel > 0 && <span className="org-muted text-xs">└</span>}
          <span className="text-sm font-medium">{n.cargo || '—'}</span>
          {n.area && <span className="org-accent-soft org-accent-text rounded px-1.5 py-0.5 text-[10px]">{n.area}</span>}
          {n.nombre && <span className="org-muted text-xs">· {n.nombre}</span>}
        </div>
        {hijos(n.id).map((h) => renderNodo(h, nivel + 1))}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/organizacion/proyectos/${params.id}`} className="org-muted inline-flex items-center gap-1 text-sm hover:text-emerald-700">
        <ArrowLeft className="h-4 w-4" /> Volver al proyecto
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="org-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <GitBranch className="org-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="org-accent-text text-xs font-semibold uppercase tracking-wider">Estructura</p>
          <h1 className="text-2xl font-bold tracking-tight">Organigrama</h1>
        </div>
      </header>
      <p className="org-muted mt-2 text-sm">
        Define los cargos y quién reporta a quién. El árbol de abajo se arma solo
        según el campo «Reporta a».
      </p>

      {org.nodos.length === 0 && (
        <div className="org-card mt-5 p-8 text-center">
          <p className="text-3xl">🏢</p>
          <p className="mt-3 font-semibold">Aún no hay cargos</p>
          <p className="org-muted mt-1 text-sm">Empieza desde cero o usa una estructura típica de PYME boliviana.</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <button onClick={cargarPlantilla} className="org-btn-primary px-4 py-2 text-sm font-medium">Usar plantilla</button>
            <button onClick={add} className="org-btn-ghost inline-flex items-center gap-1 px-4 py-2 text-sm"><Plus className="h-4 w-4" /> Cargo vacío</button>
          </div>
        </div>
      )}

      {org.nodos.length > 0 && (
        <>
          {/* Árbol */}
          <div className="org-card mt-5 overflow-x-auto p-4">
            <p className="org-muted mb-2 text-[11px] uppercase tracking-wider">Vista del organigrama</p>
            {raices.map((r) => renderNodo(r, 0))}
          </div>

          {/* Editor */}
          <div className="org-card mt-4 p-4">
            <div className="space-y-2">
              {org.nodos.map((n) => (
                <div key={n.id} className="flex flex-wrap items-center gap-2">
                  <input value={n.cargo} onChange={(e) => upd(n.id, { cargo: e.target.value })} placeholder="Cargo"
                    className="org-border min-w-36 flex-1 rounded border px-2 py-1 text-sm" />
                  <input value={n.area} onChange={(e) => upd(n.id, { area: e.target.value })} placeholder="Área"
                    className="org-border w-28 rounded border px-2 py-1 text-sm" />
                  <label className="org-muted text-xs">Reporta a
                    <select value={n.reportaA ?? ''} onChange={(e) => upd(n.id, { reportaA: e.target.value })}
                      className="org-border ml-1 rounded border px-1.5 py-1 text-sm">
                      <option value="">— (raíz)</option>
                      {org.nodos.filter((x) => x.id !== n.id).map((x) => (
                        <option key={x.id} value={x.id}>{x.cargo || '—'}</option>
                      ))}
                    </select>
                  </label>
                  <button onClick={() => del(n.id)} className="text-slate-300 hover:text-rose-600" aria-label="Eliminar cargo"><X className="h-4 w-4" aria-hidden="true" /></button>
                </div>
              ))}
            </div>
            <button onClick={add} className="org-btn-ghost mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Agregar cargo</button>
          </div>
        </>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => guardar(false)} disabled={guardando} className="org-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50">{guardando ? 'Guardando…' : 'Guardar'}</button>
        <button onClick={() => guardar(true)} disabled={guardando} className="org-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50">Guardar y volver →</button>
        {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
        {errorGuardar && (
          <span className="text-sm text-rose-700" role="alert">{errorGuardar}</span>
        )}
      </div>
    </div>
  );
}
