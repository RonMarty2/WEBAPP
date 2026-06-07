/**
 * Helper de auto-onboarding de perfil para todos los módulos del laboratorio.
 *
 * Cuando un usuario entra por primera vez a una clase, herramienta o crea su
 * primer proyecto en un módulo (idea/defensa/organizacion/marketing/estrategia/
 * mercados), su perfil del módulo se crea automáticamente desde su sesión de
 * webapp. NO se le pide nada.
 *
 * Crítico: el INSERT debe respetar `es_admin` y `rol` para super-admins, sino
 * un super-admin que entre primero a una clase queda degradado a estudiante
 * hasta que vuelva a `/api/<modulo>/perfil`.
 */

import { isAdmin } from '@/lib/auth';

interface UserMinimo {
  id: string;
  email: string;
  name?: string;
  role?: 'admin' | 'docente' | 'estudiante';
}

/** Filas mínimas (defaults seguros) para INSERT del perfil. NO sobrescribe filas existentes. */
export function filaPerfilParaUpsert(user: UserMinimo) {
  const nombreCompleto = (user.name ?? user.email.split('@')[0]).trim();
  const partes = nombreCompleto.split(/\s+/);
  const esSuperAdmin = isAdmin(user.email);
  const rol: 'docente' | 'estudiante' =
    esSuperAdmin || user.role === 'docente' || user.role === 'admin' ? 'docente' : 'estudiante';
  const es_admin = esSuperAdmin || user.role === 'admin';

  return {
    id: user.id,
    nombre: partes[0] ?? 'Usuario',
    apellido: partes.slice(1).join(' ') || '—',
    email: user.email,
    rol,
    es_admin,
  };
}

/** Upsert idempotente del perfil. onConflict por id — preserva campos existentes. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function asegurarPerfilModulo(sb: any, tabla: string, user: UserMinimo) {
  await sb.from(tabla).upsert(filaPerfilParaUpsert(user), { onConflict: 'id', ignoreDuplicates: true });
}
