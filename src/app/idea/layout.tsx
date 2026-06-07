import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './idea.css';

export const metadata: Metadata = {
  title: 'Idea & Pre-validación — Laboratorio Académico PRO',
  description:
    'Valida tu idea de negocio antes de construirla: Lean Canvas, propuesta de valor, hipótesis y scorecard de viabilidad.',
};

const ISOLATION_CSS = `
  body > canvas, body > .aura, body > .mesh-blob, body > footer,
  body > .pwa-install-prompt, body > a[href*="wa.me"], body > a[href*="whatsapp"], body > .pt {
    display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;
  }
  html, body { background: #fffdf7 !important; background-image: none !important; }
  .app-content { z-index: 1 !important; min-height: 100vh; padding: 0 !important; }
`;

export default function IdeaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ISOLATION_CSS }} />
      <div className="idea-scope">{children}</div>
    </>
  );
}
