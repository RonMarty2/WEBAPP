'use client';

/**
 * Landing del módulo Organización — Sprint 1.
 *
 * Stub mínimo que redirige a la galería de casos. El módulo Organización
 * todavía no tiene plataforma completa; solo casos pre-resueltos.
 */

import Link from 'next/link';
import { ArrowRight, Sparkles, GraduationCap } from 'lucide-react';

export default function OrganizacionHub() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Organización & RRHH</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Estructura tu empresa
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Organigrama, planilla, estructura legal, plan técnico y branding interno
          de 5 emprendimientos bolivianos completamente resueltos. Mira cómo se
          arma una empresa real antes de armar la tuya.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-1">
        <Link
          href="/ecosistema/universidad/organizacion/casos"
          className="group flex items-center gap-4 rounded-2xl border-2 border-amber-200 bg-amber-50/40 p-6 transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md"
        >
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-slate-900">Casos de Bolivia</h3>
            <p className="mt-1 text-sm text-slate-600">
              5 estructuras organizacionales completas con planilla real boliviana,
              trámites FUNDEMPRESA, AFP, SENASAG y más.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-amber-700 transition group-hover:translate-x-1" />
        </Link>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          <GraduationCap className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-2 font-medium text-slate-700">Plataforma completa próximamente</p>
          <p className="mt-1 text-xs">Clases y herramientas interactivas vienen en la próxima iteración.</p>
        </div>
      </div>
    </div>
  );
}
