"use client";

/**
 * SpecialPhaseView
 *
 * Componente que aplica formato visual especial según la fase actual:
 *  - ph-resumen   → caja sobria con prosa + chips de palabras clave
 *  - ph-referencias → lista bibliográfica con sangría francesa APA
 *  - ph-calidad   → dashboard con veredicto destacado + tablas
 *
 * Para todos los demás capítulos, devuelve null y el workspace usa renderMd normal.
 */

import { useMemo } from "react";

interface Props {
  phaseId: string;
  rawContent: string;
  renderMdFn: (text: string) => string;
}

// ── Helpers (puros, sin hooks) ────────────────────────────────────────────────

function extractPalabrasClave(text: string): string[] {
  const m = text.match(/\*\*Palabras clave:\*\*\s*([^\n]+)/i)
    || text.match(/Palabras clave:\s*([^\n]+)/i);
  if (!m) return [];
  return m[1]
    .split(/[;,]/)
    .map(s => s.trim().replace(/[.*]+$/, "").replace(/^\*+/, ""))
    .filter(Boolean)
    .slice(0, 8);
}

function stripPalabrasClave(text: string): string {
  return text
    .replace(/\*\*Palabras clave:\*\*[^\n]+/i, "")
    .replace(/Palabras clave:[^\n]+/i, "")
    .trim();
}

type EstadoCalidad = "LISTO" | "REQUIERE" | "NO_APTO" | null;
function detectarEstado(text: string): EstadoCalidad {
  if (/ESTADO A.*LISTO PARA COMPILAR/i.test(text)) return "LISTO";
  if (/ESTADO B.*REQUIERE CORRECCIONES/i.test(text)) return "REQUIERE";
  if (/ESTADO C.*NO APTO/i.test(text)) return "NO_APTO";
  return null;
}

function contarErrores(text: string) {
  return {
    criticos: (text.match(/🔴/g) || []).length,
    altos: (text.match(/🟠/g) || []).length,
    medios: (text.match(/🟡/g) || []).length,
  };
}

