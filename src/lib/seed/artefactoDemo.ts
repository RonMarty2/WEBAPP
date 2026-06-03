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

// ── Fase 3: Capítulo I — Marco Teórico ──────────────────────────────────────
// Contexto: Resumen + Intro generados. Bases técnicas IoT + calidad del aire.
const CAP1_MARCO_TEORICO = `# CAPÍTULO I — MARCO TEÓRICO

## 1.1. Antecedentes del Estudio

La preocupación por la calidad del aire interior en espacios educativos ha sido objeto de estudios crecientes en las últimas dos décadas. La pandemia de COVID-19 aceleró el interés global por monitorear la ventilación de aulas como herramienta de salud pública (OMS, 2021). En el ámbito tecnológico, la convergencia de microcontroladores de bajo costo (ESP32, Arduino) con sensores ambientales comerciales de creciente exactitud (Sensirion, Bosch, NovaFitness) ha hecho económicamente accesibles soluciones que hace una década eran exclusivas de laboratorios profesionales (rajkumar, lee, sha, & stankovic, 2010). En Bolivia, los estudios sobre IoT aplicado a calidad del aire interior son aún escasos, lo que constituye una de las razones del presente proyecto.

## 1.2. Bases Teóricas

### 1.2.1. Calidad del Aire Interior

La calidad del aire interior (Indoor Air Quality, IAQ) se evalúa con un conjunto de parámetros físico-químicos cuyos umbrales recomendados están documentados por la Organización Mundial de la Salud (OMS, 2021) y por estándares técnicos como ASHRAE 62.1 (american society of heating, refrigerating and air-conditioning engineers, 2019). Los parámetros relevantes para aulas universitarias son:

- **Dióxido de carbono (CO2):** producido por la respiración. Umbrales: por debajo de 1.000 ppm es aceptable; entre 1.000 y 1.500 ppm produce fatiga y reducción del rendimiento cognitivo; por encima de 1.500 ppm es indicativo de ventilación insuficiente.
- **Partículas finas PM2,5:** partículas con diámetro inferior a 2,5 micrones, asociadas a tránsito vehicular, polvo y combustión. Umbral OMS: 15 µg/m³ promedio diario.
- **Temperatura:** confort térmico para aulas entre 20 °C y 24 °C.
- **Humedad relativa:** confort entre 40% y 60%. Por debajo del 30% incrementa irritación respiratoria; por encima del 70% favorece desarrollo de moho.

### 1.2.2. Arquitectura IoT

Una arquitectura IoT se compone clásicamente de cuatro capas (rajkumar, lee, sha, & stankovic, 2010):

- **Capa de percepción:** sensores que capturan datos del entorno físico.
- **Capa de red:** mecanismo de transmisión inalámbrica (WiFi, Bluetooth, LoRa, celular).
- **Capa de plataforma:** servidor o servicio en la nube que recibe, almacena y procesa los datos.
- **Capa de aplicación:** interfaz que el usuario final consume (web, móvil, alertas).

El presente artefacto aplica esta arquitectura clásica con decisiones específicas de selección de sensores, microcontrolador, protocolo de comunicación y plataforma de visualización detalladas en el Capítulo III.

### 1.2.3. Microcontrolador ESP32

El ESP32 es un microcontrolador de bajo costo con WiFi y Bluetooth integrados, desarrollado por Espressif Systems. Su capacidad de procesamiento de doble núcleo a 240 MHz, su memoria RAM de 520 KB y su soporte nativo de comunicación inalámbrica lo han consolidado como plataforma de referencia para aplicaciones IoT de gama baja y media. Su consumo energético en operación es de aproximadamente 80 mA, lo que permite alimentación por USB estándar (5V) sin necesidad de fuente especial.

### 1.2.4. Sensores Ambientales Seleccionables

La literatura técnica y los catálogos de fabricantes documentan varias alternativas de sensores ambientales accesibles para proyectos IoT educativos:

- **CO2:** Sensirion SCD30 (NDIR, exactitud ±30 ppm), Sensirion SCD40 (foto-acústico, ±50 ppm), MH-Z19B (NDIR, ±50 ppm).
- **Partículas PM2,5:** NovaFitness SDS011 (láser, ±15 µg/m³), Plantower PMS5003 (láser, ±10 µg/m³).
- **Temperatura y humedad:** DHT22 (calibrado, ±0,5 °C / ±2% RH), SHT31 (alta exactitud, ±0,3 °C / ±2% RH).

La selección del SCD30 y el SDS011 para el presente artefacto se justifica en el Capítulo III por su balance entre exactitud, costo, disponibilidad en el mercado local y compatibilidad con el ESP32.

### 1.2.5. Protocolos de Comunicación IoT

Los protocolos más usados en aplicaciones IoT de calidad del aire son:

- **HTTP/HTTPS:** simple, ampliamente soportado, pero pesado para transmisiones frecuentes.
- **MQTT:** publish-subscribe, eficiente para mensajes pequeños y frecuentes. Estándar de facto en IoT.
- **WebSocket:** para comunicación bidireccional en tiempo real con la interfaz web.

El presente artefacto utiliza HTTPS para transmitir datos cada 30 segundos al servidor, dada la simplicidad de implementación y la frecuencia moderada que el caso de uso requiere.

### 1.2.6. Plataformas de Visualización en la Nube

Existen plataformas IoT que proveen el componente servidor y la interfaz de visualización con costo bajo o nulo en planes iniciales: Adafruit IO, ThingSpeak, Blynk, AWS IoT Core. El presente proyecto utiliza una plataforma propia desarrollada en Node.js sobre un servidor virtual en la nube, lo que permite control total sobre el almacenamiento de datos institucional y evita dependencias comerciales que podrían cambiar sus políticas.

## 1.3. Marco Conceptual

- **ppm (partes por millón):** unidad de concentración usada para CO2.
- **µg/m³:** unidad de concentración para partículas finas en aire.
- **NDIR (Non-Dispersive Infrared):** principio físico de medición de CO2 por absorción de luz infrarroja.
- **PWM (Pulse-Width Modulation):** técnica de modulación usada por algunos sensores para reportar su lectura.
- **Latencia de alerta:** tiempo entre que un sensor detecta un valor fuera de umbral y el sistema notifica al usuario.

## 1.4. Marco Contextual

El proyecto se desarrolló en el campus de UNIFRANZ Cochabamba. La validación empírica del prototipo se realizó en un aula de la Facultad de Ingeniería con capacidad nominal de 35 estudiantes, dimensiones aproximadas de 7 × 6 metros, ventilación natural por dos ventanas laterales y una puerta. El aula tiene cobertura WiFi institucional estable y conexión eléctrica disponible para alimentar el dispositivo por USB.
`;

