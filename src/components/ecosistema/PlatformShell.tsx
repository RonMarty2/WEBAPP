'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { PlatformMeta } from '@/lib/ecosistema/platforms';
import { EcosystemNav } from './EcosystemNav';

export function PlatformShell({
  platform,
  children,
  sidebar,
}: {
  platform: PlatformMeta;
  children: ReactNode;
  sidebar?: ReactNode;
}) {
  return (
    <>
      <EcosystemNav />
      <div
        className="border-b border-slate-200 px-6 py-4"
        style={{ backgroundColor: `${platform.colorAccent}08` }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Link href="/ecosistema/universidad" className="text-sm text-slate-500 hover:text-slate-900">
            Universidad
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900">{platform.nombre}</span>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-8">
        {sidebar ? (
          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            <aside className="lg:sticky lg:top-20 lg:h-fit">{sidebar}</aside>
            <main>{children}</main>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </div>
    </>
  );
}
