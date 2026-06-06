/**
 * Auth store del módulo Finanzas — conectado a la sesión de webapp.
 *
 * NO usa Supabase Auth. Lee la sesión JWT propia de webapp vía
 * /api/finanzas/perfil, que también crea el perfil de finanzas_perfiles
 * automáticamente para usuarios nuevos.
 *
 * Mantiene la misma forma de API (inicializar/logout/recargarPerfil)
 * que el auth-store original del simuladorPRO, para que los componentes
 * existentes no necesiten cambios.
 */
import { create } from 'zustand';
import type { Perfil } from '@/types/finanzas/usuario';

export interface WebappUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  role?: 'admin' | 'docente' | 'estudiante';
  plan?: string;
  active?: boolean;
  // Compat con componentes que esperan estos campos de Supabase Auth.
  // Quedan vacíos pero presentes para no romper imports.
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

interface AuthState {
  user: WebappUser | null;
  // session: dummy field para compat con código que la lee
  session: { user: WebappUser } | null;
  perfil: Perfil | null;
  cargando: boolean;
  inicializado: boolean;
  inicializar: () => Promise<void>;
  logout: () => Promise<void>;
  recargarPerfil: () => Promise<void>;
}

async function fetchPerfil(): Promise<{ user: WebappUser; perfil: Perfil } | null> {
  try {
    const res = await fetch('/api/finanzas/perfil', { credentials: 'include' });
    if (res.status === 401) return null;
    if (!res.ok) {
      console.error('[finanzas/auth] /api/finanzas/perfil error', res.status);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error('[finanzas/auth] fetch perfil error', e);
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  perfil: null,
  cargando: false,
  inicializado: false,

  inicializar: async () => {
    if (get().inicializado) return;
    set({ cargando: true });

    const data = await fetchPerfil();
    if (data) {
      set({
        user: data.user,
        session: { user: data.user },
        perfil: data.perfil,
        cargando: false,
        inicializado: true,
      });
    } else {
      set({
        user: null,
        session: null,
        perfil: null,
        cargando: false,
        inicializado: true,
      });
    }
  },

  logout: async () => {
    set({ cargando: true });
    try {
      // Logout de webapp — invalida la cookie lab_session
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Ignoramos errores de red; seguimos limpiando estado local
    }
    set({ user: null, session: null, perfil: null, cargando: false });
  },

  recargarPerfil: async () => {
    const data = await fetchPerfil();
    if (data) {
      set({ user: data.user, session: { user: data.user }, perfil: data.perfil });
    } else {
      set({ user: null, session: null, perfil: null });
    }
  },
}));
