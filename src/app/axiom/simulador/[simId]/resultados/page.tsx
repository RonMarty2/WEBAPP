"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Simulador } from "@/lib/axiom/types";

export default function ResultadosPage() {
  const params = useParams();
  const simId = params.simId as string;

  const [simulador, setSimulador] = useState<Simulador | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`/api/axiom/simulador/${simId}`)
      .then((r) => r.json())
      .then((d) => {
        setSimulador(d.simulador);
        setCargando(false);
      });
  }, [simId]);

  if (cargando) return <div style={{ padding: "24px" }}>Cargando resultados...</div>;
  if (!simulador) return <div style={{ padding: "24px" }}>Error cargando resultados</div>;

  const notaFinal = simulador.nota_final || 0;
  const desglose = simulador.desglose || {};
  const esBuenaNota = notaFinal >= 80;

  return (
    <div style={{ minHeight: "100vh", background: "white" }}>
      <div
        style={{
          background: esBuenaNota
            ? "rgba(16, 185, 129, 0.06)"
            : "rgba(139,92,246,0.06)",
          borderBottom: `1px solid ${
            esBuenaNota
              ? "rgba(16, 185, 129, 0.15)"
              : "rgba(139,92,246,0.15)"
          }`,
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div
            style={{
              fontSize: "12px",
              color: "#6b7280",
              marginBottom: "16px",
            }}
          >
            TU NOTA
          </div>
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: esBuenaNota ? "#10b981" : "rgb(139,92,246)",
              marginBottom: "16px",
            }}
          >
            {notaFinal}
          </div>
          <div
            style={{
              fontSize: "16px",
              color: "#6b7280",
              marginBottom: "24px",
            }}
          >
            {esBuenaNota
              ? "¡Excelente! Mejoraste significativamente."
              : "Siguiente intento mejor preparado. Plan personalizado listo."}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "24px" }}>
          Desglose por Área
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "48px",
          }}
        >
          {Object.entries(desglose).map(([area, nota]) => (
            <div
              key={area}
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "8px",
                }}
              >
                {area}
              </div>
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: 700,
                  color: nota >= 80 ? "#10b981" : "#ef4444",
                }}
              >
                {nota}%
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => (window.location.href = `/axiom/simulador`)}
            style={{
              flex: 1,
              padding: "12px 24px",
              border: "1px solid #e5e7eb",
              background: "white",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Nuevo Simulador
          </button>
          <button
            onClick={() => (window.location.href = `/axiom/progreso`)}
            style={{
              flex: 1,
              padding: "12px 24px",
              background: "rgb(139,92,246)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Ver Mi Progreso
          </button>
        </div>
      </div>
    </div>
  );
}
