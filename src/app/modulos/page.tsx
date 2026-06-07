'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles, Lightbulb, BarChart3, Target, Megaphone, Building2, TrendingUp, MessagesSquare, ArrowRight } from 'lucide-react';

/**
 * Hub de módulos educativos (camino formativo).
 *
 * Muestra los 7 módulos del laboratorio + el Generador Conectado destacado
 * arriba. Es la "puerta" del Producto B (aprender + construir con datos reales).
 *
 * El usuario llega aquí desde el bloque "Tu camino" del dashboard. Cada card
 * usa el color de identidad del módulo (los 7 colores definidos en sesiones
 * anteriores) para que el ecosistema sea visible de un vistazo.
 */

interface ModuloCard {
  href: string;
  nombre: string;
  tagline: string;
  descripcion: string;
  Icon: typeof Lightbulb;
  /** Token Tailwind para el acento del módulo. */
  acento: string;
  /** Tinte de fondo suave para la card. */
  acentoSoft: string;
  textoAcento: string;
}

const MODULOS: ModuloCard[] = [
  {
    href: '/idea',
    nombre: 'Idea & Pre-validación',
    tagline: 'Antes de construir, valida',
    descripcion: 'Lean Canvas, propuesta de valor, hipótesis y scorecard de viabilidad.',
    Icon: Lightbulb,
    acento: 'border-amber-200',
    acentoSoft: 'bg-amber-50',
    textoAcento: 'text-amber-700',
  },
  {
    href: '/mercados',
    nombre: 'Mercados',
    tagline: 'Datos reales, decisiones reales',
    descripcion: 'Diseño de estudios, muestreo, encuestas online por QR, análisis y reporte.',
    Icon: BarChart3,
    acento: 'border-sky-200',
    acentoSoft: 'bg-sky-50',
    textoAcento: 'text-sky-700',
  },
  {
    href: '/estrategia',
    nombre: 'Estrategia',
    tagline: 'Del análisis a la acción',
    descripcion: 'PESTEL, Porter, MEFE/MEFI/MIE, FODA, BCG, Ansoff, PEYEA, MCPE.',
    Icon: Target,
    acento: 'border-violet-200',
    acentoSoft: 'bg-violet-50',
    textoAcento: 'text-violet-700',
  },
  {
    href: '/marketing',
    nombre: 'Marketing',
    tagline: 'Plan con números reales',
    descripcion: 'Buyer persona, mezcla 4Ps/7Ps, presupuesto y CPL por canal, calendario.',
    Icon: Megaphone,
    acento: 'border-rose-200',
    acentoSoft: 'bg-rose-50',
    textoAcento: 'text-rose-700',
  },
  {
    href: '/organizacion',
    nombre: 'Organización',
    tagline: 'La empresa que sí opera',
    descripcion: 'Organigrama, RRHH con aportes patronales bolivianos, legal, técnico, branding.',
    Icon: Building2,
    acento: 'border-emerald-200',
    acentoSoft: 'bg-emerald-50',
    textoAcento: 'text-emerald-700',
  },
  {
    href: '/finanzas',
    nombre: 'Finanzas',
    tagline: 'Lee un proyecto antes de invertir',
    descripcion: 'VAN, TIR, B/C, sensibilidad y flujo de caja con simulación turno a turno.',
    Icon: TrendingUp,
    acento: 'border-slate-300',
    acentoSoft: 'bg-slate-50',
    textoAcento: 'text-slate-800',
  },
  {
    href: '/defensa',
    nombre: 'Defensa',
    tagline: 'Llega seguro al tribunal',
    descripcion: 'Banco de preguntas por categoría + simulacro evaluado por IA.',
    Icon: MessagesSquare,
    acento: 'border-indigo-200',
    acentoSoft: 'bg-indigo-50',
    textoAcento: 'text-indigo-700',
  },
];

export default function HubModulos() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>

        <header className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Camino formativo</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Aprende y construye tu proyecto con tus datos reales
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            Cada módulo es un mini-curso (clases + herramienta + reporte). Al final,
            el <strong>Generador Conectado</strong> consolida todo en tu documento
            académico con tu trabajo real, no datos inventados.
          </p>
        </header>

        {/* Generador Conectado destacado arriba */}
        <Link
          href="/generador"
          className="mt-8 block rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 p-6 transition hover:-translate-y-0.5 hover:shadow-md sm:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">El núcleo</p>
                <h2 className="mt-0.5 text-xl font-bold tracking-tight sm:text-2xl">Generador Conectado</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-700">
                  Define tu proyecto una vez, vincula lo que trabajaste en los módulos
                  de abajo y la IA arma tu documento con tu contexto cruzado. Export a
                  Markdown, LaTeX y ZIP listo para Overleaf.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white">
              Abrir Generador <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>

        {/* Grid de los 7 módulos */}
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Los 7 módulos del laboratorio</h2>
          <p className="mt-1 text-sm text-slate-500">Cada uno funciona por separado o conectado al Generador.</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULOS.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className={`group flex flex-col rounded-2xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md ${m.acento}`}
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${m.acentoSoft} ${m.textoAcento}`}>
                  <m.Icon className="h-5 w-5" />
                </div>
                <p className={`mt-3 text-xs font-semibold uppercase tracking-wider ${m.textoAcento}`}>{m.tagline}</p>
                <h3 className="mt-1 text-lg font-bold tracking-tight">{m.nombre}</h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-600">{m.descripcion}</p>
                <span className={`mt-3 inline-flex items-center gap-1 text-sm font-medium ${m.textoAcento}`}>
                  Abrir <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          <p>
            <strong className="text-slate-900">¿Apurado?</strong> Si necesitas un documento ya, vuelve al{' '}
            <Link href="/dashboard" className="text-teal-700 underline hover:text-teal-900">camino rápido (Generador Autónomo)</Link>{' '}
            donde la IA genera todo desde tu tema sin pasar por los módulos.
          </p>
        </div>
      </div>
    </div>
  );
}
