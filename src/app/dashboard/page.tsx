"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) { router.replace("/login"); return; }
        setUser(d.user);
        setLoading(false);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div
        className="gradient-bg min-h-screen"
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="gradient-bg min-h-screen" style={{ padding: 24 }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user.picture ? (
              <img
                src={user.picture}
                alt=""
                style={{ width: 42, height: 42, borderRadius: "50%", border: "2px solid #06b6d4" }}
              />
            ) : (
              <div
                style={{
                  width: 42, height: 42, borderRadius: "50%", background: "#0e7490",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 700, color: "#e2e8f0",
                }}
              >
                {user.name[0]}
              </div>
            )}
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{user.name}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{user.email}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <a
              href="/"
              style={{
                padding: "8px 16px", borderRadius: 8, border: "1px solid #1e293b",
                color: "#94a3b8", textDecoration: "none", fontSize: 13,
              }}
            >
              Inicio
            </a>
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(248,113,113,0.3)",
                background: "transparent", color: "#f87171", fontSize: 13, cursor: "pointer",
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Welcome banner */}
        <div
          className="card"
          style={{
            marginBottom: 28,
            background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(14,116,144,0.05))",
            borderColor: "rgba(6,182,212,0.2)",
          }}
        >
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            Bienvenido, {user.name.split(" ")[0]}
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>
            Desde aquí puedes crear y gestionar tus documentos académicos.
          </p>
        </div>

        {/* Products */}
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#94a3b8", marginBottom: 16 }}>
          Documentos disponibles
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {/* Monografía — available */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 32 }}>📄</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>
                Monografía
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>
                5 capítulos completos, bibliografía APA 7 y exportación LaTeX.
              </div>
            </div>
            <a
              href="/monografia"
              className="btn-cyan"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none", padding: "10px", marginTop: "auto", fontSize: 14,
              }}
            >
              Crear monografía →
            </a>
          </div>

          {/* Coming soon */}
          {[
            { icon: "🎓", name: "Tesis" },
            { icon: "📝", name: "Ensayo académico" },
            { icon: "📊", name: "Trabajo final" },
          ].map((p) => (
            <div
              key={p.name}
              className="card"
              style={{ opacity: 0.45, display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div style={{ fontSize: 32 }}>{p.icon}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>Próximamente disponible.</div>
              </div>
              <div
                style={{
                  padding: "8px 16px", borderRadius: 8, border: "1px solid #1e293b",
                  color: "#475569", fontSize: 13, textAlign: "center",
                }}
              >
                Próximamente
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
