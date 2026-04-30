"use client";

import { useState, useEffect } from "react";

interface PromptStat {
  etapa: number;
  nombre: string;
  uso_total: number;
  uso_este_mes: number;
  tiempo_promedio_seg: number;
}

interface TemaPopular {
  tema: string;
  cantidad: number;
}

interface EtapaCambios {
  etapa: number;
  cambios_promedio: number;
}

interface Stats {
  total_monografias_generadas: number;
  completadas: number;
  este_mes: number;
  promedio_tiempo_generacion_seg: number;
  temas_mas_populares: TemaPopular[];
  prompts: PromptStat[];
  etapas_con_mas_cambios: EtapaCambios[];
}

const ETAPA_LABELS: Record<number, string> = {
  0: "Etapa 0",
  1: "Cap. I",
  2: "Cap. II",
  3: "Caps. III-V",
};

export default function EstadisticasPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/estadisticas")
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center", color: "#94a3b8" }}>
          <div className="spinner" style={{ margin: "0 auto 12px" }} />
          Cargando estadísticas...
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="fade-in">
        <div className="card" style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
          No se pudieron cargar las estadísticas.
        </div>
      </div>
    );
  }

  const tasaCompletacion = stats.total_monografias_generadas > 0
    ? Math.round((stats.completadas / stats.total_monografias_generadas) * 100)
    : 0;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>📈 Estadísticas</h1>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>
          Métricas en tiempo real de uso del sistema (sesión actual).
        </p>
      </div>

      {/* KPIs principales */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Total generadas", value: stats.total_monografias_generadas, color: "#06b6d4", icon: "📄" },
          { label: "Completadas", value: stats.completadas, color: "#22c55e", icon: "✅" },
          { label: "Este mes", value: stats.este_mes, color: "#8b5cf6", icon: "📅" },
          { label: "Tasa completación", value: `${tasaCompletacion}%`, color: tasaCompletacion >= 50 ? "#4ade80" : "#f59e0b", icon: "🎯" },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: "center", padding: "16px 12px" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Uso por etapa */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
            Uso por Etapa
          </div>
          {stats.prompts.length === 0 || stats.prompts.every(p => p.uso_total === 0) ? (
            <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
              Sin datos aún. Las métricas se registran con cada generación.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {stats.prompts.map(p => {
                const maxUso = Math.max(...stats.prompts.map(x => x.uso_total), 1);
                const pct = Math.round((p.uso_total / maxUso) * 100);
                return (
                  <div key={p.etapa}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "#e2e8f0", fontWeight: 500 }}>{p.nombre}</span>
                      <span style={{ color: "#94a3b8" }}>{p.uso_total} usos · {p.tiempo_promedio_seg}s avg</span>
                    </div>
                    <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#06b6d4", borderRadius: 3, transition: "width 0.5s" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{p.uso_este_mes} este mes</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Etapas con más cambios */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
            Revisiones por Etapa (Chat)
          </div>
          {stats.etapas_con_mas_cambios.every(e => e.cambios_promedio === 0) ? (
            <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
              Sin revisiones registradas aún.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {stats.etapas_con_mas_cambios.map(e => (
                <div key={e.etapa} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)",
                    fontSize: 12, fontWeight: 700, color: "#a78bfa", flexShrink: 0,
                  }}>
                    {ETAPA_LABELS[e.etapa]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#e2e8f0" }}>
                      {e.cambios_promedio} revisiones promedio
                    </div>
                    <div style={{ fontSize: 11, color: "#475569" }}>por monografía en esta etapa</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Temas populares */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
          Temas más frecuentes
        </div>
        {stats.temas_mas_populares.length === 0 ? (
          <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
            Sin monografías registradas aún.
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {stats.temas_mas_populares.map((t, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "6px 12px",
                background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)",
                borderRadius: 20, fontSize: 13,
              }}>
                <span style={{ color: "#67e8f9" }}>{t.tema}</span>
                <span style={{
                  background: "rgba(6,182,212,0.2)", color: "#06b6d4",
                  borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700,
                }}>{t.cantidad}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabla detallada de prompts */}
      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
          Detalle de Prompts por Etapa
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e293b" }}>
              {["Etapa", "Nombre", "Usos totales", "Este mes", "Tiempo promedio"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.prompts.map(p => (
              <tr key={p.etapa} style={{ borderBottom: "1px solid rgba(30,41,59,0.4)" }}>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{
                    background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)",
                    color: "#67e8f9", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 600,
                  }}>
                    {ETAPA_LABELS[p.etapa] ?? `E${p.etapa}`}
                  </span>
                </td>
                <td style={{ padding: "10px 12px", color: "#e2e8f0" }}>{p.nombre}</td>
                <td style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 600 }}>{p.uso_total}</td>
                <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{p.uso_este_mes}</td>
                <td style={{ padding: "10px 12px", color: "#94a3b8" }}>
                  {p.tiempo_promedio_seg > 0 ? `${p.tiempo_promedio_seg}s` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: "#334155", textAlign: "center" }}>
        Las estadísticas se acumulan en sesión (in-memory). Se reinician al reiniciar el servidor.
        Conecta Supabase para persistencia entre sesiones.
      </div>
    </div>
  );
}
