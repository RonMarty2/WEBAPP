/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SEED DEMO — Propuesta de Mejora del Sistema de Gestión de Inventarios
 *             BoliFarma S.R.L. (UNIFRANZ · Mejora Organizacional)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * SERVER-ONLY. Contenido de demostración generado FASE POR FASE simulando
 * llamadas individuales a la API de IA. Cada fase se genera con el contexto
 * del proyecto + las fases anteriores ya generadas, replicando el flujo real
 * que tendrá el sistema cuando esté conectado a la API.
 *
 * Caso: cadena farmacéutica boliviana con problema documentado de rotura de
 * stock que afecta su servicio al cliente y su rentabilidad. La propuesta es
 * un sistema de gestión de inventarios mejorado, no la creación de una nueva
 * empresa (eso sería Pre-Factibilidad).
 *
 * IDs: getUnifranzPhases("unifranz-pg-mejora-org") → ph-unifranz-pg-mejora-org-{slug}
 */

import type { DemoSeed } from "./agrohubDemo";

// ── Fase 1: Resumen Ejecutivo (preliminar) ─────────────────────────────────
// Esta fase se escribe AL FINAL en un proyecto real, pero la guía UNIFRANZ
// la coloca en los preliminares del documento. Para el seed la incluimos
// como si la API ya hubiera ejecutado todas las fases y la hubiera redactado
// con conciencia de todo el documento.
const RESUMEN = `# RESUMEN DEL TRABAJO

El presente Proyecto de Grado, en su modalidad de Mejora Organizacional, abordó la formulación de una propuesta de mejora del sistema de gestión de inventarios de BoliFarma S.R.L., cadena farmacéutica con cuatro sucursales en el área urbana del municipio de Cochabamba, durante la gestión 2025. El objetivo general consistió en diseñar un sistema de gestión de inventarios que reduzca la rotura de stock por debajo del 4% mensual, sin incrementar el costo de almacenamiento por encima del 8% del valor del inventario promedio.

El diagnóstico institucional aplicó las técnicas de análisis del microentorno mediante el modelo de las cinco fuerzas de Porter, análisis institucional mediante cadena de valor y entrevistas estructuradas a los responsables operativos, análisis matricial con las herramientas MEFE, MEFI y FODA, y un estudio de mercado focalizado en clientes habituales de la cadena (n = 220). Los resultados evidenciaron que la rotura de stock promedio mensual alcanzó el 12,4% durante el último semestre del 2024, concentrada en medicamentos de venta libre y de uso crónico, con una pérdida de venta estimada en Bs. 38.500 mensuales y un deterioro de la confianza del cliente medido por la reducción de visitas repetidas en un 18% interanual.

La propuesta consolidada articula seis estrategias: (1) clasificación ABC del inventario, (2) implementación del modelo de revisión periódica con cantidad económica de pedido, (3) sistema de información integrado entre sucursales, (4) capacitación del personal en gestión de inventarios, (5) acuerdo marco con tres distribuidores principales y (6) protocolo de transferencia entre sucursales. La evaluación financiera arrojó un VAN positivo de Bs. 184.620 y una TIR del 31,4% a tres años, con un período de recuperación de la inversión de 14 meses, sustentando la viabilidad de la propuesta.
`;

// ── Fase 2: Introducción ────────────────────────────────────────────────────
// Genera el bloque de apertura del documento siguiendo la guía UNIFRANZ
// 2017 sección 4.2.2 (Mejora Organizacional). Estructura: planteamiento del
// problema, 5 justificaciones, objetivos, alcances, hipótesis opcional.
const INTRODUCCION = `# INTRODUCCIÓN

El sector farmacéutico minorista de Cochabamba ha experimentado en los últimos años una intensificación competitiva caracterizada por la consolidación de cadenas regionales, la entrada de farmacias online y la presión sobre los márgenes operativos. En ese contexto, la gestión eficiente del inventario se ha convertido en un factor diferenciador para la sostenibilidad del negocio. Una farmacia que enfrenta rotura recurrente de stock pierde no solo la venta del momento sino la confianza del cliente, que en este rubro se traduce en una caída de visitas sostenida en el tiempo.

El presente Proyecto de Grado abordó la propuesta de mejora del sistema de gestión de inventarios de BoliFarma S.R.L., empresa con cuatro sucursales en el área urbana del municipio de Cochabamba. El documento se organiza en una Introducción que delimita el problema, los objetivos y los alcances del estudio; un Capítulo I de Marco Teórico que sustenta los modelos de gestión de inventarios y de cadena de suministro aplicados; un Capítulo II de Investigación con el diagnóstico interno y externo de la empresa; un Capítulo III de Propuesta de mejora con sus estrategias, diseño, plan de implementación, seguimiento y evaluación financiera; y un apartado final de conclusiones y recomendaciones.

## 1. Planteamiento del Problema

BoliFarma S.R.L. opera desde el año 2011 cuatro sucursales en el área urbana de Cochabamba: dos en distritos centrales, una en zona sur y una en zona norte. Su modelo de negocio es la farmacia tradicional de proximidad, con un mix de productos que incluye medicamentos de venta libre, medicamentos con receta, productos de cuidado personal y productos de conveniencia. La empresa cuenta con un sistema de información básico que registra ventas pero no integra el inventario entre sucursales en tiempo real.

Durante el último semestre del 2024 la empresa registró una rotura de stock promedio del 12,4% mensual, concentrada en productos de alta rotación —analgésicos, antigripales, suplementos vitamínicos— y en medicamentos de uso crónico —antihipertensivos, antidiabéticos. Esta rotura tiene tres causas estructurales identificadas en el diagnóstico preliminar: ausencia de clasificación del inventario por importancia, ausencia de un modelo formal de cálculo del punto de pedido y de la cantidad económica, y falta de visibilidad cruzada entre sucursales que impide aprovechar inventarios disponibles en otra sucursal de la misma cadena.

De mantenerse esta situación, la empresa proyecta una pérdida de venta anualizada superior a Bs. 462.000, una caída adicional de visitas repetidas estimada en 8 puntos porcentuales para la gestión 2025 y una erosión gradual de su posición competitiva frente a cadenas mejor estructuradas que ya operan con sistemas integrados de gestión de inventarios.

En función de lo expuesto, el problema de investigación se formuló de la siguiente manera: ¿Cómo mejorar el sistema de gestión de inventarios de BoliFarma S.R.L. para reducir la rotura de stock por debajo del 4% mensual sin incrementar significativamente el costo de almacenamiento, durante la gestión 2025?

## 2. Justificación

### 2.1. Justificación Práctica

El estudio entrega a la gerencia de BoliFarma una propuesta concreta y aplicable de mejora del sistema de gestión de inventarios, con estrategias diseñadas a partir del diagnóstico real de la empresa y articuladas en un plan de implementación con responsables, plazos e indicadores. La propuesta es ejecutable con los recursos actuales de la cadena más una inversión incremental acotada que se detalla en la evaluación financiera del Capítulo III.

### 2.2. Justificación Económica

La reducción de la rotura de stock del 12,4% al 4% mensual representa una recuperación de venta proyectada superior a Bs. 38.500 mensuales, equivalente a Bs. 462.000 anuales. La inversión incremental requerida para implementar la propuesta se estima en Bs. 95.000, lo que arroja una recuperación del capital invertido en 14 meses con un margen amplio respecto del horizonte de tres años de la evaluación financiera.

### 2.3. Justificación Social

La mejora del sistema de gestión de inventarios tiene impacto social directo sobre los pacientes que dependen de medicamentos de uso crónico. La continuidad del tratamiento depende de la disponibilidad oportuna del producto en la farmacia de proximidad. Reducir la rotura en este segmento contribuye a la adherencia terapéutica de los pacientes, lo que tiene efectos sanitarios y económicos positivos sobre el sistema de salud local.

### 2.4. Justificación Legal

La propuesta se enmarca en la normativa boliviana del sector farmacéutico, incluyendo las disposiciones de la Agencia Estatal de Medicamentos y Tecnologías en Salud (AGEMED) sobre conservación y trazabilidad de medicamentos, las exigencias del Servicio de Impuestos Nacionales aplicables a la gestión de inventarios y los registros municipales del Gobierno Autónomo Municipal de Cochabamba para el funcionamiento de farmacias. Ninguna estrategia propuesta exige cambios regulatorios; todas operan dentro del marco normativo vigente.

### 2.5. Justificación Teórica

El estudio aplica al contexto farmacéutico boliviano los modelos clásicos de gestión de inventarios desarrollados por chase, jacobs y aquilano (chase, jacobs, & aquilano, 2014): clasificación ABC, cantidad económica de pedido (EOQ), revisión periódica y revisión continua. La evidencia empírica generada amplía la literatura local sobre gestión operativa del rubro farmacéutico de proximidad, donde la investigación específica es limitada.

## 3. Objetivos

### 3.1. Objetivo General

Diseñar una propuesta de mejora del sistema de gestión de inventarios de BoliFarma S.R.L. que permita reducir la rotura de stock por debajo del 4% mensual durante la gestión 2025, mediante la aplicación de modelos clásicos de gestión de inventarios adaptados al contexto operativo de la cadena.

### 3.2. Objetivos Específicos

1. Construir el marco teórico sobre gestión de inventarios y cadena de suministro aplicable al rubro farmacéutico minorista.
2. Diagnosticar la situación actual del sistema de gestión de inventarios de BoliFarma mediante análisis del microentorno, análisis institucional y análisis matricial.
3. Identificar las causas estructurales de la rotura de stock recurrente mediante un estudio de campo dirigido a clientes habituales y al personal operativo.
4. Formular estrategias de mejora articuladas en una propuesta integral con responsables, plazos e indicadores.
5. Evaluar la viabilidad financiera de la propuesta mediante los indicadores VAN, TIR y B/C.

## 4. Alcances

### 4.1. Alcance Temático

El proyecto abordó las temáticas de gestión de inventarios, cadena de suministro, análisis institucional y planificación operativa, aplicadas al rubro farmacéutico minorista. No se profundizó en aspectos clínicos de los medicamentos ni en la dimensión farmacéutica regulatoria detallada, por exceder el alcance académico del estudio.

### 4.2. Alcance Temporal

El alcance temporal del trabajo académico cubre la gestión 2025. La propuesta se diseña para implementación durante esa misma gestión, con un horizonte de evaluación de tres años (2025–2028) para la evaluación financiera.

### 4.3. Alcance Espacial

El estudio se circunscribió al Estado Plurinacional de Bolivia, Departamento de Cochabamba, Municipio de Cochabamba, incluyendo las cuatro sucursales de BoliFarma S.R.L. ubicadas en distritos centrales (sucursales 1 y 2), zona sur (sucursal 3) y zona norte (sucursal 4).

## 5. Hipótesis

### 5.1. Hipótesis General

Si se implementa un sistema de gestión de inventarios que combina clasificación ABC, modelo de revisión periódica con cantidad económica de pedido, sistema de información integrado entre sucursales y protocolo de transferencia, entonces la rotura de stock mensual de BoliFarma S.R.L. se reduce por debajo del 4% durante la gestión 2025.

### 5.2. Variable Independiente

**Sistema de gestión de inventarios mejorado.** Sus indicadores son: cobertura de la clasificación ABC, frecuencia de revisión del inventario, cumplimiento del protocolo de transferencia entre sucursales y porcentaje del catálogo gestionado con el nuevo sistema.

### 5.3. Variable Dependiente

**Tasa de rotura de stock.** Se define como el porcentaje de solicitudes de cliente que no pudieron atenderse por falta de producto en la sucursal correspondiente. Sus indicadores son: tasa mensual de rotura, tasa mensual por categoría (venta libre, receta, cuidado personal) y tasa por sucursal.

### 5.4. Variable Intercurrente

**Cumplimiento de los distribuidores con los tiempos de entrega acordados.** Constituye la variable que media entre el sistema diseñado y la rotura observada, dado que la demora del distribuidor neutraliza incluso un buen modelo de cálculo del punto de pedido. Se asume controlada mediante el acuerdo marco con tres distribuidores y el monitoreo mensual del cumplimiento de plazos.

Definidos el problema, la justificación, los objetivos, los alcances y la hipótesis, el documento avanza hacia el Capítulo I, que desarrolla el marco teórico de sustento; continúa con el Capítulo II, que presenta el diagnóstico de la situación actual; prosigue con el Capítulo III, que formula la propuesta de mejora con su evaluación financiera; y culmina con las conclusiones y recomendaciones derivadas del estudio.
`;

