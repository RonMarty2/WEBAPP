"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const error = params.get("error");

  const [showDemo, setShowDemo] = useState(false);
  const [demoRole, setDemoRole] = useState<"estudiante" | "docente">("estudiante");
  const [demoPlan, setDemoPlan] = useState<"estandar" | "pro">("estandar");
  const [loading, setLoading] = useState(false);

  const errorMsg =
    error === "oauth_failed" ? "Error al conectar con Google. Intenta nuevamente."
    : error === "profile_failed" ? "No se pudo obtener tu perfil de Google."
    : null;

  async function handleDemo() {
    setLoading(true);
    const res = await fetch("/api/auth/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: demoRole, plan: demoPlan }),
    });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setLoading(false);
    }
  }

  const selectStyle = {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 8,
    color: "#e2e8f0",
    padding: "9px 12px",
    fontSize: 14,
    flex: 1,
    cursor: "pointer",
  } as React.CSSProperties;

  return (
    <div
      className="gradient-bg min-h-screen"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🧪</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#e2e8f0" }}>
            Laboratorio Académico
          </h1>
          <p style={{ color: "#94a3b8", marginTop: 6, fontSize: 14 }}>
            Elige cómo quieres ingresar
          </p>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {errorMsg && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: 12, color: "#fca5a5", fontSize: 14 }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Google */}
          <div>
            <p style={{ fontSize: 11, color: "#64748b", marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Con cuenta Google
            </p>
            <a
              href="/api/auth/google"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                padding: "13px 20px", borderRadius: 10, border: "1px solid #334155",
                background: "#fff", color: "#1e293b", textDecoration: "none", fontWeight: 600, fontSize: 15,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar con Google
            </a>
            <p style={{ fontSize: 12, color: "#475569", marginTop: 8, textAlign: "center" }}>
              Nuevo usuario → espera activación del admin
            </p>
          </div>

          {/* Divisor */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: "#1e293b" }} />
            <span style={{ fontSize: 12, color: "#334155" }}>o</span>
            <div style={{ flex: 1, height: 1, background: "#1e293b" }} />
          </div>

          {/* Demo */}
          <div>
            <p style={{ fontSize: 11, color: "#64748b", marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Modo desarrollo
            </p>

            {!showDemo ? (
              <button
                onClick={() => setShowDemo(true)}
                style={{
                  width: "100%", padding: "12px", borderRadius: 10,
                  border: "1px solid rgba(6,182,212,0.3)", background: "rgba(6,182,212,0.06)",
                  color: "#06b6d4", fontWeight: 600, fontSize: 14, cursor: "pointer",
                }}
              >
                👤 Entrar como usuario de prueba
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Selectores */}
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6 }}>Tipo de usuario</label>
                    <select
                      value={demoRole}
                      onChange={(e) => setDemoRole(e.target.value as "estudiante" | "docente")}
                      style={selectStyle}
                    >
                      <option value="estudiante">🎓 Estudiante</option>
                      <option value="docente">👨‍🏫 Docente</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6 }}>Plan</label>
                    <select
                      value={demoPlan}
                      onChange={(e) => setDemoPlan(e.target.value as "estandar" | "pro")}
                      style={selectStyle}
                    >
                      <option value="estandar">⭐ Estándar</option>
                      <option value="pro">🚀 Pro</option>
                    </select>
                  </div>
                </div>

                {/* Vista previa */}
                <div style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#94a3b8" }}>
                  Entrando como: <strong style={{ color: "#06b6d4" }}>
                    {demoRole === "estudiante" ? "🎓 Estudiante" : "👨‍🏫 Docente"}
                  </strong> · Plan <strong style={{ color: "#06b6d4" }}>
                    {demoPlan === "estandar" ? "Estándar" : "Pro"}
                  </strong>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setShowDemo(false)}
                    style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #1e293b", background: "transparent", color: "#64748b", fontSize: 13, cursor: "pointer" }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDemo}
                    disabled={loading}
                    style={{
                      flex: 1, padding: "10px", borderRadius: 8,
                      background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.4)",
                      color: "#06b6d4", fontWeight: 700, fontSize: 14,
                      cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    {loading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Entrando...</> : "Ingresar →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p style={{ textAlign: "center", color: "#475569", fontSize: 12, marginTop: 16 }}>
          <a href="/terminos" style={{ color: "#06b6d4" }}>Términos</a> ·{" "}
          <a href="/privacidad" style={{ color: "#06b6d4" }}>Privacidad</a>
        </p>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <a href="/" style={{ color: "#475569", fontSize: 13, textDecoration: "none" }}>← Inicio</a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginContent /></Suspense>;
}
