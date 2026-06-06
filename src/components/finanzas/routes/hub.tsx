'use client';

import Navigate from "@/components/finanzas/auth/Navigate";
import { useAuthStore } from "@/stores/finanzas/auth-store";

export default function Hub() {
  const perfil = useAuthStore((s) => s.perfil);
  if (!perfil) return null;
  return (
    <Navigate
      to={perfil.rol === "docente" ? "/finanzas/docente" : "/finanzas/estudiante"}
      replace
    />
  );
}
