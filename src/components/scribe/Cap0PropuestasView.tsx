"use client";

/**
 * Cap0PropuestasView
 *
 * UI especial para el Capítulo 0 — Propuesta y Refinamiento de Tema.
 * En vez de mostrar el output crudo del LLM (con bloque JSON técnico expuesto),
 * parsea el JSON estructurado al final del texto y renderiza:
 *   - Análisis del tema actual del estudiante (si lo tenía)
 *   - Cards visuales para cada propuesta (1-5)
 *   - Botones de acción: Elegir / Regenerar / Mantener tema actual
 *
 * Si no se puede parsear el JSON (caso degenerado), cae a renderizar el markdown
 * como fallback.
 */

import { useMemo, useState } from "react";

interface Propuesta {
  numero: number;
  titulo: string;
  contexto?: string;
  problema_central?: string;
  pregunta_investigacion?: string;
  objetivo_general?: string;
  metodologia?: string;
  fuentes_datos?: string[];
  periodo_temporal?: string;
  requiere_entrevistas?: boolean;
  viabilidad?: "ALTA" | "MEDIA" | "BAJA";
}

interface Cap0Json {
  etapa?: number;
  escenario?: "A" | "B" | "C" | "D";
  status?: string;
  tema_final?: string;
  viabilidad_final?: "ALTA" | "MEDIA" | "BAJA";
  propuestas?: Propuesta[];
  recomendacion?: string;
  proximo_paso?: string;
}

