/**
 * SISTEMA_PROY_DEFENSA — Fase 9: Banco de Preguntas para Defensa.
 *
 * Reutiliza la lógica del banco de preguntas de monografía. Genera
 * preguntas que el tribunal podría hacer en la defensa oral del
 * proyecto, organizadas por capítulo, con respuestas sugeridas.
 *
 * Las preguntas se generan en BACKGROUND tras aprobar cada capítulo
 * sustantivo (cap0, cap1, cap2, cap3a-3f, cap4a-4g). Esta fase final
 * solo CONSOLIDA y permite descargar el banco en PDF.
 *
 * Max tokens recomendado: 2500 (por llamada de generación de preguntas).
 *
 * IMPLEMENTACIÓN: reutiliza el prompt y el endpoint de monografía,
 * adaptados al contexto de proyecto de factibilidad (no investigación
 * académica pura).
 */

import { SISTEMA_BANCO_PREGUNTAS_FASE } from "@/lib/prompts/scribe/banco-preguntas";

/**
 * Prompt reutilizado del banco de preguntas de monografía. La lógica
 * (bloque conocimiento + bloque autoría, formato JSON estricto,
 * 6-10 preguntas por capítulo) aplica idéntico para proyectos de grado.
 *
 * Lo que cambia entre monografía y proyecto de grado es el TIPO de
 * preguntas que harán los tribunales:
 *   - Monografía: preguntas teóricas sobre el marco conceptual.
 *   - Proyecto de Grado: preguntas técnicas sobre VAN/TIR/WACC,
 *     decisiones de mercado, defensa de cifras de inversión.
 *
 * El prompt de monografía es lo suficientemente genérico para que la
 * IA adapte el tipo de preguntas al contenido del capítulo recibido.
 */
export const SISTEMA_PROY_DEFENSA = SISTEMA_BANCO_PREGUNTAS_FASE;

/**
 * Esta fase no genera contenido propio — solo consolida las preguntas
 * generadas previamente. No necesita builder de contexto adicional.
 *
 * El componente <BancoPreguntasView> (reutilizado de monografía) lee
 * phase_contents[`${faseId}_preguntas`] de TODAS las fases sustantivas
 * del proyecto de grado y arma el banco final.
 */
