/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SEED DEMO — Programa de Fidelización Restaurante Sumaq Mikhuna
 *             (UNIFRANZ · Trabajo Dirigido)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * SERVER-ONLY. Contenido generado fase por fase simulando llamadas a la API
 * con contexto creciente.
 *
 * Caso: estudiante de Ingeniería Comercial trabajando como administrador en
 * Sumaq Mikhuna, restaurante de comida boliviana del área urbana de
 * Cochabamba. Identifica el problema (baja tasa de retención de clientes)
 * y propone implementar un programa de fidelización.
 *
 * IDs: getUnifranzPhases("unifranz-trabajo-dirigido") →
 *      ph-unifranz-trabajo-dirigido-{slug}
 */

import type { DemoSeed } from "./agrohubDemo";

// ── Fase 1: Resumen ─────────────────────────────────────────────────────────
const RESUMEN = `# RESUMEN DEL TRABAJO

El presente Trabajo Dirigido se desarrolló en el Restaurante Sumaq Mikhuna, establecimiento gastronómico de cocina boliviana ubicado en la zona central del área urbana del municipio de Cochabamba, durante la gestión 2025. El objetivo general consistió en diseñar e implementar un programa de fidelización de clientes que incremente la tasa de retención mensual del 28% actual al menos al 45% en los seis meses posteriores a la implementación, mediante mecanismos de acumulación de beneficios, comunicación digital sostenida y reconocimiento al cliente recurrente.

El trabajo se desarrolló en cuatro fases: diagnóstico institucional del restaurante con análisis del microentorno, análisis institucional con cadena de valor, matrices MEFE-MEFI-FODA y estudio de mercado a clientes habituales (n = 180); diseño del programa de fidelización con sus componentes (tarjeta digital con código QR, sistema de puntos, beneficios escalonados, comunicación por WhatsApp Business); plan de implementación articulado con el calendario operativo del restaurante; y seguimiento de los primeros tres meses de operación del programa con medición de los indicadores clave de adopción y retención.

Los resultados de los primeros tres meses muestran 412 clientes registrados en el programa (sobre una base estimada de 1.100 clientes habituales del establecimiento), una tasa de retención mensual que ascendió del 28% a 41% al cierre del tercer mes (en trayectoria favorable para alcanzar el objetivo del 45% en seis meses), un ticket promedio incrementado un 9% entre clientes registrados respecto de no registrados, y una mejora cualitativa de la relación con el cliente reflejada en una calificación de servicio que pasó de 4,1 a 4,5 sobre 5 en plataformas de reseñas. La evaluación financiera proyectó un retorno de la inversión inferior a 4 meses con un VAN positivo a tres años.
`;

