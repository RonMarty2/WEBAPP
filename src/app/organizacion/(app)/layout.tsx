import type { ReactNode } from 'react';
import RootLayout from '@/components/organizacion/layout/RootLayout';
import ProtectedRoute from '@/components/organizacion/auth/ProtectedRoute';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <RootLayout>{children}</RootLayout>
    </ProtectedRoute>
  );
}
