'use client';

import { useMemo, useState } from 'react';

interface Nodo {
  id: string;
  cargo: string;
  reportaA: string | null;
  cantidad: number;
}

const NODOS_INICIALES: Nodo[] = [
  { id: 'n1', cargo: 'Gerente General', reportaA: null, cantidad: 1 },
  { id: 'n2', cargo: 'Encargado de operaciones', reportaA: 'n1', cantidad: 1 },
  { id: 'n3', cargo: 'Encargado de marketing', reportaA: 'n1', cantidad: 1 },
  { id: 'n4', cargo: 'Cajero / Atención', reportaA: 'n2', cantidad: 2 },
];

interface NodoArbol extends Nodo {
  hijos: NodoArbol[];
}

function construirArbol(nodos: Nodo[]): NodoArbol[] {
  const map = new Map<string, NodoArbol>();
  nodos.forEach(n => map.set(n.id, { ...n, hijos: [] }));
  const raices: NodoArbol[] = [];
  map.forEach(n => {
    if (n.reportaA && map.has(n.reportaA)) {
      map.get(n.reportaA)!.hijos.push(n);
    } else {
      raices.push(n);
    }
  });
  return raices;
}

function NodoVista({ nodo, nivel }: { nodo: NodoArbol; nivel: number }) {
  return (
    <div className="space-y-2">
      <div
        className={`inline-block rounded-xl border-2 px-4 py-2 text-sm ${
          nivel === 0
            ? 'border-amber-400 bg-amber-100 font-semibold text-amber-900'
            : nivel === 1
            ? 'border-amber-300 bg-amber-50 text-amber-900'
            : 'border-slate-300 bg-white text-slate-700'
        }`}
      >
        <p className="font-medium">{nodo.cargo}</p>
        {nodo.cantidad > 1 && <p className="text-[10px] text-slate-500">×{nodo.cantidad} personas</p>}
      </div>
      {nodo.hijos.length > 0 && (
        <div className="ml-8 border-l-2 border-amber-200 pl-4">
          <div className="space-y-2">
            {nodo.hijos.map(h => (
              <NodoVista key={h.id} nodo={h} nivel={nivel + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConstructorOrganigrama() {
  const [nodos, setNodos] = useState<Nodo[]>(NODOS_INICIALES);

  const arbol = useMemo(() => construirArbol(nodos), [nodos]);
  const totalPersonas = nodos.reduce((acc, n) => acc + n.cantidad, 0);

  const agregarNodo = () => {
    const id = `n${Date.now()}`;
    const reportaA = nodos.length > 0 ? nodos[0].id : null;
    setNodos([...nodos, { id, cargo: 'Nuevo cargo', reportaA, cantidad: 1 }]);
  };

  const eliminarNodo = (id: string) => {
    setNodos(nodos.filter(n => n.id !== id).map(n => (n.reportaA === id ? { ...n, reportaA: null } : n)));
  };

  const actualizarNodo = (id: string, patch: Partial<Nodo>) => {
    setNodos(nodos.map(n => (n.id === id ? { ...n, ...patch } : n)));
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Constructor de organigrama</h1>
        <p className="mt-2 text-slate-600">
          Define cargos y sus dependencias jerárquicas. El árbol se redibuja en tiempo real conforme
          cambias las relaciones.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Cargos</h2>
            <button
              onClick={agregarNodo}
              className="rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
            >
              + Agregar cargo
            </button>
          </div>

          <div className="space-y-3">
            {nodos.map(n => (
              <div key={n.id} className="space-y-2 rounded-xl border border-slate-200 p-3">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-slate-500">Cargo</label>
                    <input
                      type="text"
                      value={n.cargo}
                      onChange={e => actualizarNodo(n.id, { cargo: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">Personas en este cargo</label>
                    <input
                      type="number"
                      min={1}
                      value={n.cantidad}
                      onChange={e => actualizarNodo(n.id, { cantidad: Math.max(1, Number(e.target.value) || 1) })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-slate-500">Reporta a</label>
                    <select
                      value={n.reportaA ?? ''}
                      onChange={e => actualizarNodo(n.id, { reportaA: e.target.value || null })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">(Nadie — es la raíz)</option>
                      {nodos
                        .filter(o => o.id !== n.id)
                        .map(o => (
                          <option key={o.id} value={o.id}>
                            {o.cargo}
                          </option>
                        ))}
                    </select>
                  </div>
                  <button
                    onClick={() => eliminarNodo(n.id)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            {nodos.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                Aún no hay cargos. Pulsa "Agregar cargo" para empezar.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-amber-900">Vista jerárquica</h2>
            <span className="text-xs text-amber-700">{totalPersonas} personas en total</span>
          </div>

          {arbol.length === 0 ? (
            <p className="text-sm text-slate-500">Agrega cargos para ver el organigrama.</p>
          ) : (
            <div className="space-y-3">
              {arbol.map(r => (
                <NodoVista key={r.id} nodo={r} nivel={0} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Tip rápido</p>
        <p className="mt-1 text-xs">
          Para emprendimientos de menos de 10 personas, un organigrama plano (todos reportando al
          fundador) suele ser más ágil que armar gerencias intermedias. Suma jerarquía cuando crezcas
          a 15+ personas o cuando un mismo jefe tenga más de 7 reportes directos.
        </p>
      </div>
    </div>
  );
}