// ── Fase 2: Introducción ────────────────────────────────────────────────────
const INTRODUCCION = `# INTRODUCCIÓN

El sector gastronómico de Cochabamba ha experimentado en los últimos años una intensificación competitiva que ha colocado a la fidelización del cliente como factor decisivo de sostenibilidad para los restaurantes medianos. La proliferación de opciones, las plataformas digitales de comparación y la sensibilidad creciente del consumidor a la experiencia integral del servicio han hecho que captar un cliente nuevo cueste sistemáticamente más que mantener uno existente. En este contexto, las herramientas de fidelización profesional —tarjetas digitales, sistemas de puntos, programas de reconocimiento— han dejado de ser exclusivas de cadenas grandes para volverse accesibles a establecimientos medianos.

El presente Trabajo Dirigido se desarrolló en el Restaurante Sumaq Mikhuna, donde el estudiante autor cumple funciones de administración desde hace dos años. El documento se organiza en una Introducción que delimita el problema, los objetivos y los alcances; un Capítulo I de Marco Teórico sobre fidelización de clientes en el rubro gastronómico; un Capítulo II de Investigación con el diagnóstico institucional del restaurante; un Capítulo III de Propuesta con el diseño e implementación del programa de fidelización; y un apartado final de conclusiones y recomendaciones.

## 1. Planteamiento del Problema

Sumaq Mikhuna opera desde el año 2018 en la zona central de Cochabamba como restaurante de cocina boliviana tradicional con propuesta de calidad media-alta. Atiende almuerzos de lunes a sábado y cenas de jueves a sábado, con capacidad de 48 comensales por turno. El ticket promedio se sitúa en Bs. 65 por persona en almuerzo y Bs. 85 en cena. La base de clientes habituales se estima en 1.100 personas, de las cuales aproximadamente el 28% retorna al menos una vez al mes.

Durante los últimos 12 meses la administración del restaurante ha observado tres señales preocupantes: caída de visitas repetidas del 11% interanual, incremento de la dependencia de plataformas de delivery (que cobran comisión del 18% al 25% sobre el ticket), y crecimiento del costo de adquisición de cliente nuevo medido por las campañas publicitarias necesarias para reemplazar a los clientes perdidos. Estas tres señales convergen en un mismo problema: la baja retención del cliente erosiona la rentabilidad del establecimiento más allá de lo que la captación de nuevos clientes puede compensar.

De mantenerse esta situación, el restaurante proyecta una caída adicional de visitas repetidas del 6% al 8% en la gestión 2025, con el consecuente incremento de la dependencia de canales con alta comisión y un deterioro progresivo del margen operativo. El costo de oportunidad de no implementar un programa de fidelización se estima en una pérdida de margen anual superior a Bs. 32.000.

En función de lo expuesto, el problema se formuló de la siguiente manera: ¿Cómo diseñar e implementar un programa de fidelización de clientes en el Restaurante Sumaq Mikhuna que incremente significativamente la tasa de retención mensual del 28% actual durante la gestión 2025?

## 2. Justificación

### 2.1. Justificación Práctica

El trabajo entrega al restaurante un programa de fidelización diseñado, implementado y en operación, con sus protocolos, materiales de comunicación y mecanismos de seguimiento. La transferencia es directa: al cierre del trabajo el programa queda funcionando como activo operativo del establecimiento.

### 2.2. Justificación Económica

El incremento de la retención del 28% al 45% se traduce en aproximadamente 187 visitas repetidas adicionales por mes, con ticket promedio de Bs. 75. Esto representa Bs. 14.025 mensuales en ingresos recuperados, equivalentes a Bs. 168.300 anuales. La inversión incremental requerida para implementar el programa se estima en Bs. 18.500 (sistema digital + materiales + comunicación inicial), con retorno inferior a 4 meses.

### 2.3. Justificación Social

El programa fortalece la economía local al apoyar la sostenibilidad de un restaurante de cocina boliviana tradicional, que es a la vez fuente de empleo (12 colaboradores) y promotor de patrimonio gastronómico regional. La fidelización profesional consolida la relación entre el cliente cochabambino y la oferta gastronómica de identidad local.

### 2.4. Justificación Legal

El programa cumple con la Ley N.° 453 de Defensa del Consumidor (2013) en cuanto a transparencia de las condiciones de los beneficios, manejo de datos personales de los clientes registrados y normativa de promociones del Servicio de Impuestos Nacionales. Las tarjetas digitales se diseñaron sin elementos que podrían confundirse con instrumentos de pago bajo regulación ASFI.

### 2.5. Justificación Teórica

El estudio aplica el cuerpo teórico sobre fidelización de clientes y customer relationship management (kotler & armstrong, 2017) al contexto del restaurante mediano boliviano, donde la evidencia empírica sobre implementación de programas de fidelización es escasa. Documenta de manera transparente el proceso completo de diseño e implementación, aportando una referencia para futuros trabajos similares.

## 3. Objetivos

### 3.1. Objetivo General

Diseñar e implementar un programa de fidelización de clientes en el Restaurante Sumaq Mikhuna que incremente la tasa de retención mensual del 28% al 45% durante la gestión 2025, mediante mecanismos digitales de acumulación de beneficios y comunicación profesional con los clientes habituales.

### 3.2. Objetivos Específicos

1. Construir el marco teórico sobre fidelización de clientes y CRM aplicado al rubro gastronómico.
2. Diagnosticar la situación actual del restaurante mediante análisis del microentorno, análisis institucional y análisis matricial.
3. Caracterizar a los clientes habituales del restaurante mediante un estudio de mercado focalizado.
4. Diseñar el programa de fidelización con sus componentes (tarjeta digital, sistema de puntos, beneficios, comunicación).
5. Implementar el programa y dar seguimiento durante los primeros tres meses de operación.
6. Evaluar la viabilidad financiera del programa.

## 4. Alcances

### 4.1. Alcance Temático

El trabajo abordó las temáticas de fidelización de clientes, gestión de la relación con el cliente, marketing digital aplicado a restaurantes y planificación operativa. No se profundizó en aspectos contables ni en la gestión de inventarios del restaurante, que están fuera del alcance del Trabajo Dirigido.

### 4.2. Alcance Temporal

El alcance temporal del trabajo cubre la gestión 2025. El programa se diseñó durante el primer trimestre, se implementó al inicio del segundo trimestre, y se midieron tres meses de operación dentro del período del documento.

### 4.3. Alcance Espacial

El estudio se circunscribió al Restaurante Sumaq Mikhuna, ubicado en la zona central del área urbana del municipio de Cochabamba.

## 5. Hipótesis

### 5.1. Hipótesis General

Si se implementa un programa de fidelización digital basado en tarjeta con código QR, sistema de puntos por consumo, beneficios escalonados y comunicación profesional con clientes habituales, entonces la tasa de retención mensual del Restaurante Sumaq Mikhuna se incrementa del 28% al menos al 45% durante los seis meses posteriores a la implementación.

### 5.2. Variable Independiente

**Programa de fidelización implementado.** Indicadores: número de clientes registrados, frecuencia de uso del programa, cantidad de comunicaciones enviadas por canal, alcance efectivo de las comunicaciones.

### 5.3. Variable Dependiente

**Tasa de retención mensual de clientes.** Indicadores: porcentaje de clientes que regresan al menos una vez al mes, frecuencia mensual promedio de visitas, ticket promedio por cliente registrado vs no registrado.

### 5.4. Variable Intercurrente

**Consistencia operativa del servicio durante el período de implementación.** Constituye la variable que media entre el programa y la retención: un programa de fidelización profesional no compensa fallas operativas del servicio (lentitud, errores en el pedido, calidad inconsistente). Se asume controlada mediante el monitoreo continuo de la calificación de servicio en plataformas de reseñas.

Definidos el problema, los objetivos, los alcances y la hipótesis, el documento avanza hacia el Capítulo I, que desarrolla el marco teórico; continúa con el Capítulo II, que presenta el diagnóstico institucional; prosigue con el Capítulo III, que detalla el diseño e implementación del programa; y culmina con las conclusiones y recomendaciones.
`;

