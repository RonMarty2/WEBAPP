"use client";

import { useRouter } from "next/navigation";
import { SERVICIOS_CATALOGO, type ServicioId } from "@/lib/servicesCatalog";

// ── Íconos SVG estilizados ──────────────────────────────────────────────────
const IconScribe = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const IconLumen = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const IconMentor = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconLaboratorio = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2v6L4 18a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-10V2" />
    <line x1="9" y1="2" x2="15" y2="2" />
    <line x1="7" y1="14" x2="17" y2="14" />
  </svg>
);

const IconProyectoGrado = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <polyline points="8 17 10.5 14 13 16 17 11" />
  </svg>
);

const ICON_MAP: Record<ServicioId, React.ComponentType> = {
  scribe: IconScribe,
  "proyecto-grado": IconProyectoGrado,
  lumen: IconLumen,
  mentor: IconMentor,
  laboratorio: IconLaboratorio,
};

export default function NucleoHubPage() {
  const router = useRouter();

  return (
    <div className="bg-transparent" style={{ minHeight: "100vh", position: "relative", zIndex: 10, padding: "24px 24px 80px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* ── NŪCLEO Central ── */}
      <div style={{ textAlign: "center", marginTop: 60, marginBottom: 60 }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg-muted)", marginBottom: 20 }}>
          Directorio Madre
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 800, color: "var(--fg-primary)", marginBottom: 16 }}>
          NŪCLEO
        </h1>
      </div>

      {/* ── Franjas Inmersivas (Estilo Orbital) ── */}
      <div style={{ width: "100%", maxWidth: 1000, display: "flex", flexDirection: "column", gap: 20 }}>

        {SERVICIOS_CATALOGO.map((servicio) => {
          const Icon = ICON_MAP[servicio.iconId];
          const { accentRgb, accentLight } = servicio.paleta;
          const isBeta = servicio.estado === "beta";

          return (
            <div
              key={servicio.id}
              className="card card-hover"
              onClick={() => router.push(servicio.ruta)}
              style={{
                borderColor: `rgba(${accentRgb},0.22)`,
                background: `rgba(${accentRgb},0.06)`,
                position: "relative",
                overflow: "hidden",
                padding: "32px 40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                flexWrap: "wrap",
                gap: 24,
              }}
            >
              <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: "-100px", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(${accentRgb},0.15) 0%, transparent 70%)`, filter: "blur(40px)", pointerEvents: "none" }} />

              <div style={{ display: "flex", alignItems: "center", gap: 24, minWidth: 250 }}>
                <div style={{ color: `rgb(${accentLight})`, background: `rgba(${accentRgb},0.1)`, padding: 16, borderRadius: 20, border: `1px solid rgba(${accentRgb},0.2)` }}>
                  <Icon />
                </div>
                <div>
                  <h2 style={{ fontSize: 32, fontWeight: 800, color: "var(--fg-primary)", margin: 0, marginBottom: servicio.badge || isBeta ? 4 : 0 }}>
                    {servicio.nombre}
                  </h2>
                  {servicio.badge && (
                    <span className="badge badge-cyan" style={{ fontSize: 10, background: `rgba(${accentRgb},0.1)`, color: `rgb(${accentLight})` }}>
                      {servicio.badge}
                    </span>
                  )}
                  {!servicio.badge && isBeta && (
                    <span className="badge" style={{ fontSize: 10, background: `rgba(${accentRgb},0.1)`, color: `rgb(${accentLight})`, padding: "2px 8px", borderRadius: 999, border: `1px solid rgba(${accentRgb},0.3)` }}>
                      Beta
                    </span>
                  )}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 300 }}>
                <p style={{ color: "var(--fg-muted)", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
                  {servicio.descripcion}
                </p>
              </div>

              <div className="btn-primary" style={{ display: "inline-flex", background: `rgba(${accentRgb},0.15)`, border: `1px solid rgba(${accentRgb},0.4)`, color: `rgb(${accentLight})`, padding: "12px 24px" }}>
                Ingresar →
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
