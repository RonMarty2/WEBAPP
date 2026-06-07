'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Palette, Plus, X, Check } from 'lucide-react';
import { SugerirIA } from '@/components/compartido/SugerirIA';
import type { Branding } from '@/types/organizacion';

const VACIO: Branding = {
  nombre: '', esencia: '', valores: [], personalidad: '', promesa: '', paletaPrincipal: '', tipografia: '',
};

export default function HerramientaBranding() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [b, setB] = useState<Branding>(VACIO);
  const [titulo, setTitulo] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [sector, setSector] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [nuevoValor, setNuevoValor] = useState('');

  useEffect(() => {
    fetch(`/api/organizacion/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.proyecto) {
          setTitulo(d.proyecto.titulo ?? '');
          setEmpresa(d.proyecto.empresa ?? '');
          setSector(d.proyecto.sector ?? '');
          const x = d.proyecto.branding;
          if (x && Object.keys(x).length) setB({ ...VACIO, ...x });
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const set = <K extends keyof Branding>(key: K, val: Branding[K]) => setB((p) => ({ ...p, [key]: val }));

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const res = await fetch(`/api/organizacion/proyectos/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ branding: b, estado: 'branding' }),
      });
      if (res.ok) { setGuardado(true); if (volver) router.push(`/organizacion/proyectos/${params.id}`); }
    } finally { setGuardando(false); }
  };

  const aplicarIA = (texto: string) => {
    const lineas = texto.split('\n').map((l) => l.trim()).filter(Boolean);
    const get = (p: string) => {
      const l = lineas.find((x) => new RegExp(`^${p}\\s*:`, 'i').test(x));
      return l ? l.replace(new RegExp(`^${p}\\s*:\\s*`, 'i'), '').trim() : '';
    };
    const valoresRaw = get('Valores');
    setB((prev) => ({
      nombre: get('Nombre') || prev.nombre,
      esencia: get('Esencia') || prev.esencia,
      valores: valoresRaw ? valoresRaw.split(/[;,]/).map((s) => s.trim()).filter(Boolean) : prev.valores,
      personalidad: get('Personalidad') || prev.personalidad,
      promesa: get('Promesa') || prev.promesa,
      paletaPrincipal: get('Paleta') || prev.paletaPrincipal,
      tipografia: get('Tipografía') || get('Tipografia') || prev.tipografia,
    }));
  };

  if (cargando) return <div className="org-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/organizacion/proyectos/${params.id}`} className="org-muted inline-flex items-center gap-1 text-sm hover:text-emerald-700">
        <ArrowLeft className="h-4 w-4" /> Volver al proyecto
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="org-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Palette className="org-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="org-accent-text text-xs font-semibold uppercase tracking-wider">Identidad</p>
          <h1 className="text-2xl font-bold tracking-tight">Branding</h1>
        </div>
      </header>
      <p className="org-muted mt-2 text-sm">
        Define la identidad de tu marca: su nombre, esencia, valores, personalidad
        y los elementos visuales que la hacen reconocible.
      </p>

      <div className="mt-5 space-y-3">
        <div className="org-card p-4">
          <p className="text-sm font-semibold">Nombre comercial</p>
          <input value={b.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Ej: La Orquídea Café"
            className="org-border mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
        </div>

        <Texto label="Esencia" desc="¿Por qué existe la marca? ¿Qué problema resuelve?" value={b.esencia} onChange={(v) => set('esencia', v)} placeholder="Ej: Un refugio para trabajar y conversar con buen café boliviano." />

        {/* Valores como lista */}
        <div className="org-card p-4">
          <p className="text-sm font-semibold">Valores de marca</p>
          <p className="org-muted text-xs">3 a 5 valores que guían cómo actúa la marca.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {b.valores.map((v, i) => (
              <span key={i} className="org-accent-soft org-accent-text inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs">
                {v}
                <button onClick={() => set('valores', b.valores.filter((_, idx) => idx !== i))} className="rounded p-0.5 hover:bg-white"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
          <div className="mt-2 flex gap-1">
            <input value={nuevoValor} onChange={(e) => setNuevoValor(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && nuevoValor.trim()) { set('valores', [...b.valores, nuevoValor.trim()]); setNuevoValor(''); } }}
              placeholder="Ej: Cercanía"
              className="org-border flex-1 rounded-md border bg-white px-2 py-1 text-sm focus:outline-none" />
            <button onClick={() => { if (nuevoValor.trim()) { set('valores', [...b.valores, nuevoValor.trim()]); setNuevoValor(''); } }} className="org-border rounded-md border px-2 py-1 text-xs hover:bg-emerald-50"><Plus className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        <Texto label="Personalidad / tono" desc="Si la marca fuera persona, ¿cómo habla?" value={b.personalidad} onChange={(v) => set('personalidad', v)} placeholder="Ej: Cercana, cálida, con humor ligero; tutea sin perder respeto." />
        <Texto label="Promesa de marca" desc="Lo que el cliente siempre puede esperar." value={b.promesa} onChange={(v) => set('promesa', v)} placeholder="Ej: Siempre un lugar tranquilo y un café bien hecho." />

        <div className="grid gap-3 sm:grid-cols-2">
          <Texto label="Paleta de color" desc="Colores principales (nombres o códigos)." value={b.paletaPrincipal} onChange={(v) => set('paletaPrincipal', v)} placeholder="Ej: Verde bosque #1f6f43, crema #f3ead7" rows={2} />
          <Texto label="Tipografía" desc="Fuentes para títulos y texto." value={b.tipografia} onChange={(v) => set('tipografia', v)} placeholder="Ej: Títulos Poppins, texto Inter" rows={2} />
        </div>
      </div>

      <div className="mt-4">
        <SugerirIA
          modulo="organizacion"
          tarea={
            'Para el branding de este negocio en Bolivia, propón una identidad. Devuelve EXACTAMENTE estas líneas (formato literal):\n' +
            'Nombre: …\nEsencia: …\nValores: valor1; valor2; valor3\nPersonalidad: …\nPromesa: …\nPaleta: …\nTipografía: …'
          }
          formato="texto"
          acentoClase="org-accent-bg text-white"
          contexto={
            `EMPRESA: ${empresa || titulo}\nSECTOR: ${sector || 'no especificado'}\n\n` +
            'IMPORTANTE: NO inventes una empresa distinta. La identidad de marca debe ser coherente con esa empresa y sector.'
          }
          placeholder="Detalle opcional para afinar la sugerencia…"
          onAplicar={aplicarIA}
        />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => guardar(false)} disabled={guardando} className="org-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50">{guardando ? 'Guardando…' : 'Guardar'}</button>
        <button onClick={() => guardar(true)} disabled={guardando} className="org-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50">Guardar y volver →</button>
        {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
      </div>
    </div>
  );
}

function Texto({ label, desc, value, onChange, placeholder, rows = 2 }: {
  label: string; desc: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div className="org-card p-4">
      <p className="text-sm font-semibold">{label}</p>
      <p className="org-muted text-xs">{desc}</p>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder}
        className="org-border mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
      />
    </div>
  );
}
