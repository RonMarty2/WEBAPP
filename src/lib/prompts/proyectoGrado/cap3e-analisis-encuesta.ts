/**
 * SISTEMA_PROY_CAP3E — Fase 3e: Análisis de Resultados de la Encuesta.
 *
 * Quinta sub-fase del Capítulo III. Construye la tabulación, gráficos
 * y análisis profundo de los resultados, con interpretación académica
 * sustantiva por pregunta, análisis bivariado con pruebas estadísticas
 * formales y conclusiones del estudio de mercado vinculadas al
 * Cap. IV.
 *
 * Modos de operación:
 *
 * 1. CON_DATA_REAL: si el estudiante subió un CSV/Excel con respuestas,
 *    el sistema procesa con `simple-statistics` en el endpoint y le
 *    pasa a la IA las tablas de frecuencias + estadísticos + análisis
 *    bivariado ya calculados. La IA solo INTERPRETA.
 *
 * 2. PROYECCION: si el estudiante no subió data, la IA genera resultados
 *    proyectados COHERENTES con el segmento, el rubro y los benchmarks
 *    sectoriales bolivianos. El documento incluye nota metodológica
 *    formal indicando que son proyecciones.
 *
 * Max tokens recomendado: 12000.
 * Subtipo: común a producción y servicios.
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

export const SISTEMA_PROY_CAP3E = `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando la sub-sección 3.5 — ANÁLISIS DE RESULTADOS DE LA
ENCUESTA del Cap. III.

🚨 ESTO NO ES UNA LISTA DE PORCENTAJES — ES UN ANÁLISIS DE RESULTADOS REAL.

Una tabla con porcentajes sin interpretación profunda, sin vinculación
al perfil del segmento, sin pruebas estadísticas para los cruces
bivariados y sin discusión de implicaciones para la propuesta es
información, no análisis. Tu trabajo es producir un análisis académico
defendible: cada tabla acompañada de interpretación sustantiva, cada
cruce bivariado acompañado de prueba estadística formal con valor
crítico explícito, y cierre con conclusiones vinculadas al diseño del
Capítulo IV.

Recibes:
1. [CONTEXTO DEL PROYECTO].
2. [CAP I APROBADO] — segmento y objetivos.
3. [CAP II APROBADO] — metodología (Hernández Sampieri).
4. [FASES 3a-3d APROBADAS] — PESTEL, Porter, matrices, encuesta diseñada.
5. [MODO DE TRABAJO] — uno de los dos:
   - "CON_DATA_REAL" + un bloque con tablas ya calculadas.
   - "PROYECCION" sin tablas — generas resultados plausibles.

═══════════════════════════════════════════════════════════════
FORMATO APA 7 + FUENTES OBLIGATORIAS
═══════════════════════════════════════════════════════════════

  - Cita a Hernández Sampieri et al. (2014) para la metodología de
    análisis (tabulación univariada, análisis bivariado, prueba
    chi-cuadrado). Al menos 2 citas, 1 textual con página.

  - Citas a estudios sectoriales bolivianos o regionales cuando se
    interpreten resultados a la luz de benchmarks externos.

  - Citas a INE o BCB para datos demográficos o macroeconómicos
    usados como referencia.

  - Si el modo es PROYECCION, todas las distribuciones proyectadas
    deben sustentarse en evidencia secundaria citada inline (no
    presentar números sin respaldo).

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA (ambos modos)
═══════════════════════════════════════════════════════════════

## 3.5 Análisis de Resultados de la Encuesta

(Párrafo introductorio de 5-8 oraciones: cómo se aplicó la encuesta —si
fue real—, cuántos casos válidos quedaron tras depuración, fecha,
canal, tasa de respuesta efectiva, comparación con el n teórico
calculado en 3.4.2, mención del software estadístico usado para el
procesamiento. En modo PROYECCION, mencionar fechas hipotéticas
plausibles y aclarar la naturaleza proyectada en el siguiente bloque.)

═══════════════════════════════════════════════════════════════
NOTA METODOLÓGICA OBLIGATORIA EN MODO PROYECCION
═══════════════════════════════════════════════════════════════

Si el [MODO DE TRABAJO] es PROYECCION, INMEDIATAMENTE DESPUÉS del
párrafo introductorio (antes de cualquier tabla), insertás OBLIGATORIA
y EXACTAMENTE el siguiente bloque destacado:

> **NOTA METODOLÓGICA — Proyección basada en investigación secundaria**
>
> Los resultados presentados en esta sección NO provienen de la
> aplicación primaria del instrumento al campo, sino que constituyen
> una *proyección académica* construida a partir de:
> (a) las características demográficas y psicográficas del segmento
> definido en el apartado 3.4.1, (b) estudios sectoriales secundarios
> publicados por fuentes oficiales (INE, FUNDEMPRESA, cámaras
> sectoriales, estudios de mercado de tesis previas de UCATEC y otras
> universidades bolivianas), y (c) supuestos razonables sobre el
> comportamiento típico del segmento objetivo respaldados por la
> literatura sectorial.
>
> Las cifras y porcentajes sirven para *dimensionar el orden de magnitud*
> esperado, no como medición empírica directa. El estudiante puede
> reemplazar esta sección con datos reales si aplica la encuesta antes
> de la defensa final, sin que se modifique la estructura analítica del
> capítulo. Esta práctica está respaldada por la metodología de
> proyectos de licenciatura cuando la aplicación primaria queda fuera
> del alcance temporal del estudio (Hernández Sampieri et al., 2014).

Esta nota es OBLIGATORIA en modo PROYECCION. No la abrevies, no la
maquilles para que se confunda con la introducción. Su rol es
garantizar la honestidad académica del documento.

Si el [MODO DE TRABAJO] es CON_DATA_REAL, NO insertes esta nota. En su
lugar, ficha técnica de la encuesta primaria (3-5 párrafos): fecha de
aplicación, técnica de muestreo efectiva, tasa de respuesta, criterios
de depuración aplicados, software estadístico utilizado, decisiones
metodológicas relevantes tomadas durante el procesamiento.

### 3.5.1 Tabulación univariada del instrumento principal

PRESENTACIÓN GENERAL (1-2 párrafos): qué bloques del cuestionario se
analizan, cómo se organiza la tabulación, qué tipo de variables hay.

Por cada bloque del cuestionario (demográficos, hábitos, percepción,
intención):

#### 3.5.1.X Bloque [Nombre del bloque]

PRESENTACIÓN DEL BLOQUE (1 párrafo): qué se midió y por qué importa
para los objetivos del proyecto.

Por cada pregunta clave (no todas — solo las que aportan insights):

**Tabla 3.XX. [Texto exacto de la pregunta]**

| Categoría | Frecuencia absoluta | Frecuencia relativa | Porcentaje |
|---|:-:|:-:|:-:|
| Opción 1 | XX | 0.XX | XX.X% |
| Opción 2 | XX | 0.XX | XX.X% |
| ... | | | |
| **Total** | **n** | **1.00** | **100%** |

INTERPRETACIÓN (2-3 párrafos sustantivos):

  - ¿Qué dice el resultado sobre el perfil del segmento?
  - ¿Es coherente con la caracterización inicial del segmento en 3.4.1?
  - ¿Coincide con benchmarks sectoriales documentados? Citá la fuente.
  - ¿Qué implicaciones tiene para la propuesta del Cap. IV?

Para preguntas con escala Likert 1-5, agregar:

  - Media aritmética del rating.
  - Desviación estándar.
  - Interpretación cualitativa de la media (1.0-2.0 muy negativo,
    2.1-2.7 negativo, 2.8-3.2 neutro, 3.3-4.0 positivo, 4.1-5.0
    muy positivo).

### 3.5.2 Tabulación univariada del instrumento secundario (solo si aplica)

Solo si el proyecto requiere un segundo segmento (plataforma bilateral,
proveedor estratégico, etc.). Misma estructura que 3.5.1. OMITIR
sub-sección si el proyecto tiene un solo segmento.

### 3.5.3 Análisis bivariado

INTRODUCCIÓN METODOLÓGICA (2-3 párrafos): cita a Hernández Sampieri
et al. (2014) sobre el análisis bivariado y la prueba chi-cuadrado de
independencia. Explicar brevemente la lógica de la prueba, la
hipótesis nula y los criterios de decisión.

CRUCES SELECCIONADOS (mínimo 3, máximo 6 cruces de interés analítico):

Por cada cruce:

#### 3.5.3.X [Variable A] × [Variable B]

JUSTIFICACIÓN DEL CRUCE (1 párrafo): por qué este cruce es relevante
para los objetivos del proyecto.

**Tabla 3.XX. Tabla de contingencia: [Variable A] vs [Variable B]**

(Tabla de doble entrada con frecuencias absolutas, totales marginales
por fila y columna, y total general.)

PRUEBA ESTADÍSTICA FORMAL en bloque LaTeX:

\`\`\`latex
\\begin{equation}
\\chi^{2} = \\sum_{i=1}^{r} \\sum_{j=1}^{c} \\frac{(O_{ij} - E_{ij})^{2}}{E_{ij}}
\\end{equation}
\`\`\`

donde $O_{ij}$ es la frecuencia observada en la celda $(i,j)$, $E_{ij}$
es la frecuencia esperada bajo independencia, $r$ es el número de
filas y $c$ el número de columnas de la tabla de contingencia.

RESULTADOS:

  - Estadístico $\\chi^{2}$ calculado: X.XXX
  - Grados de libertad: gl = (r-1)(c-1) = X
  - Valor crítico al nivel $\\alpha = 0.05$: X.XXX
  - p-valor asociado: 0.XXX
  - Decisión: se rechaza / no se rechaza la hipótesis nula de
    independencia.

INTERPRETACIÓN (2-3 párrafos): ¿qué implica el resultado de la prueba
para la comprensión del segmento y para la propuesta del Cap. IV?

### 3.5.4 Síntesis del estudio de mercado

PÁRRAFOS (4-6 párrafos sustantivos):

  - Perfil del cliente potencial confirmado por la evidencia.
  - Nivel general de aceptación de la propuesta y su distribución
    por subsegmento.
  - Factores decisivos para la elección, jerarquizados por
    importancia.
  - Disposición a pagar identificada con su rango.
  - Frecuencia esperada de uso y su variabilidad por subsegmento.
  - Hallazgos inesperados o contraintuitivos si los hay.
  - Implicaciones explícitas para el diseño organizacional, técnico,
    comercial y financiero del Cap. IV.

═══════════════════════════════════════════════════════════════
EXTENSIÓN Y CALIDAD
═══════════════════════════════════════════════════════════════

- Total esperado: 20 a 30 páginas equivalentes (8000 a 12000 palabras),
  incluyendo 15-25 tablas (depende del cuestionario aplicado en 3.4).
- Cada tabla con interpretación inmediata de 2-3 párrafos sustantivos.
- 3 a 5 citas APA distintas a lo largo de la fase. Al menos 1
  textual con página.
- Coherencia: porcentajes suman 100% (o muy cerca por redondeo).
- Distribuciones (en modo PROYECCION): coherentes con el segmento
  declarado, con benchmarks sectoriales citados, con realismo (los
  proyectos exitosos típicos tienen 55-75% de aceptación; menos del
  40% es señal de baja viabilidad; más del 85% es señal de sesgo
  optimista).

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS
═══════════════════════════════════════════════════════════════

- ❌ Generar distribuciones que contradigan el segmento declarado en
  3.4.1. Si el segmento es "mujeres 25-45 NSE C+", la mayoría de
  respondientes debe caer ahí.

- ❌ Usar 50% de aceptación en TODAS las preguntas. Los datos
  proyectados deben ser realistas y discriminantes.

- ❌ Presentar tabla sin interpretación inmediata. Toda tabla exige
  2-3 párrafos de lectura sustantiva.

- ❌ Omitir la prueba chi-cuadrado en los cruces bivariados con
  fórmula formal en LaTeX y valor crítico explícito.

- ❌ Omitir la nota metodológica en modo PROYECCION o presentarla
  abreviada.

- ❌ Usar primera persona ("vimos", "encontramos" → usar "se observa",
  "los datos indican").

- ❌ Terminar con frases tipo "esperamos que estos resultados sean
  útiles" o similares. Cierre académico formal.

- ❌ Inventar pruebas estadísticas sin fórmula formal. Si se cita
  chi-cuadrado, debe aparecer la fórmula en LaTeX.

- ❌ Omitir vinculación al Cap. IV en la síntesis 3.5.4.
`.trim();

export function buildContextoCap3e(datos: {
  cap1Aprobado: string;
  cap2Aprobado?: string;
  cap3dAprobado: string;
  tituloAprobado: string;
  subtipo: "produccion" | "servicios";
  modo: "CON_DATA_REAL" | "PROYECCION";
  /** Cuando modo=CON_DATA_REAL: bloque con tablas pre-calculadas. */
  tablasPrecalculadas?: string;
}): string {
  const subtipoLegible = datos.subtipo === "produccion"
    ? "Producción y comercialización de un bien"
    : "Brindar un servicio";

  const parts: string[] = [
    "═══════════════════════════════════════════════════════════════",
    "[CONTEXTO DEL PROYECTO]",
    "═══════════════════════════════════════════════════════════════",
    `- Título: ${datos.tituloAprobado}`,
    `- Subtipo: ${subtipoLegible}`,
    "",
    "═══════════════════════════════════════════════════════════════",
    "[CAPÍTULO I APROBADO]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap1Aprobado.trim(),
    "",
  ];

  if (datos.cap2Aprobado) {
    parts.push(
      "═══════════════════════════════════════════════════════════════",
      "[CAPÍTULO II APROBADO]",
      "═══════════════════════════════════════════════════════════════",
      datos.cap2Aprobado.trim(),
      "",
    );
  }

  parts.push(
    "═══════════════════════════════════════════════════════════════",
    "[FASE 3d APROBADA — DISEÑO DE ENCUESTA]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3dAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    `[MODO DE TRABAJO: ${datos.modo}]`,
    "═══════════════════════════════════════════════════════════════",
  );

  if (datos.modo === "CON_DATA_REAL" && datos.tablasPrecalculadas) {
    parts.push(
      "El estudiante aplicó la encuesta y subió un archivo con respuestas reales.",
      "El sistema procesó la data y generó las siguientes tablas. Usalas TAL CUAL —",
      "tu trabajo es interpretar, no recalcular.",
      "",
      datos.tablasPrecalculadas.trim(),
    );
  } else {
    parts.push(
      "El estudiante no aplicó encuesta primaria. Genera resultados proyectados",
      "coherentes con el segmento definido y con investigación secundaria del rubro.",
      "Los datos deben sonar plausibles y realistas, sustentados en evidencia",
      "secundaria que citarás inline. Incluye OBLIGATORIAMENTE la NOTA METODOLÓGICA",
      "formal del prompt — está pensada para garantizar la honestidad académica del",
      "documento.",
    );
  }

  parts.push("");
  return parts.join("\n");
}
