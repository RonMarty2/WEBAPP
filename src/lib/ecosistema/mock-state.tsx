'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getCurrentUser } from './mock-auth';
import { ARTEFACTOS_DEMO, PROGRESO_DEMO, type MockUser, type MockArtefacto, type MockProgreso } from './mock-data';

interface EcosistemaState {
  user: MockUser | null;
  artefactos: MockArtefacto[];
  progreso: MockProgreso[];
  refrescarUsuario: () => void;
}

const EcosistemaContext = createContext<EcosistemaState | null>(null);

export function EcosistemaProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const refrescarUsuario = () => setUser(getCurrentUser());

  return (
    <EcosistemaContext.Provider
      value={{
        user,
        artefactos: ARTEFACTOS_DEMO,
        progreso: PROGRESO_DEMO,
        refrescarUsuario,
      }}
    >
      {children}
    </EcosistemaContext.Provider>
  );
}

export function useEcosistema(): EcosistemaState {
  const ctx = useContext(EcosistemaContext);
  if (!ctx) throw new Error('useEcosistema debe usarse dentro de EcosistemaProvider');
  return ctx;
}
