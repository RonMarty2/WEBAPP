"use client";

import RevealSection from "@/components/ui/RevealSection";

const PASOS = [
  {
    numero: "01",
    titulo: "Regístrate y cuéntanos de ti",
    descripcion:
      "Crea tu cuenta con Google en 10 segundos. Indica tu universidad, diplomado, materias cursadas y dónde trabajas. Sube los PDFs que quieras como referencia.",
    detalles: [
      "Login con Google (sin contraseñas que olvidar)",
      "Elige entre 8 universidades bolivianas",
      "Sube tus lecturas, normativa, datos de tu empresa",
    ],
  },
  {
    numero: "02",
    titulo: "Elige tu tema o deja que la IA proponga",
    descripcion:
      "Si tienes un tema en mente, lo validamos y mejoramos. Si no, la IA propone 3 temas viables basados en tu programa, materias y contexto laboral.",
    detalles: [
      "Validación de viabilidad académica",
      "Propuestas anti-duplicación (no temas trillados)",
      "Modo libre: ingresa tu propio tema",
    ],
  },
  {
    numero: "03",
    titulo: "Genera y aprueba etapa por etapa",
    descripcion:
      "Avanzas en 4 etapas guiadas: Capítulo I, Capítulo II, Capítulos III-V + Bibliografía. Revisas cada una, pides ajustes por chat, apruebas y continúas.",
    detalles: [
      "Árbol de problemas TikZ automático",
      "Marco teórico con tus documentos como base",
      "Chat de modificaciones sin reiniciar el documento",
    ],
  },
  {
    numero: "04",
    titulo: "Descarga y defiende",
    descripcion:
      "Bajas el .tex listo para Overleaf y un PDF presentable. Además generamos un banco de preguntas para tu defensa y un PDF de preparación.",
    detalles: [
      "LaTeX completo listo para Overleaf",
      "PDF con formato oficial de tu universidad",
      "Banco de preguntas + PDF de preparación para sustentar",
    ],
  },
];

export default function ComoFuncionaSection() {
  return (
    <section
      id="como-funciona"
      className="w-full px-4 md:px-8"
      style={{ maxWidth: "min(1300px, 92vw)", margin: "0 auto", paddingTop: 96, paddingBottom: 96 }}
    >
      <RevealSection>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <p style={{
            fontSize: 12, fontWeight: 600, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "var(--accent)",
            marginBottom: 12,
          }}>
            Cómo funciona
          </p>
          <h2
            className="font-crimson"
            style={{ fontSize: 38, fontWeight: 700, color: "var(--fg-primary)", marginBottom: 12, letterSpacing: "-0.01em" }}
          >
            De cero a defendible en 4 pasos
          </h2>
          <p style={{ color: "var(--fg-muted)", fontSize: 16, maxWidth: 620, margin: "0 auto", lineHeight: 1.6 }}>
            Entre 2 y 4 horas de tu trabajo activo —
            revisando, aprobando, ajustando. La generación de IA en sí es cuestión de minutos por etapa.
          </p>
        </div>
      </RevealSection>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 920, margin: "0 auto" }}>
        {PASOS.map((paso, i) => (
          <RevealSection key={paso.numero} delay={i * 80}>
            <div
              className="card-premium"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(80px, auto) 1fr",
                gap: 24,
                alignItems: "flex-start",
              }}
            >
              <div
                className="font-crimson"
                style={{
                  fontSize: 56, fontWeight: 700,
                  color: "var(--accent)",
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  opacity: 0.7,
                }}
              >
                {paso.numero}
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--fg-primary)", marginBottom: 10 }}>
                  {paso.titulo}
                </h3>
                <p style={{ fontSize: 14.5, color: "var(--fg-secondary)", lineHeight: 1.7, marginBottom: 14 }}>
                  {paso.descripcion}
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  {paso.detalles.map((d) => (
                    <li
                      key={d}
                      style={{
                        display: "flex", gap: 8, alignItems: "flex-start",
                        fontSize: 13, color: "var(--fg-muted)",
                      }}
                    >
                      <span style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>→</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </RevealSection>
        ))}
      </div>
    </section>
  );
}