// ── Fase 4: Cap II — Header ─────────────────────────────────────────────────
const CAP2_HEADER = `# CAPÍTULO II — INVESTIGACIÓN

El presente capítulo desarrolla el análisis del entorno tecnológico y de mercado del artefacto IoT propuesto, así como la investigación de campo realizada para fundamentar las decisiones de diseño. La estructura sigue la guía UNIFRANZ 2017 sección 4.2.3 y se organiza en cinco bloques: análisis del macroentorno mediante PESTEL aplicado al sector tecnológico-educativo (sección 2.1), análisis del microentorno con el modelo de las cinco fuerzas de Porter sobre el mercado IoT educativo (sección 2.2), análisis matricial con MEFE-MEFI-FODA (sección 2.3), metodología de investigación aplicada (sección 2.4) y resultados del estudio de mercado dirigido a instituciones educativas medianas (sección 2.5).
`;

// ── Fase 5: 2.1 PESTEL ──────────────────────────────────────────────────────
const CAP2A_MACROENTORNO = `# 2.1. Análisis del Macroentorno

## 2.1.1. Factores Políticos

El Estado Plurinacional de Bolivia ha priorizado en los últimos años la incorporación de tecnología en el sector educativo a través de programas del Ministerio de Educación y de la Agencia para el Desarrollo de la Sociedad de la Información en Bolivia (ADSIB). Aunque estos programas se han enfocado más en conectividad y dispositivos que en monitoreo ambiental, configuran un marco institucional receptivo. La estabilidad regulatoria del sector tecnológico se considera moderadamente favorable.

## 2.1.2. Factores Económicos

El acceso al hardware electrónico de gama IoT (ESP32, sensores Sensirion y NovaFitness) en Bolivia se hace principalmente por importación. Los precios CIF son competitivos en lotes superiores a 50 unidades, con tiempos de entrega de 3 a 5 semanas. El tipo de cambio estable de los últimos años favorece la planificación de costos. La principal restricción económica del mercado objetivo (instituciones educativas medianas) es el presupuesto destinado a infraestructura ambiental, históricamente bajo.

## 2.1.3. Factores Sociales

La pandemia de COVID-19 incrementó significativamente la conciencia social sobre la calidad del aire interior en espacios cerrados. Estudiantes y docentes valoran hoy la transparencia sobre la ventilación de las aulas. Las instituciones educativas privadas, en particular, pueden convertir el monitoreo de calidad del aire en un diferenciador competitivo frente a otras instituciones que no lo realizan.

## 2.1.4. Factores Tecnológicos

La maduración del ecosistema IoT en los últimos cinco años ha sido el factor habilitador central del proyecto. La disponibilidad de microcontroladores con conectividad integrada, sensores ambientales calibrados y plataformas en la nube con planes asequibles ha bajado las barreras técnicas y económicas para soluciones IoT educativas. La cobertura WiFi en aulas universitarias es generalmente estable. El factor tecnológico es claramente favorable.

## 2.1.5. Factores Ecológicos

El artefacto contribuye directamente a la dimensión ecológica del entorno educativo al permitir gestionar la ventilación con datos en lugar de intuición, lo que reduce el consumo energético innecesario de aire acondicionado en climas templados como Cochabamba. La huella ambiental del propio artefacto es baja: consumo eléctrico bajo (5V por USB), componentes con vida útil superior a cinco años y diseño modular que facilita la reparación.

## 2.1.6. Factores Legales

Las disposiciones legales aplicables incluyen las regulaciones de la Autoridad de Fiscalización y Control Social de Telecomunicaciones (ATT) sobre potencia de transmisión inalámbrica (WiFi 2,4 GHz dentro de los límites permitidos), la Ley N.° 453 de Defensa del Consumidor para la comercialización futura del artefacto y las normativas institucionales internas de cada universidad sobre instalación de dispositivos en aulas. Ninguna de estas regulaciones bloquea el proyecto; todas son cumplibles con diseño adecuado.

## 2.1.7. Síntesis del Análisis PESTEL

El balance del macroentorno es **favorable** al proyecto. Los factores tecnológicos y sociales son las palancas más fuertes; los factores económicos son moderadamente favorables con la principal restricción en el presupuesto del mercado objetivo. Esta restricción es precisamente lo que el proyecto aborda con un diseño de bajo costo unitario.
`;

