/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SEED DEMO — Sistema IoT de Monitoreo de Calidad del Aire en Aulas
 *             (UNIFRANZ · Proyecto de Grado · Diseño de Artefacto)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * SERVER-ONLY. Contenido generado fase por fase simulando llamadas a la API
 * de IA con contexto creciente.
 *
 * Caso: diseño de un artefacto IoT (hardware + software) que monitorea la
 * calidad del aire en aulas universitarias y dispara alertas cuando los
 * parámetros (CO2, partículas finas, temperatura, humedad) exceden umbrales
 * saludables. Hay prototipo construido y validado en un aula real.
 *
 * IDs: getUnifranzPhases("unifranz-pg-artefacto") → ph-unifranz-pg-artefacto-{slug}
 */

import type { DemoSeed } from "./agrohubDemo";

// ── Fase 1: Resumen ─────────────────────────────────────────────────────────
const RESUMEN = `# RESUMEN DEL TRABAJO

El presente Proyecto de Grado, en su modalidad de Diseño de Artefacto, abordó el diseño, construcción y validación de un sistema IoT de monitoreo de calidad del aire para aulas universitarias en el área urbana del municipio de Cochabamba durante la gestión 2025. El objetivo general consistió en diseñar un artefacto modular y replicable que mida en tiempo real la concentración de dióxido de carbono (CO2), partículas finas (PM2,5), temperatura y humedad relativa, y que emita alertas cuando alguno de estos parámetros exceda los umbrales recomendados por la Organización Mundial de la Salud.

La metodología aplicada combinó investigación tecnológica, diseño de ingeniería y validación empírica. Se levantó el estado del arte de sensores ambientales accesibles, se diseñaron las especificaciones funcionales del sistema, se construyó un prototipo con microcontrolador ESP32 y sensores SCD30 (CO2) y SDS011 (PM2,5), y se validó el prototipo en un aula real de la Facultad de Ingeniería de UNIFRANZ durante un ciclo lectivo de cuatro semanas.

Los resultados de la validación evidenciaron que el sistema detecta correctamente eventos de degradación de la calidad del aire (CO2 por encima de 1000 ppm en períodos de alta ocupación), envía la alerta al servidor en menos de 8 segundos y mantiene un consumo energético compatible con alimentación USB estándar. El costo unitario de fabricación se estimó en Bs. 720, lo que coloca al sistema en un rango accesible para instituciones educativas medianas. La evaluación financiera arrojó un VAN positivo de Bs. 56.480 a tres años para un escenario de fabricación y venta de 200 unidades, sustentando la viabilidad económica del artefacto.
`;

