import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './marketing.css';

export const metadata: Metadata = {
  title: 'Marketing — Laboratorio Académico PRO',
  description:
    'Construye tu plan de marketing: buyer persona, mezcla 4Ps/7Ps, presupuesto y CPL por canal, y calendario editorial, con ejemplos bolivianos.',
};

const ISOLATION_CSS = `
  body > canvas, body > .aura, body > .mesh-blob, body > footer,
  body > .pwa-install-prompt, body > a[href*="wa.me"], body > a[href*="whatsapp"], body > .pt {
    display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;
  }
  html, body { background: #fff8f9 !important; background-image: none !important; }
  .app-content { z-index: 1 !important; min-height: 100vh; padding: 0 !important; }
`;

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ISOLATION_CSS }} />
      <div className="marketing-scope">{children}</div>
    </>
  );
}
