'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/generador/auth-store';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const inicializar = useAuthStore((s) => s.inicializar);
  const inicializado = useAuthStore((s) => s.inicializado);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { inicializar(); }, [inicializar]);

  useEffect(() => {
    if (inicializado && !user) {
      router.replace(`/login?from=${encodeURIComponent(pathname ?? '/generador')}`);
    }
  }, [inicializado, user, pathname, router]);

  if (!inicializado) {
    return <div className="gen-muted flex h-screen w-screen items-center justify-center text-sm">Cargando…</div>;
  }
  if (!user) {
    return <div className="gen-muted flex h-screen w-screen items-center justify-center text-sm">Redirigiendo al login…</div>;
  }
  return <>{children}</>;
}
