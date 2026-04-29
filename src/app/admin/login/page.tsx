"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Contraseña incorrecta.");
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg min-h-screen" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#e2e8f0" }}>Panel de Control</h1>
          <p style={{ color: "#94a3b8", marginTop: 8, fontSize: 14 }}>
            Acceso exclusivo para administradores
          </p>
        </div>

        <form onSubmit={handleLogin} className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="label">Contraseña de Administrador</label>
            <input
              type="password"
              className="input-dark"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              style={{ fontSize: 18, letterSpacing: 4 }}
            />
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: 12, color: "#fca5a5", fontSize: 14 }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-cyan"
            disabled={loading || !password}
            style={{ justifyContent: "center", padding: "14px", fontSize: 15, width: "100%" }}
          >
            {loading ? <><div className="spinner" /> Verificando...</> : "🔓 Ingresar al Panel"}
          </button>

          <div style={{ textAlign: "center" }}>
            <a href="/" style={{ color: "#94a3b8", fontSize: 13, textDecoration: "none" }}>
              ← Volver al inicio
            </a>
          </div>
        </form>

        <p style={{ textAlign: "center", color: "#334155", fontSize: 12, marginTop: 24 }}>
          Contraseña configurada en <code style={{ color: "#475569" }}>.env.local → ADMIN_PASSWORD</code>
        </p>
      </div>
    </div>
  );
}
