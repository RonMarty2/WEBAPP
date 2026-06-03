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
    // Capítulos II y III se completarán en commits subsiguientes, fase por fase.
  },
};
