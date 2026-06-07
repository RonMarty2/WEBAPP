import type { ReactNode } from 'react';
import RootLayout from '@/components/marketing/layout/RootLayout';
import ProtectedRoute from '@/components/marketing/auth/ProtectedRoute';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <RootLayout>{children}</RootLayout>
    </ProtectedRoute>
  );
}
