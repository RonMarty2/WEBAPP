"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Simulador, Pregunta } from "@/lib/axiom/types";

export default function DuranteSimuladorPage() {
  const params = useParams();
  const simId = params.simId as string;

  const [simulador, setSimulador] = useState<Simulador | null>(null);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(180 * 60);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`/api/axiom/simulador/${simId}`)
      .then((r) => r.json())
      .then((d) => {
        setSimulador(d.simulador);
        setCargando(false);
      });
  }, [simId]);

  useEffect(() => {
    if (!simulador || simulador.estado !== "activo") return;

    const interval = setInterval(() => {
      setTiempoRestante((t) => {
        if (t <= 1) {
          handleEnviar();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [simulador]);

  const handleSelectOption = (opcion: string) => {
    if (!simulador) return;
    const pregunta = simulador.preguntas_generadas[preguntaActual];
    setSimulador({
      ...simulador,
      respuestas_usuario: {
        ...simulador.respuestas_usuario,
        [pregunta.id]: opcion,
      },
    });
  };

  const handleSiguiente = () => {
    if (preguntaActual < simulador!.preguntas_generadas.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    }
  };

  const handleAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual(preguntaActual - 1);
    }
  };

  const handleEnviar = async () => {
    if (!simulador) return;
    await fetch(`/api/axiom/simulador/${simId}`, {
      method: "POST",
      body: JSON.stringify({ respuestas: simulador.respuestas_usuario }),
    });
    window.location.href = `/axiom/simulador/${simId}/resultados`;
  };

  if (cargando) return <div style={{ padding: "24px" }}>Preparando examen...</div>;
  if (!simulador) return <div style={{ padding: "24px" }}>Error cargando examen</div>;

  const pregunta = simulador.preguntas_generadas[preguntaActual];
  const respuestaActual = simulador.respuestas_usuario[pregunta.id];
  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = tiempoRestante % 60;
  const tiempoTexto = `${minutos.toString().padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;

  return (
    <div style={{ minHeight: "100vh", background: "white" }}>
      <div
        style={{
          background: tiempoRestante < 300 ? "#fee2e2" : "#f3f4f6",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div style={{ fontSize: "12px", color: "#6b7280" }}>
          Pregunta {preguntaActual + 1} de {simulador.preguntas_generadas.length}
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color:
              tiempoRestante < 300
                ? "#dc2626"
                : "rgb(139,92,246)",
          }}
        >
          {tiempoTexto}
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: "48px" }}>
          <div
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              marginBottom: "32px",
              color: "#1f2937",
            }}
          >
            {pregunta.contenido}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pregunta.opciones.map((opcion) => (
              <button
                key={opcion}
                onClick={() => handleSelectOption(opcion)}
                style={{
                  padding: "16px",
                  border:
                    respuestaActual === opcion
                      ? "2px solid rgb(139,92,246)"
                      : "1px solid #e5e7eb",
                  background:
                    respuestaActual === opcion
                      ? "rgba(139,92,246,0.06)"
                      : "white",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: respuestaActual === opcion ? 600 : 400,
                  color: "#1f2937",
                  transition: "all 200ms ease-out",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  if (respuestaActual !== opcion) {
                    e.currentTarget.style.borderColor = "rgb(139,92,246)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (respuestaActual !== opcion) {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }
                }}
              >
                <strong>{opcion}.</strong> {opcion}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={handleAnterior}
              disabled={preguntaActual === 0}
              style={{
                padding: "10px 20px",
                border: "1px solid #e5e7eb",
                background: "white",
                borderRadius: "6px",
                cursor: preguntaActual === 0 ? "not-allowed" : "pointer",
                opacity: preguntaActual === 0 ? 0.5 : 1,
              }}
            >
              ← Anterior
            </button>
            <button
              onClick={handleSiguiente}
              disabled={
                preguntaActual ===
                simulador.preguntas_generadas.length - 1
              }
              style={{
                padding: "10px 20px",
                border: "1px solid #e5e7eb",
                background: "white",
                borderRadius: "6px",
                cursor:
                  preguntaActual ===
                  simulador.preguntas_generadas.length - 1
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  preguntaActual ===
                  simulador.preguntas_generadas.length - 1
                    ? 0.5
                    : 1,
              }}
            >
              Siguiente →
            </button>
          </div>
          <button
            onClick={handleEnviar}
            style={{
              padding: "10px 24px",
              background: "rgb(139,92,246)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Enviar Respuestas
          </button>
        </div>
      </div>
    </div>
  );
}
