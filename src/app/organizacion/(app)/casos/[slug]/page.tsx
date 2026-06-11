'use client';

/**
 * Detalle de un caso de Organización.
 * Tabs: 1.Organigrama, 2.RRHH, 3.Legal, 4.Técnico, 5.Branding.
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { buscarCasoOrganizacion } from '@/lib/casos/organizacion';
import type { CasoOrganizacion, DificultadCaso, NodoOrganigrama, PuestoRRHH } from '@/lib/casos/types';

const DIFICULTAD_META: Record<DificultadCaso, { label: string; cls: string }> = {
  basico:     { label: 'Básico',     cls: 'bg-emerald-100 text-emerald-800' },
  intermedio: { label: 'Intermedio', cls: 'bg-amber-100 text-amber-800' },
  avanzado:   { label: 'Avanzado',   cls: 'bg-rose-100 text-rose-800' },
};

type TabId = 'organigrama' | 'rrhh' | 'legal' | 'tecnico' | 'branding';

export default function DetalleCasoOrganizacion() {
  const params = useParams<{ slug: string }>();
  const caso = buscarCasoOrganizacion(params.slug);
  const [tab, setTab] = useState<TabId>('organigrama');

  if (!caso) return notFound();
  const dif = DIFICULTAD_META[caso.dificultad];

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <Link href="/organizacion/casos" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        ← Volver a casos
      </Link>

      <header className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-4xl">
            {caso.emoji ?? '🧩'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${dif.cls}`}>Dificultad: {dif.label}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">{caso.rubro}</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">{caso.legal.tipo}</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">Bs {caso.planilla_total_bs.toLocaleString('es-BO')}/mes planilla</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{caso.titulo}</h1>
            <p className="mt-1 text-sm text-slate-600">{caso.tagline}</p>
            <p className="mt-3 text-xs text-slate-500">📍 {caso.zona} · 👤 {caso.emprendedor.nombre}, {caso.emprendedor.edad} años</p>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-700">Contexto</h2>
        <p className="mt-1 text-xs italic text-slate-500">{caso.emprendedor.rol}</p>
        <div className="mt-3 space-y-3">
          {caso.contexto.map((p, i) => <p key={i} className="text-sm leading-relaxed text-slate-700">{p}</p>)}
        </div>
      </section>

      <nav className="flex flex-wrap gap-1 border-b border-slate-200">
        <TabButton activo={tab==='organigrama'} onClick={() => setTab('organigrama')} icono="🌳">Organigrama</TabButton>
        <TabButton activo={tab==='rrhh'}        onClick={() => setTab('rrhh')}        icono="👥">RRHH + Planilla</TabButton>
        <TabButton activo={tab==='legal'}       onClick={() => setTab('legal')}       icono="⚖️">Legal</TabButton>
        <TabButton activo={tab==='tecnico'}     onClick={() => setTab('tecnico')}     icono="⚙️">Técnico</TabButton>
        <TabButton activo={tab==='branding'}    onClick={() => setTab('branding')}    icono="🎨">Branding</TabButton>
      </nav>

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        {tab==='organigrama' && <OrganigramaView caso={caso} />}
        {tab==='rrhh'        && <RrhhView caso={caso} />}
        {tab==='legal'       && <LegalView caso={caso} />}
        {tab==='tecnico'     && <TecnicoView caso={caso} />}
        {tab==='branding'    && <BrandingView caso={caso} />}
      </section>

      <ConclusionView caso={caso} />

      <div className="flex flex-wrap justify-between gap-3">
        <Link href="/organizacion/casos" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          ← Otros casos
        </Link>
      </div>
    </div>
  );
}

function TabButton({ activo, onClick, icono, children }: { activo: boolean; onClick: () => void; icono: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition ${
        activo ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      <span>{icono}</span>{children}
    </button>
  );
}

function OrganigramaView({ caso }: { caso: CasoOrganizacion }) {
  // Agrupa por reporta_a para mostrar jerarquía visual simple.
  const niveles = useMemo(() => {
    const root = caso.organigrama.filter((n) => !n.reporta_a);
    const porPadre: Record<string, NodoOrganigrama[]> = {};
    for (const n of caso.organigrama) {
      if (n.reporta_a) {
        if (!porPadre[n.reporta_a]) porPadre[n.reporta_a] = [];
        porPadre[n.reporta_a].push(n);
      }
    }
    return { root, porPadre };
  }, [caso.organigrama]);

  function renderNodo(nodo: NodoOrganigrama, depth: number = 0): React.ReactNode {
    const hijos = niveles.porPadre[nodo.cargo] ?? [];
    return (
      <div key={nodo.cargo} className="space-y-2" style={{ marginLeft: depth * 16 }}>
        <div className={`rounded-lg border-2 p-3 ${depth === 0 ? 'border-amber-400 bg-amber-50' : 'border-slate-300 bg-white'}`}>
          <p className="text-sm font-semibold text-slate-900">{nodo.cargo}</p>
          {nodo.ocupante && <p className="text-xs italic text-slate-500">{nodo.ocupante}</p>}
          {nodo.cantidad && nodo.cantidad > 1 && (
            <p className="text-[10px] text-slate-500">×{nodo.cantidad} personas</p>
          )}
        </div>
        {hijos.length > 0 && (
          <div className="border-l-2 border-dashed border-slate-300 pl-3">
            {hijos.map((h) => renderNodo(h, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Estructura jerárquica simplificada. {caso.organigrama.length} cargos definidos.
      </p>
      <div className="space-y-3">{niveles.root.map((n) => renderNodo(n))}</div>
    </div>
  );
}

function RrhhView({ caso }: { caso: CasoOrganizacion }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">Planilla total mensual</p>
          <span className="text-2xl font-bold text-amber-900">Bs {caso.planilla_total_bs.toLocaleString('es-BO')}</span>
        </div>
        <p className="mt-1 text-xs text-amber-800">
          Incluye salarios líquidos + aportes patronales (~16.71%) + provisión de aguinaldo (~8.33%).
        </p>
      </div>

      <div className="space-y-3">
        {caso.rrhh.map((p, i) => <PuestoCard key={i} p={p} />)}
      </div>
    </div>
  );
}

function PuestoCard({ p }: { p: PuestoRRHH }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-900">{p.cargo}</h3>
          <p className="text-[11px] text-slate-500">{p.tipo_contrato}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Salario líquido</p>
          <p className="text-lg font-bold text-emerald-900">Bs {p.salario_liquido_bs.toLocaleString('es-BO')}</p>
          <p className="text-[10px] text-slate-500">Costo total: Bs {p.costo_total_bs.toLocaleString('es-BO')}</p>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-700">Responsabilidades</p>
          <ul className="mt-1 space-y-0.5">
            {p.responsabilidades.map((r, i) => <li key={i} className="text-[11px] text-slate-700">• {r}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-700">Requisitos</p>
          <ul className="mt-1 space-y-0.5">
            {p.requisitos.map((r, i) => <li key={i} className="text-[11px] text-slate-700">• {r}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

function LegalView({ caso }: { caso: CasoOrganizacion }) {
  const l = caso.legal;
  const totalTramites = l.tramites.reduce((s, t) => s + t.costo_aprox_bs, 0);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Tipo de empresa" valor={l.tipo} color="amber" />
        <Metric label="Capital social" valor={`Bs ${l.capital_social_bs.toLocaleString('es-BO')}`} color="emerald" />
        <Metric label="Régimen" valor={l.regimen_tributario} color="sky" />
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Justificación de la elección</p>
        <p className="mt-1 text-sm text-amber-900">{l.justificacion}</p>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Trámites requeridos</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
            Total: Bs {totalTramites.toLocaleString('es-BO')}
          </span>
        </div>
        <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-3 py-2 text-left text-slate-700">Trámite</th>
                <th className="px-3 py-2 text-left text-slate-700">Institución</th>
                <th className="px-3 py-2 text-right text-slate-700">Costo</th>
                <th className="px-3 py-2 text-right text-slate-700">Plazo</th>
              </tr>
            </thead>
            <tbody>
              {l.tramites.map((t, i) => (
                <tr key={i} className="border-t border-slate-200">
                  <td className="px-3 py-2 font-medium text-slate-900">{t.nombre}</td>
                  <td className="px-3 py-2 text-slate-700">{t.institucion}</td>
                  <td className="px-3 py-2 text-right text-slate-700">Bs {t.costo_aprox_bs.toLocaleString('es-BO')}</td>
                  <td className="px-3 py-2 text-right text-slate-700">{t.plazo_dias} días</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TecnicoView({ caso }: { caso: CasoOrganizacion }) {
  const t = caso.tecnico;
  const totalEquipo = t.equipamiento.reduce((s, e) => s + e.costo_bs, 0);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
        <h3 className="text-base font-semibold text-amber-900">{t.nombre}</h3>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-amber-800">
          <span>⏱ Tiempo total: <strong>{t.tiempo_total}</strong></span>
          <span>📊 Capacidad: <strong>{t.capacidad}</strong></span>
          <span>💰 Inversión equipo: <strong>Bs {totalEquipo.toLocaleString('es-BO')}</strong></span>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Pasos del proceso</p>
        <ol className="mt-2 space-y-2">
          {t.pasos.map((p, i) => (
            <li key={i} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">{i + 1}</div>
              <p className="text-sm text-slate-700">{p}</p>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Equipamiento e inversión</p>
        <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-3 py-2 text-left text-slate-700">Ítem</th>
                <th className="px-3 py-2 text-right text-slate-700">Costo Bs</th>
              </tr>
            </thead>
            <tbody>
              {t.equipamiento.map((e, i) => (
                <tr key={i} className="border-t border-slate-200">
                  <td className="px-3 py-2 text-slate-900">{e.item}</td>
                  <td className="px-3 py-2 text-right text-slate-700">{e.costo_bs.toLocaleString('es-BO')}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-300 bg-amber-50 font-bold">
                <td className="px-3 py-2 text-amber-900">Total inversión</td>
                <td className="px-3 py-2 text-right text-amber-900">Bs {totalEquipo.toLocaleString('es-BO')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BrandingView({ caso }: { caso: CasoOrganizacion }) {
  const b = caso.branding;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border-2 border-violet-300 bg-violet-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-800">Misión</p>
          <p className="mt-1 text-sm text-violet-900">{b.mision}</p>
        </div>
        <div className="rounded-lg border-2 border-sky-300 bg-sky-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-800">Visión</p>
          <p className="mt-1 text-sm text-sky-900">{b.vision}</p>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Valores</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {b.valores.map((v, i) => (
            <span key={i} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">{v}</span>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Cultura de trabajo</p>
        <p className="mt-1 text-sm text-slate-700">{b.cultura}</p>
      </div>

      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/40 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">Identidad visual</p>
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-[10px] text-slate-600">Paleta de colores</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {b.identidad_visual.colores.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-700">
                  <span className="h-3 w-3 rounded-full border border-slate-300" style={{ background: c }} />
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-600">Tipografía</p>
            <p className="text-sm text-slate-800">{b.identidad_visual.tipografia}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-600">Tono de comunicación</p>
            <p className="text-sm italic text-slate-700">&ldquo;{b.identidad_visual.tono_comunicacion}&rdquo;</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConclusionView({ caso }: { caso: CasoOrganizacion }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-700">Conclusión</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{caso.conclusion}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">✓ Lecciones</p>
          <ul className="mt-2 space-y-1.5">
            {caso.lecciones.map((l, i) => (
              <li key={i} className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-2 text-xs text-emerald-900">{l}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">✗ Errores evitados</p>
          <ul className="mt-2 space-y-1.5">
            {caso.errores_evitados.map((e, i) => (
              <li key={i} className="rounded-lg border border-rose-200 bg-rose-50/60 p-2 text-xs text-rose-900">{e}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, valor, color }: { label: string; valor: string; color: 'amber' | 'emerald' | 'sky' }) {
  const cls = {
    amber:   'border-amber-200 bg-amber-50 text-amber-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    sky:     'border-sky-200 bg-sky-50 text-sky-900',
  }[color];
  return (
    <div className={`rounded-lg border p-3 text-center ${cls}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-75">{label}</p>
      <p className="mt-1 text-base font-bold">{valor}</p>
    </div>
  );
}
