'use client';

import { useEffect } from 'react';

export function EcosistemaIsolation() {
  useEffect(() => {
    // 1) Inyectar stylesheet con prioridad máxima
    const style = document.createElement('style');
    style.id = 'ecosistema-reset';
    style.textContent = `
      body > canvas.antigravity-particles,
      body > .aura,
      body > .mesh-blob,
      body > footer.w-full,
      body > .pwa-install-prompt,
      body > a[href*="wa.me"],
      body > a[href*="whatsapp"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      html, body {
        background: #f8fafc !important;
      }
    `;
    document.head.appendChild(style);

    // 2) Para elementos que React/JS re-aplica estilos: removerlos del DOM
    const removeAll = () => {
      const toRemove = document.querySelectorAll<HTMLElement>(
        'body > a[href*="wa.me"], body > a[href*="whatsapp"]'
      );
      toRemove.forEach((el) => el.remove());
    };
    removeAll();

    // 3) Observar el body por si React vuelve a montar el botón
    const observer = new MutationObserver(() => removeAll());
    observer.observe(document.body, { childList: true });

    return () => {
      document.getElementById('ecosistema-reset')?.remove();
      observer.disconnect();
    };
  }, []);

  return null;
}
