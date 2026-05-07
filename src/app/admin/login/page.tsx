"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    router.prefetch("/admin");
    router.prefetch("/dashboard");
    let cancelled = false;
    fetch("/api/admin/auth/check")
      .then((res) => { if (!cancelled && res.ok) router.replace("/admin"); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Contraseña incorrecta");
        setLoading(false);
        return;
      }
      
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof DOMException && err.name === "AbortError" ? "La verificación tardó demasiado. Intenta de nuevo." : "Error de conexión");
      setLoading(false);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  return (
    <div className="gradient-bg" style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        width: "100%", maxWidth: 380, padding: 40,
        background: "rgba(255,255,255,0.90)", border: "1px solid var(--border)",
        borderRadius: 8, boxShadow: "var(--shadow-md)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>⚡</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg-primary)", marginBottom: 4, margin: 0 }}>
            Panel Administrador
          </h1>
          <p style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 6 }}>
            Laboratorio Académico — Modo Dios
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--fg-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
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
                background: "rgba(255,255,255,0.88)", border: "1px solid var(--border-hover)",
                borderRadius: 8, color: "var(--fg-primary)", outline: "none",
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
              background: loading || !password ? "var(--bg-subtle)" : "#0b0b0b",
              border: "1px solid var(--border)", color: loading || !password ? "var(--fg-muted)" : "#fff",
              fontSize: 14, fontWeight: 700, cursor: loading || !password ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {loading ? "Verificando..." : "Entrar al panel →"}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/dashboard" style={{ fontSize: 12, color: "var(--fg-secondary)", textDecoration: "none" }}>
            ← Volver al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
