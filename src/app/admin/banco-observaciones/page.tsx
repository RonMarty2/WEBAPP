"use client";

/**
 * /admin/banco-observaciones
 *
 * Panel del banco acumulado de observaciones analizadas por la IA en TODO
 * el SaaS. Muestra:
 *   - KPIs (total / aplicadas / con reserva / rechazadas)
 *   - Top patrones detectados (qué piden los tutores)
 *   - Distribución por servicio y por fase
 *   - Listado filtrable con detalle expandible
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell, { StaggerRow, useCountUp } from "@/components/admin/AdminShell";

interface ObservacionRow {
  id: string;
  proyecto_id: string;
  fase_id: string;
  servicio_id: string | null;
  observacion_textual: string;
  patron_detectado: string | null;
  decision: "aplicar" | "aplicar_con_reserva" | "rechazar";
  analisis_ia: string;
  justificacion_para_tutor: string | null;
  aplicado_at: string | null;
  modelo_ia_usado: string | null;
  duracion_analisis_ms: number | null;
  created_at: string;
}

interface BancoResponse {
  ok: boolean;
  total: number;
  filtrados: number;
  breakdown_decision: { aplicar: number; aplicar_con_reserva: number; rechazar: number };
  total_aplicadas_persistidas: number;
  total_rechazadas: number;
  top_patrones: Array<{ key: string; count: number }>;
  por_servicio: Array<{ key: string; count: number }>;
  por_fase: Array<{ key: string; count: number }>;
  observaciones: ObservacionRow[];
}

const SERVICIO_LABEL: Record<string, string> = {
  "mono-001": "Monografía",
  "tesis-001": "Tesis",
  "proy-grado-001": "Proyecto Grado",
  "proy-prod-001": "PG Producto",
  "proy-serv-001": "PG Servicio",
  "sin-servicio": "Sin servicio",
};

function BancoKpi({ code, value, color, index }: { code: string; value: number; color?: string; index: number }) {
  const counted = useCountUp(value, 700, 150 + index * 60);
  return (
    <StaggerRow index={index}>
      <div className="adm-card adm-card-strong p-4 text-center">
        <div className="adm-label mb-2">{code}</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: color ?? "#edf2fb" }}>{counted}</div>
      </div>
    </StaggerRow>
  );
}

function fmtFecha(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-BO", {
      day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

const DECISION_COLOR: Record<string, { fg: string; bg: string }> = {
  aplicar: { fg: "#a7f3d0", bg: "rgba(16,185,129,0.12)" },
  aplicar_con_reserva: { fg: "#fde68a", bg: "rgba(245,158,11,0.12)" },
  rechazar: { fg: "#fca5a5", bg: "rgba(239,68,68,0.12)" },
};

const DECISION_LABEL: Record<string, string> = {
  aplicar: "APLICAR",
  aplicar_con_reserva: "RESERVA",
  rechazar: "RECHAZAR",
};

export default function BancoObservacionesPage() {
  const [data, setData] = useState<BancoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroDecision, setFiltroDecision] = useState<string>("");
  const [filtroPatron, setFiltroPatron] = useState<string>("");
  const [filtroServicio, setFiltroServicio] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const cargar = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtroDecision) params.set("decision", filtroDecision);
    if (filtroPatron) params.set("patron", filtroPatron);
    if (filtroServicio) params.set("servicio", filtroServicio);
    const qs = params.toString();
    fetch(`/api/admin/banco-observaciones${qs ? `?${qs}` : ""}`)
      .then((r) => r.json())
      .then((d: BancoResponse) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setData(null);
        setLoading(false);
      });
  }, [filtroDecision, filtroPatron, filtroServicio]);

  useEffect(() => { cargar(); }, [cargar]);

  const breakdown = data?.breakdown_decision ?? { aplicar: 0, aplicar_con_reserva: 0, rechazar: 0 };
  const observaciones = data?.observaciones ?? [];

  const limpiarFiltros = () => {
    setFiltroDecision("");
    setFiltroPatron("");
    setFiltroServicio("");
  };

  const hayFiltros = Boolean(filtroDecision || filtroPatron || filtroServicio);

  const topPatrones = useMemo(() => data?.top_patrones ?? [], [data]);
  const porServicio = useMemo(() => data?.por_servicio ?? [], [data]);
  const porFase = useMemo(() => data?.por_fase ?? [], [data]);

  return (
    <AdminShell
      title="Banco de Observaciones Analizadas"
      code="BANCO IA / PERTINENCIA"
      subtitle="Conocimiento acumulado: cada observación de tutor evaluada por la IA con su decisión y justificación."
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <BancoKpi code="TOTAL" value={data?.total ?? 0} index={0} />
        <BancoKpi code="APLICAR" value={breakdown.aplicar} color="#a7f3d0" index={1} />
        <BancoKpi code="RESERVA" value={breakdown.aplicar_con_reserva} color="#fde68a" index={2} />
        <BancoKpi code="RECHAZAR" value={breakdown.rechazar} color="#fca5a5" index={3} />
      </div>

      {/* Top patrones + servicio + fase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="adm-card p-4">
          <div className="adm-label mb-3">TOP PATRONES DETECTADOS</div>
          {topPatrones.length === 0 ? (
            <div className="adm-muted" style={{ fontSize: 11 }}>Aún sin datos</div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {topPatrones.slice(0, 10).map((p, i) => (
                <button
                  key={p.key}
                  onClick={() => setFiltroPatron(filtroPatron === p.key ? "" : p.key)}
                  className="flex items-center justify-between gap-2 text-left"
                  style={{
                    padding: "5px 8px",
                    background: filtroPatron === p.key ? "rgba(0,194,255,0.08)" : "rgba(255,255,255,0.02)",
                    border: filtroPatron === p.key ? "1px solid rgba(0,194,255,0.3)" : "1px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  <span className="adm-muted" style={{ fontSize: 10, width: 14 }}>{i + 1}</span>
                  <span style={{ fontSize: 11, color: "#edf2fb", flex: 1, fontFamily: "ui-monospace, monospace" }}>{p.key}</span>
                  <span style={{ fontSize: 11, color: "#cad5e2", fontWeight: 700 }}>{p.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="adm-card p-4">
          <div className="adm-label mb-3">POR SERVICIO</div>
          {porServicio.length === 0 ? (
            <div className="adm-muted" style={{ fontSize: 11 }}>Sin datos</div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {porServicio.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setFiltroServicio(filtroServicio === s.key ? "" : s.key)}
                  className="flex items-center justify-between gap-2 text-left"
                  style={{
                    padding: "5px 8px",
                    background: filtroServicio === s.key ? "rgba(0,194,255,0.08)" : "rgba(255,255,255,0.02)",
                    border: filtroServicio === s.key ? "1px solid rgba(0,194,255,0.3)" : "1px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 11, color: "#edf2fb", flex: 1 }}>{SERVICIO_LABEL[s.key] ?? s.key}</span>
                  <span style={{ fontSize: 11, color: "#cad5e2", fontWeight: 700 }}>{s.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="adm-card p-4">
          <div className="adm-label mb-3">POR FASE</div>
          {porFase.length === 0 ? (
            <div className="adm-muted" style={{ fontSize: 11 }}>Sin datos</div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {porFase.slice(0, 10).map((f) => (
                <div
                  key={f.key}
                  className="flex items-center justify-between gap-2"
                  style={{ padding: "5px 8px", background: "rgba(255,255,255,0.02)" }}
                >
                  <span style={{ fontSize: 11, color: "#edf2fb", flex: 1, fontFamily: "ui-monospace, monospace" }}>{f.key}</span>
                  <span style={{ fontSize: 11, color: "#cad5e2", fontWeight: 700 }}>{f.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <div className="adm-muted mr-2">decisión:</div>
        {["", "aplicar", "aplicar_con_reserva", "rechazar"].map((d) => (
          <button
            key={d || "todas"}
            onClick={() => setFiltroDecision(d)}
            className={`adm-btn ${filtroDecision === d ? "adm-btn-active" : ""}`}
          >
            {d === "" ? "TODAS" : DECISION_LABEL[d]}
          </button>
        ))}
        {hayFiltros && (
          <button onClick={limpiarFiltros} className="adm-btn ml-2" style={{ color: "#fde68a" }}>
            limpiar
          </button>
        )}
        <button onClick={cargar} className="adm-btn ml-auto">refresh</button>
      </div>

      {loading ? (
        <div className="adm-muted py-12 text-center">{"// cargando banco..."}</div>
      ) : observaciones.length === 0 ? (
        <div className="adm-card p-12 text-center">
          <div className="adm-label mb-2">[VACIO]</div>
          <div className="adm-muted">
            {hayFiltros
              ? "// sin observaciones para el filtro seleccionado"
              : "// aún no hay observaciones analizadas en el sistema"}
          </div>
        </div>
      ) : (
        <div className="adm-card">
          {observaciones.map((obs, index) => {
            const palette = DECISION_COLOR[obs.decision];
            const isOpen = expandedId === obs.id;
            return (
              <StaggerRow key={obs.id} index={Math.min(index, 30)}>
                <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(140,154,176,0.1)" }}>
                  <button
                    onClick={() => setExpandedId(isOpen ? null : obs.id)}
                    className="w-full text-left"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="shrink-0 px-2 py-0.5"
                        style={{
                          background: palette.bg,
                          color: palette.fg,
                          fontSize: 9.5,
                          fontWeight: 700,
                          letterSpacing: 0.5,
                          fontFamily: "ui-monospace, monospace",
                        }}
                      >
                        {DECISION_LABEL[obs.decision]}
                      </span>
                      <span className="adm-muted shrink-0" style={{ fontSize: 10, width: 70, fontFamily: "ui-monospace, monospace" }}>
                        {obs.fase_id}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 12, color: "#edf2fb", lineHeight: 1.45 }}>
                          {obs.observacion_textual.length > 180
                            ? obs.observacion_textual.slice(0, 180) + "…"
                            : obs.observacion_textual}
                        </div>
                        {obs.patron_detectado && (
                          <div className="adm-muted mt-1" style={{ fontSize: 10, fontFamily: "ui-monospace, monospace" }}>
                            patrón: {obs.patron_detectado}
                          </div>
                        )}
                      </div>
                      <span className="adm-muted shrink-0 text-right" style={{ fontSize: 10 }}>
                        {fmtFecha(obs.created_at)}
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="mt-3 ml-1" style={{ paddingLeft: 8, borderLeft: `2px solid ${palette.fg}` }}>
                      <div className="mb-3">
                        <div className="adm-label mb-1">OBSERVACION COMPLETA</div>
                        <div style={{ fontSize: 11.5, color: "#edf2fb", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                          {obs.observacion_textual}
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="adm-label mb-1">ANALISIS IA</div>
                        <div style={{ fontSize: 11.5, color: "#edf2fb", lineHeight: 1.5 }}>{obs.analisis_ia}</div>
                      </div>
                      {obs.justificacion_para_tutor && (
                        <div className="mb-3">
                          <div className="adm-label mb-1">RESPUESTA PARA TUTOR</div>
                          <div
                            style={{
                              fontSize: 11.5,
                              color: "#cad5e2",
                              whiteSpace: "pre-wrap",
                              lineHeight: 1.55,
                              padding: 8,
                              background: "rgba(99,102,241,0.06)",
                              borderLeft: "2px solid #6366F1",
                            }}
                          >
                            {obs.justificacion_para_tutor}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-4 mt-2">
                        <div className="adm-muted" style={{ fontSize: 10 }}>
                          servicio: {obs.servicio_id ?? "—"}
                        </div>
                        <div className="adm-muted" style={{ fontSize: 10 }}>
                          modelo: {obs.modelo_ia_usado ?? "—"}
                        </div>
                        <div className="adm-muted" style={{ fontSize: 10 }}>
                          {obs.duracion_analisis_ms ? `${(obs.duracion_analisis_ms / 1000).toFixed(1)}s` : "—"}
                        </div>
                        <div className="adm-muted" style={{ fontSize: 10 }}>
                          proyecto: <code>{obs.proyecto_id.slice(0, 8)}…</code>
                        </div>
                        <div className="adm-muted" style={{ fontSize: 10 }}>
                          {obs.aplicado_at ? `aplicada: ${fmtFecha(obs.aplicado_at)}` : "no aplicada"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </StaggerRow>
            );
          })}
        </div>
      )}

      <div className="adm-muted mt-6 text-center" style={{ fontSize: 10 }}>
        {data ? `// mostrando ${data.filtrados} de ${data.total} observaciones` : ""}
      </div>
    </AdminShell>
  );
}
