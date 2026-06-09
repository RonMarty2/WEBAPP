/**
 * Casos bolivianos pre-resueltos del módulo Organización.
 *
 * Los 5 casos cubren a propósito un espectro de tamaños, rubros y
 * complejidades legales para que el estudiante encuentre uno cercano
 * al suyo:
 *   - Básico: cosmética artesanal micro en La Paz (Unipersonal + SENASAG).
 *   - Intermedio: cafetería de 5 empleados en Cochabamba (SRL + planilla
 *     completa con aportes patronales y AFP).
 *   - Intermedio: startup de delivery con 8 empleados en Santa Cruz
 *     (SRL + estructura tecnología y logística).
 *   - Avanzado: fábrica de quesos artesanales familiar en Tarija
 *     (SRL Familiar + plan técnico SENASAG detallado).
 *   - Avanzado: gimnasio franquicia con 12 empleados en Santa Cruz
 *     (SA + branding interno + manuales operativos).
 *
 * Agregar un caso nuevo:
 *   1. Crear el archivo `<slug>.ts` exportando un `CasoOrganizacion`.
 *   2. Importarlo y agregarlo al array `CASOS_ORGANIZACION` de abajo.
 *   3. La galería y la página de detalle lo recogen automáticamente.
 */

import type { CasoOrganizacion } from "../types";
import { casoCosmeticaNaturalLapaz } from "./cosmetica-natural-lapaz";
import { casoCafeteriaRrhhCba } from "./cafeteria-rrhh-cba";
import { casoDeliveryRapidoScz } from "./delivery-rapido-scz";
import { casoQuesosArtesanalesTarija } from "./quesos-artesanales-tarija";
import { casoGimnasioFranquiciaScz } from "./gimnasio-franquicia-scz";

export const CASOS_ORGANIZACION: CasoOrganizacion[] = [
  casoCosmeticaNaturalLapaz,
  casoCafeteriaRrhhCba,
  casoDeliveryRapidoScz,
  casoQuesosArtesanalesTarija,
  casoGimnasioFranquiciaScz,
];

export function buscarCasoOrganizacion(slug: string): CasoOrganizacion | undefined {
  return CASOS_ORGANIZACION.find((c) => c.slug === slug);
}
