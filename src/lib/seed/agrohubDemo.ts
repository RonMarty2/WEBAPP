/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SEED DEMO — Proyecto AgroHub (UNIFRANZ · Proyecto de Grado · Pre-Factibilidad)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * SERVER-ONLY. Contenido de demostración generado "actuando como la IA de
 * producción" sobre los megaprompts UNIFRANZ. Permite cargar un proyecto YA
 * TERMINADO con sus 20 fases pobladas para ver cómo se vería un proyecto
 * real cuando el SaaS esté conectado a la API de IA.
 *
 * Las claves de `fases_contenido` son los IDs reales que produce
 * `getUnifranzPhases("unifranz-pg-prefactibilidad")`, es decir:
 *   ph-unifranz-pg-prefactibilidad-{slug}
 *
 * Cumple las reglas UNIFRANZ (tercera persona, sin voseo, citas APA con
 * apellidos en minúsculas, anti-alucinación, etc.).
 */

const RESUMEN = `# RESUMEN DEL TRABAJO

El presente Proyecto de Grado, en su modalidad de Pre-Factibilidad, abordó el estudio de viabilidad de la implementación de una plataforma de acopio y comercialización agroalimentaria —denominada AgroHub— orientada a conectar de manera directa a los productores del valle de Cochabamba con consumidores finales y clientes institucionales del rubro de alimentos durante el período 2025–2030.

El objetivo general consistió en determinar la factibilidad comercial, técnica, organizacional, legal y financiera del emprendimiento. El método aplicó las técnicas estandarizadas de evaluación de proyectos de inversión: análisis del macroentorno mediante la matriz PESTEL, evaluación del microentorno con el modelo de las cinco fuerzas de Porter y matrices MEFE-MEFI-FODA, estudio de mercado con muestreo aleatorio estratificado a 384 consumidores finales y 60 clientes institucionales del municipio de Cochabamba, diseño organizacional, técnico y de marketing, y evaluación financiera con un horizonte de cinco años aplicando los indicadores Valor Actual Neto (VAN), Tasa Interna de Retorno (TIR), relación Beneficio-Costo (B/C) y análisis de sensibilidad.

Los resultados del estudio de mercado evidenciaron una demanda insatisfecha del 38,7% para el segmento B2C y del 52,4% para el segmento B2B. La evaluación financiera arrojó un VAN positivo de Bs. 312.480, una TIR del 24,6% —superior al costo de oportunidad del 14%— y una relación B/C de 1,32, demostrando la viabilidad del proyecto bajo los supuestos definidos.
`;

const CAP1_MARCO_TEORICO = `# CAPÍTULO I — MARCO TEÓRICO

## 1.1. Antecedentes del Estudio

El abastecimiento de productos agroalimentarios frescos en Bolivia ha sido objeto de diversos estudios en los últimos años. La Organización de las Naciones Unidas para la Alimentación y la Agricultura ha advertido que cerca de una tercera parte de los alimentos producidos para consumo humano se pierde o desperdicia a lo largo de la cadena de suministro (FAO, 2019). En el contexto local, el Instituto Nacional de Estadística ha caracterizado al Departamento de Cochabamba como uno de los principales territorios hortofrutícolas del país (INE, 2023). Investigaciones previas sobre cadenas cortas de comercialización en países andinos han documentado mejoras de entre 15% y 30% en el ingreso percibido por los productores cuando se reducen los eslabones de intermediación (sapag chain, 2011).

## 1.2. Bases Teóricas

### 1.2.1. Teoría de Evaluación de Proyectos de Inversión

La preparación y evaluación de proyectos de inversión constituye el cuerpo teórico central del presente estudio. Según sapag chain (2011, p. 24), un estudio de pre-factibilidad debe articular cuatro dimensiones interdependientes: el análisis de mercado, el estudio técnico, el estudio organizacional y la evaluación financiera. Estas dimensiones operan como filtros sucesivos: si una de ellas resulta inviable, el proyecto no avanza a la siguiente fase de análisis. Esta lógica analítica orientó la estructura del Capítulo II y del Capítulo III del presente trabajo.

### 1.2.2. Cadenas Cortas de Comercialización Agroalimentaria

Las cadenas cortas de comercialización agroalimentaria se definen como aquellas configuraciones de intercambio entre productor y consumidor en las que median, como máximo, un intermediario. Renting y otros autores caracterizaron estas cadenas como instrumentos de revalorización del trabajo agrícola y de acortamiento de la distancia entre el espacio de producción y el espacio de consumo (renting, marsden, & banks, 2003, p. 396). Su aplicación a contextos urbanos latinoamericanos se ha estudiado en mercados de proximidad, ferias campesinas y plataformas digitales de venta directa.

### 1.2.3. Análisis Estratégico del Entorno

El análisis estratégico del entorno empresarial se sustenta en los aportes de Porter (porter, 1980) sobre las cinco fuerzas competitivas y en el enfoque PESTEL para el análisis del macroentorno (johnson, scholes, & whittington, 2006). El primero permite caracterizar la posición competitiva del emprendimiento frente a proveedores, clientes, sustitutos, nuevos entrantes y rivalidad del sector; el segundo identifica los factores políticos, económicos, sociales, tecnológicos, ecológicos y legales que condicionan la viabilidad externa del proyecto. Ambos modelos se aplicaron en el Capítulo II del presente trabajo.

### 1.2.4. Plataformas Digitales de Comercialización Directa

La emergencia de plataformas digitales de comercialización directa entre productor y consumidor ha sido documentada como una transformación estructural del comercio agroalimentario en la última década (chen, dimitri, & gardiner, 2020). Estas plataformas combinan acopio físico centralizado con interfaces digitales de pedido, segmentación de clientes y trazabilidad del producto. Su modelo de negocio difiere del retail tradicional en tres dimensiones: márgenes más bajos por unidad, mayor velocidad de rotación y captura de valor por servicios complementarios como entrega programada, certificación de origen y selección por calidad.

### 1.2.5. Indicadores de Evaluación Financiera

La evaluación financiera del proyecto se sustenta en los indicadores Valor Actual Neto (VAN), Tasa Interna de Retorno (TIR) y relación Beneficio-Costo (B/C). El VAN mide el valor presente de los flujos de caja futuros descontados a una tasa que refleja el costo de oportunidad del capital; un VAN positivo indica que el proyecto agrega valor sobre la mejor alternativa disponible (sapag chain, 2011, p. 312). La TIR es la tasa de descuento que iguala el VAN a cero; un proyecto es financieramente atractivo cuando su TIR supera la tasa de corte definida por el inversionista. La relación B/C compara los beneficios actualizados con los costos actualizados; valores superiores a 1 indican rentabilidad.

## 1.3. Marco Conceptual

A efectos del presente estudio se definen los siguientes términos operativos:

- **Acopio agroalimentario:** proceso logístico de recepción, selección, clasificación y almacenamiento temporal de productos agrícolas frescos provenientes de múltiples productores.
- **Cadena corta:** configuración de comercialización en la que existe, como máximo, un intermediario entre el productor y el consumidor final.
- **Demanda insatisfecha:** brecha cuantitativa entre la demanda potencial estimada y la oferta efectiva del mercado en condiciones de calidad, precio y oportunidad.
- **Cliente institucional (B2B):** establecimiento comercial gastronómico o de procesamiento de alimentos (restaurantes, pollerías, hamburgueserías, puestos de venta de ensaladas de fruta) que compra insumos en volumen.
- **Trazabilidad agroalimentaria:** capacidad de rastrear el origen, las condiciones de manejo y el destino de un lote de producto a lo largo de toda la cadena.

## 1.4. Marco Contextual

El estudio se desarrolló en el municipio de Cochabamba, capital del Departamento del mismo nombre, en el Estado Plurinacional de Bolivia. El municipio cuenta con un área urbana de 309 km² y concentra cerca de 630.000 habitantes según las últimas estimaciones censales (INE, 2023). El valle de Cochabamba, que rodea el área urbana, es uno de los principales territorios hortofrutícolas del país; su producción abastece tanto al mercado local como a los departamentos vecinos. La actividad agrícola del valle es predominantemente de pequeña y mediana escala, organizada en unidades familiares de producción.
`;

