"use client";

import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();

  return (
    <section
      className="px-4 md:px-8 pt-[108px] pb-20"
      style={{
        position: "relative",
        textAlign: "center",
        overflow: "hidden",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Radial halo — ensures text stays legible but lets particles show through */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(680px, 85vw)",
          height: "420px",
          background: "radial-gradient(ellipse at center, var(--bg-base) 18%, transparent 68%)",
          opacity: 0.72,
          pointerEvents: "none",
          zIndex: 0,
          borderRadius: "50%",
        }}
      />

      {/* All content — above halo and canvas */}
      <div style={{ position: "relative", zIndex: 1 }}>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 999, padding: "6px 16px",
          fontSize: 13, color: "var(--fg-primary)",
          marginBottom: 32,
          boxShadow: "var(--shadow-sm)",
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#22c55e", display: "inline-block",
            flexShrink: 0,
          }} />
          Plataforma académica con inteligencia artificial
        </div>

        {/* H1 — full Antigravity typography tokens */}
        <h1 style={{
          fontSize: "var(--text-hero)",
          fontWeight: 900,
          lineHeight: "var(--leading-hero)",
          letterSpacing: "var(--tracking-hero)",
          color: "var(--fg-primary)",
          marginBottom: 24,
          maxWidth: 820,
          margin: "0 auto 24px",
        }}>
          Documentos académicos
          <br />
          de calidad, sin esfuerzo
        </h1>

        {/* Subheadline */}
        <p style={{
          color: "var(--fg-muted)",
          fontSize: 18,
          maxWidth: 500,
          margin: "0 auto 44px",
          lineHeight: 1.65,
          fontWeight: 400,
        }}>
          Para estudiantes y docentes. Genera monografías, planificaciones
          y material académico con IA — coherente, preciso y listo para presentar.
        </p>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            id="cta-estudiantes"
            onClick={() => router.push("/login")}
            className="btn-primary"
          >
            Para Estudiantes
          </button>

          <button
            id="cta-docentes"
            onClick={() => router.push("/login")}
            className="btn-secondary"
          >
            Para Docentes
          </button>

          <a href="/tutorial" id="cta-tutorial" className="btn-secondary">
            Cómo funciona
          </a>
        </div>

        {/* Social proof */}
        <p style={{
          marginTop: 40, fontSize: 13,
          color: "var(--fg-muted)", letterSpacing: "0.01em",
        }}>
          Bs. 150 · Pago único · Sin suscripción
        </p>
      </div>
    </section>
  );
}
