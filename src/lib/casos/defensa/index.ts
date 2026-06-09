/**
 * Casos bolivianos pre-resueltos del módulo Defensa.
 *
 * Los 5 casos cubren a propósito un espectro de carreras, universidades,
 * modalidades y niveles de exigencia para que el estudiante encuentre el
 * caso más cercano al suyo:
 *   - Básico: proyecto de grado de Ingeniería Comercial (UMSS, Cochabamba).
 *   - Avanzado: tesis de Contaduría Pública en auditoría (UMSA, La Paz).
 *   - Intermedio: proyecto de grado de Administración en universidad
 *     privada (UPB, Cochabamba).
 *   - Intermedio: tesis de Ciencias de la Educación con diseño cuasi
 *     experimental (UAJMS, Tarija).
 *   - Avanzado: tesis de Ingeniería Industrial con simulación Arena
 *     (Univalle, Cochabamba).
 *
 * Agregar un caso nuevo:
 *   1. Crear el archivo `<slug>.ts` exportando un `CasoDefensa`.
 *   2. Importarlo y agregarlo al array `CASOS_DEFENSA` de abajo.
 *   3. La galería y la página de detalle lo recogen automáticamente.
 */

import type { CasoDefensa } from "../types";
import { casoDefensaCafeteriaUMSS } from "./defensa-cafeteria-umss";
import { casoDefensaAuditoriaUMSA } from "./defensa-auditoria-umsa";
import { casoDefensaPlanNegocioUPB } from "./defensa-plannegocio-upb";
import { casoDefensaTesisEducacionUAJMS } from "./defensa-tesis-educacion-uajms";
import { casoDefensaTesisIndustrialUnivalle } from "./defensa-tesis-industrial-univalle";

export const CASOS_DEFENSA: CasoDefensa[] = [
  casoDefensaCafeteriaUMSS,
  casoDefensaAuditoriaUMSA,
  casoDefensaPlanNegocioUPB,
  casoDefensaTesisEducacionUAJMS,
  casoDefensaTesisIndustrialUnivalle,
];

export function buscarCasoDefensa(slug: string): CasoDefensa | undefined {
  return CASOS_DEFENSA.find((c) => c.slug === slug);
}
