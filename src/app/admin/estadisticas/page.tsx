"use client";

import { useState, useEffect } from "react";
import AdminShell, { StaggerRow, useCountUp } from "@/components/admin/AdminShell";

interface PromptStat { etapa: number; nombre: string; uso_total: number; uso_este_mes: number; tiempo_promedio_seg: number; }
interface TemaPopular { tema: string; cantidad: number; }
interface EtapaCambios { etapa: number; cambios_promedio: number; }
interface Stats {
  total_monografias_generadas: number; completadas: number; este_mes: number;
  promedio_tiempo_generacion_seg: number; temas_mas_populares: TemaPopular[];
  prompts: PromptStat[]; etapas_con_mas_cambios: EtapaCambios[];
}

const ETAPA_LABELS: Record<number, string> = { 0: "TEMA", 1: "CAP_I", 2: "CAP_II", 3: "CAP_III-V" };

function KpiBlock({ code, label, value, index }: { code: string; label: string; value: number | string; index: number }) {
  const num = typeof value === "number" ? value : -1;
  const counted = useCountUp(num >= 0 ? num : 0, 800, 200 + index * 80);
  const display = typeof value === "string" ? value : counted;
  return (
    <StaggerRow index={index}>
      <div className="adm-card p-4">
        <div className="adm-label mb-3">{code}</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: "#000", lineHeight: 1 }}>{display}</div>
        <div className="adm-caption mt-2 pt-2" style={{ borderTop: "1px solid #e5e7eb" }}>{label}</div>
      </div>
    </StaggerRow>
  );
}

export default function EstadisticasPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/estadisticas")
      .then(r => r.json()).then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const tasaCompletacion = stats && stats.total_monografias_generadas > 0
    ? Math.round((stats.completadas / stats.total_monografias_generadas) * 100)
    : 0;

  return (
    <AdminShell title="Estadísticas" code="STAT — métricas de sesión" subtitle="Datos en tiempo real (in-memory). Se reinician con el servidor.">

      {loading ? (
        <div className="adm-muted text-center py-16">// cargando métricas...</div>
      ) : !stats ? (
        <div className="adm-card p-8 text-center adm-muted">// sin datos disponibles</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="adm-label mb-3">// resumen global</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <KpiBlock code="TOTAL" label="Generadas"    value={stats.total_monografias_generadas} index={0} />
            <KpiBlock code="DONE"  label="Completadas"  value={stats.completadas}                  index={1} />
            <KpiBlock code="MTH"   label="Este mes"     value={stats.este_mes}                     index={2} />
            <KpiBlock code="RATE"  label="Tasa complet." value={`${tasaCompletacion}%`}            index={3} />
          </div>

          {/* Uso por etapa */}
          <div className="adm-label mb-3">// uso por etapa</div>
          <div className="adm-card mb-8">
            {stats.prompts.length === 0 || stats.prompts.every(p => p.uso_total === 0) ? (
              <div className="adm-muted p-6 text-center">// sin datos — registra una generación primero</div>
            ) : (
              <div className="divide-y" style={{ borderColor: "#e5e7eb" }}>
                {stats.prompts.map((p, i) => {
                  const maxUso = Math.max(...stats.prompts.map(x => x.uso_total), 1);
                  const pct = Math.round((p.uso_total / maxUso) * 100);
                  return (
                    <StaggerRow key={p.etapa} index={i}>
                      <div className="adm-row px-4">
                        <span className="adm-label w-16 shrink-0">{ETAPA_LABELS[p.etapa]}</span>
                        <div className="flex-1">
                          <div style={{ height: 4, background: "#f0f0f0" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: "#000", transition: "width 0.8s ease" }} />
                          </div>
                        </div>
                        <span className="adm-label w-10 text-right">{p.uso_total}</span>
                        <span className="adm-muted w-16 text-right">{p.tiempo_promedio_seg > 0 ? `${p.tiempo_promedio_seg}s` : "—"}</span>
                      </div>
                    </StaggerRow>
                  );
                })}
              </div>
            )}
          </div>

          {/* Temas populares */}
          <div className="adm-label mb-3">// temas frecuentes</div>
          <div className="adm-card p-4 mb-8">
            {stats.temas_mas_populares.length === 0 ? (
              <div className="adm-muted">// sin monografías registradas</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stats.temas_mas_populares.map((t, i) => (
                  <StaggerRow key={i} index={i}>
                    <div className="flex items-center gap-2 px-3 py-1.5" style={{ border: "1px solid #e5e7eb" }}>
                      <span style={{ fontSize: 12, color: "#000" }}>{t.tema}</span>
                      <span className="adm-label">[{t.cantidad}]</span>
                    </div>
                  </StaggerRow>
                ))}
              </div>
            )}
          </div>

          {/* Tabla prompts */}
          <div className="adm-label mb-3">// detalle por etapa</div>
          <div className="adm-card">
            <table className="adm-table">
              <thead>
                <tr><th>Etapa</th><th>Nombre</th><th>Total</th><th>Mes</th><th>Avg</th></tr>
              </thead>
              <tbody>
                {stats.prompts.map(p => (
                  <tr key={p.etapa}>
                    <td><span className="adm-label">{ETAPA_LABELS[p.etapa]}</span></td>
                    <td>{p.nombre}</td>
                    <td style={{ fontWeight: 700 }}>{p.uso_total}</td>
                    <td className="adm-muted">{p.uso_este_mes}</td>
                    <td className="adm-muted">{p.tiempo_promedio_seg > 0 ? `${p.tiempo_promedio_seg}s` : "—"}</td>
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
