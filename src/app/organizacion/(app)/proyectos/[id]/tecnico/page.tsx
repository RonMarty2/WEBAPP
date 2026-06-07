'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Cog, Check } from 'lucide-react';
import { SugerirIA } from '@/components/compartido/SugerirIA';
import type { Tecnico } from '@/types/organizacion';

const VACIO: Tecnico = { proceso: '', capacidad: '', equipos: '', layout: '', proveedores: '' };

const CAMPOS = [
  { key: 'proceso', label: 'Proceso productivo / de servicio', desc: 'Paso a paso de cómo produces o entregas.', placeholder: 'Ej: Recepción de grano → tostado → molido → preparación → servicio en mesa…' },
  { key: 'capacidad', label: 'Capacidad', desc: 'Cuánto puedes producir/atender (por día, mes…).', placeholder: 'Ej: 120 tazas/día, 4 mesas, 2 turnos de barista…' },
  { key: 'equipos', label: 'Equipos e insumos clave', desc: 'Maquinaria, herramientas e insumos principales.', placeholder: 'Ej: Máquina espresso 2 grupos, molino, tostadora 1kg, refrigerador…' },
  { key: 'layout', label: 'Distribución (layout)', desc: 'Cómo se organiza el espacio físico.', placeholder: 'Ej: Barra al frente, zona de mesas, depósito y baño al fondo…' },
  { key: 'proveedores', label: 'Proveedores clave', desc: 'De quién dependes para insumos críticos.', placeholder: 'Ej: Productores de Caranavi (grano), distribuidor de lácteos local…' },
] as const;

export default function HerramientaTecnico() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [t, setT] = useState<Tecnico>(VACIO);
  const [titulo, setTitulo] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [sector, setSector] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    fetch(`/api/organizacion/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.proyecto) {
          setTitulo(d.proyecto.titulo ?? '');
          setEmpresa(d.proyecto.empresa ?? '');
          setSector(d.proyecto.sector ?? '');
          const x = d.proyecto.tecnico;
          if (x && Object.keys(x).length) setT({ ...VACIO, ...x });
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const set = (key: keyof Tecnico, val: string) => setT((p) => ({ ...p, [key]: val }));

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const res = await fetch(`/api/organizacion/proyectos/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ tecnico: t, estado: 'tecnico' }),
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
    setT((prev) => ({
      proceso: get('Proceso') || prev.proceso,
      capacidad: get('Capacidad') || prev.capacidad,
      equipos: get('Equipos') || prev.equipos,
      layout: get('Layout') || get('Distribución') || prev.layout,
      proveedores: get('Proveedores') || prev.proveedores,
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
          <Cog className="org-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="org-accent-text text-xs font-semibold uppercase tracking-wider">Operación</p>
          <h1 className="text-2xl font-bold tracking-tight">Aspectos técnicos</h1>
        </div>
      </header>
      <p className="org-muted mt-2 text-sm">
        Describe cómo opera tu empresa: el proceso, su capacidad, los equipos, la
        distribución física y de quién dependes.
      </p>

      <div className="mt-5 space-y-3">
        {CAMPOS.map((c) => (
          <div key={c.key} className="org-card p-4">
            <p className="text-sm font-semibold">{c.label}</p>
            <p className="org-muted text-xs">{c.desc}</p>
            <textarea
              value={t[c.key]} onChange={(e) => set(c.key, e.target.value)} rows={2} placeholder={c.placeholder}
              className="org-border mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        ))}
      </div>

      <div className="mt-4">
        <SugerirIA
          modulo="organizacion"
          tarea={
            'Para los aspectos técnicos de este proyecto en Bolivia, propón texto breve. Devuelve EXACTAMENTE estas líneas (formato literal):\n' +
            'Proceso: …\nCapacidad: …\nEquipos: …\nLayout: …\nProveedores: …'
          }
          formato="texto"
          acentoClase="org-accent-bg text-white"
          contexto={
            `EMPRESA: ${empresa || titulo}\nSECTOR: ${sector || 'no especificado'}\n\n` +
            'IMPORTANTE: NO inventes una empresa distinta. Trabaja SOLO sobre la empresa y el sector indicados.'
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
