/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESUMEN DEL TRABAJO — UNIFRANZ Proyecto de Grado
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Guía UNIFRANZ 2017, sección 2.1.9 (pág. 6):
 *   "Resumen breve y conciso que informa el contenido del documento.
 *    Se recomienda que esté constituido por la formulación del objetivo,
 *    la descripción del método o procedimiento y la presentación de los
 *    resultados obtenidos. La extensión debe ser de 250 palabras."
 *
 * Anti-error: el PDF reprobado tenía resumen con CERO cifras concretas.
 * Este prompt OBLIGA a incluir números clave (inversión, VAN, TIR, B/C).
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { buildPromptUnifranz } from "./00-reglas-comunes";

const CUERPO = `
# FASE: RESUMEN DEL TRABAJO (250 palabras exactas)

## Ubicación en el documento
Va al final de los PRELIMINARES, justo antes del Índice de Contenido.
Es la PRIMERA pieza académica que lee el tribunal antes de la defensa.
Si está mal, el tribunal entra con prejuicio negativo.

## Extensión EXACTA
- 250 palabras (rango aceptable: 240-260).
- Un solo bloque, sin subtítulos, sin viñetas, sin numeración.
- Interlineado 1.5 (lo aplica el documento, no el prompt).

## Estructura obligatoria (4 párrafos, sin títulos visibles)

### Párrafo 1 — Objetivo y contexto (≈ 50 palabras)
- Comienza con: "El presente Proyecto de Grado tuvo como objetivo..."
- Identifica el tipo de proyecto (estudio de pre-factibilidad / mejora
  organizacional / diseño de artefacto / trabajo dirigido).
- Indica el sector económico, la ciudad y el horizonte temporal del proyecto.
- NO repite el título del trabajo textualmente.

### Párrafo 2 — Método y procedimiento (≈ 70 palabras)
- Describe el enfoque metodológico aplicado (cuantitativo / cualitativo / mixto).
- Menciona el tipo de investigación (descriptiva, exploratoria, correlacional).
- Indica las herramientas usadas: encuestas, entrevistas, análisis PESTEL,
  cinco fuerzas de Porter, matrices estratégicas, análisis financiero.
- Si hubo muestreo: indicar tamaño de muestra y población base.

### Párrafo 3 — Resultados con CIFRAS (≈ 90 palabras)
⚠️ OBLIGATORIO: este párrafo DEBE contener los siguientes números concretos
del estudio. Si alguno no está en el contexto del proyecto, marcar como
estimación, NUNCA inventar:

- Inversión total estimada en Bs.
- Cuota de mercado o demanda insatisfecha cuantificada (% o unidades).
- Valor Actual Neto (VAN) en Bs.
- Tasa Interna de Retorno (TIR) en porcentaje.
- Relación Beneficio/Costo (B/C).
- Período de recuperación de la inversión en años o meses.
- Tasa Mínima Atractiva de Retorno (TREMA) o WACC en porcentaje, si aplica.

Formato sugerido del párrafo:
"Los resultados financieros mostraron una inversión total de Bs. [X],
una Tasa Interna de Retorno (TIR) del [Y]% frente a una Tasa Mínima
Atractiva de Retorno (TREMA) del [Z]%, un Valor Actual Neto positivo
de Bs. [W] y una relación Beneficio/Costo de [B/C], con un período de
recuperación de [N] años."

### Párrafo 4 — Cierre de viabilidad (≈ 40 palabras)
- Una sola oración declarativa, en pasado, tercera persona.
- Indica VIABILIDAD o NO viabilidad del proyecto en función de los
  indicadores reportados, no en función de opinión subjetiva.
- Estructura modelo: "Sobre la base de los indicadores obtenidos, se
  concluyó que el proyecto es financieramente VIABLE / NO VIABLE bajo
  los supuestos considerados."

## Prohibiciones específicas del resumen

PROHIBIDO:
- Frases del tipo "Se realizó una investigación..." sin objeto concreto.
- "Se determinó la capacidad..." sin decir cuál capacidad ni qué número.
- Adjetivos comerciales: "exitoso", "excelente", "innovador", "óptimo",
  "revolucionario", "líder en el mercado".
- Primera persona ("realizamos", "encontramos", "nuestra propuesta").
- Promesas de futuro: "será", "logrará", "transformará".
- Citas, referencias bibliográficas, notas al pie.
- Tablas, figuras, fórmulas, viñetas.

## Regla anti-PDF-reprobado
El proyecto reprobado de referencia tenía un resumen que decía cosas
como: "Se realizó una investigación del mercado, para determinar la
demanda insatisfecha". CERO números. Eso NO debe pasar acá.
Si el resumen no contiene al menos 4 cifras concretas (inversión, VAN,
TIR, B/C o equivalentes), está MAL y debe regenerarse.

## Salida esperada

Devuelve SÓLO el bloque del resumen como markdown. Estructura:

# RESUMEN

[Párrafo 1 — Objetivo y contexto, ~50 palabras]

[Párrafo 2 — Método y procedimiento, ~70 palabras]

[Párrafo 3 — Resultados con cifras concretas, ~90 palabras]

[Párrafo 4 — Cierre de viabilidad numérica, ~40 palabras]

No incluir contadores de palabras visibles. No incluir comentarios al
estudiante. Solo el contenido final.
`;

export const PROMPT_UNIFRANZ_RESUMEN_TRABAJO = buildPromptUnifranz(CUERPO);
