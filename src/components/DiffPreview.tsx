"use client";

/**
 * DiffPreview — muestra un diff línea por línea entre dos textos
 * y permite al usuario confirmar/cancelar antes de persistir.
 *
 * Algoritmo: LCS (Longest Common Subsequence) simplificado a nivel de línea.
 * Suficiente para mostrar qué se agregó / eliminó / mantuvo igual.
 *
 * Uso típico:
 *   <DiffPreview
 *     contenidoActual={antes}
 *     contenidoPropuesto={despues}
 *     onAplicar={() => fetch(...)}
 *     onCancelar={() => setMostrar(false)}
 *   />
 */

import { useMemo } from "react";

interface Props {
  contenidoActual: string;
  contenidoPropuesto: string;
  onAplicar: () => void;
  onCancelar: () => void;
  aplicando?: boolean;
  titulo?: string;
}

type LineaDiff =
  | { tipo: "igual"; texto: string; numeroAntes: number; numeroDespues: number }
  | { tipo: "agregada"; texto: string; numeroDespues: number }
  | { tipo: "eliminada"; texto: string; numeroAntes: number };

function calcularDiff(antes: string, despues: string): LineaDiff[] {
  const lineasAntes = antes.split("\n");
  const lineasDespues = despues.split("\n");

  // Tabla LCS
  const m = lineasAntes.length;
  const n = lineasDespues.length;
  const lcs: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (lineasAntes[i - 1] === lineasDespues[j - 1]) {
        lcs[i][j] = lcs[i - 1][j - 1] + 1;
      } else {
        lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
      }
    }
  }

  // Reconstruir diff desde el final
  const resultado: LineaDiff[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (lineasAntes[i - 1] === lineasDespues[j - 1]) {
      resultado.unshift({
        tipo: "igual",
        texto: lineasAntes[i - 1],
        numeroAntes: i,
        numeroDespues: j,
      });
      i--;
      j--;
    } else if (lcs[i - 1][j] >= lcs[i][j - 1]) {
      resultado.unshift({ tipo: "eliminada", texto: lineasAntes[i - 1], numeroAntes: i });
      i--;
    } else {
      resultado.unshift({ tipo: "agregada", texto: lineasDespues[j - 1], numeroDespues: j });
      j--;
    }
  }
  while (i > 0) {
    resultado.unshift({ tipo: "eliminada", texto: lineasAntes[i - 1], numeroAntes: i });
    i--;
  }
  while (j > 0) {
    resultado.unshift({ tipo: "agregada", texto: lineasDespues[j - 1], numeroDespues: j });
    j--;
  }

  return resultado;
}

export default function DiffPreview({
  contenidoActual,
  contenidoPropuesto,
  onAplicar,
  onCancelar,
  aplicando = false,
  titulo = "Cambios propuestos por la IA",
}: Props) {
  const diff = useMemo(
    () => calcularDiff(contenidoActual, contenidoPropuesto),
    [contenidoActual, contenidoPropuesto],
  );

  const agregadas = diff.filter((l) => l.tipo === "agregada").length;
  const eliminadas = diff.filter((l) => l.tipo === "eliminada").length;
  const sinCambios = diff.filter((l) => l.tipo === "igual").length;
  const totalLineas = diff.length;
  const porcentajeCambio =
    totalLineas > 0 ? Math.round(((agregadas + eliminadas) / totalLineas) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "white" }}>
      {/* Header */}
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
            Previsualización de cambios
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{titulo}</div>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 12, alignItems: "center" }}>
          <span style={{ color: "#16a34a", fontWeight: 600 }}>+{agregadas} agregadas</span>
          <span style={{ color: "#dc2626", fontWeight: 600 }}>−{eliminadas} eliminadas</span>
          <span style={{ color: "#64748b" }}>{sinCambios} sin cambios</span>
          <span
            style={{
              padding: "3px 8px",
              borderRadius: 999,
              background: porcentajeCambio > 50 ? "rgba(239,68,68,0.12)" : porcentajeCambio > 20 ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.12)",
              color: porcentajeCambio > 50 ? "#b91c1c" : porcentajeCambio > 20 ? "#92400e" : "#15803d",
              fontWeight: 700,
              fontSize: 11,
            }}
          >
            {porcentajeCambio}% modificado
          </span>
        </div>
      </div>

      {/* Diff viewer */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 0,
          fontFamily: "ui-monospace, SF Mono, Menlo, Consolas, monospace",
          fontSize: 12,
          lineHeight: 1.55,
          background: "#fafafa",
        }}
      >
        {diff.map((linea, i) => {
          const bg = linea.tipo === "agregada" ? "#dcfce7" : linea.tipo === "eliminada" ? "#fee2e2" : "transparent";
          const marker = linea.tipo === "agregada" ? "+" : linea.tipo === "eliminada" ? "−" : " ";
          const colorMarker = linea.tipo === "agregada" ? "#15803d" : linea.tipo === "eliminada" ? "#b91c1c" : "#94a3b8";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                background: bg,
                borderLeft: `3px solid ${linea.tipo === "igual" ? "transparent" : colorMarker}`,
                padding: "1px 0",
              }}
            >
              <span
                style={{
                  width: 32,
                  flexShrink: 0,
                  textAlign: "center",
                  color: colorMarker,
                  fontWeight: 700,
                  userSelect: "none",
                }}
              >
                {marker}
              </span>
              <span style={{ flex: 1, whiteSpace: "pre-wrap", wordBreak: "break-word", color: "#0f172a", paddingRight: 14 }}>
                {linea.texto || " "}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer con acciones */}
      <div
        style={{
          padding: "14px 18px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          background: "#f8fafc",
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
        }}
      >
        <button
          type="button"
          onClick={onCancelar}
          disabled={aplicando}
          style={{
            fontSize: 13,
            fontWeight: 600,
            padding: "10px 18px",
            borderRadius: 8,
            background: "white",
            border: "1px solid #cbd5e1",
            color: "#475569",
            cursor: aplicando ? "not-allowed" : "pointer",
          }}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onAplicar}
          disabled={aplicando}
          style={{
            fontSize: 13,
            fontWeight: 700,
            padding: "10px 20px",
            borderRadius: 8,
            background: aplicando ? "#94a3b8" : "#16a34a",
            color: "white",
            border: "none",
            cursor: aplicando ? "not-allowed" : "pointer",
          }}
        >
          {aplicando ? "Aplicando…" : "✓ Aplicar cambios"}
        </button>
      </div>
    </div>
  );
}
