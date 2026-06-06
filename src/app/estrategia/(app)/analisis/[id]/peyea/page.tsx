'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Compass, Check } from 'lucide-react';
import type { Peyea } from '@/types/estrategia';

const VACIO: Peyea = { ff: 4, fi: 4, ee: -3, vc: -3 };

/**
 * PEYEA / SPACE. Dos ejes internos (FF financiera +, VC ventaja competitiva -)
 * y dos externos (FI fuerza de industria +, EE estabilidad del entorno -).
 * Vector: X = FI + VC, Y = FF + EE → cuadrante → postura estratégica.
 */
const DIMENSIONES = [
  { key: 'ff', label: 'Fortaleza financiera (FF)', desc: 'Liquidez, capital, flujo de caja, rentabilidad', min: 1, max: 6, signo: '+', ayuda: '1 = muy débil · 6 = muy fuerte' },
  { key: 'fi', label: 'Fuerza de la industria (FI)', desc: 'Potencial de crecimiento, utilidades, barreras', min: 1, max: 6, signo: '+', ayuda: '1 = industria pobre · 6 = industria atractiva' },
  { key: 'ee', label: 'Estabilidad del entorno (EE)', desc: 'Inflación, tecnología, demanda, regulación', min: -6, max: -1, signo: '−', ayuda: '−6 = muy inestable · −1 = muy estable' },
  { key: 'vc', label: 'Ventaja competitiva (VC)', desc: 'Calidad, lealtad, participación, know-how', min: -6, max: -1, signo: '−', ayuda: '−6 = sin ventaja · −1 = gran ventaja' },
] as const;

function cuadrante(x: number, y: number): { nombre: string; color: string; consejo: string } {
  if (x >= 0 && y >= 0) return { nombre: 'Agresivo', color: 'text-emerald-600', consejo: 'Posición fuerte. Usa estrategias intensivas (penetración, desarrollo de producto/mercado), integración o diversificación. Aprovecha tus fortalezas.' };
  if (x < 0 && y >= 0) return { nombre: 'Conservador', color: 'text-sky-600', consejo: 'Mantente cerca de tus competencias. Penetración de mercado, desarrollo de producto y diversificación relacionada. Evita riesgos grandes.' };
  if (x < 0 && y < 0) return { nombre: 'Defensivo', color: 'text-rose-600', consejo: 'Posición débil. Atrinchérate: reducción de costos, desinversión o liquidación. Corrige debilidades internas.' };
  return { nombre: 'Competitivo', color: 'text-amber-600', consejo: 'Industria atractiva pero poca estabilidad. Integración, penetración y desarrollo de producto/mercado, alianzas para reforzar lo financiero.' };
}

