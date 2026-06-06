'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/mercados/auth-store';

/**
 * Rutas autenticadas del módulo Mercados. Usa la sesión de webapp.
 * Si no hay sesión, redirige al /login principal (login único).
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const inicializar = useAuthStore((s) => s.inicializar);
  const inicializado = useAuthStore((s) => s.inicializado);
  const user = useAuthStore((s) => s.user);
  const perfil = useAuthStore((s) => s.perfil);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    inicializar();
  }, [inicializar]);

  useEffect(() => {
    if (inicializado && !user) {
      const desde = encodeURIComponent(pathname ?? '/mercados');
      router.replace(`/login?from=${desde}`);
    }
  }, [inicializado, user, pathname, router]);

  if (!inicializado) {
    return (
      <div className="flex h-screen w-screen items-center justify-center text-sm mk-muted">
        Cargando…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center text-sm mk-muted">
        Redirigiendo al login…
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="flex h-screen w-screen items-center justify-center p-6">
        <div className="mk-card max-w-md space-y-3 p-6 text-center">
          <div className="text-3xl">⚙️</div>
          <h2 className="text-base font-semibold">Preparando tu cuenta…</h2>
          <p className="text-xs mk-muted">
            Si esto persiste, falta aplicar la migración SQL
            <code className="mx-1 rounded bg-slate-100 px-1 py-0.5 text-[10px]">
              001_estructura_base.sql
            </code>
            del módulo Mercados en Supabase.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
