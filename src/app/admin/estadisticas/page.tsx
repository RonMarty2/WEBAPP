"use client";

import { useEffect, useState } from "react";
import AdminShell, { StaggerRow, useCountUp } from "@/components/admin/AdminShell";

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

const ETAPA_LABELS: Record<number, string> = { 0: "TEMA", 1: "CAP_I", 2: "CAP_II", 3: "CAP_III-V" };

function KpiBlock({ code, label, value, index }: { code: string; label: string; value: number | string; index: number }) {
  const num = typeof value === "number" ? value : -1;
  const counted = useCountUp(num >= 0 ? num : 0, 800, 200 + index * 80);
  const display = typeof value === "string" ? value : counted;

  return (
    <StaggerRow index={index}>
      <div className="adm-card adm-card-strong p-4">
        <div className="adm-label mb-3">{code}</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: "#edf2fb", lineHeight: 1 }}>{display}</div>
        <div className="adm-caption mt-3 pt-3" style={{ borderTop: "1px solid rgba(140, 154, 176, 0.16)" }}>{label}</div>
      </div>
    </StaggerRow>
  );
}

export default function EstadisticasPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/estadisticas")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const tasaCompletacion = stats && stats.total_monografias_generadas > 0
    ? Math.round((stats.completadas / stats.total_monografias_generadas) * 100)
    : 0;

  return (
    <AdminShell title="Estadisticas" code="STAT GRID" subtitle="Metrica operativa del sistema y ritmo real de generacion.">
      {loading ? (
        <div className="adm-muted text-center py-16">{"// cargando metricas..."}</div>
      ) : !stats ? (
        <div className="adm-card p-8 text-center adm-muted">{"// sin datos disponibles"}</div>
      ) : (
        <>
          <div className="adm-label mb-3">resumen global</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <KpiBlock code="TOTAL" label="Generadas" value={stats.total_monografias_generadas} index={0} />
            <KpiBlock code="DONE" label="Completadas" value={stats.completadas} index={1} />
            <KpiBlock code="MTH" label="Este mes" value={stats.este_mes} index={2} />
            <KpiBlock code="RATE" label="Tasa completada" value={`${tasaCompletacion}%`} index={3} />
          </div>

          <div className="adm-label mb-3">uso por etapa</div>
          <div className="adm-card p-2 mb-8">
            {stats.prompts.length === 0 || stats.prompts.every((p) => p.uso_total === 0) ? (
              <div className="adm-muted p-6 text-center">{"// sin datos, registra una generacion primero"}</div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(140, 154, 176, 0.16)" }}>
                {stats.prompts.map((prompt, index) => {
                  const maxUso = Math.max(...stats.prompts.map((item) => item.uso_total), 1);
                  const pct = Math.round((prompt.uso_total / maxUso) * 100);
                  return (
                    <StaggerRow key={prompt.etapa} index={index}>
                      <div className="adm-row px-4">
                        <span className="adm-label w-16 shrink-0">{ETAPA_LABELS[prompt.etapa]}</span>
                        <div className="flex-1">
                          <div style={{ height: 6, background: "rgba(255,255,255,0.06)" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: "#d6dee9", transition: "width 0.8s ease" }} />
                          </div>
                        </div>
                        <span className="adm-label w-10 text-right">{prompt.uso_total}</span>
                        <span className="adm-muted w-16 text-right">{prompt.tiempo_promedio_seg > 0 ? `${prompt.tiempo_promedio_seg}s` : "-"}</span>
                      </div>
                    </StaggerRow>
                  );
                })}
              </div>
            )}
          </div>

          <div className="adm-label mb-3">temas frecuentes</div>
          <div className="adm-card p-4 mb-8">
            {stats.temas_mas_populares.length === 0 ? (
              <div className="adm-muted">{"// sin monografias registradas"}</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stats.temas_mas_populares.map((tema, index) => (
                  <StaggerRow key={index} index={index}>
                    <div className="px-3 py-2 adm-surface flex items-center gap-2">
                      <span style={{ fontSize: 12, color: "#edf2fb" }}>{tema.tema}</span>
                      <span className="adm-label">[{tema.cantidad}]</span>
                    </div>
                  </StaggerRow>
                ))}
              </div>
            )}
          </div>

          <div className="adm-label mb-3">detalle por etapa</div>
          <div className="adm-card">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Etapa</th>
                  <th>Nombre</th>
                  <th>Total</th>
                  <th>Mes</th>
                  <th>Avg</th>
                </tr>
              </thead>
              <tbody>
                {stats.prompts.map((prompt) => (
                  <tr key={prompt.etapa}>
                    <td><span className="adm-label">{ETAPA_LABELS[prompt.etapa]}</span></td>
                    <td>{prompt.nombre}</td>
                    <td style={{ fontWeight: 700, color: "#edf2fb" }}>{prompt.uso_total}</td>
                    <td className="adm-muted">{prompt.uso_este_mes}</td>
                    <td className="adm-muted">{prompt.tiempo_promedio_seg > 0 ? `${prompt.tiempo_promedio_seg}s` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminShell>
  );
}
