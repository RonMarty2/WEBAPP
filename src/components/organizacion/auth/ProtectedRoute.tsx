'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/organizacion/auth-store';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const inicializar = useAuthStore((s) => s.inicializar);
  const inicializado = useAuthStore((s) => s.inicializado);
  const user = useAuthStore((s) => s.user);
  const perfil = useAuthStore((s) => s.perfil);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { inicializar(); }, [inicializar]);

  useEffect(() => {
    if (inicializado && !user) {
      router.replace(`/login?from=${encodeURIComponent(pathname ?? '/organizacion')}`);
    }
  }, [inicializado, user, pathname, router]);

  if (!inicializado) {
    return <div className="org-muted flex h-screen w-screen items-center justify-center text-sm">Cargando…</div>;
  }
  if (!user) {
    return <div className="org-muted flex h-screen w-screen items-center justify-center text-sm">Redirigiendo al login…</div>;
  }
  if (!perfil) {
    return (
      <div className="flex h-screen w-screen items-center justify-center p-6">
        <div className="org-card max-w-md space-y-3 p-6 text-center">
          <div className="text-3xl">⚙️</div>
          <h2 className="text-base font-semibold">Preparando tu cuenta…</h2>
          <p className="org-muted text-xs">
            Si esto persiste, falta aplicar la migración SQL
            <code className="mx-1 rounded bg-slate-100 px-1 py-0.5 text-[10px]">001_estructura_base.sql</code>
            del módulo Organización en Supabase.
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
