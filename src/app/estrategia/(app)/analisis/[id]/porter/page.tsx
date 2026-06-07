'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Swords, Check } from 'lucide-react';
import { FUERZAS_PORTER, ESCALA_INTENSIDAD, interpretarAtractivo } from '@/lib/estrategia/plantillas-porter';
import { SugerirIA } from '@/components/compartido/SugerirIA';
import type { FuerzaPorter, Porter } from '@/types/estrategia';

type FuerzaKey = (typeof FUERZAS_PORTER)[number]['key'];

const VACIO: Porter = {
  rivalidad: { intensidad: 3, notas: '' },
  nuevosEntrantes: { intensidad: 3, notas: '' },
  sustitutos: { intensidad: 3, notas: '' },
  poderClientes: { intensidad: 3, notas: '' },
  poderProveedores: { intensidad: 3, notas: '' },
};

export default function HerramientaPorter() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [porter, setPorter] = useState<Porter>(VACIO);
  const [titulo, setTitulo] = useState('');
  const [sector, setSector] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    fetch(`/api/estrategia/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.proyecto) {
          setTitulo(d.proyecto.titulo ?? '');
          setSector(d.proyecto.sector ?? '');
          const px = d.proyecto.porter ?? {};
          setPorter({ ...VACIO, ...px });
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const actualizar = (key: FuerzaKey, cambios: Partial<FuerzaPorter>) => {
    setPorter((p) => ({ ...p, [key]: { ...p[key], ...cambios } }));
  };

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const res = await fetch(`/api/estrategia/proyectos/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ porter }),
      });
      if (res.ok) {
        setGuardado(true);
        if (volver) router.push(`/estrategia/analisis/${params.id}`);
      }
    } finally {
      setGuardando(false);
    }
  };

  const valores = FUERZAS_PORTER.map((f) => porter[f.key].intensidad);
  const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
  const atractivo = interpretarAtractivo(promedio);

  if (cargando) return <div className="es-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/estrategia/analisis/${params.id}`} className="es-muted inline-flex items-center gap-1 text-sm hover:text-violet-700">
        <ArrowLeft className="h-4 w-4" /> Volver al análisis
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="es-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Swords className="es-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="es-accent-text text-xs font-semibold uppercase tracking-wider">Microentorno</p>
          <h1 className="text-2xl font-bold tracking-tight">5 Fuerzas de Porter</h1>
        </div>
      </header>
      <p className="es-muted mt-2 text-sm">
        Evalúa la presión competitiva de tu sector. Califica cada fuerza de 1 (muy baja)
        a 5 (muy alta). A mayor presión total, menos atractivo es entrar.
      </p>

      {/* Resumen vivo */}
      <div className="es-card mt-5 flex items-center justify-between p-4">
        <div>
          <p className="es-muted text-[11px] uppercase tracking-wider">Presión promedio del sector</p>
          <p className="es-accent-text text-3xl font-bold">{promedio.toFixed(1)}<span className="es-muted text-base">/5</span></p>
        </div>
        <p className={`text-sm font-medium ${atractivo.clase}`}>{atractivo.texto}</p>
      </div>

      {/* Las 5 fuerzas */}
      <div className="mt-5 space-y-4">
        {FUERZAS_PORTER.map((f) => (
          <div key={f.key} className="es-card p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold">{f.label}</h2>
                <p className="es-muted text-xs">{f.descripcion}</p>
              </div>
              <span className="es-accent-soft es-accent-text flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold">
                {porter[f.key].intensidad}
              </span>
            </div>

            {/* Selector de intensidad */}
            <div className="mt-3 flex gap-1.5">
              {ESCALA_INTENSIDAD.map((e) => (
                <button
                  key={e.valor}
                  onClick={() => actualizar(f.key, { intensidad: e.valor })}
                  className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition ${
                    porter[f.key].intensidad === e.valor ? 'es-accent-bg text-white' : 'es-border border hover:bg-violet-50'
                  }`}
                  title={e.label}
                >
                  {e.valor}
                </button>
              ))}
            </div>

            {/* Preguntas guía */}
            <ul className="mt-3 space-y-0.5">
              {f.preguntas.map((q) => (
                <li key={q} className="es-muted text-xs">· {q}</li>
              ))}
            </ul>

            {/* Notas */}
            <textarea
              value={porter[f.key].notas}
              onChange={(e) => actualizar(f.key, { notas: e.target.value })}
              rows={2}
              placeholder="Justifica tu calificación con datos de tu sector…"
              className="es-border mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            />

            {/* IA */}
            <div className="mt-2">
              <SugerirIA
                modulo="estrategia"
                tarea={`Para la fuerza de Porter "${f.label}", redacta un análisis breve (2-3 frases) aplicado a este proyecto en Bolivia, y sugiere una intensidad de 1 a 5 justificándola.`}
                acentoClase="es-accent-bg text-white"
                placeholder={`Sector: ${sector || titulo || 'tu proyecto'}…`}
                onAplicar={(texto) => actualizar(f.key, { notas: texto })}
              />
            </div>
          </div>
        ))}
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
