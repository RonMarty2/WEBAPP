import type { ReactNode } from 'react';
import RootLayout from '@/components/mercados/layout/RootLayout';
import ProtectedRoute from '@/components/mercados/auth/ProtectedRoute';

/**
 * Layout de las rutas autenticadas del módulo Mercados.
 * Header + sidebar propios (RootLayout) y sesión obligatoria (ProtectedRoute).
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <RootLayout>{children}</RootLayout>
    </ProtectedRoute>
  );
}
