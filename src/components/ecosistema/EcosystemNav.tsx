'use client';

import Link from 'next/link';
import { useEcosistema } from '@/lib/ecosistema/mock-state';

export function EcosystemNav() {
  const { user } = useEcosistema();
  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/ecosistema" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="text-xl">🧪</span>
          <span>Laboratorio Académico PRO</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/ecosistema/universidad" className="hover:text-slate-900">Universidad</Link>
          <Link href="/ecosistema/generador" className="hover:text-slate-900">Generador</Link>
          {user ? (
            <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {user.nombre.charAt(0)}
              </span>
              <span className="text-slate-700">{user.nombre.split(' ')[0]}</span>
            </div>
          ) : (
            <Link
              href="/ecosistema/login"
              className="rounded-full bg-slate-900 px-4 py-1.5 text-white hover:bg-slate-800"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
