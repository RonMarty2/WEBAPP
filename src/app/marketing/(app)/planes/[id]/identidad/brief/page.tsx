'use client';

/**
 * Captura del Brief de Marca.
 * Es el PRIMER paso del módulo Identidad. Sin brief, no se generan
 * paleta/logo/mockups útiles.
 */

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Save, ArrowRight, AlertCircle } from 'lucide-react';
import type { BriefMarca, IdentidadVisual } from '@/types/identidad';

type BriefState = Partial<BriefMarca>;

export default function PaginaBrief() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [brief, setBrief] = useState<BriefState>({
    nombre: '', sector: '', esencia: '', valores: [], personalidad: '',
    publico_objetivo: '', atributos: [], inspiracion: [], prohibidos: [],
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/identidad/${params.id}`, { credentials: 'include' })
      .then(async (r) => {
        const d = await r.json();
        const id = (d.identidad as IdentidadVisual | null);
        if (id?.brief) setBrief({ ...brief, ...id.brief });
      })
      .catch(() => {})
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const setCampo = <K extends keyof BriefState>(k: K, v: BriefState[K]) => {
    setBrief((b) => ({ ...b, [k]: v }));
  };

  const guardar = async (avanzar: boolean) => {
    setGuardando(true);
    setGuardado(false);
    setError('');
    try {
      const res = await fetch(`/api/identidad/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ brief }),
      });
      if (res.ok) {
        setGuardado(true);
        if (avanzar) router.push(`/marketing/planes/${params.id}/identidad/paleta`);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || 'No se pudo guardar');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="mkt-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <Link href={`/marketing/planes/${params.id}/identidad`} className="mkt-muted inline-flex items-center gap-1 text-sm hover:text-rose-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver a Identidad
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="mkt-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <BookOpen className="mkt-accent-text h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="mkt-accent-text text-xs font-semibold uppercase tracking-wider">Paso 1</p>
          <h1 className="text-2xl font-bold tracking-tight">Brief de Marca</h1>
          <p className="mkt-muted mt-1 text-sm">
            Define la esencia de tu marca. Todo lo visual nace de acá.
          </p>
        </div>
      </header>

      <form className="mt-6 space-y-5" onSubmit={(e) => { e.preventDefault(); guardar(true); }}>
        <Campo label="Nombre comercial" obligatorio
          ayuda='Cómo se llama tu marca (ej. "Café La Orquídea").'>
          <input
            value={brief.nombre ?? ''}
            onChange={(e) => setCampo('nombre', e.target.value)}
            placeholder="Ej: Café La Orquídea"
            className="mkt-border w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
        </Campo>

        <Campo label="Sector industrial" obligatorio
          ayuda="Rubro o industria al que pertenece tu marca.">
          <input
            value={brief.sector ?? ''}
            onChange={(e) => setCampo('sector', e.target.value)}
            placeholder="Ej: Gastronomía / cafetería de especialidad"
            className="mkt-border w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
        </Campo>

        <Campo label="Esencia" obligatorio
          ayuda="En 1-2 frases: ¿qué es tu marca en su esencia? ¿qué le promete al cliente?">
          <textarea
            value={brief.esencia ?? ''}
            onChange={(e) => setCampo('esencia', e.target.value)}
            placeholder="Ej: Cafetería de especialidad que celebra granos bolivianos de altura con preparación artesanal."
            rows={3}
            className="mkt-border w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
        </Campo>

        <Campo label="Personalidad de marca"
          ayuda='En 1-2 palabras: ¿cómo se siente? Ej. "joven y profesional", "cálida y artesanal".'>
          <input
            value={brief.personalidad ?? ''}
            onChange={(e) => setCampo('personalidad', e.target.value)}
            placeholder="Ej: cálida, artesanal, contemporánea"
            className="mkt-border w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
        </Campo>

        <Campo label="Público objetivo"
          ayuda="Quién es el cliente ideal (puedes copiar del Buyer Persona si ya lo tienes).">
          <textarea
            value={brief.publico_objetivo ?? ''}
            onChange={(e) => setCampo('publico_objetivo', e.target.value)}
            placeholder="Ej: Profesionales jóvenes 25-40 años, citadinos, valoran experiencias auténticas."
            rows={2}
            className="mkt-border w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
        </Campo>

        <Campo label="Valores fundamentales (3-5)"
          ayuda="Uno por línea o separados por coma.">
          <ListaEditable
            valores={brief.valores ?? []}
            onChange={(v) => setCampo('valores', v)}
            placeholder='Ej: "calidez", "calidad", "comunidad"'
          />
        </Campo>

        <Campo label="Atributos visuales/emocionales"
          ayuda='Adjetivos que describen cómo debe sentirse visualmente. Ej. "artesanal", "minimalista", "vibrante".'>
          <ListaEditable
            valores={brief.atributos ?? []}
            onChange={(v) => setCampo('atributos', v)}
            placeholder="Ej: artesanal, minimalista, cálido"
          />
        </Campo>

        <Campo label="Referencias inspiradoras (opcional)"
          ayuda="URLs o nombres de marcas que te inspiran visualmente.">
          <ListaEditable
            valores={brief.inspiracion ?? []}
            onChange={(v) => setCampo('inspiracion', v)}
            placeholder="Ej: Starbucks Reserve, Blue Bottle"
          />
        </Campo>

        <Campo label="Estilos a EVITAR (opcional)"
          ayuda="Estéticas que NO encajan con tu marca.">
          <ListaEditable
            valores={brief.prohibidos ?? []}
            onChange={(v) => setCampo('prohibidos', v)}
            placeholder="Ej: kitsch, infantil, neón"
          />
        </Campo>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => guardar(false)}
            disabled={guardando || !brief.nombre?.trim() || !brief.esencia?.trim()}
            className="mkt-btn-ghost inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {guardando ? 'Guardando…' : guardado ? '✓ Guardado' : 'Guardar'}
          </button>
          <button
            type="submit"
            disabled={guardando || !brief.nombre?.trim() || !brief.esencia?.trim() || !brief.sector?.trim()}
            className="mkt-btn-primary inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium disabled:opacity-50"
          >
            Guardar y pasar a Paleta <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
}

function Campo({ label, ayuda, obligatorio, children }: {
  label: string;
  ayuda?: string;
  obligatorio?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label} {obligatorio && <span className="text-rose-500">*</span>}
      </span>
      {ayuda && <p className="mt-0.5 text-xs text-slate-500">{ayuda}</p>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function ListaEditable({ valores, onChange, placeholder }: {
  valores: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [borrador, setBorrador] = useState('');

  const agregar = () => {
    const tokens = borrador.split(',').map((s) => s.trim()).filter(Boolean);
    if (tokens.length === 0) return;
    onChange([...valores, ...tokens]);
    setBorrador('');
  };

  const quitar = (i: number) => onChange(valores.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {valores.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-800">
            {v}
            <button type="button" onClick={() => quitar(i)} className="hover:text-rose-900" aria-label={`Quitar ${v}`}>×</button>
          </span>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        <input
          value={borrador}
          onChange={(e) => setBorrador(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregar(); } }}
          placeholder={placeholder}
          className="mkt-border flex-1 rounded-lg border bg-white px-3 py-1.5 text-xs focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
        <button type="button" onClick={agregar} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
          + Agregar
        </button>
      </div>
    </div>
  );
}
