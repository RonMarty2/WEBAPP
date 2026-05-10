"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell, { StaggerRow, useCountUp } from "@/components/admin/AdminShell";

interface DashStats {
  total_monografias_generadas: number;
  completadas: number;
  este_mes: number;
  prompts: Array<{ etapa: number; uso_total: number; uso_este_mes: number; tiempo_promedio_seg: number }>;
}

interface MonografiaCount {
  total: number;
  cap1: number;
  cap2: number;
  completadas: number;
}

interface DashboardData {
  kpis: {
    totalUsuarios: number;
    totalProyectos: number;
    completos: number;
    enCurso: number;
    abandonados: number;
    tasaCompletado: number;
    usuariosActivos7d: number;
  };
  funnel: {
    crearon_proyecto: number;
    tienen_cap0: number;
    tienen_cap1: number;
    tienen_cap5: number;
    tienen_completo: number;
  };
  topProgramas: Array<{ nombre: string; count: number }>;
  topUniversidades: Array<{ nombre: string; count: number }>;
  topKeywords: Array<{ palabra: string; count: number }>;
  posiblesDuplicados: Array<{ programa: string; ejemplos: string[] }>;
}

interface FeedbackInsights {
  totalFeedbacks: number;
  porFase: Array<{ phase_id: string; phase_label: string; count: number }>;
  porPrograma: Array<{ nombre: string; count: number }>;
  topPalabrasClave: Array<{ palabra: string; count: number }>;
  topFrasesAccion: Array<{ frase: string; count: number }>;
  sugerenciasPorFase: Array<{
    phase_id: string;
    phase_label: string;
    sugerencia: string;
    evidencia: string[];
  }>;
  feedbacksRecientes: Array<{
    phase_label: string;
    programa: string;
    feedback_text: string;
    tipo: string;
    created_at: string;
  }>;
  emptyState: boolean;
}

