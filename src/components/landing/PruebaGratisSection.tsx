"use client";

import { useRouter } from "next/navigation";

export default function PruebaGratisSection() {
  const router = useRouter();

  return (
    <section
      id="prueba-gratis"
      style={{
        padding: "64px 16px",
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.10), rgba(168,85,247,0.10))",
          border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: 24,
          padding: "44px 32px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(99, 102, 241, 0.10)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.3)",
            color: "#15803d",
            fontWeight: 700,
            fontSize: 12.5,
            marginBottom: 18,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          🎁 100% Gratis · Sin tarjeta
        </div>

        <h2
          className="font-crimson"
          style={{
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 700,
            color: "var(--fg-primary)",
            marginBottom: 14,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
          }}
        >
          Pruébalo gratis antes de pagar nada
        </h2>

        <p
          style={{
            fontSize: 17,
            color: "var(--fg-muted)",
            maxWidth: 640,
            margin: "0 auto 28px",
            lineHeight: 1.6,
          }}
        >
          Crea tu cuenta de prueba en 5 segundos. Genera tu primera propuesta de
          tema y el comienzo del Capítulo I <strong>sin pagar nada</strong>. Si
          te convence, sigues con el resto por solo Bs. 150.
        </p>

        {/* Pasos visuales */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 24,
            flexWrap: "wrap",
            marginBottom: 32,
          }}
        >
          {[
            { n: "1", t: "Entras gratis", d: "Sin tarjeta, sin registro largo" },
            { n: "2", t: "Eliges tu tema", d: "La IA te sugiere 3 opciones" },
            { n: "3", t: "Ves el resultado", d: "Decides si pagar o no" },
          ].map((p) => (
            <div
              key={p.n}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                maxWidth: 250,
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 6px 14px rgba(99,102,241,0.35)",
                }}
              >
                {p.n}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 14.5,
                    fontWeight: 700,
                    color: "var(--fg-primary)",
                    marginBottom: 2,
                  }}
                >
                  {p.t}
                </div>
                <div style={{ fontSize: 13, color: "var(--fg-muted)" }}>{p.d}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/login?demo=1")}
          className="btn-primary"
          style={{
            fontSize: 17,
            padding: "16px 36px",
            background:
              "linear-gradient(135deg, var(--accent), #4f46e5)",
            boxShadow: "0 14px 32px rgba(99, 102, 241, 0.4)",
            borderRadius: 14,
          }}
        >
          🚀 Empezar mi prueba gratis ahora
        </button>

        <p
          style={{
            marginTop: 16,
            fontSize: 13,
            color: "var(--fg-muted)",
          }}
        >
          Toma 5 segundos · No te pedimos tarjeta · Puedes cerrar cuando quieras
        </p>
      </div>
    </section>
  );
}