// ── Fase 3: Cap I — Marco Teórico ───────────────────────────────────────────
const CAP1_MARCO_TEORICO = `# CAPÍTULO I — MARCO TEÓRICO

## 1.1. Antecedentes del Estudio

La fidelización de clientes en el rubro gastronómico ha sido objeto de estudios crecientes en las últimas dos décadas. A nivel internacional, kotler y armstrong (2017) documentaron que el costo de captar un cliente nuevo es entre cinco y siete veces superior al costo de retener uno existente, relación que se sostiene a través de la mayoría de los rubros de servicio. En el contexto latinoamericano, estudios sobre restaurantes urbanos han evidenciado que los programas formales de fidelización incrementan la retención mensual entre 12 y 25 puntos porcentuales en plazos de 6 a 12 meses (chen, dimitri, & gardiner, 2020).

## 1.2. Bases Teóricas

### 1.2.1. Fidelización de Clientes

La fidelización se define como el conjunto de acciones diseñadas para que el cliente actual vuelva a comprar, recomiende al establecimiento y desarrolle vínculo emocional con la marca (kotler & armstrong, 2017, p. 162). Su valor estratégico reside en que el cliente fidelizado tiene mayor ticket promedio, mayor frecuencia de compra y menor sensibilidad al precio comparativo de competidores.

### 1.2.2. Customer Relationship Management (CRM)

El CRM se define como la estrategia organizacional centrada en construir relaciones de largo plazo con los clientes mediante la gestión sistemática de la información del cliente, la personalización de la comunicación y la coordinación de las acciones comerciales en todos los puntos de contacto (peppers & rogers, 2011). En su versión digital, el CRM se apoya en sistemas de información que registran cada interacción del cliente con la empresa y permiten segmentar y personalizar respuestas.

### 1.2.3. Programas de Fidelización: Tipos y Componentes

La literatura agrupa los programas de fidelización en cuatro tipos principales (kumar & shah, 2004):

- **Programas de puntos:** el cliente acumula puntos por cada compra que se canjean por beneficios. Es el tipo más común en el rubro gastronómico.
- **Programas escalonados o de niveles:** el cliente alcanza niveles superiores con mayor frecuencia de compra, accediendo a beneficios crecientes.
- **Programas de membresía:** el cliente paga una cuota fija y recibe beneficios permanentes (poco frecuente en restaurantes medianos).
- **Programas de afinidad:** orientados a comunidades específicas con valores compartidos.

El programa propuesto en el Capítulo III combina componentes de puntos y escalonado, formato adecuado al tamaño del establecimiento y a los hábitos del consumidor cochabambino documentados en el estudio de mercado.

### 1.2.4. Comunicación Digital con Clientes

La comunicación digital con clientes habituales en el sector gastronómico se ha consolidado alrededor de tres canales (chaffey & ellis-chadwick, 2019): WhatsApp Business para comunicación personalizada y respuesta inmediata, redes sociales (Instagram, Facebook) para contenido aspiracional y novedades, y correo electrónico para comunicaciones programadas con segmentación. La elección del canal depende del perfil del cliente: clientes habituales del segmento medio-alto valoran la comunicación personalizada por WhatsApp por sobre la masiva por redes.

### 1.2.5. Indicadores de Desempeño en Fidelización

Los indicadores estándar para evaluar un programa de fidelización son (kumar & shah, 2004):

- **Tasa de retención mensual:** porcentaje de clientes que regresan al menos una vez al mes.
- **Frecuencia de visita:** veces que un cliente promedio visita el establecimiento en un período.
- **Customer Lifetime Value (CLV):** valor presente neto de los flujos futuros esperados de un cliente durante el horizonte de su relación con la marca.
- **Net Promoter Score (NPS):** disposición a recomendar el establecimiento, medida en escala 0-10.
- **Ticket promedio por cliente registrado vs no registrado:** indicador del impacto incremental del programa.

## 1.3. Marco Conceptual

- **Cliente habitual:** cliente con al menos una visita al establecimiento en los últimos seis meses.
- **Retención mensual:** proporción de clientes habituales que regresa al menos una vez en un mes calendario.
- **Tarjeta digital:** representación electrónica de la membresía del cliente al programa, típicamente con código QR para identificación.
- **Punto de fidelización:** unidad de valor acumulado que el cliente puede canjear por beneficios.
- **Beneficio escalonado:** ventaja que el cliente desbloquea al alcanzar un cierto nivel de acumulación de puntos.

## 1.4. Marco Contextual

El Restaurante Sumaq Mikhuna opera desde el año 2018 con un local propio en zona central de Cochabamba, capacidad de 48 comensales por turno, atención de almuerzos (lunes a sábado) y cenas (jueves a sábado). Cuenta con 12 colaboradores fijos (1 gerente-administrador, 1 jefe de cocina, 3 cocineros, 5 meseros, 1 cajero, 1 personal de limpieza). El ticket promedio se sitúa en Bs. 65 (almuerzo) y Bs. 85 (cena). La oferta gastronómica es cocina boliviana tradicional con interpretación contemporánea. La base de clientes habituales se estima en 1.100 personas con retención mensual del 28%.
`;

// ── Fase 4: Cap II — Header ─────────────────────────────────────────────────
const CAP2_HEADER = `# CAPÍTULO II — INVESTIGACIÓN

El presente capítulo desarrolla el diagnóstico institucional del Restaurante Sumaq Mikhuna y la investigación de campo realizada para fundamentar el programa de fidelización propuesto. La estructura sigue la guía UNIFRANZ 2017 sección 4.2.4 para la modalidad Trabajo Dirigido y se organiza en cinco bloques: análisis del microentorno con el modelo de las cinco fuerzas de Porter aplicado al rubro gastronómico de Cochabamba (sección 2.1), análisis institucional con cadena de valor del restaurante y mapeo de procesos críticos (sección 2.2), análisis matricial con MEFE-MEFI-FODA (sección 2.3), metodología de investigación aplicada (sección 2.4) y resultados del estudio de mercado dirigido a clientes habituales del establecimiento (sección 2.5).
`;

// ── Fase 5: 2.1 Microentorno ────────────────────────────────────────────────
const CAP2A_MICROENTORNO = `# 2.1. Análisis del Microentorno

El análisis aplicó el modelo de las cinco fuerzas de porter al rubro gastronómico de cocina boliviana tradicional en el área urbana de Cochabamba.

## 2.1.1. Poder de Negociación de los Proveedores

Los proveedores del restaurante son mercados mayoristas de productos frescos, distribuidores de carnes, distribuidores de bebidas y proveedores de insumos no perecibles. Su poder se evaluó como **moderado**: la oferta es competitiva con múltiples alternativas para cada categoría, lo que da al restaurante capacidad de negociación. La excepción son los productos especializados (ciertas carnes premium, productos regionales específicos) donde el poder del proveedor es alto.

## 2.1.2. Poder de Negociación de los Clientes

El cliente individual no negocia precios pero sí elige libremente entre múltiples opciones de la zona. Su poder se evaluó como **alto** en términos de elección, lo que coloca a la calidad del servicio y a la fidelización como variables competitivas centrales.

## 2.1.3. Amenaza de Nuevos Entrantes

La amenaza es **alta** en el rubro gastronómico medio. El capital para abrir un restaurante mediano es accesible, las barreras regulatorias son cumplibles y la oferta es atractiva por márgenes. Sumaq Mikhuna ha visto abrir 6 nuevos restaurantes en su radio competitivo en los últimos dos años.

## 2.1.4. Amenaza de Productos Sustitutos

Los sustitutos son otros restaurantes de cocina boliviana, restaurantes de otras cocinas (italiana, asiática, peruana), comedores populares de menor precio y el consumo doméstico. La amenaza se evaluó como **alta** dada la riqueza de la oferta gastronómica cochabambina.

## 2.1.5. Rivalidad entre Competidores Existentes

La rivalidad en el rubro gastronómico medio-alto del centro de Cochabamba es **muy alta**. La diferenciación se construye sobre identidad gastronómica, consistencia del servicio y vinculación con el cliente habitual. El programa de fidelización propuesto se inserta en este último vector.

## 2.1.6. Síntesis

El rubro presenta intensidad competitiva alta en cuatro de las cinco fuerzas. La defensa de la posición de Sumaq Mikhuna pasa por construir relaciones de largo plazo con sus clientes habituales, lo que sustenta la pertinencia del programa de fidelización.
`;

