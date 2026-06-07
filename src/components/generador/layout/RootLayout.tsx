'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/generador/auth-store';

export default function RootLayout({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const cerrar = async () => { await logout(); router.replace('/login'); };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="gen-border flex h-14 flex-shrink-0 items-center justify-between gap-2 border-b bg-white px-4 sm:px-6">
        <Link href="/generador" className="flex min-w-0 items-center gap-2.5">
          <div className="gen-accent-bg flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="truncate text-sm font-semibold tracking-tight">Generador conectado</span>
          <span className="gen-accent-soft gen-accent-text hidden flex-shrink-0 rounded px-2 py-0.5 text-xs font-medium sm:inline">
            Beta
          </span>
        </Link>
        <div className="flex flex-shrink-0 items-center gap-3">
          {user && <span className="gen-muted hidden text-xs sm:inline">{user.name ?? user.email}</span>}
          <button onClick={cerrar} className="gen-btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 text-xs">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
