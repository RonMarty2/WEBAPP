"use client";

import HeroSection from "@/components/landing/HeroSection";
import ComoFuncionaSection from "@/components/landing/ComoFuncionaSection";
import DiferenciadoresSection from "@/components/landing/DiferenciadoresSection";
import UniversidadesSection from "@/components/landing/UniversidadesSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import FAQsSection from "@/components/landing/FAQsSection";
import ThemeToggle from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <div className="ag-shell" style={{ minHeight: "100vh", position: "relative" }}>
      {/* ── Contenido sobre canvas ── */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── Navbar ──────────────────────────────────────────────── */}
        <header className="navbar w-full">
          <div className="w-full px-6 md:px-12 flex items-center h-[62px]">
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="var(--fg-primary)" strokeWidth="2" />
                <path d="M8 12h8M12 8v8" stroke="var(--fg-primary)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span style={{ fontWeight: 800, fontSize: 16, color: "var(--fg-primary)", letterSpacing: 0 }}>
                Laboratorio<span style={{ color: "var(--accent)" }}>Académico</span>
              </span>
            </div>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-5 justify-center" style={{ flex: 1.4 }}>
              <a href="#como-funciona" style={{ fontSize: 14, color: "var(--fg-muted)", textDecoration: "none", padding: "6px 10px", borderRadius: 999 }}>Cómo funciona</a>
              <a href="#diferenciadores" style={{ fontSize: 14, color: "var(--fg-muted)", textDecoration: "none", padding: "6px 10px", borderRadius: 999 }}>Por qué somos diferentes</a>
              <a href="#universidades" style={{ fontSize: 14, color: "var(--fg-muted)", textDecoration: "none", padding: "6px 10px", borderRadius: 999 }}>Universidades</a>
              <a href="#planes" style={{ fontSize: 14, color: "var(--fg-muted)", textDecoration: "none", padding: "6px 10px", borderRadius: 999 }}>Precios</a>
              <a href="#faqs" style={{ fontSize: 14, color: "var(--fg-muted)", textDecoration: "none", padding: "6px 10px", borderRadius: 999 }}>FAQs</a>
            </nav>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 md:gap-3" style={{ flex: 1 }}>
              <a
                href="/login"
                id="nav-login"
                style={{
                  fontSize: 14, color: "var(--fg-muted)", textDecoration: "none",
                  padding: "7px 14px", borderRadius: 999,
                  border: "1px solid var(--border)",
                }}
              >
                Acceder
              </a>
              <a
                href="#planes"
                id="nav-ver-planes"
                className="btn-primary hidden sm:inline-flex"
                style={{ padding: "8px 18px", fontSize: 14, borderRadius: 999 }}
              >
                Empezar
              </a>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* ── Hero ──────────────────────────────────────────────── */}
        <HeroSection />

        {/* ── Cómo funciona ─────────────────────────────────────── */}
        <ComoFuncionaSection />

        {/* ── Diferenciadores ───────────────────────────────────── */}
        <DiferenciadoresSection />

        {/* ── Universidades soportadas ──────────────────────────── */}
        <UniversidadesSection />

        {/* ── Garantías + Productos + Planes + CTA premium ──────── */}
        <main>
          <FeaturesSection />
        </main>

        {/* ── FAQs ──────────────────────────────────────────────── */}
        <FAQsSection />

        {/* ── Footer ────────────────────────────────────────────── */}
        <footer className="border-t border-gray-200 dark:border-white/10 px-4 md:px-8 py-10">
          <div className="max-w-[1100px] mx-auto" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 24 }}>
              {/* Brand */}
              <div style={{ maxWidth: 320 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="var(--fg-primary)" strokeWidth="2" />
                    <path d="M8 12h8M12 8v8" stroke="var(--fg-primary)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span style={{ fontWeight: 800, fontSize: 15, color: "var(--fg-primary)" }}>
                    Laboratorio<span style={{ color: "var(--accent)" }}>Académico</span>
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.6, marginBottom: 8 }}>
                  Monografías académicas con IA verificada para estudiantes de Bolivia y Latinoamérica.
                </p>
                <p style={{ fontSize: 12, color: "var(--fg-muted)", fontStyle: "italic" }}>
                  La IA redacta. Tú apruebas. El documento es real.
                </p>
              </div>

              {/* Links */}
              <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg-primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                    Producto
                  </div>
                  <a href="#como-funciona" style={{ fontSize: 13, color: "var(--fg-muted)", textDecoration: "none" }}>Cómo funciona</a>
                  <a href="#diferenciadores" style={{ fontSize: 13, color: "var(--fg-muted)", textDecoration: "none" }}>Diferenciadores</a>
                  <a href="#universidades" style={{ fontSize: 13, color: "var(--fg-muted)", textDecoration: "none" }}>Universidades</a>
                  <a href="#planes" style={{ fontSize: 13, color: "var(--fg-muted)", textDecoration: "none" }}>Precios</a>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg-primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                    Ayuda
                  </div>
                  <a href="/tutorial" style={{ fontSize: 13, color: "var(--fg-muted)", textDecoration: "none" }}>Tutorial</a>
                  <a href="#faqs" style={{ fontSize: 13, color: "var(--fg-muted)", textDecoration: "none" }}>FAQs</a>
                  <a href="/login" style={{ fontSize: 13, color: "var(--fg-muted)", textDecoration: "none" }}>Iniciar sesión</a>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg-primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                    Legal
                  </div>
                  <a href="/terminos" style={{ fontSize: 13, color: "var(--fg-muted)", textDecoration: "none" }}>Términos</a>
                  <a href="/privacidad" style={{ fontSize: 13, color: "var(--fg-muted)", textDecoration: "none" }}>Privacidad</a>
                </div>
              </div>
            </div>

            <div
              style={{
                paddingTop: 18,
                borderTop: "1px solid var(--border)",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>
                Laboratorio Académico © 2026 · Hecho en Bolivia
              </span>
              <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>
                Bs. 150 pago único · Bs. 300 / mes Pro
              </span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