// ── Fase 2: Introducción ────────────────────────────────────────────────────
const INTRODUCCION = `# INTRODUCCIÓN

La calidad del aire interior en aulas universitarias ha sido reconocida en la literatura como un factor que incide directamente sobre el rendimiento cognitivo, la salud respiratoria y el confort de estudiantes y docentes. La acumulación de dióxido de carbono por la respiración en espacios cerrados con baja ventilación, sumada a la presencia de partículas finas de origen exterior (tránsito vehicular, polvo) e interior (mobiliario, productos de limpieza), configura un ambiente sub-óptimo para el aprendizaje que sin embargo no es visible al ojo humano.

El presente Proyecto de Grado abordó el diseño, construcción y validación de un sistema IoT de monitoreo de calidad del aire específicamente pensado para aulas universitarias de Cochabamba. El documento se organiza en una Introducción que delimita el problema, los objetivos y los alcances; un Capítulo I de Marco Teórico que sustenta los conceptos de calidad del aire y arquitectura IoT; un Capítulo II de Investigación con análisis del entorno, microentorno tecnológico, análisis matricial, metodología de investigación y estudio de mercado a instituciones educativas; un Capítulo III de Diseño del Artefacto que detalla especificaciones, planos, construcción del prototipo, validación y evaluación financiera; y conclusiones con recomendaciones.

## 1. Planteamiento del Problema

Las aulas universitarias de Cochabamba operan generalmente con ventilación natural por ventanas y puertas, sin sistemas mecánicos de renovación de aire. En climas templados como el del valle, la práctica habitual es mantener las ventanas cerradas durante las clases para reducir ruido y temperatura, lo que produce acumulación de CO2 cuando el aula tiene ocupación cercana al máximo. Mediciones puntuales realizadas en aulas de la Facultad de Ingeniería de UNIFRANZ durante el bimestre marzo-abril de 2025 arrojaron concentraciones de CO2 entre 1.200 y 2.400 ppm hacia el final de jornadas de tres horas continuas, niveles muy por encima de los 1.000 ppm que la literatura técnica recomienda como umbral máximo para entornos educativos (OMS, 2021).

El problema no es la imposibilidad técnica de medir estos parámetros, dado que existen sensores comerciales disponibles, sino la ausencia de un sistema integrado, accesible y replicable que permita a las instituciones educativas medianas en Bolivia incorporar monitoreo continuo en sus aulas. Los sistemas comerciales importados tienen un costo que supera los Bs. 4.500 por unidad, lo que los coloca fuera del alcance de muchas instituciones. La solución requiere un diseño local que combine sensores comerciales accesibles, microcontrolador económico, conectividad inalámbrica estándar y software propio orientado al caso de uso específico de aulas universitarias.

De mantenerse esta situación, las aulas de las instituciones educativas medianas de la región seguirán operando sin información sobre la calidad del aire que respira la comunidad universitaria, con impacto silencioso sobre el rendimiento cognitivo y la salud respiratoria de estudiantes y docentes. El costo de no actuar se expresa en términos sanitarios y educativos, ambos difíciles de cuantificar pero documentados en la literatura internacional.

En función de lo expuesto, el problema de investigación se formuló de la siguiente manera: ¿Cómo diseñar un sistema IoT de monitoreo de calidad del aire que sea accesible, replicable y técnicamente robusto para su uso en aulas universitarias del área urbana de Cochabamba durante la gestión 2025?

## 2. Justificación

### 2.1. Justificación Práctica

El proyecto entrega un artefacto funcional con planos, código fuente y documentación de construcción, replicable por cualquier institución educativa interesada en monitorear la calidad del aire de sus aulas. La transferencia tecnológica directa es un aporte que rara vez ofrecen los estudios académicos limitados a la dimensión analítica.

### 2.2. Justificación Económica

El costo unitario de Bs. 720 representa una reducción superior al 80% respecto de las alternativas comerciales importadas. Esta diferencia hace viable el equipamiento de un conjunto significativo de aulas con un presupuesto institucional acotado, ampliando la población beneficiaria del monitoreo. La evaluación financiera del Capítulo III demuestra la viabilidad de fabricación y venta del artefacto como producto comercial.

### 2.3. Justificación Social

El monitoreo continuo de la calidad del aire en aulas contribuye a la salud respiratoria y al confort de la comunidad universitaria. El impacto es particularmente relevante en estudiantes con condiciones respiratorias preexistentes (asma, alergias). Adicionalmente, la información generada por el sistema sensibiliza a la comunidad sobre la calidad del aire que comparte y orienta intervenciones de mejora (ventilación, filtros, manejo de la ocupación).

### 2.4. Justificación Legal

El proyecto se enmarca en las regulaciones de la Autoridad de Fiscalización y Control Social de Telecomunicaciones y Transportes (ATT) aplicables a equipos con conectividad inalámbrica, en la normativa boliviana de protección de datos del consumidor cuando el sistema procesa información ambiental institucional, y en las recomendaciones técnicas internacionales (OMS, ASHRAE) sobre calidad del aire interior en edificios públicos. El artefacto se diseñó cumpliendo los estándares de potencia de transmisión inalámbrica aplicables.

### 2.5. Justificación Teórica

El estudio aplica los principios de diseño de sistemas IoT documentados en la literatura técnica (rajkumar, lee, sha, & stankovic, 2010) al contexto específico de la calidad del aire interior, integrando criterios de la literatura en ingeniería ambiental sobre concentraciones de CO2 y partículas (OMS, 2021). Aporta evidencia local sobre la factibilidad técnica y económica de soluciones IoT diseñadas para mercados emergentes.

## 3. Objetivos

### 3.1. Objetivo General

Diseñar, construir y validar un sistema IoT de monitoreo de calidad del aire (CO2, partículas finas, temperatura y humedad) modular y replicable, con un costo unitario inferior a Bs. 1.000, para su uso en aulas universitarias del área urbana de Cochabamba durante la gestión 2025.

### 3.2. Objetivos Específicos

1. Construir el marco teórico sobre calidad del aire interior, arquitectura IoT y sensores ambientales accesibles.
2. Analizar el entorno tecnológico actual del IoT en Bolivia y caracterizar el mercado potencial del artefacto entre instituciones educativas.
3. Determinar las especificaciones funcionales del artefacto sobre la base de los requerimientos del caso de uso.
4. Construir el prototipo del artefacto y desarrollar el software embebido y el servidor de visualización.
5. Validar el prototipo en un aula real durante un ciclo lectivo y evaluar la calidad de las mediciones y la confiabilidad operativa.
6. Evaluar la viabilidad financiera del artefacto como producto comercializable.

## 4. Alcances

### 4.1. Alcance Temático

El proyecto abordó las temáticas de calidad del aire interior, arquitectura IoT con microcontrolador ESP32, sensores ambientales accesibles (SCD30, SDS011), software embebido en C++, plataforma de visualización en la nube y evaluación de proyectos tecnológicos. No se profundizó en aspectos de medicina respiratoria ni en la ingeniería estructural de los edificios donde podría instalarse el sistema.

### 4.2. Alcance Temporal

El alcance temporal del trabajo académico cubre la gestión 2025. La validación empírica del prototipo se realizó durante un ciclo lectivo de cuatro semanas en marzo-abril de 2025.

### 4.3. Alcance Espacial

El diseño es genérico para aulas universitarias estándar de Bolivia. La validación empírica se circunscribió al campus UNIFRANZ Cochabamba, específicamente a un aula representativa de la Facultad de Ingeniería.

## 5. Hipótesis

### 5.1. Hipótesis General

Si se aplica un diseño IoT que combina microcontrolador ESP32, sensores SCD30 y SDS011, conectividad WiFi estándar y software propio orientado al caso de uso, entonces es posible construir un sistema de monitoreo de calidad del aire para aulas universitarias con costo unitario inferior a Bs. 1.000 y desempeño técnico comparable a sistemas comerciales importados.

### 5.2. Variable Independiente

**Diseño IoT propuesto.** Sus indicadores son: arquitectura modular del hardware, selección de sensores, eficiencia del software embebido y arquitectura del servidor de visualización.

### 5.3. Variable Dependiente

**Costo y desempeño del sistema.** Sus indicadores son: costo unitario de fabricación (Bs.), exactitud de las mediciones contra patrón de referencia (% de error), latencia de la alerta (segundos) y disponibilidad operativa (% de tiempo en línea).

### 5.4. Variable Intercurrente

**Estabilidad de la conectividad WiFi del entorno donde se instala el sistema.** Constituye la variable que media entre el sistema diseñado y el desempeño observado, dado que un WiFi inestable degrada la latencia de la alerta independientemente del diseño del artefacto. Se asume controlada mediante el modo offline del sistema (acumulación de datos en memoria y sincronización al recuperar conectividad).

Definidos el problema, los objetivos, los alcances y la hipótesis, el documento avanza hacia el Capítulo I, que desarrolla el marco teórico de sustento; continúa con el Capítulo II, que presenta el análisis del entorno y el mercado potencial; prosigue con el Capítulo III, que detalla el diseño y la validación del artefacto; y culmina con las conclusiones y recomendaciones derivadas.
`;