const CAP2_HEADER = `# CAPÍTULO II — INVESTIGACIÓN

El presente capítulo desarrolla el análisis del entorno del proyecto y la investigación de mercado realizada para fundamentar la viabilidad comercial de la plataforma AgroHub. La estructura del capítulo sigue la guía UNIFRANZ 2017, sección 4.2.1, y se organiza en cinco bloques: análisis del macroentorno mediante la matriz PESTEL (sección 2.1), análisis del microentorno mediante el modelo de las cinco fuerzas de Porter (sección 2.2), análisis matricial con las herramientas MEFE, MEFI y FODA (sección 2.3), metodología de investigación aplicada al estudio de mercado (sección 2.4) y resultados del estudio de mercado (sección 2.5). La integración de los cinco bloques permite estimar la demanda insatisfecha del servicio y dimensionar la cuota de mercado capturable por la propuesta.
`;

const CAP2A_MACROENTORNO = `# 2.1. Análisis del Macroentorno

## 2.1.1. Factores Políticos

El Estado Plurinacional de Bolivia ha mantenido en los últimos años una política activa de apoyo a la producción agroalimentaria nacional, expresada en programas de fomento al pequeño productor, créditos a tasas preferenciales del Banco Unión y subsidios focalizados a la producción de alimentos estratégicos (Ministerio de Desarrollo Rural y Tierras, 2022). La estabilidad institucional del sector resulta favorable al emprendimiento, aunque la rotación frecuente de autoridades ministeriales introduce un grado de incertidumbre en la continuidad de los programas. Los gobiernos municipales del eje agroindustrial cochabambino han desarrollado regulaciones para el funcionamiento de centros de acopio que el proyecto deberá cumplir.

## 2.1.2. Factores Económicos

La economía boliviana ha mostrado tasas de crecimiento moderadas en el período reciente, con una inflación contenida y una paridad cambiaria estable. El gasto en alimentos representa cerca del 32% del presupuesto familiar promedio en el área urbana de Cochabamba, lo que define un mercado de tamaño relevante para el proyecto. El acceso al financiamiento bancario por parte de pequeños emprendimientos sigue siendo limitado, condicionado por requisitos de garantía y plazos de evaluación. Esto representa una restricción inicial para la inversión, pero abre oportunidades de financiamiento alternativo a través de fondos del Banco de Desarrollo Productivo (BDP) y de organismos multilaterales.

## 2.1.3. Factores Sociales

El consumidor boliviano urbano ha incrementado su demanda por productos frescos con trazabilidad y manejo poscosecha adecuado. La pandemia de COVID-19 aceleró la adopción de canales digitales de compra de alimentos, segmento que en el área urbana de Cochabamba ha sostenido un crecimiento estimado del 18% anual desde 2021 (Cámara de Industria, Comercio, Servicios y Turismo de Cochabamba, 2023). La población económicamente activa del municipio se concentra en hogares de tamaño medio (3 a 4 integrantes) con perfil de compra semanal en supermercados, mercados de barrio y plataformas digitales. Existe además una valoración cultural creciente por el consumo de productos del valle, asociada al concepto de soberanía alimentaria.

## 2.1.4. Factores Tecnológicos

La penetración de internet móvil en el área urbana de Cochabamba supera el 78%, con cobertura 4G estable y costos competitivos en planes prepago y pospago. Las plataformas digitales de pago QR y billeteras móviles han alcanzado un nivel de adopción significativo, facilitando las transacciones de bajo monto típicas de la compra de alimentos. En el lado logístico, la oferta de transporte refrigerado urbano se ha ampliado en los últimos cinco años, con tarifas competitivas para rutas dentro del área metropolitana. La infraestructura tecnológica disponible permite la implementación del proyecto sin requerir desarrollos a medida costosos.

## 2.1.5. Factores Ecológicos

El valle de Cochabamba enfrenta presiones ambientales crecientes: estrés hídrico estacional, fragmentación del suelo agrícola por expansión urbana y exposición de cultivos a eventos climáticos extremos. La reducción de mermas en la cadena de comercialización constituye una contribución directa a la sostenibilidad ambiental del sistema agroalimentario local. El proyecto AgroHub se alinea con los Objetivos de Desarrollo Sostenible 2 (Hambre Cero), 8 (Trabajo Decente y Crecimiento Económico) y 12 (Producción y Consumo Responsables), lo que representa un activo reputacional ante consumidores con preferencia ambiental y ante posibles financiadores con criterios ESG.

## 2.1.6. Factores Legales

El marco normativo aplicable al proyecto comprende: el Código de Comercio para la constitución de la empresa, la Ley General del Trabajo para la contratación de personal, los reglamentos del Servicio Nacional de Sanidad Agropecuaria e Inocuidad Alimentaria (SENASAG) para el manejo de alimentos, la Ley N.° 453 de Defensa del Consumidor (Estado Plurinacional de Bolivia, 2013) para la operación del canal de venta directa, las regulaciones de la Autoridad de Supervisión del Sistema Financiero (ASFI) aplicables a pagos digitales y las normativas municipales del Gobierno Autónomo Municipal de Cochabamba para el funcionamiento de centros de acopio. El cumplimiento de todas estas exigencias se incluye en el plan de implementación del Capítulo III.

## 2.1.7. Síntesis del Análisis PESTEL

El balance del análisis macroentorno arroja un entorno moderadamente favorable para el proyecto. Los factores económicos, sociales y tecnológicos presentan oportunidades claras: mercado urbano amplio, demanda creciente por productos frescos y trazables, adopción de canales digitales y de pagos electrónicos. Los factores políticos y ecológicos son neutros, con elementos favorables y restrictivos en equilibrio. El factor legal es exigente pero abordable mediante cumplimiento normativo formal y asesoría legal contratada.
`;

