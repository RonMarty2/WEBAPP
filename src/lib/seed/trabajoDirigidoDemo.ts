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
    // Cap I, Cap II, Cap III y cierre en commits subsiguientes.
  },
};
