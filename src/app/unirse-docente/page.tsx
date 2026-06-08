'use client';

/**
 * Página donde el alumno pega el código que le dio su docente para
 * vincularse. También muestra la lista de docentes a los que ya está
 * vinculado y permite controlar el toggle de consentimiento "permitir
 * a este docente ver el contenido de mis proyectos" (por defecto OFF —
 * solo metadatos).
 *
 * Wave 3 del panel docente — lado del alumno.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowLeft, CheckCircle2, KeyRound, Eye, EyeOff } from 'lucide-react';

interface DocenteVinculado {
  id: string;
  docente_id: string;
  docente_nombre: string;
  codigo_usado: string;
  vinculado_en: string;
}

interface Consentimiento {
  docente_id: string;
  permitir_ver_contenido: boolean;
}

export default function UnirseDocente() {
  const router = useRouter();
  const [codigoInput, setCodigoInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [docentes, setDocentes] = useState<DocenteVinculado[]>([]);
  const [consentimientos, setConsentimientos] = useState<Map<string, boolean>>(new Map());
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState<string | null>(null);

  const cargar = () => {
    Promise.all([
      fetch('/api/alumno/docentes', { credentials: 'include' }).then(async (r) => {
        if (r.status === 401) { router.replace('/login'); return null; }
        return r.json();
      }),
      fetch('/api/alumno/consentimientos', { credentials: 'include' })
        .then((r) => r.ok ? r.json() : { consentimientos: [] }),
    ])
      .then(([docsData, consData]) => {
        if (docsData) setDocentes(docsData.docentes ?? []);
        const m = new Map<string, boolean>();
        for (const c of (consData.consentimientos ?? []) as Consentimiento[]) {
          m.set(c.docente_id, c.permitir_ver_contenido);
        }
        setConsentimientos(m);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []); // eslint-disable-line react-hooks/exhaustive-deps

  const vincular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoInput.trim()) return;
    setEnviando(true);
    setMensaje(null);
    try {
      const res = await fetch('/api/docente/vincular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ codigo: codigoInput.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje({ tipo: 'ok', texto: 'Listo. Estás vinculado a tu docente.' });
        setCodigoInput('');
        cargar();
      } else {
        setMensaje({ tipo: 'error', texto: data.error || 'No se pudo vincular' });
      }
    } finally {
      setEnviando(false);
    }
  };

  const cambiarConsentimiento = async (docenteId: string, permitir: boolean) => {
    setActualizando(docenteId);
    try {
      const res = await fetch('/api/alumno/consentimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ docente_id: docenteId, permitir_ver_contenido: permitir }),
      });
      if (res.ok) {
        const m = new Map(consentimientos);
        m.set(docenteId, permitir);
        setConsentimientos(m);
      }
    } finally {
      setActualizando(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6 pb-10">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Inicio
      </Link>

      <header className="mt-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <KeyRound className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">¿Te dieron un código?</p>
          <h1 className="text-2xl font-bold tracking-tight">Vincúlate a tu docente</h1>
          <p className="text-sm text-slate-500">
            Pega el código de 6 caracteres que te dio tu docente para que pueda
            ver el avance de tu proyecto.
          </p>
        </div>
      </header>

      <form onSubmit={vincular} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <label htmlFor="codigo-docente" className="text-sm font-medium text-slate-700">Código del docente</label>
        <input
          id="codigo-docente"
          autoFocus
          value={codigoInput}
          onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
          placeholder="EJ. K7M2N4"
          maxLength={12}
          aria-label="Código del docente"
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 text-center text-2xl font-bold tracking-[0.4em] uppercase focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
        <button
          type="submit"
          disabled={enviando || codigoInput.trim().length < 4}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {enviando ? 'Vinculando…' : 'Vincularme'}
        </button>

        {mensaje && (
          <div
            className={`mt-3 flex items-start gap-2 rounded-lg p-3 text-sm ${
              mensaje.tipo === 'ok'
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border border-rose-200 bg-rose-50 text-rose-900'
            }`}
          >
            {mensaje.tipo === 'ok' && <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" aria-hidden="true" />}
            <span>{mensaje.texto}</span>
          </div>
        )}
      </form>

      <section className="mt-8">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-700">
            Mis docentes <span className="font-normal text-slate-500">({docentes.length})</span>
          </h2>
        </div>

        {cargando ? (
          <p className="mt-3 text-sm text-slate-500">Cargando…</p>
        ) : docentes.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Aún no estás vinculado a ningún docente.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {docentes.map((d) => {
              const permite = consentimientos.get(d.docente_id) ?? false;
              const enProgreso = actualizando === d.docente_id;
              return (
                <li key={d.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700" aria-hidden="true">
                      {d.docente_nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{d.docente_nombre}</p>
                      <p className="text-[11px] text-slate-400">
                        Vinculado {new Date(d.vinculado_en).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })} · código {d.codigo_usado}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-md border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-start gap-2">
                      {permite
                        ? <Eye className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600" aria-hidden="true" />
                        : <EyeOff className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" aria-hidden="true" />}
                      <div className="min-w-0 flex-1 text-[11px] text-slate-600">
                        <p>
                          {permite
                            ? <strong className="text-emerald-700">Permitido: ver el contenido de mis proyectos.</strong>
                            : <strong className="text-slate-700">No permitido: solo ve metadatos (títulos, estado, fechas).</strong>}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {permite
                            ? 'Tu docente puede leer tu Lean Canvas, encuesta, análisis y demás. Quítale el permiso cuando quieras.'
                            : 'Tu docente NO ve qué escribiste, solo cuántos proyectos tienes y en qué estado están.'}
                        </p>
                      </div>
                      <button
                        onClick={() => cambiarConsentimiento(d.docente_id, !permite)}
                        disabled={enProgreso}
                        aria-label={permite ? 'Quitar permiso de ver contenido' : 'Permitir ver contenido'}
                        className={`flex-shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold transition-colors disabled:opacity-50 ${
                          permite
                            ? 'border border-rose-300 bg-white text-rose-700 hover:bg-rose-50'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {enProgreso ? '...' : permite ? 'Quitar permiso' : 'Permitir'}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="mt-5 rounded-lg border border-slate-200 bg-white p-3 text-[11px] text-slate-500">
        <p>
          <strong>Sobre los permisos:</strong> por defecto tu docente solo ve
          los metadatos de tus proyectos (título, estado, fecha). El contenido
          completo de cada herramienta queda privado, salvo que tú actives el
          toggle de arriba para ese docente específico.
        </p>
      </div>
    </div>
  );
}
