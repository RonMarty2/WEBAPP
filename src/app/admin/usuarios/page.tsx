"use client";

import { useState, useEffect } from "react";

const ETAPA_LABELS: Record<number, string> = {
  0: "Tema",
  1: "Cap. I",
  2: "Cap. II",
  3: "Caps. III-V",
};

const STATUS_COLORS: Record<string, string> = {
  tema: "#06b6d4",
  cap1: "#8b5cf6",
  cap2: "#f59e0b",
  cap3: "#f97316",
  final: "#22c55e",
  completa: "#22c55e",
};

interface CapituloResumen {
  numero: number;
  status: string;
  palabras: number;
  observaciones: string | null;
  updated_at: string;
}

interface MonografiaAdmin {
  id: string;
  user_id: string;
  titulo: string;
  diplomado: string;
  tema: string;
  status: string;
  etapa_actual: number;
  created_at: string;
  updated_at: string;
  capitulos: CapituloResumen[];
  citas_count: number;
  documentos_count: number;
}

export default function AdminUsuariosPage() {
  const [data, setData] = useState<MonografiaAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    fetch("/api/admin/monografias")
      .then((r) => r.json())
      .then((d) => {
        setData(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtrados = data.filter(
    (m) =>
      filtro === "" ||
      m.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
      m.user_id.toLowerCase().includes(filtro.toLowerCase()) ||
      m.diplomado.toLowerCase().includes(filtro.toLowerCase())
  );

  function formatFecha(iso: string) {
    try {
      return new Date(iso).toLocaleString("es-BO", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>👥 Usuarios & Documentos</h1>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>
          Monografías activas en sesión (in-memory). Se pierden al reiniciar el servidor; configura Supabase para persistencia.
        </p>
      </div>

      {/* Stats rápidas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total", value: data.length, color: "#06b6d4" },
          { label: "Con Capítulo I", value: data.filter(m => m.etapa_actual >= 1).length, color: "#8b5cf6" },
          { label: "Con Capítulo II", value: data.filter(m => m.etapa_actual >= 2).length, color: "#f59e0b" },
          { label: "Completadas", value: data.filter(m => m.status === "completa" || m.etapa_actual >= 3).length, color: "#22c55e" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ textAlign: "center", padding: "16px 12px" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtro */}
      <div style={{ marginBottom: 16 }}>
        <input
          className="input-dark"
          placeholder="Buscar por título, usuario o diplomado..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
          <div className="spinner" style={{ margin: "0 auto 12px" }} />
          Cargando...
        </div>
      ) : filtrados.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
          {data.length === 0
            ? "No hay monografías en sesión. Los usuarios deben iniciar el generador primero."
            : "Sin resultados para el filtro aplicado."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtrados.map((m) => (
            <div key={m.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              {/* Fila principal */}
              <div
                style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}
                onClick={() => setExpanded(expanded === m.id ? null : m.id)}
              >
                {/* Status badge */}
                <div style={{
                  width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                  background: STATUS_COLORS[m.status] ?? "#475569",
                }} />

                {/* Info principal */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {m.titulo}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {m.diplomado || "Sin diplomado"} · ID: {m.user_id.substring(0, 16)}...
                  </div>
                </div>

                {/* Etapas completadas */}
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2, 3].map((n) => {
                    const cap = m.capitulos.find((c) => c.numero === n);
                    return (
                      <div
                        key={n}
                        title={ETAPA_LABELS[n]}
                        style={{
                          width: 28, height: 28, borderRadius: 6, display: "flex",
                          alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
                          background: cap ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
                          border: cap ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.08)",
                          color: cap ? "#4ade80" : "#334155",
                        }}
                      >
                        {cap ? "✓" : n}
                      </div>
                    );
                  })}
                </div>

                {/* Fecha + toggle */}
                <div style={{ fontSize: 11, color: "#475569", textAlign: "right", flexShrink: 0 }}>
                  {formatFecha(m.created_at)}
                  <div style={{ color: "#06b6d4", marginTop: 2 }}>{expanded === m.id ? "▲ cerrar" : "▼ ver"}</div>
                </div>
              </div>

              {/* Detalle expandido */}
              {expanded === m.id && (
                <div style={{ borderTop: "1px solid #1e293b", padding: "16px 20px", background: "#080f1d" }}>
                  {/* Tema */}
                  {m.tema && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Tema</div>
                      <div style={{ fontSize: 13, color: "#cbd5e1" }}>{m.tema}</div>
                    </div>
                  )}

                  {/* Capítulos */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Capítulos</div>
                    {m.capitulos.length === 0 ? (
                      <span style={{ fontSize: 13, color: "#475569" }}>Sin capítulos generados aún.</span>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {m.capitulos.map((c) => (
                          <div key={c.numero} style={{
                            display: "flex", alignItems: "center", gap: 12, padding: "8px 12px",
                            background: "rgba(255,255,255,0.03)", borderRadius: 6, border: "1px solid #1e293b",
                          }}>
                            <span className={`badge ${c.status === "approved" ? "badge-green" : "badge-amber"}`} style={{ fontSize: 11 }}>
                              {c.status === "approved" ? "✓ Aprobado" : "Borrador"}
                            </span>
                            <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>
                              {ETAPA_LABELS[c.numero] ?? `Etapa ${c.numero}`}
                            </span>
                            <span style={{ fontSize: 12, color: "#64748b" }}>
                              {c.palabras.toLocaleString()} palabras
                            </span>
                            {c.observaciones && (
                              <span style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic", marginLeft: "auto", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                "{c.observaciones}"
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer stats */}
                  <div style={{ display: "flex", gap: 20, fontSize: 12, color: "#475569" }}>
                    <span>📚 {m.citas_count} citas registradas</span>
                    <span>📄 {m.documentos_count} documentos subidos</span>
                    <span>🕐 Actualizado: {formatFecha(m.updated_at)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
