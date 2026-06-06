/**
 * Auth store del módulo Mercados — conectado a la sesión de webapp.
 * Mismo patrón que el de Finanzas: lee /api/mercados/perfil que valida el
 * JWT de webapp y crea/sincroniza el perfil automáticamente.
 */
import { create } from 'zustand';
import type { PerfilMercados } from '@/types/mercados';

export interface WebappUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  role?: 'admin' | 'docente' | 'estudiante';
}

interface AuthState {
  user: WebappUser | null;
  perfil: PerfilMercados | null;
  inicializado: boolean;
  inicializar: () => Promise<void>;
  logout: () => Promise<void>;
  recargarPerfil: () => Promise<void>;
}

async function fetchPerfil(): Promise<{ user: WebappUser; perfil: PerfilMercados } | null> {
  try {
    const res = await fetch('/api/mercados/perfil', { credentials: 'include' });
    if (!res.ok) return null;
    return await res.json();
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
    set({
      user: data?.user ?? null,
      perfil: data?.perfil ?? null,
      inicializado: true,
    });
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      /* ignore */
    }
    set({ user: null, perfil: null });
  },

  recargarPerfil: async () => {
    const data = await fetchPerfil();
    set({ user: data?.user ?? null, perfil: data?.perfil ?? null });
  },
}));
