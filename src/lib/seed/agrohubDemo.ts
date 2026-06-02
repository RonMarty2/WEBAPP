/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SEED DEMO — Proyecto AgroHub (UNIFRANZ · Proyecto de Grado · Pre-Factibilidad)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * SERVER-ONLY. Contenido de demostración generado "actuando como la IA de
 * producción" sobre el megaprompt UNIFRANZ. Permite cargar un proyecto ya
 * poblado en la cuenta del usuario para ver cómo se ve y se llena la
 * plataforma — exactamente como la usará un estudiante real cuando se conecte
 * la API de IA.
 *
 * Las claves de `fases_contenido` son los IDs de fase reales que produce
 * `getUnifranzPhases("unifranz-pg-prefactibilidad")`, es decir:
 *   ph-unifranz-pg-prefactibilidad-{slug}
 *
 * Para agregar más fases generadas, basta con añadir su par
 * { "ph-unifranz-pg-prefactibilidad-<slug>": "<contenido markdown>" }.
 */

const INTRODUCCION = `# INTRODUCCIÓN

El sector agroalimentario constituye uno de los pilares de la economía del Departamento de Cochabamba, reconocido históricamente por la vocación productiva de su valle y por su aporte al abastecimiento de frutas, verduras y hortalizas para el mercado interno boliviano. Sin embargo, la forma en que esa producción llega desde el campo hasta el consumidor final atraviesa una cadena de comercialización extensa, en la que participan múltiples intermediarios que elevan el precio final, reducen el margen percibido por el productor y favorecen la pérdida de producto por manipulación y demoras logísticas. En ese escenario, las tecnologías de comercialización directa y los modelos de acopio centralizado se han posicionado como alternativas para reorganizar la relación entre quien produce y quien consume.

El presente Proyecto de Grado abordó la pre-factibilidad de implementar una plataforma de acopio y comercialización agroalimentaria, denominada AgroHub, orientada a conectar de manera directa a los productores del valle de Cochabamba con consumidores finales y clientes institucionales del rubro de alimentos. El documento se organiza en una Introducción que delimita el problema, los objetivos y los alcances del estudio; un Capítulo I de Marco Teórico que sustenta conceptualmente la propuesta; un Capítulo II de investigación de mercado y análisis del entorno; un Capítulo III de plan estratégico, técnico, organizacional y financiero; y un apartado final de conclusiones y recomendaciones.

## 1. Planteamiento del Problema

La comercialización de productos agrícolas frescos en Bolivia se caracteriza por cadenas de intermediación largas que separan al productor del consumidor. Entre la parcela y la mesa intervienen rescatistas, mayoristas y minoristas, de modo que el precio se incrementa en cada eslabón sin que ese incremento se traduzca en mejores ingresos para quien cultiva. A nivel global, la Organización de las Naciones Unidas para la Alimentación y la Agricultura ha advertido que cerca de una tercera parte de los alimentos producidos para el consumo humano se pierde o desperdicia a lo largo de la cadena de suministro (FAO, 2019), fenómeno que se concentra de manera particular en los productos perecederos como frutas y hortalizas. El Departamento de Cochabamba, por su condición de uno de los principales territorios hortofrutícolas del país (INE, 2023), resulta especialmente expuesto a esta problemática.

El problema no se origina en la capacidad productiva del valle, sino en la estructura de su cadena de comercialización. La dispersión de los productores, la ausencia de centros de acopio que consoliden volúmenes, la débil articulación con canales formales de venta y la limitada adopción de herramientas digitales de comercialización configuran las causas estructurales de la baja captura de valor en el eslabón primario. A ello se suma la informalidad en el manejo poscosecha, que incrementa las mermas y deteriora la calidad e inocuidad del producto antes de que alcance al comprador final.

De mantenerse esta situación, es previsible que la brecha entre el precio pagado al productor y el precio pagado por el consumidor continúe ampliándose, que persistan niveles elevados de merma en productos perecederos y que los pequeños productores sigan dependiendo de intermediarios para colocar su cosecha. El costo de oportunidad de no actuar se expresa tanto en la pérdida de ingresos para las familias productoras como en el sobreprecio que asumen los consumidores y los negocios de alimentos que requieren abastecimiento constante y de calidad uniforme.

En función de lo expuesto, el problema de investigación se formuló de la siguiente manera: ¿Es factible, en términos comerciales, técnicos y financieros, la implementación de una plataforma de acopio y comercialización agroalimentaria que conecte de forma directa a los productores del valle de Cochabamba con consumidores finales y clientes institucionales, durante el período 2025–2030?

## 2. Justificación

El estudio se justifica porque aborda una necesidad concreta del sistema de abastecimiento agroalimentario de Cochabamba y propone una respuesta organizada, medible y evaluable desde las herramientas de la administración de empresas. A continuación se desarrollan las cinco dimensiones de justificación.

### 2.1. Justificación Práctica

El proyecto entrega un instrumento de decisión para un emprendimiento real: determina si conviene o no implementar una plataforma de acopio y comercialización directa, bajo qué condiciones operativas y con qué requerimientos técnicos. De este modo, el documento resuelve un problema de gestión concreto, que es el de ordenar el abastecimiento entre una oferta dispersa de productores y una demanda fragmentada de consumidores y negocios de alimentos.

En el plano aplicado, el estudio orienta la puesta en marcha del centro de acopio, el diseño de la tienda online y los acuerdos con clientes institucionales como pollerías, hamburgueserías, restaurantes y puestos de venta de ensaladas de fruta. La propuesta transforma una cadena informal y fragmentada en un proceso articulado, con reglas de calidad, trazabilidad y continuidad de abastecimiento que hoy el mercado tradicional no garantiza.

### 2.2. Justificación Económica

Desde la perspectiva económica, el proyecto busca incrementar el margen percibido por el productor al reducir el número de intermediarios y, de manera simultánea, ofrecer al comprador un precio competitivo por producto fresco y seleccionado. La concentración de volúmenes en un centro de acopio permite economías de escala en transporte, almacenamiento y distribución que un productor individual no alcanza por sí solo.

Sobre la base de los supuestos del proyecto, se estima que la eliminación de al menos un eslabón de intermediación podría mejorar de forma apreciable el ingreso del productor por unidad comercializada; esta cifra constituye una estimación del estudio basada en los supuestos del emprendedor y será contrastada en el Capítulo III mediante la evaluación financiera con indicadores de Valor Actual Neto, Tasa Interna de Retorno y relación Beneficio/Costo. Asimismo, la operación proyecta generar empleo directo en acopio, selección, logística y atención comercial, además de empleo indirecto en transporte y servicios asociados.

### 2.3. Justificación Social

El proyecto tiene un impacto social directo sobre las familias productoras del valle de Cochabamba, al ofrecerles un canal de venta estable que reduce su dependencia de los intermediarios y mejora la previsibilidad de sus ingresos. Una comercialización más justa fortalece la economía de los pequeños productores, contribuye al arraigo de la actividad agrícola y desincentiva el abandono de la tierra y la migración hacia actividades informales urbanas.

En el lado de la demanda, los consumidores y los negocios de alimentos se benefician de un abastecimiento más confiable, con productos frescos, seleccionados y trazables, lo que repercute en la calidad e inocuidad de lo que finalmente llega a la población. La iniciativa se alinea con los Objetivos de Desarrollo Sostenible relativos a hambre cero, trabajo decente y producción y consumo responsables, en la medida en que reduce pérdidas, acorta circuitos de comercialización y dignifica el ingreso del eslabón más vulnerable de la cadena.

### 2.4. Justificación Legal

La implementación del emprendimiento se enmarca en la normativa boliviana vigente. La constitución y el funcionamiento de la empresa se rigen por el Código de Comercio y por la inscripción en el Registro de Comercio, así como por la obtención del Número de Identificación Tributaria ante el Servicio de Impuestos Nacionales. En materia laboral, la contratación del personal de acopio, logística y comercialización se sujeta a la Ley General del Trabajo y a la afiliación a la seguridad social de corto y largo plazo.

Por tratarse de manipulación y comercialización de alimentos, el proyecto debe cumplir con los requisitos sanitarios y de inocuidad del Servicio Nacional de Sanidad Agropecuaria e Inocuidad Alimentaria (SENASAG), además de las licencias de funcionamiento del Gobierno Autónomo Municipal de Cochabamba. La operación de la tienda en línea y la gestión de pagos digitales se enmarcan en la normativa de defensa del consumidor (Ley N.º 453, de 2013) y en la regulación de servicios financieros bajo supervisión de la Autoridad de Supervisión del Sistema Financiero. Toda referencia normativa se cita por su denominación oficial, sin atribuir disposiciones que no consten en la legislación vigente.

### 2.5. Justificación Teórica

El estudio se apoya en el cuerpo teórico de la preparación y evaluación de proyectos de inversión, que ofrece un método sistemático para estimar la viabilidad de un emprendimiento antes de comprometer recursos. La estructura analítica propuesta retoma el enfoque de evaluación de proyectos, según el cual un estudio de pre-factibilidad debe articular el análisis de mercado, técnico, organizacional y financiero como dimensiones interdependientes de una misma decisión de inversión (Sapag Chain, 2011).

Asimismo, el proyecto contribuye a la literatura local al aplicar modelos de análisis estratégico ampliamente validados —como el análisis del macroentorno y el modelo de las cinco fuerzas competitivas— a un caso concreto de comercialización agroalimentaria en el contexto boliviano, donde la evidencia académica sobre plataformas de acopio directo es todavía limitada. De este modo, el documento valida empíricamente la pertinencia de estos marcos para el eslabón agroalimentario del valle de Cochabamba.

## 3. Objetivos

A continuación se establecen el objetivo general y los objetivos específicos que guiaron el desarrollo del presente Proyecto de Grado.

### 3.1. Objetivo General

Elaborar un estudio de pre-factibilidad para la implementación de una plataforma de acopio y comercialización agroalimentaria en el municipio de Cochabamba, durante el período 2025–2030, mediante el análisis estratégico, de mercado, técnico, organizacional y financiero, que permita determinar la viabilidad de conectar de forma directa a los productores del valle con consumidores finales y clientes institucionales.

### 3.2. Objetivos Específicos

1. Construir el marco teórico que sustenta la plataforma de acopio y comercialización agroalimentaria, a partir de la teoría de evaluación de proyectos y del análisis estratégico.
2. Analizar el macroentorno del proyecto mediante la matriz PESTEL, identificando los factores políticos, económicos, sociales, tecnológicos, ecológicos y legales que condicionan la propuesta.
3. Evaluar el microentorno mediante el modelo de las cinco fuerzas de Porter y las matrices de evaluación de factores externos e internos, para determinar la posición competitiva del emprendimiento.
4. Determinar la demanda insatisfecha del servicio mediante un estudio de mercado dirigido a consumidores finales y clientes institucionales del rubro de alimentos.
5. Diseñar la estructura organizacional, legal, técnica y de marketing necesaria para la operación de la plataforma de acopio y comercialización.
6. Evaluar la viabilidad financiera del proyecto mediante los indicadores de Valor Actual Neto, Tasa Interna de Retorno, relación Beneficio/Costo y análisis de sensibilidad.

## 4. Alcances

El presente apartado delimita el alcance temático, temporal y espacial del estudio, con el fin de precisar qué dimensiones aborda el proyecto y cuáles quedan fuera de su análisis.

### 4.1. Alcance Temático

El proyecto abordó las temáticas de planificación estratégica, investigación de mercados, diseño organizacional, planificación técnica y logística, marketing y evaluación financiera de proyectos de inversión, aplicadas a un emprendimiento de acopio y comercialización agroalimentaria. No se profundizó en aspectos macroeconómicos de la política monetaria nacional, ni en la ingeniería de detalle de infraestructura y equipamiento de frío, ni en el desarrollo informático interno de la plataforma tecnológica, por exceder el alcance académico de un Proyecto de Grado de pregrado. Tales aspectos se tratan a nivel de requerimientos funcionales y de costos referenciales, no de diseño especializado.

### 4.2. Alcance Temporal

El alcance temporal del estudio comprende dos dimensiones que no deben confundirse. La primera corresponde al período de elaboración del trabajo académico, desarrollado durante la gestión académica 2025. La segunda corresponde al horizonte de análisis y proyección del emprendimiento, definido en cinco años (2025–2030) para la evaluación financiera, sobre la base de información sectorial de los años recientes disponibles al momento del estudio. La distinción entre el tiempo del trabajo y el horizonte del proyecto evita interpretar la duración de la investigación como si fuera el período de vida útil de la inversión.

### 4.3. Alcance Espacial

El estudio se circunscribió geográficamente al Estado Plurinacional de Bolivia, Departamento de Cochabamba, Municipio de Cochabamba (Cercado), tomando como zona de aprovisionamiento las áreas productoras del valle central y como zona de comercialización el área urbana del municipio. Esta delimitación se justificó por la concentración de demanda institucional y de consumidores finales en el área metropolitana, así como por la cercanía a las zonas productoras que abastecerían el centro de acopio. La representación cartográfica de la zona se incorpora en el cuerpo del documento y no en este apartado.

## 5. Hipótesis

Por tratarse de un estudio de pre-factibilidad, la guía UNIFRANZ considera la hipótesis como un elemento opcional. En este proyecto se incluyó una hipótesis de trabajo con el fin de orientar la contrastación de la propuesta con los datos del estudio de mercado y de la evaluación financiera.

### 5.1. Hipótesis General

Si se implementa una plataforma de acopio y comercialización agroalimentaria que conecte de forma directa a los productores con los consumidores finales y los clientes institucionales, entonces se incrementa el margen percibido por el productor y se reduce la merma poscosecha en la cadena de abastecimiento del valle de Cochabamba.

### 5.2. Variable Independiente

Implementación de la plataforma de acopio y comercialización directa. Se define como la puesta en operación del centro de acopio y del canal de venta directa que articula la oferta de los productores con la demanda final. Sus indicadores propuestos son el número de productores integrados, el volumen acopiado y el número de eslabones de intermediación eliminados.

### 5.3. Variable Dependiente

Margen del productor y nivel de merma poscosecha. Se define como la proporción del precio final que percibe el productor y la pérdida de producto registrada entre el acopio y la entrega. Sus indicadores propuestos son el porcentaje del precio final percibido por el productor y el porcentaje de merma sobre el volumen acopiado.

### 5.4. Variable Intercurrente

Logística de transporte y conservación en cadena de frío. Constituye la variable que interviene entre la implementación de la plataforma y el efecto esperado sobre el margen y la merma, dado que la disponibilidad y la eficiencia del transporte refrigerado modulan tanto la reducción de pérdidas como el costo final del producto. Se asume controlada mediante acuerdos logísticos y protocolos de manejo poscosecha definidos en el plan técnico del Capítulo III.

Definidos el problema, la justificación, los objetivos, los alcances y la hipótesis de trabajo, el documento avanza hacia el Capítulo I, que desarrolla el marco teórico de sustento; continúa con el Capítulo II, que presenta el análisis del entorno y la investigación de mercado; prosigue con el Capítulo III, que formula el plan estratégico, organizacional, técnico, de marketing y financiero; y culmina con las conclusiones y recomendaciones derivadas del estudio.`;

