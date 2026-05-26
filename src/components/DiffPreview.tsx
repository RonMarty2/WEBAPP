"use client";

/**
 * DiffPreview — muestra un diff entre dos textos resaltando los cambios
 * a nivel de palabra DENTRO de las líneas modificadas.
 *
 * Algoritmo de 2 niveles:
 *   1. LCS por líneas para detectar qué líneas cambiaron.
 *   2. Si dos líneas cambiadas son "similares" (eliminada+agregada
 *      consecutivas con palabras en común), se hace un segundo LCS por
 *      palabras DENTRO de esas líneas y se renderizan en una sola fila
 *      con las palabras añadidas en verde y las quitadas en rojo tachado.
 *
 * Esto evita el efecto "dos párrafos casi idénticos" cuando el cambio
 * real es chiquito (ej. agregar una cita APA).
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

// ─── Diff a nivel línea ─────────────────────────────────────────────

type LineaDiff =
  | { tipo: "igual"; texto: string; numeroAntes: number; numeroDespues: number }
  | { tipo: "agregada"; texto: string; numeroDespues: number }
  | { tipo: "eliminada"; texto: string; numeroAntes: number };

function calcularDiffLineas(antes: string, despues: string): LineaDiff[] {
  const lineasAntes = antes.split("\n");
  const lineasDespues = despues.split("\n");
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

  const resultado: LineaDiff[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (lineasAntes[i - 1] === lineasDespues[j - 1]) {
      resultado.unshift({ tipo: "igual", texto: lineasAntes[i - 1], numeroAntes: i, numeroDespues: j });
      i--; j--;
    } else if (lcs[i - 1][j] >= lcs[i][j - 1]) {
      resultado.unshift({ tipo: "eliminada", texto: lineasAntes[i - 1], numeroAntes: i });
      i--;
    } else {
      resultado.unshift({ tipo: "agregada", texto: lineasDespues[j - 1], numeroDespues: j });
      j--;
    }
  }
  while (i > 0) { resultado.unshift({ tipo: "eliminada", texto: lineasAntes[i - 1], numeroAntes: i }); i--; }
  while (j > 0) { resultado.unshift({ tipo: "agregada", texto: lineasDespues[j - 1], numeroDespues: j }); j--; }
  return resultado;
}

// ─── Diff a nivel palabra DENTRO de una línea ────────────────────────

type TokenDiff = { tipo: "igual" | "agregada" | "eliminada"; texto: string };

/** Tokeniza un texto en palabras + separadores (espacios, puntuación) preservados. */
function tokenizar(texto: string): string[] {
  // Divide manteniendo cualquier secuencia de caracteres no-palabra como token separado.
  // Ej. "Hola, mundo." → ["Hola", ", ", "mundo", "."]
  const matches = texto.match(/(\w+|\s+|[^\w\s]+)/g);
  return matches ?? [];
}

/** LCS sobre tokens, devuelve el diff con tipo por token. */
function calcularDiffPalabras(antes: string, despues: string): TokenDiff[] {
  const tokensAntes = tokenizar(antes);
  const tokensDespues = tokenizar(despues);
  const m = tokensAntes.length;
  const n = tokensDespues.length;
  const lcs: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (tokensAntes[i - 1] === tokensDespues[j - 1]) {
        lcs[i][j] = lcs[i - 1][j - 1] + 1;
      } else {
        lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
      }
    }
  }

  const resultado: TokenDiff[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (tokensAntes[i - 1] === tokensDespues[j - 1]) {
      resultado.unshift({ tipo: "igual", texto: tokensAntes[i - 1] });
      i--; j--;
    } else if (lcs[i - 1][j] >= lcs[i][j - 1]) {
      resultado.unshift({ tipo: "eliminada", texto: tokensAntes[i - 1] });
      i--;
    } else {
      resultado.unshift({ tipo: "agregada", texto: tokensDespues[j - 1] });
      j--;
    }
  }
  while (i > 0) { resultado.unshift({ tipo: "eliminada", texto: tokensAntes[i - 1] }); i--; }
  while (j > 0) { resultado.unshift({ tipo: "agregada", texto: tokensDespues[j - 1] }); j--; }
  return resultado;
}

