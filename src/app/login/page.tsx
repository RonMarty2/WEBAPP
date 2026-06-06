"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginContent() {
  const params = useSearchParams();
  const error = params.get("error");

  const errorMsg =
    error === "oauth_failed" ? "Error al conectar con Google. Intenta nuevamente."
    : error === "profile_failed" ? "No se pudo obtener tu perfil de Google."
    : null;

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
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
        overflow: "hidden",
      }}
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
          <h1
            className="font-crimson"
            style={{ fontSize: 26, fontWeight: 700, color: "var(--fg-primary)", letterSpacing: "-0.01em" }}
          >
            Laboratorio Académico
          </h1>
          <p style={{ color: "var(--fg-muted)", marginTop: 6, fontSize: 14 }}>
            Entra con tu cuenta de Google
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
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                style={{ flexShrink: 0, marginTop: 1 }}
              >
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: "13px 20px",
                borderRadius: 10,
                border: "1px solid var(--border-hover)",
                background: "var(--bg-card)",
                color: "var(--fg-primary)",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </a>
            <p
              style={{
                fontSize: 12,
                color: "var(--fg-secondary)",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Si es tu primera vez, tu acceso se activa automáticamente.
            </p>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "var(--fg-secondary)", fontSize: 12, marginTop: 16 }}>
          <a href="/terminos" style={{ color: "var(--accent)" }}>Términos</a>{" "}
          ·{" "}
          <a href="/privacidad" style={{ color: "var(--accent)" }}>Privacidad</a>
        </p>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Link
            href="/"
            style={{ color: "var(--fg-secondary)", fontSize: 13, textDecoration: "none" }}
          >
            ← Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
