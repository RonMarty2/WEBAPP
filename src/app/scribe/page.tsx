import Link from "next/link";

export default function ScribePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
        zIndex: 10,
      }}
    >
      <div
        className="card-premium"
        style={{
          maxWidth: 560,
          width: "100%",
          textAlign: "center",
          padding: "48px 36px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: 18,
            background: "rgba(99,102,241,0.08)",
            color: "var(--accent)",
            marginBottom: 24,
          }}
          aria-hidden="true"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>

        <h1
          className="font-crimson"
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: "var(--fg-primary)",
            letterSpacing: "-0.01em",
            marginBottom: 12,
          }}
        >
          SCRIBE
        </h1>

        <p
          style={{
            fontSize: 16,
            color: "var(--fg-secondary)",
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          Generador avanzado de proyectos de grado, tesis y monografías con
          estructuración lógica e integración LaTeX.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/dashboard"
            className="btn-primary"
            style={{ padding: "12px 24px", fontSize: 14, borderRadius: 999 }}
          >
            Ir al panel
          </Link>
          <Link
            href="/nucleo"
            className="btn-secondary"
            style={{ padding: "12px 24px", fontSize: 14, borderRadius: 999 }}
          >
            ← Volver al núcleo
          </Link>
        </div>
      </div>
    </div>
  );
}
