'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, GitBranch, Check } from 'lucide-react';
import { SugerirIA } from '@/components/compartido/SugerirIA';
import type { CadenaValor } from '@/types/estrategia';

const PRIMARIAS = [
  { key: 'logisticaInterna', label: 'Logística interna', desc: 'Recepción, almacenamiento de insumos' },
  { key: 'operaciones', label: 'Operaciones', desc: 'Transformación de insumos en producto/servicio' },
  { key: 'logisticaExterna', label: 'Logística externa', desc: 'Distribución, entrega al cliente' },
  { key: 'marketing', label: 'Marketing y ventas', desc: 'Cómo das a conocer y vendes' },
  { key: 'servicio', label: 'Servicio', desc: 'Postventa, soporte, fidelización' },
];
const APOYO = [
  { key: 'infraestructura', label: 'Infraestructura', desc: 'Dirección, finanzas, planificación' },
  { key: 'rrhh', label: 'Recursos humanos', desc: 'Selección, capacitación, retención' },
  { key: 'tecnologia', label: 'Tecnología', desc: 'Sistemas, herramientas, innovación' },
  { key: 'abastecimiento', label: 'Abastecimiento', desc: 'Compras de insumos y servicios' },
];

const VACIO: CadenaValor = { primarias: {}, apoyo: {} };

export default function HerramientaCadenaValor() {
  const params = useParams<{ id: string }>();
  const [cv, setCv] = useState<CadenaValor>(VACIO);
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
          const c = d.proyecto.cadena_valor ?? {};
          setCv({ primarias: c.primarias ?? {}, apoyo: c.apoyo ?? {} });
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const setActividad = (grupo: 'primarias' | 'apoyo', key: string, valor: string) =>
    setCv((p) => ({ ...p, [grupo]: { ...p[grupo], [key]: valor } }));

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const res = await fetch(`/api/estrategia/proyectos/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ cadena_valor: cv }),
      });
      if (res.ok) { setGuardado(true); if (volver) window.location.href = `/estrategia/analisis/${params.id}`; }
    } finally { setGuardando(false); }
  };

  if (cargando) return <div className="es-muted py-10 text-center text-sm">Cargando…</div>;

  const Campo = ({ grupo, item }: { grupo: 'primarias' | 'apoyo'; item: { key: string; label: string; desc: string } }) => (
    <div className="es-card p-4">
      <p className="text-sm font-semibold">{item.label}</p>
      <p className="es-muted text-xs">{item.desc}</p>
      <textarea
        value={cv[grupo][item.key] ?? ''}
        onChange={(e) => setActividad(grupo, item.key, e.target.value)}
        rows={2}
        placeholder="¿Cómo genera valor esta actividad en tu proyecto?"
        className="es-border mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/estrategia/analisis/${params.id}`} className="es-muted inline-flex items-center gap-1 text-sm hover:text-violet-700">
        <ArrowLeft className="h-4 w-4" /> Volver al análisis
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="es-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <GitBranch className="es-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="es-accent-text text-xs font-semibold uppercase tracking-wider">Análisis interno</p>
          <h1 className="text-2xl font-bold tracking-tight">Cadena de Valor</h1>
        </div>
      </header>
      <p className="es-muted mt-2 text-sm">
        Describe cómo cada actividad de tu negocio genera valor. Identifica dónde
        está tu ventaja y dónde puedes mejorar.
      </p>

      <h2 className="mt-5 text-sm font-semibold text-slate-700">Actividades primarias</h2>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {PRIMARIAS.map((it) => <Campo key={it.key} grupo="primarias" item={it} />)}
      </div>

      <h2 className="mt-5 text-sm font-semibold text-slate-700">Actividades de apoyo</h2>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {APOYO.map((it) => <Campo key={it.key} grupo="apoyo" item={it} />)}
      </div>

      <div className="mt-4">
        <SugerirIA
          modulo="estrategia"
          tarea="Para una cadena de valor de Porter de este proyecto, sugiere brevemente cómo cada actividad (primarias y de apoyo) puede generar valor o ventaja competitiva en Bolivia."
          acentoClase="es-accent-bg text-white"
          placeholder={`Sector: ${sector || titulo || 'tu proyecto'}…`}
        />
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
