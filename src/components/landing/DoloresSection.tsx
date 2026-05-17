"use client";

/**
 * DoloresSection — "¿Te suena alguno de estos?"
 *
 * Sección de identificación con el dolor del estudiante. Aparece después
 * del Hero para enganchar emocionalmente antes de mostrar soluciones.
 *
 * Diseño: 6 cards con frustraciones reales en cita textual, sobre fondo
 * blanco para resaltar contra la sección Hero (que tiene gradiente).
 */

interface Dolor {
  icon: string;
  texto: string;
}

const DOLORES: Dolor[] = [
  { icon: "⏰", texto: "\"No tengo tiempo de escribirla. Trabajo, estudio y la entrega es en dos semanas.\"" },
  { icon: "🔁", texto: "\"Cada vez que la presento, el tutor pide algo distinto.\"" },
  { icon: "🤷", texto: "\"Mi tutor revisa por encima y no entiendo bien qué quiere que cambie.\"" },
  { icon: "📅", texto: "\"La vengo dejando para mañana hace meses y ya no tengo más mañanas.\"" },
  { icon: "🧠", texto: "\"No me acuerdo casi nada de lo que vimos en clase.\"" },
  { icon: "🎯", texto: "\"No sé por dónde empezar. Abro el Word y me quedo en blanco.\"" },
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
                border: "1.5px solid rgba(15,23,42,0.22)",
                borderRadius: 14,
                padding: "20px 18px",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                boxShadow: "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(239,68,68,0.04)",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)";
                e.currentTarget.style.background = "rgba(239,68,68,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(15,23,42,0.22)";
                e.currentTarget.style.background = "var(--bg-card, #ffffff)";
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(239,68,68,0.08)",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
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
