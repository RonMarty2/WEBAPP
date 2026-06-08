'use client';

/**
 * Hub del módulo Identidad Visual.
 *
 * Vive como sub-herramienta dentro de Marketing. Muestra el progreso
 * (brief → paleta → tipografía → logo → mockups → manual) con cards
 * navegables. Cada card indica si esa pieza está hecha o pendiente.
 */

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Palette, Type, Sparkles, ImageIcon, FileText, BookOpen, Check, AlertCircle } from 'lucide-react';
import type { IdentidadVisual } from '@/types/identidad';

interface Paso {
  id: 'brief' | 'paleta' | 'tipografia' | 'logo' | 'mockups' | 'manual';
  titulo: string;
  resumen: string;
  ruta: string;
  Icono: React.ElementType;
  hecho: (id: IdentidadVisual | null) => boolean;
}

const PASOS: Paso[] = [
  {
    id: 'brief',
    titulo: 'Brief de Marca',
    resumen: 'Esencia, valores, personalidad. Cualquier decisión visual nace de acá.',
    ruta: 'brief',
    Icono: BookOpen,
    hecho: (id) => !!(id?.brief?.nombre && id?.brief?.esencia),
  },
  {
    id: 'paleta',
    titulo: 'Paleta de Colores',
    resumen: 'Cinco colores armoniosos según teoría del color. Sin gasto de IA.',
    ruta: 'paleta',
    Icono: Palette,
    hecho: (id) => !!id?.paleta_primario,
  },
  {
    id: 'tipografia',
    titulo: 'Tipografía',
    resumen: 'Combinación de Google Fonts según personalidad de marca.',
    ruta: 'tipografia',
    Icono: Type,
    hecho: (id) => !!id?.tipo_principal_familia,
  },
  {
    id: 'logo',
    titulo: 'Logo',
    resumen: 'Generación de logo con IA (3 alternativas en plan Estándar).',
    ruta: 'logo',
    Icono: Sparkles,
    hecho: (id) => !!id?.logo_principal_url,
  },
  {
    id: 'mockups',
    titulo: 'Mockups',
    resumen: 'Aplicación de la marca: tarjeta, redes, empaque, polo, taza, banner.',
    ruta: 'logo', // mockups se gestionan dentro de la página logo por ahora
    Icono: ImageIcon,
    hecho: (id) => Array.isArray(id?.mockups) && (id!.mockups.length > 0),
  },
  {
    id: 'manual',
    titulo: 'Manual de Marca',
    resumen: 'Documento .md con todas las decisiones. Listo para imprimir.',
    ruta: 'manual',
    Icono: FileText,
    hecho: (id) => id?.estado === 'completo' || id?.estado === 'mockups',
  },
];

export default function HubIdentidad() {
  const params = useParams<{ id: string }>();
  const [identidad, setIdentidad] = useState<IdentidadVisual | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/identidad/${params.id}`, { credentials: 'include' })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) {
          setError(d.error || 'No se pudo cargar la identidad');
          return null;
        }
        return d.identidad as IdentidadVisual | null;
      })
      .then((id) => setIdentidad(id))
      .catch(() => setError('Error de conexión'))
      .finally(() => setCargando(false));
  }, [params.id]);

  if (cargando) {
    return <div className="mkt-muted py-10 text-center text-sm">Cargando identidad…</div>;
  }

  const completados = PASOS.filter((p) => p.hecho(identidad)).length;
  const total = PASOS.length;

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/marketing/planes/${params.id}`} className="mkt-muted inline-flex items-center gap-1 text-sm hover:text-rose-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver al plan
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="mkt-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Palette className="mkt-accent-text h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="mkt-accent-text text-xs font-semibold uppercase tracking-wider">Sub-herramienta</p>
          <h1 className="text-2xl font-bold tracking-tight">Identidad Visual</h1>
          <p className="mkt-muted mt-1 text-sm">
            Construye logo, paleta, tipografía y aplicaciones de tu marca. Los pasos se van habilitando en orden.
          </p>
        </div>
      </header>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Progreso */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Progreso</p>
          <p className="text-xs text-slate-500">{completados} de {total} pasos completados</p>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all"
            style={{ width: `${(completados / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Pasos */}
      <ol className="mt-6 space-y-3">
        {PASOS.map((paso, i) => {
          const hecho = paso.hecho(identidad);
          // El paso siguiente es navegable; los posteriores también pero con aviso suave.
          return (
            <li key={paso.id}>
              <Link
                href={`/marketing/planes/${params.id}/identidad/${paso.ruta}`}
                className={`mkt-card flex items-start gap-4 p-5 transition-colors hover:border-rose-300 ${hecho ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200'}`}
              >
                <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${hecho ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {hecho ? <Check className="h-5 w-5" aria-hidden="true" /> : <paso.Icono className="h-5 w-5" aria-hidden="true" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Paso {i + 1}</p>
                    {hecho && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">Completado</span>}
                  </div>
                  <p className="mt-0.5 text-base font-semibold text-slate-900">{paso.titulo}</p>
                  <p className="mt-1 text-xs text-slate-600">{paso.resumen}</p>
                </div>
                <span className="mkt-accent-text mt-2 flex-shrink-0 text-xl">→</span>
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-[11px] text-slate-500">
        <Sparkles className="mt-0.5 h-3 w-3 flex-shrink-0 text-rose-500" aria-hidden="true" />
        <span>
          La paleta, tipografía, mockups y el manual cuestan <strong>cero tokens</strong> de IA — son
          algorítmicos. La generación de logo SÍ usa IA generativa; el tope depende de tu plan
          (Estándar: 3 · Pro: 10 · Elite: ilimitado).
        </span>
      </div>
    </div>
  );
}
