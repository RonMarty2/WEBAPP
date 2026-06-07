'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, LayoutGrid, Check } from 'lucide-react';
import { SugerirIA } from '@/components/compartido/SugerirIA';
import type { LeanCanvas } from '@/types/idea';

const VACIO: LeanCanvas = {
  problema: '', segmentos: '', propuestaValor: '', solucion: '', canales: '',
  ingresos: '', costos: '', metricas: '', ventaja: '',
};

const BLOQUES: Array<{ key: keyof LeanCanvas; label: string; desc: string; placeholder: string }> = [
  { key: 'problema', label: '1. Problema', desc: 'Los 1-3 problemas principales del cliente.', placeholder: 'Ej: No hay almuerzo casero rápido cerca de oficinas…' },
  { key: 'segmentos', label: '2. Segmentos de clientes', desc: '¿Para quién? Incluye early adopters.', placeholder: 'Ej: Oficinistas 25-40 del centro; early adopters: equipos de coworking…' },
  { key: 'propuestaValor', label: '3. Propuesta única de valor', desc: 'Un mensaje claro y distinto.', placeholder: 'Ej: Almuerzo casero, sano y puntual en tu escritorio.' },
  { key: 'solucion', label: '4. Solución', desc: 'Las 1-3 funciones clave.', placeholder: 'Ej: App de pre-pedido + cocina central + reparto en bici.' },
  { key: 'canales', label: '5. Canales', desc: '¿Cómo llegas al cliente?', placeholder: 'Ej: WhatsApp, Instagram, alianzas con coworkings.' },
  { key: 'ingresos', label: '6. Fuentes de ingreso', desc: '¿Cómo ganas dinero?', placeholder: 'Ej: Venta por almuerzo, planes mensuales de empresa.' },
  { key: 'costos', label: '7. Estructura de costos', desc: 'Los costos principales.', placeholder: 'Ej: Insumos, cocina, reparto, app, sueldos.' },
  { key: 'metricas', label: '8. Métricas clave', desc: '¿Qué números miras?', placeholder: 'Ej: Pedidos/día, recompra, costo por pedido.' },
  { key: 'ventaja', label: '9. Ventaja injusta', desc: 'Lo difícil de copiar.', placeholder: 'Ej: Recetas propias + red de cocineras del barrio.' },
];

export default function HerramientaLeanCanvas() {
  const params = useParams<{ id: string }>();
  const [c, setC] = useState<LeanCanvas>(VACIO);
  const [titulo, setTitulo] = useState('');
  const [idea, setIdea] = useState('');
  const [sector, setSector] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    fetch(`/api/idea/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.proyecto) {
          setTitulo(d.proyecto.titulo ?? '');
          setIdea(d.proyecto.idea ?? '');
          setSector(d.proyecto.sector ?? '');
          const x = d.proyecto.lean_canvas;
          if (x && Object.keys(x).length) setC({ ...VACIO, ...x });
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const set = (key: keyof LeanCanvas, val: string) => setC((p) => ({ ...p, [key]: val }));

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const res = await fetch(`/api/idea/proyectos/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ lean_canvas: c, estado: 'canvas' }),
      });
      if (res.ok) { setGuardado(true); if (volver) window.location.href = `/idea/proyectos/${params.id}`; }
    } finally { setGuardando(false); }
  };

  const aplicarIA = (texto: string) => {
    const lineas = texto.split('\n').map((l) => l.trim()).filter(Boolean);
    const get = (p: string) => {
      const l = lineas.find((x) => new RegExp(`^${p}\\s*:`, 'i').test(x));
      return l ? l.replace(new RegExp(`^${p}\\s*:\\s*`, 'i'), '').trim() : '';
    };
    setC((prev) => ({
      problema: get('Problema') || prev.problema,
      segmentos: get('Segmentos') || prev.segmentos,
      propuestaValor: get('PropuestaValor') || get('Propuesta') || prev.propuestaValor,
      solucion: get('Solución') || get('Solucion') || prev.solucion,
      canales: get('Canales') || prev.canales,
      ingresos: get('Ingresos') || prev.ingresos,
      costos: get('Costos') || prev.costos,
      metricas: get('Métricas') || get('Metricas') || prev.metricas,
      ventaja: get('Ventaja') || prev.ventaja,
    }));
  };

  if (cargando) return <div className="idea-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-4xl pb-10">
      <Link href={`/idea/proyectos/${params.id}`} className="idea-muted inline-flex items-center gap-1 text-sm hover:text-amber-700">
        <ArrowLeft className="h-4 w-4" /> Volver a la idea
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="idea-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <LayoutGrid className="idea-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="idea-accent-text text-xs font-semibold uppercase tracking-wider">Modelo de negocio</p>
          <h1 className="text-2xl font-bold tracking-tight">Lean Canvas</h1>
        </div>
      </header>
      <p className="idea-muted mt-2 text-sm">
        Resume tu modelo de negocio en una hoja. Empieza por el problema y los
        clientes: si esos dos no son reales, el resto no importa.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BLOQUES.map((b) => (
          <div key={b.key} className="idea-card p-3">
            <p className="text-sm font-semibold">{b.label}</p>
            <p className="idea-muted text-[11px]">{b.desc}</p>
            <textarea
              value={c[b.key]} onChange={(e) => set(b.key, e.target.value)} rows={4} placeholder={b.placeholder}
              className="idea-border mt-2 w-full rounded-lg border bg-white px-2 py-1.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
        ))}
      </div>

      <div className="mt-4">
        <SugerirIA
          modulo="idea"
          tarea={
            'Para un Lean Canvas de esta idea en Bolivia, propón texto breve por bloque. Devuelve EXACTAMENTE estas líneas (formato literal):\n' +
            'Problema: …\nSegmentos: …\nPropuestaValor: …\nSolución: …\nCanales: …\nIngresos: …\nCostos: …\nMétricas: …\nVentaja: …'
          }
          formato="texto"
          acentoClase="idea-accent-bg text-white"
          placeholder={`Idea: ${idea || titulo}. Sector: ${sector || '—'}.`}
          onAplicar={aplicarIA}
        />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => guardar(false)} disabled={guardando} className="idea-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50">{guardando ? 'Guardando…' : 'Guardar'}</button>
        <button onClick={() => guardar(true)} disabled={guardando} className="idea-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50">Guardar y volver →</button>
        {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
      </div>
    </div>
  );
}
