"use client";

import { useMemo } from "react";

interface Props {
  rawContent: string;
}

interface CheckItem {
  label: string;
  pass: boolean;
  severity: "info" | "warning" | "error";
  detail?: string;
}

export default function CalidadInsights({ rawContent }: Props) {
  const analysis = useMemo(() => {
    const text = rawContent || "";
    const plainText = text.replace(/[#*_`]/g, "");

    // Detección de menciones a problemas en el reporte del agente
    const tieneIncoherencia = /incoherencia|contradic|inconsist/i.test(text);
    const tieneAlucinacion = /alucinaci[oó]n|inventad|ficticio|no\s+verific/i.test(text);
    const tieneCitasFaltantes = /cita.*faltant|sin\s+autor|sin\s+a[ñn]o/i.test(text);
    const tieneFormatoMal = /formato.*incorrecto|apa.*incorrecto/i.test(text);

    // Detección de aprobaciones explícitas
    const aprobadoCoherencia = /coherencia.*(correcta|adecuada|aprobada|✓|ok)/i.test(text);
    const aprobadoCitas = /citas?.*(correcta|válidas?|aprobadas?|verificad)/i.test(text);
    const aprobadoFormato = /formato.*(correcto|adecuado|cumple|apa\s*7.*ok)/i.test(text);

    const checks: CheckItem[] = [
      {
        label: "Coherencia entre capítulos",
        pass: aprobadoCoherencia && !tieneIncoherencia,
        severity: tieneIncoherencia ? "error" : aprobadoCoherencia ? "info" : "warning",
        detail: tieneIncoherencia
          ? "Se detectaron posibles contradicciones — revisa los párrafos marcados."
          : aprobadoCoherencia ? "Validado por el agente." : "Pendiente de revisión.",
      },
      {
        label: "Sin alucinaciones de IA",
        pass: !tieneAlucinacion,
        severity: tieneAlucinacion ? "error" : "info",
        detail: tieneAlucinacion
          ? "El agente encontró datos no verificables. Reemplaza por fuentes reales."
          : "No se detectaron datos inventados.",
      },
      {
        label: "Citas con autoría completa",
        pass: aprobadoCitas && !tieneCitasFaltantes,
        severity: tieneCitasFaltantes ? "error" : aprobadoCitas ? "info" : "warning",
        detail: tieneCitasFaltantes
          ? "Algunas citas carecen de autor o año — completa antes de exportar."
          : aprobadoCitas ? "Todas las citas están completas." : "Revisar manualmente.",
      },
      {
        label: "Formato APA 7",
        pass: aprobadoFormato && !tieneFormatoMal,
        severity: tieneFormatoMal ? "error" : aprobadoFormato ? "info" : "warning",
        detail: tieneFormatoMal
          ? "Hay referencias con formato incorrecto."
          : aprobadoFormato ? "Formato APA 7 verificado." : "Validación parcial.",
      },
    ];

    const total = checks.length;
    const passed = checks.filter(c => c.pass).length;
    const errors = checks.filter(c => c.severity === "error").length;
    const warnings = checks.filter(c => c.severity === "warning").length;
    const score = total > 0 ? Math.round((passed / total) * 100) : 0;

    return { checks, total, passed, errors, warnings, score, plainText };
  }, [rawContent]);

  const scoreColor = analysis.score >= 80 ? "var(--green)" : analysis.score >= 50 ? "#f59e0b" : "#ef4444";
  const scoreLabel = analysis.score >= 80 ? "Listo" : analysis.score >= 50 ? "Casi listo" : "Requiere trabajo";

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, height: "100%", overflowY: "auto" }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
          🛡️ Control de Calidad
        </div>
        <div style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.5 }}>
          Validaciones automáticas del documento antes de exportar.
        </div>
      </div>

      {/* Score grande */}
      <div style={{
        padding: "18px 16px",
        borderRadius: 14,
        background: `linear-gradient(135deg, ${scoreColor}1a, ${scoreColor}08)`,
        border: `1px solid ${scoreColor}40`,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
          Score de calidad
        </div>
        <div style={{ fontSize: 42, fontWeight: 900, color: scoreColor, lineHeight: 1, marginBottom: 4 }}>
          {analysis.score}<span style={{ fontSize: 18, opacity: 0.6 }}>%</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: scoreColor }}>
          {scoreLabel}
        </div>
      </div>

      {/* Resumen de errores */}
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.25)" }}>
          <div style={{ fontSize: 9, color: "var(--green)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>OK</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--green)" }}>{analysis.passed}</div>
        </div>
        <div style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <div style={{ fontSize: 9, color: "#d97706", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Avisos</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#d97706" }}>{analysis.warnings}</div>
        </div>
        <div style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)" }}>
          <div style={{ fontSize: 9, color: "#ef4444", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Errores</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#ef4444" }}>{analysis.errors}</div>
        </div>
      </div>

      {/* Lista de validaciones */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Validaciones detalladas
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {analysis.checks.map(c => {
            const sev = c.severity;
            const color = sev === "error" ? "#ef4444" : sev === "warning" ? "#f59e0b" : "var(--green)";
            const bg = sev === "error" ? "rgba(239,68,68,0.05)" : sev === "warning" ? "rgba(245,158,11,0.05)" : "rgba(16,185,129,0.05)";
            const border = sev === "error" ? "rgba(239,68,68,0.22)" : sev === "warning" ? "rgba(245,158,11,0.22)" : "rgba(16,185,129,0.22)";
            const icon = sev === "error" ? "✕" : sev === "warning" ? "!" : "✓";
            return (
              <div
                key={c.label}
                style={{ padding: "10px 12px", borderRadius: 8, background: bg, border: `1px solid ${border}` }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: color, color: "white", fontWeight: 800, fontSize: 11,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>{icon}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--fg-primary)" }}>
                    {c.label}
                  </span>
                </div>
                {c.detail && (
                  <div style={{ fontSize: 10.5, color: "var(--fg-secondary)", lineHeight: 1.5, paddingLeft: 26 }}>
                    {c.detail}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA si hay errores */}
      {analysis.errors > 0 && (
        <div style={{
          padding: "10px 12px",
          borderRadius: 8,
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.3)",
          fontSize: 11,
          color: "#b91c1c",
          lineHeight: 1.5,
        }}>
          <strong>Atención:</strong> Tienes {analysis.errors} error{analysis.errors > 1 ? "es" : ""} crítico{analysis.errors > 1 ? "s" : ""} que deben resolverse antes de exportar el documento final.
        </div>
      )}

      {analysis.errors === 0 && analysis.warnings === 0 && analysis.passed > 0 && (
        <div style={{
          padding: "10px 12px",
          borderRadius: 8,
          background: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.3)",
          fontSize: 11,
          color: "#047857",
          lineHeight: 1.5,
        }}>
          <strong>Documento listo:</strong> Todas las validaciones pasaron. Puedes proceder a la exportación LaTeX.
        </div>
      )}
    </div>
  );
}