function extraerReferencias(text: string): { refs: string[]; observadas: string | null } {
  const startIdx = text.search(/##\s*REFERENCIAS BIBLIOGR[ÁA]FICAS/i);
  const observadasIdx = text.search(/###\s*Referencias observadas/i);
  const resumenIdx = text.search(/###\s*Resumen editorial/i);

  const sectionStart = startIdx >= 0 ? startIdx : 0;
  const sectionEnd = Math.min(
    observadasIdx > sectionStart ? observadasIdx : Infinity,
    resumenIdx > sectionStart ? resumenIdx : Infinity,
    text.length
  );
  const block = text.slice(sectionStart, sectionEnd);

  const refs = block
    .replace(/##\s*REFERENCIAS BIBLIOGR[ÁA]FICAS/i, "")
    .split(/\n\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && /\(\d{4}/.test(s));

  const observadasMatch = text.match(/###\s*Referencias observadas[\s\S]*?(?=###|$)/i);
  const observadas = observadasMatch ? observadasMatch[0] : null;

  return { refs, observadas };
}

function renderInlineRef(ref: string): string {
  const escaped = ref
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
    .replace(/\((\d{4}[a-z]?)\)/g, '(<strong style="color:var(--accent)">$1</strong>)');
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function SpecialPhaseView({ phaseId, rawContent, renderMdFn }: Props): React.ReactElement | null {
  // 🪝 Todos los hooks SIEMPRE al inicio, antes de cualquier early return.
  const palabrasClave = useMemo(
    () => phaseId === "ph-resumen" ? extractPalabrasClave(rawContent) : [],
    [phaseId, rawContent]
  );
  const textoResumenLimpio = useMemo(
    () => phaseId === "ph-resumen" ? stripPalabrasClave(rawContent) : "",
    [phaseId, rawContent]
  );
  const referencias = useMemo(
    () => phaseId === "ph-referencias" ? extraerReferencias(rawContent) : { refs: [], observadas: null },
    [phaseId, rawContent]
  );
  const calidadEstado = useMemo(
    () => phaseId === "ph-calidad" ? detectarEstado(rawContent) : null,
    [phaseId, rawContent]
  );
  const calidadErrores = useMemo(
    () => phaseId === "ph-calidad" ? contarErrores(rawContent) : { criticos: 0, altos: 0, medios: 0 },
    [phaseId, rawContent]
  );

  // ============= RESUMEN EJECUTIVO =============
  if (phaseId === "ph-resumen") {
    const wordCount = textoResumenLimpio.split(/\s+/).filter(Boolean).length;
    const wordRangeOk = wordCount >= 250 && wordCount <= 400;

    return (
      <div style={{ padding: "20px 24px", maxWidth: "min(1200px, 100%)", margin: "0 auto" }}>
        <div style={{
          padding: "32px 36px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          boxShadow: "var(--shadow-sm)",
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            📄 Resumen Ejecutivo
          </div>
          <div
            className="doc-preview"
            style={{ fontSize: 15.5, lineHeight: 1.9, textAlign: "justify", fontFamily: "var(--font-crimson), Georgia, serif" }}
            dangerouslySetInnerHTML={{ __html: renderMdFn(textoResumenLimpio) }}
          />
          <div style={{ marginTop: 16, fontSize: 11, color: wordRangeOk ? "#22c55e" : "var(--fg-muted)", textAlign: "right" }}>
            {wordCount} palabras {wordRangeOk ? "✓ rango ideal 250-400" : "(fuera del rango 250-400)"}
          </div>
        </div>

        {palabrasClave.length > 0 && (
          <div style={{ padding: "16px 20px", background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
              🔑 Palabras clave
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {palabrasClave.map((p, i) => (
                <span key={i} style={{
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: "rgba(167,139,250,0.12)",
                  border: "1px solid rgba(167,139,250,0.3)",
                  color: "#a78bfa",
                  fontSize: 12.5,
                  fontWeight: 600,
                }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============= REFERENCIAS BIBLIOGRÁFICAS =============
  if (phaseId === "ph-referencias") {
    const { refs, observadas } = referencias;

    if (refs.length === 0) {
      return (
        <div className="doc-preview" style={{ padding: "20px 24px", maxWidth: "min(1200px, 100%)", margin: "0 auto" }}
          dangerouslySetInnerHTML={{ __html: renderMdFn(rawContent) }} />
      );
    }

    return (
      <div style={{ padding: "20px 24px 40px", maxWidth: "min(1200px, 100%)", margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg-primary)", margin: "0 0 6px" }}>
            📚 Referencias Bibliográficas
          </h1>
          <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: 0 }}>
            {refs.length} referencias consolidadas en formato APA 7 · Orden alfabético
          </p>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px 28px", marginBottom: 16 }}>
          <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
            {refs.map((r, i) => (
              <li key={i} style={{
                fontSize: 14.5, lineHeight: 1.65,
                color: "var(--fg-primary)",
                fontFamily: "var(--font-crimson), Georgia, serif",
                paddingLeft: 32, textIndent: -32, // sangría francesa
              }} dangerouslySetInnerHTML={{ __html: renderInlineRef(r) }} />
            ))}
          </ol>
        </div>

        {observadas && (
          <details style={{ padding: "12px 16px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 10 }}>
            <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#f59e0b" }}>
              ⚠️ Referencias observadas que requieren verificación manual
            </summary>
            <div className="doc-preview" style={{ marginTop: 10, fontSize: 13 }}
              dangerouslySetInnerHTML={{ __html: renderMdFn(observadas) }} />
          </details>
        )}
      </div>
    );
  }

  // ============= CONTROL DE CALIDAD =============
  if (phaseId === "ph-calidad") {
    const estadoConfig = {
      LISTO:    { color: "#22c55e", bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.4)",  emoji: "✅", label: "LISTO PARA COMPILAR EN LATEX",     desc: "El documento está aprobado y puede pasar a la fase de compilación." },
      REQUIERE: { color: "#f59e0b", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.4)", emoji: "⚠️", label: "REQUIERE CORRECCIONES",            desc: "Hay errores críticos o altos que deben corregirse antes de compilar." },
      NO_APTO:  { color: "#ef4444", bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.4)",  emoji: "❌", label: "NO APTO PARA COMPILACIÓN",          desc: "El documento todavía parece borrador. Revisa los puntos críticos." },
    } as const;
    const ecfg = calidadEstado ? estadoConfig[calidadEstado] : null;

    return (
      <div style={{ padding: "20px 24px 40px", maxWidth: "min(1300px, 100%)", margin: "0 auto" }}>
        {ecfg && (
          <div style={{
            padding: "20px 24px", marginBottom: 20,
            background: ecfg.bg, border: `2px solid ${ecfg.border}`,
            borderRadius: 14,
          }}>
            <div style={{ fontSize: 11, color: ecfg.color, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
              Veredicto del control final
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: ecfg.color, margin: "0 0 6px" }}>
              {ecfg.emoji} {ecfg.label}
            </h1>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--fg-secondary)", lineHeight: 1.6 }}>
              {ecfg.desc}
            </p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 22 }}>
          <KpiCard count={calidadErrores.criticos} label="Críticos" color="#ef4444" emoji="🔴" />
          <KpiCard count={calidadErrores.altos}    label="Altos"    color="#f59e0b" emoji="🟠" />
          <KpiCard count={calidadErrores.medios}   label="Medios"   color="#eab308" emoji="🟡" />
        </div>

        <div className="doc-preview" style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "24px 28px",
        }}
          dangerouslySetInnerHTML={{ __html: renderMdFn(rawContent) }} />
      </div>
    );
  }

  // No es una fase especial → null para que el workspace use el render normal
  return null;
}

function KpiCard({ count, label, color, emoji }: { count: number; label: string; color: string; emoji: string }) {
  const isZero = count === 0;
  return (
    <div style={{
      padding: "16px 18px",
      background: isZero ? "rgba(34,197,94,0.06)" : "var(--bg-card)",
      border: `1px solid ${isZero ? "rgba(34,197,94,0.25)" : "var(--border)"}`,
      borderRadius: 12,
      textAlign: "center",
    }}>
      <div style={{ fontSize: 10, color: "var(--fg-muted)", marginBottom: 4, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {emoji} {label}
      </div>
      <div style={{
        fontSize: 32, fontWeight: 800,
        color: isZero ? "#22c55e" : color,
        lineHeight: 1,
      }}>
        {count}
      </div>
      {isZero && <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 600, marginTop: 4 }}>✓ Sin errores</div>}
    </div>
  );
}
