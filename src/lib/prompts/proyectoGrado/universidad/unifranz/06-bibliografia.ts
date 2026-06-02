/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BIBLIOGRAFÍA — UNIFRANZ Proyecto de Grado
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Guía UNIFRANZ 2017, sección 2.2.5 (pág. 7):
 *   "Lista de todas las fuentes referenciales, que fueron utilizadas y
 *    mencionadas en el documento. Se debe mencionar todas las fuentes en
 *    orden alfabético por apellido del autor en minúsculas, siguiendo el
 *    formato de la norma internacional APA."
 *
 * ⚠️ DIFERENCIA CLAVE vs APA estándar:
 *   APA estándar  → APELLIDO en versales o mayúscula primera letra.
 *   UNIFRANZ      → APELLIDO en MINÚSCULA. (regla específica UNIFRANZ)
 *
 * Anti-error PDF reprobado: tenía 5 fuentes para 27 páginas de marco
 * teórico. UNIFRANZ exige todas las fuentes citadas, mínimo 20 en un
 * Proyecto de Grado típico.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { buildPromptUnifranz } from "./00-reglas-comunes";

const CUERPO = `
# FASE: BIBLIOGRAFÍA (UNIFRANZ Proyecto de Grado)

## Ubicación
Después de Recomendaciones, antes de la sección de Referencias
(Abreviaturas, Glosario, Apéndices, Anexos, Planos).

## Función
Consolidar TODAS las fuentes citadas en el cuerpo del documento.
Las fuentes que aparezcan acá deben coincidir 1 a 1 con las citas
in-text de los capítulos. No incluir fuentes que no se citaron.

## Reglas de formato OBLIGATORIAS UNIFRANZ

### Reglas generales
1. **Orden alfabético** por apellido del primer autor.
2. **APELLIDOS EN MINÚSCULA** ⚠️ (norma específica UNIFRANZ).
3. **Sangría francesa** de 1.27 cm (primera línea sin sangría,
   siguientes con sangría).
4. **Interlineado 1.5** dentro de cada referencia.
5. **Sin viñetas, sin numeración** — solo lista alfabética continua.
6. Si la fuente NO se citó en el cuerpo, NO va en bibliografía.

### Formato por tipo de fuente

#### A) LIBRO con un autor
Estructura UNIFRANZ:
   apellido, n. (año). *título del libro en cursiva*. Ciudad: Editorial.

Ejemplo correcto UNIFRANZ:
   sapag, n. (2014). *proyectos de inversión: formulación y evaluación*.
   2da ed. Santiago de Chile: Pearson Educación.

#### B) LIBRO con dos o más autores
Estructura:
   apellido1, n., y apellido2, n. (año). *título en cursiva*. Ciudad: Editorial.

Ejemplo:
   meredith, j., y mantel, s. (2020). *gestión de proyectos: un enfoque
   gerencial*. 10ma ed. Ciudad de México: Wiley.

#### C) Capítulo de libro editado
   apellido_autor, n. (año). título del capítulo. En apellido_editor, n.
   (ed.), *título del libro en cursiva* (pp. X-Y). Ciudad: Editorial.

#### D) Artículo de revista académica
   apellido, n. (año). título del artículo. *nombre de la revista en cursiva*,
   volumen(número), páginas. URL si aplica.

Ejemplo:
   porter, m. (1979). how competitive forces shape strategy. *harvard
   business review*, 57(2), 137-145.

#### E) Artículo de periódico
   apellido, n. (día, mes, año). título del artículo. *nombre del periódico
   en cursiva*, p. X.

#### F) Documento institucional / informe
   instituto nacional de estadística (INE). (2023). *encuesta nacional
   de hogares 2023*. La Paz: INE.

   banco central de bolivia (BCB). (2024). *memoria institucional 2024*.
   La Paz: BCB.

#### G) Recurso electrónico con autor
   apellido, n. (año). *título del recurso en cursiva*. Recuperado el
   DD de mes de AAAA, de https://url-completa.com

#### H) Recurso electrónico sin autor identificado
   ministerio de educación. (2021). *plan estratégico institucional
   2021-2025*. Recuperado el 15 de marzo de 2024, de
   https://www.minedu.gob.bo/plan-estrategico

#### I) Tesis o trabajo de grado consultado
   apellido, n. (año). *título del trabajo en cursiva* (tesis de
   licenciatura). Universidad, ciudad.

#### J) Ley o normativa boliviana
   estado plurinacional de bolivia. (año). *ley n° X de [fecha], [nombre
   de la ley]*. La Paz: Gaceta Oficial de Bolivia.

Ejemplo:
   estado plurinacional de bolivia. (2010). *ley n° 045 de 8 de octubre
   de 2010, ley contra el racismo y toda forma de discriminación*. La Paz:
   Gaceta Oficial de Bolivia.

## Volumen mínimo esperado

Para un Proyecto de Grado de Pre-Factibilidad UNIFRANZ:
- MÍNIMO 20 referencias bibliográficas distintas.
- MÁXIMO no establecido (la guía no limita).
- Distribución sugerida:
    > 30% libros académicos (clásicos del área).
    > 25% artículos académicos / revistas indexadas.
    > 25% fuentes institucionales bolivianas (INE, BCB, ministerios,
            cámaras, leyes).
    > 20% recursos electrónicos verificables.

## Reglas de integridad

OBLIGATORIO:
- Toda fuente listada debe estar citada en el cuerpo del documento.
- Toda cita del cuerpo debe estar listada acá.
- Verificación cruzada: si en el cuerpo dice "(Porter, 1979)", debe
  haber una entrada "porter, m. (1979)..." en esta lista.

PROHIBIDO:
- Inventar referencias para abultar el volumen.
- Repetir el mismo autor 10 veces (señal de marco teórico pobre).
- Listar referencias en idiomas que el estudiante no leyó.
- Mezclar formatos (todas deben seguir el mismo estilo).
- Usar MAYÚSCULAS en apellidos (es regla específica UNIFRANZ).

## Auto-verificación antes de devolver

- [ ] Mínimo 20 referencias.
- [ ] Orden alfabético estricto por primer apellido.
- [ ] TODOS los apellidos en minúscula (revisar uno por uno).
- [ ] Títulos de libros y revistas en cursiva (formato markdown: *...*).
- [ ] Sangría francesa visualmente (en markdown se simula con
       indentación de líneas 2+).
- [ ] Cada fuente listada tiene cita correspondiente en el cuerpo.
- [ ] Cero fuentes inventadas o no verificables.
- [ ] Sin numeración ni viñetas — lista continua alfabética.

## Salida esperada

# BIBLIOGRAFÍA

apellido1, n. (año). *título del libro en cursiva*. Ciudad: Editorial.

apellido2, n. (año). título del artículo. *nombre de la revista*,
volumen(número), páginas.

apellido3, n., y apellido4, n. (año). *título del libro en cursiva*.
Ciudad: Editorial.

banco central de bolivia (BCB). (año). *título del documento institucional
en cursiva*. La Paz: BCB.

[... continuar alfabéticamente ...]

NO incluir contadores, no incluir comentarios al estudiante, no incluir
"NOTA:" ni explicaciones de la generación.
`;

export const PROMPT_UNIFRANZ_BIBLIOGRAFIA = buildPromptUnifranz(CUERPO);