// ── Fase 6: 2.2 Microentorno (Porter sobre mercado IoT educativo) ──────────
const CAP2B_MICROENTORNO = `# 2.2. Análisis del Microentorno

El análisis del microentorno aplicó el modelo de las cinco fuerzas de porter al mercado del IoT educativo en Bolivia.

## 2.2.1. Poder de Negociación de los Proveedores

Los proveedores son los fabricantes y distribuidores de componentes electrónicos. Su poder se evaluó como **moderado a alto**: la cadena de importación impone tiempos de entrega y costos logísticos que el proyecto debe absorber. Se mitiga mediante compras en lotes y selección de componentes de marcas con presencia confirmada en distribuidores latinoamericanos.

## 2.2.2. Poder de Negociación de los Clientes

Los clientes son instituciones educativas medianas. Su poder es **alto**: pueden optar por no comprar, postergar la decisión, comprar productos importados existentes (a 6 veces el precio) o construir soluciones internas. El argumento de venta debe ser claro: costo accesible, soporte local, replicabilidad institucional.

## 2.2.3. Amenaza de Nuevos Entrantes

La amenaza es **moderada**. Las barreras de entrada al diseño IoT son bajas (la tecnología está documentada), pero las barreras a la profesionalización del producto (soporte, documentación, capacitación, garantía) son altas. La ventaja competitiva no proviene del hardware sino de la propuesta de valor consolidada y de la red de instituciones cliente.

## 2.2.4. Amenaza de Productos Sustitutos

Los sustitutos directos son los sistemas comerciales importados (más caros pero con marca y soporte de fabricante). Los sustitutos indirectos son medidores manuales o mediciones puntuales sin monitoreo continuo. La amenaza se evaluó como **moderada**: la brecha de precio del proyecto frente a los importados es significativa, lo que sostiene su atractivo.

## 2.2.5. Rivalidad entre Competidores Existentes

La rivalidad entre soluciones IoT educativas hechas localmente es **baja**: el mercado es incipiente, con muy pocos proyectos comerciales activos. La rivalidad con cadenas de venta de productos importados es indirecta y se compite por precio + soporte local.

## 2.2.6. Síntesis del Análisis Porter

El sector presenta condiciones **favorables a moderadas** para la entrada del proyecto: baja rivalidad local, brecha de precio significativa frente a sustitutos importados, mercado con potencial de crecimiento sostenido por la conciencia post-pandemia sobre la calidad del aire interior.
`;

// ── Fase 7: 2.3 Análisis Matricial ──────────────────────────────────────────
const CAP2C_MATRICIAL = `# 2.3. Análisis Matricial

## 2.3.1. Matriz MEFE

| Factor externo | Peso | Calificación | Puntuación |
|---|---:|---:|---:|
| Maduración del ecosistema IoT (sensores accesibles) | 0,15 | 4 | 0,60 |
| Conciencia post-pandemia sobre calidad del aire interior | 0,13 | 4 | 0,52 |
| Tipo de cambio estable favorable a importación | 0,08 | 3 | 0,24 |
| Cobertura WiFi institucional creciente | 0,10 | 3 | 0,30 |
| Marca de sustitutos comerciales importados | 0,11 | 2 | 0,22 |
| Cadena de importación con tiempos de entrega largos | 0,10 | 2 | 0,20 |
| Bajo presupuesto institucional para sensores ambientales | 0,12 | 1 | 0,12 |
| Disponibilidad de plataformas en la nube con planes free/low-cost | 0,09 | 3 | 0,27 |
| Posibilidad de alianzas con facultades de Ingeniería | 0,08 | 3 | 0,24 |
| Regulación ATT cumplible | 0,04 | 3 | 0,12 |
| **Total** | **1,00** | | **2,83** |

## 2.3.2. Matriz MEFI

| Factor interno | Peso | Calificación | Puntuación |
|---|---:|---:|---:|
| Costo unitario 80% inferior a sustitutos importados | 0,18 | 4 | 0,72 |
| Diseño modular replicable | 0,12 | 4 | 0,48 |
| Validación empírica en aula real | 0,10 | 3 | 0,30 |
| Equipo con formación de ingeniería | 0,08 | 3 | 0,24 |
| Sin canal de distribución consolidado | 0,12 | 1 | 0,12 |
| Sin red de soporte post-venta | 0,11 | 1 | 0,11 |
| Sin marca reconocida en el sector educativo | 0,09 | 2 | 0,18 |
| Sin capital inicial de fabricación a escala | 0,11 | 2 | 0,22 |
| Documentación técnica completa del prototipo | 0,09 | 3 | 0,27 |
| **Total** | **1,00** | | **2,64** |

## 2.3.3. FODA Estratégico

| | **Oportunidades (O)** | **Amenazas (A)** |
|---|---|---|
| **Fortalezas (F)** | **FO:** Aprovechar la ventaja de costo para penetrar el mercado de instituciones medianas. Apalancar la validación empírica como caso documentado. | **FA:** Diferenciarse de los importados por soporte local y replicabilidad. Mitigar tiempos de importación con stock de seguridad de componentes. |
| **Debilidades (D)** | **DO:** Construir red de distribución a través de alianzas con facultades de Ingeniería. Aprovechar plataformas en la nube de bajo costo para reducir inversión inicial. | **DA:** Iniciar con pilotos en 3-5 instituciones aliadas antes de escalar. Construir marca y reputación con casos documentados antes de invertir en marketing masivo. |

MEFE 2,83 y MEFI 2,64 ubican al proyecto en posición "crecer y construir" en la matriz IE, lo que sustenta una estrategia ofensiva con base en las fortalezas internas (costo, modularidad) y aprovechamiento de las oportunidades del entorno tecnológico-social.
`;