// ── Fase 3: Capítulo I — Marco Teórico ──────────────────────────────────────
// Contexto disponible para esta llamada: Resumen + Introducción ya generados.
// El Cap I debe sentar las bases teóricas que sustenten el Cap II (diagnóstico)
// y el Cap III (propuesta de mejora). Para una propuesta de gestión de
// inventarios en farmacia minorista, las bases obligatorias son: modelos
// clásicos de inventario (ABC, EOQ, revisión periódica/continua), cadena de
// suministro, indicadores de desempeño y particularidades del rubro
// farmacéutico (vencimiento, trazabilidad, conservación).
const CAP1_MARCO_TEORICO = `# CAPÍTULO I — MARCO TEÓRICO

## 1.1. Antecedentes del Estudio

La gestión de inventarios en farmacias minoristas ha sido objeto de estudios en distintos contextos. A nivel internacional, las investigaciones de chase, jacobs y aquilano (chase, jacobs, & aquilano, 2014) han documentado que la aplicación de modelos clásicos de gestión de inventarios reduce la rotura de stock entre 40% y 70% en cadenas farmacéuticas que parten de una operación informal. En el contexto latinoamericano, estudios sobre farmacias independientes han evidenciado que la combinación de clasificación ABC con sistemas de información integrados es la práctica de mayor impacto operativo (ballou, 2004, p. 412). En Bolivia, los estudios específicos sobre el sub-sector son escasos, lo que constituye una de las razones que justifican el presente trabajo.

## 1.2. Bases Teóricas

### 1.2.1. Gestión de Inventarios

La gestión de inventarios se define como el conjunto de políticas, decisiones y procedimientos que determinan qué productos almacenar, en qué cantidad, dónde y con qué frecuencia reponer (chase, jacobs, & aquilano, 2014, p. 547). Su objetivo central es equilibrar dos costos en tensión: el costo de mantener inventario (capital inmovilizado, espacio, deterioro, vencimiento) y el costo de no tenerlo (venta perdida, deterioro de la confianza del cliente, costo de reposición urgente). El equilibrio óptimo varía según el rubro y la velocidad de rotación del producto.

### 1.2.2. Clasificación ABC del Inventario

La clasificación ABC, propuesta originalmente por pareto y formalizada para la gestión de inventarios por dickie, agrupa los productos en tres categorías según el aporte de cada uno a la venta total (ballou, 2004, p. 396):

- **Categoría A:** productos que representan aproximadamente el 70%–80% del valor de venta acumulado y constituyen el 10%–20% del catálogo. Requieren control estricto, revisión frecuente y proyección de demanda detallada.
- **Categoría B:** productos que representan el 15%–25% del valor de venta y constituyen el 20%–30% del catálogo. Requieren control intermedio.
- **Categoría C:** productos que representan el 5%–10% del valor de venta y el 50%–70% del catálogo. Requieren control simple, normalmente con stock de seguridad y revisión menos frecuente.

La clasificación ABC permite asignar el esfuerzo de gestión proporcionalmente al valor que cada producto aporta al negocio. En farmacia minorista, los medicamentos de alta rotación (analgésicos, antigripales) y los medicamentos crónicos (antihipertensivos, antidiabéticos) suelen concentrarse en la categoría A.

### 1.2.3. Cantidad Económica de Pedido (EOQ)

El modelo de cantidad económica de pedido, formalizado por harris en 1913 y desarrollado por wilson, determina el tamaño óptimo de cada orden de reposición minimizando la suma de los costos de mantenimiento y los costos de hacer cada pedido (chase, jacobs, & aquilano, 2014, p. 561). La fórmula básica es:

$$EOQ = \\sqrt{\\frac{2 \\cdot D \\cdot S}{H}}$$

Donde:
- D: demanda anual del producto (unidades).
- S: costo unitario de hacer un pedido (administración, transporte).
- H: costo unitario anual de mantener una unidad en inventario.

Para productos farmacéuticos, el modelo se ajusta incorporando el factor de vencimiento: la cantidad económica calculada no debe exceder lo que se prevé vender antes del vencimiento del lote.

### 1.2.4. Modelos de Revisión: Periódica y Continua

Los sistemas de revisión de inventario se agrupan en dos familias principales (ballou, 2004, p. 421):

- **Revisión continua (Q-R):** el inventario se monitorea en tiempo real. Cuando alcanza el punto de reorden R, se emite una orden de cantidad fija Q. Es apropiado para productos de categoría A donde la inversión en monitoreo se justifica.
- **Revisión periódica (T-S):** el inventario se revisa cada T unidades de tiempo (semana, quincena, mes) y se ordena la cantidad necesaria para llegar a un nivel objetivo S. Es apropiado para productos de categorías B y C donde el costo de monitoreo continuo es desproporcionado.

La aplicación combinada de los dos modelos según categoría ABC del producto es la práctica de mayor adopción en farmacia minorista organizada.

### 1.2.5. Cadena de Suministro Farmacéutica

La cadena de suministro farmacéutica minorista articula tres actores principales: el laboratorio fabricante, el distribuidor mayorista y la farmacia minorista (kotler & armstrong, 2017). En Bolivia, los distribuidores mayoristas concentran el aprovisionamiento de la mayoría de cadenas farmacéuticas minoristas, con tiempos de entrega que varían entre 24 horas (productos de alta rotación con stock garantizado) y 7 a 10 días (productos importados con quiebre de stock en el distribuidor). La negociación de un acuerdo marco con tres a cinco distribuidores estratégicos es una práctica documentada para reducir la variabilidad de la cadena.

### 1.2.6. Indicadores de Desempeño en Gestión de Inventarios

La literatura sobre gestión de operaciones ha consolidado un conjunto de indicadores estándar para el seguimiento de un sistema de gestión de inventarios (chase, jacobs, & aquilano, 2014, p. 583):

- **Tasa de rotura de stock (stockout rate):** porcentaje de solicitudes de cliente que no pudieron atenderse por falta de producto.
- **Rotación del inventario (inventory turnover):** veces que el inventario promedio se renueva en un período (típicamente anual). Mayor rotación implica menor capital inmovilizado.
- **Días de inventario:** cantidad de días que el inventario actual cubriría la venta promedio.
- **Costo del inventario como porcentaje de venta:** medida agregada del peso del capital inmovilizado.
- **Tasa de obsolescencia / vencimiento:** porcentaje de inventario que se pierde por deterioro o expiración.

Estos indicadores se utilizan tanto en el diagnóstico inicial (línea base) como en el seguimiento posterior a la implementación de la propuesta.

## 1.3. Marco Conceptual

- **Rotura de stock:** situación en la que el cliente solicita un producto y la farmacia no puede atenderlo por falta de inventario.
- **Stock de seguridad:** cantidad mínima que se mantiene como buffer frente a variabilidad de la demanda o de los tiempos de reposición.
- **Punto de reorden:** nivel de inventario que dispara automáticamente una nueva orden de compra.
- **Cantidad económica de pedido (EOQ):** tamaño óptimo de la orden que minimiza la suma de costos de mantenimiento y de pedido.
- **Lead time:** tiempo que transcurre entre la emisión de la orden y la recepción del producto en la farmacia.
- **Acuerdo marco con distribuidores:** contrato de mediano plazo que fija condiciones de precio, plazo de entrega y disponibilidad mínima para un conjunto definido de productos.

## 1.4. Marco Contextual

El estudio se desarrolló sobre BoliFarma S.R.L., empresa que opera desde 2011 cuatro sucursales en el área urbana del municipio de Cochabamba. La cadena cuenta con 16 colaboradores en total (4 farmacéuticos titulados, 8 dependientes con curso técnico, 2 administrativos en oficina central y 2 personas de logística). El catálogo activo de la cadena comprende aproximadamente 2.400 productos referenciados (SKU), de los cuales 380 son considerados de alta rotación. Los principales distribuidores con los que opera son tres mayoristas regionales que cubren el 78% del aprovisionamiento, complementados con compras directas a laboratorios para productos exclusivos.
`;

