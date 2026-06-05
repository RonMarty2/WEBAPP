import type { ReactNode } from 'react';
import RootLayout from '@/components/finanzas/layout/RootLayout';
import ProtectedRoute from '@/components/finanzas/auth/ProtectedRoute';

/**
 * Layout de las rutas autenticadas del módulo Finanzas.
 *
 * Renderiza el header + sidebar del simuladorPRO (RootLayout) y exige
 * sesión válida (ProtectedRoute). Login y registro están FUERA de este
 * grupo (en src/app/finanzas/login y /registro) para que se vean sin chrome.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <RootLayout>{children}</RootLayout>
    </ProtectedRoute>
  );
}