export interface DemoSeed {
  /** Identificador estable del seed, usado para de-duplicar al cargar. */
  seed_id: string;
  universidad_id: string;
  servicio_id: string;
  tipo_proyecto_id: string;
  modalidad_titulacion: string;
  tema: string;
  /** Datos del "wizard" que normalmente cargaría el estudiante. */
  academic_context_extra: Record<string, unknown>;
  /** phaseId → contenido markdown ya generado. */
  fases_contenido: Record<string, string>;
}

export const AGROHUB_DEMO_SEED: DemoSeed = {
  seed_id: "agrohub-prefactibilidad-v1",
  universidad_id: "unifranz-cba-001",
  servicio_id: "proy-grado-001",
  tipo_proyecto_id: "unifranz-pg-prefactibilidad",
  modalidad_titulacion: "unifranz-pg-prefactibilidad",
  tema:
    "Estudio de pre-factibilidad para la implementación de una plataforma de acopio y comercialización agroalimentaria (AgroHub) en el municipio de Cochabamba",
  academic_context_extra: {
    contexto_inicial: {
      programa: "Ingeniería Comercial",
      materias: "",
      intereses_y_contexto:
        "Plataforma de acopio y comercialización agroalimentaria que concentra la producción de productores, campesinos y mayoristas del valle de Cochabamba (frutas, verduras, hortalizas) y la comercializa de forma directa mediante una tienda online y un centro de acopio centralizado, a consumidor final (B2C) y clientes institucionales (B2B): empresas de alimentos, pollerías, hamburgueserías, puestos de ensaladas de fruta y restaurantes.",
    },
    emprendimiento: "AgroHub",
    localizacion: "Municipio de Cochabamba (Cercado), Departamento de Cochabamba",
    horizonte_financiero_anios: 5,
  },
  fases_contenido: {
    "ph-unifranz-pg-prefactibilidad-introduccion": INTRODUCCION,
  },
};
