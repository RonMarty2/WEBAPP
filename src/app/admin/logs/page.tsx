"use client";

import { useState, useEffect, useCallback } from "react";

interface LogEntry {
  id: string;
  timestamp: string;
  nivel: "critical" | "warning" | "info";
  etapa: number | string;
  monografia_id?: string;
  mensaje: string;
  detalle?: string;
}

const NIVEL_COLORS: Record<string, string> = {
  critical: "#f87171",
  warning: "#f59e0b",
  info: "#94a3b8",
};

const NIVEL_BG: Record<string, string> = {
  critical: "rgba(248,113,113,0.08)",
  warning: "rgba(245,158,11,0.08)",
  info: "rgba(148,163,184,0.05)",
};

const ETAPA_LABELS: Record<string | number, string> = {
  0: "E0 Tema", 1: "E1 Cap.I", 2: "E2 Cap.II", 3: "E3 Caps.III-V",
  final: "Final", compilar: "Compilar",
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [filtroNivel, setFiltroNivel] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const cargarLogs = useCallback(() => {
    setLoading(true);
    const url = `/api/admin/logs${filtroNivel ? `?nivel=${filtroNivel}` : ""}`;
    fetch(url)
      .then(r => r.json())
      .then(d => { setLogs(d.logs ?? []); setTotal(d.total ?? 0); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filtroNivel]);

  useEffect(() => { cargarLogs(); }, [cargarLogs]);

  async function limpiarLogs() {
    if (!confirm("¿Limpiar todos los logs?")) return;
    setClearing(true);
    await fetch("/api/admin/logs", { method: "DELETE" });
    setLogs([]); setTotal(0); setClearing(false);
  }

  function formatFecha(iso: string) {
    try {
      return new Date(iso).toLocaleString("es-BO", {
        day: "2-digit", month: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });
    } catch { return iso; }
  }

  const criticos = logs.filter(l => l.nivel === "critical").length;
  const advertencias = logs.filter(l => l.nivel === "warning").length;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>🪵 Logs de Errores</h1>
        <p style={{ color: "#94a3b8", fontSize: 13 }}>
          Errores de generación registrados en sesión. Se reinician al reiniciar el servidor.
        </p>
      </div>

      {/* Resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Total logs", value: total, color: "#94a3b8" },
          { label: "Críticos", value: criticos, color: "#f87171" },
          { label: "Advertencias", value: advertencias, color: "#f59e0b" },
          { label: "Info", value: total - criticos - advertencias, color: "#64748b" },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: "center", padding: "14px 10px" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controles */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["", "critical", "warning", "info"].map(n => (
            <button
              key={n}
              onClick={() => setFiltroNivel(n)}
              style={{
                padding: "6px 12px", borderRadius: 6, border: "1px solid",
                fontSize: 12, cursor: "pointer",
                background: filtroNivel === n ? "rgba(6,182,212,0.15)" : "transparent",
                borderColor: filtroNivel === n ? "#06b6d4" : "#1e293b",
                color: filtroNivel === n ? "#06b6d4" : "#64748b",
              }}
            >
              {n === "" ? "Todos" : n.charAt(0).toUpperCase() + n.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={cargarLogs} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #1e293b", background: "transparent", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>
          ↻ Actualizar
        </button>
        <button
          onClick={limpiarLogs}
          disabled={clearing || total === 0}
          style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.08)", color: "#f87171", fontSize: 12, cursor: "pointer", marginLeft: "auto", opacity: total === 0 ? 0.5 : 1 }}
        >
          🗑 Limpiar logs
        </button>
      </div>

      {/* Lista de logs */}
      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
          <div className="spinner" style={{ margin: "0 auto 12px" }} />
          Cargando...
        </div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48, color: "#475569" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
          {total === 0 ? "Sin errores registrados. El sistema funciona correctamente." : "Sin resultados para el filtro seleccionado."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {logs.map(log => (
            <div
              key={log.id}
              style={{
                background: NIVEL_BG[log.nivel] ?? "rgba(255,255,255,0.03)",
                border: `1px solid ${NIVEL_COLORS[log.nivel] ?? "#1e293b"}22`,
                borderLeft: `3px solid ${NIVEL_COLORS[log.nivel] ?? "#1e293b"}`,
                borderRadius: "0 8px 8px 0",
                padding: "12px 16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: log.detalle ? 6 : 0, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: NIVEL_COLORS[log.nivel], textTransform: "uppercase" }}>
                  {log.nivel}
                </span>
                <span style={{
                  fontSize: 11, background: "rgba(255,255,255,0.05)", border: "1px solid #1e293b",
                  borderRadius: 4, padding: "1px 6px", color: "#64748b",
                }}>
                  {ETAPA_LABELS[log.etapa] ?? `Etapa ${log.etapa}`}
                </span>
                <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500, flex: 1 }}>{log.mensaje}</span>
                <span style={{ fontSize: 11, color: "#334155", flexShrink: 0 }}>{formatFecha(log.timestamp)}</span>
              </div>
              {log.detalle && (
                <div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace", paddingLeft: 4, marginTop: 4 }}>
                  {log.detalle}
                </div>
              )}
              {log.monografia_id && (
                <div style={{ fontSize: 11, color: "#334155", marginTop: 4 }}>
                  ID: {log.monografia_id}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