// ── Fase 8: 2.4 Metodología ──────────────────────────────────────────────────
const CAP2D_METODOLOGIA = `# 2.4. Metodología de Investigación

## 2.4.1. Tipo y Diseño

La investigación realizada fue de tipo **aplicada** con enfoque **mixto** (revisión técnica documental + estudio empírico cualitativo y cuantitativo). El alcance es **descriptivo y experimental**: descriptivo en la caracterización del mercado y de las opciones técnicas, experimental en la fase de construcción y validación del prototipo. El diseño fue **no experimental para el estudio de mercado** y **experimental para la validación del prototipo**.

## 2.4.2. Métodos

- **Método deductivo** para la selección de componentes (de los principios técnicos a los componentes concretos).
- **Método experimental** para la validación del prototipo en aula real.
- **Método analítico-sintético** para la integración de hallazgos en el diseño final.

## 2.4.3. Fuentes y Técnicas

### Revisión Técnica Documental

Se revisaron fichas técnicas (datasheets) de microcontroladores y sensores candidatos, normativa OMS y ASHRAE sobre calidad del aire interior, y literatura técnica sobre arquitecturas IoT educativas. Variables extraídas: exactitud declarada, rango de medición, costo CIF Bolivia, disponibilidad en distribuidores latinoamericanos.

### Entrevistas a Responsables IT Institucionales

Se entrevistó a 7 responsables del área de Tecnologías de la Información de instituciones educativas medianas del área urbana de Cochabamba (5 universidades privadas + 2 colegios secundarios privados con bachillerato técnico). La entrevista cubrió: presupuesto disponible para iniciativas de monitoreo ambiental, capacidad técnica del personal IT para mantener un sistema IoT, expectativas sobre precio y soporte, disposición a probar un piloto.

### Validación Empírica del Prototipo

Se instaló el prototipo en un aula de la Facultad de Ingeniería de UNIFRANZ Cochabamba durante 4 semanas (marzo-abril 2025), cubriendo 12 sesiones de clase y 6 sesiones sin clase como control. Variables medidas: CO2, PM2,5, temperatura, humedad cada 30 segundos. Variables comparadas contra patrón de referencia: lectura del SCD30 contrastada con un medidor calibrado de referencia prestado por el laboratorio de Ingeniería Ambiental.

## 2.4.4. Procesamiento

Los datos de validación se procesaron con Python y la librería pandas. Se calculó error relativo medio del prototipo contra patrón, latencia promedio de la alerta y disponibilidad operativa (% del tiempo en línea). Los datos de las entrevistas se analizaron con codificación temática.
`;

// ── Fase 9: 2.5 Mercado ──────────────────────────────────────────────────────
const CAP2E_MERCADO = `# 2.5. Estudio de Mercado

## 2.5.1. Resultados de las Entrevistas a Responsables IT

De los 7 responsables IT entrevistados:

- **Presupuesto disponible:** 5 de 7 reportaron tener presupuesto anual entre Bs. 8.000 y Bs. 25.000 destinable a iniciativas tecnológicas no críticas. El rango cubre con holgura la adquisición de 10 a 30 unidades del artefacto.
- **Capacidad técnica:** 7 de 7 cuentan con personal capaz de instalar el dispositivo siguiendo manual; 4 de 7 cuentan con personal capaz de configurar y mantener la plataforma de visualización.
- **Expectativa de precio:** rango aceptado entre Bs. 600 y Bs. 1.200 por unidad. El precio objetivo del proyecto (Bs. 720) cae dentro del rango aceptado.
- **Soporte esperado:** 6 de 7 valoran "muy importante" o "imprescindible" el soporte técnico local con tiempo de respuesta inferior a 48 horas.
- **Disposición a piloto:** 5 de 7 manifestaron disposición favorable a recibir un piloto sin compromiso de compra durante 30 días.

## 2.5.2. Tamaño del Mercado Potencial

El área urbana de Cochabamba cuenta con aproximadamente 28 universidades e institutos de educación superior con un total estimado de 1.150 aulas activas. Considerando un escenario inicial de 1 dispositivo por cada 4 aulas (cobertura selectiva por sector más concurrido), el mercado potencial inmediato se estima en 280 unidades. Ampliando al sector secundario privado y a otras ciudades del eje (La Paz, Santa Cruz), el mercado potencial expandido supera las 1.500 unidades.

## 2.5.3. Cuota de Mercado Objetivo

La proyección comercial considera una cuota de mercado objetivo de 200 unidades en 3 años: 40 unidades el primer año (instituciones aliadas iniciales), 70 el segundo y 90 el tercero. Esta proyección se utilizó en la evaluación financiera del Capítulo III.

## 2.5.4. Síntesis del Diagnóstico

El mercado presenta condiciones favorables: precio objetivo dentro del rango aceptado, capacidad técnica institucional suficiente, disposición a piloto, presupuesto disponible. La principal palanca de adopción es construir 3 a 5 casos exitosos en instituciones aliadas durante el primer año.
`;

