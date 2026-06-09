'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlatformShell } from '@/components/ecosistema/PlatformShell';
import { getPlatform } from '@/lib/ecosistema/platforms';

const SECTIONS = [
  { href: '/ecosistema/universidad/defensa', label: 'Resumen', icono: '📊' },
  { href: '/ecosistema/universidad/defensa/clases', label: 'Clases', icono: '🎓' },
  { href: '/ecosistema/universidad/defensa/casos', label: 'Casos de Bolivia', icono: '🇧🇴' },
  { href: '/ecosistema/universidad/defensa/simulacro', label: 'Simulacro', icono: '🎤' },
];

export default function DefensaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const platform = getPlatform('defensa')!;

  const sidebar = (
    <nav className="space-y-1">
      {SECTIONS.map(s => {
        const active = pathname === s.href;
        return (
          <Link
            key={s.href}
            href={s.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
              active ? 'bg-indigo-100 font-semibold text-indigo-900' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{s.icono}</span>
            <span>{s.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <PlatformShell platform={platform} sidebar={sidebar}>
      {children}
    </PlatformShell>
  );
}