// ── Fase 4: Capítulo II — Investigación (header del capítulo) ──────────────
// Contexto: Resumen + Intro + Cap I generados. Este header anuncia las 5
// sub-secciones que vendrán a continuación, en línea con la guía UNIFRANZ
// 2017 sección 4.2.2 para Mejora Organizacional.
const CAP2_HEADER = `# CAPÍTULO II — INVESTIGACIÓN

El presente capítulo desarrolla el diagnóstico institucional y operativo de BoliFarma S.R.L. y la investigación de campo realizada para sustentar la propuesta de mejora del sistema de gestión de inventarios. La estructura sigue la guía UNIFRANZ 2017 sección 4.2.2 para la modalidad Mejora Organizacional, y se organiza en cinco bloques: análisis del microentorno mediante el modelo de las cinco fuerzas de Porter (sección 2.1), análisis institucional con cadena de valor y mapeo de procesos críticos (sección 2.2), análisis matricial con las herramientas MEFE, MEFI y FODA (sección 2.3), metodología de investigación aplicada (sección 2.4) y resultados del estudio de mercado dirigido a clientes habituales y al personal operativo (sección 2.5). La integración de los cinco bloques entrega un diagnóstico fundamentado sobre el cual se construye la propuesta del Capítulo III.
`;

// ── Fase 5: 2.1 Análisis del Microentorno (5 fuerzas Porter) ───────────────
// Contexto: las anteriores + tema de farmacia minorista. Las 5 fuerzas se
// evalúan específicamente para el rubro farmacéutico de Cochabamba.
const CAP2A_MICROENTORNO = `# 2.1. Análisis del Microentorno

El análisis del microentorno se realizó mediante el modelo de las cinco fuerzas competitivas propuesto por porter (porter, 1980). El modelo permite caracterizar la intensidad de la competencia en el rubro farmacéutico minorista de Cochabamba y la posición negociadora de BoliFarma frente a sus actores relevantes.

## 2.1.1. Poder de Negociación de los Proveedores

Los proveedores de BoliFarma son los distribuidores mayoristas farmacéuticos. Su poder de negociación se evaluó como **alto**. Razones: la concentración del aprovisionamiento boliviano en pocos distribuidores regionales reduce las alternativas de la farmacia minorista; los plazos de entrega varían según la disponibilidad del distribuidor sin que el cliente pueda exigir mejoras; los descuentos por volumen requieren compras significativas que las farmacias medianas no siempre alcanzan. BoliFarma puede contrarrestar parcialmente este poder mediante un acuerdo marco con tres distribuidores principales que formalice condiciones de plazo y disponibilidad mínima, lo que constituye una de las estrategias propuestas en el Capítulo III.

## 2.1.2. Poder de Negociación de los Clientes

El cliente final de BoliFarma es el consumidor minorista urbano. Su poder de negociación se evaluó como **moderado**. El cliente individual no negocia precios pero sí elige libremente la farmacia, y la rotura de stock recurrente acelera la migración hacia competidores. La sensibilidad al precio es media: en medicamentos crónicos el consumidor tiende a fidelizarse cuando la farmacia mantiene continuidad, lo que coloca a la disponibilidad del producto como variable competitiva más relevante que el precio.

## 2.1.3. Amenaza de Nuevos Entrantes

La amenaza de nuevos entrantes se evaluó como **moderada**. Las barreras de entrada del rubro son medias: el capital para abrir una farmacia básica es accesible, la regulación farmacéutica exige un farmacéutico titulado responsable pero ese requisito es cumplible. La consolidación de cadenas regionales y la entrada de farmacias online han incrementado la competencia en los últimos cinco años. La ventaja competitiva no proviene del capital ni del tamaño, sino de la eficiencia operativa y de la consistencia del servicio.

## 2.1.4. Amenaza de Productos Sustitutos

Los sustitutos del servicio son las farmacias online con entrega a domicilio y los autoservicios con sección de salud y cuidado personal. La amenaza se evaluó como **moderada a alta**. Las farmacias online han crecido en el segmento joven urbano; los autoservicios captan compras de productos de cuidado personal y conveniencia que antes se hacían en farmacia. BoliFarma puede defender su posición mediante el servicio profesional del farmacéutico titulado y la disponibilidad oportuna del medicamento de uso crónico, ventajas que el sustituto digital no replica completamente.

## 2.1.5. Rivalidad entre Competidores Existentes

La rivalidad en el rubro farmacéutico minorista de Cochabamba se evaluó como **alta**. El área urbana cuenta con más de 350 farmacias activas, y la competencia se ha intensificado con la expansión de tres cadenas regionales que operan con sistemas de información integrados y estrategias de fidelización del cliente. La diferenciación por precio es limitada porque el margen del rubro es estrecho; la diferenciación efectiva se construye sobre la consistencia operativa, en particular sobre la disponibilidad oportuna del producto.

## 2.1.6. Síntesis del Análisis Porter

El balance de las cinco fuerzas indica un rubro con intensidad competitiva **alta**, agravada por la posición negociadora desventajosa frente a los distribuidores. En este contexto, la eficiencia operativa interna —y específicamente la calidad de la gestión de inventarios— se convierte en el factor de competitividad de mayor incidencia. BoliFarma no puede modificar la estructura del sector pero sí puede modificar su propia operación, lo que sustenta la pertinencia del enfoque del presente proyecto.
`;