interface Props {
  rawContent: string;
  temaInicial?: string;
  isGenerating?: boolean;
  onElegirOpcion?: (propuesta: Propuesta) => void;
  onRegenerar?: () => void;
  onMantenerTema?: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractJsonBlock(text: string): Cap0Json | null {
  if (!text) return null;
  // Match ```json ... ``` o ```...{...}...```
  const fenced = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  const candidate = fenced?.[1];
  if (candidate) {
    try { return JSON.parse(candidate) as Cap0Json; } catch { /* fall through */ }
  }
  // Fallback: último bloque JSON-ish del texto
  const lastBrace = text.lastIndexOf("{");
  if (lastBrace >= 0) {
    const closing = findMatchingBrace(text, lastBrace);
    if (closing > lastBrace) {
      try { return JSON.parse(text.slice(lastBrace, closing + 1)) as Cap0Json; } catch { /* ignore */ }
    }
  }
  return null;
}

function findMatchingBrace(s: string, start: number): number {
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function viabilidadColor(v?: string): { bg: string; border: string; text: string; emoji: string } {
  if (v === "ALTA")  return { bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.35)",  text: "#22c55e", emoji: "✅" };
  if (v === "MEDIA") return { bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.35)", text: "#f59e0b", emoji: "⚠️" };
  if (v === "BAJA")  return { bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.35)",  text: "#ef4444", emoji: "❌" };
  return { bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.35)", text: "var(--fg-muted)", emoji: "•" };
}

function detectarOpcionRecomendada(recomendacion?: string): number | null {
  if (!recomendacion) return null;
  const m = recomendacion.match(/Opci[oó]n\s+(\d+)/i);
  return m ? Number(m[1]) : null;
}

// ── Componente ───────────────────────────────────────────────────────────────

export default function Cap0PropuestasView({
  rawContent,
  temaInicial,
  isGenerating,
  onElegirOpcion,
  onRegenerar,
  onMantenerTema,
}: Props) {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const data = useMemo(() => extractJsonBlock(rawContent), [rawContent]);
  const propuestas = data?.propuestas ?? [];
  const recomendada = detectarOpcionRecomendada(data?.recomendacion);

  // Texto previo al JSON (análisis del tema actual cuando hay tema previo)
  const analisisTexto = useMemo(() => {
    if (!rawContent) return "";
    const idx = rawContent.indexOf("```json");
    if (idx < 0) return rawContent;
    return rawContent.slice(0, idx).trim();
  }, [rawContent]);

  // Fallback: si no se pudo parsear el JSON, mostramos el markdown crudo
  if (!data || propuestas.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{
          padding: "12px 16px", marginBottom: 20,
          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: 10, fontSize: 13, color: "#f59e0b",
        }}>
          ⚠️ La IA generó un formato que no se pudo procesar como cards.
          Mira el texto y elige manualmente. Si querés intentar otra vez, presioná
          &quot;Regenerar propuestas&quot; abajo.
        </div>
        <pre style={{
          whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.7,
          color: "var(--fg-primary)", fontFamily: "var(--font-crimson), serif",
        }}>{rawContent}</pre>
        <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={onRegenerar} disabled={isGenerating} className="btn-cyan" style={{ padding: "10px 16px" }}>
            🔄 Regenerar propuestas
          </button>
          {onMantenerTema && temaInicial && (
            <button onClick={onMantenerTema} disabled={isGenerating} className="btn-ghost" style={{ padding: "10px 16px" }}>
              ✋ Continuar con mi tema actual
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 24px 40px", maxWidth: 1100, margin: "0 auto" }}>

      {/* ── Tu tema actual + análisis ─────────────────────────────────── */}
      {temaInicial && temaInicial !== "(Por definir)" && (
        <div style={{
          padding: "16px 20px", marginBottom: 24,
          background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.20)",
          borderRadius: 12,
        }}>
          <div style={{ fontSize: 11, color: "#818cf8", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
            📌 Tu tema actual
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--fg-primary)", lineHeight: 1.5, marginBottom: 8 }}>
            “{temaInicial}”
          </div>
          {data.viabilidad_final && (
            <div style={{ fontSize: 13, color: "var(--fg-muted)" }}>
              Viabilidad inicial: <strong style={{ color: viabilidadColor(data.viabilidad_final).text }}>
                {viabilidadColor(data.viabilidad_final).emoji} {data.viabilidad_final}
              </strong>
              {data.viabilidad_final !== "ALTA" && " — la IA propone ajustes para mejorar viabilidad"}
            </div>
          )}
        </div>
      )}

      {/* ── Encabezado de las propuestas ──────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg-primary)", margin: "0 0 6px" }}>
          🎯 La IA propone {propuestas.length} {propuestas.length === 1 ? "opción" : "opciones"} para tu monografía
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--fg-muted)", margin: 0, lineHeight: 1.6 }}>
          Cada propuesta es un tema viable con datos públicos verificables.
          Elegí una para continuar con el Capítulo I, o pedí otras opciones.
        </p>
      </div>

      {/* ── Grid de cards ─────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 14,
        marginBottom: 24,
      }}>
        {propuestas.map((p) => {
          const v = viabilidadColor(p.viabilidad);
          const isRec = recomendada === p.numero;
          const isExpanded = expandedCards.has(p.numero);

          return (
            <div
              key={p.numero}
              style={{
                position: "relative",
                background: isRec ? "rgba(167,139,250,0.06)" : "var(--bg-card)",
                border: isRec ? "2px solid rgba(167,139,250,0.45)" : "1px solid var(--border)",
                borderRadius: 14,
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                transition: "transform 0.15s, box-shadow 0.15s",
                boxShadow: isRec ? "0 4px 16px rgba(167,139,250,0.18)" : "var(--shadow-sm)",
              }}
            >
              {isRec && (
                <div style={{
                  position: "absolute", top: -10, left: 14,
                  padding: "3px 10px", borderRadius: 999,
                  background: "linear-gradient(135deg, #a78bfa, #818cf8)",
                  color: "white", fontSize: 10, fontWeight: 800, letterSpacing: "0.05em",
                  boxShadow: "0 2px 6px rgba(167,139,250,0.4)",
                }}>
                  ⭐ RECOMENDADA POR LA IA
                </div>
              )}

              {/* Número y título */}
              <div>
                <div style={{ fontSize: 10, color: "var(--accent)", fontWeight: 800, letterSpacing: "0.12em", marginBottom: 4 }}>
                  OPCIÓN {p.numero}
                </div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--fg-primary)", margin: 0, lineHeight: 1.35 }}>
                  {p.titulo}
                </h2>
              </div>

              {/* Viabilidad badge */}
              <div style={{
                display: "inline-flex", alignSelf: "flex-start",
                padding: "4px 9px", borderRadius: 999,
                background: v.bg, border: `1px solid ${v.border}`, color: v.text,
                fontSize: 11, fontWeight: 700, gap: 5, alignItems: "center",
              }}>
                {v.emoji} Viabilidad {p.viabilidad ?? "—"}
              </div>

              {/* Contexto breve siempre visible */}
              {p.contexto && (
                <div style={{ fontSize: 12.5, color: "var(--fg-secondary)", lineHeight: 1.55 }}>
                  {p.contexto}
                </div>
              )}

              {/* Período + fuentes */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11.5 }}>
                {p.periodo_temporal && (
                  <div style={{ color: "var(--fg-muted)" }}>
                    📊 <strong style={{ color: "var(--fg-primary)" }}>Período:</strong> {p.periodo_temporal}
                  </div>
                )}
                {p.fuentes_datos && p.fuentes_datos.length > 0 && (
                  <div style={{ color: "var(--fg-muted)" }}>
                    🔗 <strong style={{ color: "var(--fg-primary)" }}>Fuentes:</strong>{" "}
                    {p.fuentes_datos.slice(0, 3).join(", ")}
                    {p.fuentes_datos.length > 3 && ` (+${p.fuentes_datos.length - 3})`}
                  </div>
                )}
                {typeof p.requiere_entrevistas === "boolean" && (
                  <div style={{ color: "var(--fg-muted)" }}>
                    {p.requiere_entrevistas ? "🎤 Requiere entrevistas" : "📚 Solo datos secundarios"}
                  </div>
                )}
              </div>

              {/* Detalles expandibles */}
              {isExpanded && (
                <div style={{
                  marginTop: 4, padding: "10px 12px",
                  background: "rgba(148,163,184,0.06)", borderRadius: 8,
                  display: "flex", flexDirection: "column", gap: 8, fontSize: 12, lineHeight: 1.55,
                }}>
                  {p.problema_central && (
                    <div>
                      <strong style={{ color: "var(--accent)", fontSize: 10.5, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Problema central
                      </strong>
                      <div style={{ color: "var(--fg-primary)", marginTop: 2 }}>{p.problema_central}</div>
                    </div>
                  )}
                  {p.pregunta_investigacion && (
                    <div>
                      <strong style={{ color: "var(--accent)", fontSize: 10.5, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Pregunta de investigación
                      </strong>
                      <div style={{ color: "var(--fg-primary)", marginTop: 2 }}>{p.pregunta_investigacion}</div>
                    </div>
                  )}
                  {p.objetivo_general && (
                    <div>
                      <strong style={{ color: "var(--accent)", fontSize: 10.5, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Objetivo general
                      </strong>
                      <div style={{ color: "var(--fg-primary)", marginTop: 2 }}>{p.objetivo_general}</div>
                    </div>
                  )}
                  {p.metodologia && (
                    <div>
                      <strong style={{ color: "var(--accent)", fontSize: 10.5, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Metodología
                      </strong>
                      <div style={{ color: "var(--fg-primary)", marginTop: 2 }}>{p.metodologia}</div>
                    </div>
                  )}
                  {p.fuentes_datos && p.fuentes_datos.length > 3 && (
                    <div>
                      <strong style={{ color: "var(--accent)", fontSize: 10.5, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Todas las fuentes
                      </strong>
                      <div style={{ color: "var(--fg-primary)", marginTop: 2 }}>{p.fuentes_datos.join(", ")}</div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  setExpandedCards(prev => {
                    const next = new Set(prev);
                    if (next.has(p.numero)) next.delete(p.numero);
                    else next.add(p.numero);
                    return next;
                  });
                }}
                style={{
                  background: "transparent", border: "none", color: "var(--fg-muted)",
                  fontSize: 11, cursor: "pointer", padding: "2px 0",
                  textAlign: "left", textDecoration: "underline",
                }}
              >
                {isExpanded ? "Ocultar detalles ⌃" : "Ver más detalles ⌄"}
              </button>

              {/* Botón principal */}
              <button
                onClick={() => onElegirOpcion?.(p)}
                disabled={isGenerating}
                style={{
                  marginTop: "auto",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: isRec
                    ? "linear-gradient(135deg, #8b5cf6, #6366f1)"
                    : "var(--accent)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isGenerating ? "not-allowed" : "pointer",
                  opacity: isGenerating ? 0.5 : 1,
                  transition: "transform 0.1s",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
                }}
              >
                ✓ Elegir esta opción
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Recomendación de la IA ────────────────────────────────────── */}
      {data.recomendacion && (
        <div style={{
          padding: "12px 16px", marginBottom: 28,
          background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.25)",
          borderRadius: 10, fontSize: 13, lineHeight: 1.6, color: "var(--fg-primary)",
        }}>
          <strong style={{ color: "#a78bfa" }}>⭐ Recomendación:</strong> {data.recomendacion}
        </div>
      )}

      {/* ── Acciones alternativas ─────────────────────────────────────── */}
      <div style={{
        padding: 18,
        background: "rgba(148,163,184,0.04)",
        border: "1px dashed var(--border)",
        borderRadius: 12,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          ¿Ninguna te convence?
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={onRegenerar}
            disabled={isGenerating}
            style={{
              padding: "10px 16px", borderRadius: 10,
              border: "1px solid rgba(34,197,94,0.4)",
              background: "rgba(34,197,94,0.08)", color: "#22c55e",
              fontSize: 13, fontWeight: 600,
              cursor: isGenerating ? "not-allowed" : "pointer",
              opacity: isGenerating ? 0.5 : 1,
            }}
          >
            🔄 Regenerar propuestas nuevas
          </button>
          {onMantenerTema && temaInicial && temaInicial !== "(Por definir)" && (
            <button
              onClick={onMantenerTema}
              disabled={isGenerating}
              style={{
                padding: "10px 16px", borderRadius: 10,
                border: "1px solid var(--border)",
                background: "transparent", color: "var(--fg-primary)",
                fontSize: 13, fontWeight: 600,
                cursor: isGenerating ? "not-allowed" : "pointer",
                opacity: isGenerating ? 0.5 : 1,
              }}
            >
              ✋ Continuar con mi tema sin ajustes
            </button>
          )}
        </div>
      </div>

      {/* ── Análisis textual (opcional, colapsable) ──────────────────── */}
      {analisisTexto && analisisTexto.length > 100 && (
        <details style={{ marginTop: 24 }}>
          <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--fg-muted)", padding: "8px 0" }}>
            Ver análisis completo de la IA ⌄
          </summary>
          <pre style={{
            whiteSpace: "pre-wrap", fontSize: 12.5, lineHeight: 1.7,
            color: "var(--fg-secondary)", fontFamily: "var(--font-crimson), serif",
            padding: "12px 16px", marginTop: 8,
            background: "rgba(148,163,184,0.04)", borderRadius: 8,
          }}>{analisisTexto}</pre>
        </details>
      )}
    </div>
  );
}
