import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './generador.css';

export const metadata: Metadata = {
  title: 'Generador conectado — Laboratorio Académico PRO',
  description:
    'Une lo que trabajaste en cada módulo en un solo proyecto: la IA consolida tu contexto real, no datos inventados.',
};

const ISOLATION_CSS = `
  body > canvas, body > .aura, body > .mesh-blob, body > footer,
  body > .pwa-install-prompt, body > a[href*="wa.me"], body > a[href*="whatsapp"], body > .pt {
    display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;
  }
  html, body { background: #f5fcfb !important; background-image: none !important; }
  .app-content { z-index: 1 !important; min-height: 100vh; padding: 0 !important; }
`;

export default function GeneradorLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ISOLATION_CSS }} />
      <div className="generador-scope">{children}</div>
    </>
  );
}