// ── Fase 6: 2.2 Análisis Institucional ──────────────────────────────────────
// Contexto: las anteriores + características operativas de BoliFarma del
// marco contextual del Cap I. Cadena de valor + procesos críticos.
const CAP2B_INSTITUCIONAL = `# 2.2. Análisis Institucional

El análisis institucional de BoliFarma se realizó mediante la cadena de valor propuesta por porter (porter, 1980) y un mapeo de procesos críticos identificados a partir de entrevistas estructuradas al personal operativo de las cuatro sucursales y al equipo administrativo de la oficina central.

## 2.2.1. Cadena de Valor de BoliFarma

**Actividades primarias:**

- **Logística de entrada:** recepción de mercadería del distribuidor en cada sucursal o en la oficina central. El proceso actual carece de procedimiento estandarizado: la recepción depende del horario en que el distribuidor entrega y de la disponibilidad del dependiente que recibe.
- **Operaciones:** clasificación, almacenamiento y reposición en góndola en cada sucursal. El almacenamiento se realiza por categoría general (jarabes, comprimidos, cremas, etc.), sin clasificación ABC documentada.
- **Logística de salida:** venta y entrega al cliente en el mostrador. Los procesos de cobro y atención están estandarizados; la rotura se manifiesta en el momento de la consulta del cliente.
- **Marketing y ventas:** publicidad local de cada sucursal y promociones estacionales coordinadas desde la oficina central.
- **Servicio:** atención del farmacéutico titulado, orientación sobre uso de medicamentos y devoluciones.

**Actividades de apoyo:**

- **Infraestructura:** oficina central con dos personas administrativas; sistema de información básico que registra ventas por sucursal pero no consolida inventario en tiempo real.
- **Gestión de recursos humanos:** 16 colaboradores totales, con capacitación inicial al ingreso pero sin programa de actualización en gestión de inventarios.
- **Desarrollo tecnológico:** baja inversión histórica en sistemas; planes de actualización pospuestos por la prioridad dada a la apertura de nuevas sucursales en 2022 y 2023.
- **Compras:** centralizadas en la oficina central, gestionadas por una persona administrativa que decide órdenes sobre la base de revisiones manuales del inventario reportado por cada sucursal vía planilla compartida.

## 2.2.2. Procesos Críticos Identificados

El mapeo identificó cinco procesos críticos que inciden directamente sobre la rotura de stock:

1. **Revisión del inventario por sucursal:** se hace semanalmente sin criterio estandarizado, lo que produce inconsistencias entre sucursales y omisiones en productos de baja visibilidad pero alta criticidad.
2. **Generación de la orden de compra:** se hace por estimación del administrativo central, sin cálculo formal de punto de reorden ni cantidad económica.
3. **Recepción y validación del pedido:** se hace al ingreso del producto, pero sin contraste sistemático con la orden emitida, lo que ha producido recepciones incompletas no detectadas.
4. **Transferencia entre sucursales:** existe como práctica informal cuando una sucursal detecta que otra tiene producto que ella necesita, pero no hay protocolo formal ni sistema que dispare la transferencia automáticamente.
5. **Comunicación con el distribuidor ante quiebre:** se hace por llamada telefónica del administrativo central, sin escalamiento formalizado ni indicadores de tiempo de respuesta exigido.

## 2.2.3. Diagnóstico de la Situación Actual

La rotura de stock del 12,4% mensual se explica por la convergencia de tres causas estructurales:

- **Ausencia de clasificación ABC:** el catálogo de 2.400 SKUs se gestiona sin priorización, lo que dispersa la atención del personal y deja desatendidos los productos críticos.
- **Ausencia de modelo formal de reposición:** la orden de compra se genera por estimación, sin cálculo de punto de reorden ajustado a la demanda histórica ni cantidad económica que minimice los costos asociados.
- **Ausencia de visibilidad cruzada entre sucursales:** una sucursal con quiebre no sabe que la sucursal vecina tiene producto, lo que impide la transferencia oportuna y multiplica la rotura.

La propuesta del Capítulo III se construye sobre la corrección coordinada de estas tres causas estructurales.
`;

// ── Fase 7: 2.3 Análisis Matricial (MEFE, MEFI, FODA) ──────────────────────
// Contexto: PESTEL no aplica a Mejora Org (se usa cuando se analiza
// macroentorno de proyecto nuevo). En MO la MEFE se construye con factores
// externos del rubro y el contexto institucional. MEFI con factores internos
// de la empresa diagnosticada.
const CAP2C_MATRICIAL = `# 2.3. Análisis Matricial

El análisis matricial integra los hallazgos de las secciones 2.1 (microentorno) y 2.2 (institucional) en tres instrumentos: la Matriz de Evaluación de Factores Externos (MEFE), la Matriz de Evaluación de Factores Internos (MEFI) y la matriz FODA estratégica.

## 2.3.1. Matriz MEFE — Evaluación de Factores Externos

| Factor externo | Peso | Calificación | Puntuación |
|---|---:|---:|---:|
| Crecimiento del consumo de medicamentos crónicos por envejecimiento poblacional | 0,12 | 4 | 0,48 |
| Disponibilidad de tecnología accesible para sistemas de inventario | 0,11 | 4 | 0,44 |
| Adopción de pagos digitales por el cliente farmacéutico | 0,08 | 3 | 0,24 |
| Consolidación de cadenas regionales con sistemas integrados | 0,13 | 2 | 0,26 |
| Entrada de farmacias online en el segmento joven urbano | 0,10 | 2 | 0,20 |
| Concentración del aprovisionamiento en pocos distribuidores | 0,12 | 1 | 0,12 |
| Regulación AGEMED sobre trazabilidad de medicamentos | 0,08 | 3 | 0,24 |
| Sensibilidad de los pacientes crónicos a la continuidad del producto | 0,10 | 4 | 0,40 |
| Oferta de cursos de capacitación en gestión de operaciones | 0,06 | 3 | 0,18 |
| Tipo de cambio estable que favorece la planificación de compras | 0,10 | 3 | 0,30 |
| **Total** | **1,00** | | **2,86** |

*Escala: 4 = oportunidad mayor; 3 = oportunidad menor; 2 = amenaza menor; 1 = amenaza mayor.*

La puntuación total de 2,86 supera el promedio de referencia (2,50), indicando un entorno externo moderadamente favorable a una mejora operativa: la tecnología disponible y la demanda de productos crónicos crean condiciones, mientras que la concentración del aprovisionamiento y la entrada de farmacias online son las principales amenazas.

## 2.3.2. Matriz MEFI — Evaluación de Factores Internos

| Factor interno | Peso | Calificación | Puntuación |
|---|---:|---:|---:|
| Cuatro sucursales con cobertura del área urbana | 0,11 | 4 | 0,44 |
| Catálogo amplio (2.400 SKUs) | 0,07 | 3 | 0,21 |
| Equipo de farmacéuticos titulados experimentados | 0,10 | 4 | 0,40 |
| Trayectoria de 14 años en el mercado local | 0,08 | 3 | 0,24 |
| Sistema de información sin integración entre sucursales | 0,14 | 1 | 0,14 |
| Ausencia de clasificación ABC del inventario | 0,12 | 1 | 0,12 |
| Ausencia de modelo formal de reposición | 0,12 | 1 | 0,12 |
| Capacitación inicial sin programa de actualización | 0,07 | 2 | 0,14 |
| Compras centralizadas con criterio estimativo | 0,10 | 2 | 0,20 |
| Sin acuerdo marco con distribuidores | 0,09 | 2 | 0,18 |
| **Total** | **1,00** | | **2,19** |

*Escala: 4 = fortaleza mayor; 3 = fortaleza menor; 2 = debilidad menor; 1 = debilidad mayor.*

La puntuación interna de 2,19 está por debajo del promedio (2,50), reflejando que las debilidades operativas internas pesan más que las fortalezas. Esto es coherente con el diagnóstico: la empresa tiene activos relevantes (cobertura, equipo profesional, trayectoria) pero su gestión operativa de inventario está significativamente atrasada respecto del estándar del rubro.

## 2.3.3. Matriz FODA Estratégica

| | **Oportunidades (O)** | **Amenazas (A)** |
|---|---|---|
| **Fortalezas (F)** | **Estrategias FO:** Aprovechar la cobertura de las 4 sucursales para construir un sistema integrado que permita transferencia y visibilidad cruzada. Apalancar el equipo profesional para liderar internamente la implementación del nuevo sistema. | **Estrategias FA:** Convertir la trayectoria y el equipo titulado en propuesta de valor diferenciadora frente a farmacias online. Defender la posición mediante consistencia operativa que cadenas más grandes no siempre logran en sucursales periféricas. |
| **Debilidades (D)** | **Estrategias DO:** Implementar clasificación ABC y modelo de reposición como prioridad inmediata, aprovechando la disponibilidad de tecnología accesible. Capacitar al personal sobre la base de cursos disponibles localmente. | **Estrategias DA:** Negociar acuerdo marco con tres distribuidores para reducir dependencia y mejorar plazos. Implementar el sistema integrado antes de que las cadenas regionales consoliden ventaja competitiva irreversible. |

La propuesta del Capítulo III combina estrategias DO (aprovechar tecnología para corregir debilidades internas) y FO (apalancar la cobertura territorial existente con el nuevo sistema), priorizando la corrección de las debilidades estructurales que el MEFI dejó en evidencia.
`;

