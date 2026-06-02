/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MOTOR UNIFRANZ — Proyecto de Grado (Pre-Factibilidad)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Punto de entrada único para el motor de prompts UNIFRANZ del Proyecto de
 * Grado. Re-exporta el resolver y las constantes públicas.
 *
 * Uso desde la API de generación:
 *
 *   import { getPromptUnifranzPG } from "@/lib/prompts/proyectoGrado/universidad/unifranz";
 *
 *   const prompt = getPromptUnifranzPG("marco-teorico");
 *   const respuesta = await llamarIA(prompt, contextoDelProyecto);
 *
 * Fuente de verdad: public/guias-unifranz/unifranz-cba-guia-2017.pdf
 * Última verificación contra guía oficial: 2026-06-02
 * ═══════════════════════════════════════════════════════════════════════════
 */

export {
  getPromptUnifranzPG,
  FASES_UNIFRANZ_PG_EN_ORDEN,
  type FaseUnifranzPG,
  type ModalidadUnifranzPG,
} from "./resolver";

export { REGLAS_COMUNES_UNIFRANZ, buildPromptUnifranz } from "./00-reglas-comunes";
