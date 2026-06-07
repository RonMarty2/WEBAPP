import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './defensa.css';

export const metadata: Metadata = {
  title: 'Defensa — Laboratorio Académico PRO',
  description:
    'Prepárate para defender tu tesis o proyecto: banco de preguntas por categoría y simulacro con evaluación de la IA.',
};

const ISOLATION_CSS = `
  body > canvas, body > .aura, body > .mesh-blob, body > footer,
  body > .pwa-install-prompt, body > a[href*="wa.me"], body > a[href*="whatsapp"], body > .pt {
    display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;
  }
  html, body { background: #fafaff !important; background-image: none !important; }
  .app-content { z-index: 1 !important; min-height: 100vh; padding: 0 !important; }
`;

export default function DefensaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ISOLATION_CSS }} />
      <div className="defensa-scope">{children}</div>
    </>
  );
}