// ── Fase 8: 2.4 Metodología de Investigación ────────────────────────────────
// Contexto: el diagnóstico requirió tanto observación documental como
// entrevistas y un estudio de campo a clientes. Se detalla el método.
const CAP2D_METODOLOGIA = `# 2.4. Metodología de Investigación

## 2.4.1. Tipo de Investigación

La investigación realizada fue de tipo **descriptiva y aplicada**, con enfoque **mixto** (cuantitativo y cualitativo). El componente cuantitativo se aplicó al estudio de los clientes habituales y al análisis de los registros operativos de la empresa; el componente cualitativo se aplicó al diagnóstico institucional mediante entrevistas al personal.

## 2.4.2. Diseño de la Investigación

El diseño fue **no experimental, transversal**, con recolección de datos durante el bimestre marzo–abril de 2025. La investigación se desarrolló en tres etapas: revisión documental de los registros operativos de la empresa (planillas de inventario, órdenes de compra, registros de venta) durante los 12 meses previos al estudio; entrevistas estructuradas a la totalidad del personal operativo (16 colaboradores) y a los tres distribuidores principales; y aplicación de cuestionario estructurado a una muestra representativa de clientes habituales.

## 2.4.3. Población y Muestra del Estudio de Mercado

**Población:** clientes habituales de BoliFarma, definidos como aquellos que registran al menos una compra mensual en cualquiera de las cuatro sucursales durante los últimos seis meses. Sobre la base del registro de ventas, la población se estimó en 8.400 clientes habituales.

**Muestra:** se aplicó muestreo aleatorio simple con nivel de confianza del 95% y error muestral del 6%. La fórmula arrojó n = 220 clientes. La selección se hizo mediante invitación directa en el momento de la compra durante el período de aplicación.

## 2.4.4. Técnicas e Instrumentos

- **Revisión documental:** matriz de extracción de datos aplicada a planillas de inventario y registros de venta de los 12 meses previos. Variables extraídas: SKU, sucursal, ventas mensuales, días con stock cero, número de órdenes emitidas.
- **Entrevista estructurada al personal:** guía de 14 ejes temáticos sobre procesos de inventario, frecuencia y método de revisión, comunicación entre sucursales, percepción de causas de la rotura.
- **Entrevista a distribuidores:** guía de 8 ejes sobre tiempos de entrega comprometidos vs. reales, disponibilidad de productos de alta rotación, disposición a acuerdo marco.
- **Encuesta a clientes:** cuestionario estructurado de 16 preguntas sobre frecuencia de compra, ocasiones en que no encontró el producto buscado, comportamiento ante la rotura (esperar, ir a otra farmacia, postergar el tratamiento), valoración del servicio y disposición a mantenerse como cliente.

## 2.4.5. Procesamiento y Análisis de Datos

Los datos cuantitativos se procesaron en Microsoft Excel con tablas dinámicas y análisis estadístico descriptivo. La revisión documental permitió calcular la tasa de rotura mensual y su distribución por sucursal y por categoría de producto. Los datos cualitativos de las entrevistas se analizaron mediante codificación temática con apoyo de matrices comparativas que cruzaron percepciones del personal y de los distribuidores.
`;

// ── Fase 9: 2.5 Estudio de Mercado / Resultados del campo ───────────────────
// Contexto: ya tenemos el diagnóstico institucional y el método. Esta fase
// presenta los hallazgos del estudio de campo a clientes habituales.
const CAP2E_MERCADO = `# 2.5. Estudio de Mercado

## 2.5.1. Resultados del Estudio a Clientes Habituales

La encuesta a 220 clientes habituales de BoliFarma arrojó los siguientes hallazgos:

- **Frecuencia de compra:** el 64,5% compra al menos dos veces al mes; el 23,2% una vez al mes; el 12,3% más de tres veces al mes (principalmente pacientes con tratamiento crónico).
- **Experiencias de rotura:** el 71,8% reportó haber experimentado, en los últimos seis meses, al menos una situación en la que el producto solicitado no estaba disponible. El 38,2% de quienes vivieron la rotura optaron por ir a otra farmacia esa misma vez; el 22,3% esperaron hasta el día siguiente; el 18,6% pospusieron la compra o consulta; el 20,9% restantes adquirieron el producto en otra sucursal de BoliFarma cuando se les indicó que lo había.
- **Impacto sobre la fidelidad:** entre quienes experimentaron rotura, el 14,1% reportó que la situación los llevó a cambiar de farmacia habitual, lo que es coherente con la caída de visitas repetidas del 18% que la empresa registró internamente.
- **Productos involucrados en la rotura:** el 47,7% reportó rotura en analgésicos o antigripales; el 28,2% en medicamentos crónicos (antihipertensivos, antidiabéticos); el 13,6% en suplementos vitamínicos; el 10,5% en otros productos.
- **Valoración del servicio:** la atención del farmacéutico fue valorada con 4,3 sobre 5; el tiempo de espera con 4,1; pero la disponibilidad de productos solo con 2,9. La brecha entre la calidad percibida del servicio profesional y la disponibilidad operativa señala con claridad cuál es el factor que más perjudica la experiencia del cliente.

## 2.5.2. Resultados de las Entrevistas al Personal

Las entrevistas a los 16 colaboradores y al equipo administrativo arrojaron los siguientes hallazgos consolidados:

- **Causas atribuidas a la rotura (orden de mención):** órdenes de compra que no contemplan la demanda real (10/16 menciones), demora del distribuidor en productos específicos (9/16), ausencia de visibilidad de inventario de otras sucursales (8/16), reposición demorada en góndola tras la recepción (5/16), errores en la planilla compartida de inventario (4/16).
- **Frecuencia de revisión del inventario:** 4 de las 4 sucursales reportan revisión semanal, pero ninguna usa criterio estandarizado.
- **Disposición a usar un sistema nuevo:** 14 de 16 colaboradores se mostraron favorables o muy favorables a un sistema integrado entre sucursales con reglas claras de reposición.

## 2.5.3. Resultados de las Entrevistas a Distribuidores

Las entrevistas a los tres distribuidores principales arrojaron:

- **Cumplimiento de plazos:** los tres reportan cumplimiento promedio entre el 84% y el 92% para productos de alta rotación, con caídas significativas en períodos de quiebre del laboratorio.
- **Disposición a acuerdo marco:** los tres se mostraron dispuestos a negociar un acuerdo marco con compromisos mutuos de volumen y plazo, a cambio de previsibilidad en las órdenes mensuales de BoliFarma.

## 2.5.4. Síntesis del Diagnóstico

El conjunto de hallazgos confirma que la rotura del 12,4% mensual tiene causa estructural interna (ausencia de modelos formales de gestión, sin visibilidad cruzada) más que causa externa (los distribuidores cumplen razonablemente bien). El espacio de mejora se concentra en la operación interna y resulta abordable con las estrategias del Capítulo III. Adicionalmente, la disposición favorable del personal y de los distribuidores facilita la implementación.
`;
// ── Fase 10: Capítulo III — Propuesta (header) ──────────────────────────────
// Contexto disponible: Cap II completo con diagnóstico de 3 causas
// estructurales (sin ABC, sin EOQ, sin visibilidad cruzada). El Cap III
// presenta la propuesta integral que corrige esas causas.
const CAP3_HEADER = `# CAPÍTULO III — PROPUESTA DE MEJORA

El presente capítulo presenta la propuesta de mejora del sistema de gestión de inventarios de BoliFarma S.R.L., construida a partir del diagnóstico desarrollado en el Capítulo II y de las bases teóricas del Capítulo I. La estructura sigue la guía UNIFRANZ 2017 sección 4.2.2 y se organiza en cinco bloques: identificación y formulación de las estrategias de mejora (sección 3.1), diseño detallado de la propuesta articulando las estrategias en un sistema coherente (sección 3.2), plan de implementación con responsables, plazos e indicadores (sección 3.3), plan de seguimiento y control post-implementación (sección 3.4) y evaluación financiera de la propuesta con un horizonte de tres años (sección 3.5).
`;

