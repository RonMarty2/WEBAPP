'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/organizacion/utils';
import { Building2, GraduationCap, Layers, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/organizacion/auth-store';
import { WidgetMaestro } from '@/components/compartido/WidgetMaestro';

const ENLACES = [
  { href: '/organizacion', label: 'Inicio', icon: Building2 },
  { href: '/organizacion/academia', label: 'Academia', icon: GraduationCap },
  { href: '/organizacion/proyectos', label: 'Mi proyecto', icon: Layers },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  const perfil = useAuthStore((s) => s.perfil);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);

  const enlaces = perfil?.es_admin
    ? [...ENLACES, { href: '/organizacion/admin', label: 'Admin', icon: ShieldCheck }]
    : ENLACES;

  const cerrar = async () => { await logout(); router.replace('/login'); };

  const items = (onClick?: () => void) =>
    enlaces.map(({ href, label, icon: Icon }) => {
      const activo = href === '/organizacion' ? pathname === '/organizacion' : pathname?.startsWith(href);
      return (
        <Link
          key={href}
          href={href}
          onClick={onClick}
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
            activo ? 'org-accent-bg font-medium text-white' : 'org-muted hover:bg-emerald-50'
          )}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span>{label}</span>
        </Link>
      );
    });

  return (
    <div className="flex h-screen w-screen flex-col">
      <header className="org-border flex h-14 flex-shrink-0 items-center justify-between gap-2 border-b bg-white px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <button onClick={() => setMenu(true)} className="-ml-1 rounded-md p-1.5 hover:bg-emerald-50 md:hidden" aria-label="Menú">
            <Menu className="h-5 w-5" />
          </button>
          <div className="org-accent-bg flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-white">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="truncate text-sm font-semibold tracking-tight">Organización</span>
          <span className="org-accent-soft org-accent-text hidden flex-shrink-0 rounded px-2 py-0.5 text-xs font-medium sm:inline">
            Bolivia
          </span>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          <WidgetMaestro />
          {perfil && (
            <div className="hidden text-right text-xs sm:block">
              <div className="font-medium">{perfil.nombre} {perfil.apellido}</div>
              <div className="org-muted capitalize">{perfil.rol}{perfil.es_admin && ' · 🛡️'}</div>
            </div>
          )}
          <button onClick={cerrar} className="org-btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 text-xs">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="org-border hidden w-56 flex-shrink-0 flex-col border-r bg-white/60 p-3 md:flex">
          <nav className="flex flex-col gap-1">{items()}</nav>
        </aside>

        {menu && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMenu(false)} />
            <aside className="org-border absolute left-0 top-0 flex h-full w-64 flex-col border-r bg-white p-3 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">Menú</span>
                <button onClick={() => setMenu(false)} className="rounded-md p-1.5 hover:bg-emerald-50" aria-label="Cerrar">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">{items(() => setMenu(false))}</nav>
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