const CAP2B_MICROENTORNO = `# 2.2. Análisis del Microentorno

El análisis del microentorno se realizó mediante el modelo de las cinco fuerzas competitivas propuesto por porter (porter, 1980). Este modelo permite caracterizar la intensidad de la competencia en el sector y la posición negociadora del proyecto frente a sus actores relevantes.

## 2.2.1. Poder de Negociación de los Proveedores

Los proveedores del proyecto son los productores agrícolas del valle de Cochabamba. Su poder de negociación se evaluó como **bajo a moderado**. Razones: la oferta es atomizada, compuesta por unidades familiares de producción con limitada capacidad organizacional; el productor individual carece de poder para fijar precios de manera unilateral; las alternativas de comercialización para el productor son limitadas y se reducen, en la mayoría de los casos, a intermediarios mayoristas con condiciones poco favorables. AgroHub, al ofrecer un canal directo con condiciones de pago previsibles, se posiciona como una alternativa atractiva para el productor, lo que refuerza la capacidad de negociación de la plataforma. La principal amenaza viene de productores grandes (más de 5 hectáreas) que sí cuentan con poder de fijación de precios.

## 2.2.2. Poder de Negociación de los Clientes

El análisis se realizó por segmento. En el segmento B2C (consumidor final), el poder de negociación es **bajo**: cada consumidor compra volúmenes pequeños, no tiene capacidad de negociar precios y selecciona por valor percibido. En el segmento B2B (clientes institucionales: pollerías, hamburgueserías, restaurantes), el poder es **moderado**: estos clientes compran en volumen, exigen continuidad de abastecimiento y condiciones de pago a plazo. AgroHub debe equilibrar precios competitivos con estabilidad operativa para retener a estos clientes.

## 2.2.3. Amenaza de Nuevos Entrantes

La amenaza de nuevos entrantes se evaluó como **moderada**. Las barreras de entrada del sector son medias: el capital inicial para un centro de acopio básico es accesible (Bs. 80.000 a Bs. 150.000 según estimación del proyecto), las exigencias regulatorias son cumplibles y la tecnología digital es estándar. Sin embargo, la construcción de relaciones de confianza con los productores requiere tiempo, y la fidelización del consumidor final demanda consistencia operativa sostenida. La ventaja competitiva no proviene del capital sino de la red de productores y de la reputación de calidad. AgroHub debe invertir desde el inicio en estos activos intangibles.

## 2.2.4. Amenaza de Productos Sustitutos

Los sustitutos del servicio son los canales tradicionales de comercialización: mercados mayoristas, ferias campesinas, supermercados y bodegas de barrio. La amenaza se evaluó como **alta**: estos canales existen, son conocidos por el consumidor y operan con precios competitivos. La ventaja diferencial de AgroHub debe construirse sobre tres pilares: trazabilidad y calidad seleccionada (no presente en mercados tradicionales), conveniencia digital (no presente en ferias) y mejor precio que supermercados gracias a la cadena corta. La propuesta de valor debe comunicarse con claridad para superar la inercia de los hábitos de compra existentes.

## 2.2.5. Rivalidad entre Competidores Existentes

La rivalidad actual entre competidores formales en el segmento de plataformas digitales de venta directa de alimentos en Cochabamba es **baja a moderada**. Existen pocas plataformas con cobertura sostenida y la mayoría opera con alcance limitado. La rivalidad informal con mercados tradicionales y supermercados es alta, pero no se trata de competencia directa por modelo de negocio. El espacio de mercado para una propuesta diferenciada como AgroHub es relevante, con margen para crecer sin enfrentar saturación competitiva en el corto plazo.

## 2.2.6. Síntesis del Análisis Porter

El balance de las cinco fuerzas indica un sector con intensidad competitiva **moderada**. La posición negociadora de AgroHub frente a sus proveedores es favorable; frente a los clientes B2B requiere construir relaciones de confianza; frente a los sustitutos requiere una comunicación clara de su propuesta de valor; frente a nuevos entrantes requiere construir activos intangibles (red de productores y reputación) desde el primer día. El sector presenta condiciones razonables para la entrada de un emprendimiento bien diseñado y con capital de trabajo adecuado.
`;

const CAP2C_MATRICIAL = `# 2.3. Análisis Matricial

El análisis matricial integra los hallazgos de las secciones 2.1 y 2.2 en tres instrumentos: la Matriz de Evaluación de Factores Externos (MEFE), la Matriz de Evaluación de Factores Internos (MEFI) y la matriz FODA estratégica.

## 2.3.1. Matriz MEFE — Evaluación de Factores Externos

| Factor externo | Peso | Calificación | Puntuación |
|---|---:|---:|---:|
| Crecimiento del comercio digital de alimentos (18% anual) | 0,15 | 4 | 0,60 |
| Demanda urbana por productos frescos y trazables | 0,12 | 4 | 0,48 |
| Oferta atomizada de productores en el valle | 0,10 | 3 | 0,30 |
| Adopción de pagos digitales en el área urbana | 0,08 | 3 | 0,24 |
| Marco normativo sanitario exigente (SENASAG) | 0,10 | 2 | 0,20 |
| Competencia de mercados tradicionales | 0,12 | 2 | 0,24 |
| Estrés hídrico estacional en el valle | 0,08 | 2 | 0,16 |
| Rotación de autoridades del sector | 0,07 | 2 | 0,14 |
| Acceso limitado a crédito formal | 0,10 | 1 | 0,10 |
| Alineación con ODS (acceso a financiamiento ESG) | 0,08 | 4 | 0,32 |
| **Total** | **1,00** | | **2,78** |

*Escala de calificación: 4 = oportunidad mayor; 3 = oportunidad menor; 2 = amenaza menor; 1 = amenaza mayor.*

La puntuación total de 2,78 supera el promedio de referencia (2,50), indicando un entorno externo moderadamente favorable para el proyecto.

## 2.3.2. Matriz MEFI — Evaluación de Factores Internos

| Factor interno | Peso | Calificación | Puntuación |
|---|---:|---:|---:|
| Propuesta de valor diferenciada (cadena corta + trazabilidad) | 0,15 | 4 | 0,60 |
| Equipo emprendedor con formación en gestión | 0,10 | 3 | 0,30 |
| Modelo operativo escalable | 0,10 | 3 | 0,30 |
| Sistema de información integrado pendiente de implementar | 0,12 | 2 | 0,24 |
| Red de productores aún por construir | 0,15 | 1 | 0,15 |
| Capital de trabajo inicial limitado | 0,12 | 2 | 0,24 |
| Conocimiento del mercado urbano objetivo | 0,08 | 3 | 0,24 |
| Marca y reputación en construcción | 0,08 | 1 | 0,08 |
| Capacidad de selección y control de calidad | 0,10 | 3 | 0,30 |
| **Total** | **1,00** | | **2,45** |

*Escala: 4 = fortaleza mayor; 3 = fortaleza menor; 2 = debilidad menor; 1 = debilidad mayor.*

La puntuación interna de 2,45 está apenas por debajo del promedio (2,50), reflejando que el proyecto enfrenta debilidades significativas en activos intangibles que requerirán inversión sostenida durante los primeros años.

## 2.3.3. Matriz FODA Estratégica

| | **Oportunidades (O)** | **Amenazas (A)** |
|---|---|---|
| **Fortalezas (F)** | **Estrategias FO:** Aprovechar el crecimiento del comercio digital con una propuesta diferenciada de trazabilidad. Apalancar la oferta atomizada de productores con el modelo de cadena corta. | **Estrategias FA:** Convertir la propuesta diferenciada en barrera frente a sustitutos tradicionales. Diversificar la base de productores para mitigar el estrés hídrico estacional. |
| **Debilidades (D)** | **Estrategias DO:** Aprovechar el financiamiento ESG para superar el capital de trabajo limitado. Construir la red de productores en alianza con cooperativas y asociaciones existentes. | **Estrategias DA:** Iniciar con un nicho focalizado (alta gama, segmento B2B premium) para construir reputación antes de escalar a segmentos masivos. Cumplir desde el inicio las exigencias SENASAG para evitar barreras de salida regulatorias. |

Las estrategias seleccionadas para el plan estratégico del Capítulo III combinan el aprovechamiento de oportunidades de mercado (FO) con la construcción acelerada de activos intangibles (DO).
`;

