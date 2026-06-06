import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './finanzas.css';

export const metadata: Metadata = {
  title: 'Simulador de Proyectos de Inversión — Bolivia',
  description:
    'Plataforma educativa para construir y simular proyectos de inversión bolivianos. Constructor de 9 pasos + simulación turno-a-turno con eventos económicos reales.',
};

/**
 * Layout root del módulo /finanzas (simuladorPRO migrado).
 *
 * Aplica el scope CSS `finanzas-scope` que activa los tokens shadcn neutral
 * SOLO dentro del módulo. El resto de webapp no se ve afectada.
 *
 * Aísla del root layout de webapp (auras, ParticleSphere, etc.) vía CSS SSR.
 */

const ISOLATION_CSS = `
  body > canvas,
  body > .aura,
  body > .mesh-blob,
  body > footer,
  body > .pwa-install-prompt,
  body > a[href*="wa.me"],
  body > a[href*="whatsapp"],
  body > .pt {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
  html, body {
    background: #ffffff !important;
    background-image: none !important;
  }
  .app-content { z-index: 1 !important; min-height: 100vh; padding: 0 !important; }
`;

export default function FinanzasLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ISOLATION_CSS }} />
      <div className="finanzas-scope">{children}</div>
    </>
  );
}
