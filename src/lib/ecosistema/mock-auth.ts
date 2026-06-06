import { ESTUDIANTE_DEMO, EMPRENDEDOR_DEMO, type MockUser } from './mock-data';

const STORAGE_KEY = 'ecosistema-mock-user';

export function loginMock(perfil: 'estudiante' | 'emprendedor' = 'estudiante'): MockUser {
  const user = perfil === 'estudiante' ? ESTUDIANTE_DEMO : EMPRENDEDOR_DEMO;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
  return user;
}

export function logoutMock(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function getCurrentUser(): MockUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MockUser;
  } catch {
    return null;
  }
}
