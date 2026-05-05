"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

export default function NucleoFooter() {
  const pathname = usePathname();
  if (pathname?.includes('/workspace')) return null;

  return (
    <footer className="w-full py-6 mt-auto relative z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full 
                      bg-white/5 dark:bg-slate-900/50 backdrop-blur-md 
                      border border-gray-200/20 dark:border-white/5 
                      shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-indigo-500 dark:text-indigo-400">
            [RND ]
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600"></span>
          <span className="text-[11px] font-medium tracking-wide text-gray-500 dark:text-slate-400">
            Una solución de ingeniería académica por el Magíster Ronald Martínez
          </span>
        </div>
      </div>
    </footer>
  );
}
