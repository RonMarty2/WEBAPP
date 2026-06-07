/**
 * Mapa de FLUJO del estudiante según el tipo de trabajo final.
 *
 * Cada modalidad activa solo los módulos que realmente le aplican, en el
 * orden lógico. Los demás módulos quedan ocultos o marcados como opcionales
 * en la UI.
 *
 * Sirve para dos cosas:
 *   1) Mostrar "Progreso del proyecto" arriba en cada vista de módulo:
 *      "Idea ✓ → Mercados (estás aquí) → Estrategia → ..."
 *   2) Al final de cada módulo, botón "Siguiente paso →" que lleva al
 *      próximo módulo del flujo (o al Generador si es el último).
 *
 * IDs de módulo coinciden con las rutas:
 *   'idea' → /idea
 *   'mercados' → /mercados
 *   'estrategia' → /estrategia
 *   'marketing' → /marketing
 *   'organizacion' → /organizacion
 *   'finanzas' → /finanzas
 *   'defensa' → /defensa
 *   'generador' → /generador (último — consolida todo)
 */

export type ModuloId =
  | 'idea'
  | 'mercados'
  | 'estrategia'
  | 'marketing'
  | 'organizacion'
  | 'finanzas'
  | 'defensa'
  | 'generador';

export interface ModuloInfo {
  id: ModuloId;
  nombre: string;
  emoji: string;
  /** Ruta del hub/listado del módulo. */
  ruta: string;
  /** Color de identidad (Tailwind). */
  color: string;
}

export const MODULOS_META: Record<ModuloId, ModuloInfo> = {
  idea:         { id: 'idea',         nombre: 'Idea / Pre-validación', emoji: '💡', ruta: '/idea/proyectos',         color: 'amber' },
  mercados:     { id: 'mercados',     nombre: 'Mercados',              emoji: '📊', ruta: '/mercados/proyecto',      color: 'sky' },
  estrategia:   { id: 'estrategia',   nombre: 'Estrategia',            emoji: '🎯', ruta: '/estrategia/analisis',    color: 'violet' },
  marketing:    { id: 'marketing',    nombre: 'Marketing',             emoji: '📣', ruta: '/marketing/planes',       color: 'rose' },
  organizacion: { id: 'organizacion', nombre: 'Organización',          emoji: '🏢', ruta: '/organizacion/proyectos', color: 'emerald' },
  finanzas:     { id: 'finanzas',     nombre: 'Finanzas',              emoji: '💰', ruta: '/finanzas',               color: 'slate' },
  defensa:      { id: 'defensa',      nombre: 'Defensa',               emoji: '🎓', ruta: '/defensa/proyectos',      color: 'indigo' },
  generador:    { id: 'generador',    nombre: 'Generador Conectado',   emoji: '✨', ruta: '/generador',              color: 'teal' },
};

/**
 * Flujo recomendado por modalidad. Coincide con los `valor` de MODALIDADES
 * en `src/lib/idea/catalogos.ts`.
 *
 * Si la modalidad del proyecto no está aquí, se devuelve el flujo de
 * "Otra" (todos los módulos disponibles).
 */
const FLUJO_POR_MODALIDAD: Record<string, ModuloId[]> = {
  // Plan de negocio completo: usa todos los módulos.
  'Proyecto de Grado': ['idea', 'mercados', 'estrategia', 'marketing', 'organizacion', 'finanzas', 'defensa', 'generador'],

  // Tesis: investigación científica. NO usa Marketing/Organización/Finanzas/Idea.
  'Tesis': ['mercados', 'estrategia', 'defensa', 'generador'],

  // Monografía: documento académico-analítico breve.
  'Monografía': ['mercados', 'defensa', 'generador'],

  // Trabajo Dirigido: intervención en una organización real.
  'Trabajo Dirigido': ['idea', 'estrategia', 'organizacion', 'defensa', 'generador'],

  // Exploración Investigativa e Intervención (UMSS Posgrado FCE).
  'Exploración Investigativa e Intervención': ['mercados', 'estrategia', 'defensa', 'generador'],

  // Taller de Simulación: informe descriptivo.
  'Taller de Simulación': ['defensa', 'generador'],

  // Examen de Grado: preparación oral.
  'Examen de Grado': ['defensa'],

  // Artículo de investigación: paper.
  'Artículo de investigación': ['mercados', 'estrategia', 'defensa', 'generador'],
};

/** Flujo por defecto cuando no hay modalidad definida o es "Otra". */
const FLUJO_DEFAULT: ModuloId[] = [
  'idea', 'mercados', 'estrategia', 'marketing', 'organizacion', 'finanzas', 'defensa', 'generador',
];

/**
 * Devuelve el orden de módulos del estudiante según su modalidad.
 * Siempre incluye 'generador' al final (es el consolidador).
 */
export function flujoParaModalidad(modalidad: string | null | undefined): ModuloId[] {
  if (!modalidad) return FLUJO_DEFAULT;
  const flujo = FLUJO_POR_MODALIDAD[modalidad];
  return flujo ?? FLUJO_DEFAULT;
}

/**
 * Dado un flujo y el módulo actual, devuelve el siguiente (o null si es el último).
 */
export function siguienteModulo(flujo: ModuloId[], actual: ModuloId): ModuloInfo | null {
  const idx = flujo.indexOf(actual);
  if (idx < 0 || idx === flujo.length - 1) return null;
  return MODULOS_META[flujo[idx + 1]];
}

/**
 * Dado un flujo y el módulo actual, devuelve el anterior (o null si es el primero).
 */
export function anteriorModulo(flujo: ModuloId[], actual: ModuloId): ModuloInfo | null {
  const idx = flujo.indexOf(actual);
  if (idx <= 0) return null;
  return MODULOS_META[flujo[idx - 1]];
}

/**
 * ¿Este módulo aplica al flujo de esta modalidad?
 * Útil para ocultar/atenuar módulos que no corresponden.
 */
export function aplicaModulo(modalidad: string | null | undefined, modulo: ModuloId): boolean {
  return flujoParaModalidad(modalidad).includes(modulo);
}
