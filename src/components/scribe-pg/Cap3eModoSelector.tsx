"use client";

/**
 * Cap3eModoSelector — selector previo a la generación del Cap. 3e (análisis
 * de resultados de la encuesta).
 *
 * El estudiante debe elegir entre dos modos:
 *   - PROYECCIÓN: la IA genera resultados plausibles basados en el segmento.
 *     Incluye disclaimer obligatorio. Útil cuando no se aplicó encuesta primaria.
 *   - DATOS_REALES: subir CSV/Excel con respuestas. El sistema procesa
 *     estadísticamente y la IA solo interpreta. Modo profesional pero
 *     requiere campo aplicado (pendiente endpoint upload).
 *
 * El componente se renderiza ANTES del botón "Generar" para hacer explícita
 * la decisión.
 */

import { useState } from "react";

interface Cap3eModoSelectorProps {
  modoActual?: "PROYECCION" | "DATOS_REALES" | null;
  onModoSelected: (modo: "PROYECCION" | "DATOS_REALES") => void;
}

export default function Cap3eModoSelector({
  modoActual,
  onModoSelected,
}: Cap3eModoSelectorProps) {
  const [seleccion, setSeleccion] = useState<"PROYECCION" | "DATOS_REALES" | null>(modoActual ?? null);

  function elegir(modo: "PROYECCION" | "DATOS_REALES") {
    setSeleccion(modo);
    onModoSelected(modo);
  }

  return (
    <div
      style={{
        marginBottom: 20,
        padding: 20,
        border: "2px solid var(--accent)",
        borderRadius: 12,
        background: "rgba(37,99,235,0.04)",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
          📌 Decisión metodológica
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "var(--fg-primary)" }}>
          ¿Cómo querés generar el análisis de resultados?
        </h3>
        <p style={{ fontSize: 13, color: "var(--fg-secondary)", marginTop: 6, lineHeight: 1.5 }}>
          Tu decisión define la metodología del Cap. III.5 y se documenta en el
          informe final. No podés cambiarla después sin regenerar la fase.
        </p>
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        {/* PROYECCIÓN */}
        <button
          type="button"
          onClick={() => elegir("PROYECCION")}
          style={{
            textAlign: "left",
            padding: 16,
            borderRadius: 10,
            background: seleccion === "PROYECCION" ? "rgba(34,197,94,0.10)" : "var(--bg-card)",
            border: seleccion === "PROYECCION" ? "2px solid #22c55e" : "1.5px solid var(--border)",
            cursor: "pointer",
            transition: "all 0.15s",
            color: "var(--fg-primary)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>🎯</span>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 4,
              background: seleccion === "PROYECCION" ? "#22c55e" : "var(--accent)",
              color: "white",
              letterSpacing: "0.05em",
            }}>
              {seleccion === "PROYECCION" ? "✓ SELECCIONADO" : "RECOMENDADO PARA PG"}
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            Proyección académica
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.5 }}>
            La IA genera resultados plausibles a partir del segmento definido,
            estudios sectoriales y supuestos razonables. Incluye nota metodológica
            obligatoria que aclara al lector que son proyecciones, no encuesta
            primaria. Práctica académicamente aceptada para proyectos de
            licenciatura cuando la aplicación primaria queda fuera del alcance
            temporal.
          </div>
        </button>

        {/* DATOS REALES */}
        <button
          type="button"
          onClick={() => elegir("DATOS_REALES")}
          style={{
            textAlign: "left",
            padding: 16,
            borderRadius: 10,
            background: seleccion === "DATOS_REALES" ? "rgba(34,197,94,0.10)" : "var(--bg-card)",
            border: seleccion === "DATOS_REALES" ? "2px solid #22c55e" : "1.5px solid var(--border)",
            cursor: "pointer",
            transition: "all 0.15s",
            color: "var(--fg-primary)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>📊</span>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 4,
              background: seleccion === "DATOS_REALES" ? "#22c55e" : "#f59e0b",
              color: "white",
              letterSpacing: "0.05em",
            }}>
              {seleccion === "DATOS_REALES" ? "✓ SELECCIONADO" : "REQUIERE CAMPO"}
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            Subir datos reales (CSV o Excel)
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.5 }}>
            Subís un archivo con las respuestas reales de tu encuesta aplicada
            en campo. El sistema procesa estadísticamente (frecuencias,
            porcentajes, chi-cuadrado) y la IA solo interpreta los resultados.
            Modo profesional, requiere que ya hayas aplicado la encuesta.
            <br /><br />
            <strong style={{ color: "#f59e0b" }}>⚠️ Upload pendiente:</strong> esta opción
            quedará habilitada cuando se complete el endpoint de subida de
            archivos (en desarrollo).
          </div>
        </button>
      </div>
    </div>
  );
}
