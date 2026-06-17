import {
  evaluarFinanzasConSimuladorPro,
  type SimuladorProFinanzasResult,
} from "@/lib/finanzas/simuladorProClient";

/**
 * Runtime helpers de Proyecto de Grado.
 *
 * Regla de consolidacion:
 * - WEBAPP no calcula indicadores financieros.
 * - Toda evaluacion financiera se delega a simuladorPRO.
 * - Este archivo solo conserva helpers de orquestacion y validacion de flujo.
 */

export async function evaluarFinanzasProyectoGrado(params: {
  proyectoFinanciero: unknown;
  incluirSensibilidad?: boolean;
}): Promise<SimuladorProFinanzasResult> {
  return evaluarFinanzasConSimuladorPro({
    proyecto: params.proyectoFinanciero,
    incluirSensibilidad: params.incluirSensibilidad ?? true,
  });
}

/**
 * Valida que las fases sustantivas tienen contenido aprobado antes de
 * permitir el avance a las fases finales (resumen, conclusiones, latex).
 */
export function validarFasesAprobadas(
  phaseContents: Record<string, string | null | undefined>,
  fasesRequeridas: readonly string[]
): { ok: boolean; faltantes: string[] } {
  const faltantes: string[] = [];
  for (const fid of fasesRequeridas) {
    const contenido = phaseContents[fid];
    if (!contenido || contenido.trim().length < 200) {
      faltantes.push(fid);
    }
  }
  return { ok: faltantes.length === 0, faltantes };
}

/** Listado canonico de fases sustantivas (no resumen ni cierres). */
export const FASES_SUSTANTIVAS = [
  "ph-proy-cap0",
  "ph-proy-cap1",
  "ph-proy-cap2",
  "ph-proy-cap3a",
  "ph-proy-cap3b",
  "ph-proy-cap3c",
  "ph-proy-cap3d",
  "ph-proy-cap3e",
  "ph-proy-cap3f",
  "ph-proy-cap4a",
  "ph-proy-cap4abis",
  "ph-proy-cap4b",
  "ph-proy-cap4c",
  "ph-proy-cap4d",
  "ph-proy-cap4e",
  "ph-proy-cap4f",
  "ph-proy-cap4g",
] as const;
