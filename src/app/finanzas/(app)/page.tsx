import RouteContent from '@/components/finanzas/routes/hub';

/**
 * Hub del módulo Finanzas. Redirige según el rol del perfil
 * (docente → /finanzas/docente, estudiante → /finanzas/estudiante).
 */
export default function Page() {
  return <RouteContent />;
}
