/**
 * Bloque orientativo de extensión (OLA 1).
 *
 * Inyecta en el userPrompt una nota CORTA y AMABLE que le dice a la IA
 * cuántas páginas debería apuntar para el capítulo actual SEGÚN la
 * universidad del proyecto.
 *
 * Filosofía clave (esto es lo que el usuario pidió):
 *   - NO es una orden ("debes generar exactamente X páginas").
 *   - NO inflar contenido para llegar al máximo.
 *   - NO cortar una idea para no pasarse del mínimo.
 *   - SÍ es una referencia ("apunta a ~X páginas, prioriza calidad").
 *
 * El bloque es de ~200-300 caracteres. Se inyecta al FINAL del userPrompt
 * (justo antes del comando "Genera el contenido"), donde la IA lo ve
 * fresco. No reemplaza ninguna instrucción de los megaprompts existentes.
 */

import { getUniversityLimits, getTargetPagesForPhase, type UniversityLimits } from "./universityLimits";

/**
 * Arma el bloque orientativo para una fase específica.
 * Retorna null si la fase no es de capítulo (ej. ph-resumen, ph-referencias)
 * o si la universidad no requiere orientación adicional.
 */
export function buildOrientacionExtensionBlock(
  universidadId: string | null | undefined,
  phaseId: string,
): string | null {
  const targetCap = getTargetPagesForPhase(universidadId, phaseId);
  if (targetCap === null) return null;

  const limits = getUniversityLimits(universidadId);
  const capLabel = phaseIdToCapLabel(phaseId);

  return [
    "",
    "--- ORIENTACIÓN DE EXTENSIÓN (referencia, NO obligatorio) ---",
    `Universidad del proyecto: ${limits.etiqueta}`,
    `Monografía completa: rango ${limits.min}-${limits.max} págs · meta razonable ~${limits.target} págs`,
    `Para este ${capLabel}: apuntá a aproximadamente ${targetCap} páginas.`,
    "",
    "Reglas de oro (esto es lo que más le importa al estudiante):",
    "  1. NO infles contenido para llegar al máximo. Si el tema se cubre",
    "     en menos páginas con calidad, está perfecto.",
    "  2. NO cortes una idea a mitad para no pasarte del rango. Si una",
    "     sección necesita una página más, dásela.",
    "  3. Prioridad: argumento sólido > extensión cumplida.",
    "  4. Si el reglamento marca un máximo, respetalo COMO REFERENCIA",
    "     (no es delito pasarse 1-2 págs si la calidad lo justifica).",
    "--- FIN ORIENTACIÓN ---",
    "",
  ].join("\n");
}

/**
 * Variante para la fase de resumen ejecutivo.
 * El resumen NO se mide en páginas sino en palabras (250-450 según uni).
 */
export function buildOrientacionResumenBlock(
  universidadId: string | null | undefined,
): string | null {
  // Por ahora todas las universidades bolivianas pidan algo similar
  // (250-450 palabras). Si en el futuro varían, agregar campo
  // `resumenPalabras` en UniversityLimits.
  const limits = getUniversityLimits(universidadId);
  return [
    "",
    "--- ORIENTACIÓN PARA RESUMEN EJECUTIVO ---",
    `Universidad: ${limits.etiqueta}`,
    `Apuntá a 350-450 palabras (1.5 páginas aprox).`,
    `Estructura obligatoria: objetivo + métodos + resultados + conclusión.`,
    `Si el contenido cabe en menos palabras con calidad, mejor.`,
    `Si necesita 50 palabras más para cerrar la idea, está bien.`,
    "--- FIN ORIENTACIÓN ---",
    "",
  ].join("\n");
}

function phaseIdToCapLabel(phaseId: string): string {
  switch (phaseId) {
    case "ph-cap1": return "Capítulo I (Marco Referencial / Planteamiento)";
    case "ph-cap2": return "Capítulo II (Marco Teórico)";
    case "ph-cap3": return "Capítulo III (Diseño Metodológico)";
    case "ph-cap4": return "Capítulo IV (Análisis de Resultados)";
    case "ph-cap5": return "Capítulo V (Conclusiones)";
    default: return "capítulo";
  }
}

/** Export para tests: permite verificar los límites sin tocar el helper de prompt. */
export type { UniversityLimits };
