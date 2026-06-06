import type { ReactNode } from 'react';
import RootLayout from '@/components/estrategia/layout/RootLayout';
import ProtectedRoute from '@/components/estrategia/auth/ProtectedRoute';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <RootLayout>{children}</RootLayout>
    </ProtectedRoute>
  );
}
