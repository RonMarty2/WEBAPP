/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CAPÍTULO II — INVESTIGACIÓN — UNIFRANZ Proyecto de Grado (Pre-Factibilidad)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Guía UNIFRANZ 2017, sección 4.2.1 (pág. 16). Para modalidad Estudio de
 * Pre-Factibilidad para Oportunidad de Inversión, el Capítulo II contiene:
 *
 *   2.1. Análisis del Macroentorno
 *   2.2. Análisis del Microentorno
 *   2.3. Análisis Matricial
 *   2.4. Metodología de Investigación
 *   2.5. Estudio de Mercado
 *
 * Anti-errores específicos del PDF reprobado que este prompt previene:
 *  - "PORTER (Interno)" mal etiquetado → Porter es EXTERNO competitivo.
 *  - Orden mezclado PESTEL → MEFE → PORTER → MEFI → debe ser PESTEL → PORTER → MEFE → MEFI → FODA.
 *  - "Marketing dentro de Estructura Organizacional" — Marketing va en CAP III.
 *  - Tablas y gráficos con numeración rota o títulos inconsistentes.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { buildPromptUnifranz } from "./00-reglas-comunes";

const CUERPO = `
# FASE: CAPÍTULO II — INVESTIGACIÓN (UNIFRANZ Proyecto de Grado Pre-Factibilidad)

## Extensión y formato
- 35 a 55 páginas en formato UNIFRANZ (Verdana 10, interlineado 1.5).
- Título del capítulo: "CAPITULO II — INVESTIGACIÓN"
  (Verdana 14, MAYÚSCULAS, negrita, centrado en página propia).
- Numeración interna: 2.1, 2.2, 2.3, 2.4, 2.5 (subniveles hasta 2.X.Y.Z).
- Toda tabla y gráfico de este capítulo se numera SECUENCIALMENTE
  desde 1, sin saltos ni repeticiones.

## Estructura EXACTA (5 secciones obligatorias UNIFRANZ)

═══════════════════════════════════════════════════════════════
## 2.1. Análisis del Macroentorno
═══════════════════════════════════════════════════════════════

Es el análisis del entorno EXTERNO al sector. Estudia variables
fuera del control del proyecto pero que lo impactan estructuralmente.

### 2.1.1. Análisis PESTEL
Las 6 dimensiones del macroentorno, EN ESTE ORDEN:

a) **Político**: gobierno, estabilidad política, políticas sectoriales,
   acuerdos bilaterales, riesgo país.
b) **Económico**: PIB, inflación, tasas de interés, tipo de cambio,
   ingreso per cápita, ciclo económico.
c) **Social**: demografía, distribución de edad, niveles de educación,
   urbanización, hábitos de consumo, valores culturales.
d) **Tecnológico**: innovación, infraestructura tecnológica nacional,
   penetración de internet/móvil, automatización del sector.
e) **Ecológico (Ambiental)**: regulación ambiental, cambio climático,
   sostenibilidad, certificaciones verdes aplicables.
f) **Legal**: leyes específicas del sector, regulación laboral,
   tributaria, defensa del consumidor, normas técnicas.

Cada dimensión = 1 a 2 párrafos densos con CIFRAS oficiales recientes
de fuentes bolivianas verificables (INE, BCB, ASFI, ministerios).

CIERRE: tabla resumen "Análisis PESTEL" con 3 columnas:
| Factor | Oportunidad / Amenaza | Impacto (Alto/Medio/Bajo) |

### 2.1.2. Matriz EFE (Evaluación de Factores Externos)
Tabla con columnas:
| Factor crítico | Peso (0-1) | Calificación (1-4) | Puntaje ponderado |

- Pesos suman 1.00 exacto.
- Calificación: 4 = respuesta superior, 3 = arriba del promedio,
  2 = promedio, 1 = pobre.
- Puntaje total > 2.5 = sector ofrece oportunidades netas favorables.
- Mínimo 8 factores entre oportunidades y amenazas.

═══════════════════════════════════════════════════════════════
## 2.2. Análisis del Microentorno
═══════════════════════════════════════════════════════════════

⚠️ CRÍTICO: el microentorno NO es "el entorno interno de la empresa".
El microentorno es el entorno COMPETITIVO INMEDIATO del sector.
Confundirlo con el entorno interno (que es Cadena de Valor o MEFI)
es uno de los errores más comunes que reprueba un Proyecto de Grado.

### 2.2.1. Cinco Fuerzas Competitivas de Porter
Las 5 fuerzas EN ESTE ORDEN, cada una con su propio análisis textual:

1. **Poder de negociación de los clientes (compradores)**
   - Concentración del mercado de compradores.
   - Sensibilidad al precio.
   - Costo de cambio para el cliente.
   - Información disponible para el comprador.
   - Calificación final: ALTO / MEDIO / BAJO con justificación.

2. **Poder de negociación de los proveedores**
   - Número y concentración de proveedores.
   - Diferenciación de insumos.
   - Costo de cambio entre proveedores.
   - Amenaza de integración hacia adelante de los proveedores.
   - Calificación: ALTO / MEDIO / BAJO.

3. **Amenaza de nuevos entrantes**
   - Barreras de entrada (capital, normativa, tecnología, marca).
   - Economías de escala existentes.
   - Acceso a canales de distribución.
   - Políticas gubernamentales que protegen el sector.
   - Calificación: ALTA / MEDIA / BAJA.

4. **Amenaza de productos o servicios sustitutos**
   - Disponibilidad de sustitutos cercanos.
   - Precio y desempeño de los sustitutos.
   - Costo de cambio al sustituto.
   - Tendencia del mercado hacia sustitutos.
   - Calificación: ALTA / MEDIA / BAJA.

5. **Rivalidad entre competidores actuales**
   - Número de competidores y concentración.
   - Tasa de crecimiento del sector.
   - Diferenciación entre competidores.
   - Barreras de salida.
   - Calificación: ALTA / MEDIA / BAJA.

CIERRE: tabla resumen "Matriz 5 Fuerzas de Porter":
| Fuerza | Calificación | Implicación estratégica |

### 2.2.2. Análisis de Competidores Directos
Identificación de mínimo 3 competidores directos en la zona geográfica
del proyecto. Por cada competidor:
- Nombre comercial (si es público) o identificación genérica.
- Tamaño aproximado.
- Posicionamiento.
- Fortalezas y debilidades aparentes.

PROHIBIDO: inventar nombres comerciales de competidores que no existen.
Si no hay info verificable, usar codificación: "Competidor A", "Competidor B".

### 2.2.3. Matriz EFI (Evaluación de Factores Internos)
Tabla con columnas:
| Factor crítico interno | Peso (0-1) | Calificación (1-4) | Puntaje ponderado |

- Pesos suman 1.00.
- Calificación: 4 = fortaleza mayor, 3 = fortaleza menor,
  2 = debilidad menor, 1 = debilidad mayor.
- Mínimo 8 factores entre fortalezas y debilidades.

═══════════════════════════════════════════════════════════════
## 2.3. Análisis Matricial (Síntesis estratégica)
═══════════════════════════════════════════════════════════════

### 2.3.1. Matriz FODA (Estratégico)
Tabla 2x2:
|              | OPORTUNIDADES | AMENAZAS |
|--------------|---------------|----------|
| FORTALEZAS   | Estrategias FO (Maxi-Maxi) | Estrategias FA (Maxi-Mini) |
| DEBILIDADES  | Estrategias DO (Mini-Maxi) | Estrategias DA (Mini-Mini) |

Cada cuadrante debe listar mínimo 2 estrategias concretas (no genéricas).

### 2.3.2. Identificación de Estrategias Genéricas
Definir cuál estrategia genérica de Porter aplicará el proyecto:
- Liderazgo en costos.
- Diferenciación.
- Enfoque (en costos o en diferenciación).

Justificar la elección con base en la matriz FODA y los análisis previos.

═══════════════════════════════════════════════════════════════
## 2.4. Metodología de Investigación
═══════════════════════════════════════════════════════════════

### 2.4.1. Tipo de Investigación
Especificar y justificar:
- Por su finalidad: aplicada / pura.
- Por su nivel de profundidad: exploratoria / descriptiva / correlacional /
  explicativa.
- Por el enfoque: cuantitativo / cualitativo / mixto.
- Por su temporalidad: transversal / longitudinal.

### 2.4.2. Método de Investigación
Indicar método principal:
- Deductivo, inductivo, analítico, sintético, comparativo, histórico.
Justificar la elección en función del objeto de estudio.

### 2.4.3. Diseño de Investigación
- Experimental, no experimental, cuasi-experimental.

### 2.4.4. Población y Muestra
- Definir POBLACIÓN: universo, ubicación, características.
- Calcular MUESTRA con fórmula explícita:
    Para población conocida (N < 100,000):
       n = (Z² · p · q · N) / (e² · (N-1) + Z² · p · q)
    Donde:
       Z = nivel de confianza (1.96 para 95%)
       p = probabilidad de éxito (0.5 si se desconoce)
       q = 1 - p
       e = margen de error (5% típico)
       N = tamaño de población
- Mostrar cálculo paso a paso, no solo el resultado.
- Indicar técnica de muestreo: probabilístico (aleatorio simple,
  estratificado, por conglomerados) o no probabilístico (por
  conveniencia, intencional, bola de nieve).

### 2.4.5. Instrumentos de Recolección de Datos
Por cada instrumento usado:
- Tipo (encuesta, entrevista estructurada, observación, etc.).
- Estructura general (cantidad de preguntas, tipo de escalas).
- Forma de aplicación (presencial, online, telefónica).
- Periodo de aplicación.

═══════════════════════════════════════════════════════════════
## 2.5. Estudio de Mercado
═══════════════════════════════════════════════════════════════

### 2.5.1. Diseño y Aplicación de la Encuesta
- Cantidad de encuestas aplicadas.
- Periodo y lugar de aplicación.
- Perfil de los encuestados (edad, género, distrito si aplica).
- Reproducir el cuestionario completo en este capítulo o referenciar
  al Anexo correspondiente.

### 2.5.2. Análisis de Resultados de la Encuesta
Por cada pregunta:
- Gráfico (pie, barras o columnas según corresponda).
- Tabla de frecuencias.
- Interpretación en texto (mínimo 1 párrafo).
- Numeración secuencial GRÁFICO N° X y TABLA N° X.

### 2.5.3. Determinación de la Demanda
- Demanda potencial = % población objetivo × tamaño total de la población.
- Demanda real = demanda potencial × frecuencia de consumo.
- Demanda insatisfecha = demanda real − oferta actual estimada.

### 2.5.4. Determinación de la Oferta
- Oferta actual del mercado: identificación de competidores y su
  capacidad estimada.
- Proyección de la oferta para el horizonte del proyecto.

### 2.5.5. Demanda Insatisfecha y Cuota de Mercado
- Cuantificación clara: Demanda insatisfecha − Cuota objetivo del proyecto.
- Cuota objetivo: % defendible (no inventar 100% del mercado).

### 2.5.6. Proyección de la Demanda
- Horizonte: igual al horizonte financiero del proyecto (típicamente 5 años).
- Método de proyección (regresión lineal, tasa de crecimiento simple).

### 2.5.7. Conclusiones del Estudio de Mercado
- Síntesis cuantitativa de hallazgos.
- Decisión sobre si el proyecto enfrenta demanda suficiente o no.

## Reglas anti-PDF-reprobado

PROHIBIDO en este capítulo:
- Etiquetar Porter como "(Interno)" — Porter es EXTERNO competitivo.
- Poner MEFE entre PESTEL y PORTER — el orden es PESTEL → PORTER → MEFE → MEFI.
- Tablas con numeración rota o repetida.
- Gráficos sin "Fuente:" al pie.
- Encuestas sin tamaño de muestra calculado con fórmula.
- Conclusiones de mercado sin cifras de demanda y oferta.

## Auto-verificación antes de devolver

- [ ] Las 5 secciones en orden: 2.1 → 2.2 → 2.3 → 2.4 → 2.5.
- [ ] PESTEL antes que Porter (no al revés).
- [ ] Porter etiquetado como análisis EXTERNO (microentorno competitivo).
- [ ] MEFE después de PESTEL/PORTER, MEFI después.
- [ ] FODA con 4 cuadrantes y estrategias FO/FA/DO/DA.
- [ ] Cálculo de muestra con fórmula explícita paso a paso.
- [ ] Numeración de tablas y gráficos secuencial desde 1 sin saltos.
- [ ] Cada tabla y cada gráfico con "Fuente:" al pie.
- [ ] Cero cifras inventadas; cifras vienen de INE/BCB/ASFI/encuesta real.
- [ ] Tercera persona impersonal sin voseo.

## Salida esperada

# CAPÍTULO II — INVESTIGACIÓN

## 2.1. Análisis del Macroentorno
### 2.1.1. Análisis PESTEL
### 2.1.2. Matriz EFE

## 2.2. Análisis del Microentorno
### 2.2.1. Cinco Fuerzas Competitivas de Porter
### 2.2.2. Análisis de Competidores Directos
### 2.2.3. Matriz EFI

## 2.3. Análisis Matricial
### 2.3.1. Matriz FODA Estratégico
### 2.3.2. Identificación de Estrategias Genéricas

## 2.4. Metodología de Investigación
### 2.4.1. Tipo de Investigación
### 2.4.2. Método de Investigación
### 2.4.3. Diseño de Investigación
### 2.4.4. Población y Muestra
### 2.4.5. Instrumentos de Recolección de Datos

## 2.5. Estudio de Mercado
### 2.5.1. Diseño y Aplicación de la Encuesta
### 2.5.2. Análisis de Resultados de la Encuesta
### 2.5.3. Determinación de la Demanda
### 2.5.4. Determinación de la Oferta
### 2.5.5. Demanda Insatisfecha y Cuota de Mercado
### 2.5.6. Proyección de la Demanda
### 2.5.7. Conclusiones del Estudio de Mercado
`;

export const PROMPT_UNIFRANZ_INVESTIGACION = buildPromptUnifranz(CUERPO);
