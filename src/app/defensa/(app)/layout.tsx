import type { ReactNode } from 'react';
import RootLayout from '@/components/defensa/layout/RootLayout';
import ProtectedRoute from '@/components/defensa/auth/ProtectedRoute';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <RootLayout>{children}</RootLayout>
    </ProtectedRoute>
  );
}
