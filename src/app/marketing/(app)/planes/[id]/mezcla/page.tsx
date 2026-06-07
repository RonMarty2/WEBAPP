'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Blend, Check } from 'lucide-react';
import { SugerirIA } from '@/components/compartido/SugerirIA';
import type { Mezcla, TipoMezcla } from '@/types/marketing';

const VACIO: Mezcla = {
  tipo: '4ps',
  producto: '', precio: '', plaza: '', promocion: '',
  personas: '', procesos: '', evidenciaFisica: '',
};

const CAMPOS_4P = [
  { key: 'producto', label: 'Producto', desc: '¿Qué vendes? Características, beneficio, presentaciones, variantes.', placeholder: 'Ej: Café de especialidad bolivianos, granos de Yungas, tostado semanal…' },
  { key: 'precio', label: 'Precio', desc: 'Estrategia y rango. ¿Premium, paridad o bajo?', placeholder: 'Ej: Bs 18 el espresso, Bs 25 con leche; ligeramente por encima del barrio…' },
  { key: 'plaza', label: 'Plaza (distribución)', desc: '¿Dónde y cómo llega al cliente? Local, delivery, eventos…', placeholder: 'Ej: Local en Recoleta, delivery por PedidosYa los fines de semana…' },
  { key: 'promocion', label: 'Promoción', desc: '¿Cómo te das a conocer? Redes, alianzas, contenidos, ofertas.', placeholder: 'Ej: Reels semanales del tostado, alianza con coworking, 2x1 los martes…' },
] as const;

const CAMPOS_3P_EXTRA = [
  { key: 'personas', label: 'Personas', desc: 'Equipo que entrega el servicio. Actitud, capacitación, uniforme.', placeholder: 'Ej: Baristas certificados, atención por nombre, sin uniforme rígido…' },
  { key: 'procesos', label: 'Procesos', desc: 'Cómo es la experiencia de principio a fin. Tiempos, pasos, fricción.', placeholder: 'Ej: Pedido por QR en mesa, espera promedio 5 min, recibo al WhatsApp…' },
  { key: 'evidenciaFisica', label: 'Evidencia física', desc: 'Lo tangible que comunica la marca: local, packaging, materiales.', placeholder: 'Ej: Madera clara, plantas, tazas propias firmadas, bolsas kraft con sello…' },
] as const;

