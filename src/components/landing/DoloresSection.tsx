"use client";

/**
 * DoloresSection — "¿Te suena alguno de estos?"
 *
 * Sección de identificación con el dolor del estudiante. Aparece después
 * del Hero para enganchar emocionalmente antes de mostrar soluciones.
 *
 * Diseño: 6 cards con frustraciones reales en cita textual. Iconografía
 * SVG sobria, sin emojis decorativos (anti-reference de PRODUCT.md).
 */

import { ReactNode } from "react";

interface Dolor {
  icon: ReactNode;
  texto: string;
}

const stroke = { stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

const DOLORES: Dolor[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
    texto: "\"No tengo tiempo de escribirla. Trabajo, estudio y la entrega es en dos semanas.\"",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
      </svg>
    ),
    texto: "\"Cada vez que la presento, el tutor pide algo distinto.\"",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
    ),
    texto: "\"Mi tutor revisa por encima y no entiendo bien qué quiere que cambie.\"",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
    ),
    texto: "\"La vengo dejando para mañana hace meses y ya no tengo más mañanas.\"",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
        <path d="M12 3a4 4 0 0 0-4 4 4 4 0 0 0-2 7c0 2 2 3 4 3v4" />
        <path d="M12 3a4 4 0 0 1 4 4 4 4 0 0 1 2 7c0 2-2 3-4 3v4" />
      </svg>
    ),
    texto: "\"No me acuerdo casi nada de lo que vimos en clase.\"",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
    texto: "\"No sé por dónde empezar. Abro el Word y me quedo en blanco.\"",
  },
];

export default function DoloresSection() {
  return (
    <section
      style={{
        padding: "70px 24px 50px",
        background: "var(--bg-card, #ffffff)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <h2
          className="font-crimson"
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "var(--fg-primary)",
            margin: "0 0 8px",
            textAlign: "center",
            letterSpacing: "-0.01em",
          }}
        >
          ¿Te suena alguno de estos?
        </h2>
        <p
          style={{
            color: "var(--fg-muted)",
            fontSize: 15.5,
            textAlign: "center",
            margin: "0 auto 36px",
            maxWidth: 520,
          }}
        >
          Si dijiste &quot;sí&quot; a uno solo, estás en el lugar correcto.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {DOLORES.map((d, i) => (
            <div
              key={i}
              style={{
                background: "var(--bg-card, #ffffff)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "20px 18px",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(15,23,42,0.35)";
                e.currentTarget.style.background = "rgba(15,23,42,0.015)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "var(--bg-card, #ffffff)";
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "rgba(15,23,42,0.04)",
                  color: "var(--fg-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {d.icon}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "var(--fg-secondary)",
                  lineHeight: 1.5,
                  fontStyle: "italic",
                }}
              >
                {d.texto}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
