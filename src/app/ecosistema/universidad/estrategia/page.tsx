'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlatformShell } from '@/components/ecosistema/PlatformShell';
import { getPlatform } from '@/lib/ecosistema/platforms';
import { ARTEFACTO_PESTEL, ARTEFACTO_FODA } from '@/lib/ecosistema/mock-data';
import { TutorIA } from '@/components/tutor-ia/TutorIA';

type Bloque = 'pestel' | 'porter' | 'mefe' | 'foda';

export default function EstrategiaPlatform() {
  const platform = getPlatform('estrategia')!;
  const [activo, setActivo] = useState<Bloque>('pestel');
  const pestel = ARTEFACTO_PESTEL.contenido as Record<string, { score: number; factores: string[] }>;
  const foda = ARTEFACTO_FODA.contenido as {
    fortalezas: string[];
    oportunidades: string[];
    debilidades: string[];
    amenazas: string[];
    estrategias: { fo: string[]; do: string[]; fa: string[]; da: string[] };
  };

  return (
    <PlatformShell platform={platform}>
      <header className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{platform.nombre}</h1>
            <p className="mt-2 text-slate-600">Del análisis al plan, paso a paso. Cada bloque genera un artefacto reutilizable.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/ecosistema/universidad/estrategia/calculadora-reactiva"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-violet-300 bg-white px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50"
            >
              🎚️ PESTEL Score interactivo
            </Link>
            <Link
              href="/ecosistema/universidad/estrategia/casos"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-violet-300 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100"
            >
              🇧🇴 Ver 5 casos bolivianos →
            </Link>
          </div>
        </div>
      </header>

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {[
          { id: 'pestel' as const, label: 'PESTEL' },
          { id: 'porter' as const, label: '5 Fuerzas de Porter' },
          { id: 'mefe' as const, label: 'MEFE / MEFI' },
          { id: 'foda' as const, label: 'FODA Cruzada' },
        ].map(b => (
          <button
            key={b.id}
            onClick={() => setActivo(b.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
              activo === b.id ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {activo === 'pestel' && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(pestel).map(([dim, datos]) => (
              <div key={dim} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-semibold capitalize text-slate-900">{dim}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    datos.score > 0 ? 'bg-emerald-100 text-emerald-800' : datos.score < 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {datos.score > 0 ? '+' : ''}{datos.score.toFixed(1)}
                  </span>
                </div>
                <ul className="space-y-1 text-sm text-slate-700">
                  {datos.factores.map(f => (
                    <li key={f} className="flex gap-2">
                      <span className="text-slate-400">·</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-violet-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-xl">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-700">¿Quieres entender el porqué?</p>
                <p className="mt-1 text-sm text-slate-600">
                  El tutor te ayuda a priorizar qué dimensión PESTEL importa más para tu sector y por qué.
                </p>
              </div>
              <TutorIA
                modulo="estrategia"
                herramienta="pestel:dimensiones"
                campo="factores PESTEL más relevantes para tu sector"
                etiqueta="Tutor: qué priorizar en PESTEL"
                variante="amplio"
                contexto="Análisis PESTEL del sector cafetería en Cochabamba, Bolivia."
                contenidoActual={Object.entries(pestel)
                  .map(([dim, d]) => `${dim.toUpperCase()} (score ${d.score.toFixed(1)}): ${d.factores.join(' | ')}`)
                  .join('\n')}
              />
            </div>
          </div>
        </div>
      )}

      {activo === 'porter' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="mb-4 text-sm text-slate-600">Análisis cualitativo + scoring 1-5 por cada fuerza.</p>
            <div className="space-y-3">
              {[
                ['Rivalidad entre competidores', 4, 'Café Express domina pero hay nichos abiertos'],
                ['Amenaza de nuevos entrantes', 3, 'Inversión moderada; barreras de marca crecientes'],
                ['Poder de negociación de proveedores', 2, 'Múltiples productores de café locales'],
                ['Poder de negociación de clientes', 3, 'Cliente joven es exigente pero leal'],
                ['Amenaza de productos sustitutos', 3, 'Bebidas energéticas y té compiten en horario laboral'],
              ].map(([fuerza, score, nota]) => (
                <div key={fuerza as string} className="flex items-center gap-4 rounded-xl border border-slate-100 p-3">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{fuerza}</p>
                    <p className="text-xs text-slate-500">{nota}</p>
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-violet-100 text-lg font-bold text-violet-700">
                    {score}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-xl">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-700">¿Quieres entender el porqué?</p>
                <p className="mt-1 text-sm text-slate-600">
                  El tutor te muestra 3 caminos para evaluar cada fuerza y justificar el puntaje con criterio.
                </p>
              </div>
              <TutorIA
                modulo="estrategia"
                herramienta="porter:5fuerzas"
                campo="5 fuerzas de Porter en tu sector"
                etiqueta="Tutor: cómo evaluar las fuerzas"
                variante="amplio"
                contexto="Análisis de las 5 fuerzas de Porter para el sector cafetería en Cochabamba, Bolivia."
                contenidoActual={[
                  'Rivalidad entre competidores: 4/5 — Café Express domina pero hay nichos abiertos.',
                  'Amenaza de nuevos entrantes: 3/5 — Inversión moderada; barreras de marca crecientes.',
                  'Poder de proveedores: 2/5 — Múltiples productores de café locales.',
                  'Poder de clientes: 3/5 — Cliente joven es exigente pero leal.',
                  'Amenaza de sustitutos: 3/5 — Bebidas energéticas y té compiten en horario laboral.',
                ].join('\n')}
              />
            </div>
          </div>
        </div>
      )}

      {activo === 'mefe' && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <MatrizCard
              titulo="MEFE — Factores externos"
              filas={[
                { f: 'Demanda insatisfecha 3,720 clientes', peso: 0.18, calif: 4 },
                { f: 'Tendencia tercer espacio', peso: 0.15, calif: 4 },
                { f: 'Inflación insumos 5.2%', peso: 0.12, calif: 2 },
                { f: 'Tipo de cambio paralelo', peso: 0.1, calif: 2 },
                { f: 'Apps delivery consolidadas', peso: 0.15, calif: 4 },
                { f: 'Cultura del café en crecimiento', peso: 0.2, calif: 4 },
                { f: 'Estabilidad municipal', peso: 0.1, calif: 3 },
              ]}
            />
            <MatrizCard
              titulo="MEFI — Factores internos"
              filas={[
                { f: 'Ubicación premium', peso: 0.18, calif: 4 },
                { f: 'Barista certificado SCA', peso: 0.15, calif: 4 },
                { f: 'Café boliviano de origen', peso: 0.17, calif: 4 },
                { f: 'Capital limitado', peso: 0.2, calif: 1 },
                { f: 'Sin marca conocida', peso: 0.15, calif: 2 },
                { f: 'Proveedores locales confiables', peso: 0.15, calif: 3 },
              ]}
            />
          </div>
          <div className="rounded-2xl border border-violet-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-xl">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-700">¿Quieres entender el porqué?</p>
                <p className="mt-1 text-sm text-slate-600">
                  El tutor te muestra 3 caminos para asignar pesos y calificaciones a los factores externos e internos con criterio.
                </p>
              </div>
              <TutorIA
                modulo="estrategia"
                herramienta="mefe-mefi:ponderacion"
                campo="ponderación de factores externos e internos"
                etiqueta="Tutor: cómo asignar pesos"
                variante="amplio"
                contexto="Matrices MEFE/MEFI para el sector cafetería en Cochabamba, Bolivia. Cada factor tiene un peso (0-1) y una calificación (1-4)."
                contenidoActual={[
                  'MEFE — Factores externos:',
                  '- Demanda insatisfecha 3,720 clientes (peso 0.18, calif 4)',
                  '- Tendencia tercer espacio (peso 0.15, calif 4)',
                  '- Inflación insumos 5.2% (peso 0.12, calif 2)',
                  '- Tipo de cambio paralelo (peso 0.10, calif 2)',
                  '- Apps delivery consolidadas (peso 0.15, calif 4)',
                  '- Cultura del café en crecimiento (peso 0.20, calif 4)',
                  '- Estabilidad municipal (peso 0.10, calif 3)',
                  '',
                  'MEFI — Factores internos:',
                  '- Ubicación premium (peso 0.18, calif 4)',
                  '- Barista certificado SCA (peso 0.15, calif 4)',
                  '- Café boliviano de origen (peso 0.17, calif 4)',
                  '- Capital limitado (peso 0.20, calif 1)',
                  '- Sin marca conocida (peso 0.15, calif 2)',
                  '- Proveedores locales confiables (peso 0.15, calif 3)',
                ].join('\n')}
              />
            </div>
          </div>
        </div>
      )}

      {activo === 'foda' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FodaCol titulo="Fortalezas" items={foda.fortalezas} color="emerald" />
            <FodaCol titulo="Oportunidades" items={foda.oportunidades} color="sky" />
            <FodaCol titulo="Debilidades" items={foda.debilidades} color="amber" />
            <FodaCol titulo="Amenazas" items={foda.amenazas} color="rose" />
          </div>
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6">
            <p className="font-semibold text-violet-900">Estrategias cruzadas generadas</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <EstrategiaCard tipo="FO (Maxi-Maxi)" items={foda.estrategias.fo} />
              <EstrategiaCard tipo="DO (Mini-Maxi)" items={foda.estrategias.do} />
              <EstrategiaCard tipo="FA (Maxi-Mini)" items={foda.estrategias.fa} />
              <EstrategiaCard tipo="DA (Mini-Mini)" items={foda.estrategias.da} />
            </div>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-xl">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-700">¿Quieres entender el porqué?</p>
                <p className="mt-1 text-sm text-slate-600">
                  El tutor te propone 3 caminos para diseñar estrategias FO/DO/FA/DA que sean concretas y defendibles.
                </p>
              </div>
              <TutorIA
                modulo="estrategia"
                herramienta="foda:estrategias-cruzadas"
                campo="estrategias FO/DO/FA/DA cruzadas"
                etiqueta="Tutor: estrategias cruzadas"
                variante="amplio"
                contexto="Matriz FODA cruzada para el sector cafetería en Cochabamba, Bolivia. Buscamos estrategias FO (Maxi-Maxi), DO (Mini-Maxi), FA (Maxi-Mini) y DA (Mini-Mini)."
                contenidoActual={[
                  `Fortalezas: ${foda.fortalezas.join(' | ')}`,
                  `Oportunidades: ${foda.oportunidades.join(' | ')}`,
                  `Debilidades: ${foda.debilidades.join(' | ')}`,
                  `Amenazas: ${foda.amenazas.join(' | ')}`,
                  '',
                  `FO: ${foda.estrategias.fo.join(' | ')}`,
                  `DO: ${foda.estrategias.do.join(' | ')}`,
                  `FA: ${foda.estrategias.fa.join(' | ')}`,
                  `DA: ${foda.estrategias.da.join(' | ')}`,
                ].join('\n')}
              />
            </div>
          </div>
        </div>
      )}
    </PlatformShell>
  );
}

function MatrizCard({ titulo, filas }: { titulo: string; filas: { f: string; peso: number; calif: number }[] }) {
  const total = filas.reduce((acc, r) => acc + r.peso * r.calif, 0);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-3 font-semibold text-slate-900">{titulo}</h3>
      <table className="w-full text-sm">
        <thead className="text-xs uppercase text-slate-500">
          <tr>
            <th className="pb-2 text-left">Factor</th>
            <th className="pb-2 text-right">Peso</th>
            <th className="pb-2 text-right">Calif.</th>
            <th className="pb-2 text-right">Pond.</th>
          </tr>
        </thead>
        <tbody>
          {filas.map(r => (
            <tr key={r.f} className="border-t border-slate-100">
              <td className="py-2 text-slate-700">{r.f}</td>
              <td className="py-2 text-right">{r.peso.toFixed(2)}</td>
              <td className="py-2 text-right">{r.calif}</td>
              <td className="py-2 text-right font-medium">{(r.peso * r.calif).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-300 font-bold">
            <td className="pt-[0.5rem]" colSpan={3}>Total ponderado</td>
            <td className="pt-[0.5rem] text-right text-violet-700">{total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function FodaCol({ titulo, items, color }: { titulo: string; items: string[]; color: 'emerald' | 'sky' | 'amber' | 'rose' }) {
  const colorMap = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    sky: 'bg-sky-50 border-sky-200 text-sky-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    rose: 'bg-rose-50 border-rose-200 text-rose-900',
  };
  return (
    <div className={`rounded-2xl border p-5 ${colorMap[color]}`}>
      <p className="font-semibold">{titulo}</p>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map(i => <li key={i} className="flex gap-2"><span>•</span><span>{i}</span></li>)}
      </ul>
    </div>
  );
}

function EstrategiaCard({ tipo, items }: { tipo: string; items: string[] }) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">{tipo}</p>
      <ul className="mt-2 space-y-1 text-sm text-slate-700">
        {items.map(i => <li key={i}>· {i}</li>)}
      </ul>
    </div>
  );
}
