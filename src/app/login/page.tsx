"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const error = params.get("error");
  const isDemoMode = params.get("demo") === "1";

  const [showDemo, setShowDemo] = useState(isDemoMode);
  const [demoRole, setDemoRole] = useState<"estudiante" | "docente">("estudiante");
  const [demoPlan, setDemoPlan] = useState<"estandar" | "pro">("estandar");
  const [loading, setLoading] = useState(false);
  const [autoStarting, setAutoStarting] = useState(isDemoMode);

  // ── Admin login (real, con email + password del .env) ─────────────────
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPlan, setAdminPlan] = useState<"estandar" | "pro" | "elite">("pro");
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  async function handleAdminLogin() {
    setAdminLoading(true);
    setAdminError(null);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail.trim(), password: adminPassword, plan: adminPlan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminError(data?.error ?? "Error al iniciar sesión");
        setAdminLoading(false);
        return;
      }
      // El servidor indica a dónde redirigir según el rol REAL del usuario
      // (admin → /admin, estudiante → /dashboard, etc). Antes redirigía
      // siempre a /dashboard y luego algún flujo lateral subía al user a admin.
      router.push(data?.redirectTo ?? "/dashboard");
      router.refresh();
    } catch (e) {
      setAdminError(e instanceof Error ? e.message : "Error de red");
      setAdminLoading(false);
    }
  }

  const errorMsg =
    error === "oauth_failed" ? "Error al conectar con Google. Intenta nuevamente."
    : error === "profile_failed" ? "No se pudo obtener tu perfil de Google."
    : null;

  async function handleDemo(roleOverride?: "estudiante" | "docente", planOverride?: "estandar" | "pro") {
    setLoading(true);
    const res = await fetch("/api/auth/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: roleOverride ?? demoRole,
        plan: planOverride ?? demoPlan,
      }),
    });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setLoading(false);
      setAutoStarting(false);
    }
  }

  useEffect(() => {
    if (isDemoMode && autoStarting) {
      handleDemo("estudiante", "pro");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode]);

  if (autoStarting) {
    return (
      <div
        className="gradient-bg min-h-screen"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      >
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🧪</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--fg-primary)", marginBottom: 12 }}>
            Preparando tu prueba gratis...
          </h1>
          <p style={{ color: "var(--fg-muted)", fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>
            Estamos creando tu cuenta de prueba. En segundos vas a poder generar tu primer capítulo gratis, sin tarjeta y sin compromiso.
          </p>
          <div
            className="spinner"
            style={{
              width: 36,
              height: 36,
              margin: "0 auto",
              border: "3px solid rgba(99,102,241,0.2)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const selectStyle = {
    background: "var(--bg-card)",
    border: "1px solid var(--border-hover)",
    borderRadius: 8,
    color: "var(--fg-primary)",
    padding: "9px 12px",
    fontSize: 14,
    flex: 1,
    cursor: "pointer",
  } as React.CSSProperties;

  const labelEyebrow: React.CSSProperties = {
    fontSize: 11,
    color: "var(--fg-muted)",
    marginBottom: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };

  return (
    <div
      className="gradient-bg min-h-screen"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}
    >
      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              margin: "0 auto 14px",
              borderRadius: 14,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-sm)",
            }}
            aria-hidden="true"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="var(--fg-primary)" strokeWidth="1.8" />
              <path d="M8 12h8M12 8v8" stroke="var(--fg-primary)" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="font-crimson" style={{ fontSize: 26, fontWeight: 700, color: "var(--fg-primary)", letterSpacing: "-0.01em" }}>
            Laboratorio Académico
          </h1>
          <p style={{ color: "var(--fg-muted)", marginTop: 6, fontSize: 14 }}>
            Elige cómo quieres ingresar
          </p>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {errorMsg && (
            <div
              role="alert"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.30)",
                borderRadius: 8,
                padding: "10px 12px",
                color: "#b91c1c",
                fontSize: 14,
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google */}
          <div>
            <p style={labelEyebrow}>Con cuenta Google</p>
            <a
              href="/api/auth/google"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                padding: "13px 20px", borderRadius: 10, border: "1px solid var(--border-hover)",
                background: "var(--bg-card)", color: "var(--fg-primary)", textDecoration: "none", fontWeight: 600, fontSize: 15,
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
            <p style={{ fontSize: 12, color: "var(--fg-secondary)", marginTop: 8, textAlign: "center" }}>
              Nuevo usuario → espera activación del administrador
            </p>
          </div>

          {/* Divisor */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }} aria-hidden="true">
            <div style={{ flex: 1, height: 1, background: "var(--bg-subtle)" }} />
            <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>o</span>
            <div style={{ flex: 1, height: 1, background: "var(--bg-subtle)" }} />
          </div>

          {/* Admin login (real, con email + password) */}
          <div>
            <p style={labelEyebrow}>Acceso administrador</p>

            {!showAdmin ? (
              <button
                onClick={() => setShowAdmin(true)}
                aria-expanded={showAdmin}
                aria-controls="admin-panel"
                style={{
                  width: "100%", padding: "12px", borderRadius: 10,
                  border: "1px solid rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.06)",
                  color: "#7c3aed", fontWeight: 600, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="4" y="11" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.7"/>
                  <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
                Soy administrador (email y contraseña)
              </button>
            ) : (
              <div id="admin-panel" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <label htmlFor="admin-email" style={{ position: "absolute", left: -9999 }}>Email administrador</label>
                <input
                  id="admin-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  autoComplete="email"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border-hover)",
                    background: "var(--bg-card)",
                    fontSize: 14,
                    color: "var(--fg-primary)",
                  }}
                />
                <label htmlFor="admin-password" style={{ position: "absolute", left: -9999 }}>Contraseña administrador</label>
                <input
                  id="admin-password"
                  type="password"
                  placeholder="Contraseña"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  autoComplete="current-password"
                  onKeyDown={(e) => { if (e.key === "Enter") handleAdminLogin(); }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border-hover)",
                    background: "var(--bg-card)",
                    fontSize: 14,
                    color: "var(--fg-primary)",
                  }}
                />
                <div>
                  <label htmlFor="admin-plan" style={{ fontSize: 11.5, color: "var(--fg-muted)", display: "block", marginBottom: 4 }}>
                    Entrar como plan <span style={{ color: "var(--fg-secondary)" }}>(puedes cambiarlo después sin perder proyectos)</span>
                  </label>
                  <select
                    id="admin-plan"
                    value={adminPlan}
                    onChange={(e) => setAdminPlan(e.target.value as "estandar" | "pro" | "elite")}
                    style={{ ...selectStyle, width: "100%" }}
                  >
                    <option value="estandar">Estándar — limitado, sin edición</option>
                    <option value="pro">Pro — recomendado, edición quirúrgica</option>
                    <option value="elite">Elite — máximo, 16K tokens</option>
                  </select>
                </div>

                {adminError && (
                  <div
                    role="alert"
                    style={{ fontSize: 12, color: "#b91c1c", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 6, padding: "8px 10px" }}
                  >
                    {adminError}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => { setShowAdmin(false); setAdminError(null); }}
                    style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--fg-muted)", fontSize: 13, cursor: "pointer" }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAdminLogin}
                    disabled={adminLoading || !adminEmail.trim() || !adminPassword}
                    style={{
                      flex: 1, padding: "10px", borderRadius: 8,
                      background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.4)",
                      color: "#7c3aed", fontWeight: 700, fontSize: 14,
                      cursor: adminLoading ? "not-allowed" : "pointer",
                      opacity: (adminLoading || !adminEmail.trim() || !adminPassword) ? 0.5 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    {adminLoading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Entrando…</> : "Entrar como administrador →"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divisor admin/demo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }} aria-hidden="true">
            <div style={{ flex: 1, height: 1, background: "var(--bg-subtle)" }} />
            <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>o</span>
            <div style={{ flex: 1, height: 1, background: "var(--bg-subtle)" }} />
          </div>

          {/* Demo */}
          <div>
            <p style={labelEyebrow}>Modo desarrollo</p>

            {!showDemo ? (
              <button
                onClick={() => setShowDemo(true)}
                aria-expanded={showDemo}
                aria-controls="demo-panel"
                style={{
                  width: "100%", padding: "12px", borderRadius: 10,
                  border: "1px solid rgba(37,99,235,0.3)", background: "rgba(37,99,235,0.06)",
                  color: "var(--accent)", fontWeight: 600, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7"/>
                  <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
                Entrar como usuario de prueba
              </button>
            ) : (
              <div id="demo-panel" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Selectores */}
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="demo-role" style={{ fontSize: 12, color: "var(--fg-muted)", display: "block", marginBottom: 6 }}>Tipo de usuario</label>
                    <select
                      id="demo-role"
                      value={demoRole}
                      onChange={(e) => setDemoRole(e.target.value as "estudiante" | "docente")}
                      style={selectStyle}
                    >
                      <option value="estudiante">Estudiante</option>
                      <option value="docente">Docente</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="demo-plan" style={{ fontSize: 12, color: "var(--fg-muted)", display: "block", marginBottom: 6 }}>Plan</label>
                    <select
                      id="demo-plan"
                      value={demoPlan}
                      onChange={(e) => setDemoPlan(e.target.value as "estandar" | "pro")}
                      style={selectStyle}
                    >
                      <option value="estandar">Estándar</option>
                      <option value="pro">Pro</option>
                    </select>
                  </div>
                </div>

                {/* Vista previa */}
                <div style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--fg-muted)" }}>
                  Entrando como <strong style={{ color: "var(--accent)" }}>
                    {demoRole === "estudiante" ? "Estudiante" : "Docente"}
                  </strong> · Plan <strong style={{ color: "var(--accent)" }}>
                    {demoPlan === "estandar" ? "Estándar" : "Pro"}
                  </strong>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setShowDemo(false)}
                    style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--fg-muted)", fontSize: 13, cursor: "pointer" }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDemo()}
                    disabled={loading}
                    style={{
                      flex: 1, padding: "10px", borderRadius: 8,
                      background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.4)",
                      color: "var(--accent)", fontWeight: 700, fontSize: 14,
                      cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    {loading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Entrando…</> : "Ingresar →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p style={{ textAlign: "center", color: "var(--fg-secondary)", fontSize: 12, marginTop: 16 }}>
          <a href="/terminos" style={{ color: "var(--accent)" }}>Términos</a> ·{" "}
          <a href="/privacidad" style={{ color: "var(--accent)" }}>Privacidad</a>
        </p>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Link href="/" style={{ color: "var(--fg-secondary)", fontSize: 13, textDecoration: "none" }}>← Inicio</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginContent /></Suspense>;
}
