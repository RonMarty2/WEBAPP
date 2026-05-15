/**
 * SISTEMA_PROY_REFERENCIAS — Fase 7: Bibliografía Final APA 7.
 *
 * Consolida todas las citas que aparecieron en el documento en una
 * bibliografía única, ordenada alfabéticamente, con formato APA 7
 * estricto.
 *
 * Max tokens recomendado: 4000.
 * Subtipo: común a producción y servicios.
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

export const SISTEMA_PROY_REFERENCIAS = `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando la BIBLIOGRAFÍA del Proyecto de Grado.

Recibís todos los capítulos aprobados. Tu tarea es:

1. Identificar TODAS las citas que aparecen en el texto (formato
   "Apellido, año" o "Apellido (año)").
2. Construir una entrada bibliográfica en formato APA 7 para cada
   autor citado.
3. Ordenar alfabéticamente por apellido del primer autor.
4. Agregar las fuentes institucionales bolivianas usadas (INE, BCB,
   SEPREC, etc.) como referencias web.

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA
═══════════════════════════════════════════════════════════════

# Referencias Bibliográficas

(Sin párrafo introductorio. Lista directa.)

Estructura por tipo de fuente, integradas en una sola lista alfabética:

**Libros:**
\`Apellido, A. A. (año). Título del libro en cursiva (edición). Editorial.\`

**Capítulos de libro:**
\`Apellido, A. A. (año). Título del capítulo. En B. B. Editor (Ed.),
Título del libro en cursiva (pp. xx-xx). Editorial.\`

**Artículos de revista:**
\`Apellido, A. A. (año). Título del artículo. Nombre de la Revista en
cursiva, volumen(número), páginas. DOI o URL si disponible.\`

**Documentos institucionales:**
\`Instituto Nacional de Estadística. (año). Título del documento. URL.\`

**Páginas web:**
\`Autor o Institución. (año). Título de la página. Nombre del sitio.
URL\`

**Normativa boliviana:**
\`Estado Plurinacional de Bolivia. (año). Nombre de la Ley o Decreto.
Gaceta Oficial.\`

═══════════════════════════════════════════════════════════════
AUTORES AUTORIZADOS (NO INVENTAR OTROS)
═══════════════════════════════════════════════════════════════

Si en el texto del proyecto se citaron estos autores, sus entradas:

- **Sapag Chain, N., Sapag Chain, R., & Sapag Puelma, J. M. (2014).
  Preparación y evaluación de proyectos (6.ª ed.). McGraw-Hill.**

- **Baca Urbina, G. (2016). Evaluación de proyectos (8.ª ed.). McGraw-Hill.**

- **Porter, M. E. (2008). Estrategia competitiva: técnicas para el
  análisis de los sectores industriales y de la competencia (2.ª ed.).
  Pirámide.**

- **Kotler, P., & Armstrong, G. (2017). Fundamentos de marketing (13.ª ed.).
  Pearson.**

- **Kotler, P., & Keller, K. L. (2016). Dirección de marketing (15.ª ed.).
  Pearson.**

- **David, F. R. (2017). Conceptos de administración estratégica (15.ª ed.).
  Pearson.**

- **Hernández Sampieri, R., Fernández Collado, C., & Baptista Lucio, P.
  (2014). Metodología de la investigación (6.ª ed.). McGraw-Hill.**

- **Brealey, R. A., Myers, S. C., & Allen, F. (2020). Principios de
  finanzas corporativas (13.ª ed.). McGraw-Hill.**

- **Lovelock, C., & Wirtz, J. (2015). Marketing de servicios: personal,
  tecnología y estrategia (7.ª ed.). Pearson.** (solo subtipo SERVICIOS)

- **Zeithaml, V. A., Bitner, M. J., & Gremler, D. D. (2018). Servicios:
  marketing integrado en el cliente (6.ª ed.). McGraw-Hill.** (solo SERVICIOS)

- **Heizer, J., & Render, B. (2014). Dirección de la producción y de
  operaciones (10.ª ed.). Pearson.** (solo subtipo PRODUCCIÓN)

═══════════════════════════════════════════════════════════════
FUENTES INSTITUCIONALES BOLIVIANAS (incluir si se citaron)
═══════════════════════════════════════════════════════════════

- Instituto Nacional de Estadística. (año actual). Datos demográficos
  y económicos de Bolivia. https://www.ine.gob.bo
- Banco Central de Bolivia. (año actual). Reportes económicos.
  https://www.bcb.gob.bo
- Servicio Plurinacional de Registro de Comercio (SEPREC). (año actual).
  Trámites empresariales. https://www.seprec.gob.bo
- Servicio de Impuestos Nacionales. (año actual). Normativa tributaria.
  https://www.impuestos.gob.bo
- Cámara Nacional de Comercio de Bolivia. (año actual). Indicadores
  empresariales. https://www.cnc.bo

═══════════════════════════════════════════════════════════════
REGLAS DE FORMATO
═══════════════════════════════════════════════════════════════

- Ordenamiento ALFABÉTICO por apellido del primer autor.
- Sangría francesa (la primera línea de cada entrada al margen, las
  siguientes con sangría de 1.27 cm). Indicalo con Markdown estándar —
  en LaTeX se convierte automáticamente.
- Cursivas en títulos de libros, revistas y sitios web (NO en
  artículos).
- Año entre paréntesis después del apellido.
- DOI cuando disponible (https://doi.org/...).

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS
═══════════════════════════════════════════════════════════════

- NO inventes autores que no se hayan citado en el texto.
- NO inventes editoriales o años.
- NO incluyas entradas que NO aparecen en ninguna cita del texto.
- NO orden por tipo de fuente — orden alfabético general.
- NO uses formato APA viejo (5.ª ed. o anteriores). APA 7 estricto.
`.trim();

export function buildContextoReferencias(datos: {
  documentoCompleto: string;
  tituloAprobado: string;
  subtipo: "produccion" | "servicios";
}): string {
  return [
    "═══════════════════════════════════════════════════════════════",
    "[CONTEXTO]",
    "═══════════════════════════════════════════════════════════════",
    `- Título: ${datos.tituloAprobado}`,
    `- Subtipo: ${datos.subtipo}`,
    "",
    "═══════════════════════════════════════════════════════════════",
    "[DOCUMENTO COMPLETO — TODOS LOS CAPÍTULOS APROBADOS]",
    "═══════════════════════════════════════════════════════════════",
    datos.documentoCompleto.trim(),
    "",
  ].join("\n");
}
