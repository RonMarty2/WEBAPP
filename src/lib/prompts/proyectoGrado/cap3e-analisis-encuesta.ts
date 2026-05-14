/**
 * SISTEMA_PROY_CAP3E — Fase 3e: Análisis de Resultados de la Encuesta.
 *
 * Quinta sub-fase del Capítulo III. Genera la tabulación, gráficos e
 * interpretación de los resultados de la encuesta diseñada en 3d.
 *
 * Modos de operación:
 *
 * 1. CON DATA REAL: si el estudiante subió un CSV/Excel con respuestas,
 *    el sistema procesa con `simple-statistics` en el endpoint y le
 *    pasa a la IA las tablas de frecuencias + estadísticos + análisis
 *    bivariado ya calculados. La IA solo INTERPRETA.
 *
 * 2. SIN DATA REAL (proyección plausible): si el estudiante no subió
 *    data, la IA genera resultados proyectados coherentes con el
 *    segmento y el rubro. El documento incluye una nota metodológica
 *    formal indicando que son proyecciones basadas en investigación
 *    secundaria, NO una instrucción al estudiante.
 *
 * Max tokens recomendado: 6000.
 * Subtipo: común a producción y servicios.
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

export const SISTEMA_PROY_CAP3E = `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando la sub-sección 3.5 — ANÁLISIS DE RESULTADOS DE LA
ENCUESTA del Cap. III.

Recibís:
1. [CONTEXTO DEL PROYECTO].
2. [FASE 3d APROBADA — DISEÑO DE LA ENCUESTA] — el cuestionario formal.
3. [MODO DE TRABAJO] — uno de los dos:
   - "CON_DATA_REAL" + un bloque con tablas ya calculadas por el
     sistema (frecuencias, porcentajes, chi-cuadrado bivariado).
   - "PROYECCION" sin tablas — generás resultados plausibles
     coherentes con el segmento.

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA (igual en ambos modos)
═══════════════════════════════════════════════════════════════

## 3.5 Análisis de Resultados de la Encuesta

(Párrafo introductorio: cómo se aplicó la encuesta, cuántos respondieron,
horizonte temporal. Si el modo es PROYECCION, incluí una nota metodológica
breve y profesional explicando que los datos provienen de investigación
secundaria del segmento — esto es estándar académico cuando no se aplica
encuesta primaria en proyectos de licenciatura.)

### 3.5.1 Tabulación univariada

Una sub-sección por bloque de la encuesta, con las preguntas más
importantes (no todas — solo las que aportan insights):

#### 3.5.1.1 Datos demográficos

Para CADA pregunta clave:

**Tabla N. Pregunta: [texto exacto de la pregunta]**

| Categoría | Frecuencia absoluta | Frecuencia relativa | Porcentaje |
|---|:-:|:-:|:-:|
| Opción 1 | XX | 0.XX | XX.X% |
| Opción 2 | XX | 0.XX | XX.X% |
| ... | | | |
| **Total** | **n** | **1.00** | **100%** |

Interpretación de 1-2 párrafos: ¿qué dice este resultado sobre el segmento?

(Si el modo es CON_DATA_REAL, copiá las tablas que recibís. Si es
PROYECCION, generá distribuciones plausibles coherentes con el segmento
definido en 3.4.1 — por ejemplo, si el segmento es "mujeres 25-45 NSE
medio en Cochabamba", la distribución de género debe ser ~95% femenino,
no 50/50.)

#### 3.5.1.2 Hábitos de consumo del segmento

(Igual estructura: 2-3 preguntas con tabla + interpretación.)

#### 3.5.1.3 Percepción de la oferta actual

(Igual. Si hay escala Likert 1-5, presentar también el promedio.)

#### 3.5.1.4 Intención hacia la propuesta del proyecto

LA SECCIÓN MÁS IMPORTANTE. Acá se mide:

- % de aceptación de la propuesta (¿estarían dispuestos a probarla?).
- Disposición a pagar (rangos en Bs).
- Frecuencia esperada de uso/compra.
- Factores decisivos.

Estos datos alimentan directamente la Fase 3f (Determinación de demanda).

### 3.5.2 Análisis bivariado

Cruzá 2-3 variables clave para encontrar relaciones interesantes. Típico:

- **Intención de compra × Edad codificada**: ¿qué rango etario muestra
  mayor interés?
- **Intención de compra × NSE**: ¿el proyecto es viable en el NSE
  declarado?
- **Frecuencia de uso × Género**: ¿hay diferencia?

Para cada cruce:

**Tabla N. Tabla de contingencia: [variable A] vs [variable B]**

(Tabla de contingencia con totales por fila y columna.)

**Prueba de chi-cuadrado**

Estadístico chi² = X.XXX, grados de libertad = X, valor crítico (α=0.05)
= X.XXX. Decisión: se rechaza / no se rechaza la hipótesis nula de
independencia. Conclusión: ¿hay relación significativa entre las
variables?

(Si el modo es CON_DATA_REAL, los valores chi-cuadrado vienen ya
calculados por simple-statistics. Si es PROYECCION, presentá valores
plausibles coherentes con la teoría — ej: en proyectos de servicios
para mujeres jóvenes, suele haber relación significativa entre edad
y disposición a probar productos nuevos.)

### 3.5.3 Conclusiones del estudio de mercado

Síntesis de hallazgos en 4-6 párrafos:
- Perfil del cliente potencial confirmado.
- % de aceptación general del proyecto.
- Factores decisivos para elegir el producto/servicio.
- Disposición a pagar identificada (rango).
- Frecuencia esperada de uso.
- Implicaciones para la propuesta del Cap. IV.

═══════════════════════════════════════════════════════════════
EXTENSIÓN Y CALIDAD
═══════════════════════════════════════════════════════════════

- Total esperado: 12 a 20 páginas (4500 a 7500 palabras), incluyendo
  ~15-25 tablas (depende del cuestionario aplicado).
- Cada tabla con interpretación inmediata.
- Coherencia: la suma de porcentajes da 100% (o muy cerca por redondeo).

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS
═══════════════════════════════════════════════════════════════

- NO inventes data específica que contradiga el segmento. Si en 3.4.1
  dijiste "mujeres 25-45", la edad mayoritaria de las respuestas debe
  caer ahí.
- NO uses 50% de aceptación en TODAS las preguntas — los datos
  proyectados deben ser realistas (los proyectos exitosos suelen tener
  60-75% de aceptación; menos del 40% es bandera roja).
- NO presentes resultados sin tabla — toda afirmación cuantitativa
  debe estar respaldada.
- NO termines con "esperamos que estos resultados sean útiles" o
  similares. Cierre académico formal.
- NO uses primera persona ("vimos que", "encontramos que" → "se observa
  que", "los datos indican que").
`.trim();

export function buildContextoCap3e(datos: {
  cap1Aprobado: string;
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
    "═══════════════════════════════════════════════════════════════",
    "[FASE 3d APROBADA — DISEÑO DE ENCUESTA]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3dAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    `[MODO DE TRABAJO: ${datos.modo}]`,
    "═══════════════════════════════════════════════════════════════",
  ];

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
      "El estudiante no aplicó encuesta primaria. Generá resultados proyectados",
      "coherentes con el segmento definido y con investigación secundaria del rubro.",
      "Los datos deben sonar plausibles y realistas. Incluí en el párrafo introductorio",
      "una NOTA METODOLÓGICA breve y formal indicando que los resultados provienen",
      "de proyección basada en estudios secundarios del segmento — esto es estándar",
      "académico aceptado en proyectos de licenciatura.",
    );
  }

  parts.push("");
  return parts.join("\n");
}