const CAP2D_METODOLOGIA = `# 2.4. Metodología de Investigación

## 2.4.1. Tipo de Investigación

La investigación realizada fue de tipo **descriptivo y aplicado**, con enfoque **cuantitativo predominante** y un componente cualitativo complementario en la etapa exploratoria. El alcance descriptivo permite caracterizar el comportamiento del consumidor y del cliente institucional sin manipular variables, condición apropiada para un estudio de pre-factibilidad en el que se busca dimensionar mercados y conocer preferencias.

## 2.4.2. Diseño de la Investigación

El diseño aplicado fue **no experimental, transversal**, con recolección de datos en un único momento del tiempo (junio de 2025). La investigación se desarrolló en dos etapas: una etapa exploratoria de entrevistas a profundidad a actores clave del sector (productores, comerciantes mayoristas, dueños de restaurantes) y una etapa concluyente de aplicación de cuestionarios estructurados a consumidores finales y clientes institucionales.

## 2.4.3. Población y Muestra

**Segmento B2C — Consumidores finales:** la población objetivo está conformada por los hogares del área urbana del municipio de Cochabamba (Cercado), estimados en 180.000 hogares. Se aplicó muestreo aleatorio simple con un nivel de confianza del 95% y un error muestral del 5%, lo que arrojó un tamaño de muestra de 384 hogares.

**Segmento B2B — Clientes institucionales:** la población está conformada por los establecimientos gastronómicos y de procesamiento de alimentos del área urbana, estimados en 1.200 unidades según el registro municipal. Se aplicó muestreo aleatorio estratificado por categoría (restaurantes, pollerías, hamburgueserías, puestos de venta de ensaladas de fruta) con un total de 60 entrevistas válidas.

## 2.4.4. Técnicas e Instrumentos

- **Encuesta estructurada B2C:** 22 preguntas cerradas y de escala Likert sobre hábitos de compra de productos frescos, percepción de precios y disposición a usar canales digitales.
- **Encuesta estructurada B2B:** 18 preguntas sobre frecuencia de compra, volúmenes, criterios de selección de proveedor y dolor operacional con el abastecimiento actual.
- **Entrevista a profundidad:** guía semi-estructurada de 12 ejes temáticos aplicada a 8 actores clave del sector (3 productores, 2 mayoristas, 3 dueños de establecimientos B2B).

## 2.4.5. Procesamiento y Análisis de Datos

Los datos cuantitativos fueron procesados con Microsoft Excel y validados con un análisis exploratorio para descartar valores atípicos. Se calcularon estadísticos descriptivos (media, mediana, desviación estándar) y se aplicaron tablas de contingencia para identificar diferencias significativas por estrato socioeconómico y por categoría de cliente. Los datos cualitativos fueron analizados mediante codificación temática con apoyo de matrices comparativas.
`;

const CAP2E_MERCADO = `# 2.5. Estudio de Mercado

## 2.5.1. Resultados del Segmento B2C

La encuesta aplicada a 384 hogares del área urbana de Cochabamba arrojó los siguientes hallazgos principales:

- **Hábitos de compra:** el 71,4% de los hogares realiza compras de productos frescos al menos dos veces por semana. El canal predominante es el mercado de barrio (48,2%), seguido por el supermercado (29,7%) y la feria de fin de semana (15,8%). Solo el 6,3% utiliza canales digitales de manera regular para esta categoría.

- **Disposición a usar plataformas digitales:** el 62,5% de los encuestados se mostró dispuesto a probar una plataforma digital de productos frescos siempre que ofrezca calidad seleccionada, precios competitivos y entrega oportuna. El interés es significativamente mayor en hogares jóvenes (18-35 años: 78,3%) y en estratos socioeconómicos medio y medio-alto.

- **Disposición a pagar:** el 54,7% de los encuestados aceptaría pagar entre 5% y 10% más que el mercado tradicional a cambio de garantía de calidad, trazabilidad y entrega a domicilio. Este porcentaje aumenta a 71,2% en el estrato medio-alto.

- **Demanda potencial estimada:** sobre la base del tamaño de mercado y los porcentajes de adopción declarada, la demanda potencial mensual del segmento B2C se estima en 38.500 pedidos con un ticket promedio de Bs. 95.

## 2.5.2. Resultados del Segmento B2B

La encuesta a 60 establecimientos institucionales arrojó:

- **Frecuencia de compra:** el 88,3% realiza compras de productos frescos al menos tres veces por semana. La continuidad de abastecimiento es el primer criterio de selección de proveedor (87,1% lo cita como muy importante).

- **Dolor operacional con el abastecimiento actual:** el 64,5% reporta problemas frecuentes de variabilidad de calidad, el 58,1% reporta variabilidad de precios y el 41,9% reporta incumplimiento de horarios de entrega. Estos tres factores constituyen las oportunidades de diferenciación más claras para AgroHub.

- **Volúmenes mensuales promedio:** las pollerías reportan un volumen mensual de Bs. 2.800 a Bs. 4.500 en frescos; las hamburgueserías Bs. 1.800 a Bs. 3.200; los restaurantes medianos Bs. 3.500 a Bs. 6.000; los puestos de venta de ensaladas de fruta Bs. 1.200 a Bs. 2.500.

- **Disposición a probar un nuevo proveedor:** el 76,7% se mostró dispuesto a probar un proveedor alternativo siempre que ofrezca un compromiso formal de continuidad, calidad y precio estable por un período mínimo de tres meses.

- **Demanda potencial estimada:** la demanda potencial mensual del segmento B2B se estima en 850 pedidos con un ticket promedio de Bs. 850.

## 2.5.3. Estimación de la Demanda Insatisfecha

La demanda insatisfecha se calculó como la diferencia entre la demanda potencial estimada y la oferta efectiva del mercado (canales digitales formales con cobertura urbana). Para el segmento B2C, la demanda insatisfecha se estima en 38,7%; para el segmento B2B, en 52,4%. Estas brechas representan el espacio de mercado disponible para la entrada del proyecto.

## 2.5.4. Cuota de Mercado Objetivo

El proyecto se planteó capturar de manera progresiva una cuota de la demanda insatisfecha: 3,5% en el primer año, 7,5% en el segundo, 12% en el tercero y 18% al cierre del quinto año de operación. Estos porcentajes se utilizaron para construir las proyecciones de ingresos del Capítulo III, sección de Planificación Financiera.
`;

const CAP3_HEADER = `# CAPÍTULO III — PLAN ESTRATÉGICO

El presente capítulo desarrolla el plan estratégico, técnico, organizacional, de marketing, financiero y legal para la implementación de la plataforma AgroHub. La estructura sigue la guía UNIFRANZ 2017, sección 4.2.1, y se organiza en cinco bloques: estructura organizacional (sección 3.1), plan de marketing (sección 3.2), plan de producción y operaciones (sección 3.3), planificación financiera (sección 3.4) y aspectos legales (sección 3.5). La integración de los cinco bloques permite definir la propuesta operacional completa del emprendimiento y la base sobre la cual se construyeron las proyecciones financieras evaluadas con los indicadores VAN, TIR y B/C.
`;

const CAP3A_ORGANIZACIONAL = `# 3.1. Estructura Organizacional

## 3.1.1. Misión

Acortar la cadena entre productor y consumidor de alimentos frescos en el valle de Cochabamba, mejorando el ingreso del productor y la calidad percibida por el consumidor mediante un servicio de acopio, selección y comercialización directa con trazabilidad.

## 3.1.2. Visión

Ser, al cierre del quinto año de operación, la plataforma de referencia para la comercialización directa de productos frescos del valle de Cochabamba, con presencia consolidada en el segmento B2C urbano y en el segmento B2B institucional.

## 3.1.3. Valores Corporativos

- **Transparencia:** trazabilidad completa de origen, manejo y entrega de cada producto.
- **Compromiso con el productor:** precios justos, pagos puntuales y relación de largo plazo.
- **Calidad consistente:** selección y control en todas las etapas de la cadena.
- **Cercanía al cliente:** atención directa, respuesta rápida y comunicación clara.

## 3.1.4. Organigrama

La estructura organizacional del primer año de operación contempla los siguientes cargos:

- **Gerencia General (1):** dirección estratégica, relaciones institucionales, control financiero.
- **Coordinación de Operaciones (1):** gestión del centro de acopio, control de calidad, logística.
- **Coordinación Comercial (1):** gestión de cuentas B2B, marketing digital, atención al cliente.
- **Operarios de acopio (3):** recepción, selección, clasificación y empaque.
- **Personal de logística y reparto (2):** rutas urbanas, entrega a clientes institucionales y consumidores finales.
- **Asistencia administrativa (1):** facturación, registros contables, gestión documental.

Total: 9 cargos al inicio del primer año, con incorporación progresiva de 4 cargos adicionales durante los años 2 a 5 (un operario adicional, un comercial B2B, un técnico de mantenimiento del frío y un asistente de control de calidad).

## 3.1.5. Manual de Funciones y Procedimientos

El proyecto contempla la elaboración, durante los primeros dos meses de operación, de un manual de funciones que defina responsabilidades, dependencia jerárquica, indicadores de gestión y procedimientos críticos. Los procedimientos prioritarios identificados son: recepción y selección de producto, control de cadena de frío, atención de pedidos B2C, atención de pedidos B2B y manejo de devoluciones por calidad.

## 3.1.6. Recursos Humanos

La política de recursos humanos contempla contratación bajo el régimen de la Ley General del Trabajo, con beneficios sociales completos y afiliación al seguro de corto plazo (Caja Nacional de Salud) y al sistema integral de pensiones (AFP). El salario promedio del personal operario se sitúa en Bs. 3.200 mensuales, por encima del salario mínimo nacional. Se contempla un programa de capacitación trimestral en manejo de alimentos, atención al cliente y uso de la plataforma digital.
`;

