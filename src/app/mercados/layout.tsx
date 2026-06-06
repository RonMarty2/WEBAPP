import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './mercados.css';

export const metadata: Metadata = {
  title: 'Investigación de Mercados — Laboratorio Académico PRO',
  description:
    'Diseña tu investigación, calcula la muestra, arma encuestas, recolecta respuestas reales y analiza la demanda. Con datos abiertos de Bolivia.',
};

/**
 * Layout root del módulo /mercados. Aísla del root layout de webapp
 * (auras, ParticleSphere, footer, etc.) vía CSS SSR y aplica el scope
 * de identidad propia .mercados-scope.
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
  html, body { background: #f8fbff !important; background-image: none !important; }
  .app-content { z-index: 1 !important; min-height: 100vh; padding: 0 !important; }
`;

export default function MercadosLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ISOLATION_CSS }} />
      <div className="mercados-scope">{children}</div>
    </>
  );
}
