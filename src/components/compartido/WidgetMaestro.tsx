'use client';

/**
 * Widget "Trabajando en: [proyecto maestro]" — reusable en el header de
 * cualquier módulo. Estéticamente neutro (no usa tokens de un módulo) para
 * encajar en todos. Permite elegir el proyecto maestro activo y saltar al
 * Generador para conectarlo todo. Es una preferencia de continuidad de UI.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Target, ChevronDown, Sparkles, Check } from 'lucide-react';
import { getMaestroActivo, setMaestroActivo } from '@/lib/maestro/activo';

interface MaestroItem { id: string; titulo: string }

export function WidgetMaestro() {
  const [maestros, setMaestros] = useState<MaestroItem[]>([]);
  const [activo, setActivo] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [cargado, setCargado] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActivo(getMaestroActivo());
    fetch('/api/maestro', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { proyectos: [] }))
      .then((d) => setMaestros(d.proyectos ?? []))
      .catch(() => {})
      .finally(() => setCargado(true));
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const elegir = (id: string | null) => {
    setActivo(id);
    setMaestroActivo(id);
    setAbierto(false);
  };

  // No mostrar nada hasta cargar; si no hay maestros, mostrar atajo a crear.
  if (!cargado) return null;

  const activoItem = maestros.find((m) => m.id === activo);

  if (maestros.length === 0) {
    return (
      <Link href="/generador" className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 sm:inline-flex">
        <Sparkles className="h-3.5 w-3.5" /> Conectar proyecto
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex max-w-52 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 transition hover:bg-slate-50"
        title="Proyecto en el que trabajas"
      >
        <Target className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
        <span className="truncate">{activoItem ? activoItem.titulo : 'Sin proyecto'}</span>
        <ChevronDown className="h-3 w-3 flex-shrink-0 text-slate-400" />
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Trabajando en</p>
          <button onClick={() => elegir(null)} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50">
            <span className="text-slate-500">Ninguno</span>
            {!activo && <Check className="h-3.5 w-3.5 text-slate-700" />}
          </button>
          <div className="my-1 h-px bg-slate-100" />
          <div className="max-h-56 overflow-auto">
            {maestros.map((m) => (
              <button key={m.id} onClick={() => elegir(m.id)} className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50">
                <span className="truncate">{m.titulo}</span>
                {activo === m.id && <Check className="h-3.5 w-3.5 flex-shrink-0 text-slate-700" />}
              </button>
            ))}
          </div>
          <div className="my-1 h-px bg-slate-100" />
          <Link href="/generador" className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
            <Sparkles className="h-3.5 w-3.5" /> Abrir Generador
          </Link>
        </div>
      )}
    </div>
  );
}
