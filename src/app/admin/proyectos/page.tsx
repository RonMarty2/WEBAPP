"use client";

import { useState, useEffect } from "react";

interface Proyecto {
  id: string;
  usuario_id: string;
  tema_aprobado: string | null;
  titulo_provisional: string | null;
  estado_fase: number;
  completado: boolean;
  oculto_por_usuario?: boolean;
  created_at: string;
  updated_at: string;
  servicios: { id: string; nombre: string } | null;
  contenido_fase_0?: string | null;
  contenido_fase_1?: string | null;
  contenido_fase_2?: string | null;
  contenido_fase_3?: string | null;
  contenido_fase_4?: string | null;
  contenido_fase_5?: string | null;
}

const FASE_LABELS = [
  "Fase 0 — Planteamiento",
  "Cap. I — Prob. & Objetivos",
  "Cap. II — Marco Teórico",
  "Caps. III-V — Desarrollo",
  "Revisión y Compilación",
  "Final",
];

const FASE_TW: Record<number, string> = {
  0: "bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400",
  1: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
  2: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400",
  3: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
  4: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  5: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
};

function FaseBadge({ fase }: { fase: number }) {
  const tw = FASE_TW[fase] ?? FASE_TW[0];
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${tw}`}>
      {FASE_LABELS[fase]?.split("—")[0].trim() ?? `Fase ${fase}`}
    </span>
  );
}

function ContenidoFase({ label, contenido }: { label: string; contenido: string | null | undefined }) {
  const [abierto, setAbierto] = useState(false);
  if (!contenido) return null;
  const preview = contenido.slice(0, 200).replace(/\n/g, " ");
  return (
    <div className="mb-3 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between px-4 py-2.5
                   bg-gray-50 dark:bg-slate-800/80 border-0 cursor-pointer text-left
                   text-gray-700 dark:text-slate-200 text-[13px] font-semibold"
      >
        <span>✅ {label}</span>
        <span className="text-gray-400 dark:text-slate-500 text-[16px]">{abierto ? "▲" : "▼"}</span>
      </button>
      {!abierto && (
        <div className="px-4 py-2 text-[12px] text-gray-400 dark:text-slate-500 italic bg-white dark:bg-slate-900">
          {preview}…
        </div>
      )}
      {abierto && (
        <div className="p-4 bg-white dark:bg-slate-900 max-h-[400px] overflow-y-auto">
          <pre className="text-[12px] text-gray-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-mono m-0">
            {contenido}
          </pre>
        </div>
      )}
    </div>
  );
}

function DetalleProyecto({ proyectoId, onClose }: { proyectoId: string; onClose: () => void }) {
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);
  const [faseVista, setFaseVista] = useState(0);

  useEffect(() => {
    fetch(`/api/admin/proyectos?id=${proyectoId}`)
      .then(r => r.json())
      .then(d => { setProyecto(d.proyecto); setLoading(false); })
      .catch(() => setLoading(false));
  }, [proyectoId]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );
  if (!proyecto) return <div style={{ padding: 24, color: "#f87171" }}>Error al cargar el proyecto.</div>;

  const fases = [
    { num: 0, label: FASE_LABELS[0], contenido: proyecto.contenido_fase_0 },
    { num: 1, label: FASE_LABELS[1], contenido: proyecto.contenido_fase_1 },
    { num: 2, label: FASE_LABELS[2], contenido: proyecto.contenido_fase_2 },
    { num: 3, label: FASE_LABELS[3], contenido: proyecto.contenido_fase_3 },
    { num: 4, label: FASE_LABELS[4], contenido: proyecto.contenido_fase_4 },
    { num: 5, label: FASE_LABELS[5], contenido: proyecto.contenido_fase_5 },
  ].filter(f => f.contenido);

  const contenidoActual = fases[faseVista]?.contenido ?? "";

  return (
    <div className="fixed inset-0 z-[1000] flex">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/60" />

      {/* Panel lateral */}
      <div className="relative z-10 ml-auto flex flex-col h-screen
                      w-[min(95vw,860px)]
                      bg-white dark:bg-slate-950
                      border-l border-gray-200 dark:border-slate-800">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-sky-500 dark:text-sky-400 uppercase tracking-[0.08em] mb-1">
                Vista Admin — Proyecto completo
              </div>
              <h2 className="text-[16px] font-semibold text-gray-900 dark:text-white leading-snug m-0 truncate">
                {proyecto.tema_aprobado || proyecto.titulo_provisional || "Sin título"}
              </h2>
              <div className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 font-mono">
                ID: {proyecto.id} · Usuario: {proyecto.usuario_id}
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 px-3 py-1.5 rounded-lg text-[13px] cursor-pointer
                         bg-transparent border border-gray-200 dark:border-slate-700
                         text-gray-500 dark:text-slate-400
                         hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              ✕ Cerrar
            </button>
          </div>

          {/* Tabs de fases */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {fases.map((f, i) => (
              <button
                key={f.num}
                onClick={() => setFaseVista(i)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition-colors
                  ${
                    faseVista === i
                      ? "bg-black text-white dark:bg-white dark:text-black border border-transparent"
                      : "bg-transparent border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`}
              >
                ✅ {f.label.split("—")[0].trim()}
              </button>
            ))}
            {fases.length === 0 && (
              <span className="text-[13px] text-gray-400 dark:text-slate-500">Este proyecto aún no tiene contenido generado.</span>
            )}
          </div>
        </div>

        {/* Contenido de la fase seleccionada */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {fases.length > 0 && contenidoActual ? (
            <>
              <div className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-[0.08em] mb-3">
                {fases[faseVista]?.label}
              </div>
              <pre className="text-[13px] text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans m-0">
                {contenidoActual}
              </pre>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-slate-700">
              <div className="text-5xl mb-4">📄</div>
              <div className="text-[14px]">Este proyecto aún no tiene contenido generado.</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex gap-3 shrink-0">
          <a
            href={`/projects/${proyecto.id}/workspace`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-medium no-underline
                       bg-black text-white dark:bg-white dark:text-black
                       hover:-translate-y-0.5 hover:shadow-md transition-all duration-150"
          >
            Abrir workspace del estudiante →
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AdminProyectosPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroFase, setFiltroFase] = useState<number | "">("");
  const [proyectoDetalle, setProyectoDetalle] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/proyectos")
      .then(r => r.json())
      .then(d => { setProyectos(d.proyectos ?? []); setLoading(false); })
      .catch(() => { setError("Error al cargar proyectos"); setLoading(false); });
  }, []);

  const proyectosFiltrados = proyectos.filter(p => {
    const titulo = (p.tema_aprobado || p.titulo_provisional || "").toLowerCase();
    const matchBusqueda = !busqueda || titulo.includes(busqueda.toLowerCase()) || p.usuario_id.includes(busqueda);
    const matchFase = filtroFase === "" || p.estado_fase === filtroFase;
    return matchBusqueda && matchFase;
  });

  return (
    <div className="fade-in">

      <div className="mb-8">
        <h1 className="text-[26px] font-bold tracking-tight text-gray-900 dark:text-white mb-1.5">
          Proyectos &amp; Contenido
        </h1>
        <p className="text-[14px] text-gray-400 dark:text-slate-500">
          Haz clic en &quot;Ver detalle&quot; para ver todo el contenido generado por fase y los prompts usados.
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, fontSize: 13, color: "#f87171", display: "flex", justifyContent: "space-between" }}>
          {error}
          <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }}>×</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        {[
          { label: "Total proyectos",   value: proyectos.length,                                  color: "text-blue-500 dark:text-blue-400" },
          { label: "En proceso",        value: proyectos.filter(p => !p.completado).length,        color: "text-amber-500 dark:text-amber-400" },
          { label: "Completados",       value: proyectos.filter(p => p.completado).length,         color: "text-emerald-500 dark:text-emerald-400" },
          { label: "Avanzados (≥ f.3)", value: proyectos.filter(p => p.estado_fase >= 3).length,   color: "text-violet-500 dark:text-violet-400" },
        ].map(s => (
          <div key={s.label} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-5">
            <div className={`text-[28px] font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[12px] text-gray-400 dark:text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          className="flex-1 min-w-[200px] px-3 py-2 rounded-xl text-[13px]
                     bg-white dark:bg-slate-800
                     border border-gray-200 dark:border-slate-700
                     text-gray-900 dark:text-slate-100
                     placeholder-gray-400 dark:placeholder-slate-500
                     focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10
                     focus:border-gray-400 dark:focus:border-slate-500 transition-colors"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por tema o usuario ID…"
        />
        <select
          className="w-[190px] px-3 py-2 rounded-xl text-[13px]
                     bg-white dark:bg-slate-800
                     border border-gray-200 dark:border-slate-700
                     text-gray-900 dark:text-slate-100
                     focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10
                     focus:border-gray-400 dark:focus:border-slate-500 transition-colors"
          value={filtroFase}
          onChange={e => setFiltroFase(e.target.value === "" ? "" : Number(e.target.value))}
        >
          <option value="">Todas las fases</option>
          {FASE_LABELS.map((label, i) => <option key={i} value={i}>{label.split("—")[0].trim()}</option>)}
        </select>
      </div>

      {/* Tabla */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map(i => <div key={i} className="card shimmer" style={{ height: 64 }} />)}
        </div>
      ) : proyectosFiltrados.length === 0 ? (
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-dashed border-white/50 dark:border-white/10 rounded-3xl text-center p-12">
          <div className="text-4xl mb-3 opacity-30">📁</div>
          <div className="text-[14px] text-gray-400 dark:text-slate-500">No hay proyectos todavía.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {proyectosFiltrados.map(p => {
            const titulo = p.tema_aprobado || p.titulo_provisional || "Sin título";
            const fasesConContenido = [0,1,2,3,4,5].filter(n => p[`contenido_fase_${n}` as keyof Proyecto]);
            return (
              <div key={p.id} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-6 transition-all duration-300 hover:shadow-[0_16px_40px_rgba(99,102,241,0.15)] hover:-translate-y-1 hover:border-indigo-500/30">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    {/* Título — forzado visible */}
                    <div className="text-gray-900 dark:text-white font-semibold text-[15px] mb-2 truncate">
                      {titulo}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <FaseBadge fase={p.estado_fase} />
                      {p.completado && <span className="badge badge-green text-[10px]">✓ Completo</span>}
                      {p.oculto_por_usuario && <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 px-2 py-0.5 rounded-full font-semibold border border-red-200 dark:border-red-800/30">Eliminado por usuario</span>}
                      <span className="text-gray-500 dark:text-gray-400 text-[12px]">
                        {new Date(p.created_at).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                      {fasesConContenido.length > 0 && (
                        <span className="text-emerald-500 dark:text-emerald-400 text-[12px] font-medium">
                          {fasesConContenido.length} fase(s) con contenido
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400 dark:text-slate-500 text-[12px] mt-1.5 font-mono">
                      Usuario: {p.usuario_id}
                    </div>
                  </div>

                  {/* Botones Antigravity */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setProyectoDetalle(p.id)}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-medium
                                 bg-black text-white dark:bg-white dark:text-black
                                 hover:-translate-y-0.5 hover:shadow-md
                                 transition-all duration-150 cursor-pointer border-0"
                    >
                      Ver detalle
                    </button>
                    <a
                      href={`/projects/${p.id}/workspace`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[13px] font-medium no-underline
                                 border border-gray-300/50 dark:border-white/10
                                 text-gray-900 dark:text-white
                                 hover:bg-indigo-500 hover:text-white hover:border-indigo-500
                                 transition-all duration-200 shadow-sm"
                    >
                      Workspace →
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 text-[12px] text-gray-400 dark:text-slate-500">
        {proyectosFiltrados.length} de {proyectos.length} proyectos
      </div>

      {/* Panel lateral de detalle */}
      {proyectoDetalle && (
        <DetalleProyecto
          proyectoId={proyectoDetalle}
          onClose={() => setProyectoDetalle(null)}
        />
      )}
    </div>
  );
}
