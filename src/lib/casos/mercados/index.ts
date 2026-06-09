/**
 * Casos bolivianos pre-resueltos del módulo Investigación de Mercados.
 *
 * Cubren los 4 tipos de estudio del syllabus académico:
 *   - Descriptivo cuantitativo (Café Sopocachi, Gimnasio Plan 3000, Delivery Medicamentos).
 *   - Causal (Guardería Cala Cala — escenarios A/B/C/D).
 *   - Exploratorio mixto (Tejidos Copacabana — encuesta + entrevistas profundas).
 *
 * Variedad metodológica intencional:
 *   - Muestreos: estratificado, por conveniencia con cuotas, sistemático.
 *   - Fórmulas: Cochran clásico, Cochran ajustado por N finito, saturación cualitativa.
 *   - n: desde 80 (exploratorio) hasta 384 (descriptivo poblacional).
 */

import type { CasoMercados } from "../types";
import { casoCafeteriaSopocachi } from "./cafeteria-sopocachi";
import { casoGuarderiaCalaCalaCba } from "./guarderia-cala-cala-cba";
import { casoGimnasioPlan3000Scz } from "./gimnasio-plan3000-scz";
import { casoTejidosCopacabana } from "./tejidos-copacabana";
import { casoDeliveryMedicamentosTja } from "./delivery-medicamentos-tarija";

export const CASOS_MERCADOS: CasoMercados[] = [
  casoCafeteriaSopocachi,
  casoGuarderiaCalaCalaCba,
  casoGimnasioPlan3000Scz,
  casoTejidosCopacabana,
  casoDeliveryMedicamentosTja,
];

export function buscarCasoMercados(slug: string): CasoMercados | undefined {
  return CASOS_MERCADOS.find((c) => c.slug === slug);
}
