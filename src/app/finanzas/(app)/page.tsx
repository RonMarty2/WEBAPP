import SimuladorProBridge from "@/components/finanzas/SimuladorProBridge";

/**
 * Hub del módulo Finanzas. Redirige según el rol del perfil
 * (docente → /finanzas/docente, estudiante → /finanzas/estudiante).
 */
export default function Page() {
  return <SimuladorProBridge seccion="Finanzas" />;
}
