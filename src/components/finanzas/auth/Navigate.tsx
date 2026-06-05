'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Equivalente al <Navigate to="X" replace /> de react-router-dom para
 * Next.js App Router. Hace router.replace al montar. Renderiza null.
 */
export default function Navigate({ to, replace = true }: { to: string; replace?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [to, replace, router]);
  return null;
}
