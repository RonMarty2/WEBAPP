'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, X, Target, Check } from 'lucide-react';
import type { ProyectoMercados, TipoEstudio } from '@/types/mercados';

const TIPOS: Array<{ id: TipoEstudio; label: string; desc: string }> = [
  { id: 'exploratorio', label: 'Exploratorio', desc: 'No tienes hipótesis aún; buscas entender' },
  { id: 'descriptivo', label: 'Descriptivo', desc: 'Mides y cuantificas (el más común)' },
  { id: 'causal', label: 'Causal', desc: 'Pruebas causa-efecto con experimentos' },
];

export default function EtapaDiseno() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const [tipoEstudio, setTipoEstudio] = useState<TipoEstudio | null>(null);
  const [objetivoGeneral, setObjetivoGeneral] = useState('');
  const [objEspecificos, setObjEspecificos] = useState<string[]>([]);
  const [hipotesis, setHipotesis] = useState<string[]>([]);
  const [variables, setVariables] = useState<string[]>([]);
  const [departamento, setDepartamento] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [zona, setZona] = useState('');

  useEffect(() => {
    fetch(`/api/mercados/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        const p: ProyectoMercados = d.proyecto;
        if (!p) return;
        setTipoEstudio(p.tipo_estudio);
        setObjetivoGeneral(p.objetivo_general ?? '');
        setObjEspecificos(p.objetivos_especificos ?? []);
        setHipotesis(p.hipotesis ?? []);
        setVariables(p.variables ?? []);
        setDepartamento(p.departamento ?? '');
        setMunicipio(p.municipio ?? '');
        setZona(p.zona ?? '');
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const guardar = async (avanzar: boolean) => {
    setGuardando(true);
    setGuardado(false);
    try {
      const body: Record<string, unknown> = {
        tipo_estudio: tipoEstudio,
        objetivo_general: objetivoGeneral,
        objetivos_especificos: objEspecificos,
        hipotesis,
        variables,
        departamento,
        municipio,
        zona,
      };
      // Al avanzar, mover el estado a 'muestreo' (si aún estaba en 'diseno').
      if (avanzar) body.estado = 'muestreo';

      const res = await fetch(`/api/mercados/proyectos/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setGuardado(true);
        if (avanzar) router.push(`/mercados/proyecto/${params.id}/muestreo`);
      }
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <div className="mk-muted py-10 text-center text-sm">Cargando…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <Link
        href={`/mercados/proyecto/${params.id}`}
        className="mk-muted inline-flex items-center gap-1 text-sm hover:text-sky-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al proyecto
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="mk-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Target className="mk-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="mk-accent-text text-xs font-semibold uppercase tracking-wider">Etapa 1</p>
          <h1 className="text-2xl font-bold tracking-tight">Diseño de la investigación</h1>
        </div>
      </header>
      <p className="mk-muted mt-2 text-sm">
        Define qué buscas y a quién. Esto guía todo lo demás: la muestra, la encuesta y el análisis.
      </p>

      {/* Tipo de estudio */}
      <Section titulo="Tipo de estudio" hint="Lo más común en proyectos de grado es descriptivo.">
        <div className="grid gap-2 sm:grid-cols-3">
          {TIPOS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTipoEstudio(t.id)}
              className={`rounded-xl border p-3 text-left transition ${
                tipoEstudio === t.id
                  ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-300'
                  : 'mk-border hover:bg-sky-50'
              }`}
            >
              <p className="text-sm font-semibold">{t.label}</p>
              <p className="mk-muted mt-0.5 text-xs">{t.desc}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* Objetivo general */}
      <Section titulo="Objetivo general" hint="Una frase que resume qué quieres lograr con el estudio.">
        <textarea
          value={objetivoGeneral}
          onChange={(e) => setObjetivoGeneral(e.target.value)}
          rows={2}
          placeholder="Ej: Determinar la demanda potencial de una cafetería de especialidad en la zona norte de Cochabamba."
          className="mk-border w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
      </Section>

      {/* Objetivos específicos */}
      <Section titulo="Objetivos específicos" hint="Los pasos concretos para lograr el objetivo general.">
        <ListaEditable items={objEspecificos} setItems={setObjEspecificos} placeholder="Ej: Identificar la frecuencia de consumo de café fuera de casa" />
      </Section>

      {/* Hipótesis */}
      <Section titulo="Hipótesis" hint="Lo que esperas encontrar (opcional en estudios exploratorios).">
        <ListaEditable items={hipotesis} setItems={setHipotesis} placeholder="Ej: Más del 60% consume café fuera de casa al menos 2 veces por semana" />
      </Section>

      {/* Variables */}
      <Section titulo="Variables a medir" hint="Lo que vas a preguntar/observar en la encuesta.">
        <ListaEditable items={variables} setItems={setVariables} placeholder="Ej: Frecuencia de consumo, ticket promedio, importancia del WiFi" />
      </Section>

      {/* Geografía */}
      <Section titulo="Ámbito geográfico" hint="Dónde vive tu universo. Se usará para estimar el tamaño con datos del INE.">
        <div className="grid gap-2 sm:grid-cols-3">
          <input value={departamento} onChange={(e) => setDepartamento(e.target.value)} placeholder="Departamento" className="mk-border rounded-lg border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" />
          <input value={municipio} onChange={(e) => setMunicipio(e.target.value)} placeholder="Municipio" className="mk-border rounded-lg border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" />
          <input value={zona} onChange={(e) => setZona(e.target.value)} placeholder="Zona (opcional)" className="mk-border rounded-lg border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" />
        </div>
      </Section>

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={() => guardar(false)}
          disabled={guardando}
          className="mk-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
        <button
          onClick={() => guardar(true)}
          disabled={guardando}
          className="mk-btn-primary flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          Continuar al muestreo →
        </button>
        {guardado && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
            <Check className="h-4 w-4" /> Guardado
          </span>
        )}
      </div>
    </div>
  );
}

function Section({ titulo, hint, children }: { titulo: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mk-card mt-5 p-5">
      <h2 className="text-sm font-semibold">{titulo}</h2>
      {hint && <p className="mk-muted mb-3 mt-0.5 text-xs">{hint}</p>}
      {children}
    </div>
  );
}

function ListaEditable({
  items,
  setItems,
  placeholder,
}: {
  items: string[];
  setItems: (v: string[]) => void;
  placeholder: string;
}) {
  const [nuevo, setNuevo] = useState('');

  const agregar = () => {
    const v = nuevo.trim();
    if (!v) return;
    setItems([...items, v]);
    setNuevo('');
  };

  return (
    <div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="mk-accent-soft mk-accent-text flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
              {i + 1}
            </span>
            <span className="flex-1 text-sm">{item}</span>
            <button
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="mk-muted rounded p-1 hover:bg-rose-50 hover:text-rose-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregar(); } }}
          placeholder={placeholder}
          className="mk-border flex-1 rounded-lg border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
        <button onClick={agregar} className="mk-btn-ghost flex items-center gap-1 px-3 py-2 text-sm">
          <Plus className="h-4 w-4" /> Agregar
        </button>
      </div>
    </div>
  );
}
