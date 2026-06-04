import type { Metadata } from 'next';
import { EcosistemaProvider } from '@/lib/ecosistema/mock-state';
import { EcosistemaIsolation } from '@/components/ecosistema/EcosistemaIsolation';

export const metadata: Metadata = {
  title: 'Laboratorio Académico PRO — Ecosistema',
  description: 'Aprende, construye y consolida tu proyecto con datos reales.',
};

export default function EcosistemaLayout({ children }: { children: React.ReactNode }) {
  return (
    <EcosistemaProvider>
      <EcosistemaIsolation />
      <div className="relative z-10 min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 antialiased">
        {children}
      </div>
    </EcosistemaProvider>
  );
}
