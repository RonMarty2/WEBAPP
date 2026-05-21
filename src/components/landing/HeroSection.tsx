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
      {/* Halo central — adaptive a tema (claro: crema; oscuro: índigo sutil) */}
      <div aria-hidden="true" className="hero-halo" />

      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>

        {/* Badge — identidad boliviana */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 999, padding: "6px 16px",
          fontSize: 13, color: "var(--fg-primary)",
          marginBottom: 32,
          boxShadow: "0 0 0 4px rgba(99,102,241,0.06), var(--shadow-sm)",
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#22c55e", display: "inline-block",
            flexShrink: 0,
            boxShadow: "0 0 6px rgba(34,197,94,0.5)",
          }} />
          Hecho en Bolivia · IA con citas verificadas
        </div>

        {/* H1 — serif, peso académico */}
        <h1
          className="font-crimson"
          style={{
            fontSize: "var(--text-hero)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "var(--fg-primary)",
            maxWidth: 920,
            margin: "0 auto 24px",
          }}
        >
          Termina tu monografía
          <br />
          <span style={{ color: "var(--accent)" }}>antes de que llegue el lunes</span>
        </h1>

        {/* Subheadline — usa fg-secondary para mejor contraste en ambos temas */}
        <p style={{
          color: "var(--fg-secondary)",
          fontSize: 19,
          maxWidth: 640,
          margin: "0 auto 18px",
          lineHeight: 1.55,
          fontWeight: 400,
        }}>
          La IA redacta. Tú apruebas. Tu tutor aprueba. Llegas a la defensa con
          tiempo y con todo en orden.
        </p>

        {/* Badge de tiempo (impacto rápido) */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "10px 22px", borderRadius: 999,
          background: "var(--accent)", color: "white",
          fontWeight: 700, fontSize: 14.5,
          boxShadow: "0 8px 20px rgba(99, 102, 241, 0.30)",
          marginBottom: 18,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2v10l4 2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.2"/>
          </svg>
          Primer borrador completo en menos de 3 horas
        </div>

        {/* Tagline */}
        <p style={{
          color: "var(--fg-secondary)",
          fontSize: 14,
          marginBottom: 40,
          fontStyle: "italic",
          letterSpacing: "0.01em",
        }}>
          La IA redacta. Tú apruebas. El documento es real.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
          <button
            id="cta-probar-gratis"
            onClick={() => router.push("/login?demo=1")}
            className="btn-primary"
            style={{
              fontSize: 16,
              padding: "14px 28px",
              background: "linear-gradient(135deg, var(--accent), #4f46e5)",
              boxShadow: "0 12px 28px rgba(99, 102, 241, 0.35)",
            }}
          >
            🚀 Probar gratis (sin tarjeta)
          </button>

          <button
            id="cta-empezar"
            onClick={() => router.push("/login")}
            className="btn-secondary"
          >
            Ya tengo cuenta
          </button>

          <a href="#como-funciona" id="cta-como-funciona" className="btn-secondary">
            Ver cómo funciona
          </a>
        </div>

        {/* Micro-prueba debajo del CTA */}
        <p style={{
          fontSize: 13,
          color: "var(--fg-muted)",
          marginBottom: 36,
        }}>
          Genera tu <strong style={{ color: "var(--fg-primary)" }}>primer capítulo gratis</strong> en 5 minutos · Sin compromiso · Sin tarjeta
        </p>

        {/* Trust badges */}
        <div style={{
          display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap",
          fontSize: 13, color: "var(--fg-muted)",
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "var(--accent)" }}>✓</span> Sin citas inventadas
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "var(--accent)" }}>✓</span> Formato UMSS, UMSA, UAGRM y +5
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "var(--accent)" }}>✓</span> Exporta a LaTeX + PDF
          </span>
        </div>

        {/* Price line */}
        <p style={{
          marginTop: 38, fontSize: 14,
          color: "var(--fg-muted)", letterSpacing: "0.01em",
        }}>
          Desde <strong style={{ color: "var(--fg-primary)" }}>Bs. 150</strong> · Pago único · Sin suscripción obligatoria
        </p>
      </div>
    </section>
  );
}