// ── Fase 10: Cap III — Header ───────────────────────────────────────────────
const CAP3_HEADER = `# CAPÍTULO III — DISEÑO DEL ARTEFACTO

El presente capítulo desarrolla el diseño del sistema IoT de monitoreo de calidad del aire, articulando las decisiones técnicas a partir del marco teórico del Capítulo I y del diagnóstico del Capítulo II. Se organiza en cinco bloques: determinación de las especificaciones funcionales y no funcionales del artefacto (sección 3.1), planos y especificaciones constructivas con diagramas de conexión (sección 3.2), construcción del prototipo y desarrollo del software embebido y del servidor (sección 3.3), validación del prototipo en aula real (sección 3.4) y evaluación financiera del artefacto como producto comercializable (sección 3.5).
`;

// ── Fase 11: 3.1 Especificaciones ───────────────────────────────────────────
const CAP3A_ESPECIFICACIONES = `# 3.1. Determinación de Especificaciones

## 3.1.1. Requerimientos Funcionales

El sistema debe:

- **RF1.** Medir concentración de CO2 en el rango de 400 ppm a 5.000 ppm con exactitud ±50 ppm.
- **RF2.** Medir concentración de partículas PM2,5 en el rango de 0 a 999 µg/m³ con exactitud ±15 µg/m³.
- **RF3.** Medir temperatura ambiente en el rango de 0 °C a 50 °C con exactitud ±0,5 °C.
- **RF4.** Medir humedad relativa en el rango de 0% a 100% con exactitud ±3% RH.
- **RF5.** Transmitir las mediciones al servidor cada 30 segundos cuando la conectividad WiFi esté disponible.
- **RF6.** Almacenar localmente hasta 24 horas de mediciones cuando la conectividad WiFi no esté disponible, y sincronizarlas al recuperar conexión.
- **RF7.** Emitir alerta visual (LED rojo + parpadeo de pantalla) cuando CO2 supere 1.000 ppm.
- **RF8.** Emitir alerta visual cuando PM2,5 supere 35 µg/m³.
- **RF9.** Mostrar las lecturas en una pantalla OLED de 0,96" para inspección visual local.
- **RF10.** Configurarse vía WiFi en modo Access Point durante el primer encendido.

## 3.1.2. Requerimientos No Funcionales

- **RNF1. Costo:** costo unitario de fabricación inferior a Bs. 1.000.
- **RNF2. Consumo:** alimentación 5V por USB estándar, consumo promedio inferior a 200 mA.
- **RNF3. Tamaño:** carcasa con dimensiones máximas 12 × 8 × 4 cm.
- **RNF4. Disponibilidad operativa:** superior al 98% del tiempo en funcionamiento normal.
- **RNF5. Latencia de alerta:** inferior a 10 segundos desde la detección.
- **RNF6. Mantenimiento:** limpieza del sensor PM2,5 cada 6 meses, recalibración del CO2 cada 12 meses.
- **RNF7. Documentación:** manual de instalación y manual de operación en español neutro.
- **RNF8. Garantía:** garantía de fabricación de 12 meses sobre componentes electrónicos.

## 3.1.3. Selección de Componentes

A partir de los requerimientos y de las alternativas evaluadas en el Cap I sección 1.2.4, se seleccionaron los siguientes componentes:

| Componente | Modelo seleccionado | Justificación |
|---|---|---|
| Microcontrolador | ESP32 DevKit V1 | WiFi integrado, doble núcleo, costo accesible |
| Sensor CO2 | Sensirion SCD30 | NDIR, exactitud ±30 ppm, calibración automática |
| Sensor PM2,5 | NovaFitness SDS011 | Láser, exactitud ±15 µg/m³, disponible localmente |
| Sensor T/HR | Incorporado en SCD30 | Reduce componentes, evita conflictos I2C |
| Pantalla | OLED 0,96" I2C | Bajo consumo, legible, costo bajo |
| LED indicador | RGB cátodo común | Tres estados (verde/ámbar/rojo) |
| Carcasa | Impresión 3D PLA | Diseño propio, escalable y reparable |
| Alimentación | Cable USB-A a Micro-USB | Estándar universal, sin fuente adicional |

## 3.1.4. Especificaciones Tabuladas

| Parámetro | Valor objetivo |
|---|---|
| Costo total componentes (BOM) | Bs. 540 |
| Costo carcasa + montaje | Bs. 110 |
| Margen de comercialización | Bs. 200 |
| **Precio al cliente (200 unidades)** | **Bs. 720** |
| Consumo eléctrico promedio | 80 mA |
| Tamaño exterior | 11 × 7 × 3,5 cm |
| Peso | 180 g |
| Tiempo de calentamiento del sensor PM2,5 | 30 segundos |
| Frecuencia de transmisión | Cada 30 segundos |
| Capacidad de almacenamiento offline | 24 horas (2.880 mediciones) |
`;

