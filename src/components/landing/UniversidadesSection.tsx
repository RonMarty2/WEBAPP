"use client";

import RevealSection from "@/components/ui/RevealSection";

const UNIVERSIDADES = [
  { sigla: "UMSS", nombre: "Universidad Mayor de San Simón", ciudad: "Cochabamba", variantes: 2 },
  { sigla: "UMSA", nombre: "Universidad Mayor de San Andrés", ciudad: "La Paz" },
  { sigla: "UAGRM", nombre: "Universidad Autónoma Gabriel René Moreno", ciudad: "Santa Cruz" },
  { sigla: "UTO", nombre: "Universidad Técnica de Oruro", ciudad: "Oruro" },
  { sigla: "USFX", nombre: "Universidad San Francisco Xavier", ciudad: "Sucre" },
  { sigla: "UPB", nombre: "Universidad Privada Boliviana", ciudad: "Cochabamba" },
  { sigla: "EMI", nombre: "Escuela Militar de Ingeniería", ciudad: "La Paz" },
  { sigla: "Otra", nombre: "Formato genérico configurable", ciudad: "Cualquier ciudad" },
];

export default function UniversidadesSection() {
  return (
    <section
      id="universidades"
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
            Universidades soportadas
          </p>
          <h2
            className="font-crimson"
            style={{ fontSize: 38, fontWeight: 700, color: "var(--fg-primary)", marginBottom: 12, letterSpacing: "-0.01em" }}
          >
            Tu universidad ya está aquí
          </h2>
          <p style={{ color: "var(--fg-muted)", fontSize: 16, maxWidth: 620, margin: "0 auto", lineHeight: 1.6 }}>
            Soportamos los formatos oficiales de las principales universidades bolivianas.
            Si la tuya no está en la lista, usa el formato genérico configurable.
          </p>
        </div>
      </RevealSection>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 14,
        maxWidth: 1100,
        margin: "0 auto",
      }}>
        {UNIVERSIDADES.map((u, i) => (
          <RevealSection key={u.sigla} delay={i * 50}>
            <div
              className="card-premium"
              style={{
                display: "flex", flexDirection: "column", gap: 8,
                padding: "20px",
                position: "relative",
              }}
            >
              {u.variantes && (
                <div style={{
                  position: "absolute", top: 12, right: 12,
                  fontSize: 10, fontWeight: 700,
                  background: "var(--green-bg)",
                  border: "1px solid var(--green-border)",
                  color: "var(--green)",
                  borderRadius: 6, padding: "2px 8px",
                  letterSpacing: "0.04em",
                }}>
                  {u.variantes} variantes
                </div>
              )}
              <div
                className="font-crimson"
                style={{
                  fontSize: 28, fontWeight: 700,
                  color: "var(--fg-primary)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
              >
                {u.sigla}
              </div>
              <div style={{ fontSize: 13, color: "var(--fg-secondary)", lineHeight: 1.4, fontWeight: 500 }}>
                {u.nombre}
              </div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>
                {u.ciudad}
              </div>
            </div>
          </RevealSection>
        ))}
      </div>

      <RevealSection delay={200}>
        <div style={{
          marginTop: 32, textAlign: "center",
          padding: "14px 20px",
          background: "var(--bg-subtle)",
          border: "1px dashed var(--border)",
          borderRadius: 12,
          maxWidth: 620,
          margin: "32px auto 0",
          fontSize: 13.5,
          color: "var(--fg-muted)",
          lineHeight: 1.6,
        }}>
          <strong style={{ color: "var(--fg-primary)" }}>¿Tu universidad no está?</strong>{" "}
          Usa el formato genérico configurable o escríbenos —
          podemos agregar la tuya en menos de 48h.
        </div>
      </RevealSection>
    </section>
  );
}
