import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './organizacion.css';

export const metadata: Metadata = {
  title: 'Organización — Laboratorio Académico PRO',
  description:
    'Construye la estructura de tu empresa: organigrama, RRHH (aportes patronales bolivianos), legal (NIT, Fundempresa, AFP), técnico y branding.',
};

const ISOLATION_CSS = `
  body > canvas, body > .aura, body > .mesh-blob, body > footer,
  body > .pwa-install-prompt, body > a[href*="wa.me"], body > a[href*="whatsapp"], body > .pt {
    display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;
  }
  html, body { background: #f6fbf8 !important; background-image: none !important; }
  .app-content { z-index: 1 !important; min-height: 100vh; padding: 0 !important; }
`;

export default function OrganizacionLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ISOLATION_CSS }} />
      <div className="organizacion-scope">{children}</div>
    </>
  );
}
