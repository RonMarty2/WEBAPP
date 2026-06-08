'use client';

/**
 * Página donde el alumno pega el código que le dio su docente para
 * vincularse. También muestra la lista de docentes a los que ya está
 * vinculado y permite desvincularse (eliminando el vínculo).
 *
 * Cualquier usuario logueado puede llamar (un docente también puede
 * ser alumno de otro). Si no hay sesión, redirige al login.
 *
 * Wave 1 del panel docente.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowLeft, CheckCircle2, Trash2, KeyRound } from 'lucide-react';

interface DocenteVinculado {
  id: string;
  docente_id: string;
  docente_nombre: string;
  codigo_usado: string;
  vinculado_en: string;
}

export default function UnirseDocente() {
  const router = useRouter();
  const [codigoInput, setCodigoInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [docentes, setDocentes] = useState<DocenteVinculado[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarDocentes = () => {
    fetch('/api/alumno/docentes', { credentials: 'include' })
      .then((r) => {
        if (r.status === 401) { router.replace('/login'); return null; }
        return r.json();
      })
      .then((d) => { if (d) setDocentes(d.docentes ?? []); })
      .catch(() => {})
      .finally(() => setCargando(false));
  };

  useEffect(cargarDocentes, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        cargarDocentes();
      } else {
        setMensaje({ tipo: 'error', texto: data.error || 'No se pudo vincular' });
      }
    } finally {
      setEnviando(false);
    }
  };

  const desvincular = async (vinculoId: string) => {
    if (!window.confirm('¿Desvincularte de este docente? Tu docente ya no verá tus avances. Puedes volver a vincularte con el mismo código si sigue activo.')) return;
    // Reusamos el endpoint del docente con DELETE: pero solo el docente puede
    // borrar su lado. Para que el alumno se desvincule llamamos al mismo
    // endpoint pero el server valida que sea el alumno del vínculo.
    // → Por simplicidad de la Wave 1, el alumno NO puede desvincularse
    //   desde acá (necesitaríamos un endpoint extra). Le decimos que lo
    //   pida al docente, o que use el botón "Archivar" del docente.
    setMensaje({
      tipo: 'error',
      texto: 'Por ahora, pide al docente que te archive de su lista. En la próxima entrega podrás desvincularte tú mismo.',
    });
    setTimeout(() => setMensaje(null), 5000);
  };

  return (
    <div className="mx-auto max-w-2xl p-6 pb-10">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Inicio
      </Link>

      <header className="mt-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <KeyRound className="h-5 w-5" />
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
        <label className="text-sm font-medium text-slate-700">Código del docente</label>
        <input
          autoFocus
          value={codigoInput}
          onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
          placeholder="EJ. K7M2N4"
          maxLength={12}
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
            {mensaje.tipo === 'ok' && <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />}
            <span>{mensaje.texto}</span>
          </div>
        )}
      </form>

      <section className="mt-8">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-slate-500" />
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
            {docentes.map((d) => (
              <li key={d.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
                  {d.docente_nombre.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{d.docente_nombre}</p>
                  <p className="text-[11px] text-slate-400">
                    Vinculado {new Date(d.vinculado_en).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })} · código {d.codigo_usado}
                  </p>
                </div>
                <button
                  onClick={() => desvincular(d.id)}
                  className="inline-flex items-center gap-1 rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                  title="Desvincularme"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
