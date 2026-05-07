"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RankingPodios from "./components/RankingPodios";

export default function AxiomLandingPage() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Load user
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));

    // Load ranking
    fetch("/api/axiom/ranking")
      .then((r) => r.json())
      .then((d) => setRanking(d.ranking || []))
      .catch(() => setRanking([]));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "white" }}>
      {/* Header */}
      <div
        style={{
          padding: "24px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>
            AXIOM
          </h1>
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "12px",
              color: "#6b7280",
            }}
          >
            Prepárate como si ya estuvieras
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {user && (
            <span style={{ fontSize: "14px", color: "#6b7280" }}>
              {user.name}
            </span>
          )}
          <a href="/login" style={{ color: "rgb(139,92,246)", fontSize: "14px" }}>
            Salir
          </a>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Ranking Hero */}
        <div
          style={{
            background: "rgba(139,92,246,0.06)",
            border: "1px solid rgba(139,92,246,0.15)",
            borderRadius: "12px",
            padding: "32px",
            marginBottom: "48px",
          }}
        >
          <h2
            style={{
              margin: "0 0 24px 0",
              fontSize: "20px",
              fontWeight: 700,
              color: "rgb(139,92,246)",
            }}
          >
            🏆 Top Simuladores
          </h2>

          <RankingPodios ranking={ranking} currentUserId={user?.id} soundEnabled={true} />
        </div>

        {/* Main options */}
        <div style={{ marginBottom: "48px" }}>
          <h2
            style={{
              margin: "0 0 20px 0",
              fontSize: "18px",
              fontWeight: 700,
              color: "#1f2937",
            }}
          >
            ¿Qué quieres hacer?
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {[
              {
                href: "/axiom/examenes",
                title: "📚 Base de Exámenes",
                desc: "Ver exámenes resueltos",
              },
              {
                href: "/axiom/simulador",
                title: "▶️ Simulador",
                desc: "Practicar examen completo",
              },
              {
                href: "/axiom/progreso",
                title: "📊 Mi Progreso",
                desc: "Ver historial y mejoras",
              },
              {
                href: "/axiom/progreso#plan",
                title: "🎯 Plan Personalizado",
                desc: "Tu ruta de preparación",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "20px",
                  textDecoration: "none",
                  color: "#1f2937",
                  transition: "all 200ms ease-out",
                  cursor: "pointer",
                  display: "block",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgb(139,92,246)";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <div style={{ fontSize: "20px", fontWeight: 700 }}>
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginTop: "8px",
                  }}
                >
                  {item.desc}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
