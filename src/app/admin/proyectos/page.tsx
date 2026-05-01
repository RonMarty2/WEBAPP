"use client";

import { useState, useEffect } from "react";

interface Proyecto {
  id: string;
  usuario_id: string;
  tema_aprobado: string | null;
  titulo_provisional: string | null;
  estado_fase: number;
  completado: boolean;
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

const FASE_COLORES: Record<number, { bg: string; color: string }> = {
  0: { bg: "rgba(71,85,105,0.3)", color: "#94a3b8" },
  1: { bg: "rgba(6,182,212,0.12)", color: "#67e8f9" },
  2: { bg: "rgba(6,182,212,0.2)", color: "#06b6d4" },
  3: { bg: "rgba(139,92,246,0.15)", color: "#a78bfa" },
  4: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
  5: { bg: "rgba(34,197,94,0.12)", color: "#4ade80" },
};

function FaseBadge({ fase }: { fase: number }) {
  const { bg, color } = FASE_COLORES[fase] ?? FASE_COLORES[0];
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 999, background: bg, color }}>
      {FASE_LABELS[fase]?.split("—")[0].trim() ?? `Fase ${fase}`}
    </span>
  );
}

function ContenidoFase({ label, contenido }: { label: string; contenido: string | null | undefined }) {
  const [abierto, setAbierto] = useState(false);
  if (!contenido) return null;
  const preview = contenido.slice(0, 200).replace(/\n/g, " ");
  return (
    <div style={{ marginBottom: 12, border: "1px solid #1e293b", borderRadius: 8, overflow: "hidden" }}>
      <button
        onClick={() => setAbierto(!abierto)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", background: "rgba(15,23,42,0.8)", border: "none", cursor: "pointer",
          color: "#e2e8f0", fontSize: 13, fontWeight: 600, textAlign: "left",
        }}
      >
        <span>✅ {label}</span>
        <span style={{ color: "#475569", fontSize: 18 }}>{abierto ? "▲" : "▼"}</span>
      </button>
      {!abierto && (
        <div style={{ padding: "8px 14px 10px", fontSize: 12, color: "#64748b", fontStyle: "italic", background: "#020617" }}>
          {preview}…
        </div>
      )}
      {abierto && (
        <div style={{ padding: "14px", background: "#020617", maxHeight: 400, overflowY: "auto" }}>
          <pre style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "monospace", margin: 0 }}>
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
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} />
      <div style={{
        position: "relative", zIndex: 1, marginLeft: "auto", width: "min(95vw, 860px)",
        background: "#0f172a", borderLeft: "1px solid rgba(6,182,212,0.2)",
        display: "flex", flexDirection: "column", height: "100vh",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e293b", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "#06b6d4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                Vista Admin — Proyecto completo
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.4, margin: 0 }}>
                {proyecto.tema_aprobado || proyecto.titulo_provisional || "Sin título"}
              </h2>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>
                ID: {proyecto.id} · Usuario: {proyecto.usuario_id}
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8", padding: "6px 10px", cursor: "pointer", fontSize: 14, flexShrink: 0 }}>
              ✕ Cerrar
            </button>
          </div>

          {/* Tabs de fases */}
          <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
            {fases.map((f, i) => (
              <button
                key={f.num}
                onClick={() => setFaseVista(i)}
                style={{
                  padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: faseVista === i ? "1px solid #06b6d4" : "1px solid #1e293b",
                  background: faseVista === i ? "rgba(6,182,212,0.15)" : "transparent",
                  color: faseVista === i ? "#06b6d4" : "#64748b",
                }}
              >
                ✅ {f.label.split("—")[0].trim()}
              </button>
            ))}
            {fases.length === 0 && (
              <span style={{ fontSize: 13, color: "#475569" }}>Este proyecto aún no tiene contenido generado.</span>
            )}
          </div>
        </div>

        {/* Contenido de la fase seleccionada */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {fases.length > 0 && contenidoActual ? (
            <>
              <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                {fases[faseVista]?.label}
              </div>
              <pre style={{
                fontSize: 13, color: "#cbd5e1", lineHeight: 1.9, whiteSpace: "pre-wrap",
                fontFamily: "'Inter', sans-serif", margin: 0,
              }}>
                {contenidoActual}
              </pre>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#334155" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
              <div>Este proyecto aún no tiene contenido generado.</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid #1e293b", display: "flex", gap: 10, flexShrink: 0 }}>
          <a
            href={`/projects/${proyecto.id}/workspace`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cyan"
            style={{ textDecoration: "none", fontSize: 13, padding: "8px 16px" }}
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

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>📁 Proyectos & Contenido</h1>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>
          Haz clic en "Ver detalle" para ver todo el contenido generado por fase y los prompts usados.
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, fontSize: 13, color: "#f87171", display: "flex", justifyContent: "space-between" }}>
          {error}
          <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }}>×</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total proyectos", value: proyectos.length, color: "#06b6d4" },
          { label: "En proceso", value: proyectos.filter(p => !p.completado).length, color: "#f59e0b" },
          { label: "Completados", value: proyectos.filter(p => p.completado).length, color: "#22c55e" },
          { label: "Avanzados (≥ fase 3)", value: proyectos.filter(p => p.estado_fase >= 3).length, color: "#8b5cf6" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <input
          className="input-dark"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por tema o usuario ID…"
          style={{ flex: 1, minWidth: 200, padding: "8px 12px", fontSize: 13 }}
        />
        <select
          className="input-dark"
          value={filtroFase}
          onChange={e => setFiltroFase(e.target.value === "" ? "" : Number(e.target.value))}
          style={{ width: 180, padding: "8px 12px", fontSize: 13 }}
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
        <div className="card" style={{ textAlign: "center", padding: "48px 24px", borderStyle: "dashed", borderColor: "#334155" }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>📁</div>
          <div style={{ color: "#475569", fontSize: 14 }}>No hay proyectos todavía.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {proyectosFiltrados.map(p => {
            const titulo = p.tema_aprobado || p.titulo_provisional || "Sin título";
            const fasesConContenido = [0,1,2,3,4,5].filter(n => p[`contenido_fase_${n}` as keyof Proyecto]);
            return (
              <div key={p.id} className="card" style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>
                      {titulo}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <FaseBadge fase={p.estado_fase} />
                      {p.completado && <span className="badge badge-green" style={{ fontSize: 10 }}>✓ Completo</span>}
                      <span style={{ fontSize: 11, color: "#334155" }}>
                        {new Date(p.created_at).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                      {fasesConContenido.length > 0 && (
                        <span style={{ fontSize: 11, color: "#4ade80" }}>
                          {fasesConContenido.length} fase(s) con contenido
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "#334155", marginTop: 4, fontFamily: "monospace" }}>
                      Usuario: {p.usuario_id}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => setProyectoDetalle(p.id)}
                      className="btn-purple"
                      style={{ fontSize: 12, padding: "7px 14px" }}
                    >
                      🔍 Ver detalle & fases
                    </button>
                    <a
                      href={`/projects/${p.id}/workspace`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost"
                      style={{ fontSize: 12, padding: "7px 14px", textDecoration: "none" }}
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

      <div style={{ marginTop: 16, fontSize: 12, color: "#334155" }}>
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
