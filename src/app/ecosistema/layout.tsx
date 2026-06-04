import type { Metadata } from 'next';
import { EcosistemaProvider } from '@/lib/ecosistema/mock-state';
import { EcosistemaIsolation } from '@/components/ecosistema/EcosistemaIsolation';

export const metadata: Metadata = {
  title: 'Laboratorio Académico PRO — Ecosistema',
  description: 'Aprende, construye y consolida tu proyecto con datos reales.',
};

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
    color: #0f172a !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif !important;
  }
  .app-content { z-index: 1 !important; min-height: 100vh; }
`;

export default function EcosistemaLayout({ children }: { children: React.ReactNode }) {
  return (
    <EcosistemaProvider>
      <style dangerouslySetInnerHTML={{ __html: ISOLATION_CSS }} />
      <EcosistemaIsolation />
      <div className="relative z-10 min-h-screen bg-white antialiased">
        {children}
      </div>
    </EcosistemaProvider>
  );
}
