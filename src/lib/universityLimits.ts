/**
 * Límites de extensión por universidad (OLA 1).
 *
 * Cada universidad de Bolivia tiene su propio reglamento de monografía
 * con rangos distintos de páginas totales. Esta tabla centraliza esos
 * rangos para que la IA los respete SIN inflar contenido para llegar
 * al máximo NI cortar ideas para no pasarse del mínimo.
 *
 * Filosofía OLA 1:
 *   - "target" es la meta razonable (no obligatoria).
 *   - "min" y "max" son referencias del reglamento, no camisa de fuerza.
 *   - El prompt orientativo le dice a la IA:
 *       "Apunta a ~{target} páginas. NO infles. NO cortes una idea
 *        para no pasarte. Prioriza calidad sobre extensión."
 *
 * Modo de uso:
 *   import { getUniversityLimits } from "@/lib/universityLimits";
 *   const limits = getUniversityLimits(proyecto.universidad_id);
 *   // → { min: 50, max: 70, target: 60, etiqueta: "UMSS-Posgrado", ... }
 */

export interface UniversityLimits {
  /** ID de la universidad (igual al usado en la base de datos). */
  id: string;
  /** Nombre corto para mostrar en prompts ("UMSS Posgrado", "UCB", ...). */
  etiqueta: string;
  /** Páginas mínimas según reglamento (referencia, no obligatorio). */
  min: number;
  /** Páginas máximas según reglamento (referencia, no obligatorio). */
  max: number;
  /** Meta razonable. La IA apunta aquí. */
  target: number;
  /** Distribución sugerida por capítulo (% del target). Suma ≈ 100. */
  distribucionCaps: {
    cap1: number;  // Marco Referencial / Planteamiento
    cap2: number;  // Marco Teórico
    cap3: number;  // Diseño Metodológico
    cap4: number;  // Análisis de Resultados
    cap5: number;  // Conclusiones
  };
}

/**
 * Tabla maestra de límites por universidad.
 *
 * Fuentes (relevamiento manual basado en reglamentos publicados y
 * trabajos de referencia de cada institución):
 *   - UMSS Posgrado: 50-70 págs (Reglamento de Diplomados FCE)
 *   - UCB: 40-60 págs (Reglamento de Trabajos de Grado)
 *   - UNIFRANZ: 35-55 págs (Manual de Estilo Académico)
 *   - UPB: 40-60 págs
 *   - default: 40-60 (rango conservador para universidades no mapeadas)
 *
 * Si una universidad nueva entra al sistema, agregar aquí ANTES de que
 * el estudiante genere su primer capítulo. Sin entrada, se usa "default".
 */
const TABLA_UNIVERSIDADES: Record<string, UniversityLimits> = {
  "umss-001": {
    id: "umss-001",
    etiqueta: "UMSS Posgrado (Diplomado FCE)",
    min: 50,
    max: 70,
    target: 60,
    distribucionCaps: { cap1: 18, cap2: 25, cap3: 20, cap4: 27, cap5: 10 },
  },
  "umss-pregrado-001": {
    id: "umss-pregrado-001",
    etiqueta: "UMSS Pregrado",
    min: 35,
    max: 50,
    target: 42,
    distribucionCaps: { cap1: 18, cap2: 27, cap3: 20, cap4: 25, cap5: 10 },
  },
  "ucb-001": {
    id: "ucb-001",
    etiqueta: "UCB (Universidad Católica Boliviana)",
    min: 40,
    max: 60,
    target: 50,
    distribucionCaps: { cap1: 17, cap2: 28, cap3: 20, cap4: 25, cap5: 10 },
  },
  "unifranz-001": {
    id: "unifranz-001",
    etiqueta: "UNIFRANZ",
    min: 35,
    max: 55,
    target: 45,
    distribucionCaps: { cap1: 17, cap2: 27, cap3: 20, cap4: 26, cap5: 10 },
  },
  "upb-001": {
    id: "upb-001",
    etiqueta: "UPB (Universidad Privada Boliviana)",
    min: 40,
    max: 60,
    target: 50,
    distribucionCaps: { cap1: 17, cap2: 27, cap3: 20, cap4: 26, cap5: 10 },
  },
};

const DEFAULT_LIMITS: UniversityLimits = {
  id: "default",
  etiqueta: "Universidad genérica",
  min: 40,
  max: 60,
  target: 50,
  distribucionCaps: { cap1: 17, cap2: 27, cap3: 20, cap4: 26, cap5: 10 },
};

/**
 * Devuelve los límites de extensión para una universidad.
 * Si la universidad no está mapeada, retorna DEFAULT_LIMITS (rango conservador).
 */
export function getUniversityLimits(universidadId: string | null | undefined): UniversityLimits {
  if (!universidadId) return DEFAULT_LIMITS;
  return TABLA_UNIVERSIDADES[universidadId] ?? DEFAULT_LIMITS;
}

/**
 * Devuelve la meta de páginas para UN capítulo específico.
 *
 * Ejemplo: si UMSS tiene target=60 y cap2 tiene distribución 25%,
 * el target del Cap II será 15 páginas.
 *
 * @param phaseId — uno de "ph-cap1", "ph-cap2", "ph-cap3", "ph-cap4", "ph-cap5"
 */
export function getTargetPagesForPhase(
  universidadId: string | null | undefined,
  phaseId: string,
): number | null {
  const limits = getUniversityLimits(universidadId);
  const capKey = phaseIdToCapKey(phaseId);
  if (!capKey) return null;
  const pct = limits.distribucionCaps[capKey] / 100;
  return Math.round(limits.target * pct);
}

/** Mapea "ph-cap1" → "cap1", "ph-cap2" → "cap2", etc. */
function phaseIdToCapKey(phaseId: string): keyof UniversityLimits["distribucionCaps"] | null {
  switch (phaseId) {
    case "ph-cap1": return "cap1";
    case "ph-cap2": return "cap2";
    case "ph-cap3": return "cap3";
    case "ph-cap4": return "cap4";
    case "ph-cap5": return "cap5";
    default: return null;
  }
}

/** Para tests y debugging: lista todas las universidades soportadas. */
export function getAllUniversitiesWithLimits(): UniversityLimits[] {
  return Object.values(TABLA_UNIVERSIDADES);
}