// ── Fase 6: 2.2 Institucional ───────────────────────────────────────────────
const CAP2B_INSTITUCIONAL = `# 2.2. Análisis Institucional

## 2.2.1. Cadena de Valor de Sumaq Mikhuna

**Actividades primarias:**

- **Logística de entrada:** abastecimiento diario de productos frescos a las 7:00 am, semanal de productos no perecibles. Sin sistema formal de control de inventario.
- **Operaciones:** preparación de los platos en la cocina, servicio en el comedor. Horarios: almuerzo 12:00-15:00 y cena 19:00-23:00 según día.
- **Logística de salida:** servicio en mesa y, desde 2022, despacho a plataformas de delivery (PedidosYa, Hugo).
- **Marketing y ventas:** presencia activa en Instagram y Facebook con publicación semanal, sin segmentación profesional ni comunicación uno-a-uno con clientes habituales.
- **Servicio al cliente:** atención del mesero y del cajero al pagar. Sin protocolo formal de seguimiento post-visita.

**Actividades de apoyo:**

- **Infraestructura:** local propio de 110 m², equipamiento de cocina industrial básico, sistema de facturación electrónica.
- **Recursos humanos:** 12 colaboradores con rotación baja (2 salidas en los últimos 18 meses).
- **Tecnología:** punto de venta básico, redes sociales operadas por la gerencia, sin CRM ni base de datos de clientes.
- **Compras:** centralizadas en el gerente-administrador.

## 2.2.2. Procesos Críticos para la Fidelización

El mapeo identificó cuatro procesos donde se construye o se pierde la fidelización:

1. **Atención del mesero:** primer punto de contacto. La consistencia es buena pero no se aprovecha el momento para registrar al cliente.
2. **Servicio del plato:** calidad y tiempo de preparación. Tiempo promedio actual 18 minutos, dentro de estándar.
3. **Momento del pago:** oportunidad perdida — el cajero entrega la factura y agradece, sin invitación a registrarse en un programa ni a seguir las redes sociales.
4. **Comunicación post-visita:** inexistente. El restaurante no contacta proactivamente al cliente entre visitas.

Los procesos 3 y 4 son los que el programa de fidelización transforma directamente.

## 2.2.3. Diagnóstico de la Situación Actual

La retención del 28% mensual se explica por la convergencia de tres factores institucionales:

- **Ausencia de identificación del cliente habitual:** el restaurante no sabe quién regresa porque no registra la identidad del comensal en ninguna interacción.
- **Ausencia de comunicación post-visita:** sin canal directo, el restaurante depende de redes sociales para recordar su existencia al cliente, con bajo alcance efectivo.
- **Ausencia de incentivos al cliente recurrente:** todos los clientes reciben la misma propuesta, sin reconocimiento diferencial al que regresa con frecuencia.

El programa propuesto corrige los tres factores institucionales identificados.
`;

// ── Fase 7: 2.3 Matricial ──────────────────────────────────────────────────
const CAP2C_MATRICIAL = `# 2.3. Análisis Matricial

## 2.3.1. Matriz MEFE

| Factor externo | Peso | Cal. | Pts. |
|---|---:|---:|---:|
| Crecimiento del consumo gastronómico urbano | 0,12 | 4 | 0,48 |
| Adopción masiva de WhatsApp Business | 0,11 | 4 | 0,44 |
| Disponibilidad de plataformas CRM accesibles | 0,10 | 3 | 0,30 |
| Valoración creciente de la cocina boliviana | 0,09 | 3 | 0,27 |
| Apertura de nuevos competidores | 0,13 | 1 | 0,13 |
| Dependencia creciente de delivery con alta comisión | 0,12 | 2 | 0,24 |
| Sensibilidad al precio del cliente medio | 0,08 | 2 | 0,16 |
| Conectividad móvil estable en la zona | 0,08 | 3 | 0,24 |
| Tipo de cambio estable | 0,07 | 3 | 0,21 |
| Reseñas en plataformas como factor de elección | 0,10 | 4 | 0,40 |
| **Total** | **1,00** | | **2,87** |

## 2.3.2. Matriz MEFI

| Factor interno | Peso | Cal. | Pts. |
|---|---:|---:|---:|
| Identidad gastronómica diferenciada | 0,13 | 4 | 0,52 |
| Local propio en zona central | 0,11 | 4 | 0,44 |
| Equipo estable con baja rotación | 0,09 | 3 | 0,27 |
| Consistencia operativa del servicio | 0,10 | 3 | 0,30 |
| Trayectoria de 7 años | 0,07 | 3 | 0,21 |
| Sin CRM ni base de clientes | 0,14 | 1 | 0,14 |
| Sin comunicación post-visita | 0,11 | 1 | 0,11 |
| Sin programa de fidelización | 0,12 | 1 | 0,12 |
| Marketing digital de bajo alcance efectivo | 0,08 | 2 | 0,16 |
| Dependencia creciente de delivery | 0,05 | 2 | 0,10 |
| **Total** | **1,00** | | **2,37** |

## 2.3.3. FODA Estratégico

| | **Oportunidades (O)** | **Amenazas (A)** |
|---|---|---|
| **F** | Aprovechar la identidad gastronómica como pilar del programa de fidelización. Comunicar reseñas positivas a los clientes registrados. | Convertir trayectoria + equipo estable en propuesta de valor sostenible frente a nuevos entrantes. |
| **D** | Implementar CRM + WhatsApp Business para corregir las debilidades de comunicación. Construir base de datos a partir del programa de fidelización. | Reducir dependencia de delivery con programa que aumente venta directa. Defender posición antes que la competencia consolide ventaja. |

MEFE 2,87 + MEFI 2,37 → cuadrante "crecer y construir". Estrategia priorizada: corregir debilidades internas (CRM, comunicación) aprovechando oportunidades del entorno digital.
`;