// ── Fase 11: 3.1 Identificación de Estrategias ─────────────────────────────
// Contexto: diagnóstico (3 causas estructurales) + FODA del Cap II.
// Se formulan las 6 estrategias prometidas en el Resumen Ejecutivo.
const CAP3A_ESTRATEGIAS = `# 3.1. Identificación de Estrategias

A partir del diagnóstico del Capítulo II y de las estrategias DO y FO formuladas en la matriz FODA, se identificaron seis estrategias que articuladas conforman la propuesta de mejora del sistema de gestión de inventarios.

## 3.1.1. Estrategia 1: Clasificación ABC del Inventario

**Objetivo:** priorizar el esfuerzo de gestión sobre los productos que aportan el mayor valor de venta y sobre los medicamentos crónicos cuya rotura tiene impacto sanitario.

**Descripción:** clasificar los 2.400 SKUs del catálogo en tres categorías sobre la base de la venta acumulada de los últimos 12 meses: A (los SKUs que aportan el 75% del valor de venta), B (los siguientes que aportan el 20%) y C (el resto). Adicionalmente, todos los medicamentos crónicos se elevan a categoría A por relevancia sanitaria, independientemente de su aporte económico.

**Justificación:** la ausencia de clasificación es la primera causa estructural identificada. Su corrección permite asignar el esfuerzo de gestión proporcionalmente al valor.

## 3.1.2. Estrategia 2: Modelo de Revisión Periódica con EOQ Adaptado

**Objetivo:** sustituir la generación de órdenes de compra por estimación con un cálculo formal de punto de reorden y cantidad económica de pedido.

**Descripción:** aplicar el modelo de revisión periódica (T-S) con frecuencia semanal a los productos de categoría A y quincenal a los productos de categorías B y C. La cantidad económica de pedido se calcula con la fórmula clásica (EOQ) ajustada por el factor de vencimiento del producto. El punto de reorden se calibra con la demanda histórica más el stock de seguridad equivalente a 1,5 lead times del distribuidor.

**Justificación:** corrige la segunda causa estructural identificada en el diagnóstico.

## 3.1.3. Estrategia 3: Sistema de Información Integrado entre Sucursales

**Objetivo:** dar visibilidad cruzada en tiempo real del inventario disponible en las cuatro sucursales y disparar automáticamente alertas de reposición o transferencia.

**Descripción:** implementar un sistema en la nube que consolide en tiempo real las ventas y los movimientos de inventario de las cuatro sucursales y de la oficina central. El sistema genera reportes de cobertura por SKU y alertas configuradas según los puntos de reorden de cada categoría.

**Justificación:** corrige la tercera causa estructural y habilita las estrategias 4 y 6.

## 3.1.4. Estrategia 4: Programa de Capacitación del Personal

**Objetivo:** desarrollar competencias internas en gestión de inventarios para sostener el nuevo sistema más allá de la implementación inicial.

**Descripción:** programa de capacitación de 24 horas distribuido en 6 sesiones de 4 horas, dirigido a los 16 colaboradores y al equipo administrativo, cubriendo: fundamentos de gestión de inventarios, uso del sistema de información nuevo, protocolo de recepción y validación, protocolo de transferencia entre sucursales, indicadores y reportes, gestión de excepciones (vencimientos, devoluciones, productos con quiebre del distribuidor).

**Justificación:** la disposición favorable del personal documentada en el Cap II (14/16) facilita la adopción, pero requiere una inversión formativa estructurada.

## 3.1.5. Estrategia 5: Acuerdo Marco con Tres Distribuidores

**Objetivo:** formalizar la relación con los tres distribuidores principales para mejorar previsibilidad de plazos y precios.

**Descripción:** firma de acuerdos marco de 18 meses con los tres distribuidores principales, con cláusulas de: compromiso de volumen mensual mínimo de BoliFarma, compromiso de plazo de entrega y disponibilidad mínima del distribuidor, descuento por volumen escalonado, mecanismo de escalamiento para casos de quiebre del laboratorio.

**Justificación:** los tres distribuidores expresaron disposición favorable en las entrevistas del Cap II.

## 3.1.6. Estrategia 6: Protocolo de Transferencia entre Sucursales

**Objetivo:** formalizar la transferencia de producto entre sucursales como mecanismo operativo regular, no como recurso excepcional.

**Descripción:** protocolo escrito que define cuándo se dispara una transferencia (sucursal con stock cero y otra sucursal con inventario superior al punto de reorden), quién la autoriza, cómo se ejecuta logísticamente, plazo objetivo (4 horas dentro del área urbana) y registro en el sistema integrado.

**Justificación:** convierte un recurso informal en un mecanismo confiable, en sinergia con la Estrategia 3.

## 3.1.7. Articulación de las Seis Estrategias

Las seis estrategias se articulan como un sistema integrado donde ninguna funciona aislada: la clasificación ABC orienta el esfuerzo del modelo EOQ; el sistema de información habilita el modelo EOQ y el protocolo de transferencia; la capacitación garantiza la adopción de las cuatro estrategias anteriores; el acuerdo marco con distribuidores reduce la variabilidad externa que el sistema interno no controla. La implementación coordinada de las seis es lo que permite alcanzar el objetivo de rotura inferior al 4%.
`;

