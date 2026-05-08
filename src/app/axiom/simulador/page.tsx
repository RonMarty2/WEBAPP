"use client";

import { useState } from "react";
import Link from "next/link";

export default function SimuladorCreatePage() {
  const [loading, setLoading] = useState(false);

  const handleCrearSimulador = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/axiom/simulador", {
        method: "POST",
        body: JSON.stringify({
          usuarioId: "demo-user",
          configId: "umss-2026-01",
        }),
      });
      const data = await res.json();
      window.location.href = `/axiom/simulador/${data.simulador.id}`;
    } catch (error) {
      alert("Error creando simulador");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "48px 24px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
        <h1>Crear Nueva Simulación</h1>
        <p style={{ color: "#6b7280", marginBottom: "32px" }}>
          Practica con preguntas similares a las del examen UMSS.
        </p>

        <div
          style={{
            background: "rgba(139,92,246,0.06)",
            border: "1px solid rgba(139,92,246,0.15)",
            borderRadius: "12px",
            padding: "32px",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>
            UMSS Examen de Ingreso 2026
          </h2>
          <ul style={{ textAlign: "left", color: "#6b7280", fontSize: "14px" }}>
            <li>3 áreas: Matemáticas, Económicas, Verbal</li>
            <li>100 preguntas totales</li>
            <li>180 minutos de tiempo</li>
            <li>Respuestas inmediatas y feedback IA</li>
          </ul>
        </div>

        <button
          onClick={handleCrearSimulador}
          disabled={loading}
          style={{
            padding: "12px 32px",
            background: "rgb(139,92,246)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
            fontSize: "16px",
            marginBottom: "12px",
          }}
        >
          {loading ? "Preparando examen..." : "Comenzar Ahora"}
        </button>

        <Link
          href="/axiom"
          style={{
            display: "block",
            color: "rgb(139,92,246)",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
