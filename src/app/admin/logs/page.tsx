"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell, { StaggerRow, useCountUp } from "@/components/admin/AdminShell";

interface LogEntry {
  id: string; timestamp: string; nivel: "critical" | "warning" | "info";
  etapa: number | string; monografia_id?: string; mensaje: string; detalle?: string;
}

const NIVEL_CODE: Record<string, string> = { critical: "CRIT", warning: "WARN", info: "INFO" };

const ETAPA_LABELS: Record<string | number, string> = {
  0: "E0", 1: "E1", 2: "E2", 3: "E3", final: "FIN", compilar: "COMP",
};

function formatFecha(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-BO", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  } catch { return iso; }
}

function LogKpi({ code, value, index }: { code: string; value: number; index: number }) {
  const counted = useCountUp(value, 700, 150 + index * 60);
  return (
    <StaggerRow index={index}>
      <div className="adm-card p-4 text-center">
        <div className="adm-label mb-2">{code}</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#000" }}>{counted}</div>
      </div>
    </StaggerRow>
  );
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [filtroNivel, setFiltroNivel] = useState("");
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const cargarLogs = useCallback(() => {
    setLoading(true);
    const url = `/api/admin/logs${filtroNivel ? `?nivel=${filtroNivel}` : ""}`;
    fetch(url).then(r => r.json())
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

  const criticos     = logs.filter(l => l.nivel === "critical").length;
  const advertencias = logs.filter(l => l.nivel === "warning").length;
  const infos        = total - criticos - advertencias;

  return (
    <AdminShell title="Logs de Errores" code="LOGS — monitor de errores" subtitle="Errores de generación registrados en sesión. Se reinician al reiniciar el servidor.">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <LogKpi code="TOTAL" value={total}       index={0} />
        <LogKpi code="CRIT"  value={criticos}    index={1} />
        <LogKpi code="WARN"  value={advertencias} index={2} />
        <LogKpi code="INFO"  value={infos}        index={3} />
      </div>

      {/* Controles */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <div className="adm-muted mr-2">// filtro:</div>
        {["", "critical", "warning", "info"].map(n => (
          <button
            key={n}
            onClick={() => setFiltroNivel(n)}
            className="adm-btn"
            style={{ fontWeight: filtroNivel === n ? 700 : 400, background: filtroNivel === n ? "#000" : "transparent", color: filtroNivel === n ? "#fff" : "#666" }}
          >
            {n === "" ? "TODOS" : NIVEL_CODE[n]}
          </button>
        ))}
        <button onClick={cargarLogs} className="adm-btn ml-2">↻ refresh</button>
        <button
          onClick={limpiarLogs}
          disabled={clearing || total === 0}
          className="adm-btn adm-btn-danger ml-auto"
          style={{ opacity: total === 0 ? 0.4 : 1 }}
        >
          [DELETE] limpiar_logs
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="adm-muted py-12 text-center">// cargando logs...</div>
      ) : logs.length === 0 ? (
        <div className="adm-card p-12 text-center">
          <div className="adm-label mb-2">[OK]</div>
          <div className="adm-muted">
            {total === 0 ? "// sin errores registrados — sistema operando normalmente" : "// sin resultados para el filtro seleccionado"}
          </div>
        </div>
      ) : (
        <div className="adm-card">
          {logs.map((log, i) => (
            <StaggerRow key={log.id} index={i}>
              <div className="adm-row px-4" style={{ alignItems: "flex-start" }}>
                <span className="adm-label w-10 shrink-0 pt-0.5"
                  style={{ color: log.nivel === "critical" ? "#c00" : log.nivel === "warning" ? "#888" : "#999" }}>
                  [{NIVEL_CODE[log.nivel]}]
                </span>
                <span className="adm-label w-8 shrink-0 pt-0.5">{ETAPA_LABELS[log.etapa] ?? `E${log.etapa}`}</span>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 12, color: "#000", fontWeight: 500 }}>{log.mensaje}</div>
                  {log.detalle && (
                    <div className="adm-muted mt-1 font-mono" style={{ fontSize: 11 }}>{log.detalle}</div>
                  )}
                  {log.monografia_id && (
                    <div className="adm-muted mt-0.5" style={{ fontSize: 10 }}>id: {log.monografia_id}</div>
                  )}
                </div>
                <span className="adm-muted shrink-0 text-right" style={{ fontSize: 10 }}>{formatFecha(log.timestamp)}</span>
              </div>
            </StaggerRow>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