/** Estima si dos líneas son "similares" (comparten suficientes palabras
 *  para hacer word-diff entre ellas en lugar de mostrar 2 líneas separadas). */
function lineasSonSimilares(a: string, b: string): boolean {
  const palabrasA = new Set(a.toLowerCase().match(/\w+/g) ?? []);
  const palabrasB = new Set(b.toLowerCase().match(/\w+/g) ?? []);
  if (palabrasA.size === 0 || palabrasB.size === 0) return false;
  let comunes = 0;
  for (const p of palabrasA) if (palabrasB.has(p)) comunes++;
  // Si más del 35% de las palabras coinciden, las tratamos como modificación
  // de la misma línea (no como líneas distintas).
  const overlap = comunes / Math.min(palabrasA.size, palabrasB.size);
  return overlap >= 0.35;
}

// ─── Agrupar pares eliminada+agregada similares en una sola fila ────

type FilaDiff =
  | { tipo: "igual"; texto: string }
  | { tipo: "agregada"; texto: string }
  | { tipo: "eliminada"; texto: string }
  | { tipo: "modificada"; tokens: TokenDiff[] };

function agruparEnFilas(lineas: LineaDiff[]): FilaDiff[] {
  const filas: FilaDiff[] = [];
  let i = 0;
  while (i < lineas.length) {
    const l = lineas[i];
    if (l.tipo === "igual") {
      filas.push({ tipo: "igual", texto: l.texto });
      i++;
      continue;
    }
    // ¿Hay una eliminada+agregada consecutivas similares?
    if (l.tipo === "eliminada" && i + 1 < lineas.length) {
      const sig = lineas[i + 1];
      if (sig.tipo === "agregada" && lineasSonSimilares(l.texto, sig.texto)) {
        const tokens = calcularDiffPalabras(l.texto, sig.texto);
        filas.push({ tipo: "modificada", tokens });
        i += 2;
        continue;
      }
    }
    // No hay agrupación: línea pura agregada o eliminada
    filas.push(l.tipo === "agregada"
      ? { tipo: "agregada", texto: l.texto }
      : { tipo: "eliminada", texto: l.texto });
    i++;
  }
  return filas;
}

// ─── Componente ─────────────────────────────────────────────────────

