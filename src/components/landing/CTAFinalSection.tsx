"use client";

import { useRouter } from "next/navigation";

/**
 * CTAFinalSection — cierre emocional al final de la landing
 *
 * Recordatorio del valor + botón grande de acción. Va después de FAQs.
 */

export default function CTAFinalSection() {
  const router = useRouter();
  return (
    <section
      style={{
        padding: "80px 24px",
        background: "linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(99,102,241,0.04) 100%)",
        borderTop: "1px solid var(--border)",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h2
          className="font-crimson"
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: "var(--fg-primary)",
            margin: "0 0 12px",
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
          }}
        >
          Tu monografía puede estar lista mañana
        </h2>
        <p
          style={{
            color: "var(--fg-secondary)",
            fontSize: 17,
            margin: "0 auto 30px",
            lineHeight: 1.55,
            maxWidth: 560,
          }}
        >
          Empieza ahora con el plan que mejor se ajusta a tu situación. Sin
          compromiso mensual, sin letra chica.
        </p>

        <div
          style={{
            display: "inline-flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            onClick={() => {
              const planes = document.getElementById("planes");
              if (planes) planes.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              padding: "14px 28px",
              borderRadius: 12,
              background: "var(--accent)",
              color: "white",
              border: "1.5px solid var(--accent)",
              fontFamily: "inherit",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(99,102,241,0.30)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(99,102,241,0.40)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.30)";
            }}
          >
            Ver los planes →
          </button>
          <button
            type="button"
            onClick={() => router.push("/login")}
            style={{
              padding: "14px 24px",
              borderRadius: 12,
              background: "var(--bg-card, #ffffff)",
              color: "var(--fg-primary)",
              border: "1.5px solid rgba(15,23,42,0.22)",
              fontFamily: "inherit",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(15,23,42,0.22)";
              e.currentTarget.style.color = "var(--fg-primary)";
            }}
          >
            Ya tengo cuenta
          </button>
        </div>

        <p
          style={{
            color: "var(--fg-muted)",
            fontSize: 13,
            margin: "24px 0 0",
            fontStyle: "italic",
          }}
        >
          La IA redacta. Tú apruebas. El documento es real.
        </p>
      </div>
    </section>
  );
}
