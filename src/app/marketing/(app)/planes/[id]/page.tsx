'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, UserRound, Blend, Wallet, CalendarDays, FileText, Lock, Palette } from 'lucide-react';
import type { PlanMarketing } from '@/types/marketing';

/**
 * Herramientas del plan de marketing, en orden lógico.
 * `disponible` marca cuáles ya están construidas (se irán habilitando por fase).
 */
const HERRAMIENTAS = [
  { ruta: 'buyer-persona', label: 'Buyer persona', desc: 'Define a tu cliente ideal', icon: UserRound, disponible: true },
  { ruta: 'mezcla', label: 'Mezcla 4Ps / 7Ps', desc: 'Producto, precio, plaza, promoción…', icon: Blend, disponible: true },
  { ruta: 'identidad', label: 'Identidad Visual', desc: 'Logo, paleta, tipografía y mockups con IA', icon: Palette, disponible: true },
  { ruta: 'presupuesto', label: 'Presupuesto y CPL', desc: 'Inversión y costo por lead por canal', icon: Wallet, disponible: true },
  { ruta: 'calendario', label: 'Calendario editorial', desc: 'Plan de contenidos por fecha y canal', icon: CalendarDays, disponible: true },
  { ruta: 'reporte', label: 'Reporte', desc: 'Documento consolidado + artefacto', icon: FileText, disponible: true },
];

export default function PlanDetalle() {
  const params = useParams<{ id: string }>();
  const [plan, setPlan] = useState<PlanMarketing | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');

  useEffect(() => {
    fetch(`/api/marketing/planes/${params.id}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setPlan(d.plan); setEstado('ok'); })
      .catch(() => setEstado('error'));
  }, [params.id]);

  if (estado === 'cargando') return <div className="mkt-muted py-10 text-center text-sm">Cargando plan…</div>;
  if (estado === 'error' || !plan) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mkt-card p-6 text-center">
          <p className="font-semibold">No encontramos este plan</p>
          <Link href="/marketing/planes" className="mkt-accent-text mt-2 inline-block text-sm">← Mis planes</Link>
        </div>
      </div>
    );
  }

  // ¿Qué herramientas ya tienen contenido? (para marcar "hecho")
  const tieneContenido = (ruta: string): boolean => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = plan as any;
    const key = ruta === 'buyer-persona' ? 'buyer_persona' : ruta;
    return p[key] && Object.keys(p[key]).length > 0;
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/marketing/planes" className="mkt-muted inline-flex items-center gap-1 text-sm hover:text-rose-700">
        <ArrowLeft className="h-4 w-4" /> Mis planes
      </Link>

      <header className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight">{plan.titulo}</h1>
        {(plan.marca || plan.sector) && (
          <p className="mkt-muted mt-1 text-sm">{[plan.marca, plan.sector].filter(Boolean).join(' · ')}</p>
        )}
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {HERRAMIENTAS.map((h) => {
          const Icon = h.icon;
          const hecho = h.disponible && tieneContenido(h.ruta);
          const contenido = (
            <div className={`mkt-card flex h-full items-center gap-3 p-4 ${h.disponible ? '' : 'opacity-55'}`}>
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${hecho ? 'bg-emerald-500 text-white' : 'mkt-accent-soft mkt-accent-text'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{h.label}</p>
                <p className="mkt-muted text-xs">{h.desc}</p>
              </div>
              {h.disponible ? (
                <span className="mkt-accent-text flex-shrink-0 text-xs font-medium">{hecho ? 'Editar' : 'Abrir'} →</span>
              ) : (
                <span className="mkt-muted flex flex-shrink-0 items-center gap-1 text-[11px]"><Lock className="h-3 w-3" /> Pronto</span>
              )}
            </div>
          );
          return h.disponible ? (
            <Link key={h.ruta} href={`/marketing/planes/${plan.id}/${h.ruta}`}>{contenido}</Link>
          ) : (
            <div key={h.ruta}>{contenido}</div>
          );
        })}
      </div>
    </div>
  );
}
