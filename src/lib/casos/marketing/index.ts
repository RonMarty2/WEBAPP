/**
 * Casos bolivianos pre-resueltos del módulo Marketing (plan de marketing).
 *
 * Los 5 casos cubren a propósito un espectro de rubros, ciudades y
 * presupuestos para que el estudiante encuentre uno cercano al suyo:
 *   - Intermedio: servicio EdTech 7P con presupuesto medio (Cba, Bs 4.500/mes).
 *   - Intermedio: servicio salud animal 7P premium (SCZ, Bs 6.000/mes).
 *   - Avanzado: FMCG marca con identidad cultural (LP, Bs 8.000/mes).
 *   - Básico: e-commerce 4P low-budget intensivo en orgánico (Sucre, Bs 1.800/mes).
 *   - Básico: micro-presupuesto barrial 4P hiperlocal (El Alto, Bs 1.500/mes).
 *
 * Agregar un caso nuevo:
 *   1. Crear el archivo `<slug>.ts` exportando un `CasoMarketing`.
 *   2. Importarlo y agregarlo al array `CASOS_MARKETING` de abajo.
 *   3. La galería y la página de detalle lo recogen automáticamente.
 */

import type { CasoMarketing } from "../types";
import { casoAcademiaInglesOnlineCba } from "./academia-ingles-online-cba";
import { casoVeterinariaBoutiqueEquipetrol } from "./veterinaria-boutique-equipetrol";
import { casoCervezaArtesanalLaPaz } from "./cerveza-artesanal-lapaz";
import { casoRopaSegundaManoSucre } from "./ropa-segunda-mano-sucre";
import { casoEmpanadasElAlto } from "./empanadas-elalto-bs1500";

export const CASOS_MARKETING: CasoMarketing[] = [
  casoAcademiaInglesOnlineCba,
  casoVeterinariaBoutiqueEquipetrol,
  casoCervezaArtesanalLaPaz,
  casoRopaSegundaManoSucre,
  casoEmpanadasElAlto,
];

export function buscarCasoMarketing(slug: string): CasoMarketing | undefined {
  return CASOS_MARKETING.find((c) => c.slug === slug);
}
