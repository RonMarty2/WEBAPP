import type { ReactNode } from 'react';
import RootLayout from '@/components/generador/layout/RootLayout';
import ProtectedRoute from '@/components/generador/auth/ProtectedRoute';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <RootLayout>{children}</RootLayout>
    </ProtectedRoute>
  );
}