export default function HerramientaPeyea() {
  const params = useParams<{ id: string }>();
  const [p, setP] = useState<Peyea>(VACIO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    fetch(`/api/estrategia/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        const pe = d.proyecto?.peyea;
        if (pe && typeof pe.ff === 'number') setP({ ...VACIO, ...pe });
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const x = p.fi + p.vc; // horizontal
  const y = p.ff + p.ee; // vertical
  const c = cuadrante(x, y);

  // Mapeo a SVG 200x200, centro 100,100, escala 14px/unidad (±6 → ±84).
  const ESC = 14;
  const px = 100 + x * ESC;
  const py = 100 - y * ESC;

  const set = (key: keyof Peyea, val: number) => setP((prev) => ({ ...prev, [key]: val }));

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const res = await fetch(`/api/estrategia/proyectos/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ peyea: p }),
      });
      if (res.ok) { setGuardado(true); if (volver) window.location.href = `/estrategia/analisis/${params.id}`; }
    } finally { setGuardando(false); }
  };

  if (cargando) return <div className="es-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/estrategia/analisis/${params.id}`} className="es-muted inline-flex items-center gap-1 text-sm hover:text-violet-700">
        <ArrowLeft className="h-4 w-4" /> Volver al análisis
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="es-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Compass className="es-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="es-accent-text text-xs font-semibold uppercase tracking-wider">Posición estratégica</p>
          <h1 className="text-2xl font-bold tracking-tight">Matriz PEYEA</h1>
        </div>
      </header>
      <p className="es-muted mt-2 text-sm">
        Puntúa cada dimensión y obtén el vector que indica tu postura estratégica:
        agresiva, conservadora, defensiva o competitiva.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {/* Sliders */}
        <div className="es-card space-y-4 p-4">
          {DIMENSIONES.map((d) => {
            const val = p[d.key];
            return (
              <div key={d.key}>
                <div className="flex items-baseline justify-between">
                  <label className="text-sm font-semibold text-slate-700">{d.label}</label>
                  <span className="es-accent-text text-sm font-bold">{d.signo}{Math.abs(val)}</span>
                </div>
                <p className="es-muted text-[11px]">{d.desc}</p>
                <input
                  type="range" min={d.min} max={d.max} step={1} value={val}
                  onChange={(e) => set(d.key, parseInt(e.target.value, 10))}
                  className="mt-1.5 w-full accent-violet-600"
                />
                <p className="es-muted text-[10px]">{d.ayuda}</p>
              </div>
            );
          })}
        </div>

        {/* Gráfico vector */}
        <div className="es-card flex flex-col items-center p-4">
          <svg viewBox="0 0 200 200" className="w-full max-w-xs">
            {/* Cuadrantes */}
            <rect x="100" y="16" width="84" height="84" className="fill-emerald-50" />
            <rect x="16" y="16" width="84" height="84" className="fill-sky-50" />
            <rect x="16" y="100" width="84" height="84" className="fill-rose-50" />
            <rect x="100" y="100" width="84" height="84" className="fill-amber-50" />
            {/* Ejes */}
            <line x1="100" y1="16" x2="100" y2="184" stroke="#a78bfa" strokeWidth="1" />
            <line x1="16" y1="100" x2="184" y2="100" stroke="#a78bfa" strokeWidth="1" />
            {/* Etiquetas de cuadrante */}
            <text x="142" y="30" textAnchor="middle" className="fill-emerald-600 text-[8px] font-semibold">Agresivo</text>
            <text x="58" y="30" textAnchor="middle" className="fill-sky-600 text-[8px] font-semibold">Conservador</text>
            <text x="58" y="178" textAnchor="middle" className="fill-rose-600 text-[8px] font-semibold">Defensivo</text>
            <text x="142" y="178" textAnchor="middle" className="fill-amber-600 text-[8px] font-semibold">Competitivo</text>
            {/* Etiquetas de eje */}
            <text x="190" y="98" textAnchor="end" className="fill-slate-400 text-[7px]">FI +</text>
            <text x="103" y="22" className="fill-slate-400 text-[7px]">FF +</text>
            {/* Vector */}
            <line x1="100" y1="100" x2={px} y2={py} stroke="#7c3aed" strokeWidth="2" />
            <circle cx={px} cy={py} r="4" className="fill-violet-600" />
          </svg>
          <div className="mt-3 text-center">
            <p className="es-muted text-xs">Vector (X={x}, Y={y})</p>
            <p className={`text-lg font-bold ${c.nombre === 'Agresivo' ? 'text-emerald-600' : c.nombre === 'Conservador' ? 'text-sky-600' : c.nombre === 'Defensivo' ? 'text-rose-600' : 'text-amber-600'}`}>
              Perfil {c.nombre}
            </p>
          </div>
        </div>
      </div>

      <div className="es-card mt-4 p-5">
        <p className="text-sm font-semibold">Postura estratégica: {c.nombre}</p>
        <p className="es-muted mt-1 text-sm">{c.consejo}</p>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => guardar(false)} disabled={guardando} className="es-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50">
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
        <button onClick={() => guardar(true)} disabled={guardando} className="es-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50">
          Guardar y volver →
        </button>
        {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
      </div>
    </div>
  );
}
