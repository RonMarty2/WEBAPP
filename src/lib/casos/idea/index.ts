/**
 * Casos bolivianos pre-resueltos del módulo Idea & Pre-validación.
 *
 * Los 5 casos cubren a propósito un espectro de rubros, ciudades y
 * dificultades para que el estudiante encuentre uno cercano al suyo:
 *   - Básico: alimentación B2C en La Paz (Sopocachi).
 *   - Intermedio: alimentación con pivot en Cochabamba.
 *   - Intermedio: nicho médico premium en Santa Cruz.
 *   - Avanzado: B2B con manufactura bajo demanda en El Alto.
 *   - Intermedio: EdTech low-cost en Tarija.
 *
 * Agregar un caso nuevo:
 *   1. Crear el archivo `<slug>.ts` exportando un `CasoIdea`.
 *   2. Importarlo y agregarlo al array `CASOS_IDEA` de abajo.
 *   3. La galería y la página de detalle lo recogen automáticamente.
 */

import type { CasoIdea } from "../types";
import { casoAlmuerzosSopocachi } from "./almuerzos-sopocachi";
import { casoMananerasExpressCba } from "./mananeras-express-cba";
import { casoDulceSinCulpaScz } from "./dulce-sin-culpa-scz";
import { casoImprime3dAndesElAlto } from "./imprime3d-andes-elalto";
import { casoRefuerzaTutoriasTja } from "./refuerza-tutorias-tja";

export const CASOS_IDEA: CasoIdea[] = [
  casoAlmuerzosSopocachi,
  casoMananerasExpressCba,
  casoDulceSinCulpaScz,
  casoImprime3dAndesElAlto,
  casoRefuerzaTutoriasTja,
];

export function buscarCasoIdea(slug: string): CasoIdea | undefined {
  return CASOS_IDEA.find((c) => c.slug === slug);
}
