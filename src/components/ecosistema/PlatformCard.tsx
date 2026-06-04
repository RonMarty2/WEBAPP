'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { PlatformMeta } from '@/lib/ecosistema/platforms';

export function PlatformCard({ platform, index }: { platform: PlatformMeta; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Link
        href={platform.ruta}
        className="group block h-full rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
        style={{ boxShadow: `0 1px 0 ${platform.colorAccent}10` }}
      >
        <div
          className="mb-4 grid h-12 w-12 place-items-center rounded-xl text-2xl"
          style={{ backgroundColor: `${platform.colorAccent}15`, color: platform.colorAccent }}
        >
          {platform.icono === 'TrendingUp' && '📈'}
          {platform.icono === 'Compass' && '🧭'}
          {platform.icono === 'Target' && '🎯'}
          {platform.icono === 'Megaphone' && '📣'}
          {platform.icono === 'FileText' && '📄'}
        </div>
        <h3 className="mb-1 text-lg font-semibold text-slate-900">{platform.nombre}</h3>
        <p className="mb-3 text-sm font-medium" style={{ color: platform.colorAccent }}>
          {platform.tagline}
        </p>
        <p className="text-sm leading-relaxed text-slate-600">{platform.descripcionCorta}</p>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
          <span className="font-semibold text-slate-900">Bs. {platform.precioStandalone}/mes</span>
          <span className="text-slate-500 group-hover:text-slate-900">Conocer plataforma →</span>
        </div>
      </Link>
    </motion.div>
  );
}
