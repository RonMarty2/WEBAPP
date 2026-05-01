"use client";

import { useState, useEffect } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Si ya está autenticado, ir directo al panel
  useEffect(() => {
    if (localStorage.getItem("adminAuthed") === "1") {
      window.location.replace("/admin");
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Contraseña incorrecta");
        setLoading(false);
        return;
      }
      localStorage.setItem("adminAuthed", "1");
      window.location.replace("/admin");
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #020617 0%, #0a0f1e 100%)",
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        width: "100%", maxWidth: 380, padding: 40,
        background: "rgba(15,23,42,0.9)", border: "1px solid rgba(139,92,246,0.25)",
        borderRadius: 16, boxShadow: "0 0 40px rgba(139,92,246,0.1)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>⚡</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#e2e8f0", marginBottom: 4, margin: 0 }}>
            Panel Administrador
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
            Laboratorio Académico — Modo Dios
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              style={{
                width: "100%", padding: "10px 12px", fontSize: 14,
                background: "rgba(30,41,59,0.8)", border: "1px solid #334155",
                borderRadius: 8, color: "#e2e8f0", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", background: "rgba(220,38,38,0.1)",
              border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8,
              fontSize: 13, color: "#f87171",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: "100%", padding: "12px", borderRadius: 8,
              background: loading || !password ? "rgba(139,92,246,0.4)" : "rgba(139,92,246,0.9)",
              border: "1px solid rgba(139,92,246,0.5)", color: "#e2e8f0",
              fontSize: 14, fontWeight: 700, cursor: loading || !password ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {loading ? "Verificando..." : "Entrar al panel →"}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <a href="/dashboard" style={{ fontSize: 12, color: "#475569", textDecoration: "none" }}>
            ← Volver al dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
