/** Auth store del Generador conectado — usa la sesión de webapp (/api/auth/me). */
import { create } from 'zustand';

export interface WebappUser {
  id: string;
  email: string;
  name?: string;
  role?: 'admin' | 'docente' | 'estudiante';
}

interface AuthState {
  user: WebappUser | null;
  inicializado: boolean;
  inicializar: () => Promise<void>;
  logout: () => Promise<void>;
}

async function fetchUser() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) return null;
    const d = await res.json();
    return (d?.user ?? null) as WebappUser | null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  inicializado: false,
  inicializar: async () => {
    if (get().inicializado) return;
    const user = await fetchUser();
    set({ user, inicializado: true });
  },
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      /* ignore */
    }
    set({ user: null });
  },
}));
