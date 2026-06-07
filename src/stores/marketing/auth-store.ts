/** Auth store del módulo Marketing — sesión de webapp (patrón Mercados/Estrategia). */
import { create } from 'zustand';
import type { PerfilMarketing } from '@/types/marketing';

export interface WebappUser {
  id: string;
  email: string;
  name?: string;
  role?: 'admin' | 'docente' | 'estudiante';
}

interface AuthState {
  user: WebappUser | null;
  perfil: PerfilMarketing | null;
  inicializado: boolean;
  inicializar: () => Promise<void>;
  logout: () => Promise<void>;
}

async function fetchPerfil() {
  try {
    const res = await fetch('/api/marketing/perfil', { credentials: 'include' });
    if (!res.ok) return null;
    return (await res.json()) as { user: WebappUser; perfil: PerfilMarketing };
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  perfil: null,
  inicializado: false,
  inicializar: async () => {
    if (get().inicializado) return;
    const data = await fetchPerfil();
    set({ user: data?.user ?? null, perfil: data?.perfil ?? null, inicializado: true });
  },
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      /* ignore */
    }
    set({ user: null, perfil: null });
  },
}));
