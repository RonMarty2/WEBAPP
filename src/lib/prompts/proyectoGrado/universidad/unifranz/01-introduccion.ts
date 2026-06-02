/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INTRODUCCIÓN — UNIFRANZ Proyecto de Grado
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Guía UNIFRANZ 2017, sección 2.2.1 (pág. 6) y diagrama sección 4.2 (pp. 16-19).
 *
 * La INTRODUCCIÓN del Proyecto de Grado UNIFRANZ contiene 5 secciones
 * obligatorias (numeradas con arábigos 1-5), antes del CAPÍTULO I:
 *
 *   1. Planteamiento del Problema
 *   2. Justificación  (5 sub: Práctica, Económica, Social, Legal, Teórica)
 *   3. Objetivos      (General + Específicos)
 *   4. Alcances       (Temático, Temporal, Espacial)
 *   5. Hipótesis      (Variables Independiente, Dependiente, Intercurrente)
 *      — Solo si la modalidad lo amerita (en Tesis siempre, en Proyecto opcional)
 *
 * Esta INTRODUCCIÓN reemplaza al "Capítulo I" de otras universidades
 * (UMSS, UCATEC). El CAPÍTULO I de UNIFRANZ es el Marco Teórico.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { buildPromptUnifranz } from "./00-reglas-comunes";