export default function DiffPreview({
  contenidoActual,
  contenidoPropuesto,
  onAplicar,
  onCancelar,
  aplicando = false,
  titulo = "Cambios propuestos por la IA",
}: Props) {
  const filas = useMemo(() => {
    const lineas = calcularDiffLineas(contenidoActual, contenidoPropuesto);
    return agruparEnFilas(lineas);
  }, [contenidoActual, contenidoPropuesto]);

  // Contadores: una "modificación" cuenta como 1 cambio (no como agregada+eliminada)
  const modificadas = filas.filter((f) => f.tipo === "modificada").length;
  const agregadas = filas.filter((f) => f.tipo === "agregada").length;
  const eliminadas = filas.filter((f) => f.tipo === "eliminada").length;
  const sinCambios = filas.filter((f) => f.tipo === "igual").length;
  const totalCambios = modificadas + agregadas + eliminadas;
  const totalFilas = filas.length;
  const porcentajeCambio = totalFilas > 0 ? Math.round((totalCambios / totalFilas) * 100) : 0;

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
        <div style={{ display: "flex", gap: 12, fontSize: 12, alignItems: "center", flexWrap: "wrap" }}>
          {modificadas > 0 && (
            <span style={{ color: "#0369a1", fontWeight: 600 }}>~{modificadas} modificadas</span>
          )}
          {agregadas > 0 && (
            <span style={{ color: "#16a34a", fontWeight: 600 }}>+{agregadas} agregadas</span>
          )}
          {eliminadas > 0 && (
            <span style={{ color: "#dc2626", fontWeight: 600 }}>−{eliminadas} eliminadas</span>
          )}
          <span style={{ color: "#64748b" }}>{sinCambios} sin cambios</span>
          <span
            style={{
              padding: "3px 8px",
              borderRadius: 999,
              background:
                porcentajeCambio > 50
                  ? "rgba(239,68,68,0.12)"
                  : porcentajeCambio > 20
                  ? "rgba(245,158,11,0.12)"
                  : "rgba(34,197,94,0.12)",
              color:
                porcentajeCambio > 50
                  ? "#b91c1c"
                  : porcentajeCambio > 20
                  ? "#92400e"
                  : "#15803d",
              fontWeight: 700,
              fontSize: 11,
            }}
          >
            {porcentajeCambio}% modificado
          </span>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div
        style={{
          padding: "8px 18px",
          background: "#fafafa",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          fontSize: 11,
          color: "#64748b",
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span>
          <span style={{ background: "#dcfce7", color: "#15803d", padding: "1px 5px", borderRadius: 3, fontWeight: 700 }}>
            verde
          </span>{" "}
          = añadido
        </span>
        <span>
          <span
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "1px 5px",
              borderRadius: 3,
              fontWeight: 700,
              textDecoration: "line-through",
            }}
          >
            rojo tachado
          </span>{" "}
          = quitado
        </span>
        <span style={{ color: "#94a3b8" }}>
          texto normal = sin cambios
        </span>
      </div>

      {/* Diff viewer */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px 0",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 13,
          lineHeight: 1.65,
          background: "white",
          color: "#0f172a",
        }}
      >
        {filas.map((fila, idx) => {
          if (fila.tipo === "igual") {
            return (
              <div
                key={idx}
                style={{
                  padding: "2px 18px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: "#334155",
                }}
              >
                {fila.texto || " "}
              </div>
            );
          }

          if (fila.tipo === "modificada") {
            // Renderizar tokens inline: iguales normales, agregadas verde, eliminadas rojo tachado
            return (
              <div
                key={idx}
                style={{
                  padding: "4px 18px",
                  background: "#fffbeb",
                  borderLeft: "3px solid #f59e0b",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  margin: "2px 0",
                }}
              >
                {fila.tokens.map((t, k) => {
                  if (t.tipo === "igual") return <span key={k}>{t.texto}</span>;
                  if (t.tipo === "agregada") {
                    return (
                      <span
                        key={k}
                        style={{
                          background: "#dcfce7",
                          color: "#15803d",
                          padding: "1px 2px",
                          borderRadius: 3,
                          fontWeight: 600,
                        }}
                      >
                        {t.texto}
                      </span>
                    );
                  }
                  // eliminada
                  return (
                    <span
                      key={k}
                      style={{
                        background: "#fee2e2",
                        color: "#b91c1c",
                        padding: "1px 2px",
                        borderRadius: 3,
                        fontWeight: 600,
                        textDecoration: "line-through",
                      }}
                    >
                      {t.texto}
                    </span>
                  );
                })}
              </div>
            );
          }

          // Línea entera agregada o eliminada (no tiene par similar)
          const esAdd = fila.tipo === "agregada";
          return (
            <div
              key={idx}
              style={{
                padding: "2px 18px",
                background: esAdd ? "#dcfce7" : "#fee2e2",
                borderLeft: `3px solid ${esAdd ? "#16a34a" : "#dc2626"}`,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                color: esAdd ? "#15803d" : "#b91c1c",
                fontWeight: 500,
                margin: "1px 0",
              }}
            >
              <span style={{ marginRight: 8, fontWeight: 700 }}>{esAdd ? "+" : "−"}</span>
              <span style={esAdd ? {} : { textDecoration: "line-through" }}>
                {fila.texto || " "}
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