// ── Fase 12: 3.2 Planos y Especificaciones Constructivas ────────────────────
const CAP3B_PLANOS = `# 3.2. Planos y Especificaciones Constructivas

## 3.2.1. Diagrama de Arquitectura

El sistema se organiza en tres bloques arquitectónicos:

**Bloque 1 — Hardware del dispositivo:**

\`\`\`
+-------------------------------+
|  Carcasa impresa 3D (PLA)     |
|  +-------------------------+  |
|  | ESP32 DevKit V1         |  |
|  |   I2C  --> SCD30 (CO2)  |  |
|  |        --> OLED 0.96"   |  |
|  |   UART --> SDS011 (PM)  |  |
|  |   GPIO --> LED RGB      |  |
|  +-------------------------+  |
|  Alimentación: USB 5V         |
+-------------------------------+
        |
        | WiFi 2.4 GHz HTTPS
        v
+-------------------------------+
|  Servidor en la nube          |
+-------------------------------+
\`\`\`

**Bloque 2 — Servidor backend:**

- API REST en Node.js + Express recibiendo POST con las mediciones.
- Base de datos PostgreSQL con tablas: dispositivos, mediciones, alertas, usuarios.
- Servicio de notificación a usuarios cuando se detecta umbral excedido.

**Bloque 3 — Interfaz de visualización:**

- Aplicación web responsive en React.
- Vista de tiempo real por dispositivo y vista histórica con gráficos.
- Configuración de umbrales personalizados por institución.

## 3.2.2. Diagrama de Conexiones (Bloque 1)

| Componente | Pin ESP32 | Protocolo |
|---|---|---|
| SCD30 SDA | GPIO 21 | I2C |
| SCD30 SCL | GPIO 22 | I2C |
| OLED SDA | GPIO 21 (compartido) | I2C |
| OLED SCL | GPIO 22 (compartido) | I2C |
| SDS011 TX | GPIO 16 (RX2) | UART |
| SDS011 RX | GPIO 17 (TX2) | UART |
| LED Rojo | GPIO 25 | PWM |
| LED Verde | GPIO 26 | PWM |
| LED Azul | GPIO 27 | PWM |
| Alimentación SCD30 | 3,3V | DC |
| Alimentación SDS011 | 5V (USB del ESP32) | DC |
| Alimentación OLED | 3,3V | DC |
| GND común | GND | — |

## 3.2.3. Diseño de la Carcasa (impresión 3D)

La carcasa se diseñó en Fusion 360 con las siguientes características:

- Dimensiones exteriores: 11 × 7 × 3,5 cm.
- Tres ranuras de ventilación para el sensor PM2,5 (frontal, lateral, posterior).
- Ventana transparente para la pantalla OLED.
- Orificio circular para el LED RGB.
- Puerto Micro-USB accesible en lateral.
- Tornillería M3 para ensamble.

Los archivos STL están disponibles para descarga e impresión por cualquier institución interesada.

## 3.2.4. Estructura del Software Embebido

El firmware se organiza en módulos:

- **Módulo de inicialización:** detección de sensores, conexión WiFi, sincronización de tiempo.
- **Módulo de lectura periódica:** ciclo cada 30 segundos que consulta los sensores y arma el paquete de datos.
- **Módulo de comunicación:** envío HTTPS con reintento y buffer offline.
- **Módulo de alertas locales:** evaluación de umbrales y control del LED RGB.
- **Módulo de pantalla:** refresco del OLED con valores actuales.
- **Módulo de configuración:** modo Access Point para configurar WiFi en primer encendido.
`;

// ── Fase 13: 3.3 Construcción del Prototipo ────────────────────────────────
const CAP3C_PROTOTIPO = `# 3.3. Construcción del Prototipo

## 3.3.1. Etapa 1 — Prototipo en Protoboard

El primer prototipo se construyó sobre protoboard para validar el funcionamiento básico de los sensores y de la comunicación con el ESP32. Se probaron las lecturas individuales del SCD30 y del SDS011, se verificó la integridad del bus I2C y se validó la comunicación UART con el sensor de partículas. El tiempo total de construcción de este primer prototipo fue de 14 horas de trabajo.

## 3.3.2. Etapa 2 — Firmware Funcional

El firmware se desarrolló en Arduino IDE con el framework ESP32 oficial de Espressif. Se utilizaron las librerías:

- **Sparkfun_SCD30_Arduino_Library** para el sensor CO2.
- **SdsDustSensor** para el sensor PM2,5.
- **Adafruit_SSD1306** para la pantalla OLED.
- **WiFi.h** y **HTTPClient.h** nativas para comunicación inalámbrica.

El código fuente total son 685 líneas distribuidas en 6 archivos. El firmware ocupa 1,1 MB de los 4 MB de memoria flash del ESP32.

## 3.3.3. Etapa 3 — Servidor Backend

El servidor se desarrolló en Node.js con Express. Los endpoints principales son:

- **POST /api/measurements** — recibe paquete de medición del dispositivo y lo persiste.
- **GET /api/dashboard/:deviceId** — devuelve datos para la visualización.
- **GET /api/alerts** — lista alertas activas.
- **POST /api/devices/register** — registra un nuevo dispositivo.

El servidor se desplegó en un servidor virtual con 1 vCPU y 1 GB RAM, suficiente para soportar hasta 500 dispositivos transmitiendo cada 30 segundos. Costo mensual del servidor: USD 6.

## 3.3.4. Etapa 4 — Interfaz Web

La aplicación web se desarrolló en React con la librería de gráficos Chart.js. Cuenta con tres vistas:

- **Vista actual:** valores instantáneos por dispositivo con código de color (verde/ámbar/rojo).
- **Vista histórica:** gráficos de las últimas 24 horas, 7 días o 30 días.
- **Vista institucional:** mapa de todas las aulas de la institución con su estado.

## 3.3.5. Etapa 5 — Impresión de la Carcasa

La carcasa se imprimió en una impresora 3D Creality Ender 3 V2 con filamento PLA blanco. Cada unidad requiere 4 horas de impresión a temperatura de extrusión 200 °C y velocidad 50 mm/s. El consumo de material por unidad es 65 gramos.

## 3.3.6. Etapa 6 — Ensamble Final

El ensamble del dispositivo final requiere 35 minutos de trabajo manual: soldadura de pines del SCD30 y del OLED al protoboard de circuito impreso, conexión del SDS011, montaje en la carcasa, prueba inicial. El procedimiento está documentado en un manual ilustrado paso a paso para replicación.

## 3.3.7. Costo Real del Prototipo

| Componente | Costo unitario (Bs.) |
|---|---:|
| ESP32 DevKit V1 | 65 |
| SCD30 (Sensirion) | 285 |
| SDS011 (NovaFitness) | 110 |
| OLED 0,96" | 25 |
| LED RGB + resistores | 12 |
| Protoboard PCB ensamblado | 28 |
| Cable USB | 15 |
| Filamento PLA (65g) | 30 |
| Misceláneos (tornillería, cables, soldadura) | 20 |
| **Total componentes** | **590** |
| Mano de obra de ensamble (estimado 1h × Bs. 60) | 60 |
| Mano de obra de impresión 3D (estimado 0,5h) | 30 |
| **Costo total directo unitario** | **680** |

El costo real es 5,5% inferior al estimado en la sección 3.1.4, lo que da margen para absorber fluctuaciones de precio de componentes importados.
`;

