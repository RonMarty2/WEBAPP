import type { ReactNode } from 'react';
import RootLayout from '@/components/idea/layout/RootLayout';
import ProtectedRoute from '@/components/idea/auth/ProtectedRoute';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <RootLayout>{children}</RootLayout>
    </ProtectedRoute>
  );
}