function MetricCard({
  code,
  label,
  value,
  detail,
  index,
}: {
  code: string;
  label: string;
  value: number;
  detail: string;
  index: number;
}) {
  const counted = useCountUp(value, 800, 140 + index * 70);

  return (
    <StaggerRow index={index}>
      <div className="adm-card adm-card-strong p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="adm-label">{code}</span>
          <span className="adm-muted">live</span>
        </div>
        <div className="adm-kpi-num" style={{ fontSize: 44, fontWeight: 700, lineHeight: 1 }}>{counted}</div>
        <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(140, 154, 176, 0.16)" }}>
          <div className="text-[13px] font-bold" style={{ color: "#edf2fb" }}>{label}</div>
          <div className="adm-caption mt-1">{detail}</div>
        </div>
      </div>
    </StaggerRow>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [monoCounts, setMonoCounts] = useState<MonografiaCount>({ total: 0, cap1: 0, cap2: 0, completadas: 0 });
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [insights, setInsights] = useState<FeedbackInsights | null>(null);
  const [tick, setTick] = useState("");

  useEffect(() => {
    const updateClock = () => {
      setTick(
        new Date().toLocaleTimeString("es-BO", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    };
    updateClock();
    const id = setInterval(updateClock, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch("/api/admin/estadisticas")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => null);

    fetch("/api/admin/monografias")
      .then((r) => r.json())
      .then((d: Array<{ etapa_actual: number; status: string }>) => {
        if (!Array.isArray(d)) return;
        setMonoCounts({
          total: d.length,
          cap1: d.filter((m) => m.etapa_actual >= 1).length,
          cap2: d.filter((m) => m.etapa_actual >= 2).length,
          completadas: d.filter((m) => m.status === "completa" || m.etapa_actual >= 3).length,
        });
      })
      .catch(() => null);

    // Datos enriquecidos del dashboard nuevo
    fetch("/api/admin/dashboard")
      .then(r => r.json())
      .then((d: DashboardData) => setDashboard(d))
      .catch(() => null);

    // Insights de feedback (qué piden los estudiantes para mejorar prompts)
    fetch("/api/admin/feedback-insights")
      .then(r => r.json())
      .then((d: FeedbackInsights) => setInsights(d))
      .catch(() => null);
  }, []);

  const usoTotal = stats?.prompts?.reduce((acc, prompt) => acc + prompt.uso_total, 0) ?? 0;
  const serviceHealth = [
    { code: "AI", label: "Cadena de IA", value: "Operativa, revisar servicios por asignacion", state: "stable" },
    { code: "MONO", label: "Monografia", value: "Validar que mono-001 tenga proveedor activo", state: "attention" },
    { code: "STORE", label: "Persistencia", value: "Modo archivo local .store en desarrollo", state: "stable" },
    { code: "LATEX", label: "Exportacion", value: "Motor tex disponible para compilacion", state: "stable" },
  ];

  const actions = [
    {
      href: "/admin/modelos",
      code: "CTRL/AI",
      title: "Modelos y APIs",
      desc: "Configura proveedores y elimina bloqueos de servicios como mono-001.",
    },
    {
      href: "/admin/usuarios",
      code: "CTRL/USR",
      title: "Usuarios",
      desc: "Controla altas, activaciones, roles y carga operativa real.",
    },
    {
      href: "/admin/estadisticas",
      code: "CTRL/STAT",
      title: "Estadisticas",
      desc: "Observa ritmo de generacion, etapas y comportamiento del sistema.",
    },
    {
      href: "/admin/prompts",
      code: "CTRL/PRM",
      title: "Prompts maestros",
      desc: "Ajusta el nucleo de redaccion sin perder el rigor del flujo.",
    },
  ];

  return (
    <AdminShell
      title="Centro de Mando"
      code="CMD CORE"
      subtitle="Bunker estrategico del sistema. Todo el control operativo, de IA y de alumnos converge aqui."
    >
      <div className="adm-card adm-card-strong p-5 mb-8">
        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="adm-label mb-3">panorama ejecutivo</div>
            <div className="text-[26px] font-bold leading-tight" style={{ color: "#edf2fb" }}>
              El panel ahora esta pensado como sala de control, no como consola improvisada.
            </div>
            <div className="adm-caption mt-3 max-w-2xl">
              Monitorea actividad real, riesgo operativo y estado de la IA desde una superficie mas sobria, mas firme y mas propia del nucleo administrativo.
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="adm-surface p-4">
              <div className="adm-label mb-2">reloj</div>
              <div className="text-[22px] font-bold" style={{ color: "#edf2fb" }}>{tick || "--:--:--"}</div>
            </div>
            <div className="adm-surface p-4">
              <div className="adm-label mb-2">uso IA</div>
              <div className="text-[22px] font-bold" style={{ color: "#edf2fb" }}>{usoTotal}</div>
            </div>
            <div className="adm-surface p-4 col-span-2">
              <div className="adm-label mb-2">prioridad inmediata</div>
              <div className="text-[13px] font-bold" style={{ color: "#edf2fb" }}>
                Confirmar proveedor y modelo activos para el servicio de monografia.
              </div>
              <div className="adm-caption mt-1">Ese es el origen del error que viste en la captura del generador.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-8">
        <MetricCard
          code="USR"
          label="Usuarios totales"
          value={dashboard?.kpis.totalUsuarios ?? 0}
          detail={`${dashboard?.kpis.usuariosActivos7d ?? 0} activos en últimos 7 días`}
          index={0}
        />
        <MetricCard
          code="PROY"
          label="Proyectos totales"
          value={dashboard?.kpis.totalProyectos ?? monoCounts.total}
          detail={`${dashboard?.kpis.enCurso ?? 0} en curso, ${dashboard?.kpis.abandonados ?? 0} abandonados`}
          index={1}
        />
        <MetricCard
          code="DONE"
          label="Completos"
          value={dashboard?.kpis.completos ?? monoCounts.completadas}
          detail={`Llegaron a Cap V o más`}
          index={2}
        />
        <MetricCard
          code="RATE"
          label="Tasa completado"
          value={dashboard?.kpis.tasaCompletado ?? 0}
          detail={`% de proyectos que llegan a Cap V`}
          index={3}
        />
      </div>

      {/* ─── Funnel de conversión ─── */}
      {dashboard && dashboard.funnel.crearon_proyecto > 0 && (
        <div className="adm-card p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="adm-label">funnel de conversión</div>
            <div className="adm-muted">cuántos llegan a cada hito</div>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Crearon proyecto", value: dashboard.funnel.crearon_proyecto, base: dashboard.funnel.crearon_proyecto, color: "#a78bfa" },
              { label: "Generaron Cap 0 (tema)", value: dashboard.funnel.tienen_cap0, base: dashboard.funnel.crearon_proyecto, color: "#818cf8" },
              { label: "Generaron Cap I", value: dashboard.funnel.tienen_cap1, base: dashboard.funnel.crearon_proyecto, color: "#60a5fa" },
              { label: "Llegaron a Cap V", value: dashboard.funnel.tienen_cap5, base: dashboard.funnel.crearon_proyecto, color: "#22d3ee" },
              { label: "Documento completo", value: dashboard.funnel.tienen_completo, base: dashboard.funnel.crearon_proyecto, color: "#22c55e" },
            ].map((step, i) => {
              const pct = step.base > 0 ? Math.round((step.value / step.base) * 100) : 0;
              return (
                <div key={i} className="adm-surface px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-bold" style={{ color: "#edf2fb" }}>{step.label}</span>
                    <span className="text-[13px]" style={{ color: step.color, fontWeight: 700 }}>{step.value} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: "rgba(140,154,176,0.15)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: step.color,
                      borderRadius: 999,
                      transition: "width 600ms cubic-bezier(0.22,1,0.36,1)",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Top programas + Top universidades ─── */}
      {dashboard && (dashboard.topProgramas.length > 0 || dashboard.topUniversidades.length > 0) && (
        <div className="grid gap-6 xl:grid-cols-2 mb-8">
          <div className="adm-card p-5">
            <div className="adm-label mb-4">🎓 top programas / diplomados</div>
            {dashboard.topProgramas.length === 0 ? (
              <div className="adm-caption">Sin datos aún</div>
            ) : (
              <div className="space-y-2">
                {dashboard.topProgramas.map((p, i) => (
                  <div key={i} className="adm-surface flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[18px] font-bold" style={{ color: "#a78bfa", minWidth: 22 }}>{i + 1}</span>
                      <span className="text-[13px] truncate" style={{ color: "#edf2fb" }}>{p.nombre}</span>
                    </div>
                    <span className="text-[13px] font-bold ml-2 shrink-0" style={{ color: "#edf2fb" }}>{p.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="adm-card p-5">
            <div className="adm-label mb-4">🏛️ top universidades</div>
            {dashboard.topUniversidades.length === 0 ? (
              <div className="adm-caption">Sin datos aún</div>
            ) : (
              <div className="space-y-2">
                {dashboard.topUniversidades.map((u, i) => (
                  <div key={i} className="adm-surface flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[18px] font-bold" style={{ color: "#22d3ee", minWidth: 22 }}>{i + 1}</span>
                      <span className="text-[13px] truncate" style={{ color: "#edf2fb" }}>{u.nombre}</span>
                    </div>
                    <span className="text-[13px] font-bold ml-2 shrink-0" style={{ color: "#edf2fb" }}>{u.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Cloud de palabras clave ─── */}
      {dashboard && dashboard.topKeywords.length > 0 && (
        <div className="adm-card p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="adm-label">🔑 palabras clave de los temas generados</div>
            <div className="adm-muted">tamaño = frecuencia · útil para marketing</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {dashboard.topKeywords.map((kw, i) => {
              const max = dashboard.topKeywords[0]?.count ?? 1;
              const ratio = kw.count / max;
              const fontSize = 12 + Math.round(ratio * 14);
              const opacity = 0.5 + ratio * 0.5;
              return (
                <span
                  key={i}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 999,
                    background: `rgba(167,139,250,${0.08 + ratio * 0.2})`,
                    border: `1px solid rgba(167,139,250,${0.2 + ratio * 0.3})`,
                    color: `rgba(237,242,251,${opacity})`,
                    fontSize,
                    fontWeight: 600 + Math.round(ratio * 200),
                  }}
                >
                  {kw.palabra} <span style={{ opacity: 0.6, fontSize: fontSize - 2 }}>· {kw.count}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Posibles duplicados ─── */}
      {dashboard && dashboard.posiblesDuplicados.length > 0 && (
        <div className="adm-card p-5 mb-8" style={{ borderColor: "rgba(245,158,11,0.3)" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="adm-label" style={{ color: "#f59e0b" }}>⚠️ posibles temas duplicados</div>
            <div className="adm-muted">2+ proyectos del mismo programa con palabras similares</div>
          </div>
          <div className="space-y-3">
            {dashboard.posiblesDuplicados.slice(0, 5).map((dup, i) => (
              <div key={i} className="adm-surface p-3" style={{ background: "rgba(245,158,11,0.05)" }}>
                <div className="text-[12px] font-bold mb-1.5" style={{ color: "#f59e0b" }}>{dup.programa}</div>
                <ul className="space-y-1">
                  {dup.ejemplos.map((tema, j) => (
                    <li key={j} className="text-[12.5px] pl-3" style={{ color: "#edf2fb" }}>• {tema.length > 100 ? tema.slice(0, 100) + "…" : tema}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="adm-caption mt-3">
            La anti-duplicación automática evita esto en proyectos nuevos. Los duplicados de arriba son históricos.
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          INSIGHTS DE FEEDBACK - Para mejorar megaprompts maestros
         ═══════════════════════════════════════════════════════════════ */}
      {insights && (
        <>
          <div className="adm-card adm-card-strong p-5 mb-6" style={{ marginTop: 24 }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="adm-label">🎯 insights del feedback de estudiantes</div>
                <div className="text-[14px] mt-1" style={{ color: "#edf2fb", fontWeight: 600 }}>
                  Detección automática de patrones para mejorar tus megaprompts
                </div>
              </div>
              <div className="text-[28px] font-bold" style={{ color: "#a78bfa" }}>
                {insights.totalFeedbacks}
              </div>
            </div>
            <div className="adm-caption">
              {insights.totalFeedbacks === 0
                ? "Aún no hay feedback registrado. Cuando los estudiantes apliquen cambios o usen el chat de correcciones, sus mensajes aparecerán acá analizados."
                : `${insights.totalFeedbacks} mensaje(s) capturados de los estudiantes al pedir cambios. Mirá las recomendaciones automáticas debajo.`}
            </div>
          </div>

          {!insights.emptyState && (
            <>
              {/* Sugerencias por fase (lo más importante para acción) */}
              {insights.sugerenciasPorFase.length > 0 && (
                <div className="adm-card p-5 mb-8" style={{ borderColor: "rgba(34,197,94,0.3)" }}>
                  <div className="adm-label mb-4" style={{ color: "#22c55e" }}>
                    💡 recomendaciones automáticas para tus megaprompts
                  </div>
                  <div className="space-y-3">
                    {insights.sugerenciasPorFase.map((s, i) => (
                      <div key={i} className="adm-surface p-4" style={{ background: "rgba(34,197,94,0.04)" }}>
                        <div className="flex items-start gap-3">
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: "rgba(34,197,94,0.15)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, fontSize: 16,
                          }}>📝</div>
                          <div className="flex-1">
                            <div className="text-[12px] font-bold mb-1.5" style={{ color: "#22c55e", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                              {s.phase_label}
                            </div>
                            <div className="text-[13px] leading-relaxed mb-2" style={{ color: "#edf2fb" }}>
                              {s.sugerencia}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {s.evidencia.map((ev, j) => (
                                <span key={j} className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.25)", color: "#86efac" }}>
                                  {ev}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Distribución por fase + frases acción */}
              <div className="grid gap-6 xl:grid-cols-2 mb-8">
                <div className="adm-card p-5">
                  <div className="adm-label mb-4">📊 fases que reciben más feedback</div>
                  {insights.porFase.length === 0 ? (
                    <div className="adm-caption">Sin datos aún</div>
                  ) : (
                    <div className="space-y-2">
                      {insights.porFase.slice(0, 6).map((f, i) => {
                        const max = insights.porFase[0]?.count ?? 1;
                        const pct = (f.count / max) * 100;
                        return (
                          <div key={i} className="adm-surface px-3 py-2.5">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[13px] font-bold truncate" style={{ color: "#edf2fb" }}>{f.phase_label}</span>
                              <span className="text-[12px] font-bold ml-2 shrink-0" style={{ color: "#a78bfa" }}>{f.count}</span>
                            </div>
                            <div style={{ height: 4, borderRadius: 999, background: "rgba(140,154,176,0.15)", overflow: "hidden" }}>
                              <div style={{
                                height: "100%", width: `${pct}%`,
                                background: "linear-gradient(90deg, #a78bfa, #818cf8)",
                                borderRadius: 999,
                                transition: "width 600ms cubic-bezier(0.22,1,0.36,1)",
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="adm-card p-5">
                  <div className="adm-label mb-4">🔁 frases que más se repiten</div>
                  {insights.topFrasesAccion.length === 0 ? (
                    <div className="adm-caption">Aún no hay patrones repetidos. Necesitamos al menos 2 ocurrencias.</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {insights.topFrasesAccion.map((f, i) => (
                        <span key={i} style={{
                          padding: "6px 12px",
                          borderRadius: 999,
                          background: "rgba(167,139,250,0.10)",
                          border: "1px solid rgba(167,139,250,0.25)",
                          color: "#edf2fb",
                          fontSize: 12.5,
                          fontWeight: 600,
                        }}>
                          “{f.frase}” <span style={{ color: "#a78bfa", marginLeft: 4 }}>×{f.count}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Feedbacks recientes — muestra textual */}
              {insights.feedbacksRecientes.length > 0 && (
                <div className="adm-card p-5 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="adm-label">💬 últimos feedbacks de estudiantes</div>
                    <div className="adm-muted">los más recientes primero</div>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {insights.feedbacksRecientes.slice(0, 12).map((fb, i) => (
                      <div key={i} className="adm-surface p-3">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.15)", color: "#a78bfa", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                            {fb.phase_label}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(140,154,176,0.10)", color: "#94a3b8" }}>
                            {fb.tipo === "aplicar_cambios" ? "Aplicar cambios" : fb.tipo === "chat_correccion" ? "Chat correcciones" : fb.tipo}
                          </span>
                          {fb.programa && <span className="text-[10px]" style={{ color: "#94a3b8" }}>{fb.programa}</span>}
                          <span className="text-[10px] ml-auto" style={{ color: "#94a3b8" }}>
                            {new Date(fb.created_at).toLocaleDateString("es-BO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div className="text-[13px] leading-relaxed" style={{ color: "#edf2fb" }}>
                          {fb.feedback_text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] mb-8">
        <div className="adm-card p-5">
          <div className="adm-label mb-4">acceso tactico</div>
          <div className="grid gap-3 md:grid-cols-2">
            {actions.map((action, index) => (
              <StaggerRow key={action.href} index={index}>
                <Link href={action.href} className="block adm-surface p-4 no-underline transition-transform duration-150 hover:-translate-y-[2px]">
                  <div className="adm-label mb-2">{action.code}</div>
                  <div className="text-[15px] font-bold" style={{ color: "#edf2fb" }}>{action.title}</div>
                  <div className="adm-caption mt-2">{action.desc}</div>
                </Link>
              </StaggerRow>
            ))}
          </div>
        </div>

        <div className="adm-card p-5">
          <div className="adm-label mb-4">estado de sistema</div>
          <div className="space-y-2">
            {serviceHealth.map((item, index) => (
              <StaggerRow key={item.code} index={index + 4}>
                <div className="adm-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="adm-label mb-2">{item.code}</div>
                      <div className="text-[14px] font-bold" style={{ color: "#edf2fb" }}>{item.label}</div>
                      <div className="adm-caption mt-1">{item.value}</div>
                    </div>
                    <span className={item.state === "stable" ? "adm-badge-ok" : "adm-badge-warn"}>
                      {item.state === "stable" ? "estable" : "atencion"}
                    </span>
                  </div>
                </div>
              </StaggerRow>
            ))}
          </div>
        </div>
      </div>

      {stats ? (
        <div className="adm-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="adm-label">trafico por etapa</div>
            <div className="adm-muted">prompts activos registrados</div>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {stats.prompts.map((prompt, index) => (
              <StaggerRow key={prompt.etapa} index={index + 8}>
                <div className="adm-surface p-4">
                  <div className="adm-label mb-2">etapa {prompt.etapa}</div>
                  <div className="text-[28px] font-bold" style={{ color: "#edf2fb" }}>{prompt.uso_total}</div>
                  <div className="adm-caption mt-2">
                    Este mes: {prompt.uso_este_mes} <br />
                    Tiempo promedio: {prompt.tiempo_promedio_seg > 0 ? `${prompt.tiempo_promedio_seg}s` : "sin dato"}
                  </div>
                </div>
              </StaggerRow>
            ))}
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