// ── Fase 14: 3.4 Validación del Prototipo ──────────────────────────────────
const CAP3D_VALIDACION = `# 3.4. Validación del Prototipo

## 3.4.1. Diseño Experimental de la Validación

El prototipo se instaló en un aula de la Facultad de Ingeniería de UNIFRANZ Cochabamba (aula 204, dimensiones 7 × 6 m, capacidad nominal 35 estudiantes) durante 4 semanas continuas (marzo 24 a abril 18 de 2025). Durante el período se registraron mediciones cada 30 segundos, cubriendo 12 sesiones de clase de 2 a 3 horas (con ocupación promedio del 80% de capacidad) y 6 períodos sin clase como control.

Adicionalmente, durante 3 sesiones de clase se instaló un medidor calibrado de referencia (TES-1370 Indoor Air Quality Meter prestado por el laboratorio de Ingeniería Ambiental) junto al prototipo, para comparar las lecturas y calcular el error relativo.

## 3.4.2. Resultados de Exactitud

### CO2 (n = 1.840 mediciones pareadas)

- Error relativo medio: 2,8% (equivalente a ±28 ppm para una lectura típica de 1.000 ppm).
- Error máximo observado: 4,1%.
- Conclusión: la exactitud del SCD30 es comparable a la del medidor de referencia, en línea con la especificación declarada por el fabricante (±30 ppm).

### PM2,5 (n = 1.840 mediciones pareadas)

- Error relativo medio: 11,4% (equivalente a ±5,7 µg/m³ para una lectura típica de 50 µg/m³).
- Error máximo observado: 18,2% en lecturas bajas (<15 µg/m³), donde la limitación física del sensor SDS011 es conocida.
- Conclusión: la exactitud del SDS011 es suficiente para el caso de uso (alertar sobre umbrales OMS), aunque inferior a equipos profesionales.

### Temperatura y Humedad

- Error medio temperatura: ±0,3 °C.
- Error medio humedad: ±2,1%.
- Conclusión: ambas mediciones cumplen los requerimientos.

## 3.4.3. Resultados de Confiabilidad Operativa

- **Disponibilidad:** 99,4% del tiempo total (períodos de indisponibilidad por reinicios del WiFi institucional).
- **Latencia de alerta:** 7,8 segundos en promedio (mediana 6,5 s), con percentil 95 en 12,2 s.
- **Conexiones perdidas:** el módulo de buffer offline funcionó correctamente, sincronizando todas las mediciones tras cada reconexión.
- **Consumo eléctrico real:** 95 mA promedio, dentro del requerimiento RNF2 (<200 mA).

## 3.4.4. Hallazgos del Período Observacional

Durante las 12 sesiones de clase observadas:

- **CO2 al inicio (aula recién aireada):** 480 ± 35 ppm.
- **CO2 al cabo de 1 hora de clase:** 850 ± 95 ppm.
- **CO2 al cabo de 2 horas de clase:** 1.420 ± 180 ppm (umbral OMS excedido).
- **CO2 al cabo de 3 horas de clase:** 1.880 ± 240 ppm.

Las alertas del sistema en el umbral de 1.000 ppm se dispararon en el 100% de las sesiones de 2 horas o más de duración con ocupación superior al 75%. En las 8 ocasiones en que el docente accedió a la vista en tiempo real y abrió ventanas en respuesta a la alerta, el CO2 descendió en promedio 35% en menos de 4 minutos.

## 3.4.5. Verificación de la Hipótesis

La hipótesis general planteada en la Introducción se confirma: el diseño propuesto produce un sistema con costo unitario inferior a Bs. 1.000 (real: Bs. 680) y desempeño técnico comparable a sistemas comerciales (error medio CO2 2,8%, latencia de alerta 7,8 s). La validación empírica de 4 semanas con 1.840 mediciones pareadas constituye evidencia suficiente para sustentar la hipótesis.
`;

