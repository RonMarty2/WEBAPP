import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './estrategia.css';

export const metadata: Metadata = {
  title: 'Estrategia Empresarial — Laboratorio Académico PRO',
  description:
    'Construye tu análisis estratégico: PESTEL, 5 Fuerzas de Porter, matrices MEFE/MEFI y FODA cruzada, con scoring guiado.',
};

const ISOLATION_CSS = `
  body > canvas, body > .aura, body > .mesh-blob, body > footer,
  body > .pwa-install-prompt, body > a[href*="wa.me"], body > a[href*="whatsapp"], body > .pt {
    display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;
  }
  html, body { background: #fbfaff !important; background-image: none !important; }
  .app-content { z-index: 1 !important; min-height: 100vh; padding: 0 !important; }
`;

export default function EstrategiaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ISOLATION_CSS }} />
      <div className="estrategia-scope">{children}</div>
    </>
  );
}
