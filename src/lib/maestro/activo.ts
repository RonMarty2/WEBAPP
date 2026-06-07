/**
 * Maestro activo del estudiante (cliente): qué Proyecto Maestro está usando
 * ahora mismo, para dar continuidad entre módulos. Se guarda en localStorage.
 * Es solo una preferencia de UI; no reemplaza los vínculos del Generador.
 */

const KEY = 'lab_maestro_activo';

export function getMaestroActivo(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setMaestroActivo(id: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (id) window.localStorage.setItem(KEY, id);
    else window.localStorage.removeItem(KEY);
    // Notifica a otros componentes en la misma pestaña.
    window.dispatchEvent(new CustomEvent('maestro-activo-cambio', { detail: id }));
  } catch {
    /* ignore */
  }
}
