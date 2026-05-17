"use client";

/**
 * Componente reutilizable: verifica si un tema propuesto ya existe en
 * atlas.umss.edu.bo (regla UMSS Guía 1: ≥5 años de diferencia).
 *
 * Uso:
 *   <UmssDuplicidadCheck
 *     tema={tema}
 *     onConfirmar={(verificado) => setVerificado(verificado)}
 *   />
 *
 * Solo aparece cuando hay tema con ≥6 caracteres. El estudiante puede:
 *   - Disparar verificación automática (intenta scrapear el atlas)
 *   - Si falla → abrir el atlas en pestaña nueva (verificación manual)
 *   - Confirmar con checkbox que verificó la duplicidad
 */

import { useState } from "react";

interface TrabajoDetectado {
  titulo: string;
  autor?: string;
  anio: number;
  url?: string;
  similitud?: number;
}

interface RespuestaDuplicidad {
  modo: "automatico" | "manual";
  url_atlas: string;
  url_atlas_home: string;
  anio_consultado: number;
  trabajos_detectados: TrabajoDetectado[];
  evaluacion: {
    duplicado: boolean;
    anios_desde_ultimo: number | null;
    similares: TrabajoDetectado[];
    anio_minimo_repeticion: number | null;
    sugerencia: string;
  };
  advertencia: string | null;
}

interface Props {
  tema: string;
  /** Callback cuando el estudiante confirma haber verificado. */
  onConfirmar?: (verificado: boolean) => void;
  /** Si true, el componente se colapsa cuando ya verificó. */
  colapsarTrasConfirmar?: boolean;
}

