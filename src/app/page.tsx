"use client";

import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ParticleSphere from "@/components/ParticleSphere";
import ThemeToggle from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <div className="ag-shell" style={{ minHeight: "100vh", position: "relative" }}>

      {/* ── Particle sphere — landing only, fixed behind content ── */}
      <ParticleSphere />

      {/* ── All content sits above canvas (z:1) ── */}
      <div style={{ position: "relative", zIndex: 1 }}>

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <header className="navbar">
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 62,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="var(--fg-primary)" strokeWidth="2"/>
              <path d="M8 12h8M12 8v8" stroke="var(--fg-primary)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontWeight: 800, fontSize: 16, color: "var(--fg-primary)", letterSpacing: 0 }}>
              Laboratorio<span style={{ color: "var(--accent)" }}>Académico</span>
            </span>
          </div>

          {/* Nav links */}
          <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <a href="#productos" style={{ fontSize: 14, color: "var(--fg-muted)", textDecoration: "none", padding: "6px 12px", borderRadius: 999, transition: "color 0.15s" }}>Productos</a>
            <a href="#planes"    style={{ fontSize: 14, color: "var(--fg-muted)", textDecoration: "none", padding: "6px 12px", borderRadius: 999, transition: "color 0.15s" }}>Precios</a>
            <a href="/tutorial"  style={{ fontSize: 14, color: "var(--fg-muted)", textDecoration: "none", padding: "6px 12px", borderRadius: 999, transition: "color 0.15s" }}>Tutorial</a>
            <a href="/login"     id="nav-login"
              style={{
                fontSize: 14, color: "var(--fg-muted)", textDecoration: "none",
                padding: "7px 14px", borderRadius: 999,
                border: "1px solid var(--border)", marginLeft: 4,
                transition: "border-color 0.15s",
              }}>
              Iniciar sesión
            </a>
            <a href="#planes" id="nav-ver-planes"
              className="btn-primary"
              style={{ padding: "8px 18px", fontSize: 14, borderRadius: 999, marginLeft: 4 }}>
              Ver planes
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Features + Pricing + CTA ────────────────────────────────── */}
      <main>
        <FeaturesSection />
      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "28px 32px" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 14,
        }}>
          <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>
            Laboratorio Académico © 2026
          </span>
          <nav style={{ display: "flex", gap: 20 }}>
            <a href="#productos"   style={{ fontSize: 13, color: "var(--fg-muted)", textDecoration: "none" }}>Productos</a>
            <a href="/tutorial"    style={{ fontSize: 13, color: "var(--fg-muted)", textDecoration: "none" }}>Tutorial</a>
            <a href="/terminos"    style={{ fontSize: 13, color: "var(--fg-muted)", textDecoration: "none" }}>Términos</a>
            <a href="/privacidad"  style={{ fontSize: 13, color: "var(--fg-muted)", textDecoration: "none" }}>Privacidad</a>
          </nav>
        </div>
      </footer>

      </div>
    </div>
  );
}
