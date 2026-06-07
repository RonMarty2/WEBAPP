/** Auth store del módulo Idea — sesión de webapp (patrón compartido). */
import { create } from 'zustand';
import type { PerfilIdea } from '@/types/idea';

export interface WebappUser {
  id: string;
  email: string;
  name?: string;
  role?: 'admin' | 'docente' | 'estudiante';
}

interface AuthState {
  user: WebappUser | null;
  perfil: PerfilIdea | null;
  inicializado: boolean;
  inicializar: () => Promise<void>;
  logout: () => Promise<void>;
}

async function fetchPerfil() {
  try {
    const res = await fetch('/api/idea/perfil', { credentials: 'include' });
    if (!res.ok) return null;
    return (await res.json()) as { user: WebappUser; perfil: PerfilIdea };
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