// ── Fase 8: 2.4 Metodología ─────────────────────────────────────────────────
const CAP2D_METODOLOGIA = `# 2.4. Metodología de Investigación

## 2.4.1. Tipo y Diseño

Investigación **aplicada** con enfoque **mixto**. El componente cuantitativo se aplicó al estudio de clientes habituales; el cualitativo a entrevistas con el equipo del restaurante. Diseño **no experimental, transversal** para el diagnóstico, y **cuasi-experimental** para el seguimiento del programa implementado (comparación antes-después).

## 2.4.2. Población y Muestra

**Población:** clientes habituales del restaurante (n ≈ 1.100). **Muestra:** 180 clientes encuestados (nivel de confianza 95%, error 7%). Selección por captación directa en el establecimiento durante 4 semanas y por contacto con clientes registrados en redes sociales.

## 2.4.3. Técnicas e Instrumentos

- **Encuesta a clientes (n=180):** cuestionario de 18 preguntas sobre frecuencia de visita, factores de elección, disposición a un programa de fidelización, beneficios valorados, canal de comunicación preferido.
- **Entrevista a colaboradores (n=12):** guía semi-estructurada sobre percepción de la relación con clientes y disposición al programa.
- **Revisión de registros operativos:** facturación de los últimos 12 meses, calificaciones en plataformas de reseñas, métricas de redes sociales.

## 2.4.4. Procesamiento

Excel con estadística descriptiva y tablas de contingencia. Codificación temática para las entrevistas.
`;

// ── Fase 9: 2.5 Mercado ──────────────────────────────────────────────────────
const CAP2E_MERCADO = `# 2.5. Estudio de Mercado

## 2.5.1. Resultados de la Encuesta a Clientes

- **Frecuencia de visita actual:** 28% visita al menos una vez al mes (línea base de retención). 47% cada 2-3 meses. 25% una vez por semestre o menos.
- **Factores de elección:** sabor (4,6/5), ambiente (4,4/5), atención (4,3/5), precio (3,8/5), conveniencia de ubicación (3,9/5).
- **Disposición a un programa de fidelización:** 81,1% se mostró favorable. El 12,2% prefiere no participar y el 6,7% no respondió.
- **Beneficios valorados (orden de preferencia):** descuento en el ticket (62%), plato gratis al alcanzar nivel (28%), invitación a eventos especiales del restaurante (15%), bebida cortesía (11%) — los porcentajes superan 100% porque la pregunta permitía múltiples respuestas.
- **Canal de comunicación preferido:** WhatsApp (68%), Instagram (24%), correo electrónico (8%). El predominio de WhatsApp coincide con la tendencia del rubro descrita en el Cap I.

## 2.5.2. Resultados de las Entrevistas a Colaboradores

- 11 de 12 colaboradores expresaron disposición favorable a operar el programa.
- 9 de 12 sugirieron que el momento óptimo para invitar al cliente a registrarse es al pedir la cuenta (no al ingresar ni al pagar).
- 7 de 12 propusieron que un beneficio escalonado (no solo puntos) genera mayor sensación de progreso.

## 2.5.3. Síntesis del Diagnóstico

El estudio confirmó: (a) existe disposición masiva del cliente a participar en un programa de fidelización (81%); (b) el canal preferido es WhatsApp con amplio margen; (c) los beneficios que el cliente valora son descuento en el ticket y plato gratis al alcanzar nivel; (d) el equipo interno es favorable a la operación; (e) el momento óptimo de captación es al pedir la cuenta. Estas cinco evidencias orientan el diseño del programa del Capítulo III.
`;

// ── Fase 10: Cap III — Header ───────────────────────────────────────────────
const CAP3_HEADER = `# CAPÍTULO III — PROPUESTA

El presente capítulo presenta el diseño y la implementación del programa de fidelización del Restaurante Sumaq Mikhuna. Se organiza en cinco bloques: identificación de estrategias (sección 3.1), diseño del programa con sus componentes operativos (sección 3.2), plan de implementación con cronograma y responsables (sección 3.3), seguimiento y control de los primeros tres meses (sección 3.4), y evaluación financiera (sección 3.5).
`;

// ── Fase 11: 3.1 Estrategias ────────────────────────────────────────────────
const CAP3A_ESTRATEGIAS = `# 3.1. Identificación de Estrategias

Sobre la base del diagnóstico del Capítulo II y de las preferencias del cliente documentadas en el estudio de mercado, se identificaron cinco estrategias que articuladas conforman el programa de fidelización.

## 3.1.1. Estrategia 1: Tarjeta Digital con Código QR

**Descripción:** cada cliente registrado recibe una tarjeta digital con código QR único, que el mesero escanea al pedir la cuenta para acreditar puntos. La tarjeta se entrega por WhatsApp como imagen y se guarda en la galería del teléfono del cliente.

**Justificación:** sin sistema físico (plástico) se elimina el costo de tarjetería y se aprovecha el smartphone que el 92% de los clientes ya tiene.

## 3.1.2. Estrategia 2: Sistema de Puntos por Consumo

**Descripción:** 1 punto por cada Bs. 5 de consumo facturado. Los puntos no caducan durante el primer año del cliente y caducan a los 12 meses sin movimiento.

**Justificación:** la regla 1:5 es simple de comunicar y de calcular mentalmente. El plazo de 12 meses incentiva la frecuencia sin penalizar al cliente esporádico.

## 3.1.3. Estrategia 3: Beneficios Escalonados de Tres Niveles

**Descripción:**
- **Nivel Quechua (entrada, 0 a 99 puntos):** acumula puntos sin beneficios adicionales.
- **Nivel Aymara (100 a 299 puntos):** 5% de descuento permanente en el ticket, bebida cortesía en el cumpleaños.
- **Nivel Tiwanaku (300 puntos en adelante):** 10% de descuento permanente, bebida cortesía en cada visita, invitación a eventos especiales (cata de productos regionales, noches temáticas) dos veces por año.

**Justificación:** la sensación de progreso entre niveles (sugerida por el equipo en las entrevistas) refuerza la motivación de regreso. Los nombres en lenguas originarias refuerzan la identidad cultural del restaurante.

## 3.1.4. Estrategia 4: Comunicación Profesional por WhatsApp Business

**Descripción:** lista de difusión por WhatsApp Business (no grupos) con comunicaciones programadas: bienvenida al registrarse, recordatorio de cumpleaños con beneficio especial, novedades del menú, eventos especiales para nivel Tiwanaku. Frecuencia máxima: 1 mensaje cada 2 semanas para evitar saturación.

**Justificación:** WhatsApp es el canal preferido por el 68% del segmento. La frecuencia moderada evita el efecto de spam.

## 3.1.5. Estrategia 5: Captación al Pedir la Cuenta

**Descripción:** el mesero, al entregar la cuenta, ofrece registrar al cliente en el programa explicando los beneficios en menos de 30 segundos. Si el cliente acepta, escanea un código QR de la mesa con su teléfono y completa el registro con nombre, fecha de cumpleaños y WhatsApp.

**Justificación:** momento óptimo identificado por 9 de 12 colaboradores en las entrevistas. El cliente ya disfrutó la experiencia y está dispuesto a invertir 90 segundos.

## 3.1.6. Articulación

Las cinco estrategias operan como un sistema: la captación al pedir la cuenta (5) habilita la tarjeta digital (1) que registra puntos (2) y avanza niveles (3); la comunicación por WhatsApp (4) mantiene activa la relación entre visitas.
`;

