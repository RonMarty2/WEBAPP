"use client";

/**
 * FaseAcciones — barra de acciones del estudiante para cada fase generada
 * del Proyecto de Grado.
 *
 * Acciones disponibles:
 *   - ✅ Aprobar y pasar a la siguiente fase
 *   - 🔄 Regenerar (vuelve a llamar a la IA)
 *   - 💬 Comentar para refinar (caja de texto que el estudiante usa para
 *     pedirle ajustes a la IA — se envía como feedback_usuario al endpoint)
 *
 * El componente NO se renderiza si la fase aún no tiene contenido — en ese
 * caso el padre muestra el botón "Generar" inicial.
 */

import { useState } from "react";

interface FaseAccionesProps {
  faseLabel: string;
  esUltimaFase: boolean;
  onAprobar: () => void;
  onRegenerar: (feedback?: string) => Promise<void> | void;
}

export default function FaseAcciones({
  faseLabel,
  esUltimaFase,
  onAprobar,
  onRegenerar,
}: FaseAccionesProps) {
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  async function ejecutarRegenerar() {
    setProcesando(true);
    setError("");
    try {
      await onRegenerar(feedback.trim() || undefined);
      setFeedback("");
      setMostrarFeedback(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div
      style={{
        marginTop: 20,
        padding: 16,
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-secondary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
        Acciones para esta fase
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button
          type="button"
          onClick={onAprobar}
          disabled={procesando || esUltimaFase}
          title={esUltimaFase ? "Ya estás en la última fase" : `Aprobar ${faseLabel} y avanzar`}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            background: esUltimaFase ? "var(--fg-muted)" : "#16a34a",
            color: "white",
            border: "none",
            fontWeight: 700,
            fontSize: 13,
            cursor: (procesando || esUltimaFase) ? "not-allowed" : "pointer",
            opacity: (procesando || esUltimaFase) ? 0.55 : 1,
          }}
        >
          ✅ Aprobar y pasar a la siguiente
        </button>

        <button
          type="button"
          onClick={() => setMostrarFeedback((v) => !v)}
          disabled={procesando}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            background: mostrarFeedback ? "rgba(37,99,235,0.15)" : "var(--bg-secondary)",
            color: "var(--fg-primary)",
            border: "1.5px solid var(--accent)",
            fontWeight: 700,
            fontSize: 13,
            cursor: procesando ? "wait" : "pointer",
          }}
        >
          🔄 Regenerar {mostrarFeedback ? "(con comentario abajo)" : ""}
        </button>
      </div>

      {mostrarFeedback && (
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--fg-secondary)", display: "block", marginBottom: 6 }}>
            Comentá qué querés ajustar (opcional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={'Ej: "hacé el segmento más específico", "agregá una cuarta opción de título", "tono menos formal"'}
            rows={3}
            disabled={procesando}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg-primary)",
              color: "var(--fg-primary)",
              fontSize: 13,
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              type="button"
              onClick={ejecutarRegenerar}
              disabled={procesando}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "var(--accent)",
                color: "white",
                border: "none",
                fontWeight: 700,
                fontSize: 12,
                cursor: procesando ? "wait" : "pointer",
                opacity: procesando ? 0.6 : 1,
              }}
            >
              {procesando ? "Regenerando…" : (feedback.trim() ? "🔄 Regenerar con este comentario" : "🔄 Regenerar sin comentario")}
            </button>
            <button
              type="button"
              onClick={() => { setMostrarFeedback(false); setFeedback(""); }}
              disabled={procesando}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "transparent",
                color: "var(--fg-secondary)",
                border: "1px solid var(--border)",
                fontWeight: 600,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 12, padding: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#ef4444", fontSize: 12 }}>
          {error}
        </div>
      )}
    </div>
  );
}