const CAP3B_MARKETING = `# 3.2. Plan de Marketing

## 3.2.1. Mercado Objetivo

El proyecto define dos segmentos objetivo claramente diferenciados:

- **Segmento B2C:** hogares del área urbana de Cochabamba pertenecientes a los estratos socioeconómicos medio y medio-alto, con jefes de hogar de entre 25 y 55 años, sensibilidad a la calidad y disponibilidad de pago digital. Estimación del segmento: 64.000 hogares.

- **Segmento B2B:** establecimientos gastronómicos y de procesamiento de alimentos del área urbana con volumen de compra mensual superior a Bs. 1.500. Categorías priorizadas: pollerías, hamburgueserías, restaurantes medianos y puestos de venta de ensaladas de fruta. Estimación del segmento: 720 establecimientos.

## 3.2.2. Posicionamiento

AgroHub se posiciona como la plataforma de productos frescos del valle de Cochabamba con trazabilidad completa, calidad seleccionada y precios competitivos gracias al modelo de cadena corta. La promesa central es "del campo a tu mesa con un solo intermediario".

## 3.2.3. Estrategia de Producto

El portafolio inicial contempla tres líneas: hortalizas de hoja (lechugas, espinacas, acelgas), hortalizas de raíz y fruto (zanahorias, papas, tomates, cebollas) y frutas frescas del valle (manzanas, peras, frutilla, durazno en temporada). Cada lote se presenta con etiqueta de trazabilidad indicando origen, fecha de cosecha y productor. La selección por calidad opera en tres niveles: estándar, premium y selección especial para clientes B2B con requisitos específicos.

## 3.2.4. Estrategia de Precio

La estrategia de precio se construye sobre una premisa central: ofrecer al consumidor final un precio entre 8% y 15% por debajo del supermercado para calidad equivalente, manteniendo un margen bruto del 28% al 35% según producto. Para el segmento B2B se aplican descuentos por volumen entre 5% y 12%. La estrategia de precio se revisa trimestralmente sobre la base del comportamiento del mercado mayorista y de los costos de adquisición.

## 3.2.5. Estrategia de Plaza

El canal principal es la plataforma digital propia (sitio web responsive y aplicación móvil progresiva tipo PWA), complementada con una tienda física centralizada en zona estratégica del área urbana que opera tanto como punto de venta directo como centro de despacho a domicilio. La cobertura geográfica inicial comprende los distritos urbanos de mayor concentración de hogares del segmento objetivo, con expansión progresiva durante los años 2 y 3.

## 3.2.6. Estrategia de Promoción

La estrategia de promoción se sustenta en cuatro pilares:

1. **Marketing digital:** presencia activa en redes sociales (Instagram, Facebook, TikTok) con contenido educativo sobre origen, manejo y preparación de productos del valle. Inversión mensual estimada: Bs. 2.500.
2. **Relaciones públicas locales:** alianzas con medios locales, participación en ferias gastronómicas y comunicación con asociaciones de productores y de consumidores.
3. **Programa de referidos:** descuentos cruzados para clientes B2C que recomiendan nuevos hogares al servicio.
4. **Venta directa B2B:** equipo comercial dedicado a la prospección y captación de clientes institucionales, con propuestas a medida según volumen y categoría.

## 3.2.7. Plan de Lanzamiento

El plan de lanzamiento contempla una fase piloto de dos meses con 12 productores socios y 50 hogares cliente cerrados por referidos, durante la cual se prueban procedimientos, se ajustan precios y se calibran rutas logísticas. La fase pública abre al mes tres con campaña de comunicación digital y apertura de la tienda física centralizada.
`;

const CAP3C_PRODUCCION = `# 3.3. Plan de Producción y Operaciones

## 3.3.1. Localización del Centro de Acopio

La localización seleccionada se ubica en zona industrial intermedia del área urbana del municipio de Cochabamba, con acceso a vías principales tanto desde las zonas productoras del valle como hacia los distritos urbanos de mayor concentración del mercado objetivo. La selección consideró ocho factores ponderados: cercanía a productores, acceso a vías urbanas, disponibilidad de servicios básicos, costo del alquiler, seguridad de la zona, disponibilidad de mano de obra calificada, normativa municipal aplicable y posibilidad de expansión futura.

## 3.3.2. Tamaño y Distribución de las Instalaciones

El centro de acopio inicial contempla 280 m² distribuidos en cinco áreas funcionales:

- Área de recepción y pesaje: 35 m².
- Área de selección y clasificación: 60 m².
- Cámara fría para hojas y frutas delicadas: 40 m².
- Área de almacenamiento ambiente para raíces y frutos resistentes: 45 m².
- Área de despacho y armado de pedidos: 50 m².
- Oficinas administrativas y atención al cliente: 30 m².
- Servicios sanitarios y áreas comunes: 20 m².

## 3.3.3. Equipamiento Requerido

El equipamiento principal contempla: una cámara fría modular con capacidad de 8 toneladas, balanzas comerciales calibradas (2 unidades), mesas de selección de acero inoxidable, equipos de empaque, sistema de etiquetado con código QR para trazabilidad, sistema de gestión de inventario y pedidos, equipos informáticos para administración y atención, y un vehículo refrigerado de 1,5 toneladas para reparto a clientes institucionales.

## 3.3.4. Proceso Operativo

El proceso operativo se organiza en cinco etapas: (1) recepción del producto del productor con verificación de calidad inicial; (2) selección y clasificación por nivel de calidad; (3) almacenamiento bajo condiciones controladas según tipo de producto; (4) armado de pedidos por orden de la plataforma digital; (5) despacho a domicilio o entrega en tienda física. El tiempo objetivo desde la recepción hasta la entrega al cliente final es de menos de 36 horas para productos de mayor delicadeza y 72 horas para productos resistentes.

## 3.3.5. Capacidad Operativa Proyectada

La capacidad operativa del primer año se proyecta en 22 toneladas mensuales de producto procesado, con utilización del 60% de la capacidad instalada en el primer trimestre, escalando hasta el 85% al cierre del primer año. La capacidad se amplía progresivamente con la incorporación de una segunda cámara fría al cierre del segundo año y la ampliación del área de selección al cierre del tercer año.

## 3.3.6. Control de Calidad

El sistema de control de calidad opera en tres puntos: control de ingreso (rechazo del 8% al 12% del producto recibido por debajo de estándar mínimo), control de proceso (verificación de cadena de frío y manipulación) y control de salida (verificación previa al despacho). Los lotes rechazados se devuelven al productor o se canalizan a destinos de menor exigencia. El proyecto contempla certificación SENASAG completa al cierre del primer año de operación.
`;

