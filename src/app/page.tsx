"use client";

import { useState } from "react";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ThemeToggle from "@/components/ThemeToggle";
import { Button, IconButton } from "@/components/ui";

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2.5 select-none group" aria-label="Laboratorio Académico">
      <span
        aria-hidden="true"
        className="relative inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-[0_4px_14px_rgba(99,102,241,0.35)] transition-transform group-hover:scale-105"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path d="M5 4v6.5a5 5 0 0 0 10 0V4" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 16h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <span className="font-semibold text-[15px] tracking-tight text-[var(--fg-primary)]">
        Laboratorio
        <span className="text-[var(--accent)]">Académico</span>
      </span>
    </a>
  );
}

const NAV_LINKS = [
  { href: "#productos", label: "Productos" },
  { href: "#planes", label: "Precios" },
  { href: "/tutorial", label: "Tutorial" },
];

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="ag-shell relative min-h-screen overflow-x-hidden">
      <div className="relative z-[1] overflow-x-hidden">

        {/* ── Navbar ──────────────────────────────────────── */}
        <header className="navbar w-full">
          <div className="w-full max-w-[1300px] mx-auto px-6 md:px-8 flex items-center h-16 gap-6">
            {/* Logo */}
            <div className="flex-1 flex items-center">
              <Logo />
            </div>

            {/* Nav links — desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3.5 py-2 rounded-full text-[13.5px] font-medium text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex-1 flex items-center justify-end gap-2">
              <a
                href="/login"
                id="nav-login"
                className="hidden sm:inline-flex items-center px-4 h-9 rounded-full text-[13.5px] font-medium text-[var(--fg-secondary)] border border-[var(--border)] hover:border-[var(--border-hover)] hover:text-[var(--fg-primary)] hover:bg-white/50 dark:hover:bg-white/5 transition-all"
              >
                Acceder
              </a>
              <a
                href="#planes"
                id="nav-ver-planes"
                className="hidden sm:inline-flex"
              >
                <Button variant="primary" size="sm">Ver planes</Button>
              </a>
              <ThemeToggle />
              <IconButton
                className="md:hidden"
                variant="ghost"
                size="md"
                label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
                icon={mobileOpen ? <CloseIcon /> : <MenuIcon />}
                onClick={() => setMobileOpen(v => !v)}
              />
            </div>
          </div>

          {/* Mobile menu drawer */}
          {mobileOpen && (
            <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-base)]/95 backdrop-blur-xl">
              <nav className="flex flex-col px-6 py-4 gap-1">
                {NAV_LINKS.map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-3 rounded-lg text-[14px] font-medium text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-[var(--border)]">
                  <a href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" size="md" fullWidth>Acceder</Button>
                  </a>
                  <a href="#planes" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" size="md" fullWidth>Ver planes</Button>
                  </a>
                </div>
              </nav>
            </div>
          )}
        </header>

        {/* ── Hero ──────────────────────────────────────── */}
        <HeroSection />

        {/* ── Features + Pricing + CTA ──────────────────── */}
        <main>
          <FeaturesSection />
        </main>

        {/* ── Footer ────────────────────────────────────── */}
        <footer className="border-t border-[var(--border)] px-6 md:px-8 py-8">
          <div className="max-w-[1300px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-[13px] text-[var(--fg-muted)]">
              Laboratorio Académico © 2026
            </span>
            <nav className="flex flex-wrap justify-center gap-5">
              <a href="#productos" className="text-[13px] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors">Productos</a>
              <a href="/tutorial" className="text-[13px] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors">Tutorial</a>
              <a href="/terminos" className="text-[13px] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors">Términos</a>
              <a href="/privacidad" className="text-[13px] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors">Privacidad</a>
            </nav>
          </div>
        </footer>

      </div>
    </div>
  );
}
