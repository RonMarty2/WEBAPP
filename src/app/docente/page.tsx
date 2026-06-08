'use client';

/**
 * Panel del docente — Wave 1 (MVP).
 *
 * Lo que hace:
 *   1) Generar un código de 6 caracteres y mostrarlo grande para que el
 *      docente lo dicte/comparta con sus alumnos.
 *   2) Listar códigos activos (con etiqueta opcional para distinguir
 *      "MKT-2026-1" de "EST-2026-1") y revocar los viejos.
 *   3) Listar alumnos vinculados (snapshot del nombre/email del alumno),
 *      con botón para abrir su detalle (Wave 2 — placeholder por ahora).
 *
 * Solo accesible para usuarios con role 'docente' o 'admin'. Estudiantes
 * que entren a /docente reciben un mensaje pidiendo que vayan a
 * /unirse-docente si lo que quieren es vincularse a SU docente.
 *
 * Wave 2 (siguiente): clic en un alumno → ver sus proyectos por módulo,
 * dejar observaciones por reporte, marcar entregas.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Copy, Check, Plus, Trash2, Users, ArrowLeft, AlertTriangle, ExternalLink, Archive } from 'lucide-react';
import type { SessionUser } from '@/lib/auth';

interface Codigo {
  codigo: string;
  docente_id: string;
  etiqueta: string | null;
  activo: boolean;
  creado_en: string;
}

interface Alumno {
  id: string;
  alumno_id: string;
  alumno_nombre: string;
  alumno_email: string;
  alumno_universidad: string | null;
  codigo_usado: string;
  vinculado_en: string;
  nota_docente: string | null;
}

export default function PanelDocente() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [cargandoUser, setCargandoUser] = useState(true);
  const [codigos, setCodigos] = useState<Codigo[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');
  const [copiado, setCopiado] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) { router.replace('/login'); return; }
        setUser(d.user);
      })
      .catch(() => router.replace('/login'))
      .finally(() => setCargandoUser(false));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const esDocente = user.role === 'docente' || user.role === 'admin';
    if (!esDocente) { setCargando(false); return; }
    Promise.all([
      fetch('/api/docente/codigos', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/docente/alumnos', { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([cods, alms]) => {
        setCodigos(cods.codigos ?? []);
        setAlumnos(alms.alumnos ?? []);
      })
      .catch(() => setError('No se pudo cargar tu panel.'))
      .finally(() => setCargando(false));
  }, [user]);

  const generarCodigo = async () => {
    setGenerando(true);
    setError('');
    try {
      const res = await fetch('/api/docente/codigos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ etiqueta: nuevaEtiqueta.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No se pudo generar el código');
        return;
      }
      setCodigos((prev) => [data.codigo, ...prev]);
      setNuevaEtiqueta('');
    } finally {
      setGenerando(false);
    }
  };

  const revocarCodigo = async (codigo: string) => {
    if (!window.confirm(`¿Revocar el código ${codigo}? Los alumnos que ya estén vinculados con él no se desvinculan; solo deja de aceptar nuevos.`)) return;
    const res = await fetch(`/api/docente/codigos/${codigo}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) setCodigos((prev) => prev.filter((c) => c.codigo !== codigo));
  };

  const archivarAlumno = async (vinculoId: string) => {
    if (!window.confirm('¿Archivar este alumno? Saldrá de tu lista pero se mantiene el histórico.')) return;
    const res = await fetch(`/api/docente/alumnos/${vinculoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ archivado: true }),
    });
    if (res.ok) setAlumnos((prev) => prev.filter((a) => a.id !== vinculoId));
  };

  const copiarAlPortapapeles = async (codigo: string) => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(codigo);
      setTimeout(() => setCopiado(null), 2000);
    } catch { /* sin clipboard */ }
  };

  if (cargandoUser) {
    return <div className="p-10 text-center text-sm text-slate-500">Cargando…</div>;
  }

  if (!user) return null;

  const esDocente = user.role === 'docente' || user.role === 'admin';

  // Estudiante intentando entrar al panel: redirigir al flujo de vincularse.
  if (!esDocente) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-700" />
            <h1 className="text-lg font-semibold text-amber-900">Panel solo para docentes</h1>
          </div>
          <p className="mt-2 text-sm text-amber-900">
            Este panel es para que un docente gestione sus alumnos. Si lo que
            quieres es <strong>vincularte a tu docente</strong> con un código
            que él te dio, ve aquí:
          </p>
          <div className="mt-4 flex gap-3">
            <Link href="/unirse-docente" className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
              <ExternalLink className="h-4 w-4" /> Tengo un código de docente
            </Link>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" /> Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 pb-10">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Inicio
      </Link>

      <header className="mt-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">Modo docente</p>
            <h1 className="text-2xl font-bold tracking-tight">Mis alumnos</h1>
            <p className="text-sm text-slate-500">
              Genera un código y dáselo a tus alumnos. Cuando lo peguen en
              su perfil, aparecerán aquí.
            </p>
          </div>
        </div>
      </header>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
          {error}
        </div>
      )}

      {/* Bloque: generador de código + códigos activos */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-700">Código de invitación</h2>
        <p className="mt-1 text-xs text-slate-500">
          Cada código sirve para que UN o VARIOS alumnos se vinculen a ti.
          Puedes tener varios códigos a la vez (ej. uno por materia).
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={nuevaEtiqueta}
            onChange={(e) => setNuevaEtiqueta(e.target.value)}
            placeholder="Etiqueta opcional (ej. MKT-2026-1)"
            className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            maxLength={60}
          />
          <button
            onClick={generarCodigo}
            disabled={generando}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> {generando ? 'Generando…' : 'Generar nuevo código'}
          </button>
        </div>

        {cargando ? (
          <p className="mt-4 text-sm text-slate-500">Cargando códigos…</p>
        ) : codigos.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Aún no tienes códigos. Genera uno para empezar.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {codigos.map((c) => (
              <li key={c.codigo} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-bold tracking-widest text-violet-700">{c.codigo}</code>
                    {c.etiqueta && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">{c.etiqueta}</span>}
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Creado {new Date(c.creado_en).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => copiarAlPortapapeles(c.codigo)}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-white"
                  title="Copiar"
                >
                  {copiado === c.codigo ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiado === c.codigo ? 'Copiado' : 'Copiar'}
                </button>
                <button
                  onClick={() => revocarCodigo(c.codigo)}
                  className="inline-flex items-center gap-1 rounded-md p-1.5 text-rose-600 hover:bg-rose-50"
                  title="Revocar"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Bloque: lista de alumnos */}
      <section className="mt-6">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-700">
            Alumnos vinculados <span className="font-normal text-slate-500">({alumnos.length})</span>
          </h2>
        </div>

        {cargando ? (
          <p className="mt-4 text-sm text-slate-500">Cargando alumnos…</p>
        ) : alumnos.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <Users className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-medium text-slate-700">Aún no tienes alumnos vinculados</p>
            <p className="mt-1 text-xs text-slate-500">
              Genera un código arriba y compártelo. Cuando un alumno lo pegue en
              <Link href="/unirse-docente" className="ml-1 text-violet-700 underline">/unirse-docente</Link>,
              aparecerá aquí.
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {alumnos.map((a) => (
              <li key={a.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                  {(a.alumno_nombre || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{a.alumno_nombre}</p>
                  <p className="truncate text-xs text-slate-500">{a.alumno_email}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Vinculado {new Date(a.vinculado_en).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })} · código {a.codigo_usado}
                  </p>
                </div>
                <Link
                  href={`/docente/alumno/${a.id}`}
                  className="rounded-md border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100"
                  title="Ver sus proyectos por módulo"
                >
                  Ver proyectos →
                </Link>
                <button
                  onClick={() => archivarAlumno(a.id)}
                  className="inline-flex items-center gap-1 rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                  title="Archivar (sale de la lista, se mantiene el histórico)"
                >
                  <Archive className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
