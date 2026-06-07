/** Utilidades comunes del Generador conectado. */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Etiquetas y colores de cada módulo (para la UI del generador). */
export const MODULOS: Array<{ id: string; label: string; emoji: string; ruta: string }> = [
  { id: 'idea', label: 'Idea / Pre-validación', emoji: '💡', ruta: '/idea/proyectos' },
  { id: 'mercados', label: 'Investigación de Mercados', emoji: '📊', ruta: '/mercados/proyecto' },
  { id: 'estrategia', label: 'Estrategia', emoji: '🎯', ruta: '/estrategia/analisis' },
  { id: 'marketing', label: 'Marketing', emoji: '📣', ruta: '/marketing/planes' },
  { id: 'organizacion', label: 'Organización', emoji: '🏢', ruta: '/organizacion/proyectos' },
  { id: 'finanzas', label: 'Finanzas', emoji: '💰', ruta: '/finanzas' },
  { id: 'defensa', label: 'Defensa', emoji: '🎓', ruta: '/defensa/proyectos' },
];