export default function UmssDuplicidadCheck({ tema, onConfirmar, colapsarTrasConfirmar = false }: Props) {
  const [cargando, setCargando] = useState(false);
  const [respuesta, setRespuesta] = useState<RespuestaDuplicidad | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  const temaValido = tema.trim().length >= 6;

  async function verificar() {
    setCargando(true);
    setError(null);
    setRespuesta(null);
    try {
      const res = await fetch("/api/umss/duplicidad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, anio: new Date().getFullYear() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Error al verificar duplicidad");
      setRespuesta(data as RespuestaDuplicidad);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setCargando(false);
    }
  }

  function toggleConfirmacion(valor: boolean) {
    setConfirmado(valor);
    onConfirmar?.(valor);
  }

  // Si ya confirmó y se debe colapsar
  if (confirmado && colapsarTrasConfirmar) {
    return (
      <div
        style={{
          fontSize: 12.5,
          padding: "10px 14px",
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.30)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#15803d",
        }}
      >
        <span>✅</span>
        <span style={{ flex: 1, fontWeight: 600 }}>
          Verificación de duplicidad UMSS confirmada
        </span>
        <button
          onClick={() => toggleConfirmacion(false)}
          style={{
            fontSize: 11,
            background: "none",
            border: "none",
            color: "#15803d",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Revisar
        </button>
      </div>
    );
  }

  const hayResultados = respuesta && respuesta.trabajos_detectados.length > 0;
  const esDuplicado = respuesta?.evaluacion.duplicado === true;

  return (
    <div
      style={{
        border: "1.5px solid var(--border)",
        borderRadius: 12,
        padding: 16,
        background: "rgba(0,0,0,0.02)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--accent)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 4,
            }}
          >
            🔍 Verificación UMSS de duplicidad
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>
            ¿Tu tema ya fue presentado antes en UMSS?
          </div>
          <div style={{ fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.5 }}>
            La Guía UMSS Sept 2024 exige verificar en{" "}
            <a
              href={respuesta?.url_atlas_home ?? "http://atlas.umss.edu.bo"}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)", textDecoration: "underline" }}
            >
              atlas.umss.edu.bo
            </a>
            {" "}que tu tema no se haya presentado en los últimos 5 años.
          </div>
        </div>
        {!respuesta && (
          <button
            onClick={verificar}
            disabled={!temaValido || cargando}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: temaValido ? "var(--accent)" : "rgba(0,0,0,0.1)",
              color: temaValido ? "white" : "var(--fg-muted)",
              cursor: temaValido && !cargando ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {cargando ? "Buscando…" : "Verificar ahora"}
          </button>
        )}
      </div>

      {!temaValido && (
        <div style={{ fontSize: 11.5, color: "var(--fg-muted)", fontStyle: "italic" }}>
          Ingresá un tema (≥6 caracteres) para verificar.
        </div>
      )}

      {error && (
        <div
          style={{
            fontSize: 12,
            padding: "10px 12px",
            background: "rgba(239,68,68,0.10)",
            border: "1px solid rgba(239,68,68,0.30)",
            borderRadius: 8,
            color: "#b91c1c",
          }}
        >
          ❌ {error}
        </div>
      )}

      {respuesta && (
        <>
          {/* Resultado de evaluación */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: esDuplicado
                ? "rgba(239,68,68,0.08)"
                : hayResultados
                ? "rgba(245,158,11,0.08)"
                : "rgba(34,197,94,0.08)",
              border: `1.5px solid ${
                esDuplicado
                  ? "rgba(239,68,68,0.35)"
                  : hayResultados
                  ? "rgba(245,158,11,0.30)"
                  : "rgba(34,197,94,0.30)"
              }`,
              display: "flex",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>
              {esDuplicado ? "🚫" : hayResultados ? "⚠️" : "✅"}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4, color: esDuplicado ? "#b91c1c" : hayResultados ? "#92400e" : "#15803d" }}>
                {esDuplicado
                  ? "Posible duplicidad detectada"
                  : hayResultados
                  ? "Hay trabajos similares (>5 años de antigüedad)"
                  : "Sin duplicidad detectada"}
              </div>
              <div style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--fg-secondary)" }}>
                {respuesta.evaluacion.sugerencia}
              </div>
              {respuesta.advertencia && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: "var(--fg-muted)",
                    fontStyle: "italic",
                  }}
                >
                  ℹ️ {respuesta.advertencia}
                </div>
              )}
            </div>
          </div>

          {/* Trabajos similares detectados */}
          {respuesta.evaluacion.similares.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--fg-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 6,
                }}
              >
                Trabajos más similares en el atlas
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {respuesta.evaluacion.similares.slice(0, 5).map((t, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 11.5,
                      padding: "8px 10px",
                      background: "white",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: t.anio >= new Date().getFullYear() - 5 ? "rgba(239,68,68,0.15)" : "rgba(0,0,0,0.05)",
                        color: t.anio >= new Date().getFullYear() - 5 ? "#b91c1c" : "var(--fg-muted)",
                        flexShrink: 0,
                      }}
                    >
                      {t.anio}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, lineHeight: 1.3 }}>
                        {t.url ? (
                          <a
                            href={t.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--fg-primary)", textDecoration: "underline" }}
                          >
                            {t.titulo}
                          </a>
                        ) : (
                          t.titulo
                        )}
                      </div>
                      {t.autor && (
                        <div style={{ fontSize: 10.5, color: "var(--fg-muted)", marginTop: 2 }}>
                          {t.autor}
                        </div>
                      )}
                      {t.similitud !== undefined && (
                        <div style={{ fontSize: 10, color: "var(--fg-muted)", marginTop: 2 }}>
                          Similitud con tu tema: {Math.round(t.similitud * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acciones secundarias */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a
              href={respuesta.url_atlas}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 11.5,
                padding: "6px 12px",
                borderRadius: 6,
                background: "white",
                border: "1px solid var(--border)",
                color: "var(--fg-primary)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              🔗 Abrir búsqueda en atlas.umss.edu.bo
            </a>
            <button
              onClick={verificar}
              disabled={cargando}
              style={{
                fontSize: 11.5,
                padding: "6px 12px",
                borderRadius: 6,
                background: "white",
                border: "1px solid var(--border)",
                color: "var(--fg-primary)",
                cursor: cargando ? "not-allowed" : "pointer",
                fontWeight: 500,
              }}
            >
              🔄 Re-verificar
            </button>
          </div>

          {/* Checkbox de confirmación */}
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              cursor: "pointer",
              padding: "10px 12px",
              background: confirmado ? "rgba(34,197,94,0.08)" : "rgba(0,0,0,0.03)",
              border: `1.5px solid ${confirmado ? "rgba(34,197,94,0.40)" : "var(--border)"}`,
              borderRadius: 8,
              transition: "all 0.15s",
            }}
          >
            <input
              type="checkbox"
              checked={confirmado}
              onChange={(e) => toggleConfirmacion(e.target.checked)}
              style={{ marginTop: 2, accentColor: "#22c55e", cursor: "pointer" }}
            />
            <div style={{ fontSize: 12, lineHeight: 1.5 }}>
              <strong>Confirmo</strong> que mi tema cumple la regla UMSS de ≥5 años
              de diferencia con cualquier trabajo similar publicado en el atlas
              digital.
            </div>
          </label>
        </>
      )}
    </div>
  );
}
