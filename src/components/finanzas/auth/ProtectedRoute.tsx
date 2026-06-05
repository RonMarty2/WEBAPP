'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/finanzas/auth-store';

/**
 * Wrapper de rutas protegidas para el módulo Finanzas.
 *
 * En Next.js App Router NO existe un patrón "ruta padre con Outlet"
 * como en React Router. Toma children y los muestra solo si hay
 * sesión Y perfil cargado.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const inicializar = useAuthStore((s) => s.inicializar);
  const inicializado = useAuthStore((s) => s.inicializado);
  const user = useAuthStore((s) => s.user);
  const perfil = useAuthStore((s) => s.perfil);
  const logout = useAuthStore((s) => s.logout);
  const recargarPerfil = useAuthStore((s) => s.recargarPerfil);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    inicializar();
  }, [inicializar]);

  // Auto-retry: si tenemos user pero no perfil, reintentar cada 4s.
  useEffect(() => {
    if (inicializado && user && !perfil) {
      const id = setInterval(() => {
        recargarPerfil();
      }, 4000);
      return () => clearInterval(id);
    }
  }, [inicializado, user, perfil, recargarPerfil]);

  // Redirigir a login si no hay sesión.
  useEffect(() => {
    const rutasPublicas = ['/finanzas/login', '/finanzas/registro'];
    if (inicializado && !user && pathname && !rutasPublicas.includes(pathname)) {
      router.replace('/finanzas/login');
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
        <div className="max-w-md space-y-4 rounded-lg border border-border bg-card p-6 text-center shadow-sm">
          <div className="text-3xl">🤔</div>
          <h2 className="text-base font-semibold text-foreground">
            No pudimos cargar tu perfil
          </h2>
          <p className="text-xs text-muted-foreground">
            La sesión está activa ({user.email}) pero la query a la base de datos no
            devolvió tu perfil. Suele ser un problema temporal de conexión.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={async () => {
                await recargarPerfil();
                window.location.reload();
              }}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              🔄 Reintentar carga del perfil
            </button>
            <button
              onClick={async () => {
                await logout().catch(() => {});
                try {
                  localStorage.clear();
                  sessionStorage.clear();
                  if (window.indexedDB?.databases) {
                    const dbs = await window.indexedDB.databases();
                    for (const db of dbs) {
                      if (db.name) indexedDB.deleteDatabase(db.name);
                    }
                  }
                } catch {}
                router.replace('/finanzas/login');
                setTimeout(() => window.location.reload(), 200);
              }}
              className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-secondary"
            >
              🚪 Cerrar sesión y volver a entrar (limpieza total)
            </button>
          </div>

          <details className="pt-2 text-left">
            <summary className="cursor-pointer text-[10px] text-muted-foreground">
              Ver detalles técnicos
            </summary>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Si el reintento no funciona, podría faltar la migración SQL en
              Supabase, o las tablas <code>perfiles/cursos/inscripciones</code> no existen.
            </p>
          </details>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