const CAP3B_DISENO = `# 3.2. Diseño del Programa

## 3.2.1. Plataforma Tecnológica

El programa se opera sobre una plataforma SaaS de fidelización gastronómica con plan inicial de Bs. 350 mensuales (hasta 2.000 clientes). La plataforma provee:

- Registro de clientes con tarjeta QR generada automáticamente.
- Acreditación de puntos por código QR al pagar.
- Panel administrativo con base de datos de clientes y métricas.
- Integración nativa con WhatsApp Business API.

## 3.2.2. Flujo del Cliente

1. **Primera visita:** cliente come, el mesero le ofrece registrarse al pedir la cuenta. El cliente escanea QR de mesa, completa nombre + cumpleaños + WhatsApp, recibe su tarjeta digital por WhatsApp.
2. **Visitas posteriores:** el mesero pide al cliente que muestre su tarjeta antes de pagar; escanea el QR y los puntos se acreditan automáticamente.
3. **Cambio de nivel:** el sistema notifica al cliente por WhatsApp cuando alcanza un nivel superior.
4. **Comunicación programada:** la administración envía comunicaciones cada 2 semanas a la lista de difusión.

## 3.2.3. Capacitación al Equipo

Programa de 8 horas distribuido en 4 sesiones de 2 horas: introducción al programa, manejo de la plataforma, protocolo de invitación al cliente, manejo de objeciones, manejo de excepciones.

## 3.2.4. Materiales

- **QR de mesa:** sticker laminado de 6 × 6 cm en cada mesa.
- **Insertos en la cuenta:** mini-folleto físico que explica el programa, entregado con la cuenta.
- **Comunicaciones plantilla:** 8 plantillas de WhatsApp pre-aprobadas (bienvenida, cumpleaños, novedades, eventos, recordatorio de saldo, ascenso de nivel, agradecimiento al cliente Tiwanaku, comunicación general).
`;

const CAP3C_IMPLEMENTACION = `# 3.3. Plan de Implementación

## 3.3.1. Fase 1 — Preparación (Semanas 1-2)

- Contratación de la plataforma SaaS.
- Configuración del panel administrativo, niveles y reglas.
- Capacitación del equipo (8 horas).
- Diseño e impresión de materiales.

## 3.3.2. Fase 2 — Soft Launch (Semanas 3-4)

- Inicio operativo con 30% del personal en el primer servicio.
- Acompañamiento del gerente-administrador en cada turno.
- Ajustes diarios en el protocolo de invitación.

## 3.3.3. Fase 3 — Lanzamiento Completo (Semana 5 en adelante)

- 100% del personal aplicando el protocolo.
- Comunicación oficial del lanzamiento en redes sociales.
- Primera campaña de WhatsApp a la base de registrados.

## 3.3.4. Cronograma

| Semana | Hito |
|---|---|
| 1 | Plataforma contratada y configurada |
| 2 | Equipo capacitado, materiales impresos |
| 3-4 | Soft launch con seguimiento diario |
| 5+ | Operación regular completa |
| 8 | Primer reporte mensual |
| 13 | Reporte trimestral (cierre del seguimiento del Trabajo Dirigido) |
`;

const CAP3D_SEGUIMIENTO = `# 3.4. Seguimiento y Control (Resultados de los Primeros Tres Meses)

## 3.4.1. Adopción del Programa

- **Mes 1:** 142 clientes registrados (12,9% de la base habitual).
- **Mes 2:** 297 clientes registrados (27,0% acumulado).
- **Mes 3:** 412 clientes registrados (37,5% acumulado).

Curva de adopción coherente con la maduración esperada: el primer mes refleja la captación pre-existente del personal en período de aprendizaje; los meses 2 y 3 muestran tracción sostenida.

## 3.4.2. Distribución por Nivel al Cierre del Mes 3

- Nivel Quechua: 318 clientes (77,2%).
- Nivel Aymara: 86 clientes (20,9%).
- Nivel Tiwanaku: 8 clientes (1,9%).

## 3.4.3. Indicadores Clave

| Indicador | Línea base | Mes 1 | Mes 2 | Mes 3 |
|---|---:|---:|---:|---:|
| Tasa de retención mensual | 28% | 31% | 36% | 41% |
| Ticket promedio (Bs.) | 75 | 78 | 80 | 82 |
| Visitas mensuales por cliente registrado | — | 1,2 | 1,5 | 1,8 |
| Calificación servicio (plataformas) | 4,1/5 | 4,2/5 | 4,4/5 | 4,5/5 |
| Apertura efectiva de WhatsApp | — | 78% | 81% | 79% |

La trayectoria es favorable para alcanzar el objetivo de 45% al cierre del mes 6.

## 3.4.4. Hallazgos Cualitativos

- 6 clientes Tiwanaku reportaron que las invitaciones a eventos especiales fueron un factor decisivo de su fidelización.
- 4 colaboradores propusieron incorporar un beneficio adicional para Aymara (degustación gratuita una vez al mes), que se evaluará en la versión 2 del programa.
- 2 quejas operativas registradas durante el período sobre demora en la acreditación de puntos (caso resuelto con ajuste de capacitación).
`;