// ── Fase 15: 3.5 Evaluación Financiera ──────────────────────────────────────
const CAP3E_FINANCIERA = `# 3.5. Evaluación Financiera

## 3.5.1. Inversión Inicial

La inversión inicial para arrancar la fabricación a escala se estima en **Bs. 68.500**:

| Rubro | Monto (Bs.) | Participación |
|---|---:|---:|
| Stock inicial de componentes para 40 unidades | 23.600 | 34,5% |
| Impresora 3D adicional para acelerar producción | 3.500 | 5,1% |
| Servidor en la nube anualizado | 5.000 | 7,3% |
| Desarrollo final del software (consultoría externa) | 18.000 | 26,3% |
| Marketing inicial y casos piloto | 10.000 | 14,6% |
| Capital de trabajo (3 meses operación) | 5.000 | 7,3% |
| Reserva para contingencias (5%) | 3.400 | 4,9% |
| **Total** | **68.500** | **100,0%** |

## 3.5.2. Proyección de Ingresos a 3 Años

| Año | Unidades | Precio (Bs.) | Ingresos (Bs.) |
|---:|---:|---:|---:|
| 1 | 40 | 720 | 28.800 |
| 2 | 70 | 720 | 50.400 |
| 3 | 90 | 720 | 64.800 |

Adicionalmente se proyecta un ingreso recurrente de **Bs. 80/año** por dispositivo en concepto de mantenimiento del servidor y soporte, lo que arroja:

| Año | Dispositivos activos | Ingreso recurrente (Bs.) |
|---:|---:|---:|
| 1 | 40 | 3.200 |
| 2 | 110 (40 año 1 + 70 año 2) | 8.800 |
| 3 | 200 | 16.000 |

## 3.5.3. Costos Operativos Proyectados

| Año | Costo de venta (68% precio) | Costos operativos | Total |
|---:|---:|---:|---:|
| 1 | 19.584 | 8.000 | 27.584 |
| 2 | 34.272 | 11.000 | 45.272 |
| 3 | 44.064 | 14.000 | 58.064 |

## 3.5.4. Flujo de Caja Proyectado

| Año | Inversión | Ingresos totales | Costos totales | Flujo neto (Bs.) |
|---:|---:|---:|---:|---:|
| 0 | (68.500) | — | — | (68.500) |
| 1 | — | 32.000 | 27.584 | 4.416 |
| 2 | — | 59.200 | 45.272 | 13.928 |
| 3 | — | 80.800 | 58.064 | 22.736 |

## 3.5.5. Indicadores

Con tasa de descuento del 14%:

- **VAN:** **Bs. 56.480** (positivo).
- **TIR:** **17,4%** (supera el costo de oportunidad del 14%).
- **B/C:** **1,12**.
- **Payback:** **2,1 años**.

## 3.5.6. Análisis de Sensibilidad

El proyecto mantiene viabilidad si las unidades vendidas en el año 3 caen hasta 65 (umbral mínimo). Por debajo, el VAN se vuelve negativo. La dependencia de la cuota del año 3 coloca al plan comercial (en particular a los casos piloto del año 1) como factor crítico de éxito.

## 3.5.7. Conclusión Financiera

Los indicadores financieros sustentan la viabilidad económica del proyecto bajo los supuestos. El margen es menor al observado en proyectos de Pre-Factibilidad típicos porque se trata de un producto técnico nuevo en un mercado emergente. La validación empírica del prototipo y la disposición a piloto documentada en el Cap II reducen significativamente el riesgo de no cumplimiento de la proyección comercial.
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
    "ph-unifranz-pg-artefacto-cap1": CAP1_MARCO_TEORICO,
    "ph-unifranz-pg-artefacto-cap2-investigacion": CAP2_HEADER,
    "ph-unifranz-pg-artefacto-cap2a-macroentorno": CAP2A_MACROENTORNO,
    "ph-unifranz-pg-artefacto-cap2b-microentorno": CAP2B_MICROENTORNO,
    "ph-unifranz-pg-artefacto-cap2c-matricial": CAP2C_MATRICIAL,
    "ph-unifranz-pg-artefacto-cap2d-metodologia": CAP2D_METODOLOGIA,
    "ph-unifranz-pg-artefacto-cap2e-mercado": CAP2E_MERCADO,
    "ph-unifranz-pg-artefacto-cap3-diseno": CAP3_HEADER,
    "ph-unifranz-pg-artefacto-cap3a-especificaciones": CAP3A_ESPECIFICACIONES,
    "ph-unifranz-pg-artefacto-cap3b-planos": CAP3B_PLANOS,
    "ph-unifranz-pg-artefacto-cap3c-prototipo": CAP3C_PROTOTIPO,
    "ph-unifranz-pg-artefacto-cap3d-validacion": CAP3D_VALIDACION,
    "ph-unifranz-pg-artefacto-cap3e-financiera": CAP3E_FINANCIERA,
    // Cierre (conclusiones, recomendaciones, bibliografía, compilación,
    // defensa) en el próximo commit.
  },
};
