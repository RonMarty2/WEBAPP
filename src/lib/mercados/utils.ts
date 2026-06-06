/**
 * Utilidades comunes del módulo Mercados.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea un entero con separador de miles boliviano. */
export function formatNumero(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return Math.round(n).toLocaleString('es-BO');
}

/** Formatea un porcentaje (recibe decimal: 0.95 → "95%"). */
export function formatPorcentaje(d: number, decimales = 0): string {
  if (!Number.isFinite(d)) return '—';
  return `${(d * 100).toFixed(decimales)}%`;
}