const CUERPO = `
# FASE: INTRODUCCIÓN — Proyecto de Grado UNIFRANZ

## Ubicación y extensión
- Va al inicio del CUERPO del documento, después de los Preliminares.
- La INTRODUCCIÓN es un BLOQUE — NO se etiqueta como "Capítulo I".
- Extensión total: 10 a 18 páginas en formato UNIFRANZ (Verdana 10, 1.5).
- La primera página del cuerpo (con la palabra "INTRODUCCIÓN") es la
  página 1 del documento en numeración arábiga.

## Estructura EXACTA (5 secciones, numeración arábiga)

### Preámbulo (sin numerar, sin subtítulo)
Uno o dos párrafos iniciales que:
- Presentan el tema general del proyecto.
- Sitúan al lector en el sector y contexto del estudio.
- Anticipan brevemente cómo se organiza el documento por capítulos.
- NO adelantan objetivos, planteamiento formal ni hipótesis.

## 1. Planteamiento del Problema

Extensión: 3 a 5 párrafos densos (1.5 a 2.5 páginas).

Estructura obligatoria del contenido:

a) **Contexto del problema** (1-2 párrafos)
   - Qué ocurre actualmente en el sector / mercado / institución.
   - Quiénes son los afectados y en qué magnitud.
   - Cifras de respaldo: al menos 2 datos verificables citados
     (INE, BCB, ministerios, cámaras empresariales).

b) **Causas estructurales** (1 párrafo)
   - Factores que originan el problema (no síntomas).
   - Si aplica, jerarquía: causa raíz → consecuencias intermedias →
     consecuencia visible.

c) **Pronóstico si no se atiende** (1 párrafo)
   - Qué pasa si el problema persiste (sin tono alarmista).
   - Costo de oportunidad de no actuar.

d) **Formulación del problema** (cierre)
   - Una pregunta científica de investigación clara y delimitada
     en una sola oración, o un enunciado de problema formal.
   - Modelo: "¿Es factible la implementación de [propuesta]
     en [contexto geográfico] durante [horizonte temporal] que
     atienda la [necesidad cuantificada]?"

REGLAS de planteamiento UNIFRANZ:
- El problema NO se formula como "inexistencia" de algo.
  Mal: "No existe una clínica veterinaria integral en Cochabamba".
  Bien: "Existe una demanda insatisfecha de servicios veterinarios
        integrales en Cochabamba, evidenciada por X cifra".
- Mínimo 3 fuentes APA verificables en esta sección.

## 2. Justificación

Párrafo introductorio breve (1-2 oraciones) explicando POR QUÉ se
justifica abordar el estudio. Luego desarrolla las CINCO sub-justificaciones
obligatorias UNIFRANZ (en este orden exacto):

### 2.1. Justificación Práctica
Dos párrafos. Aporte concreto y aplicable del estudio:
- A quién resuelve un problema operativo o de gestión.
- Qué decisión informa el documento.
- Qué proceso o realidad transforma si se ejecuta la propuesta.
Es la justificación más cercana al "para qué sirve el documento HOY".

### 2.2. Justificación Económica
Dos párrafos. Aporte económico medible:
- Ahorro proyectado (si aplica): cifras o rangos defendibles.
- Generación de ingresos o empleo directo / indirecto.
- Retorno sobre inversión potencial o eficiencia productiva.
- Valor agregado al sector económico relevante.
Al menos una cifra concreta (puede ser estimación claramente marcada).

### 2.3. Justificación Social
Dos párrafos. Impacto en la sociedad o grupo beneficiario:
- Cobertura cuantificada de beneficiarios (n° de familias, hogares,
  pacientes, estudiantes, empresas).
- Mejora esperada en indicadores sociales (calidad de servicio,
  acceso, equidad, salud, educación).
- Contribución a Objetivos de Desarrollo Sostenible (ODS) cuando aplique.
PROHIBIDO: justificación social de 2 líneas "ayudará a la comunidad".
Debe ser sustantiva (mínimo 6-8 líneas).

### 2.4. Justificación Legal
Dos párrafos. Marco normativo que valida y soporta el proyecto:
- Leyes bolivianas aplicables al sector (Código de Comercio,
  Ley General del Trabajo, Ley 1333 de Medio Ambiente, Ley 453
  del Consumidor, sectoriales: SENASAG, Ley de Telecomunicaciones,
  Ley de Inversiones, etc.).
- Reglamentos municipales o sectoriales relevantes.
- Registros obligatorios que el proyecto debe cumplir (FUNDEMPRESA,
  SIN, Caja Nacional de Salud, AFP, gobierno municipal).
- Citar leyes por número y año, NUNCA inventar normativa.

### 2.5. Justificación Teórica
Dos párrafos. Aporte académico:
- Ampliación o validación empírica de modelos / teorías existentes.
- Brecha en literatura local boliviana que el estudio cubre.
- Confirmación o refutación de hipótesis previas en estudios similares.
- Cita al menos UN referente teórico clave del área en formato APA.

## 3. Objetivos

Párrafo introductorio (1 oración) anunciando los objetivos.

### 3.1. Objetivo General
UN solo objetivo. Estructura sintáctica:
[Verbo en infinitivo] + [variable/objeto] + [propósito] + [contexto geográfico/temporal]

Verbos VÁLIDOS UNIFRANZ:
analizar, determinar, evaluar, diseñar, proponer, desarrollar,
elaborar, formular, plantear, identificar, diagnosticar.

Verbos PROHIBIDOS por vagos:
estudiar, conocer, ver, mirar, revisar, entender, considerar.

Modelo:
"Elaborar un Estudio de Pre-Factibilidad para la creación de una
[entidad/empresa] en [ciudad/región], durante el período [año-año],
mediante la aplicación de [metodología principal] que permita
determinar la [variable clave a medir]."

### 3.2. Objetivos Específicos
ENTRE 4 Y 6 objetivos específicos, en lista numerada.
Cada uno:
- Comienza con verbo en infinitivo (mismo nivel sintáctico que el general).
- Es una etapa concreta para alcanzar el objetivo general.
- Es medible, verificable, alcanzable en el alcance temporal.
- Se conecta lógicamente con un capítulo o sección del cuerpo.
- NO debe repetir el objetivo general parafraseado.

DISTRIBUCIÓN sugerida (proyecto pre-factibilidad):
1. Construir el Marco Teórico que sustenta la propuesta.
2. Realizar el análisis del macroentorno (PESTEL).
3. Realizar el análisis del microentorno (5 Fuerzas de Porter).
4. Determinar la demanda insatisfecha mediante estudio de mercado.
5. Diseñar la estructura organizacional, técnica y de marketing.
6. Evaluar la viabilidad financiera (VAN, TIR, B/C, sensibilidad).

PROHIBIDO:
- Solo 3 objetivos específicos (el PDF reprobado tenía 3 — inaceptable).
- Repetir el objetivo general con palabras distintas.
- Objetivos del tipo "Realizar un estudio de mercado" sin más detalle.

## 4. Alcances

Párrafo breve introductorio. Luego desarrollar las tres dimensiones:

### 4.1. Alcance Temático
Un párrafo (mínimo 6 líneas). Define las dimensiones conceptuales que SÍ
aborda el proyecto Y las que NO (delimitación expresa).
Modelo:
"El presente proyecto abordó las temáticas de [planificación
estratégica, investigación de mercados, planificación financiera,
estructura organizacional, marketing mix]. NO se profundiza en
[ej. aspectos macroeconómicos de país, política monetaria,
ingeniería de detalle de equipos] por exceder el alcance académico
de un Proyecto de Grado de pregrado."

### 4.2. Alcance Temporal
Un párrafo. Aquí hay DOS dimensiones que NO deben confundirse:

a) Periodo de elaboración del trabajo académico
   (ej.: marzo 2025 a septiembre 2025).

b) Horizonte de análisis y proyección del proyecto en sí
   (ej.: análisis financiero proyectado a 5 años, evaluación
   sobre datos sectoriales 2020-2024).

⚠️ El PDF reprobado confundió ambos diciendo "Alcance temporal: 6 meses",
hablando solo del tiempo del trabajo. UNIFRANZ exige clarificar AMBOS.

### 4.3. Alcance Espacial
Un párrafo. Ámbito geográfico del estudio:
- País → Departamento → Provincia → Municipio → Distrito (si aplica).
- Justificar por qué se eligió esa delimitación.
- Si el proyecto es a nivel macro, indicar país y región.
- Si es micro, indicar barrio o zona específica con coordenadas
  aproximadas o referencias cruzadas (avenidas, puntos cardinales).
- Adjuntar mapa de referencia se hace en cuerpo, NO en alcance espacial.

## 5. Hipótesis  (incluir SOLO si el contexto del proyecto lo amerita)

⚠️ Para PROYECTO DE GRADO en modalidad PRE-FACTIBILIDAD, la hipótesis
es OPCIONAL según la guía UNIFRANZ 2017 (la guía la marca como
"En caso de Tesis"). Si el estudiante decide incluirla, la estructura es:

### 5.1. Hipótesis General
Una proposición DECLARATIVA (no pregunta) contrastable con datos.
Estructura modelo:
"Si [condición / variable independiente], entonces [efecto / variable
dependiente] en [contexto delimitado]."

### 5.2. Variable Independiente
- Nombre.
- Definición conceptual (1 línea).
- Indicadores propuestos para su medición.

### 5.3. Variable Dependiente
- Nombre.
- Definición conceptual (1 línea).
- Indicadores propuestos para su medición.

### 5.4. Variable Intercurrente (ESPECÍFICA UNIFRANZ)
La guía UNIFRANZ 2017 reconoce explícitamente esta tercera categoría
de variable (poco común en otras universidades). Es la variable que
"interviene" entre la independiente y la dependiente, modulando el efecto.
- Nombre.
- Definición conceptual.
- Cómo se controla o se asume.

## CIERRE DE INTRODUCCIÓN

Después de la sección 5 (o 4 si no hay hipótesis), un párrafo breve que
introduce los capítulos del cuerpo y anuncia qué va en cada uno.

## Auto-verificación antes de devolver

ANTES de devolver el contenido, verifica que:
- [ ] Hay las 5 secciones numeradas correctamente (1, 2, 3, 4, 5).
- [ ] Las 5 sub-justificaciones están: Práctica, Económica, Social, Legal, Teórica.
- [ ] Hay entre 4 y 6 objetivos específicos (NO 3).
- [ ] El objetivo general tiene verbo válido en infinitivo.
- [ ] El alcance temporal distingue periodo de trabajo vs horizonte proyecto.
- [ ] Mínimo 3 fuentes APA en planteamiento del problema.
- [ ] Cero cifras inventadas; cero leyes inventadas.
- [ ] Tercera persona impersonal en todo el bloque.
- [ ] Sin voseo argentino.

Si algún punto falla, regenerar antes de devolver.

## Salida esperada

Devuelve únicamente el contenido en markdown con la jerarquía:

# INTRODUCCIÓN

[preámbulo]

## 1. Planteamiento del Problema
[contenido]

## 2. Justificación
[contenido]

### 2.1. Justificación Práctica
### 2.2. Justificación Económica
### 2.3. Justificación Social
### 2.4. Justificación Legal
### 2.5. Justificación Teórica

## 3. Objetivos
### 3.1. Objetivo General
### 3.2. Objetivos Específicos

## 4. Alcances
### 4.1. Alcance Temático
### 4.2. Alcance Temporal
### 4.3. Alcance Espacial

## 5. Hipótesis  (solo si aplica)
### 5.1. Hipótesis General
### 5.2. Variable Independiente
### 5.3. Variable Dependiente
### 5.4. Variable Intercurrente

[párrafo de cierre que conecta con los capítulos]
`;

export const PROMPT_UNIFRANZ_INTRODUCCION = buildPromptUnifranz(CUERPO);
