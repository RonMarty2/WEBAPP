'use client';

import { useEffect } from 'react';

export default function PWAServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    // OTA solo en producción: en dev el service worker estorba al HMR.
    if (process.env.NODE_ENV !== 'production') return;

    // Recarga UNA sola vez cuando el SW nuevo toma el control (evita loops).
    let recargando = false;
    const onControllerChange = () => {
      if (recargando) return;
      recargando = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    // Si hay un SW en espera y ya hay uno controlando la página, pídele que
    // se active de inmediato. En la primera instalación no hay controller,
    // así que no dispara recarga.
    const promptUpdate = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting && navigator.serviceWorker.controller) {
        reg.waiting.postMessage('SKIP_WAITING');
      }
    };

    let registration: ServiceWorkerRegistration | null = null;
    let updateFoundHandler: (() => void) | null = null;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });
        registration = reg;

        // Busca una versión nueva apenas se abre la app.
        reg.update().catch(() => {});

        // Si ya había una versión esperando, actívala.
        promptUpdate(reg);

        // Cuando llegue un SW nuevo, actívalo en cuanto quede "installed".
        updateFoundHandler = () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              promptUpdate(reg);
            }
          });
        };
        reg.addEventListener('updatefound', updateFoundHandler);
      } catch {
        // Si falla el registro, la app sigue funcionando como web normal.
      }
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      if (registration && updateFoundHandler) {
        registration.removeEventListener('updatefound', updateFoundHandler);
      }
      window.removeEventListener('load', register);
    };
  }, []);

  return null;
}
