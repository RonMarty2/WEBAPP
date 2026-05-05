"use client";

import { useRouter } from "next/navigation";

// ── Íconos SVG Estilizados ──────────────────────────────────────────────────
const IconScribe = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const IconAxiom = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
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
        
        {/* SCRIBE */}
        <div 
          className="card card-hover" 
          onClick={() => router.push('/dashboard')}
          style={{ 
            borderColor: "rgba(37,99,235,0.22)", 
            background: "rgba(37,99,235,0.06)", 
            position: "relative", 
            overflow: "hidden",
            padding: "32px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            flexWrap: "wrap",
            gap: 24
          }}
        >
          <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: "-100px", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(37,99,235,0.15) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
          
          <div style={{ display: "flex", alignItems: "center", gap: 24, minWidth: 250 }}>
            <div style={{ color: "rgb(59,130,246)", background: "rgba(37,99,235,0.1)", padding: 16, borderRadius: 20, border: "1px solid rgba(37,99,235,0.2)" }}>
              <IconScribe />
            </div>
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: "var(--fg-primary)", margin: 0, marginBottom: 4 }}>SCRIBE</h2>
              <span className="badge badge-cyan" style={{ fontSize: 10, background: "rgba(37,99,235,0.1)", color: "rgb(59,130,246)" }}>Módulo Principal</span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 300 }}>
            <p style={{ color: "var(--fg-muted)", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
              Generador lógico estructurado de Proyectos de Grado y Monografías (APA 7). Funciona bajo un estricto motor de coherencia de investigación.
            </p>
          </div>

          <div className="btn-primary" style={{ display: "inline-flex", background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.4)", color: "rgb(59,130,246)", padding: "12px 24px" }}>
            Ingresar →
          </div>
        </div>

        {/* AXIOM */}
        <div 
          className="card card-hover" 
          onClick={() => router.push('/axiom')}
          style={{ 
            borderColor: "rgba(139,92,246,0.22)", 
            background: "rgba(139,92,246,0.06)", 
            position: "relative", 
            overflow: "hidden",
            padding: "32px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            flexWrap: "wrap",
            gap: 24
          }}
        >
          <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: "-100px", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
          
          <div style={{ display: "flex", alignItems: "center", gap: 24, minWidth: 250 }}>
            <div style={{ color: "rgb(167,139,250)", background: "rgba(139,92,246,0.1)", padding: 16, borderRadius: 20, border: "1px solid rgba(139,92,246,0.2)" }}>
              <IconAxiom />
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "var(--fg-primary)", margin: 0 }}>AXIOM</h2>
          </div>

          <div style={{ flex: 1, minWidth: 300 }}>
            <p style={{ color: "var(--fg-muted)", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
              Simulador paramétrico de Exámenes de Alta Precisión. Entrena y evalúa competencias bajo métricas exactas.
            </p>
          </div>

          <div className="btn-primary" style={{ display: "inline-flex", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.4)", color: "rgb(167,139,250)", padding: "12px 24px" }}>
            Ingresar →
          </div>
        </div>

        {/* LUMEN */}
        <div 
          className="card card-hover" 
          onClick={() => router.push('/lumen')}
          style={{ 
            borderColor: "rgba(245,158,11,0.22)", 
            background: "rgba(245,158,11,0.06)", 
            position: "relative", 
            overflow: "hidden",
            padding: "32px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            flexWrap: "wrap",
            gap: 24
          }}
        >
          <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: "-100px", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(245,158,11,0.15) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
          
          <div style={{ display: "flex", alignItems: "center", gap: 24, minWidth: 250 }}>
            <div style={{ color: "rgb(251,191,36)", background: "rgba(245,158,11,0.1)", padding: 16, borderRadius: 20, border: "1px solid rgba(245,158,11,0.2)" }}>
              <IconLumen />
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "var(--fg-primary)", margin: 0 }}>LUMEN</h2>
          </div>

          <div style={{ flex: 1, minWidth: 300 }}>
            <p style={{ color: "var(--fg-muted)", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
              Generador avanzado de material de Contenido Docente. Planeación curricular y desarrollo de clases en minutos.
            </p>
          </div>

          <div className="btn-primary" style={{ display: "inline-flex", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)", color: "rgb(251,191,36)", padding: "12px 24px" }}>
            Ingresar →
          </div>
        </div>

        {/* MENTOR */}
        <div 
          className="card card-hover" 
          onClick={() => router.push('/mentor')}
          style={{ 
            borderColor: "rgba(16,185,129,0.22)", 
            background: "rgba(16,185,129,0.06)", 
            position: "relative", 
            overflow: "hidden",
            padding: "32px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            flexWrap: "wrap",
            gap: 24
          }}
        >
          <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: "-100px", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(16,185,129,0.15) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
          
          <div style={{ display: "flex", alignItems: "center", gap: 24, minWidth: 250 }}>
            <div style={{ color: "rgb(52,211,153)", background: "rgba(16,185,129,0.1)", padding: 16, borderRadius: 20, border: "1px solid rgba(16,185,129,0.2)" }}>
              <IconMentor />
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "var(--fg-primary)", margin: 0 }}>MENTOR</h2>
          </div>

          <div style={{ flex: 1, minWidth: 300 }}>
            <p style={{ color: "var(--fg-muted)", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
              Herramienta de tutoría automatizada con feedback continuo para la validación experta de proyectos.
            </p>
          </div>

          <div className="btn-primary" style={{ display: "inline-flex", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", color: "rgb(52,211,153)", padding: "12px 24px" }}>
            Ingresar →
          </div>
        </div>

      </div>
    </div>
  );
}
