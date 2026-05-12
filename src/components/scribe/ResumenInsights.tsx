"use client";

import { useMemo } from "react";

interface Props {
  rawContent: string;
}

const STOP_WORDS = new Set([
  "el","la","los","las","de","del","y","o","un","una","unos","unas","en","con","por","para","que",
  "se","su","sus","al","es","como","más","pero","sin","sobre","entre","cuando","muy","ya","fue",
  "este","esta","estos","estas","ese","esa","esos","esas","ha","han","hay","si","no","lo","le",
  "les","me","te","nos","yo","tú","él","ella","ellos","ellas","mi","tu","nuestro","vuestro",
  "porque","también","tras","desde","hasta","hacia","durante","mediante","según","ante","bajo",
]);

function extractKeywords(text: string, limit = 8): { word: string; count: number }[] {
  const cleaned = text.toLowerCase().replace(/[^a-záéíóúñ\s]/g, " ");
  const words = cleaned.split(/\s+/).filter(w => w.length > 4 && !STOP_WORDS.has(w));
  const counts = new Map<string, number>();
  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export default function ResumenInsights({ rawContent }: Props) {
  const stats = useMemo(() => {
    const text = (rawContent || "").replace(/[#*_`]/g, "");
    const palabras = text.split(/\s+/).filter(Boolean);
    const wordCount = palabras.length;
    const charCount = text.length;
    const oraciones = text.split(/[.!?]+/).filter(s => s.trim().length > 10).length;
    const lecturaMin = Math.max(1, Math.round(wordCount / 200));
    const keywords = extractKeywords(text);
    const tieneObjetivo = /objetivo|propósito|finalidad/i.test(text);
    const tieneMetodologia = /metodolog|método|análisis|enfoque/i.test(text);
    const tieneResultados = /resultado|conclusi|hallaz/i.test(text);
    const tienePalabrasClave = /palabras\s*clave/i.test(text);
    return { wordCount, charCount, oraciones, lecturaMin, keywords, tieneObjetivo, tieneMetodologia, tieneResultados, tienePalabrasClave };
  }, [rawContent]);

  // APA típicamente recomienda 150-250 palabras para abstract. Aquí usamos 250-400 según el sistema.
  const targetMin = 250;
  const targetMax = 400;
  const wordsInRange = stats.wordCount >= targetMin && stats.wordCount <= targetMax;
  const progress = Math.min(100, (stats.wordCount / targetMax) * 100);

  const checklist = [
    { label: "Objetivo del estudio", ok: stats.tieneObjetivo },
    { label: "Metodología o enfoque", ok: stats.tieneMetodologia },
    { label: "Resultados o conclusiones", ok: stats.tieneResultados },
    { label: "Palabras clave (APA 7)", ok: stats.tienePalabrasClave },
  ];
  const checksOk = checklist.filter(c => c.ok).length;

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, height: "100%", overflowY: "auto" }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
          📝 Análisis del Resumen
        </div>
        <div style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.5 }}>
          Indicadores de extensión y cobertura del resumen ejecutivo.
        </div>
      </div>

      {/* Conteo de palabras con rango objetivo */}
      <div style={{
        padding: "14px 16px",
        borderRadius: 12,
        background: wordsInRange
          ? "linear-gradient(135deg, rgba(16,185,129,0.10), rgba(16,185,129,0.04))"
          : "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(245,158,11,0.04))",
        border: `1px solid ${wordsInRange ? "rgba(16,185,129,0.28)" : "rgba(245,158,11,0.28)"}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-primary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Palabras
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, color: wordsInRange ? "var(--green)" : "#d97706", lineHeight: 1 }}>
            {stats.wordCount}
          </span>
        </div>
        <div style={{ position: "relative", height: 8, background: "rgba(148,163,184,0.18)", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
          <div style={{
            position: "absolute", left: `${(targetMin / targetMax) * 100}%`, top: 0, bottom: 0,
            width: 2, background: "rgba(99,102,241,0.6)",
          }} />
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: wordsInRange ? "var(--green)" : "#f59e0b",
            transition: "width 0.5s ease",
          }} />
        </div>
        <div style={{ fontSize: 10, color: "var(--fg-muted)", display: "flex", justifyContent: "space-between" }}>
          <span>Rango ideal: {targetMin}–{targetMax}</span>
          <span>{wordsInRange ? "✓ en rango" : stats.wordCount < targetMin ? `Falta ${targetMin - stats.wordCount}` : `Reducir ${stats.wordCount - targetMax}`}</span>
        </div>
      </div>

      {/* Stats secundarias */}
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 9, color: "var(--fg-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Oraciones</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--fg-primary)" }}>{stats.oraciones}</div>
        </div>
        <div style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 9, color: "var(--fg-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Caracteres</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--fg-primary)" }}>{stats.charCount.toLocaleString()}</div>
        </div>
        <div style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 9, color: "var(--fg-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Lectura</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--fg-primary)" }}>{stats.lecturaMin} min</div>
        </div>
      </div>

      {/* Checklist de cobertura */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Cobertura editorial
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: checksOk === 4 ? "var(--green)" : "var(--fg-secondary)" }}>
            {checksOk}/4
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {checklist.map(item => (
            <div
              key={item.label}
              style={{
                padding: "8px 10px",
                borderRadius: 7,
                background: item.ok ? "rgba(16,185,129,0.06)" : "rgba(148,163,184,0.06)",
                border: `1px solid ${item.ok ? "rgba(16,185,129,0.22)" : "rgba(148,163,184,0.18)"}`,
                display: "flex", alignItems: "center", gap: 8, fontSize: 11,
              }}
            >
              <span style={{ color: item.ok ? "var(--green)" : "var(--fg-muted)", fontWeight: 800 }}>
                {item.ok ? "✓" : "○"}
              </span>
              <span style={{ color: "var(--fg-primary)" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Palabras clave detectadas */}
      {stats.keywords.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Términos recurrentes
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {stats.keywords.map(k => (
              <span
                key={k.word}
                style={{
                  fontSize: 10,
                  padding: "3px 8px",
                  borderRadius: 999,
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.22)",
                  color: "var(--accent)",
                  fontWeight: 600,
                }}
              >
                {k.word} <span style={{ opacity: 0.6 }}>·{k.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      <div style={{
        padding: "10px 12px",
        borderRadius: 8,
        background: "rgba(99,102,241,0.06)",
        border: "1px dashed rgba(99,102,241,0.3)",
        fontSize: 10.5,
        color: "var(--fg-secondary)",
        lineHeight: 1.5,
      }}>
        <strong style={{ color: "var(--accent)" }}>Tip APA 7:</strong> El resumen debe ser un texto continuo, sin sangría, que cubra propósito, método, resultados y conclusión. Termina con 3-5 palabras clave.
      </div>
    </div>
  );
}
