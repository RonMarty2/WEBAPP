"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/auth";

export default function MentorDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
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
      <div className="bg-transparent" style={{ minHeight: "100vh", position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-transparent" style={{ minHeight: "100vh", position: "relative", zIndex: 10, padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user.picture ? (
              <img src={user.picture} alt="" style={{ width: 42, height: 42, borderRadius: "50%", border: "2px solid rgb(16,185,129)" }} />
            ) : (
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgb(16,185,129)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff" }}>
                {user.name[0]}
              </div>
            )}
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--fg-primary)" }}>{user.name}</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <span>{user.email}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="/nucleo" style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", color: "var(--fg-muted)", textDecoration: "none", fontSize: 13 }}>
              Volver a NŪCLEO
            </a>
            <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(248,113,113,0.3)", background: "transparent", color: "#f87171", fontSize: 13, cursor: "pointer" }}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Welcome - MENTOR COLORS */}
        <div className="card" style={{ marginBottom: 28, borderColor: "rgba(16,185,129,0.22)", background: "rgba(16,185,129,0.06)", position: "relative", overflow: "hidden" }}>
          {/* Micro-sphere glow esmeralda */}
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(16,185,129,0.15) 0%, transparent 70%)", filter: "blur(30px)", pointerEvents: "none" }} />
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, position: "relative" }}>Tutoría MENTOR</h1>
          <p style={{ color: "var(--fg-muted)", fontSize: 14, position: "relative" }}>Ciclo de feedback continuo y validación experta de proyectos.</p>
        </div>

        {/* Mis Tutorías */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--fg-muted)" }}>Mis tutorías</h2>
          <button style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", color: "rgb(52,211,153)", fontSize: 13, padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
            + Vincular proyecto
          </button>
        </div>

        <div className="card" style={{ textAlign: "center", padding: "48px 24px", marginBottom: 32, borderStyle: "dashed", borderColor: "var(--border-hover)" }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>🤝</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg-secondary)", marginBottom: 8 }}>No tienes proyectos vinculados</div>
          <div style={{ fontSize: 14, color: "var(--fg-muted)", marginBottom: 24 }}>Vincula un proyecto SCRIBE para comenzar la revisión</div>
        </div>

        {/* Próximamente */}
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--fg-muted)", marginBottom: 14 }}>Funciones MENTOR</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {[{ icon: "💬", name: "Feedback Estructural" }, { icon: "🕵️", name: "Análisis de Plagio IA" }, { icon: "✅", name: "Aprobación de Capítulos" }].map(pr => (
            <div key={pr.name} className="card" style={{ opacity: 0.4, display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ fontSize: 28 }}>{pr.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg-primary)" }}>{pr.name}</div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>Próximamente</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
