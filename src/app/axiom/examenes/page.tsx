"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";

interface Examen {
  id: string;
  fecha: string;
  area: string;
  cantidad_preguntas: number;
  resuelto: boolean;
}

interface ExamenesResponse {
  examenes: Examen[];
}

export default function ExamenesPage(): ReactNode {
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchExamenes = async (): Promise<void> => {
      try {
        const response = await fetch("/api/axiom/examenes");
        const data: ExamenesResponse = await response.json();
        setExamenes(data.examenes);
      } catch (error) {
        console.error("Error fetching exámenes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamenes();
  }, []);

  if (loading) {
    return <div style={{ padding: "24px" }}>Cargando exámenes...</div>;
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ marginBottom: "32px" }}>Base de Exámenes Resueltos</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {examenes.map((exam) => (
          <Link
            key={exam.id}
            href={`/axiom/examenes/${exam.id}`}
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "16px",
              textDecoration: "none",
              color: "#1f2937",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "all 200ms ease-out",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgb(139,92,246)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>Examen {exam.fecha}</div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                {exam.cantidad_preguntas} preguntas | {exam.area} | Resuelto
              </div>
            </div>
            <div style={{ color: "rgb(139,92,246)", fontWeight: 600 }}>
              Ver →
            </div>
          </Link>
        ))}
      </div>

      {examenes.length === 0 && (
        <div style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>
          No hay exámenes disponibles aún.
        </div>
      )}
    </div>
  );
}
