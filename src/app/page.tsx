"use client";

import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ParticleSphere from "@/components/ParticleSphere";
import ThemeToggle from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", position: "relative" }}>

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
              <circle cx="12" cy="12" r="10" stroke="#0f172a" strokeWidth="2"/>
              <path d="M8 12h8M12 8v8" stroke="#0f172a" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", letterSpacing: "-0.02em" }}>
              Laboratorio<span style={{ color: "#3b82f6" }}>Académico</span>
            </span>
          </div>

          {/* Nav links */}
          <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <a href="#productos" style={{ fontSize: 14, color: "#64748b", textDecoration: "none", padding: "6px 12px", borderRadius: 8, transition: "color 0.15s" }}>Productos</a>
            <a href="#planes"    style={{ fontSize: 14, color: "#64748b", textDecoration: "none", padding: "6px 12px", borderRadius: 8, transition: "color 0.15s" }}>Precios</a>
            <a href="/tutorial"  style={{ fontSize: 14, color: "#64748b", textDecoration: "none", padding: "6px 12px", borderRadius: 8, transition: "color 0.15s" }}>Tutorial</a>
            <a href="/login"     id="nav-login"
              style={{
                fontSize: 14, color: "#64748b", textDecoration: "none",
                padding: "7px 14px", borderRadius: 8,
                border: "1px solid #e2e8f0", marginLeft: 4,
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
      <footer style={{ borderTop: "1px solid #f1f5f9", padding: "28px 32px" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 14,
        }}>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>
            Laboratorio Académico © 2026
          </span>
          <nav style={{ display: "flex", gap: 20 }}>
            <a href="#productos"   style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>Productos</a>
            <a href="/tutorial"    style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>Tutorial</a>
            <a href="/terminos"    style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>Términos</a>
            <a href="/privacidad"  style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>Privacidad</a>
          </nav>
        </div>
      </footer>

      </div>
    </div>
  );
}