export const ARTEFACTO_DEMO_SEED: DemoSeed = {
  seed_id: "artefacto-iot-aire-v1",
  universidad_id: "unifranz-cba-001",
  servicio_id: "proy-grado-001",
  tipo_proyecto_id: "unifranz-pg-artefacto",
  modalidad_titulacion: "unifranz-pg-artefacto",
  tema:
    "Diseño de un sistema IoT de monitoreo de calidad del aire para aulas universitarias en Cochabamba (gestión 2025)",
  academic_context_extra: {
    contexto_inicial: {
      programa: "Ingeniería en Sistemas",
      materias: "",
      intereses_y_contexto:
        "Diseño y construcción de un artefacto IoT (hardware + software) que mide CO2, PM2.5, temperatura y humedad en aulas universitarias y envía alertas. Prototipo construido con ESP32 + sensores SCD30 y SDS011, validado en aula real de UNIFRANZ durante 4 semanas. Costo objetivo Bs. 720 unidad.",
    },
    artefacto: "Sistema IoT de monitoreo de calidad del aire (CO2, PM2.5, temperatura, humedad)",
    localizacion: "Validación en UNIFRANZ Cochabamba, diseño genérico para aulas de Bolivia",
    horizonte: "Gestión 2025, evaluación financiera 2025-2028",
  },
  fases_contenido: {
    "ph-unifranz-pg-artefacto-resumen": RESUMEN,
    "ph-unifranz-pg-artefacto-introduccion": INTRODUCCION,
    // Cap I, II, III y cierre en commits subsiguientes, fase por fase.
  },
};
