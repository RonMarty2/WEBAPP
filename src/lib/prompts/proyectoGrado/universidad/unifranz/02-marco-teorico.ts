/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CAPÍTULO I — MARCO TEÓRICO — UNIFRANZ Proyecto de Grado
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Guía UNIFRANZ 2017, sección 4.2.1 (pág. 16) — diagrama del Proyecto de
 * Grado Pre-Factibilidad. El Marco Teórico es el primer capítulo del cuerpo
 * después de la INTRODUCCIÓN.
 *
 * Función: "Presentación estructurada de los hallazgos de la revisión
 *           bibliográfica, describiendo las teorías, modelos, conceptos
 *           y otros que fundamentan teóricamente la propuesta."
 *
 * Anti-error: el PDF reprobado tenía un Marco Teórico de 27 páginas con
 * UNA SOLA fuente (Meredith & Mantel, 2020). Inaceptable.
 * Este prompt obliga a 15+ fuentes diversas, balance 60% generalidades
 * + 40% específico del sector de la propuesta.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { buildPromptUnifranz } from "./00-reglas-comunes";

const CUERPO = `
# FASE: CAPÍTULO I — MARCO TEÓRICO (UNIFRANZ Proyecto de Grado)

## Extensión y formato
- 25 a 40 páginas en formato UNIFRANZ (Verdana 10, interlineado 1.5).
- El título del capítulo: "CAPITULO I — MARCO TEÓRICO"
  (Verdana 14, MAYÚSCULAS, negrita, centrado en página propia).
- Numeración interna de secciones: 1.1, 1.2, 1.3... 1.n
  Sub-secciones: 1.1.1, 1.1.2... y así (no exceder 4 niveles).

## Propósito del capítulo
Construir el sustento teórico que respalda CADA decisión metodológica y
estratégica que se tomará en los capítulos II y III. NO es un compendio
genérico de gestión de proyectos — es la base conceptual del proyecto
específico del estudiante.

## Estructura obligatoria del Marco Teórico

### Sección A — Conceptos base del tipo de proyecto (≈ 30% del capítulo)
Aquí van las teorías generales que aplican a cualquier proyecto de
inversión de la modalidad elegida. Por ejemplo, para Pre-Factibilidad:

1.1. Proyecto de Inversión
   1.1.1. Definición
   1.1.2. Ciclo de vida del proyecto
   1.1.3. Componentes de un proyecto de inversión

1.2. Estudio de Pre-Factibilidad
   1.2.1. Definición y objetivos
   1.2.2. Diferencia entre perfil, pre-factibilidad y factibilidad
   1.2.3. Estructura metodológica

1.3. Plan de Negocios
   1.3.1. Definición y propósito
   1.3.2. Estructura general
   1.3.3. Diferencia entre plan de negocios y estudio de pre-factibilidad

REGLA: usar al menos 3 autores distintos en estas secciones (no repetir
siempre el mismo autor). Combinar autores latinoamericanos con
internacionales.

### Sección B — Herramientas de análisis aplicadas (≈ 30% del capítulo)
Aquí se fundamentan las herramientas que se usarán en CAPÍTULO II
(Investigación) y CAPÍTULO III (Plan Estratégico):

1.4. Análisis del Macroentorno
   1.4.1. Análisis PESTEL — definición, dimensiones, autor original
   1.4.2. Análisis del entorno político y económico
   1.4.3. Matriz EFE (Evaluación de Factores Externos)

1.5. Análisis del Microentorno
   1.5.1. Cinco Fuerzas Competitivas de Porter — origen y aplicación
   1.5.2. Análisis de competidores
   1.5.3. Matriz EFI (Evaluación de Factores Internos)

1.6. Investigación de Mercado
   1.6.1. Tipos de investigación (exploratoria, descriptiva, correlacional)
   1.6.2. Población, muestra y muestreo
   1.6.3. Instrumentos de recolección (encuesta, entrevista, observación)
   1.6.4. Análisis estadístico básico

1.7. Estructura Organizacional
   1.7.1. Tipos de estructura (funcional, divisional, matricial)
   1.7.2. Manuales y procesos
   1.7.3. Reclutamiento y selección

1.8. Marketing y Marketing Mix
   1.8.1. Segmentación de mercado
   1.8.2. Las 4 P del Marketing (Producto, Precio, Plaza, Promoción)
   1.8.3. Marca, imagen y posicionamiento

1.9. Evaluación Financiera de Proyectos
   1.9.1. Inversión inicial: fija, diferida, capital de trabajo
   1.9.2. Flujo de caja (con y sin financiamiento)
   1.9.3. Valor Actual Neto (VAN)
   1.9.4. Tasa Interna de Retorno (TIR)
   1.9.5. Relación Beneficio/Costo (B/C)
   1.9.6. Período de recuperación de la inversión
   1.9.7. TREMA / WACC — concepto y cálculo
   1.9.8. Análisis de sensibilidad

### Sección C — Marco teórico ESPECÍFICO del sector (≈ 40% del capítulo)
⚠️ AQUÍ es donde el PDF reprobado falló. Solo dedicaba 4 páginas al sector
veterinario al final, y 27 páginas al "marco teórico genérico" de proyectos.
UNIFRANZ exige BALANCE: el sector específico debe pesar mínimo 40%.

Estructura sugerida (adaptar al sector del proyecto del estudiante):

1.10. Marco teórico específico del sector  [renombrar al sector real]
   1.10.1. Definición y caracterización del sector
   1.10.2. Cadena de valor del sector
   1.10.3. Productos / servicios del sector
   1.10.4. Tendencias del sector a nivel global y boliviano
   1.10.5. Normativa y regulación específica del sector
   1.10.6. Antecedentes históricos del sector en Bolivia

EJEMPLOS de adaptación:
- Si proyecto = clínica veterinaria → 1.10 = "Industria veterinaria
  y cuidado de mascotas".
- Si proyecto = restaurante → 1.10 = "Sector gastronómico y
  alimentos preparados".
- Si proyecto = empresa de software → 1.10 = "Industria del software
  y servicios tecnológicos".

## Citación y volumen de fuentes

REGLAS OBLIGATORIAS:
- MÍNIMO 15 fuentes distintas en TODO el Marco Teórico.
- NINGÚN concepto clave (PESTEL, Porter, VAN, TIR, Marketing Mix) debe
  citar solo un autor. Cada concepto fuerte = al menos 2 autores que lo
  respaldan o lo discuten.
- Distribuir fuentes:
    > 30% libros académicos clásicos (Kotler, Porter, Sapag, Baca Urbina)
    > 30% literatura latinoamericana / boliviana (SciELO, repositorios)
    > 20% fuentes institucionales bolivianas (INE, BCB, cámaras sectoriales)
    > 20% recursos electrónicos verificables con URL completa

- Aplicar el sistema de citas APA UNIFRANZ (revisar 00-reglas-comunes):
    > Cita textual corta: cursiva + comillas + (Apellido, año, p. X)
    > Cita larga: párrafo aparte, sangría doble, sin comillas, cursiva
    > Paráfrasis: (Apellido, año) sin página
    > Institución: (INE, 2023)

PROHIBIDO ABSOLUTO:
- Repetir el mismo autor en más de 3 secciones distintas.
- "Marco Teórico Frankenstein": copiar definiciones largas sin
  argumento del autor del proyecto.
- Definiciones sin contexto: cada cita debe tener antes una oración
  argumental y después un comentario propio.
- Patrón obligatorio en citas largas:
    Oración Principal → Oración Argumental → Cita → Oración Conclusiva.

## Estructura interna de cada apartado

Cada sección 1.X.Y debe seguir el patrón pedagógico:

1. **Apertura conceptual** (1-2 párrafos)
   Definición operativa del concepto, por qué importa en este proyecto.

2. **Desarrollo teórico** (2-4 párrafos)
   Diferentes perspectivas o variantes del concepto, con citas APA.
   Incluir al menos UNA cita textual o larga por concepto fuerte.

3. **Vinculación con el proyecto** (1 párrafo)
   Cómo este concepto se aplicará concretamente en los capítulos II o III
   del presente proyecto. Esta es la pieza que UNIFRANZ valora
   especialmente — el aporte del autor del documento.

## Auto-verificación antes de devolver

- [ ] Numeración consistente 1.1 → 1.10, sin saltos ni repeticiones.
- [ ] Cada concepto fuerte tiene mínimo 2 fuentes distintas.
- [ ] Mínimo 15 fuentes APA verificables en total.
- [ ] Balance: 30% conceptos base + 30% herramientas + 40% sector específico.
- [ ] Cero fuentes inventadas (re-leer regla anti-alucinación).
- [ ] Tercera persona impersonal en todo el capítulo.
- [ ] Apellidos en minúscula en las referencias (norma UNIFRANZ).
- [ ] Patrón "Oración Principal → Argumental → Cita → Conclusiva" en
       cada cita textual o larga.

## Salida esperada

Markdown estructurado:

# CAPÍTULO I — MARCO TEÓRICO

## 1.1. [Primer concepto base]
### 1.1.1. [...]
### 1.1.2. [...]

## 1.2. [...]
...

## 1.10. [Sector específico del proyecto]
### 1.10.1. [...]

NO incluir bibliografía consolidada al final — eso va en el capítulo
de Bibliografía del documento. Aquí solo van las citas in-text APA.
`;

export const PROMPT_UNIFRANZ_MARCO_TEORICO = buildPromptUnifranz(CUERPO);
