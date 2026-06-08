'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Copy, Printer, Check } from 'lucide-react';
import type { ProyectoOrganizacion, NodoOrganigrama } from '@/types/organizacion';
import { useMaestroActivo } from '@/lib/maestro/useMaestroActivo';
import { ProgresoFlujo } from '@/components/compartido/ProgresoFlujo';
import { SiguienteModulo } from '@/components/compartido/SiguienteModulo';

const formatBs = (n: number) => `Bs ${n.toLocaleString('es-BO', { maximumFractionDigits: 0 })}`;

const ESTADO_TRAMITE: Record<string, string> = {
  pendiente: 'Pendiente', en_proceso: 'En proceso', listo: 'Listo',
};

export default function ReporteOrganizacion() {
  const params = useParams<{ id: string }>();
  const maestro = useMaestroActivo();
  const [p, setP] = useState<ProyectoOrganizacion | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    fetch(`/api/organizacion/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setP(d.proyecto); setEstado('ok'); })
      .catch(() => setEstado('error'));
  }, [params.id]);

  if (estado === 'cargando') return <div className="org-muted py-10 text-center text-sm">Generando reporte…</div>;
  if (estado === 'error' || !p) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="org-card p-6 text-center">
          <p className="font-semibold">No encontramos este proyecto</p>
          <Link href="/organizacion/proyectos" className="org-accent-text mt-2 inline-block text-sm">← Mis proyectos</Link>
        </div>
      </div>
    );
  }

  const nodos = p.organigrama?.nodos ?? [];
  const rrhh = p.rrhh;
  const puestos = rrhh?.puestos ?? [];
  const a = rrhh?.aportes;
  const pctPatronal = a ? a.cajaSalud + a.proVivienda + a.riesgoProfesional + a.aporteSolidario : 0;
  const pctProvision = a ? a.aguinaldo + a.indemnizacion : 0;
  const pctTotal = pctPatronal + pctProvision;
  const baseMensual = puestos.reduce((s, x) => s + x.salarioBruto * x.cantidad, 0);
  const costoTotal = baseMensual * (1 + pctTotal / 100);
  const tramites = p.legal?.tramites ?? [];
  const costoLegal = tramites.reduce((s, t) => s + (t.costo || 0), 0);
  const listos = tramites.filter((t) => t.estado === 'listo').length;
  const tec = p.tecnico ?? {};
  const br = p.branding ?? {};

  // Árbol del organigrama
  const ids = new Set(nodos.map((n) => n.id));
  const raices = nodos.filter((n) => !n.reportaA || !ids.has(n.reportaA));
  const hijos = (pid: string) => nodos.filter((n) => n.reportaA === pid);

  const renderNodo = (n: NodoOrganigrama, nivel: number): React.ReactNode => {
    if (nivel > 6) return null;
    return (
      <div key={n.id} style={{ marginLeft: nivel * 16 }} className="text-sm">
        <span className="org-muted">{nivel > 0 ? '└ ' : ''}</span>
        <span className="font-medium">{n.cargo}</span>
        {n.area && <span className="org-muted"> · {n.area}</span>}
        {hijos(n.id).map((h) => renderNodo(h, nivel + 1))}
      </div>
    );
  };

  const construirTexto = (): string => {
    const l: string[] = [];
    l.push(`# Estructura organizacional — ${p.titulo}`);
    if (p.empresa) l.push(`Empresa: ${p.empresa}`);
    if (p.sector) l.push(`Sector: ${p.sector}`);
    l.push('');

    if (nodos.length) {
      l.push('## Organigrama');
      const linea = (n: NodoOrganigrama, niv: number) => {
        l.push(`${'  '.repeat(niv)}- ${n.cargo}${n.area ? ` (${n.area})` : ''}${n.nombre ? ` — ${n.nombre}` : ''}`);
        hijos(n.id).forEach((h) => niv < 6 && linea(h, niv + 1));
      };
      raices.forEach((r) => linea(r, 0));
      l.push('');
    }

    if (puestos.length) {
      l.push('## Recursos Humanos');
      puestos.forEach((x) => l.push(`- ${x.cargo} ×${x.cantidad}: ${formatBs(x.salarioBruto)} c/u`));
      l.push(`Planilla bruta: ${formatBs(baseMensual)}/mes · Carga patronal+provisiones: ${pctTotal.toFixed(2)}% · Costo empresa: ${formatBs(costoTotal)}/mes`);
      l.push('');
    }

    if (tramites.length) {
      l.push('## Legalización');
      tramites.forEach((t) => l.push(`- ${t.nombre} (${t.entidad}): ${formatBs(t.costo)} — ${ESTADO_TRAMITE[t.estado] ?? t.estado}`));
      l.push(`Costo total de constitución: ${formatBs(costoLegal)} · Avance: ${listos}/${tramites.length} listos`);
      l.push('');
    }

    if (Object.values(tec).some(Boolean)) {
      l.push('## Aspectos técnicos');
      if (tec.proceso) l.push(`- Proceso: ${tec.proceso}`);
      if (tec.capacidad) l.push(`- Capacidad: ${tec.capacidad}`);
      if (tec.equipos) l.push(`- Equipos: ${tec.equipos}`);
      if (tec.layout) l.push(`- Layout: ${tec.layout}`);
      if (tec.proveedores) l.push(`- Proveedores: ${tec.proveedores}`);
      l.push('');
    }

    if (Object.values(br).some((v) => (Array.isArray(v) ? v.length : v))) {
      l.push('## Branding');
      if (br.nombre) l.push(`- Nombre: ${br.nombre}`);
      if (br.esencia) l.push(`- Esencia: ${br.esencia}`);
      if (br.valores?.length) l.push(`- Valores: ${br.valores.join(', ')}`);
      if (br.personalidad) l.push(`- Personalidad: ${br.personalidad}`);
      if (br.promesa) l.push(`- Promesa: ${br.promesa}`);
      if (br.paletaPrincipal) l.push(`- Paleta: ${br.paletaPrincipal}`);
      if (br.tipografia) l.push(`- Tipografía: ${br.tipografia}`);
      l.push('');
    }

    return l.join('\n');
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(construirTexto());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch { /* sin clipboard */ }
  };

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <div className="print:hidden">
        <Link href={`/organizacion/proyectos/${params.id}`} className="org-muted inline-flex items-center gap-1 text-sm hover:text-emerald-700">
          <ArrowLeft className="h-4 w-4" /> Volver al proyecto
        </Link>
      </div>

      <div className="mt-3 print:hidden">
        <ProgresoFlujo actual="organizacion" modalidad={maestro?.modalidad} tipoTrabajoLabel={maestro?.modalidad ?? undefined} />
      </div>

      <header className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="org-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
            <FileText className="org-accent-text h-5 w-5" />
          </div>
          <div>
            <p className="org-accent-text text-xs font-semibold uppercase tracking-wider">Documento consolidado</p>
            <h1 className="text-2xl font-bold tracking-tight">{p.titulo}</h1>
            {(p.empresa || p.sector) && <p className="org-muted text-sm">{[p.empresa, p.sector].filter(Boolean).join(' · ')}</p>}
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={copiar} className="org-btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium">
            {copiado ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copiado ? 'Copiado' : 'Copiar'}
          </button>
          <button onClick={() => window.print()} className="org-btn-primary inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium">
            <Printer className="h-4 w-4" /> Imprimir
          </button>
        </div>
      </header>

      {/* Indicadores */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Indicador label="Cargos" valor={nodos.length ? String(nodos.length) : '—'} sub="en organigrama" />
        <Indicador label="Costo planilla" valor={puestos.length ? formatBs(costoTotal) : '—'} sub="Bs/mes c/ aportes" />
        <Indicador label="Constitución" valor={tramites.length ? formatBs(costoLegal) : '—'} sub="Bs (una vez)" />
        <Indicador label="Trámites" valor={tramites.length ? `${listos}/${tramites.length}` : '—'} sub="listos" />
      </div>

      {nodos.length > 0 && (
        <Seccion titulo="Organigrama">
          <div className="space-y-1">{raices.map((r) => renderNodo(r, 0))}</div>
        </Seccion>
      )}

      {puestos.length > 0 && (
        <Seccion titulo="Recursos Humanos">
          <ul className="space-y-1">
            {puestos.map((x, i) => (
              <li key={i} className="flex justify-between">
                <span>{x.cargo} <span className="org-muted">×{x.cantidad}</span></span>
                <span className="org-muted">{formatBs(x.salarioBruto)} c/u</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm">
            Planilla bruta <strong>{formatBs(baseMensual)}</strong>/mes · carga {pctTotal.toFixed(2)}% →
            costo empresa <strong className="org-accent-text">{formatBs(costoTotal)}</strong>/mes.
          </p>
        </Seccion>
      )}

      {tramites.length > 0 && (
        <Seccion titulo="Legalización">
          <ul className="space-y-1">
            {tramites.map((t, i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <span><span className="font-medium">{t.nombre}</span> <span className="org-muted">· {t.entidad}</span></span>
                <span className="flex items-center gap-2">
                  <span className="org-muted">{formatBs(t.costo)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${t.estado === 'listo' ? 'bg-emerald-100 text-emerald-800' : t.estado === 'en_proceso' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                    {ESTADO_TRAMITE[t.estado] ?? t.estado}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm">Costo total de constitución: <strong className="org-accent-text">{formatBs(costoLegal)}</strong>.</p>
        </Seccion>
      )}

      {Object.values(tec).some(Boolean) && (
        <Seccion titulo="Aspectos técnicos">
          <ul className="space-y-1.5">
            {tec.proceso && <li><span className="font-medium">Proceso:</span> <span className="org-muted">{tec.proceso}</span></li>}
            {tec.capacidad && <li><span className="font-medium">Capacidad:</span> <span className="org-muted">{tec.capacidad}</span></li>}
            {tec.equipos && <li><span className="font-medium">Equipos:</span> <span className="org-muted">{tec.equipos}</span></li>}
            {tec.layout && <li><span className="font-medium">Layout:</span> <span className="org-muted">{tec.layout}</span></li>}
            {tec.proveedores && <li><span className="font-medium">Proveedores:</span> <span className="org-muted">{tec.proveedores}</span></li>}
          </ul>
        </Seccion>
      )}

      {Object.values(br).some((v) => (Array.isArray(v) ? v.length : v)) && (
        <Seccion titulo="Branding">
          {br.nombre && <p className="text-base font-semibold">{br.nombre}</p>}
          {br.esencia && <p className="org-muted mt-1">{br.esencia}</p>}
          {br.valores?.length ? <p className="mt-2"><span className="font-medium">Valores:</span> <span className="org-muted">{br.valores.join(' · ')}</span></p> : null}
          {br.personalidad && <p className="mt-1"><span className="font-medium">Personalidad:</span> <span className="org-muted">{br.personalidad}</span></p>}
          {br.promesa && <p className="mt-1"><span className="font-medium">Promesa:</span> <span className="org-muted">{br.promesa}</span></p>}
          {(br.paletaPrincipal || br.tipografia) && (
            <p className="mt-1 org-muted text-sm">{[br.paletaPrincipal && `Paleta: ${br.paletaPrincipal}`, br.tipografia && `Tipografía: ${br.tipografia}`].filter(Boolean).join(' · ')}</p>
          )}
        </Seccion>
      )}

      <div className="print:hidden">
        <SiguienteModulo actual="organizacion" modalidad={maestro?.modalidad} tituloContexto={p.titulo} />
      </div>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="org-card mt-4 p-5">
      <h2 className="org-accent-text text-sm font-bold uppercase tracking-wider">{titulo}</h2>
      <div className="mt-2 text-sm">{children}</div>
    </section>
  );
}

function Indicador({ label, valor, sub }: { label: string; valor: string; sub: string }) {
  return (
    <div className="org-card p-3 text-center">
      <p className="org-muted text-[11px] uppercase tracking-wider">{label}</p>
      <p className="org-accent-text text-xl font-bold">{valor}</p>
      <p className="org-muted text-[10px]">{sub}</p>
    </div>
  );
}
