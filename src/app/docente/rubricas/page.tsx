'use client';

/**
 * Gestor de rúbricas del docente — Wave 4 Pieza 2.
 *
 * Lo que hace:
 *   1) Lista las rúbricas guardadas del docente (no archivadas).
 *   2) Permite crear una rúbrica nueva con N criterios ponderados
 *      (suma de pesos === 100%). Validación visible inline.
 *   3) Permite marcar una como "default actual" (la que se aplicará por
 *      defecto al calificar). Solo UNA puede tener el flag.
 *   4) Permite archivar (no borrar) — preserva calificaciones que la usan.
 *
 * Solo accesible para role docente o admin.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, X, Star, Archive, AlertTriangle, GraduationCap, ScrollText } from 'lucide-react';
import type { SessionUser } from '@/lib/auth';
import {
  nuevoCriterioId,
  sumaDePesos,
  type Rubrica,
  type CriterioRubrica,
  type EscalaCalificacion,
} from '@/types/docente-wave4';

const ESCALAS_OPCIONES: { valor: EscalaCalificacion; label: string }[] = [
  { valor: 100, label: '0–100 (porcentual)' },
  { valor: 20,  label: '0–20 (universitaria europea)' },
  { valor: 10,  label: '0–10 (decimal)' },
  { valor: 7,   label: '1–7 (Chile, UMSS posgrado)' },
];

function notaAprobadaDefault(escala: EscalaCalificacion): number {
  if (escala === 7) return 4;
  if (escala === 10) return 6;
  if (escala === 20) return 11;
  return 51;
}

function criterioVacio(): CriterioRubrica {
  return { id: nuevoCriterioId(), nombre: '', descripcion: '', peso_pct: 0 };
}

export default function PanelRubricas() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [cargandoUser, setCargandoUser] = useState(true);
  const [rubricas, setRubricas] = useState<Rubrica[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Form de creación.
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [escala, setEscala] = useState<EscalaCalificacion>(100);
  const [notaAprueba, setNotaAprueba] = useState<number>(51);
  const [defaultActual, setDefaultActual] = useState(true);
  const [criterios, setCriterios] = useState<CriterioRubrica[]>([
    { id: nuevoCriterioId(), nombre: 'Claridad y orden', descripcion: 'Presentación, estructura y legibilidad del trabajo.', peso_pct: 25 },
    { id: nuevoCriterioId(), nombre: 'Profundidad de análisis', descripcion: 'Calidad del razonamiento y uso de fuentes.', peso_pct: 35 },
    { id: nuevoCriterioId(), nombre: 'Aplicación práctica', descripcion: 'Vínculo con el caso real / mercado / contexto boliviano.', peso_pct: 25 },
    { id: nuevoCriterioId(), nombre: 'Originalidad', descripcion: 'Aporte propio del estudiante más allá de lo copiado.', peso_pct: 15 },
  ]);
  const [guardando, setGuardando] = useState(false);

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
    fetch('/api/docente/rubricas', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setRubricas(d.rubricas ?? []))
      .catch(() => setError('No se pudo cargar la lista.'))
      .finally(() => setCargando(false));
  }, [user]);

  const sumaPesos = sumaDePesos(criterios);
  const sumaOk = Math.abs(sumaPesos - 100) < 0.5;

  function actualizarCriterio(id: string, parche: Partial<CriterioRubrica>) {
    setCriterios((prev) => prev.map((c) => (c.id === id ? { ...c, ...parche } : c)));
  }
  function quitarCriterio(id: string) {
    setCriterios((prev) => (prev.length <= 1 ? prev : prev.filter((c) => c.id !== id)));
  }
  function agregarCriterio() {
    setCriterios((prev) => [...prev, criterioVacio()]);
  }
  function distribuirEquitativo() {
    const n = criterios.length;
    if (n === 0) return;
    const base = Math.floor(100 / n);
    const resto = 100 - base * n;
    setCriterios((prev) => prev.map((c, i) => ({ ...c, peso_pct: base + (i < resto ? 1 : 0) })));
  }

  function cambiarEscala(nuevaEscala: EscalaCalificacion) {
    setEscala(nuevaEscala);
    setNotaAprueba(notaAprobadaDefault(nuevaEscala));
  }

  async function guardar() {
    if (!nombre.trim()) { setError('Ponle un nombre a la rúbrica.'); return; }
    if (!sumaOk) { setError(`Los pesos deben sumar 100% (van ${sumaPesos}%).`); return; }
    if (criterios.some((c) => !c.nombre.trim())) { setError('Hay criterios sin nombre.'); return; }
    setError('');
    setGuardando(true);
    try {
      const res = await fetch('/api/docente/rubricas', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          criterios,
          escala_max: escala,
          nota_aprueba: notaAprueba,
          default_actual: defaultActual,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'No se pudo guardar.'); return; }
      // Si esta nueva es default, las anteriores dejan de serlo (backend).
      setRubricas((prev) => [data.rubrica, ...prev.map((r) => defaultActual ? { ...r, default_actual: false } : r)]);
      setMostrarForm(false);
      setNombre(''); setDescripcion('');
      setCriterios([criterioVacio()]);
    } finally {
      setGuardando(false);
    }
  }

  async function marcarDefault(id: string) {
    const res = await fetch(`/api/docente/rubricas/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ default_actual: true }),
    });
    if (res.ok) {
      setRubricas((prev) => prev.map((r) => ({ ...r, default_actual: r.id === id })));
    }
  }

  async function archivar(id: string) {
    if (!window.confirm('¿Archivar esta rúbrica? Se mantienen las calificaciones que ya la usaron, pero no podrás aplicarla a nuevos alumnos.')) return;
    const res = await fetch(`/api/docente/rubricas/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) setRubricas((prev) => prev.filter((r) => r.id !== id));
  }

  if (cargandoUser) {
    return <div className="p-10 text-center text-sm text-slate-500">Cargando…</div>;
  }
  if (!user) return null;

  const esDocente = user.role === 'docente' || user.role === 'admin';
  if (!esDocente) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-700" />
            <h1 className="text-lg font-semibold text-amber-900">Panel solo para docentes</h1>
          </div>
          <p className="mt-2 text-sm text-amber-900">
            Esta sección sirve para que un docente arme sus propias rúbricas de calificación.
          </p>
          <Link href="/dashboard" className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 pb-10">
      <Link href="/docente" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Panel docente
      </Link>

      <header className="mt-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <ScrollText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">Modo docente · Wave 4</p>
            <h1 className="text-2xl font-bold tracking-tight">Mis rúbricas</h1>
            <p className="text-sm text-slate-500">
              Define los criterios que usarás para calificar a tus alumnos.
              Una rúbrica = lista de aspectos + peso de cada uno.
            </p>
          </div>
        </div>
        {!mostrarForm && (
          <button
            onClick={() => setMostrarForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" /> Nueva rúbrica
          </button>
        )}
      </header>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
          {error}
        </div>
      )}

      {/* Form de creación */}
      {mostrarForm && (
        <section className="mt-6 rounded-2xl border border-violet-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Nueva rúbrica</h2>
            <button onClick={() => setMostrarForm(false)} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Cerrar">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-slate-700">Nombre *</span>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Rúbrica de proyectos de Mercadotecnia 2026"
                maxLength={200}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-700">Escala</span>
              <select
                value={escala}
                onChange={(e) => cambiarEscala(Number(e.target.value) as EscalaCalificacion)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              >
                {ESCALAS_OPCIONES.map((o) => (<option key={o.valor} value={o.valor}>{o.label}</option>))}
              </select>
            </label>
          </div>

          <label className="mt-3 block">
            <span className="text-xs font-medium text-slate-700">Descripción (opcional)</span>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              placeholder="Para qué tipo de proyectos pensaste esta rúbrica."
              className="mt-1 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </label>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <span className="text-xs font-medium text-slate-700">Nota mínima de aprobación:</span>
              <input
                type="number"
                value={notaAprueba}
                onChange={(e) => setNotaAprueba(Math.max(0, Math.min(escala, Number(e.target.value) || 0)))}
                min={0}
                max={escala}
                className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
              <span className="text-xs text-slate-500">/ {escala}</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={defaultActual}
                onChange={(e) => setDefaultActual(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-xs font-medium text-slate-700">Usar como rúbrica por defecto</span>
            </label>
          </div>

          {/* Criterios */}
          <div className="mt-5">
            <div className="flex items-end justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Criterios</h3>
                <p className="text-xs text-slate-500">La suma de los pesos debe dar 100%.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${sumaOk ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  Suma: {sumaPesos}%
                </span>
                <button
                  type="button"
                  onClick={distribuirEquitativo}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  title="Repartir 100% por igual entre todos los criterios"
                >
                  Distribuir parejo
                </button>
              </div>
            </div>

            <ul className="mt-3 space-y-2">
              {criterios.map((c, i) => (
                <li key={c.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-700">{i + 1}</div>
                    <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_120px]">
                      <input
                        value={c.nombre}
                        onChange={(e) => actualizarCriterio(c.id, { nombre: e.target.value })}
                        placeholder="Nombre del criterio (ej. Profundidad de análisis)"
                        maxLength={100}
                        className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={c.peso_pct}
                          onChange={(e) => actualizarCriterio(c.id, { peso_pct: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                          min={0}
                          max={100}
                          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                        />
                        <span className="text-xs text-slate-500">%</span>
                      </div>
                      <textarea
                        value={c.descripcion}
                        onChange={(e) => actualizarCriterio(c.id, { descripcion: e.target.value })}
                        placeholder="Descripción larga (la verá el alumno cuando reciba su nota)"
                        rows={2}
                        maxLength={500}
                        className="col-span-full resize-none rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                      />
                    </div>
                    <button
                      onClick={() => quitarCriterio(c.id)}
                      disabled={criterios.length <= 1}
                      className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Quitar criterio"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={agregarCriterio}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-dashed border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar criterio
            </button>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              onClick={() => setMostrarForm(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={guardar}
              disabled={guardando || !sumaOk || !nombre.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {guardando ? 'Guardando…' : 'Guardar rúbrica'}
            </button>
          </div>
        </section>
      )}

      {/* Listado */}
      <section className="mt-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-700">
            Rúbricas guardadas <span className="font-normal text-slate-500">({rubricas.length})</span>
          </h2>
        </div>

        {cargando ? (
          <p className="mt-4 text-sm text-slate-500">Cargando rúbricas…</p>
        ) : rubricas.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <ScrollText className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-medium text-slate-700">Todavía no tienes rúbricas</p>
            <p className="mt-1 text-xs text-slate-500">
              Crea una para empezar a calificar a tus alumnos. Una sola te alcanza
              para todo el semestre.
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {rubricas.map((r) => (
              <li key={r.id} className={`rounded-xl border bg-white p-4 ${r.default_actual ? 'border-violet-300 bg-violet-50/40' : 'border-slate-200'}`}>
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">{r.nombre}</h3>
                      {r.default_actual && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                          <Star className="h-3 w-3" /> Por defecto
                        </span>
                      )}
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        Escala 0–{r.escala_max}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        Aprueba ≥ {r.nota_aprueba}
                      </span>
                    </div>
                    {r.descripcion && <p className="mt-1 text-xs text-slate-500">{r.descripcion}</p>}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {r.criterios.map((c) => (
                        <span key={c.id} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700" title={c.descripcion}>
                          {c.nombre} <span className="text-slate-500">({c.peso_pct}%)</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {!r.default_actual && (
                      <button
                        onClick={() => marcarDefault(r.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-700 hover:bg-violet-100"
                      >
                        <Star className="h-3 w-3" /> Marcar por defecto
                      </button>
                    )}
                    <button
                      onClick={() => archivar(r.id)}
                      className="inline-flex items-center gap-1 rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                      title="Archivar"
                      aria-label="Archivar rúbrica"
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
