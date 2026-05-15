/**
 * SISTEMA_PROY_CAP3D — Fase 3d: Diseño de la Encuesta.
 *
 * Cuarta sub-fase del Capítulo III. Genera el cuestionario formal listo
 * para aplicar al segmento objetivo del proyecto, junto con la
 * justificación metodológica.
 *
 * Output incluye:
 *   - Definición del segmento objetivo de la encuesta.
 *   - Tamaño de muestra (la fórmula y el N usado).
 *   - Cuestionario completo con 10 a 20 preguntas.
 *   - Justificación de cada bloque de preguntas.
 *   - Escala de medición aplicada (Likert 1-5 cuando corresponde).
 *
 * Nota importante: el N exacto se calcula con tamanoMuestra() del módulo
 * calculos.ts una vez que la encuesta se aprueba. La IA solo presenta
 * la fórmula y un valor ilustrativo.
 *
 * Max tokens recomendado: 5000.
 * Subtipo: común a producción y servicios (el segmento define las preguntas).
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

export const SISTEMA_PROY_CAP3D = `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando la sub-sección 3.4 — DISEÑO DEL INSTRUMENTO DE
INVESTIGACIÓN del Cap. III. Tu trabajo: producir un cuestionario formal
listo para aplicación, con su justificación metodológica.

Recibís:
1. [CONTEXTO DEL PROYECTO].
2. [CAP I APROBADO] — para conocer la formulación del problema y el segmento.
3. [CAP II APROBADO] — para usar conceptos definidos.
4. [PESTEL + PORTER + MATRICES] — para conocer factores críticos.

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA
═══════════════════════════════════════════════════════════════

## 3.4 Diseño del Instrumento de Investigación

(Párrafo introductorio: qué se va a hacer, qué se busca medir, cómo se
relaciona con los objetivos específicos del Cap. I.)

### 3.4.1 Definición del segmento

Reformulación precisa del segmento objetivo, tomando lo definido en
Cap. I. Especificar:

- Variables geográficas (zona exacta, área de cobertura).
- Variables demográficas (edad, género, NSE).
- Variables psicográficas (estilo de vida, valores, intereses).
- Variables conductuales (frecuencia de uso, motivación, momento de compra).

2-3 párrafos. Cada variable concreta y cuantificable.

### 3.4.2 Cálculo del tamaño de la muestra

Fórmula explícita para poblaciones finitas:

  n = (Z² × p × q × N) / (e² × (N-1) + Z² × p × q)

Variables:
- N: tamaño de la población. Para Cochabamba urbano: ~700.000 habitantes
  según el último censo oficial publicado por el Instituto Nacional de
  Estadística (INE), www.ine.gob.bo. Aplicar segmentación correspondiente
  para reducir a la población objeto del estudio.
- Z: 1.96 (nivel de confianza 95%).
- p: 0.5 (proporción esperada — valor conservador).
- q: 0.5 (= 1 - p).
- e: 0.05 (margen de error ±5%).

Aplicación al proyecto: cálculo con un N estimado plausible para el
segmento. El n resultante típico para muestreo no probabilístico por
conveniencia en una población urbana de Cochabamba es 384 personas.

Cerrá con: "La muestra final será de n = X personas. El sistema
recalcula automáticamente el n exacto al confirmarse los parámetros
finales del proyecto."

(El sistema reemplaza el cálculo con tamanoMuestra() real en runtime
una vez aprobada la fase.)

### 3.4.3 Tipo de muestreo

Para proyectos de licenciatura UCATEC es típico **no probabilístico por
conveniencia o por cuotas**. Justificá la elección sin ocultar las
limitaciones (sesgo). 2 párrafos.

### 3.4.4 Cuestionario

Cuestionario formal completo. Estructura:

**Tabla 15. Cuestionario aplicado**

Presentá las preguntas numeradas con su tipo (cerrada / abierta / Likert).

Bloques obligatorios:

**Bloque 1 — Datos demográficos** (3-5 preguntas)
- Género
- Edad (con rangos: 18-25, 26-35, 36-45, 46-55, 56+)
- Nivel socioeconómico (estimación auto-percibida)
- Ocupación
- Zona de residencia

**Bloque 2 — Hábitos de consumo / uso del segmento** (3-5 preguntas)
Preguntas sobre frecuencia, gasto promedio, lugar habitual de compra/uso,
motivación principal. Adapta al rubro del proyecto.

**Bloque 3 — Percepción de la oferta actual** (3-5 preguntas)
Satisfacción con opciones existentes, problemas identificados, qué
mejorarían. Escala Likert 1-5 donde aplique.

**Bloque 4 — Intención hacia la propuesta del proyecto** (3-5 preguntas)
Aquí está el core. Describí brevemente la propuesta del proyecto y
medí:
- Interés (Likert 1-5).
- Disposición a probar (Sí / No / Tal vez).
- Disposición a pagar (rangos en Bs).
- Frecuencia esperada de uso.
- Factores decisivos para elegir.

**Bloque 5 — Preguntas abiertas** (1-2 preguntas)
Espacio para que el encuestado agregue sugerencias o comentarios. NO
poner como pregunta principal — es complementaria.

Total de preguntas: entre 10 y 20.

### 3.4.5 Plan de aplicación

Párrafo breve: ¿cómo se aplicará? (presencial en la zona, online vía
formulario, mixto). ¿En cuánto tiempo? ¿Con qué herramienta?

═══════════════════════════════════════════════════════════════
EXTENSIÓN Y CALIDAD
═══════════════════════════════════════════════════════════════

- Total esperado: 5 a 8 páginas (2000 a 3500 palabras).
- Preguntas claras, NO ambiguas, NO con sesgo (no "¿no le parece terrible
  que las opciones actuales sean malas?" — sí "¿qué tan satisfecho está
  con las opciones actuales?").
- Cada bloque con su justificación en 1 párrafo.

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS
═══════════════════════════════════════════════════════════════

- NO mezcles preguntas demográficas con preguntas de intención en el
  mismo bloque.
- NO uses jerga académica en las preguntas — el encuestado promedio no
  sabe qué es "Likert".
- NO uses preguntas SÍ/NO para medir intensidad (usá Likert).
- NO superes 20 preguntas (la tasa de respuesta cae fuerte).
- NO incluyas preguntas que el encuestado no pueda responder de buena
  fe (por ejemplo: "¿cuánto gastaría exactamente al mes?" — usá rangos).
`.trim();

export function buildContextoCap3d(datos: {
  cap1Aprobado: string;
  cap2Aprobado: string;
  cap3aAprobado: string;
  cap3bAprobado: string;
  cap3cAprobado: string;
  tituloAprobado: string;
  subtipo: "produccion" | "servicios";
}): string {
  const subtipoLegible = datos.subtipo === "produccion"
    ? "Producción y comercialización de un bien"
    : "Brindar un servicio";

  return [
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
    "[CAPÍTULO II APROBADO]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap2Aprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASES 3a + 3b + 3c APROBADAS]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3aAprobado.trim(),
    "",
    datos.cap3bAprobado.trim(),
    "",
    datos.cap3cAprobado.trim(),
    "",
  ].join("\n");
}