const CAP3E_FINANCIERA = `# 3.5. Evaluación Financiera

## 3.5.1. Inversión

| Rubro | Monto (Bs.) |
|---|---:|
| Plataforma SaaS (12 meses anticipados) | 4.200 |
| Capacitación del equipo (consultor + materiales) | 3.500 |
| Impresión de materiales (QR mesa + folletos) | 1.200 |
| Comunicación inicial (publicidad lanzamiento) | 4.500 |
| Honorarios de diseño gráfico del programa | 2.800 |
| Reserva para contingencias | 2.300 |
| **Total** | **18.500** |

## 3.5.2. Beneficio Proyectado

Línea base: 28% retención × 1.100 clientes habituales = 308 visitas repetidas/mes.
Objetivo: 45% × 1.100 = 495 visitas repetidas/mes.
**Incremento:** 187 visitas/mes × Bs. 75 ticket = Bs. 14.025/mes adicionales.
Margen neto del rubro: 22%. **Beneficio neto mensual: Bs. 3.085**, anualizado: **Bs. 37.020**.

Beneficio adicional: ticket promedio incrementado 9% en clientes registrados. Aplicado al volumen mensual histórico, suma Bs. 1.620/mes adicionales = Bs. 19.440/año.

**Beneficio total anualizado proyectado: Bs. 56.460.**

## 3.5.3. Flujo de Caja

| Año | Inversión + costos recurrentes | Beneficio | Flujo neto |
|---:|---:|---:|---:|
| 0 | (18.500) | — | (18.500) |
| 1 | (4.200) SaaS recurrente | 28.230 (50% de Bs. 56.460 por curva de adopción) | 24.030 |
| 2 | (4.200) | 56.460 | 52.260 |
| 3 | (4.200) | 56.460 | 52.260 |

## 3.5.4. Indicadores

- **VAN (tasa 14%):** **Bs. 81.420** positivo.
- **TIR:** 142%.
- **B/C:** 2,84.
- **Payback:** 3,7 meses.

El programa es altamente rentable bajo los supuestos. La sensibilidad al cumplimiento del objetivo de 45% es alta pero los resultados parciales de los primeros tres meses sostienen la proyección.
`;

const CONCLUSIONES = `# CONCLUSIONES

**Primera.** El diagnóstico institucional del Restaurante Sumaq Mikhuna evidenció una tasa de retención mensual del 28% explicada por tres factores institucionales: ausencia de identificación del cliente habitual, ausencia de comunicación post-visita y ausencia de incentivos al cliente recurrente.

**Segunda.** El estudio de mercado a 180 clientes confirmó disposición masiva del 81% a participar en un programa de fidelización, con preferencia clara por WhatsApp como canal (68%), por descuento en el ticket como beneficio (62%) y por captación al pedir la cuenta como momento óptimo (sugerido por 9 de 12 colaboradores en las entrevistas).

**Tercera.** El programa de fidelización diseñado integra cinco estrategias articuladas: tarjeta digital con QR, sistema de puntos 1:5, niveles Quechua-Aymara-Tiwanaku, comunicación profesional por WhatsApp Business y captación al pedir la cuenta. Los cinco componentes operan como sistema integrado.

**Cuarta.** La implementación en los primeros tres meses logró 412 clientes registrados (37,5% de la base habitual) y un incremento de la tasa de retención mensual del 28% al 41%, en trayectoria favorable para alcanzar el objetivo del 45% al cierre del mes 6.

**Quinta.** Indicadores complementarios mostraron desempeño favorable: ticket promedio incrementado 9% en clientes registrados, calificación de servicio en plataformas mejorada de 4,1 a 4,5 sobre 5, y apertura efectiva de WhatsApp del 79% al 81% en las tres campañas enviadas.

**Sexta.** La evaluación financiera arrojó VAN Bs. 81.420, TIR del 142% y Payback de 3,7 meses, indicadores que sustentan ampliamente la viabilidad económica del programa.

**Séptima.** En conjunto, el Trabajo Dirigido entrega al Restaurante Sumaq Mikhuna un programa de fidelización funcional, en operación regular, con resultados parciales favorables y proyección sustentada para alcanzar el objetivo establecido.
`;

const RECOMENDACIONES = `# RECOMENDACIONES

**Primera.** Mantener el seguimiento mensual de la tasa de retención durante los próximos 12 meses, ajustando el programa si la curva de adopción se aleja de la proyección.

**Segunda.** Incorporar al cierre del mes 6 una versión 2 del programa con el beneficio adicional para nivel Aymara propuesto por el equipo (degustación gratuita mensual).

**Tercera.** Sistematizar las invitaciones a eventos especiales del nivel Tiwanaku como diferenciador competitivo, con calendario anual de al menos cuatro eventos.

**Cuarta.** Construir alianzas con productores regionales mencionados en los eventos Tiwanaku, lo que profundiza la identidad gastronómica del restaurante y genera contenido para la comunicación.

**Quinta.** Mantener la frecuencia máxima de 1 mensaje cada 2 semanas en WhatsApp. La tentación de comunicar más es alta pero erosiona la disposición del cliente a leer.

**Sexta.** Migrar progresivamente la captación de delivery a venta directa con beneficio del programa, reduciendo la comisión del 18-25% de las plataformas.

**Séptima.** Documentar el caso del programa al cierre del año 1 como referencia para el sector gastronómico cochabambino.
`;

const BIBLIOGRAFIA = `# BIBLIOGRAFÍA

chaffey, d., & ellis-chadwick, f. (2019). *Marketing digital: estrategia, implementación y práctica* (7.ª ed.). México: Pearson Educación.

chen, x., dimitri, c., & gardiner, b. (2020). Customer loyalty programs in mid-sized urban restaurants: evidence from Latin American markets. *Journal of Marketing Studies*, 22(2), 144–168.

estado plurinacional de bolivia. (2013). *Ley N.° 453 de Defensa del Consumidor*. Gaceta Oficial.

kotler, p., & armstrong, g. (2017). *Marketing* (16.ª ed.). México: Pearson Educación.

kumar, v., & shah, d. (2004). Building and sustaining profitable customer loyalty for the 21st century. *Journal of Retailing*, 80(4), 317–330.

peppers, d., & rogers, m. (2011). *Managing customer relationships: a strategic framework* (2.ª ed.). Hoboken: Wiley.

sapag chain, n. (2011). *Proyectos de inversión: formulación y evaluación* (2.ª ed.). Santiago de Chile: Pearson Educación.
`;

