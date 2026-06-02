'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type Platform = 'android-chrome' | 'ios-safari' | 'desktop' | 'other';

function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'other';
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
  if (isIOS) return 'ios-safari';
  const isAndroid = /Android/.test(ua);
  if (isAndroid) return 'android-chrome';
  const isMobile = /Mobi|Mobile/.test(ua);
  return isMobile ? 'other' : 'desktop';
}

function isAlreadyInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  const standalone = window.matchMedia?.('(display-mode: standalone)')?.matches;
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return Boolean(standalone || iosStandalone);
}

const SESSION_DISMISS_KEY = 'pwa-install-dismissed-session';

export default function PWAInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>('other');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isAlreadyInstalled()) return;

    // Dismissal solo dura la sesión actual del navegador.
    // Cuando el usuario cierre y vuelva a abrir → el banner reaparece.
    if (sessionStorage.getItem(SESSION_DISMISS_KEY) === '1') return;

    const currentPlatform = detectPlatform();
    setPlatform(currentPlatform);

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      window.setTimeout(() => setVisible(true), 1500);
    };

    const handleInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    // iOS no dispara beforeinstallprompt — mostramos las instrucciones manuales.
    if (currentPlatform === 'ios-safari') {
      window.setTimeout(() => setVisible(true), 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setVisible(false);
      }
    } catch {
      // Si el usuario cierra el prompt nativo, dejamos el banner para reintentar.
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(SESSION_DISMISS_KEY, '1');
    } catch {
      // sessionStorage puede estar bloqueado en modo privado — no es crítico.
    }
  };

  if (!visible) return null;

  const canInstallDirectly = platform === 'android-chrome' || platform === 'desktop' || platform === 'other';
  const showIOSInstructions = platform === 'ios-safari';

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Instalar Laboratorio Académico"
      className="pwa-install-prompt"
    >
      <div className="pwa-install-card">
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Cerrar"
          className="pwa-install-close"
        >
          ×
        </button>

        <div className="pwa-install-header">
          <div className="pwa-install-icon" aria-hidden="true">
            {/* Mini matraz inline para evitar dependencias */}
            <svg viewBox="0 0 64 64" width="48" height="48">
              <defs>
                <linearGradient id="pwa-flask" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#fef3c7" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
                <linearGradient id="pwa-liquid" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <rect x="26" y="6" width="12" height="14" rx="2" fill="none" stroke="url(#pwa-flask)" strokeWidth="2.5" />
              <path
                d="M 26 20 L 12 48 Q 10 53 14 53 L 50 53 Q 54 53 52 48 L 38 20 Z"
                fill="none"
                stroke="url(#pwa-flask)"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M 18 38 L 12 48 Q 10 52 14 52 L 50 52 Q 54 52 52 48 L 46 38 Q 32 42 18 38 Z"
                fill="url(#pwa-liquid)"
              />
            </svg>
          </div>
          <div className="pwa-install-text">
            <strong className="pwa-install-title">Instala Laboratorio Académico</strong>
            <span className="pwa-install-subtitle">
              {showIOSInstructions
                ? 'Agrégala a tu pantalla de inicio para usarla como app.'
                : 'Acceso instantáneo, modo app sin barra del navegador y funciona offline.'}
            </span>
          </div>
        </div>

        {showIOSInstructions ? (
          <ol className="pwa-install-steps">
            <li>
              Toca el botón <strong>Compartir</strong>
              <span className="pwa-ios-share" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16V4" />
                  <path d="M8 8l4-4 4 4" />
                  <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
                </svg>
              </span>{' '}
              en la barra de Safari.
            </li>
            <li>
              Elige <strong>“Agregar a pantalla de inicio”</strong>.
            </li>
            <li>
              Confirma con <strong>“Agregar”</strong> y listo.
            </li>
          </ol>
        ) : (
          <div className="pwa-install-actions">
            <button
              type="button"
              onClick={handleInstall}
              disabled={!deferredPrompt || installing}
              className="pwa-install-btn primary"
            >
              {installing ? 'Instalando…' : deferredPrompt ? 'Instalar app' : 'Preparando…'}
            </button>
            <button type="button" onClick={handleDismiss} className="pwa-install-btn secondary">
              Ahora no
            </button>
          </div>
        )}

        {showIOSInstructions && (
          <button type="button" onClick={handleDismiss} className="pwa-install-btn secondary pwa-install-ios-dismiss">
            Entendido
          </button>
        )}
      </div>
    </div>
  );
}
