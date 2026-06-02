/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONCLUSIONES Y RECOMENDACIONES — UNIFRANZ Proyecto de Grado
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Guía UNIFRANZ 2017, secciones 2.2.3 y 2.2.4 (pág. 7).
 *
 * Son DOS bloques separados que cierran el CUERPO antes de la Bibliografía:
 *   - CONCLUSIONES → síntesis de los resultados del Trabajo de Grado.
 *   - RECOMENDACIONES → juicios del autor sobre ampliación futura.
 *
 * Anti-error PDF reprobado: en el PDF las conclusiones estaban dispersas
 * dentro de cada capítulo y NO había bloque consolidado al final, lo cual
 * UNIFRANZ exige obligatoriamente.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { buildPromptUnifranz } from "./00-reglas-comunes";

const CUERPO = `
# FASE: CONCLUSIONES Y RECOMENDACIONES (UNIFRANZ)

## Ubicación
Al final del CUERPO, después del Capítulo III y antes de la Bibliografía.
Son DOS secciones independientes con páginas propias.

## Extensión total
- Conclusiones: 3 a 6 páginas.
- Recomendaciones: 2 a 4 páginas.

═══════════════════════════════════════════════════════════════
## CONCLUSIONES
═══════════════════════════════════════════════════════════════

Cita textual de la Guía UNIFRANZ (sección 2.2.3, pág. 7):
"Es una síntesis de los resultados del Trabajo de Grado. Los datos se
presentarán en forma lógica, clara, sintetizada, original, objetiva y
concisa. La conclusión constituye la proposición transformada por la
demostración. Debe existir un ordenamiento cuidadoso de las conclusiones.
Las conclusiones deben marcar los elementos principales de los objetivos
de la investigación, éstas buscan definir el punto de vista del autor,
contienen un sello personal y, como resultado de su trabajo, contienen
datos concretos analizados e interpretados."

## Estructura obligatoria

### Párrafo introductorio (1)
Una oración que enuncia el cierre del trabajo y anticipa la naturaleza
de las conclusiones. Modelo:
"A partir de los resultados obtenidos a lo largo del presente estudio
de pre-factibilidad, se presentan las siguientes conclusiones, ordenadas
en función de los objetivos específicos planteados en la INTRODUCCIÓN."

### Conclusión por objetivo específico
Una conclusión POR CADA objetivo específico declarado en sección 3.2 de
la INTRODUCCIÓN. Numerar (1, 2, 3, 4, 5, 6...).

ESTRUCTURA de cada conclusión (3 a 5 oraciones):
1. Recordar el objetivo específico al que responde.
2. Síntesis del HALLAZGO principal con cifras concretas.
3. Implicación estratégica o académica del hallazgo.

Modelo:
"**Primera conclusión** — Respecto al primer objetivo específico
(realizar el análisis del macroentorno), se concluyó que el sector
[X] en Bolivia presenta un entorno [favorable / desafiante]. Los
factores [político/económico/social] muestran [tendencia], con
indicadores como [cifra concreta del INE/BCB]. Esto implica que
el proyecto enfrenta [oportunidad/amenaza] estructural a la cual
se responde con [estrategia identificada en el FODA]."

### Conclusión sobre Hipótesis (solo si se planteó hipótesis)
- Si se planteó hipótesis: declarar si fue CONFIRMADA o REFUTADA por
  los datos, citando los elementos que la sostienen o la contradicen.

### Conclusión General de Viabilidad
La última conclusión NUMERADA debe ser una proposición CUANTITATIVA
sobre la viabilidad del proyecto, basada en los indicadores financieros
del Capítulo III, sección 3.4.10.

ESTRUCTURA:
- Inversión total: Bs. [X].
- VAN: Bs. [W] (positivo / negativo).
- TIR: [Y]% (vs WACC de [Z]%).
- B/C: [valor].
- Payback: [N] años.
- Veredicto: el proyecto se considera VIABLE / NO VIABLE en términos
  financieros, bajo los supuestos del análisis.

═══════════════════════════════════════════════════════════════
## RECOMENDACIONES
═══════════════════════════════════════════════════════════════

Cita textual de la Guía UNIFRANZ (sección 2.2.4, pág. 7):
"Es una parte importante del proyecto, donde el autor emite juicios
con relación a la posibilidad de ampliar la investigación en un futuro
en función de los resultados obtenidos. Las recomendaciones pueden ser
útiles al problema de investigación, ampliando el desarrollo del
conocimiento."

## Estructura obligatoria

### Párrafo introductorio
Una oración que conecta las conclusiones con las recomendaciones.

### Recomendaciones numeradas

Mínimo 6 recomendaciones, máximo 12. Dos tipos:

**A) Recomendaciones operativas para la ejecución del proyecto** (60%)
Cómo el inversionista/emprendedor debería proceder si decide ejecutar
el proyecto. Ejemplos:
- Validación con focus groups antes de inversión final.
- Negociación con proveedores específicos.
- Capacitación previa del personal clave.
- Acompañamiento legal en fase de constitución.

**B) Recomendaciones académicas para investigación futura** (40%)
Líneas de investigación que el estudio sugiere y no agota. Ejemplos:
- Profundizar en estudio de comportamiento del consumidor en
  micro-segmentos no cubiertos.
- Aplicar el modelo a otras ciudades de Bolivia.
- Evaluar impacto post-implementación en horizonte de 3 años.
- Cruzar resultados con bases de datos sectoriales.

### Estructura de cada recomendación
1. Verbo en infinitivo (recomendar, evaluar, considerar, ampliar,
   profundizar, validar).
2. Objeto concreto de la recomendación.
3. Justificación breve (1 oración).

Modelo:
"**Primera recomendación** — Validar la cuota de mercado proyectada
mediante un piloto comercial de 90 días antes de comprometer la
inversión total, con el fin de ajustar el plan financiero con datos
reales del mercado."

## Prohibiciones específicas

PROHIBIDO en Conclusiones:
- Conclusiones genéricas tipo "el proyecto es viable" sin números.
- Conclusiones que no se conectan con ningún objetivo específico.
- Repetir literal el contenido de los capítulos.
- Introducir información NUEVA que no apareció en el cuerpo.

PROHIBIDO en Recomendaciones:
- Recomendaciones triviales: "se recomienda hacer un buen marketing".
- Recomendaciones sin sujeto claro (a quién va dirigida).
- Recomendaciones que ya estaban implementadas en el cuerpo.

## Auto-verificación antes de devolver

- [ ] Una conclusión por cada objetivo específico (mínimo 4).
- [ ] Conclusión final con VAN, TIR, B/C, Payback y veredicto de viabilidad.
- [ ] Si hubo hipótesis, conclusión sobre confirmación/refutación.
- [ ] Mínimo 6 recomendaciones, balance operativas/académicas.
- [ ] Tercera persona impersonal, sin voseo.
- [ ] Sin información nueva no fundamentada en el cuerpo.

## Salida esperada

# CONCLUSIONES

[párrafo introductorio]

**Primera conclusión** — [...]

**Segunda conclusión** — [...]

**Tercera conclusión** — [...]

**Cuarta conclusión** — [...]

**Quinta conclusión** — [...]

**Conclusión general de viabilidad** — [cifras y veredicto]

# RECOMENDACIONES

[párrafo introductorio]

**Primera recomendación** — [...]

**Segunda recomendación** — [...]

**Tercera recomendación** — [...]

[...]
`;

export const PROMPT_UNIFRANZ_CONCLUSIONES_RECOMENDACIONES = buildPromptUnifranz(CUERPO);
