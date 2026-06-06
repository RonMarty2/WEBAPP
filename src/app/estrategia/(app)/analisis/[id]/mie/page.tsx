'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Network } from 'lucide-react';
import type { FilaMatriz } from '@/types/estrategia';

/**
 * MIE — Matriz Interna-Externa. NO tiene datos propios: se deriva de los
 * totales ponderados de MEFI (eje X) y MEFE (eje Y), y posiciona el negocio
 * en una grilla 3x3 → región I..IX → estrategia recomendada.
 */
function totalPonderado(filas?: FilaMatriz[]): number {
  if (!filas) return 0;
  return filas.reduce((s, f) => s + (f.peso || 0) * (f.calificacion || 0), 0);
}

// Región y recomendación según ejes (MEFI x, MEFE y), cada uno 1-4.
function region(mefi: number, mefe: number): { num: string; zona: string; estrategia: string; color: string } {
  const col = mefi >= 3 ? 0 : mefi >= 2 ? 1 : 2; // fuerte/medio/débil
  const row = mefe >= 3 ? 0 : mefe >= 2 ? 1 : 2;
  const grid = [
    [{ num: 'I', z: 'Crecer y construir' }, { num: 'II', z: 'Crecer y construir' }, { num: 'III', z: 'Resistir y mantener' }],
    [{ num: 'IV', z: 'Crecer y construir' }, { num: 'V', z: 'Resistir y mantener' }, { num: 'VI', z: 'Cosechar o desinvertir' }],
    [{ num: 'VII', z: 'Resistir y mantener' }, { num: 'VIII', z: 'Cosechar o desinvertir' }, { num: 'IX', z: 'Cosechar o desinvertir' }],
  ];
  const cell = grid[row][col];
  const estrategias: Record<string, string> = {
    'Crecer y construir': 'Estrategias intensivas (penetración, desarrollo de producto/mercado) o integración. Invierte para crecer.',
    'Resistir y mantener': 'Penetración de mercado y desarrollo de producto. Gestiona con cautela, protege tu posición.',
    'Cosechar o desinvertir': 'Reducir, reorientar o desinvertir. Evita comprometer más recursos sin un giro claro.',
  };
  const colores: Record<string, string> = {
    'Crecer y construir': 'bg-emerald-500',
    'Resistir y mantener': 'bg-amber-500',
    'Cosechar o desinvertir': 'bg-rose-500',
  };
  return { num: cell.num, zona: cell.z, estrategia: estrategias[cell.z], color: colores[cell.z] };
}

export default function HerramientaMIE() {
  const params = useParams<{ id: string }>();
  const [mefi, setMefi] = useState(0);
  const [mefe, setMefe] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`/api/estrategia/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.proyecto) {
          setMefi(totalPonderado(d.proyecto.mefi?.filas));
          setMefe(totalPonderado(d.proyecto.mefe?.filas));
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  if (cargando) return <div className="es-muted py-10 text-center text-sm">Cargando…</div>;

  const sinDatos = mefi === 0 || mefe === 0;
  const r = region(mefi || 2.5, mefe || 2.5);

  // Posición del marcador en la grilla (porcentaje). Eje X: MEFI de 4→1 (izq→der). Eje Y: MEFE de 4→1 (arriba→abajo).
  const x = ((4 - Math.min(4, Math.max(1, mefi || 2.5))) / 3) * 100;
  const y = ((4 - Math.min(4, Math.max(1, mefe || 2.5))) / 3) * 100;

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/estrategia/analisis/${params.id}`} className="es-muted inline-flex items-center gap-1 text-sm hover:text-violet-700">
        <ArrowLeft className="h-4 w-4" /> Volver al análisis
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="es-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Network className="es-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="es-accent-text text-xs font-semibold uppercase tracking-wider">Síntesis</p>
          <h1 className="text-2xl font-bold tracking-tight">Matriz Interna-Externa (MIE)</h1>
        </div>
      </header>
      <p className="es-muted mt-2 text-sm">
        Se calcula automáticamente con los totales de tu MEFI (posición interna) y
        MEFE (respuesta al entorno). Te ubica en una de 9 regiones con su estrategia.
      </p>

      {sinDatos && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Completa primero las matrices <strong>MEFE</strong> y <strong>MEFI</strong> para
          obtener un posicionamiento real. Mientras tanto se muestra el centro (2.5).
        </div>
      )}

      <div className="es-card mt-5 flex flex-wrap items-center gap-6 p-4">
        <div>
          <p className="es-muted text-[11px] uppercase tracking-wider">Total MEFI (interno)</p>
          <p className="es-accent-text text-2xl font-bold">{(mefi || 0).toFixed(2)}</p>
        </div>
        <div>
          <p className="es-muted text-[11px] uppercase tracking-wider">Total MEFE (externo)</p>
          <p className="es-accent-text text-2xl font-bold">{(mefe || 0).toFixed(2)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white ${r.color}`}>{r.num}</span>
          <span className="text-sm font-medium">{r.zona}</span>
        </div>
      </div>

      {/* Grilla 3x3 con marcador */}
      <div className="es-card mt-5 p-5">
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <div className="grid h-full w-full grid-cols-3 grid-rows-3 overflow-hidden rounded-lg border border-violet-200">
            {['I','II','III','IV','V','VI','VII','VIII','IX'].map((n) => (
              <div key={n} className="flex items-center justify-center border border-violet-100 text-xs text-slate-300">{n}</div>
            ))}
          </div>
          <div
            className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-white ${r.color}`}
            style={{ left: `${x}%`, top: `${y}%` }}
            title={`Tu posición (región ${r.num})`}
          />
          <span className="es-muted absolute -bottom-5 left-0 text-[10px]">MEFI: fuerte → débil</span>
          <span className="es-muted absolute -left-5 top-0 origin-top-left -rotate-90 text-[10px]">MEFE: alto → bajo</span>
        </div>
      </div>

      <div className="es-card mt-5 p-5">
        <p className="text-sm font-semibold">Estrategia recomendada (región {r.num})</p>
        <p className="es-muted mt-1 text-sm">{r.estrategia}</p>
      </div>
    </div>
  );
}