const CAP3D_FINANCIERA = `# 3.4. Planificación Financiera

## 3.4.1. Inversión Inicial

La inversión inicial requerida para el proyecto se estima en **Bs. 412.000**, distribuidos en los siguientes rubros:

| Rubro | Monto (Bs.) | Participación |
|---|---:|---:|
| Adecuación de infraestructura (centro de acopio) | 78.000 | 18,9% |
| Equipamiento (cámara fría, balanzas, mesas, etc.) | 145.000 | 35,2% |
| Vehículo refrigerado | 95.000 | 23,1% |
| Sistema de información y plataforma digital | 38.000 | 9,2% |
| Capital de trabajo inicial (3 meses) | 42.000 | 10,2% |
| Gastos preoperativos y constitución legal | 14.000 | 3,4% |
| **Total** | **412.000** | **100,0%** |

## 3.4.2. Estructura de Financiamiento

La estructura de financiamiento propuesta combina aporte propio del 45% (Bs. 185.400) y financiamiento bancario del 55% (Bs. 226.600). El crédito bancario se contempla a 5 años con tasa de interés del 11% anual, pagos mensuales y un período de gracia de 3 meses sobre el capital. Se evaluó la posibilidad de acceder a fondos del Banco de Desarrollo Productivo (BDP) con tasas preferenciales para emprendimientos del sector agroalimentario, lo que mejoraría la viabilidad financiera si se confirma el acceso durante la fase de implementación.

## 3.4.3. Proyección de Ingresos

Las proyecciones de ingresos se construyeron sobre la base de los porcentajes de cuota de mercado definidos en la sección 2.5.4 y los tickets promedio del estudio de mercado. El detalle por año es el siguiente:

| Año | Pedidos B2C | Pedidos B2B | Ingresos B2C (Bs.) | Ingresos B2B (Bs.) | Total (Bs.) |
|---:|---:|---:|---:|---:|---:|
| 1 | 16.170 | 5.350 | 1.536.150 | 4.547.500 | 6.083.650 |
| 2 | 34.650 | 11.450 | 3.291.750 | 9.732.500 | 13.024.250 |
| 3 | 55.440 | 18.330 | 5.266.800 | 15.580.500 | 20.847.300 |
| 4 | 71.270 | 23.540 | 6.770.650 | 20.009.000 | 26.779.650 |
| 5 | 83.160 | 27.460 | 7.900.200 | 23.341.000 | 31.241.200 |

## 3.4.4. Proyección de Costos y Gastos

Los costos y gastos proyectados se agrupan en costos de adquisición de producto (72% de los ingresos por la estructura de cadena corta), costos operativos (salarios, alquileres, servicios), gastos administrativos, gastos comerciales y gastos financieros. El detalle por año (en Bs.) es el siguiente:

| Año | Costo de producto | Costos operativos | Gastos administrativos | Gastos comerciales | Gastos financieros | Total |
|---:|---:|---:|---:|---:|---:|---:|
| 1 | 4.380.228 | 720.000 | 320.000 | 180.000 | 24.926 | 5.625.154 |
| 2 | 9.377.460 | 850.000 | 380.000 | 280.000 | 21.054 | 10.908.514 |
| 3 | 15.010.056 | 980.000 | 440.000 | 380.000 | 16.654 | 16.826.710 |
| 4 | 19.281.348 | 1.080.000 | 480.000 | 440.000 | 11.604 | 21.292.952 |
| 5 | 22.493.664 | 1.180.000 | 520.000 | 480.000 | 5.793 | 24.679.457 |

## 3.4.5. Flujo de Caja Proyectado

El flujo de caja neto proyectado, después de impuestos (IUE 25%) y reinversiones necesarias, presenta los siguientes resultados (en Bs.):

| Año | Flujo de caja neto |
|---:|---:|
| 0 | (412.000) |
| 1 | 343.872 |
| 2 | 1.586.802 |
| 3 | 3.015.443 |
| 4 | 4.115.023 |
| 5 | 4.921.307 |

## 3.4.6. Indicadores de Evaluación

Aplicando los indicadores estandarizados de evaluación de proyectos con una tasa de descuento del 14% (costo de oportunidad ajustado por riesgo):

- **Valor Actual Neto (VAN):** **Bs. 312.480** (positivo, agrega valor sobre la mejor alternativa de inversión).
- **Tasa Interna de Retorno (TIR):** **24,6%** (supera ampliamente el costo de oportunidad del 14%).
- **Relación Beneficio-Costo (B/C):** **1,32** (cada Bs. invertido genera Bs. 1,32 de beneficio actualizado).
- **Período de recuperación de la inversión (Payback):** **2,3 años**.

## 3.4.7. Análisis de Sensibilidad

Se realizó análisis de sensibilidad ante variaciones de tres variables críticas: cuota de mercado capturada, costo de adquisición del producto y tasa de interés del crédito. El proyecto mantiene VAN positivo ante reducciones de la cuota de mercado del 20%, incrementos del costo de adquisición del 8% y aumentos de la tasa de interés de 3 puntos porcentuales. El umbral de rentabilidad se sitúa en una cuota de mercado del 2,1% del primer año, por debajo de la cuota objetivo del 3,5%.

## 3.4.8. Conclusión Financiera

Los indicadores VAN, TIR y B/C, junto con el análisis de sensibilidad, sustentan la viabilidad financiera del proyecto bajo los supuestos definidos. La rentabilidad del proyecto es sensible al cumplimiento de las cuotas de captación de mercado, lo que coloca al plan de marketing como el factor de mayor incidencia en el éxito del emprendimiento.
`;

const CAP3E_LEGAL = `# 3.5. Aspectos Legales

## 3.5.1. Forma Jurídica de la Empresa

El proyecto se constituye como Sociedad de Responsabilidad Limitada (S.R.L.) bajo las disposiciones del Código de Comercio del Estado Plurinacional de Bolivia. Esta forma jurídica se selecciona por su adecuación a emprendimientos de tamaño mediano, su flexibilidad para incorporar socios futuros y la limitación de responsabilidad de los socios al capital aportado.

## 3.5.2. Registros Obligatorios

La constitución formal del emprendimiento contempla los siguientes registros:

- **Registro de Comercio** ante el Servicio Plurinacional de Registro de Comercio (SEPREC), antes denominado FUNDEMPRESA.
- **Número de Identificación Tributaria (NIT)** ante el Servicio de Impuestos Nacionales.
- **Padrón Municipal** ante el Gobierno Autónomo Municipal de Cochabamba, incluyendo la Licencia de Funcionamiento del centro de acopio.
- **Registro Sanitario** ante el Servicio Nacional de Sanidad Agropecuaria e Inocuidad Alimentaria (SENASAG), específicamente la habilitación del centro de acopio para manipulación de alimentos frescos.
- **Afiliación a la Caja Nacional de Salud** y a la Administradora de Fondos de Pensiones (AFP) para el personal contratado.
- **Registro en el Ministerio de Trabajo** con depósito del Reglamento Interno y del Reglamento de Higiene y Seguridad Ocupacional.

## 3.5.3. Normativa Sectorial Aplicable

La operación del proyecto se sujeta a las siguientes disposiciones normativas:

- **Código de Comercio del Estado Plurinacional de Bolivia** para todos los aspectos societarios y comerciales.
- **Ley General del Trabajo y su Reglamento** para la contratación de personal, beneficios sociales y condiciones laborales.
- **Ley N.° 453 de Defensa del Consumidor (2013)** para la operación del canal de venta directa, incluyendo deberes de información al consumidor, garantía del producto y procedimientos de reclamo.
- **Normativa SENASAG** para el manejo, almacenamiento y transporte de alimentos frescos, incluyendo el cumplimiento de Buenas Prácticas de Manufactura (BPM) y Buenas Prácticas de Higiene (BPH).
- **Normativa ASFI** aplicable a los pagos digitales y a la interacción con billeteras móviles y QR bancarios.
- **Ley N.° 1333 de Medio Ambiente** para el manejo de residuos orgánicos generados en el proceso de selección.

## 3.5.4. Estructura Contractual

La operación del proyecto contempla tres tipos de contratos:

- **Contrato de provisión con productores:** acuerdo marco que regula condiciones de calidad, precio, plazos de pago y exclusividad parcial. Incluye cláusulas de control de calidad, devoluciones y resolución de controversias.
- **Contrato laboral con personal:** contratos a tiempo indefinido bajo régimen de la Ley General del Trabajo, con período de prueba de tres meses y beneficios sociales completos.
- **Términos y condiciones del servicio (clientes B2C y B2B):** documento publicado en la plataforma digital que define alcance del servicio, política de precios, política de devoluciones, manejo de datos personales (Ley N.° 045 contra el racismo y toda forma de discriminación, y normativa de protección de datos del consumidor) y procedimientos de reclamo.

## 3.5.5. Obligaciones Tributarias

La empresa se sujeta al Régimen General del Servicio de Impuestos Nacionales, con obligaciones de pago del Impuesto al Valor Agregado (IVA, 13%), Impuesto a las Transacciones (IT, 3%), Impuesto sobre las Utilidades de las Empresas (IUE, 25% anual sobre utilidades netas) y aportes a la seguridad social del personal. Se contempla la contratación de un servicio de asesoría contable y tributaria externa durante los primeros dos años, con incorporación de personal contable interno al cierre del segundo año.

## 3.5.6. Plan de Cumplimiento Legal

El proyecto contempla la elaboración, durante el primer trimestre de operación, de un plan de cumplimiento legal con responsable designado, calendario de obligaciones recurrentes (declaraciones tributarias, renovación de registros, actualizaciones contractuales) y mecanismo de seguimiento mensual. El plan se revisa anualmente con asesoría legal externa.
`;

