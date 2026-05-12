"use client";

import { useMemo } from "react";

interface Props {
  rawContent: string;
}

interface FuenteParsed {
  numero: number;
  texto: string;
  tieneObservacion: boolean;
  observacionTexto?: string;
  tieneAutor: boolean;
  tieneAno: boolean;
  tieneDoi: boolean;
}

function parseFuentes(content: string): FuenteParsed[] {
  if (!content) return [];

  const fuentes: FuenteParsed[] = [];
  // Captura bloques tipo "Fuente N: ... Observación: ..."
  const lines = content.split("\n");
  let current: Partial<FuenteParsed> | null = null;
  let buffer: string[] = [];

  function flush() {
    if (current && current.numero != null) {
      const texto = buffer.join(" ").trim();
      const obsMatch = texto.match(/Observaci[oó]n:\s*(.+)/i);
      const sinObs = texto.replace(/Observaci[oó]n:.*/i, "").trim();
      const tieneAno = /\(\d{4}\)/.test(sinObs);
      const tieneDoi = /doi\.org|DOI/i.test(sinObs);
      const tieneAutor = !/autor desconocido/i.test(sinObs) && sinObs.length > 30;
      fuentes.push({
        numero: current.numero,
        texto: sinObs.slice(0, 180),
        tieneObservacion: !!obsMatch,
        observacionTexto: obsMatch?.[1]?.slice(0, 160),
        tieneAutor,
        tieneAno,
        tieneDoi,
      });
    }
    current = null;
    buffer = [];
  }

  for (const line of lines) {
    const m = line.match(/^\s*\*?\s*\*?\*?Fuente\s*(\d+)[:\.]?\*?\*?\s*(.*)/i);
    if (m) {
      flush();
      current = { numero: parseInt(m[1], 10) };
      buffer = [m[2]];
    } else if (current) {
      buffer.push(line);
    }
  }
  flush();

  return fuentes;
}

function StatCard({ label, value, accent, sub }: { label: string; value: number | string; accent?: string; sub?: string }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      padding: "12px 14px",
      borderRadius: 10,
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
    }}>
      <div style={{ fontSize: 10, color: "var(--fg-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: accent || "var(--fg-primary)", lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 10, color: "var(--fg-muted)", marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

export default function BibliografiaInsights({ rawContent }: Props) {
  const fuentes = useMemo(() => parseFuentes(rawContent || ""), [rawContent]);
  const total = fuentes.length;
  const conObservaciones = fuentes.filter(f => f.tieneObservacion).length;
  const limpias = total - conObservaciones;
  const conDoi = fuentes.filter(f => f.tieneDoi).length;
  const conAutor = fuentes.filter(f => f.tieneAutor).length;
  const conAno = fuentes.filter(f => f.tieneAno).length;
  const cumplimientoApa = total > 0 ? Math.round((conAutor + conAno) / (total * 2) * 100) : 0;

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, height: "100%", overflowY: "auto" }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
          📊 Análisis de Bibliografía
        </div>
        <div style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.5 }}>
          Diagnóstico automático de las {total} fuente{total !== 1 ? "s" : ""} detectada{total !== 1 ? "s" : ""}.
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "flex", gap: 8 }}>
        <StatCard label="Total" value={total} />
        <StatCard label="Limpias" value={limpias} accent="var(--green)" />
        <StatCard label="Observ." value={conObservaciones} accent={conObservaciones > 0 ? "#f59e0b" : undefined} />
      </div>

      {/* Cumplimiento APA */}
      <div style={{
        padding: "14px 16px",
        borderRadius: 12,
        background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))",
        border: "1px solid rgba(99,102,241,0.18)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-primary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Cumplimiento APA 7
          </span>
          <span style={{ fontSize: 16, fontWeight: 800, color: cumplimientoApa >= 80 ? "var(--green)" : cumplimientoApa >= 50 ? "#f59e0b" : "#ef4444" }}>
            {cumplimientoApa}%
          </span>
        </div>
        <div style={{ height: 6, background: "rgba(148,163,184,0.18)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${cumplimientoApa}%`,
            background: cumplimientoApa >= 80 ? "var(--green)" : cumplimientoApa >= 50 ? "#f59e0b" : "#ef4444",
            transition: "width 0.5s ease",
          }} />
        </div>
        <div style={{ fontSize: 10, color: "var(--fg-muted)", marginTop: 8, lineHeight: 1.5 }}>
          {conAutor}/{total} con autor · {conAno}/{total} con año · {conDoi}/{total} con DOI
        </div>
      </div>

      {/* Lista de fuentes */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Estado por fuente
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {fuentes.length === 0 && (
            <div style={{ fontSize: 12, color: "var(--fg-muted)", fontStyle: "italic", padding: 12, textAlign: "center" }}>
              No se detectaron fuentes en el contenido actual.
            </div>
          )}
          {fuentes.map(f => (
            <div
              key={f.numero}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                background: f.tieneObservacion ? "rgba(245,158,11,0.06)" : "rgba(16,185,129,0.05)",
                border: `1px solid ${f.tieneObservacion ? "rgba(245,158,11,0.25)" : "rgba(16,185,129,0.2)"}`,
                fontSize: 11,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontWeight: 700, color: "var(--fg-primary)" }}>Fuente {f.numero}</span>
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: f.tieneObservacion ? "#d97706" : "var(--green)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}>
                  {f.tieneObservacion ? "⚠ Revisar" : "✓ OK"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <span style={{
                  fontSize: 9,
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: f.tieneAutor ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)",
                  color: f.tieneAutor ? "var(--green)" : "#ef4444",
                  fontWeight: 600,
                }}>
                  {f.tieneAutor ? "✓" : "✗"} autor
                </span>
                <span style={{
                  fontSize: 9,
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: f.tieneAno ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)",
                  color: f.tieneAno ? "var(--green)" : "#ef4444",
                  fontWeight: 600,
                }}>
                  {f.tieneAno ? "✓" : "✗"} año
                </span>
                <span style={{
                  fontSize: 9,
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: f.tieneDoi ? "rgba(99,102,241,0.15)" : "rgba(148,163,184,0.12)",
                  color: f.tieneDoi ? "var(--accent)" : "var(--fg-muted)",
                  fontWeight: 600,
                }}>
                  {f.tieneDoi ? "✓" : "—"} DOI
                </span>
              </div>
              {f.tieneObservacion && f.observacionTexto && (
                <div style={{ fontSize: 10, color: "var(--fg-secondary)", marginTop: 5, lineHeight: 1.4, fontStyle: "italic" }}>
                  {f.observacionTexto}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tip APA 7 */}
      <div style={{
        padding: "10px 12px",
        borderRadius: 8,
        background: "rgba(99,102,241,0.06)",
        border: "1px dashed rgba(99,102,241,0.3)",
        fontSize: 10.5,
        color: "var(--fg-secondary)",
        lineHeight: 1.5,
      }}>
        <strong style={{ color: "var(--accent)" }}>Tip APA 7:</strong> Cada referencia debe incluir autor, año, título, fuente y, cuando exista, DOI. Las que muestran ⚠ requieren completar datos antes de exportar.
      </div>
    </div>
  );
}
