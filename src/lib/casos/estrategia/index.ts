/**
 * Casos bolivianos pre-resueltos del módulo Estrategia.
 *
 * Los 5 casos cubren un espectro de rubros, ciudades y herramientas
 * estratégicas para que el estudiante encuentre uno cercano al suyo:
 *   - Avanzado: agroindustria/exportación a UE (Ansoff desarrollo mercado).
 *   - Intermedio: textil B2B pivote post-Shein (BCG cartera).
 *   - Intermedio: retail vinos premium (BCG + decisión modelo comercial).
 *   - Intermedio: restaurante expansión multi-local (Ansoff penetracion+desarrollo).
 *   - Avanzado: turismo aventura para extranjeros (PEYEA cuadrante agresivo).
 *
 * Variedad de herramientas estratégicas a propósito:
 *   - PESTEL: las 6 categorías en cada caso con factores específicos bolivianos.
 *   - Porter: las 5 fuerzas con intensidad y justificación contextualizada.
 *   - MPC: 4-6 FCE con peso y notas vs 2-3 competidores nombrados.
 *   - FODA + FODA cruzado: 4-6 ítems por cuadrante + estrategias FO/DO/FA/DA.
 *   - Matriz Nivel 3: BCG (2 casos), Ansoff (2 casos), PEYEA (1 caso).
 *   - MCPE: 3 estrategias evaluadas con 5-8 factores ponderados.
 *
 * Agregar un caso nuevo:
 *   1. Crear el archivo `<slug>.ts` exportando un `CasoEstrategia`.
 *   2. Importarlo y agregarlo al array `CASOS_ESTRATEGIA` de abajo.
 *   3. La galería y la página de detalle lo recogen automáticamente.
 */

import type { CasoEstrategia } from "../types";
import { casoQuinuaExportElalto } from "./quinua-export-elalto";
import { casoTextilLacanchaCba } from "./textil-lacancha-cba";
import { casoLicoreriaVinosTarijenosScz } from "./licoreria-vinos-tarijenos-scz";
import { casoPolleriaExpansionElalto } from "./polleria-expansion-elalto";
import { casoHostalAventuraCoroico } from "./hostal-aventura-coroico";

export const CASOS_ESTRATEGIA: CasoEstrategia[] = [
  casoQuinuaExportElalto,
  casoTextilLacanchaCba,
  casoLicoreriaVinosTarijenosScz,
  casoPolleriaExpansionElalto,
  casoHostalAventuraCoroico,
];

export function buscarCasoEstrategia(slug: string): CasoEstrategia | undefined {
  return CASOS_ESTRATEGIA.find((c) => c.slug === slug);
}
