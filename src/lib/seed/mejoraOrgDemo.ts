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
    // Cap I — Marco Teórico: se generará en el próximo commit con el contexto
    // de Resumen + Introducción ya disponibles para la siguiente "llamada API".
    // Capítulos II y III se completarán en commits subsiguientes, fase por fase.
  },
};