const COMPILACION = `# COMPILACIÓN FINAL

El documento se consolidó en formato LaTeX siguiendo la guía oficial UNIFRANZ Cochabamba (edición 2017). El paquete final incluye documento principal con todos los capítulos integrados, bibliografía APA con apellidos en minúscula, carátula con datos del estudiante, resumen del trabajo (250 palabras) en preliminares, anexos con plantillas de comunicación WhatsApp, materiales gráficos del programa y dataset de los tres meses de seguimiento.

El paquete está listo para compilar en Overleaf o distribución LaTeX local y exportar a PDF para impresión empastada o entrega digital.
`;

const DEFENSA = `# BANCO DE PREGUNTAS — DEFENSA

## Bloque 1 — Diagnóstico

**Pregunta:** ¿Cómo se calculó la retención mensual del 28% si el restaurante no tenía CRM?

*Respuesta orientativa:* Se reconstruyó a partir de la base de clientes que pagaba con tarjeta (60% del total), cruzando facturación por número de tarjeta a lo largo de 12 meses. Sobre esa muestra se extrapoló al total. La cifra 28% es robusta dentro del rango ±3% por el método de muestreo.

## Bloque 2 — Diseño

**Pregunta:** ¿Por qué tres niveles y no más?

*Respuesta orientativa:* Tres niveles ofrecen sensación de progreso clara sin diluir la motivación. Más niveles fragmentarían la base y harían más complejo comunicar. Las entrevistas a colaboradores y a clientes apoyaron esta decisión.

## Bloque 3 — Implementación

**Pregunta:** ¿Cuál fue el principal obstáculo de la implementación?

*Respuesta orientativa:* El protocolo de invitación al cliente. El mesero requiere práctica para ofrecer el programa en 30 segundos sin sonar comercial. El soft launch de dos semanas resolvió este punto antes del lanzamiento masivo.

## Bloque 4 — Resultados

**Pregunta:** El 41% al mes 3 está por debajo del objetivo 45%. ¿Es alcanzable a mes 6?

*Respuesta orientativa:* La curva de adopción muestra ritmo creciente (31% → 36% → 41%, ganancias mensuales de 3-5 puntos). Manteniendo el ritmo y reforzando con la versión 2 del programa propuesta en las recomendaciones, el 45% es alcanzable al mes 6 con margen.

## Bloque 5 — Sostenibilidad

**Pregunta:** ¿Qué pasa con el programa después del cierre del Trabajo Dirigido?

*Respuesta orientativa:* El restaurante adopta el programa como activo operativo regular. El gerente-administrador queda capacitado como responsable y la plataforma SaaS sigue operando con su pago mensual. El proyecto entrega manuales y protocolos para que la continuidad no dependa del estudiante autor.
`;

export const TRABAJO_DIRIGIDO_DEMO_SEED: DemoSeed = {
  seed_id: "td-sumaq-mikhuna-v1",
  universidad_id: "unifranz-cba-001",
  servicio_id: "proy-grado-001",
  tipo_proyecto_id: "unifranz-trabajo-dirigido",
  modalidad_titulacion: "unifranz-trabajo-dirigido",
  tema:
    "Diseño e implementación de un programa de fidelización de clientes en el Restaurante Sumaq Mikhuna de Cochabamba (gestión 2025)",
  academic_context_extra: {
    contexto_inicial: {
      programa: "Ingeniería Comercial",
      materias: "",
      intereses_y_contexto:
        "Trabajo Dirigido en restaurante de cocina boliviana donde el estudiante trabaja como administrador. Diagnóstico: retención mensual del 28%, caída 11% interanual de visitas repetidas, dependencia creciente de delivery. Propuesta: programa de fidelización digital (tarjeta QR + puntos + beneficios escalonados + WhatsApp Business).",
    },
    empresa: "Restaurante Sumaq Mikhuna",
    localizacion: "Zona central, Municipio de Cochabamba (Cercado)",
    horizonte: "Gestión 2025, evaluación financiera 2025-2028",
  },
  fases_contenido: {
    "ph-unifranz-trabajo-dirigido-resumen": RESUMEN,
    "ph-unifranz-trabajo-dirigido-introduccion": INTRODUCCION,
    "ph-unifranz-trabajo-dirigido-cap1": CAP1_MARCO_TEORICO,
    "ph-unifranz-trabajo-dirigido-cap2-investigacion": CAP2_HEADER,
    "ph-unifranz-trabajo-dirigido-cap2a-microentorno": CAP2A_MICROENTORNO,
    "ph-unifranz-trabajo-dirigido-cap2b-institucional": CAP2B_INSTITUCIONAL,
    "ph-unifranz-trabajo-dirigido-cap2c-matricial": CAP2C_MATRICIAL,
    "ph-unifranz-trabajo-dirigido-cap2d-metodologia": CAP2D_METODOLOGIA,
    "ph-unifranz-trabajo-dirigido-cap2e-mercado": CAP2E_MERCADO,
    "ph-unifranz-trabajo-dirigido-cap3-propuesta": CAP3_HEADER,
    "ph-unifranz-trabajo-dirigido-cap3a-estrategias": CAP3A_ESTRATEGIAS,
    "ph-unifranz-trabajo-dirigido-cap3b-diseno": CAP3B_DISENO,
    "ph-unifranz-trabajo-dirigido-cap3c-implementacion": CAP3C_IMPLEMENTACION,
    "ph-unifranz-trabajo-dirigido-cap3d-seguimiento": CAP3D_SEGUIMIENTO,
    "ph-unifranz-trabajo-dirigido-cap3e-financiera": CAP3E_FINANCIERA,
    "ph-unifranz-trabajo-dirigido-conclusiones": CONCLUSIONES,
    "ph-unifranz-trabajo-dirigido-recomendaciones": RECOMENDACIONES,
    "ph-unifranz-trabajo-dirigido-bibliografia": BIBLIOGRAFIA,
    "ph-unifranz-trabajo-dirigido-compilacion": COMPILACION,
    "ph-unifranz-trabajo-dirigido-defensa": DEFENSA,
  },
};
