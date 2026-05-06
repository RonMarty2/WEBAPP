"use client";

import { useEffect, useState } from "react";

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
  "Fase 0 - Planteamiento",
  "Cap. I - Problema y Objetivos",
  "Cap. II - Marco Teorico",
  "Caps. III-V - Desarrollo",
  "Revision y Compilacion",
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
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tw}`}>
      {FASE_LABELS[fase]?.split("-")[0].trim() ?? `Fase ${fase}`}
    </span>
  );
}

function DetalleProyecto({ proyectoId, onClose }: { proyectoId: string; onClose: () => void }) {
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);
  const [faseVista, setFaseVista] = useState(0);

  useEffect(() => {
    fetch(`/api/admin/proyectos?id=${proyectoId}`)
      .then((response) => response.json())
      .then((payload) => {
        setProyecto(payload.proyecto ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [proyectoId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[1000] flex">
        <div onClick={onClose} className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 ml-auto flex h-screen w-[min(95vw,860px)] items-center justify-center border-l border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="spinner h-8 w-8" />
        </div>
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="fixed inset-0 z-[1000] flex">
        <div onClick={onClose} className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 ml-auto flex h-screen w-[min(95vw,860px)] flex-col border-l border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-slate-800">
            <h2 className="m-0 text-[16px] font-semibold text-gray-900 dark:text-white">Detalle del proyecto</h2>
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] text-gray-500 transition-colors hover:bg-gray-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cerrar
            </button>
          </div>
          <div className="p-6 text-[14px] text-red-500">Error al cargar el proyecto.</div>
        </div>
      </div>
    );
  }

  const fases = [
    { num: 0, label: FASE_LABELS[0], contenido: proyecto.contenido_fase_0 },
    { num: 1, label: FASE_LABELS[1], contenido: proyecto.contenido_fase_1 },
    { num: 2, label: FASE_LABELS[2], contenido: proyecto.contenido_fase_2 },
    { num: 3, label: FASE_LABELS[3], contenido: proyecto.contenido_fase_3 },
    { num: 4, label: FASE_LABELS[4], contenido: proyecto.contenido_fase_4 },
    { num: 5, label: FASE_LABELS[5], contenido: proyecto.contenido_fase_5 },
  ].filter((fase) => fase.contenido);

  const contenidoActual = fases[faseVista]?.contenido ?? "";

  return (
    <div className="fixed inset-0 z-[1000] flex">
      <div onClick={onClose} className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 ml-auto flex h-screen w-[min(95vw,860px)] flex-col border-l border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="shrink-0 border-b border-gray-100 px-6 py-5 dark:border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-sky-500 dark:text-sky-400">
                Vista Admin - Proyecto completo
              </div>
              <h2 className="m-0 truncate text-[16px] font-semibold leading-snug text-gray-900 dark:text-white">
                {proyecto.tema_aprobado || proyecto.titulo_provisional || "Sin titulo"}
              </h2>
              <div className="mt-1 font-mono text-[11px] text-gray-400 dark:text-slate-500">
                ID: {proyecto.id} - Usuario: {proyecto.usuario_id}
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] text-gray-500 transition-colors hover:bg-gray-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {fases.map((fase, index) => (
              <button
                key={fase.num}
                onClick={() => setFaseVista(index)}
                className={`rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                  faseVista === index
                    ? "border-transparent bg-black text-white dark:bg-white dark:text-black"
                    : "border-gray-200 bg-transparent text-gray-500 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                {fase.label.split("-")[0].trim()}
              </button>
            ))}
            {fases.length === 0 && (
              <span className="text-[13px] text-gray-400 dark:text-slate-500">
                Este proyecto aun no tiene contenido generado.
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {fases.length > 0 && contenidoActual ? (
            <>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-slate-500">
                {fases[faseVista]?.label}
              </div>
              <pre className="m-0 whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-gray-700 dark:text-slate-300">
                {contenidoActual}
              </pre>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-gray-300 dark:text-slate-700">
              <div className="mb-4 text-5xl">Documento</div>
              <div className="text-[14px]">Este proyecto aun no tiene contenido generado.</div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 gap-3 border-t border-gray-100 px-6 py-4 dark:border-slate-800">
          <a
            href={`/projects/${proyecto.id}/workspace`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2 text-[13px] font-medium text-white no-underline transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-black"
          >
            Abrir workspace del estudiante
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/proyectos")
      .then((response) => response.json())
      .then((payload) => {
        setProyectos(payload.proyectos ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar proyectos");
        setLoading(false);
      });
  }, []);

  const proyectosFiltrados = proyectos.filter((proyecto) => {
    const titulo = (proyecto.tema_aprobado || proyecto.titulo_provisional || "").toLowerCase();
    const matchBusqueda =
      !busqueda ||
      titulo.includes(busqueda.toLowerCase()) ||
      proyecto.usuario_id.toLowerCase().includes(busqueda.toLowerCase());
    const matchFase = filtroFase === "" || proyecto.estado_fase === filtroFase;
    return matchBusqueda && matchFase;
  });

  async function eliminarDefinitivamente(proyecto: Proyecto) {
    const titulo = proyecto.tema_aprobado || proyecto.titulo_provisional || "este proyecto";
    const confirmed = window.confirm(
      `Eliminar definitivamente "${titulo}"? Esta accion no se puede deshacer y tambien lo quitara del respaldo admin.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(proyecto.id);
    setError("");

    try {
      const response = await fetch(`/api/admin/proyectos?id=${proyecto.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error || "No se pudo eliminar definitivamente el proyecto");
      }

      setProyectos((current) => current.filter((item) => item.id !== proyecto.id));

      if (proyectoDetalle === proyecto.id) {
        setProyectoDetalle(null);
      }
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar definitivamente el proyecto";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  }

  async function restaurarProyecto(proyecto: Proyecto) {
    setRestoringId(proyecto.id);
    setError("");

    try {
      const response = await fetch("/api/admin/proyectos", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: proyecto.id,
          action: "restore",
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; proyecto?: Proyecto }
        | null;

      if (!response.ok || !payload?.proyecto) {
        throw new Error(payload?.error || "No se pudo restaurar el proyecto");
      }

      setProyectos((current) =>
        current.map((item) =>
          item.id === proyecto.id
            ? {
                ...item,
                ...payload.proyecto,
                oculto_por_usuario: false,
              }
            : item
        )
      );
    } catch (restoreError) {
      const message =
        restoreError instanceof Error
          ? restoreError.message
          : "No se pudo restaurar el proyecto";
      setError(message);
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="mb-1.5 text-[26px] font-bold tracking-tight text-gray-900 dark:text-white">
          Proyectos y Contenido
        </h1>
        <p className="text-[14px] text-gray-400 dark:text-slate-500">
          Aqui puedes revisar proyectos activos, proyectos ocultados por usuarios y borrar definitivamente solo cuando quieras limpiar pruebas.
        </p>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            borderRadius: 8,
            border: "1px solid rgba(220,38,38,0.3)",
            background: "rgba(220,38,38,0.1)",
            padding: "10px 14px",
            fontSize: 13,
            color: "#f87171",
          }}
        >
          {error}
          <button
            onClick={() => setError("")}
            style={{ cursor: "pointer", border: "none", background: "none", color: "#f87171" }}
          >
            x
          </button>
        </div>
      )}

      <div className="mb-8 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        {[
          { label: "Total proyectos", value: proyectos.length, color: "text-blue-500 dark:text-blue-400" },
          { label: "En proceso", value: proyectos.filter((p) => !p.completado).length, color: "text-amber-500 dark:text-amber-400" },
          { label: "Completados", value: proyectos.filter((p) => p.completado).length, color: "text-emerald-500 dark:text-emerald-400" },
          { label: "Ocultados", value: proyectos.filter((p) => p.oculto_por_usuario).length, color: "text-rose-500 dark:text-rose-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-white/50 bg-white/40 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40"
          >
            <div className={`text-[28px] font-bold ${stat.color}`}>{stat.value}</div>
            <div className="mt-1 text-[12px] text-gray-400 dark:text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <input
          className="min-w-[200px] flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-slate-500 dark:focus:ring-white/10"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar por tema o usuario ID..."
        />
        <select
          className="w-[190px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900 transition-colors focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-white/10"
          value={filtroFase}
          onChange={(event) => setFiltroFase(event.target.value === "" ? "" : Number(event.target.value))}
        >
          <option value="">Todas las fases</option>
          {FASE_LABELS.map((label, index) => (
            <option key={index} value={index}>
              {label.split("-")[0].trim()}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((item) => (
            <div key={item} className="card shimmer" style={{ height: 64 }} />
          ))}
        </div>
      ) : proyectosFiltrados.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/50 bg-white/40 p-12 text-center backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40">
          <div className="mb-3 text-4xl opacity-30">Carpeta</div>
          <div className="text-[14px] text-gray-400 dark:text-slate-500">No hay proyectos todavia.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {proyectosFiltrados.map((proyecto) => {
            const titulo = proyecto.tema_aprobado || proyecto.titulo_provisional || "Sin titulo";
            const fasesConContenido = [0, 1, 2, 3, 4, 5].filter(
              (fase) => proyecto[`contenido_fase_${fase}` as keyof Proyecto]
            );

            return (
              <div
                key={proyecto.id}
                className="rounded-3xl border border-white/50 bg-white/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_16px_40px_rgba(99,102,241,0.15)] dark:border-white/10 dark:bg-slate-900/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 truncate text-[15px] font-semibold text-gray-900 dark:text-white">
                      {titulo}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <FaseBadge fase={proyecto.estado_fase} />
                      {proyecto.completado && <span className="badge badge-green text-[10px]">Completo</span>}
                      {proyecto.oculto_por_usuario && (
                        <span className="rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:border-red-800/30 dark:bg-red-900/40 dark:text-red-400">
                          Eliminado por usuario
                        </span>
                      )}
                      <span className="text-[12px] text-gray-500 dark:text-gray-400">
                        {new Date(proyecto.created_at).toLocaleDateString("es-BO", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {fasesConContenido.length > 0 && (
                        <span className="text-[12px] font-medium text-emerald-500 dark:text-emerald-400">
                          {fasesConContenido.length} fase(s) con contenido
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 font-mono text-[12px] text-gray-400 dark:text-slate-500">
                      Usuario: {proyecto.usuario_id}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      onClick={() => setProyectoDetalle(proyecto.id)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-black px-5 py-2 text-[13px] font-medium text-white transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-black"
                    >
                      Ver detalle
                    </button>
                    <a
                      href={`/projects/${proyecto.id}/workspace`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-300/50 px-5 py-2.5 text-[13px] font-medium text-gray-900 no-underline shadow-sm transition-all duration-200 hover:border-indigo-500 hover:bg-indigo-500 hover:text-white dark:border-white/10 dark:text-white"
                    >
                      Workspace
                    </a>
                    {proyecto.oculto_por_usuario && (
                      <button
                        onClick={() => restaurarProyecto(proyecto)}
                        disabled={restoringId === proyecto.id}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2 text-[13px] font-medium text-emerald-600 transition-all duration-150 hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white disabled:cursor-wait disabled:opacity-60 dark:border-emerald-400/20 dark:bg-emerald-900/30 dark:text-emerald-300"
                      >
                        {restoringId === proyecto.id ? "Restaurando..." : "Restaurar"}
                      </button>
                    )}
                    <button
                      onClick={() => eliminarDefinitivamente(proyecto)}
                      disabled={deletingId === proyecto.id}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-5 py-2 text-[13px] font-medium text-rose-600 transition-all duration-150 hover:-translate-y-0.5 hover:border-rose-500 hover:bg-rose-500 hover:text-white disabled:cursor-wait disabled:opacity-60 dark:border-rose-400/20 dark:bg-rose-900/30 dark:text-rose-300"
                    >
                      {deletingId === proyecto.id ? "Eliminando..." : "Eliminar definitivo"}
                    </button>
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

      {proyectoDetalle && (
        <DetalleProyecto proyectoId={proyectoDetalle} onClose={() => setProyectoDetalle(null)} />
      )}
    </div>
  );
}
