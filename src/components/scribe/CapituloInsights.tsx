"use client";

import { useMemo } from "react";

interface Props {
  rawContent: string;
  capLabel?: string;
}

interface SeccionDetectada {
  numero: string;
  titulo: string;
  palabras: number;
}

export default function CapituloInsights({ rawContent, capLabel }: Props) {
  const analysis = useMemo(() => {
    const text = rawContent || "";
    const plainText = text.replace(/[#*_`]/g, "");
    const palabras = plainText.split(/\s+/).filter(Boolean);
    const wordCount = palabras.length;
    const parrafos = text.split(/\n\n+/).filter(p => p.trim().length > 40).length;
    const oraciones = plainText.split(/[.!?]+/).filter(s => s.trim().length > 15).length;
    const paginasEstimadas = Math.max(1, Math.round(wordCount / 280));
    const lecturaMin = Math.max(1, Math.round(wordCount / 200));

    // Detectar secciones tipo "1.1 Título" o "## 1.1 Título"
    const secciones: SeccionDetectada[] = [];
    const seccionRegex = /(?:^|\n)\s*#{0,3}\s*(\d+\.\d+(?:\.\d+)?)\s+([^\n]+)/g;
    const tempPositions: { numero: string; titulo: string; start: number }[] = [];
    let m;
    while ((m = seccionRegex.exec(text)) !== null) {
      tempPositions.push({ numero: m[1], titulo: m[2].replace(/[*_#]/g, "").trim().slice(0, 80), start: m.index });
    }
    for (let i = 0; i < tempPositions.length; i++) {
      const start = tempPositions[i].start;
      const end = i + 1 < tempPositions.length ? tempPositions[i + 1].start : text.length;
      const chunk = text.slice(start, end).replace(/[#*_`]/g, "");
      const wc = chunk.split(/\s+/).filter(Boolean).length;
      secciones.push({ numero: tempPositions[i].numero, titulo: tempPositions[i].titulo, palabras: wc });
    }

    // Detectar citas APA: (Autor, año) o (Autor et al., año)
    const citasRegex = /\(([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+et\s+al\.?)?(?:\s*&\s*[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?),\s*(\d{4})\)/g;
    const citasMatches = text.match(citasRegex) || [];
    const citasUnicas = new Set(citasMatches);

    // Densidad de citas (citas por 100 palabras)
    const densidadCitas = wordCount > 0 ? (citasMatches.length / wordCount) * 100 : 0;

    return { wordCount, parrafos, oraciones, paginasEstimadas, lecturaMin, secciones, totalCitas: citasMatches.length, citasUnicas: citasUnicas.size, densidadCitas };
  }, [rawContent]);

  const densidadColor = analysis.densidadCitas >= 1 ? "var(--green)" : analysis.densidadCitas >= 0.5 ? "#f59e0b" : "#ef4444";
  const densidadLabel = analysis.densidadCitas >= 1 ? "Buena" : analysis.densidadCitas >= 0.5 ? "Media" : "Baja";

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, height: "100%", overflowY: "auto" }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
          📖 Análisis del Capítulo
        </div>
        <div style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.5 }}>
          {capLabel ? `Métricas para ${capLabel}` : "Métricas de redacción y citaciones."}
        </div>
      </div>

      {/* Métricas principales */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ padding: "12px 14px", borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 9, color: "var(--fg-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Palabras</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--fg-primary)", lineHeight: 1 }}>{analysis.wordCount.toLocaleString()}</div>
        </div>
        <div style={{ padding: "12px 14px", borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 9, color: "var(--fg-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Páginas</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--fg-primary)", lineHeight: 1 }}>~{analysis.paginasEstimadas}</div>
        </div>
        <div style={{ padding: "12px 14px", borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 9, color: "var(--fg-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Párrafos</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--fg-primary)", lineHeight: 1 }}>{analysis.parrafos}</div>
        </div>
        <div style={{ padding: "12px 14px", borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 9, color: "var(--fg-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Lectura</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--fg-primary)", lineHeight: 1 }}>{analysis.lecturaMin}<span style={{ fontSize: 12, opacity: 0.6 }}> min</span></div>
        </div>
      </div>

      {/* Citas y densidad */}
      <div style={{
        padding: "14px 16px",
        borderRadius: 12,
        background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))",
        border: "1px solid rgba(99,102,241,0.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-primary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Citaciones APA
          </span>
          <span style={{ fontSize: 11, color: densidadColor, fontWeight: 700 }}>
            {densidadLabel}
          </span>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)", lineHeight: 1 }}>{analysis.totalCitas}</div>
            <div style={{ fontSize: 10, color: "var(--fg-muted)", marginTop: 2 }}>Total</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--fg-primary)", lineHeight: 1 }}>{analysis.citasUnicas}</div>
            <div style={{ fontSize: 10, color: "var(--fg-muted)", marginTop: 2 }}>Únicas</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: densidadColor, lineHeight: 1 }}>{analysis.densidadCitas.toFixed(1)}</div>
            <div style={{ fontSize: 10, color: "var(--fg-muted)", marginTop: 2 }}>/100 pal.</div>
          </div>
        </div>
      </div>

      {/* Estructura por secciones */}
      {analysis.secciones.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Estructura ({analysis.secciones.length} sección{analysis.secciones.length !== 1 ? "es" : ""})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {analysis.secciones.map((s, i) => {
              const maxWords = Math.max(...analysis.secciones.map(x => x.palabras), 1);
              const pct = (s.palabras / maxWords) * 100;
              return (
                <div key={i} style={{ padding: "7px 10px", borderRadius: 7, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "var(--accent)", fontFamily: "monospace" }}>{s.numero}</span>
                    <span style={{ fontSize: 11, color: "var(--fg-primary)", fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.titulo}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--fg-muted)", fontWeight: 600 }}>{s.palabras}</span>
                  </div>
                  <div style={{ height: 3, background: "rgba(148,163,184,0.18)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