// ── Fase 12: 3.2 Diseño de la Propuesta ─────────────────────────────────────
// Contexto: 6 estrategias formuladas. Esta fase las articula en un diseño
// operativo concreto con flujos, roles y herramientas.
const CAP3B_DISENO = `# 3.2. Diseño de la Propuesta

## 3.2.1. Arquitectura del Sistema Propuesto

El sistema propuesto opera sobre tres capas:

- **Capa de datos:** base de datos centralizada en la nube con los movimientos de inventario y ventas de las cuatro sucursales en tiempo real.
- **Capa de gestión:** módulo de clasificación ABC, módulo de cálculo EOQ y punto de reorden, módulo de alertas y reportes, módulo de transferencias.
- **Capa de operación:** interfaces sencillas para el personal de sucursal (registro de venta y de movimiento) y para el equipo administrativo (revisión, autorización de orden de compra, autorización de transferencia).

## 3.2.2. Flujo Operativo Rediseñado

**Recepción de mercadería:** el dependiente que recibe escanea cada producto contra la orden de compra en el sistema, que valida cantidad y vencimiento. Las discrepancias se registran y escalan automáticamente al equipo administrativo.

**Venta y reposición:** cada venta descuenta del inventario en tiempo real. Cuando un SKU alcanza el punto de reorden, el sistema emite alerta al equipo administrativo. Cuando un SKU alcanza stock cero en una sucursal, el sistema verifica las otras tres y propone una transferencia si corresponde.

**Generación de órdenes de compra:** revisión semanal de los productos A y quincenal de los B y C. El sistema propone cantidades según EOQ; el equipo administrativo revisa y autoriza.

**Transferencia entre sucursales:** disparada automáticamente o manualmente. El sistema registra origen, destino, SKU, cantidad, hora de despacho y hora de recepción. Plazo objetivo 4 horas dentro del área urbana.

## 3.2.3. Roles y Responsabilidades

- **Gerencia General:** aprobación de la propuesta y de los acuerdos marco con distribuidores. Revisión mensual de indicadores agregados.
- **Equipo administrativo central (2 personas):** autorización de órdenes de compra, autorización de transferencias entre sucursales que crucen distrito, seguimiento de cumplimiento de los distribuidores.
- **Farmacéutico responsable por sucursal (4 personas):** validación del inventario propio, autorización de transferencias entre sucursales del mismo distrito, escalamiento de excepciones.
- **Dependientes (8 personas):** registro de venta, recepción de mercadería con validación contra orden, ejecución del protocolo de transferencia (recibir y entregar producto entre sucursales según corresponda).
- **Personal de logística (2 personas):** movimiento físico del producto entre sucursales según las transferencias autorizadas.

## 3.2.4. Indicadores del Sistema

El sistema produce los siguientes indicadores mensuales:

- Tasa de rotura por sucursal y por categoría ABC.
- Rotación del inventario por sucursal.
- Días de inventario por sucursal.
- Cumplimiento del distribuidor (plazo real vs. comprometido).
- Cantidad de transferencias ejecutadas y tiempo promedio.
- Vencimiento (% de inventario vencido sobre inventario total).

Los indicadores se revisan mensualmente con la Gerencia General y trimestralmente con todo el equipo.
`;

// ── Fase 13: 3.3 Plan de Implementación ─────────────────────────────────────
// Contexto: arquitectura y roles definidos. Esta fase pone fechas y
// responsables a la ejecución.
const CAP3C_IMPLEMENTACION = `# 3.3. Plan de Implementación

El plan de implementación se organiza en cinco fases secuenciales y se ejecuta durante el primer semestre de 2025.

## 3.3.1. Fase 1 — Preparación (Mes 1)

- Selección del proveedor del sistema de información en la nube.
- Firma de contrato y configuración inicial.
- Clasificación ABC del catálogo a partir de los datos históricos de venta.
- Cálculo inicial de punto de reorden y EOQ para los productos de categoría A.
- Negociación y firma del acuerdo marco con los tres distribuidores principales.

**Responsable:** Gerencia General + equipo administrativo central.
**Indicador de cumplimiento:** sistema configurado, clasificación cargada, acuerdos firmados.

## 3.3.2. Fase 2 — Capacitación (Mes 2)

- Ejecución del programa de 6 sesiones × 4 horas para los 16 colaboradores.
- Manuales operativos entregados (procedimiento de recepción, procedimiento de transferencia, uso del sistema).
- Evaluación de aprendizaje al cierre del programa.

**Responsable:** equipo administrativo central + consultor externo de gestión de inventarios.
**Indicador de cumplimiento:** 16/16 colaboradores aprobados en la evaluación; manuales operativos firmados.

## 3.3.3. Fase 3 — Piloto en una Sucursal (Mes 3)

- Activación del sistema solo en la sucursal de mayor venta (sucursal 1, distrito central).
- Operación paralela: planilla antigua + sistema nuevo durante 30 días.
- Revisión diaria de discrepancias y ajustes.
- Cierre del piloto: validación de la operación en sucursal 1.

**Responsable:** farmacéutico responsable sucursal 1 + equipo administrativo central.
**Indicador de cumplimiento:** rotura mensual en sucursal 1 reducida por debajo del 7% (intermedio entre línea base 12,4% y objetivo final 4%).

## 3.3.4. Fase 4 — Despliegue a las Otras Tres Sucursales (Meses 4 y 5)

- Activación del sistema en sucursales 2, 3 y 4 de forma escalonada (sucursal 2 al inicio del mes 4, sucursal 3 a mitad del mes 4, sucursal 4 al inicio del mes 5).
- Activación del protocolo de transferencia entre sucursales una vez que las 4 estén en línea.
- Seguimiento semanal de indicadores por sucursal.

**Responsable:** equipo administrativo central + farmacéutico responsable de cada sucursal.
**Indicador de cumplimiento:** rotura mensual consolidada por debajo del 6% al cierre del mes 5.

## 3.3.5. Fase 5 — Estabilización y Cierre del Proyecto (Mes 6)

- Operación regular con el nuevo sistema.
- Primera revisión mensual completa con Gerencia.
- Ajustes finos sobre la base de la primera medición consolidada.
- Documentación final del proyecto y traspaso a operación.

**Responsable:** Gerencia General + equipo administrativo central.
**Indicador de cumplimiento:** rotura mensual por debajo del 4% al cierre del mes 6.

## 3.3.6. Cronograma Resumido

| Mes | Hito principal |
|---|---|
| Mes 1 | Sistema configurado + ABC cargado + acuerdo marco firmado |
| Mes 2 | 16 colaboradores capacitados |
| Mes 3 | Piloto sucursal 1: rotura < 7% |
| Mes 4 | Despliegue sucursales 2 y 3 |
| Mes 5 | Despliegue sucursal 4 + transferencia entre sucursales activa |
| Mes 6 | Operación regular: rotura < 4% |
`;

// ── Fase 14: 3.4 Plan de Seguimiento y Control ─────────────────────────────
// Contexto: implementación definida. Esta fase asegura sostenibilidad
// post-cierre del proyecto.
const CAP3D_SEGUIMIENTO = `# 3.4. Plan de Seguimiento y Control

## 3.4.1. Indicadores de Seguimiento Mensual

Los indicadores del sistema (sección 3.2.4) se reportan mensualmente con la siguiente jerarquía:

- **Indicador principal:** tasa de rotura mensual consolidada. Meta: por debajo de 4% sostenida.
- **Indicadores secundarios:** rotación del inventario (meta: 8 a 10 veces anuales), días de inventario (meta: entre 36 y 45 días), tasa de vencimiento (meta: por debajo del 0,8% del inventario promedio).
- **Indicadores operativos:** cumplimiento del distribuidor (meta: por encima del 92%), cantidad de transferencias y tiempo promedio (meta: 4 horas), errores en recepción contra orden (meta: por debajo del 1,5%).

## 3.4.2. Gobierno del Sistema

- **Revisión mensual** entre Gerencia General y equipo administrativo central, con el reporte de los indicadores y plan de acción ante desviaciones.
- **Revisión trimestral** ampliada con farmacéuticos responsables y representantes del personal operativo, para detectar oportunidades de ajuste no visibles en los indicadores agregados.
- **Revisión anual** del acuerdo marco con los distribuidores, evaluando el cumplimiento mutuo y renegociando condiciones si corresponde.

## 3.4.3. Mecanismos de Acción ante Desviaciones

Cuando un indicador se desvía de la meta más allá de un umbral acordado, se dispara el siguiente protocolo:

- **Diagnóstico inmediato:** identificación de la sucursal y los SKUs involucrados.
- **Plan de acción acotado:** medidas correctivas con responsable y plazo (típicamente 7 días).
- **Verificación de cumplimiento:** revisión a los 30 días para confirmar que la corrección sostiene.

Las desviaciones recurrentes se elevan al gobierno mensual para análisis estructural y eventual ajuste de las reglas del sistema.

## 3.4.4. Continuidad y Mejora Continua

Al cierre del primer año de operación se realiza una evaluación integral del sistema con tres focos: revisión de la clasificación ABC con los datos de venta acumulados del año, recalibración de los puntos de reorden y EOQ con la demanda actualizada, y evaluación de la satisfacción del personal con el sistema. Los hallazgos alimentan el plan de mejora continua para el segundo año.
`;