const CONCLUSIONES = `# CONCLUSIONES

A partir del análisis desarrollado en los capítulos I, II y III del presente Proyecto de Grado, se formularon las siguientes conclusiones:

**Primera.** El estudio de mercado realizado a una muestra representativa de 384 hogares y 60 establecimientos institucionales del área urbana del municipio de Cochabamba evidenció una demanda insatisfecha del 38,7% para el segmento B2C y del 52,4% para el segmento B2B, lo que confirma la existencia de un espacio de mercado relevante para el emprendimiento.

**Segunda.** El análisis del macroentorno (PESTEL) y del microentorno (cinco fuerzas de Porter), integrados en las matrices MEFE (puntuación 2,78) y MEFI (puntuación 2,45), caracterizan un entorno externo moderadamente favorable y un perfil interno con fortalezas en la propuesta de valor diferenciada y debilidades en activos intangibles (red de productores y reputación) que requerirán inversión sostenida.

**Tercera.** El plan estratégico formulado en el Capítulo III, articulado en sus dimensiones organizacional, de marketing, técnica, financiera y legal, define una propuesta operativa coherente con el tamaño del mercado objetivo, los recursos disponibles y las exigencias normativas aplicables.

**Cuarta.** La evaluación financiera del proyecto, realizada con horizonte de cinco años y tasa de descuento del 14%, arrojó un VAN positivo de Bs. 312.480, una TIR del 24,6% que supera ampliamente el costo de oportunidad definido y una relación Beneficio-Costo de 1,32. El período de recuperación de la inversión se sitúa en 2,3 años.

**Quinta.** El análisis de sensibilidad demostró que el proyecto mantiene viabilidad financiera ante variaciones razonables de las variables críticas (cuota de mercado, costo de adquisición y tasa de interés), aunque la rentabilidad presenta mayor sensibilidad a la cuota de captación de mercado, lo que coloca al plan de marketing como factor determinante del éxito del emprendimiento.

**Sexta.** En conjunto, los resultados del estudio respaldan la conclusión central de que el proyecto AgroHub es **factible** en sus dimensiones comercial, técnica, organizacional, legal y financiera bajo los supuestos definidos, y que su implementación durante el período 2025–2030 presenta condiciones favorables para alcanzar los objetivos planteados al inicio del estudio.
`;

const RECOMENDACIONES = `# RECOMENDACIONES

A partir de las conclusiones del estudio, se formulan las siguientes recomendaciones para la implementación del proyecto:

**Primera.** Iniciar la construcción de la red de productores socios antes de la apertura comercial pública del emprendimiento, con un piloto de dos meses que permita validar procedimientos, ajustar precios y consolidar relaciones de confianza con un grupo inicial de doce productores.

**Segunda.** Priorizar durante el primer año la captación del segmento B2B institucional (pollerías, hamburgueserías, restaurantes y puestos de venta de ensaladas de fruta), que presenta mayor demanda insatisfecha y volúmenes de compra más previsibles que el segmento B2C, lo que permite estabilizar los flujos de caja iniciales.

**Tercera.** Gestionar acceso a fondos del Banco de Desarrollo Productivo o a financiamiento con criterios ESG durante el primer trimestre, dado que su tasa preferencial mejoraría significativamente los indicadores financieros del proyecto y liberaría capital de trabajo para inversión en construcción de marca.

**Cuarta.** Implementar desde el primer mes de operación el sistema de trazabilidad por código QR como elemento diferenciador frente a competidores tradicionales, comunicando activamente esta capacidad en la estrategia de marketing digital y en la venta directa B2B.

**Quinta.** Mantener una política de revisión trimestral de la estructura de precios sobre la base del comportamiento del mercado mayorista y de los costos de adquisición, con el fin de preservar el margen objetivo del 28% al 35% y el diferencial de precio frente al supermercado del 8% al 15%.

**Sexta.** Contratar asesoría legal y tributaria externa durante los primeros dos años de operación, hasta que la empresa cuente con personal contable interno con experiencia, con el objeto de garantizar el cumplimiento estricto de las obligaciones SENASAG, ASFI y tributarias.

**Séptima.** Realizar al cierre del primer año una evaluación post-implementación con métricas de desempeño definidas a priori (cuota de mercado capturada, tasa de retención de clientes B2B, margen efectivo realizado, tiempo promedio de entrega) que permita ajustar el plan estratégico para los años siguientes.
`;

const BIBLIOGRAFIA = `# BIBLIOGRAFÍA

A continuación se listan las fuentes referenciadas en el cuerpo del presente Proyecto de Grado, ordenadas alfabéticamente por apellido del primer autor, en formato APA con la convención UNIFRANZ de apellidos en minúsculas.

cámara de industria, comercio, servicios y turismo de cochabamba. (2023). *Informe sectorial del comercio digital de alimentos en Cochabamba*. Cochabamba: CICST.

chen, x., dimitri, c., & gardiner, b. (2020). The rise of direct-to-consumer agrifood platforms in emerging markets. *Journal of Agricultural Economics and Policy*, 18(3), 245–268.

estado plurinacional de bolivia. (2013). *Ley N.° 453 de Defensa del Consumidor*. Gaceta Oficial del Estado Plurinacional de Bolivia.

fao. (2019). *El estado mundial de la agricultura y la alimentación 2019: progresos en la lucha contra la pérdida y el desperdicio de alimentos*. Organización de las Naciones Unidas para la Alimentación y la Agricultura.

ine. (2023). *Encuesta de hogares y caracterización demográfica del Departamento de Cochabamba*. La Paz: Instituto Nacional de Estadística.

johnson, g., scholes, k., & whittington, r. (2006). *Dirección estratégica* (7.ª ed.). Madrid: Pearson Educación.

ministerio de desarrollo rural y tierras. (2022). *Programa Nacional de Apoyo al Pequeño Productor: balance 2018–2022*. La Paz: Ministerio de Desarrollo Rural y Tierras.

porter, m. e. (1980). *Competitive strategy: techniques for analyzing industries and competitors*. New York: The Free Press.

renting, h., marsden, t., & banks, j. (2003). Understanding alternative food networks: exploring the role of short food supply chains in rural development. *Environment and Planning A*, 35(3), 393–411.

sapag chain, n. (2011). *Proyectos de inversión: formulación y evaluación* (2.ª ed.). Santiago de Chile: Pearson Educación.
`;

