import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AXIOM - Simulador de examenes UMSS",
  description: "Simulador de examenes universitarios con IA para preparacion academica.",
};

export default function AxiomLayout({ children }: { children: ReactNode }) {
  const axiomStyles = `
    .axiom-shell {
      --primary: rgb(139, 92, 246);
      --primary-light: rgb(168, 126, 255);
      --primary-dark: rgb(109, 40, 217);
      --success: #10b981;
      --success-light: #d1fae5;
      --error: #ef4444;
      --error-light: #fee2e2;
      --warning: #f59e0b;
      --warning-light: #fef3c7;
      --neutral-50: #f9fafb;
      --neutral-100: #f3f4f6;
      --neutral-200: #e5e7eb;
      --neutral-300: #d1d5db;
      --neutral-400: #9ca3af;
      --neutral-500: #6b7280;
      --neutral-600: #4b5563;
      --neutral-700: #374151;
      --neutral-800: #1f2937;
      --neutral-900: #111827;
      min-height: 100vh;
      width: 100%;
      max-width: none;
      display: block;
      position: relative;
      z-index: 1;
      overflow-x: clip;
      color: var(--neutral-900);
      color-scheme: light;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      line-height: 1.6;
      background: transparent;
    }

    .axiom-shell *,
    .axiom-shell *::before,
    .axiom-shell *::after {
      box-sizing: border-box;
    }

    .axiom-page {
      width: 100%;
      max-width: 100%;
      margin: 0;
      overflow-x: clip;
    }

    .axiom-container {
      width: 100%;
      max-width: 1280px;
      margin-left: auto;
      margin-right: auto;
      padding-left: 24px;
      padding-right: 24px;
    }

    .axiom-hero-center {
      width: 100%;
      max-width: 980px;
      margin-left: auto;
      margin-right: auto;
      padding-left: 24px;
      padding-right: 24px;
    }

    @media (max-width: 640px) {
      .axiom-container,
      .axiom-hero-center {
        padding-left: 16px;
        padding-right: 16px;
      }
    }

    .axiom-section-title {
      max-width: 760px;
      margin-left: auto;
      margin-right: auto;
      text-align: center;
    }

    .axiom-pill {
      min-height: 48px;
      min-width: 176px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 0 28px;
      font-size: 15px;
      font-weight: 800;
      line-height: 1;
      white-space: nowrap;
    }

    .axiom-shell input,
    .axiom-shell textarea,
    .axiom-shell select {
      font-family: inherit;
      border: 1px solid var(--neutral-300);
      border-radius: 0.375rem;
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }

    .axiom-shell input:focus,
    .axiom-shell textarea:focus,
    .axiom-shell select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }

    .axiom-shell button {
      font-family: inherit;
    }
  `;

  return (
    <section className="axiom-shell">
      <style dangerouslySetInnerHTML={{ __html: axiomStyles }} />
      {children}
    </section>
  );
}
