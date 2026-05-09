"use client";

import { useState, useEffect } from "react";

interface Observacion {
  id: string;
  texto: string;
  capitulo_afectado?: string;
  estado: "pendiente" | "atendida" | "descartada";
  tipo?: 1 | 2 | 3;
  respuesta_ia?: string;
  notas_usuario?: string;
  created_at: string;
  atendida_at?: string;
}

interface Props {
  proyectoId: string;
  phaseDefs?: { id: string; label: string; short: string }[];
}

const ESTADO_META: Record<Observacion["estado"], { label: string; color: string; bg: string }> = {
  pendiente:   { label: "PENDIENTE",   color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  atendida:    { label: "ATENDIDA",    color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  descartada:  { label: "DESCARTADA", color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
};

const TIPO_META: Record<1 | 2 | 3, { label: string; color: string; bg: string; desc: string }> = {
  1: { label: "TRIVIAL", color: "#10b981", bg: "rgba(16,185,129,0.1)", desc: "Aclaración puntual" },
  2: { label: "FORMA", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", desc: "Redacción/formato" },
  3: { label: "FONDO", color: "#ef4444", bg: "rgba(239,68,68,0.1)", desc: "Estructura/contenido" },
};

export default function ObservacionesTribunal({ proyectoId, phaseDefs = [] }: Props) {
  const [obs, setObs] = useState<Observacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [atendiendo, setAtendiendo] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [nuevoTexto, setNuevoTexto] = useState("");
  const [nuevoCapitulo, setNuevoCapitulo] = useState("");
  const [creando, setCreando] = useState(false);
  const [msg, setMsg] = useState("");

  // Filter
  const [filtro, setFiltro] = useState<"todas" | Observacion["estado"]>("todas");

  const base = `/api/projects/${proyectoId}/observaciones`;

  useEffect(() => {
    fetch(base)
      .then(r => r.json())
      .then(d => setObs(d.observaciones ?? []))
      .finally(() => setLoading(false));
  }, [base]);

  const filtered = filtro === "todas" ? obs : obs.filter(o => o.estado === filtro);
  const pendientes = obs.filter(o => o.estado === "pendiente").length;

  async function crear() {
    if (!nuevoTexto.trim()) return;
    setCreando(true);
    setMsg("");
    try {
      const res = await fetch(base, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: nuevoTexto, capitulo_afectado: nuevoCapitulo || undefined }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setObs(prev => [d.observacion, ...prev]);
      setNuevoTexto("");
      setNuevoCapitulo("");
      setShowForm(false);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setCreando(false);
    }
  }

  async function atender(o: Observacion) {
    setAtendiendo(o.id);
    setMsg("");
    try {
      const res = await fetch(`${base}/${o.id}/atender`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setObs(prev => prev.map(x => x.id === o.id ? { ...x, respuesta_ia: d.respuesta_ia } : x));
      setExpanded(o.id);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setAtendiendo(null);
    }
  }

  async function cambiarEstado(o: Observacion, estado: Observacion["estado"]) {
    try {
      const res = await fetch(`${base}/${o.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setObs(prev => prev.map(x => x.id === o.id ? d.observacion : x));
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  async function eliminar(o: Observacion) {
    setEliminando(o.id);
    try {
      const res = await fetch(`${base}/${o.id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setObs(prev => prev.filter(x => x.id !== o.id));
      if (expanded === o.id) setExpanded(null);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setEliminando(null);
    }
  }

  const phaseLabel = (id?: string) => {
    if (!id) return null;
    return phaseDefs.find(p => p.id === id)?.label ?? id;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(148,163,184,0.18)", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Observaciones del Tribunal
            </div>
            {pendientes > 0 && (
              <div style={{ fontSize: 10, color: "#fbbf24", marginTop: 2 }}>
                {pendientes} pendiente{pendientes !== 1 ? "s" : ""} por atender
              </div>
            )}
          </div>
          <button
            onClick={() => { setShowForm(v => !v); setMsg(""); }}
            className="btn-ghost"
            style={{ fontSize: 11, padding: "5px 10px" }}
          >
            {showForm ? "✕ Cancelar" : "+ Agregar"}
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: 4 }}>
          {(["todas", "pendiente", "atendida", "descartada"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{
                fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, cursor: "pointer",
                border: filtro === f ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: filtro === f ? "rgba(37,99,235,0.15)" : "transparent",
                color: filtro === f ? "var(--accent)" : "var(--fg-muted)",
                textTransform: "uppercase",
              }}
            >
              {f === "todas" ? "Todas" : ESTADO_META[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Form nueva observación */}
      {showForm && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(148,163,184,0.18)", flexShrink: 0, background: "rgba(245,158,11,0.04)" }}>
          <textarea
            value={nuevoTexto}
            onChange={e => setNuevoTexto(e.target.value)}
            placeholder="Escribe la observación exacta del tribunal…"
            rows={3}
            style={{
              width: "100%", background: "rgba(15,23,42,0.06)", border: "1px solid rgba(148,163,184,0.3)",
              borderRadius: 8, padding: "8px 10px", color: "var(--fg-primary)", fontSize: 12,
              resize: "vertical", boxSizing: "border-box", marginBottom: 8,
            }}
          />
          {phaseDefs.length > 0 && (
            <select
              value={nuevoCapitulo}
              onChange={e => setNuevoCapitulo(e.target.value)}
              style={{
                width: "100%", background: "rgba(15,23,42,0.06)", border: "1px solid rgba(148,163,184,0.3)",
                borderRadius: 8, padding: "7px 10px", color: "var(--fg-primary)", fontSize: 12,
                marginBottom: 8, boxSizing: "border-box",
              }}
            >
              <option value="">Capítulo afectado (opcional)</option>
              {phaseDefs.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          )}
          <button
            onClick={crear}
            disabled={creando || !nuevoTexto.trim()}
            className="btn-ghost"
            style={{ width: "100%", justifyContent: "center", fontSize: 12, padding: "8px", opacity: nuevoTexto.trim() ? 1 : 0.5 }}
          >
            {creando ? "Guardando…" : "Guardar observación"}
          </button>
        </div>
      )}

      {msg && (
        <div style={{ margin: "8px 16px", padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: 12 }}>
          {msg}
        </div>
      )}

      {/* Lista */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
        {loading ? (
          <div style={{ fontSize: 12, color: "var(--fg-muted)", padding: "16px 4px" }}>Cargando…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 16px", color: "var(--fg-muted)", fontSize: 12 }}>
            {filtro === "todas"
              ? "No hay observaciones. Agrégalas con el botón de arriba."
              : `No hay observaciones ${filtro === "pendiente" ? "pendientes" : filtro === "atendida" ? "atendidas" : "descartadas"}.`}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(o => {
              const meta = ESTADO_META[o.estado];
              const isOpen = expanded === o.id;
              const isLoadingIA = atendiendo === o.id;
              const isDeleting = eliminando === o.id;

              return (
                <div
                  key={o.id}
                  style={{
                    borderRadius: 10,
                    border: `1px solid ${isOpen ? "rgba(245,158,11,0.35)" : "rgba(148,163,184,0.15)"}`,
                    background: isOpen ? "rgba(245,158,11,0.04)" : "rgba(15,23,42,0.03)",
                    overflow: "hidden",
                    transition: "border 0.15s",
                  }}
                >
                  {/* Card header */}
                  <div
                    onClick={() => setExpanded(isOpen ? null : o.id)}
                    style={{ padding: "10px 12px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ fontSize: 12, color: "var(--fg-primary)", lineHeight: 1.4, flex: 1 }}>
                        {o.texto.length > 100 && !isOpen ? `${o.texto.slice(0, 100)}…` : o.texto}
                      </div>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {o.tipo && (
                          <span title={TIPO_META[o.tipo].desc} style={{
                            fontSize: 8, fontWeight: 900, padding: "2px 6px", borderRadius: 4,
                            background: TIPO_META[o.tipo].bg, color: TIPO_META[o.tipo].color,
                          }}>
                            {TIPO_META[o.tipo].label}
                          </span>
                        )}
                        <span style={{
                          fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4,
                          background: meta.bg, color: meta.color,
                        }}>
                          {meta.label}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, fontSize: 10, color: "var(--fg-muted)" }}>
                      {phaseLabel(o.capitulo_afectado) && <span>Cap.: {phaseLabel(o.capitulo_afectado)}</span>}
                      {o.tipo && <span style={{ color: TIPO_META[o.tipo].color }}>• {TIPO_META[o.tipo].desc}</span>}
                    </div>
                    {o.respuesta_ia && (
                      <div style={{ fontSize: 10, color: "#4ade80" }}>✓ IA generó una sugerencia</div>
                    )}
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ padding: "0 12px 12px", borderTop: "1px solid rgba(148,163,184,0.12)" }}>
                      {/* AI response */}
                      {o.respuesta_ia ? (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#4ade80", marginBottom: 5, textTransform: "uppercase" }}>
                            Sugerencia de la IA
                          </div>
                          <div style={{
                            fontSize: 12, color: "var(--fg-primary)", lineHeight: 1.6,
                            background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.15)",
                            borderRadius: 8, padding: "10px 12px", whiteSpace: "pre-wrap",
                          }}>
                            {o.respuesta_ia}
                          </div>
                        </div>
                      ) : o.estado === "pendiente" && (
                        <button
                          onClick={() => atender(o)}
                          disabled={isLoadingIA}
                          className="btn-ghost"
                          style={{ marginTop: 10, width: "100%", justifyContent: "center", fontSize: 12, padding: "8px", color: "#60a5fa", borderColor: "rgba(96,165,250,0.4)" }}
                        >
                          {isLoadingIA
                            ? <><div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /><span>Analizando…</span></>
                            : "⚡ Atender con IA"}
                        </button>
                      )}

                      {/* Estado actions */}
                      {o.estado === "pendiente" && (
                        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                          <button
                            onClick={() => cambiarEstado(o, "atendida")}
                            className="btn-ghost"
                            style={{ flex: 1, justifyContent: "center", fontSize: 11, padding: "6px", color: "#4ade80", borderColor: "rgba(74,222,128,0.35)" }}
                          >
                            ✓ Marcar atendida
                          </button>
                          <button
                            onClick={() => cambiarEstado(o, "descartada")}
                            className="btn-ghost"
                            style={{ flex: 1, justifyContent: "center", fontSize: 11, padding: "6px", color: "#94a3b8" }}
                          >
                            — Descartar
                          </button>
                        </div>
                      )}

                      {o.estado !== "pendiente" && (
                        <button
                          onClick={() => cambiarEstado(o, "pendiente")}
                          className="btn-ghost"
                          style={{ marginTop: 8, width: "100%", justifyContent: "center", fontSize: 11, padding: "6px" }}
                        >
                          ↩ Reabrir
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => eliminar(o)}
                        disabled={isDeleting}
                        style={{
                          marginTop: 8, width: "100%", background: "none", border: "none",
                          cursor: "pointer", fontSize: 10, color: "rgba(248,113,113,0.5)", padding: "4px",
                        }}
                      >
                        {isDeleting ? "Eliminando…" : "Eliminar observación"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary footer */}
      {obs.length > 0 && (
        <div style={{ padding: "8px 16px", borderTop: "1px solid rgba(148,163,184,0.12)", fontSize: 10, color: "var(--fg-muted)", flexShrink: 0, display: "flex", gap: 10 }}>
          <span>{obs.filter(o => o.estado === "pendiente").length} pendiente{obs.filter(o => o.estado === "pendiente").length !== 1 ? "s" : ""}</span>
          <span>{obs.filter(o => o.estado === "atendida").length} atendida{obs.filter(o => o.estado === "atendida").length !== 1 ? "s" : ""}</span>
          <span>{obs.filter(o => o.estado === "descartada").length} descartada{obs.filter(o => o.estado === "descartada").length !== 1 ? "s" : ""}</span>
        </div>
      )}
    </div>
  );
}
