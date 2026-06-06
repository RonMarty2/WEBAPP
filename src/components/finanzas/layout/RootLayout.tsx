'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/finanzas/utils';
import {
  BookOpenCheck,
  GraduationCap,
  Hammer,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  PlayCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/finanzas/auth-store';
import CreditoAutor from '@/components/finanzas/layout/CreditoAutor';
import BadgeRevisionesNuevas from '@/components/finanzas/layout/BadgeRevisionesNuevas';
import BotonInstalarApp from '@/components/finanzas/layout/BotonInstalarApp';
import { useEsDispositivoMobil } from '@/hooks/finanzas/useEsDispositivoMobil';

const enlacesEstudiante = [
  { href: '/finanzas/estudiante', label: 'Mi panel', icon: LayoutDashboard },
  { href: '/finanzas/simular', label: 'Simular', icon: PlayCircle },
  { href: '/finanzas/mis-entregas', label: 'Mis entregas', icon: BookOpenCheck },
  { href: '/finanzas/ejemplos', label: 'Ejemplos', icon: BookOpen },
  { href: '/finanzas/evaluacion', label: 'Evaluación', icon: BookOpenCheck },
];

const enlacesDocente = [
  { href: '/finanzas/docente', label: 'Panel docente', icon: GraduationCap },
  { href: '/finanzas/construir', label: 'Construir proyecto', icon: Hammer },
  { href: '/finanzas/ejemplos', label: 'Ejemplos', icon: BookOpen },
  { href: '/finanzas/eventos', label: 'Catálogo eventos', icon: Newspaper },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  const perfil = useAuthStore((s) => s.perfil);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const esMobil = useEsDispositivoMobil();

  const enlacesBase = perfil?.rol === 'docente' ? enlacesDocente : enlacesEstudiante;
  const enlaces = perfil?.es_admin
    ? [...enlacesBase, { href: '/finanzas/admin', label: 'Admin', icon: ShieldCheck }]
    : enlacesBase;

  const cerrar = async () => {
    await logout();
    router.replace('/login');
  };

  const navItems = (onClick?: () => void) =>
    enlaces.map(({ href, label, icon: Icon }) => {
      const isActive = pathname === href || pathname?.startsWith(href + '/');
      return (
        <Link
          key={href}
          href={href}
          onClick={onClick}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span>{label}</span>
        </Link>
      );
    });

  return (
    <div className="flex h-screen w-screen flex-col bg-background text-foreground">
      <header className="flex h-14 items-center justify-between gap-2 border-b border-border px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={() => setMenuAbierto(true)}
            className={cn(
              '-ml-1 rounded-md p-1.5 text-foreground hover:bg-accent',
              esMobil ? '' : 'md:hidden'
            )}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="h-6 w-6 flex-shrink-0 rounded bg-primary" />
          <span className="truncate text-sm font-semibold tracking-tight">
            Simulador de Proyectos de Inversión
          </span>
          <span className="hidden flex-shrink-0 rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground sm:inline">
            Bolivia
          </span>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
          <BadgeRevisionesNuevas />
          {perfil && (
            <button
              onClick={() => router.push('/finanzas/perfil')}
              className="hidden rounded-md px-2 py-1 text-right text-xs transition hover:bg-accent sm:block"
              title="Editar mi perfil"
            >
              <div className="font-medium text-foreground">
                {perfil.nombre} {perfil.apellido}
              </div>
              <div className="capitalize text-muted-foreground">
                {perfil.rol}
                {perfil.es_admin && ' · 🛡️'}
              </div>
            </button>
          )}
          <button
            onClick={cerrar}
            className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-foreground transition hover:bg-accent"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {!esMobil && (
          <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-secondary/30 p-3 md:flex">
            <nav className="flex flex-col gap-1">{navItems()}</nav>
            <div className="mt-auto pt-4">
              <CreditoAutor variante="sutil" />
            </div>
          </aside>
        )}

        {menuAbierto && (
          <div className={cn('fixed inset-0 z-50', esMobil ? '' : 'md:hidden')}>
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMenuAbierto(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-border bg-background p-3 shadow-xl">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">Menú</span>
                <button
                  onClick={() => setMenuAbierto(false)}
                  className="rounded-md p-1.5 hover:bg-accent"
                  aria-label="Cerrar menú"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {navItems(() => setMenuAbierto(false))}
                {perfil && (
                  <button
                    onClick={() => {
                      setMenuAbierto(false);
                      router.push('/finanzas/perfil');
                    }}
                    className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground/80 hover:bg-accent"
                  >
                    <span className="h-4 w-4 flex-shrink-0 text-center">👤</span>
                    <span>Mi perfil</span>
                  </button>
                )}
              </nav>
              <div className="mt-auto pt-4">
                <CreditoAutor variante="sutil" />
              </div>
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-auto p-3 sm:p-6">{children}</main>
      </div>

      <BotonInstalarApp />
    </div>
  );
}
