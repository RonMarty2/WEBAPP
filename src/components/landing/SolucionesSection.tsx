"use client";

/**
 * SolucionesSection — "Cómo te resolvemos cada uno"
 *
 * Mapeo 1-a-1 entre cada dolor de la sección anterior y la solución
 * concreta del SaaS. Formato visual: problema → flecha → respuesta.
 */

interface Solucion {
  problema: string;
  respuesta: string;
}

const SOLUCIONES: Solucion[] = [
  { problema: "\"No tengo tiempo\"",                       respuesta: "Te entregamos el borrador completo en menos de 3 horas" },
  { problema: "\"El tutor cambia de opinión cada semana\"", respuesta: "Cada nueva observación se aplica en minutos, sin rehacer nada" },
  { problema: "\"No entiendo qué quiere mi tutor\"",        respuesta: "La IA interpreta la observación y propone la corrección exacta" },
  { problema: "\"Lo vengo dejando para mañana\"",           respuesta: "Empieza ahora y mañana lo tienes listo para imprimir" },
  { problema: "\"No me acuerdo de la materia\"",            respuesta: "La IA construye todo el contenido desde tu tema; tú solo apruebas" },
  { problema: "\"No sé por dónde empezar\"",                respuesta: "Te guiamos paso a paso desde el primer clic" },
];

export default function SolucionesSection() {
  return (
    <section
      style={{
        padding: "70px 24px 60px",
        background: "var(--bg-base, #fbfbfa)",
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
          Cómo te resolvemos cada uno
        </h2>
        <p
          style={{
            color: "var(--fg-muted)",
            fontSize: 15.5,
            textAlign: "center",
            margin: "0 auto 36px",
            maxWidth: 540,
          }}
        >
          No es magia, es IA entrenada con las normas exactas de tu universidad.
        </p>

        <div
          style={{
            maxWidth: 780,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {SOLUCIONES.map((s, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gap: 18,
                alignItems: "center",
                background: "var(--bg-card, #ffffff)",
                border: "1.5px solid rgba(15,23,42,0.22)",
                borderRadius: 14,
                padding: "16px 22px",
                boxShadow: "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(99,102,241,0.04)",
              }}
            >
              <div
                style={{
                  textAlign: "right",
                  color: "var(--fg-muted)",
                  fontSize: 13.5,
                  fontStyle: "italic",
                }}
              >
                {s.problema}
              </div>
              <div
                style={{
                  color: "var(--accent)",
                  fontSize: 22,
                  fontWeight: 800,
                }}
              >
                →
              </div>
              <div
                style={{
                  color: "var(--fg-primary)",
                  fontSize: 14,
                  fontWeight: 700,
                  lineHeight: 1.4,
                }}
              >
                {s.respuesta}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