// ── Fase 15: 3.5 Evaluación Financiera ──────────────────────────────────────
// Contexto: propuesta diseñada con costos identificables. Esta fase
// cuantifica la inversión y demuestra la viabilidad financiera con
// VAN, TIR y B/C, en línea con la promesa del Resumen Ejecutivo.
const CAP3E_FINANCIERA = `# 3.5. Evaluación Financiera

## 3.5.1. Inversión Inicial

La inversión incremental requerida para implementar la propuesta se estima en **Bs. 95.000**, distribuida así:

| Rubro | Monto (Bs.) | Participación |
|---|---:|---:|
| Licencias del sistema de información (12 meses anticipados) | 32.000 | 33,7% |
| Hardware adicional (escáneres de código de barras, tablets de sucursal) | 18.000 | 18,9% |
| Honorarios de consultoría para configuración inicial e implementación | 24.000 | 25,3% |
| Programa de capacitación (consultor externo + materiales) | 9.500 | 10,0% |
| Costos de migración de datos y carga histórica | 6.500 | 6,8% |
| Reserva para contingencias (5%) | 5.000 | 5,3% |
| **Total** | **95.000** | **100,0%** |

## 3.5.2. Estructura de Financiamiento

La inversión se cubre con flujo de caja propio de BoliFarma, distribuido en los seis meses del plan de implementación. La empresa cuenta con la liquidez para asumir esta inversión sin necesidad de financiamiento externo, lo que elimina el componente de gasto financiero del análisis.

## 3.5.3. Beneficios Esperados (Proyección a 3 años)

Los beneficios se estiman en dos categorías:

**Recuperación de venta por reducción de rotura.** La línea base de rotura es del 12,4% mensual con pérdida de venta de Bs. 38.500/mes. El objetivo es rotura por debajo del 4%. Se aplica una proyección conservadora:

- Año 1: rotura promedio del 6% (rampa: meses 1-2 = 12,4%, meses 3-5 = 7%, meses 6-12 = 4,5%). Recuperación de venta del 51% de la base = Bs. 235.620.
- Año 2: rotura sostenida del 4%. Recuperación del 68% de la base = Bs. 314.160.
- Año 3: rotura sostenida del 4%. Recuperación del 68% de la base = Bs. 314.160.

**Reducción de obsolescencia.** La operación actual sin ABC ni EOQ genera 1,4% mensual de inventario vencido o deteriorado. La meta es 0,8%. Sobre un inventario promedio valorado en Bs. 320.000, la mejora libera Bs. 23.040 anuales sostenidos a partir del año 2.

**Margen neto sobre la venta recuperada.** El margen promedio del rubro farmacéutico minorista es del 18,5%. Se aplica este margen sobre la venta recuperada para obtener el beneficio neto efectivo.

## 3.5.4. Flujo de Caja Proyectado

| Año | Inversión / costo (Bs.) | Beneficio neto (Bs.) | Flujo neto (Bs.) |
|---:|---:|---:|---:|
| 0 | (95.000) | 0 | (95.000) |
| 1 | (12.000) (licencias renovación + soporte) | 43.590 | 31.590 |
| 2 | (12.000) | 81.180 | 69.180 |
| 3 | (12.000) | 81.180 | 69.180 |

## 3.5.5. Indicadores de Evaluación

Aplicando los indicadores estandarizados con tasa de descuento del 14% (costo de oportunidad ajustado por riesgo):

- **Valor Actual Neto (VAN):** **Bs. 184.620** (positivo, agrega valor sobre la mejor alternativa de uso del capital).
- **Tasa Interna de Retorno (TIR):** **31,4%** (supera el costo de oportunidad del 14%).
- **Relación Beneficio-Costo (B/C):** **1,87** (cada Bs. invertido genera Bs. 1,87 de beneficio actualizado).
- **Período de recuperación de la inversión (Payback):** **14 meses**.

## 3.5.6. Análisis de Sensibilidad

Se analizó la sensibilidad ante tres variables críticas:

- **Tasa de rotura sostenida del año 2 y 3:** si la rotura final fuera del 6% en lugar de 4%, el VAN sigue siendo positivo en Bs. 102.450.
- **Inversión inicial superior en 20%:** si la inversión total fuera Bs. 114.000, el VAN sigue siendo positivo en Bs. 165.620.
- **Margen efectivo del rubro inferior al 18,5%:** si fuera 15%, el VAN sigue siendo positivo en Bs. 134.840.

El proyecto mantiene viabilidad financiera ante variaciones razonables de las variables críticas.

## 3.5.7. Conclusión Financiera

Los indicadores VAN, TIR, B/C y Payback sustentan la viabilidad financiera de la propuesta bajo los supuestos definidos. La sensibilidad muestra robustez ante variaciones moderadas. El principal riesgo financiero identificado es el ritmo de adopción del nuevo sistema por parte del personal, que el plan de implementación aborda con el programa de capacitación y el piloto previo al despliegue.
`;
export const MEJORA_ORG_DEMO_SEED: DemoSeed = {
  seed_id: "mejora-bolifarma-v1",
  universidad_id: "unifranz-cba-001",
  servicio_id: "proy-grado-001",
  tipo_proyecto_id: "unifranz-pg-mejora-org",
  modalidad_titulacion: "unifranz-pg-mejora-org",
  tema:
    "Propuesta de mejora del sistema de gestión de inventarios para reducir la rotura de stock en BoliFarma S.R.L., cadena farmacéutica de Cochabamba (gestión 2025)",
  academic_context_extra: {
    contexto_inicial: {
      programa: "Ingeniería Comercial",
      materias: "",
      intereses_y_contexto:
        "Estudio de Mejora Organizacional sobre una cadena farmacéutica boliviana con cuatro sucursales en el área urbana de Cochabamba. Problema diagnosticado: rotura de stock del 12,4% mensual con pérdida de venta estimada en Bs. 38.500 mensuales y caída de visitas repetidas del 18% interanual. La propuesta integra clasificación ABC, modelo EOQ, sistema integrado, acuerdo marco con distribuidores y protocolo de transferencia entre sucursales.",
    },
    empresa: "BoliFarma S.R.L.",
    localizacion: "Municipio de Cochabamba (Cercado), Departamento de Cochabamba",
    horizonte_propuesta: "Gestión 2025, evaluación financiera 2025–2028",
  },
  fases_contenido: {
    "ph-unifranz-pg-mejora-org-resumen": RESUMEN,
    "ph-unifranz-pg-mejora-org-introduccion": INTRODUCCION,
    "ph-unifranz-pg-mejora-org-cap1": CAP1_MARCO_TEORICO,
    "ph-unifranz-pg-mejora-org-cap2-investigacion": CAP2_HEADER,
    "ph-unifranz-pg-mejora-org-cap2a-microentorno": CAP2A_MICROENTORNO,
    "ph-unifranz-pg-mejora-org-cap2b-institucional": CAP2B_INSTITUCIONAL,
    "ph-unifranz-pg-mejora-org-cap2c-matricial": CAP2C_MATRICIAL,
    "ph-unifranz-pg-mejora-org-cap2d-metodologia": CAP2D_METODOLOGIA,
    "ph-unifranz-pg-mejora-org-cap2e-mercado": CAP2E_MERCADO,
    "ph-unifranz-pg-mejora-org-cap3-propuesta": CAP3_HEADER,
    "ph-unifranz-pg-mejora-org-cap3a-estrategias": CAP3A_ESTRATEGIAS,
    "ph-unifranz-pg-mejora-org-cap3b-diseno": CAP3B_DISENO,
    "ph-unifranz-pg-mejora-org-cap3c-implementacion": CAP3C_IMPLEMENTACION,
    "ph-unifranz-pg-mejora-org-cap3d-seguimiento": CAP3D_SEGUIMIENTO,
    "ph-unifranz-pg-mejora-org-cap3e-financiera": CAP3E_FINANCIERA,
    // Conclusiones, recomendaciones, bibliografía, compilación y defensa en
    // el próximo commit.
  },
};
