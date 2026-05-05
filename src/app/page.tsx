"use client";

import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ThemeToggle from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <div className="ag-shell" style={{ minHeight: "100vh", position: "relative" }}>
      {/* ── All content sits above canvas (z:1) ── */}
      <div style={{ position: "relative", zIndex: 1 }}>

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <header className="navbar w-full">
        <div className="w-full px-6 md:px-12 flex items-center h-[62px]">
          {/* 1. Logo (Izquierda) */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="var(--fg-primary)" strokeWidth="2"/>
              <path d="M8 12h8M12 8v8" stroke="var(--fg-primary)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontWeight: 800, fontSize: 16, color: "var(--fg-primary)", letterSpacing: 0 }}>
              Laboratorio<span style={{ color: "var(--accent)" }}>Académico</span>
            </span>
          </div>

          {/* 2. Nav links (Centro) */}
          <nav className="hidden md:flex items-center gap-6 justify-center" style={{ flex: 1 }}>
            <a href="#productos" style={{ fontSize: 14, color: "var(--fg-muted)", textDecoration: "none", padding: "6px 12px", borderRadius: 999, transition: "color 0.15s" }}>Productos</a>
            <a href="#planes"    style={{ fontSize: 14, color: "var(--fg-muted)", textDecoration: "none", padding: "6px 12px", borderRadius: 999, transition: "color 0.15s" }}>Precios</a>
            <a href="/tutorial"  style={{ fontSize: 14, color: "var(--fg-muted)", textDecoration: "none", padding: "6px 12px", borderRadius: 999, transition: "color 0.15s" }}>Tutorial</a>
          </nav>

          {/* 3. Action buttons (Derecha) */}
          <div className="flex items-center justify-end gap-2 md:gap-4" style={{ flex: 1 }}>
            <a href="/login" id="nav-login"
              style={{
                fontSize: 14, color: "var(--fg-muted)", textDecoration: "none",
                padding: "7px 14px", borderRadius: 999,
                border: "1px solid var(--border)",
                transition: "border-color 0.15s",
              }}>
              Acceder
            </a>
            <a href="#planes" id="nav-ver-planes"
              className="btn-primary hidden sm:inline-flex"
              style={{ padding: "8px 18px", fontSize: 14, borderRadius: 999 }}>
              Ver planes
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Features + Pricing + CTA ────────────────────────────────── */}
      <main>
        <FeaturesSection />
      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 dark:border-white/10 px-4 md:px-8 py-8">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>
            Laboratorio Académico © 2026
          </span>
          <nav className="flex flex-wrap justify-center gap-4 md:gap-5">
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
