'use client';

/**
 * CalcROASEmbudo
 *
 * Calculadora reactiva del embudo de marketing digital:
 *   Inversión → Clicks → Leads → Ventas → Ingresos
 *
 * Cero IA: matemática pura con useMemo. Muestra ROAS, CPL, CAC y un
 * embudo visual con barras horizontales.
 */

import { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MousePointerClick,
  Users,
  ShoppingCart,
  Wallet,
  Sparkles,
} from 'lucide-react';

interface Props {
  defaultInversion?: number;
}

export default function CalcROASEmbudo({ defaultInversion = 4000 }: Props) {
  const [inversion, setInversion] = useState<number>(defaultInversion);
  const [cpc, setCpc] = useState<number>(2);
  const [tasaClickLead, setTasaClickLead] = useState<number>(5); // %
  const [tasaLeadVenta, setTasaLeadVenta] = useState<number>(8); // %
  const [ticket, setTicket] = useState<number>(350);

  const calc = useMemo(() => {
    const clicks = cpc > 0 ? inversion / cpc : 0;
    const leads = clicks * (tasaClickLead / 100);
    const ventas = leads * (tasaLeadVenta / 100);
    const ingresos = ventas * ticket;
    const roas = inversion > 0 ? ingresos / inversion : 0;
    const cpl = leads > 0 ? inversion / leads : 0;
    const cac = ventas > 0 ? inversion / ventas : 0;
    return {
      clicks,
      leads,
      ventas,
      ingresos,
      roas,
      cpl,
      cac,
      utilidad: ingresos - inversion,
    };
  }, [inversion, cpc, tasaClickLead, tasaLeadVenta, ticket]);

  const diagnostico = useMemo(() => {
    if (calc.roas < 1) {
      return {
        tono: 'rose',
        titulo: 'Estás perdiendo dinero',
        mensaje:
          'El ROAS es menor a 1: cada Bs invertido devuelve menos de Bs 1. Ajusta CPC o mejora conversiones antes de escalar.',
        icon: TrendingDown,
      };
    }
    if (calc.roas < 1.5) {
      return {
        tono: 'rose',
        titulo: 'Punto crítico',
        mensaje:
          'ROAS muy bajo. Apenas cubres el gasto publicitario sin contar costos del producto. Optimiza embudo antes de invertir más.',
        icon: AlertTriangle,
      };
    }
    if (calc.roas < 3) {
      return {
        tono: 'amber',
        titulo: 'Zona de validación',
        mensaje:
          'El embudo funciona pero el margen es ajustado. Mejora una palanca a la vez: CTR, conversión a lead o cierre de venta.',
        icon: AlertTriangle,
      };
    }
    if (calc.roas < 4) {
      return {
        tono: 'emerald',
        titulo: 'Embudo saludable',
        mensaje:
          'Buen retorno. Mantén el ritmo y prueba pequeños incrementos de presupuesto vigilando que el ROAS no caiga.',
        icon: TrendingUp,
      };
    }
    return {
      tono: 'emerald',
      titulo: 'Lista para escalar',
      mensaje:
        'ROAS sobresaliente. Puedes escalar inversión y duplicar canales similares. Monitorea CPC al subir presupuesto.',
      icon: Sparkles,
    };
  }, [calc.roas]);

  const colorTono: Record<string, { bg: string; border: string; text: string; numero: string }> = {
    rose: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-900',
      numero: 'text-rose-700',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      numero: 'text-amber-700',
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      numero: 'text-emerald-700',
    },
  };

  const IconoDiag = diagnostico.icon;

  // Embudo visual: anchos relativos respecto al primer nivel (clicks).
  const maxAncho = Math.max(calc.clicks, 1);
  const niveles = [
    {
      etiqueta: 'Clicks',
      valor: calc.clicks,
      sufijo: '',
      icon: MousePointerClick,
      color: 'bg-rose-500',
      pct: 100,
    },
    {
      etiqueta: 'Leads',
      valor: calc.leads,
      sufijo: '',
      icon: Users,
      color: 'bg-rose-400',
      pct: (calc.leads / maxAncho) * 100,
    },
    {
      etiqueta: 'Ventas',
      valor: calc.ventas,
      sufijo: '',
      icon: ShoppingCart,
      color: 'bg-rose-300',
      pct: (calc.ventas / maxAncho) * 100,
    },
    {
      etiqueta: 'Ingresos',
      valor: calc.ingresos,
      sufijo: ' Bs',
      icon: Wallet,
      color: 'bg-amber-400',
      pct: Math.min(100, (calc.ingresos / Math.max(inversion * 5, 1)) * 100),
    },
  ];

  const formatNum = (n: number, decimales = 0) =>
    n.toLocaleString('es-BO', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-rose-600" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-rose-700">
                Configura tu campaña
              </h3>
            </div>

            <SliderField
              label="Inversión mensual"
              sufijo="Bs"
              value={inversion}
              onChange={setInversion}
              min={500}
              max={20000}
              step={100}
              destacado={`Bs ${formatNum(inversion)}`}
              accent="accent-rose-600"
            />

            <SliderField
              label="CPC promedio"
              sufijo="Bs"
              value={cpc}
              onChange={setCpc}
              min={0.5}
              max={8}
              step={0.1}
              destacado={`Bs ${cpc.toFixed(2)}`}
              accent="accent-rose-600"
              hint="Costo por click en tu plataforma"
            />

            <SliderField
              label="Click → Lead"
              sufijo="%"
              value={tasaClickLead}
              onChange={setTasaClickLead}
              min={1}
              max={15}
              step={0.5}
              destacado={`${tasaClickLead}%`}
              accent="accent-rose-600"
              hint="Cuántos clicks dejan sus datos"
            />

            <SliderField
              label="Lead → Venta"
              sufijo="%"
              value={tasaLeadVenta}
              onChange={setTasaLeadVenta}
              min={1}
              max={30}
              step={0.5}
              destacado={`${tasaLeadVenta}%`}
              accent="accent-rose-600"
              hint="Tasa de cierre comercial"
            />

            <SliderField
              label="Ticket promedio"
              sufijo="Bs"
              value={ticket}
              onChange={setTicket}
              min={50}
              max={5000}
              step={10}
              destacado={`Bs ${formatNum(ticket)}`}
              accent="accent-rose-600"
              hint="Cuánto compra cada cliente"
              last
            />
          </div>
        </div>

        {/* Embudo + ROAS */}
        <div className="space-y-4 lg:col-span-3">
          {/* ROAS principal */}
          <div
            className={`rounded-3xl border-2 p-6 ${colorTono[diagnostico.tono].bg} ${colorTono[diagnostico.tono].border} ${colorTono[diagnostico.tono].text}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                  ROAS · Retorno sobre inversión publicitaria
                </p>
                <p
                  className={`mt-1 text-6xl font-extrabold tabular-nums ${colorTono[diagnostico.tono].numero}`}
                >
                  {calc.roas.toFixed(2)}x
                </p>
                <p className="mt-1 text-sm opacity-90">
                  Por cada Bs invertido recuperas Bs {calc.roas.toFixed(2)}
                </p>
              </div>
              <IconoDiag className={`h-10 w-10 ${colorTono[diagnostico.tono].numero}`} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-current/20 pt-4 text-sm">
              <div>
                <p className="text-xs opacity-70">CPL</p>
                <p className="font-semibold tabular-nums">Bs {formatNum(calc.cpl, 2)}</p>
              </div>
              <div>
                <p className="text-xs opacity-70">CAC</p>
                <p className="font-semibold tabular-nums">Bs {formatNum(calc.cac, 2)}</p>
              </div>
              <div>
                <p className="text-xs opacity-70">Utilidad bruta</p>
                <p className="font-semibold tabular-nums">
                  Bs {formatNum(calc.utilidad, 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Embudo visual */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Embudo en vivo
            </p>
            <div className="space-y-3">
              {niveles.map((n) => {
                const Icono = n.icon;
                return (
                  <div key={n.etiqueta}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-700">
                        <Icono className="h-4 w-4 text-rose-500" />
                        {n.etiqueta}
                      </span>
                      <span className="font-semibold tabular-nums text-slate-900">
                        {formatNum(n.valor)}
                        {n.sufijo}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${n.color} transition-all duration-300`}
                        style={{ width: `${Math.max(2, n.pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Diagnóstico */}
          <div
            className={`rounded-2xl border p-5 ${colorTono[diagnostico.tono].bg} ${colorTono[diagnostico.tono].border} ${colorTono[diagnostico.tono].text}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
              Diagnóstico
            </p>
            <p className="mt-1 text-lg font-bold">{diagnostico.titulo}</p>
            <p className="mt-1 text-sm opacity-90">{diagnostico.mensaje}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Subcomponente Slider ---------- */

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  destacado,
  hint,
  accent,
  last,
}: {
  label: string;
  sufijo: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  destacado: string;
  hint?: string;
  accent: string;
  last?: boolean;
}) {
  return (
    <div className={last ? '' : 'mb-5'}>
      <label className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-base font-semibold text-rose-700">{destacado}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full ${accent}`}
      />
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
