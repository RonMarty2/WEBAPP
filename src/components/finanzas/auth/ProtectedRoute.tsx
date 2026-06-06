'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/finanzas/auth-store';

/**
 * Wrapper de rutas autenticadas del módulo Finanzas.
 *
 * Usa la sesión de webapp (cookie lab_session). Si no hay sesión, redirige
 * al login principal /login. Una vez logueado en webapp, el estudiante
 * accede a /finanzas/* sin segundos logins.
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

  // Si no hay sesión de webapp, mandar a /login.
  useEffect(() => {
    if (inicializado && !user) {
      const desde = encodeURIComponent(pathname ?? '/finanzas');
      router.replace(`/login?from=${desde}`);
    }
  }, [inicializado, user, pathname, router]);

  if (!inicializado) {
    return (
      <div className="flex h-screen w-screen items-center justify-center text-sm text-muted-foreground">
        Cargando sesión…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center text-sm text-muted-foreground">
        Redirigiendo al login…
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-6">
        <div className="max-w-md space-y-3 rounded-lg border border-border bg-card p-6 text-center shadow-sm">
          <div className="text-3xl">⚙️</div>
          <h2 className="text-base font-semibold text-foreground">
            Preparando tu cuenta del simulador…
          </h2>
          <p className="text-xs text-muted-foreground">
            Si esta pantalla persiste, falta aplicar la migración SQL
            <code className="mx-1 rounded bg-secondary px-1 py-0.5 text-[10px]">024_desacoplar_de_supabase_auth.sql</code>
            en el Supabase de webapp.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