const COMPILACION = `# COMPILACIÓN FINAL

El documento ha sido consolidado en formato LaTeX siguiendo la guía oficial de Organización y Presentación de Trabajos de Grado de UNIFRANZ Cochabamba (edición 2017). El paquete final incluye:

- Documento principal en formato \`.tex\` con todos los capítulos integrados.
- Bibliografía consolidada en formato APA con apellidos en minúsculas (norma UNIFRANZ).
- Carátula configurada con datos del estudiante, tutor, programa, gestión académica y mes-año de presentación.
- Índice de contenido, índice de tablas y índice de figuras generados automáticamente.
- Resumen del trabajo (250 palabras) ubicado en las preliminares.
- Logo institucional de UNIFRANZ y plantilla de página oficial.

El paquete está listo para ser compilado en Overleaf o en una distribución LaTeX local (TeXLive, MikTeX) y exportado a PDF para impresión empastada o entrega digital al tutor y al tribunal.
`;

const DEFENSA = `# BANCO DE PREGUNTAS — DEFENSA

A continuación se presentan las preguntas más probables que el tribunal académico podría formular durante la defensa oral, organizadas por bloque temático, con una respuesta orientativa que el estudiante debe ajustar a su propia preparación.

## Bloque 1 — Planteamiento del Problema

**Pregunta:** ¿Por qué se consideró que existe una demanda insatisfecha si en Cochabamba ya hay mercados y supermercados que venden frutas y verduras?

*Respuesta orientativa:* La demanda insatisfecha no se refiere al acceso físico al producto sino al acceso a producto fresco, seleccionado, trazable y con cadena corta. Los canales tradicionales tienen variabilidad alta de calidad y carecen de trazabilidad. El estudio de mercado evidenció que el 62,5% del segmento B2C estaría dispuesto a usar un canal con esas características.

## Bloque 2 — Metodología

**Pregunta:** ¿Cómo se calculó el tamaño de muestra de 384 hogares?

*Respuesta orientativa:* Se aplicó la fórmula clásica de muestreo aleatorio simple para poblaciones grandes con nivel de confianza del 95% (Z = 1,96) y error muestral del 5% (e = 0,05), asumiendo proporción p = 0,5 para maximizar la varianza. El resultado de la fórmula n = Z²·p·(1−p)/e² arroja exactamente 384,16 hogares, redondeado a 384.

## Bloque 3 — Estudio de Mercado

**Pregunta:** ¿La cuota de mercado del 3,5% del primer año no es demasiado optimista?

*Respuesta orientativa:* El análisis de sensibilidad demostró que el proyecto mantiene viabilidad financiera con una cuota mínima del 2,1%. El 3,5% se construyó sobre el porcentaje de adopción declarada en la encuesta, ajustado a la baja por el sesgo típico entre intención y compra real. El piloto inicial de dos meses permitirá validar el ritmo de captación antes del lanzamiento público.

## Bloque 4 — Evaluación Financiera

**Pregunta:** ¿Por qué se aplicó una tasa de descuento del 14%?

*Respuesta orientativa:* La tasa de 14% se construyó como costo de oportunidad ajustado por riesgo. Se tomó como base la tasa pasiva promedio del sistema bancario boliviano (4–5%), a la cual se sumó una prima por riesgo país, una prima por riesgo sectorial agroalimentario y una prima por riesgo específico del emprendimiento por ser de nueva creación. El resultado de 14% es conservador y representa el rendimiento mínimo exigido a un inversionista que renuncia a alternativas más seguras.

**Pregunta:** ¿Qué pasa si el costo de adquisición sube más de 8%?

*Respuesta orientativa:* El análisis de sensibilidad evaluó incrementos hasta el 8% manteniendo VAN positivo. Por encima de ese umbral, el proyecto requeriría ajustar precios al consumidor para preservar el margen objetivo, lo que podría afectar la cuota de mercado. Para mitigar este riesgo, el plan estratégico contempla diversificar la base de productores socios y mantener acuerdos marco de precios con revisión trimestral.

## Bloque 5 — Aspectos Legales

**Pregunta:** ¿Por qué se eligió la forma jurídica de S.R.L. y no de Sociedad Anónima?

*Respuesta orientativa:* La S.R.L. es la forma jurídica adecuada para emprendimientos de tamaño mediano por su menor complejidad de constitución, la limitación de responsabilidad de los socios al capital aportado, el menor costo de cumplimiento societario y la flexibilidad para incorporar socios futuros. La Sociedad Anónima sería pertinente si el proyecto contemplara apertura a inversionistas externos en mercados de valores, lo que no forma parte del plan a cinco años.

## Bloque 6 — Defensa de la Viabilidad

**Pregunta:** Si el proyecto es tan viable, ¿por qué nadie lo ha hecho antes en Cochabamba?

*Respuesta orientativa:* La conjunción de tres factores recientes hace viable el modelo hoy y no antes: la maduración de la adopción de pagos digitales en el área urbana (consolidada en los últimos cuatro años), el cambio en los hábitos de compra impulsado por la pandemia de COVID-19 (que aceleró la disposición a usar canales digitales para alimentos frescos) y la mejora en la oferta de transporte refrigerado urbano. Las plataformas tradicionales que intentaron antes este modelo enfrentaron resistencia de adopción que hoy no existe.
`;

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

// La Introducción ya estaba en la versión 1; la mantenemos completa para que
// quienes cargaron la v1 vean el cambio progresivo cuando se aplique la v2.
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

export const AGROHUB_DEMO_SEED: DemoSeed = {
  // Cambio de seed_id v1 → v2 para forzar la re-aplicación del demo
  // (en lugar de devolver early "ya existía"). El endpoint /api/admin/seed-demo
  // detecta seed_id distinto y aplica UPDATE de phase_contents.
  seed_id: "agrohub-prefactibilidad-v2",
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
    "ph-unifranz-pg-prefactibilidad-resumen": RESUMEN,
    "ph-unifranz-pg-prefactibilidad-introduccion": INTRODUCCION,
    "ph-unifranz-pg-prefactibilidad-cap1": CAP1_MARCO_TEORICO,
    "ph-unifranz-pg-prefactibilidad-cap2-investigacion": CAP2_HEADER,
    "ph-unifranz-pg-prefactibilidad-cap2a-macroentorno": CAP2A_MACROENTORNO,
    "ph-unifranz-pg-prefactibilidad-cap2b-microentorno": CAP2B_MICROENTORNO,
    "ph-unifranz-pg-prefactibilidad-cap2c-matricial": CAP2C_MATRICIAL,
    "ph-unifranz-pg-prefactibilidad-cap2d-metodologia": CAP2D_METODOLOGIA,
    "ph-unifranz-pg-prefactibilidad-cap2e-mercado": CAP2E_MERCADO,
    "ph-unifranz-pg-prefactibilidad-cap3-plan-estrategico": CAP3_HEADER,
    "ph-unifranz-pg-prefactibilidad-cap3a-organizacional": CAP3A_ORGANIZACIONAL,
    "ph-unifranz-pg-prefactibilidad-cap3b-marketing": CAP3B_MARKETING,
    "ph-unifranz-pg-prefactibilidad-cap3c-produccion": CAP3C_PRODUCCION,
    "ph-unifranz-pg-prefactibilidad-cap3d-financiera": CAP3D_FINANCIERA,
    "ph-unifranz-pg-prefactibilidad-cap3e-legal": CAP3E_LEGAL,
    "ph-unifranz-pg-prefactibilidad-conclusiones": CONCLUSIONES,
    "ph-unifranz-pg-prefactibilidad-recomendaciones": RECOMENDACIONES,
    "ph-unifranz-pg-prefactibilidad-bibliografia": BIBLIOGRAFIA,
    "ph-unifranz-pg-prefactibilidad-compilacion": COMPILACION,
    "ph-unifranz-pg-prefactibilidad-defensa": DEFENSA,
  },
};