export default function HerramientaMezcla() {
  const params = useParams<{ id: string }>();
  const [m, setM] = useState<Mezcla>(VACIO);
  const [titulo, setTitulo] = useState('');
  const [marca, setMarca] = useState('');
  const [sector, setSector] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    fetch(`/api/marketing/planes/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.plan) {
          setTitulo(d.plan.titulo ?? '');
          setMarca(d.plan.marca ?? '');
          setSector(d.plan.sector ?? '');
          const x = d.plan.mezcla;
          if (x && Object.keys(x).length) setM({ ...VACIO, ...x });
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const set = <K extends keyof Mezcla>(key: K, val: Mezcla[K]) => setM((p) => ({ ...p, [key]: val }));

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const res = await fetch(`/api/marketing/planes/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ mezcla: m, estado: 'mezcla' }),
      });
      if (res.ok) { setGuardado(true); if (volver) window.location.href = `/marketing/planes/${params.id}`; }
    } finally { setGuardando(false); }
  };

  // Aplica una sugerencia IA con líneas tipo "Producto: …\nPrecio: …\n…"
  const aplicarIA = (texto: string) => {
    const lineas = texto.split('\n').map((l) => l.trim()).filter(Boolean);
    const get = (p: string): string => {
      const l = lineas.find((x) => new RegExp(`^${p}\\s*:`, 'i').test(x));
      return l ? l.replace(new RegExp(`^${p}\\s*:\\s*`, 'i'), '').trim() : '';
    };
    setM((prev) => ({
      ...prev,
      producto: get('Producto') || prev.producto,
      precio: get('Precio') || prev.precio,
      plaza: get('Plaza') || prev.plaza,
      promocion: get('Promoción') || get('Promocion') || prev.promocion,
      personas: m.tipo === '7ps' ? (get('Personas') || prev.personas) : prev.personas,
      procesos: m.tipo === '7ps' ? (get('Procesos') || prev.procesos) : prev.procesos,
      evidenciaFisica: m.tipo === '7ps' ? (get('Evidencia física') || get('Evidencia fisica') || prev.evidenciaFisica) : prev.evidenciaFisica,
    }));
  };

  if (cargando) return <div className="mkt-muted py-10 text-center text-sm">Cargando…</div>;

  const todosCampos = m.tipo === '7ps' ? [...CAMPOS_4P, ...CAMPOS_3P_EXTRA] : CAMPOS_4P;
  const tareaIA = m.tipo === '4ps'
    ? 'Para una mezcla de marketing 4Ps en este negocio en Bolivia, propón texto breve para cada P. Devuelve EXACTAMENTE estas líneas (formato literal):\nProducto: <2-3 líneas>\nPrecio: <2-3 líneas>\nPlaza: <2-3 líneas>\nPromoción: <2-3 líneas>'
    : 'Para una mezcla de marketing 7Ps en este negocio en Bolivia, propón texto breve para cada P. Devuelve EXACTAMENTE estas líneas (formato literal):\nProducto: …\nPrecio: …\nPlaza: …\nPromoción: …\nPersonas: …\nProcesos: …\nEvidencia física: …';

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/marketing/planes/${params.id}`} className="mkt-muted inline-flex items-center gap-1 text-sm hover:text-rose-700">
        <ArrowLeft className="h-4 w-4" /> Volver al plan
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="mkt-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Blend className="mkt-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="mkt-accent-text text-xs font-semibold uppercase tracking-wider">Marketing mix</p>
          <h1 className="text-2xl font-bold tracking-tight">Mezcla de marketing</h1>
        </div>
      </header>
      <p className="mkt-muted mt-2 text-sm">
        Describe brevemente cada P. Esto guía decisiones concretas: qué pones en
        el menú, qué precio cobras, dónde te encuentran y cómo te das a conocer.
      </p>

      {/* Selector 4P / 7P */}
      <div className="mt-5 inline-flex rounded-lg border border-rose-200 bg-white p-1">
        {(['4ps', '7ps'] as TipoMezcla[]).map((t) => (
          <button
            key={t}
            onClick={() => set('tipo', t)}
            className={`rounded-md px-4 py-1.5 text-xs font-medium transition ${m.tipo === t ? 'mkt-accent-bg text-white' : 'mkt-muted hover:bg-rose-50'}`}
          >
            {t === '4ps' ? '4 P (productos)' : '7 P (servicios)'}
          </button>
        ))}
      </div>
      <p className="mkt-muted mt-1 text-xs">Usa 7P si vendes un servicio o experiencia (cafetería, consultoría, gimnasio…).</p>

      {/* Campos */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {todosCampos.map((c) => (
          <div key={c.key} className="mkt-card p-4">
            <p className="text-sm font-semibold">{c.label}</p>
            <p className="mkt-muted text-xs">{c.desc}</p>
            <textarea
              value={m[c.key]}
              onChange={(e) => set(c.key as keyof Mezcla, e.target.value as never)}
              rows={3} placeholder={c.placeholder}
              className="mkt-border mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
        ))}
      </div>

      {/* IA */}
      <div className="mt-4">
        <SugerirIA
          modulo="marketing"
          tarea={tareaIA}
          formato="texto"
          acentoClase="mkt-accent-bg text-white"
          placeholder={`Producto/marca: ${marca || titulo}. Sector: ${sector || '—'}.`}
          onAplicar={aplicarIA}
        />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => guardar(false)} disabled={guardando} className="mkt-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50">
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
        <button onClick={() => guardar(true)} disabled={guardando} className="mkt-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50">
          Guardar y volver →
        </button>
        {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
      </div>
    </div>
  );
}
