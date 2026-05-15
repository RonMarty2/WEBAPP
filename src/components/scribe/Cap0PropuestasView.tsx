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
  /** true si el tema ya fue confirmado (no se puede volver al selector). */
  temaConfirmado?: boolean;
  /** Tema final guardado en BD (para mostrar en pantalla de "ya confirmado"). */
  temaFinalConfirmado?: string;
  onElegirOpcion?: (propuesta: Propuesta) => void;
  onRegenerar?: () => void;
  onMantenerTema?: () => void;
  /** Callback para ir al siguiente capítulo (Cap I). */
  onIrACapI?: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extrae propuestas del output del LLM. Estrategia en 3 niveles:
 *  1) Bloque JSON fenced (```json...```) — formato ideal
 *  2) Último bloque JSON suelto en el texto
 *  3) Parser de markdown: detecta "Opción N", "OPCIÓN N", "## OPCIÓN N:" etc.
 *     y arma propuestas a partir del texto. Esto cubre los casos en que el
 *     LLM se olvida de incluir el bloque JSON estructurado.
 */
function extractJsonBlock(text: string): Cap0Json | null {
  if (!text) return null;

  // 1) JSON fenced
  const fenced = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (fenced?.[1]) {
    try { return JSON.parse(fenced[1]) as Cap0Json; } catch { /* try next */ }
  }

  // 2) JSON suelto al final
  const lastBrace = text.lastIndexOf("{");
  if (lastBrace >= 0) {
    const closing = findMatchingBrace(text, lastBrace);
    if (closing > lastBrace) {
      try { return JSON.parse(text.slice(lastBrace, closing + 1)) as Cap0Json; } catch { /* try next */ }
    }
  }

  // 3) Fallback: parser de markdown
  return parseFromMarkdown(text);
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

/**
 * Extrae propuestas desde markdown cuando el LLM olvidó el bloque JSON.
 * Detecta patrones tipo "**Opción N — Título**" o "## OPCIÓN N: Título".
 */
function parseFromMarkdown(text: string): Cap0Json | null {
  if (!text) return null;

  // Regex para detectar inicio de opción + capturar su título
  // Acepta: "**Opción 1 — ...**", "## OPCIÓN 1: ...", "### Opción 1.", "Opción 1:", etc.
  const optionPattern = /(?:^|\n)\s*(?:#{2,4}\s*)?(?:\*\*)?(?:OPCI[ÓO]N|Opci[óo]n)\s+(\d+)\s*[—:.\-]?\s*([^\n*]{0,200})(?:\*\*)?/gm;
  const matches: Array<{ numero: number; titulo: string; start: number; end: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = optionPattern.exec(text)) !== null) {
    matches.push({
      numero: Number(m[1]),
      titulo: m[2].trim().replace(/[*:.\s]+$/, ""),
      start: m.index,
      end: m.index + m[0].length,
    });
  }

  if (matches.length < 2) return null; // necesitamos al menos 2 propuestas

  // Para cada opción, capturar el bloque de texto que le sigue (hasta la siguiente opción)
  const propuestas: Propuesta[] = matches.map((opt, i) => {
    const blockStart = opt.end;
    const blockEnd = i < matches.length - 1 ? matches[i + 1].start : Math.min(text.length, opt.end + 2000);
    const block = text.slice(blockStart, blockEnd);

    // Extraer atributos del bloque con regexes específicas
    const ctxMatch = block.match(/(?:\*\*)?(?:Contexto|Mejora|Ajuste)(?:\*\*)?\s*[:\-—]\s*([^\n]{20,500})/i);
    const probMatch = block.match(/(?:\*\*)?Problema(?:\s+central)?(?:\*\*)?\s*[:\-—]\s*([^\n]{10,500})/i);
    const pregMatch = block.match(/(?:\*\*)?Pregunta[^*\n:]{0,30}(?:\*\*)?\s*[:\-—]\s*([^\n]{10,500})/i);
    const objMatch  = block.match(/(?:\*\*)?Objetivo[^*\n:]{0,30}(?:\*\*)?\s*[:\-—]\s*([^\n]{10,500})/i);
    const periodoMatch = block.match(/(?:\*\*)?Per[ií]odo[^*\n:]{0,30}(?:\*\*)?\s*[:\-—]\s*(\d{4}\s*[-–—]\s*\d{4}|\d{4})/i);
    const viabMatch = block.match(/(?:\*\*)?Viabilidad[^*\n:]{0,30}(?:\*\*)?\s*[:\-—]\s*[^A-Z]*?(ALTA|MEDIA|BAJA)/i);
    const fuentesMatch = block.match(/(?:\*\*)?Fuentes[^*\n:]{0,30}(?:\*\*)?\s*[:\-—]\s*([^\n]{5,400})/i);
    const entrevMatch = block.match(/(?:\*\*)?(?:Requiere\s+entrevistas?|entrevistas?)(?:\*\*)?\s*[:\-—]\s*(NO|N[oO]|S[íiI])/i);

    const fuentesDatos = fuentesMatch?.[1]
      ?.split(/[,;]/)
      ?.map(s => s.trim())
      ?.filter(s => s.length > 2 && s.length < 80)
      ?.slice(0, 6)
      ?? undefined;

    return {
      numero: opt.numero,
      titulo: opt.titulo || `Opción ${opt.numero}`,
      contexto: ctxMatch?.[1]?.trim(),
      problema_central: probMatch?.[1]?.trim(),
      pregunta_investigacion: pregMatch?.[1]?.trim(),
      objetivo_general: objMatch?.[1]?.trim(),
      periodo_temporal: periodoMatch?.[1]?.trim(),
      fuentes_datos: fuentesDatos,
      viabilidad: (viabMatch?.[1]?.toUpperCase() as Propuesta["viabilidad"]) ?? "ALTA",
      requiere_entrevistas: entrevMatch ? !/n[oO]/i.test(entrevMatch[1]) : false,
    };
  }).filter(p => p.titulo && p.titulo.length > 3);

  if (propuestas.length === 0) return null;

  // Detectar viabilidad inicial del tema y recomendación
  const viabIniMatch = text.match(/Viabilidad\s+inicial[^A-Z\n]*?(ALTA|MEDIA|BAJA)/i);
  const recMatch = text.match(/(?:Recomendaci[óo]n|Te\s+(?:recomiendo|sugiero))[:\s][\s\S]{0,400}?(?=\n\n|\n###|\n##|$)/i);

  return {
    etapa: 0,
    status: "propuestas_generadas",
    viabilidad_final: (viabIniMatch?.[1]?.toUpperCase() as Cap0Json["viabilidad_final"]) ?? "ALTA",
    propuestas,
    recomendacion: recMatch?.[0]?.replace(/^[*\s:]+/, "").trim().slice(0, 400),
  };
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
  temaConfirmado,
  temaFinalConfirmado,
  onElegirOpcion,
  onRegenerar,
  onMantenerTema,
  onIrACapI,
}: Props) {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [confirmacion, setConfirmacion] = useState<{
    tipo: "elegir" | "mantener";
    propuesta?: Propuesta;
  } | null>(null);

  const data = useMemo(() => extractJsonBlock(rawContent), [rawContent]);
  const propuestas = data?.propuestas ?? [];
  const recomendada = detectarOpcionRecomendada(data?.recomendacion);

  // ── Pantalla de TEMA CONFIRMADO (irreversible) ──────────────────────────
  if (temaConfirmado) {
    return (
      <div style={{ padding: "60px 24px", maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "linear-gradient(135deg, #4ade80, #22c55e)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
          boxShadow: "0 8px 24px rgba(34,197,94,0.35)",
          fontSize: 40,
        }}>✓</div>

        <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>
          Tema Confirmado
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg-primary)", margin: "0 0 18px", lineHeight: 1.35 }}>
          {temaFinalConfirmado || temaInicial || "Tu tema de investigación"}
        </h1>

        <p style={{ fontSize: 14, color: "var(--fg-secondary)", lineHeight: 1.7, margin: "0 0 28px", maxWidth: 540, marginInline: "auto" }}>
          Este tema se usará como base de los capítulos I al V de tu monografía.
          Ya no puedes cambiarlo desde aquí: cada capítulo dependerá de él.
        </p>

        <div style={{
          padding: "14px 18px", background: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.25)", borderRadius: 10,
          fontSize: 12.5, color: "var(--fg-secondary)", lineHeight: 1.6,
          maxWidth: 540, margin: "0 auto 28px",
        }}>
          💡 Si necesitas un tema diferente, puedes crear un proyecto nuevo
          desde el dashboard.
        </div>

        {onIrACapI && (
          <button
            onClick={onIrACapI}
            style={{
              padding: "12px 32px",
              borderRadius: 999,
              border: "none",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(99,102,241,0.32)",
            }}
          >
            Continuar al Capítulo I →
          </button>
        )}
      </div>
    );
  }

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
          Mira el texto y elige manualmente. Si quieres intentar otra vez, presiona
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
          Elige una para continuar con el Capítulo I, o pedí otras opciones.
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
                onClick={() => setConfirmacion({ tipo: "elegir", propuesta: p })}
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
              onClick={() => setConfirmacion({ tipo: "mantener" })}
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

      {/* ── Modal de confirmación irreversible ────────────────────────── */}
      {confirmacion && (
        <div
          onClick={() => setConfirmacion(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
            animation: "lab-fade-in 200ms ease-out",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 480,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "28px 28px 24px",
              boxShadow: "0 20px 50px rgba(15,23,42,0.35)",
              animation: "lab-scale-in 220ms cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, marginBottom: 16,
            }}>⚠️</div>

            <h3 style={{ fontSize: 19, fontWeight: 800, color: "var(--fg-primary)", margin: "0 0 10px" }}>
              ¿Estás seguro de tu elección?
            </h3>

            <div style={{ fontSize: 13.5, color: "var(--fg-secondary)", lineHeight: 1.65, marginBottom: 14 }}>
              {confirmacion.tipo === "elegir" ? (
                <>
                  Vas a confirmar el tema:
                  <div style={{
                    margin: "10px 0",
                    padding: "10px 14px",
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: 8,
                    color: "var(--fg-primary)",
                    fontWeight: 600,
                    fontSize: 13,
                  }}>
                    “{confirmacion.propuesta?.titulo}”
                  </div>
                </>
              ) : (
                <>
                  Vas a continuar con tu tema actual:
                  <div style={{
                    margin: "10px 0",
                    padding: "10px 14px",
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: 8,
                    color: "var(--fg-primary)",
                    fontWeight: 600,
                    fontSize: 13,
                  }}>
                    “{temaInicial}”
                  </div>
                </>
              )}
            </div>

            <div style={{
              padding: "12px 14px",
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: 10,
              fontSize: 12.5,
              color: "var(--fg-secondary)",
              lineHeight: 1.6,
              marginBottom: 22,
            }}>
              <strong style={{ color: "#f59e0b" }}>Esta decisión es definitiva.</strong>
              {" "}Una vez confirmes, no podrás volver al selector de tema.
              Los Capítulos I al V se construirán sobre esta elección.
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmacion(null)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--fg-primary)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (confirmacion.tipo === "elegir" && confirmacion.propuesta) {
                    onElegirOpcion?.(confirmacion.propuesta);
                  } else if (confirmacion.tipo === "mantener") {
                    onMantenerTema?.();
                  }
                  setConfirmacion(null);
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.32)",
                }}
              >
                Sí, confirmar y continuar
              </button>
            </div>
          </div>
          <style>{`
            @keyframes lab-fade-in { from { opacity: 0; } to { opacity: 1; } }
            @keyframes lab-scale-in { from { opacity: 0; transform: scale(0.96) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          `}</style>
        </div>
      )}
    </div>
  );
}
