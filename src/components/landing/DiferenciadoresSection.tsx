"use client";

import RevealSection from "@/components/ui/RevealSection";

const DIFERENCIADORES = [
  {
    icono: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L3 6v6c0 5 3.5 9 9 10 5.5-1 9-5 9-10V6l-9-4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    titulo: "Sin alucinaciones",
    subtitulo: "Citas y datos verificados",
    descripcion:
      "Bloqueamos cualquier autor, año, DOI o URL inventado. Cada cita pasa por jerarquía de fuentes: oficiales bolivianas (INE, BCB, ASFI), latinoamericanas (SciELO, Redalyc) e internacionales (BID, CEPAL, Banco Mundial). Validador automático de coherencia entre los 5 capítulos.",
  },
  {
    icono: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 8l8-5 8 5-8 5-8-5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
        <path d="M4 12l8 5 8-5M4 16l8 5 8-5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
      </svg>
    ),
    titulo: "Formato oficial de tu universidad",
    subtitulo: "8 universidades bolivianas soportadas",
    descripcion:
      "UMSS, UMSA, UAGRM, UTO, USFX, UPB, EMI y formato genérico configurable. Márgenes, fuentes, interlineado, carátula y numeración exactos. Algunas universidades incluyen variantes según el diplomado o programa.",
  },
  {
    icono: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
        <path d="M14 2v6h6M9 13h6M9 17h6M9 9h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    titulo: "Tu material es la fuente principal",
    subtitulo: "PDFs, normativa, datos de tu empresa",
    descripcion:
      "Sube los manuales de tu diplomado, datos de tu empresa, normativa o encuestas. La IA usa tu material como fuente primaria antes que cualquier referencia genérica de internet. Tu monografía será sobre tu realidad laboral.",
  },
];

export default function DiferenciadoresSection() {
  return (
    <section
      id="diferenciadores"
      className="w-full px-4 md:px-8"
      style={{ maxWidth: "min(1300px, 92vw)", margin: "0 auto", paddingTop: 96, paddingBottom: 96 }}
    >
      <RevealSection>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{
            fontSize: 12, fontWeight: 600, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "var(--accent)",
            marginBottom: 12,
          }}>
            Por qué somos diferentes
          </p>
          <h2
            className="font-crimson"
            style={{ fontSize: 38, fontWeight: 700, color: "var(--fg-primary)", marginBottom: 12, letterSpacing: "-0.01em" }}
          >
            No somos un ChatGPT más
          </h2>
          <p style={{ color: "var(--fg-muted)", fontSize: 16, maxWidth: 620, margin: "0 auto", lineHeight: 1.6 }}>
            Tres garantías que ningún asistente genérico te da:
            citas reales, formato exacto y tu propio material como fuente.
          </p>
        </div>
      </RevealSection>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {DIFERENCIADORES.map((d, i) => (
          <RevealSection key={d.titulo} delay={i * 100}>
            <div
              className="card-premium"
              style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%" }}
            >
              <div style={{ color: "var(--accent)" }}>{d.icono}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--fg-primary)", marginBottom: 4 }}>
                  {d.titulo}
                </div>
                <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600, marginBottom: 12 }}>
                  {d.subtitulo}
                </div>
              </div>
              <p style={{ fontSize: 14, color: "var(--fg-secondary)", lineHeight: 1.7, margin: 0 }}>
                {d.descripcion}
              </p>
            </div>
          </RevealSection>
        ))}
      </div>
    </section>
  );
}
