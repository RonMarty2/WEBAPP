/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SEED DEMO — Proyecto Influencia del Marketing Digital en Gen Z
 *             (UNIFRANZ · Tesis de Grado)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * SERVER-ONLY. Contenido de demostración generado actuando como la API de IA
 * sobre los megaprompts UNIFRANZ Tesis. Caso seleccionado: tesis de
 * investigación pura con hipótesis verificable, en el área de marketing
 * digital y consumo en Cochabamba.
 *
 * IDs de fase: getUnifranzPhases("unifranz-tesis") → ph-unifranz-tesis-{slug}
 */

import type { DemoSeed } from "./agrohubDemo";

const RESUMEN = `# RESUMEN DEL TRABAJO

La presente Tesis de Grado abordó la influencia del marketing digital en la decisión de compra de los consumidores de la Generación Z en restaurantes de comida rápida del municipio de Cochabamba durante el período 2024–2025. El objetivo general consistió en determinar la relación entre las estrategias de marketing digital aplicadas por los restaurantes de comida rápida y las decisiones de compra de los consumidores nacidos entre 1997 y 2012.

El estudio adoptó un enfoque cuantitativo, no experimental, transversal y correlacional. Se aplicó un cuestionario estructurado a una muestra de 384 consumidores de la Generación Z residentes en el área urbana de Cochabamba, seleccionada mediante muestreo aleatorio simple con nivel de confianza del 95% y error muestral del 5%. El instrumento fue validado por juicio de expertos y mostró un Alfa de Cronbach de 0,87 en una prueba piloto previa. Los datos se procesaron mediante estadística descriptiva e inferencial, aplicando coeficiente de correlación de Pearson para contrastar las hipótesis específicas.

Los resultados evidenciaron que las estrategias de marketing digital influyen positiva y significativamente en la decisión de compra del segmento estudiado (r = 0,724; p < 0,01). El contenido visual en redes sociales, las recomendaciones de microinfluenciadores locales y la respuesta inmediata por WhatsApp Business resultaron los factores con mayor incidencia. La hipótesis general fue verificada. Los hallazgos contribuyen al conocimiento del comportamiento del consumidor joven boliviano y aportan recomendaciones aplicables para el sector gastronómico local.
`;

const INTRODUCCION = `# INTRODUCCIÓN

El consumo de comida rápida en el área urbana de Cochabamba ha mostrado un crecimiento sostenido en la última década, impulsado tanto por la expansión de cadenas locales como por la consolidación de hábitos de consumo influenciados por la digitalización de la vida cotidiana. La Generación Z, definida por la literatura como el grupo de personas nacidas entre 1997 y 2012, constituye actualmente el segmento de mayor crecimiento como consumidores de este rubro, y se caracteriza por tomar decisiones de compra fuertemente mediadas por contenido digital.

La presente Tesis de Grado se propuso analizar empíricamente la relación entre las estrategias de marketing digital aplicadas por los restaurantes de comida rápida de Cochabamba y la decisión de compra de los consumidores pertenecientes a esta generación. El documento se organiza en una Introducción que delimita el problema, los objetivos, los alcances y la hipótesis del estudio; un Capítulo I de Marco Teórico que sustenta conceptualmente la investigación; un Capítulo II de Marco Práctico que detalla la metodología aplicada; un Capítulo III de Resultados y Discusión que presenta y analiza los hallazgos; y un apartado final de conclusiones y recomendaciones.

## 1. Planteamiento del Problema

El sector de restaurantes de comida rápida en Cochabamba enfrenta un escenario competitivo marcado por la incorporación acelerada de canales digitales de comunicación con el cliente. La proliferación de aplicaciones de delivery, perfiles de redes sociales activos, contenido en TikTok e Instagram, campañas pagadas y respuesta vía WhatsApp Business ha redefinido la manera en que los consumidores descubren, evalúan y deciden dónde comer (kotler & armstrong, 2017). La pregunta de fondo es si esa inversión digital efectivamente influye sobre la decisión de compra del segmento más joven, que es a la vez el más expuesto a estos estímulos.

A nivel global, diversos estudios han evidenciado correlaciones entre la presencia digital de las marcas y la decisión de compra de los consumidores jóvenes (chaffey & ellis-chadwick, 2019). Sin embargo, en el contexto boliviano la evidencia empírica es limitada. Las decisiones de inversión en marketing digital de los restaurantes cochabambinos se toman, en muchos casos, sobre supuestos no verificados localmente. Esta brecha de conocimiento dificulta la asignación racional de presupuestos y reduce la capacidad de las empresas locales para competir con cadenas mejor estructuradas.

De mantenerse esta situación, los restaurantes seguirán invirtiendo en canales digitales sin métricas locales que respalden las decisiones, y la Generación Z continuará siendo objeto de campañas que no aprovechan plenamente las particularidades de su comportamiento. Esto representa un costo de oportunidad tanto para las empresas como para el ecosistema gastronómico local.

En función de lo expuesto, el problema de investigación se formuló de la siguiente manera: ¿Existe una relación significativa entre las estrategias de marketing digital aplicadas por los restaurantes de comida rápida de Cochabamba y la decisión de compra de los consumidores de la Generación Z durante el período 2024–2025?

## 2. Justificación

El estudio se justifica por su aporte tanto a la práctica empresarial local como a la literatura académica sobre comportamiento del consumidor en mercados emergentes.

### 2.1. Justificación Práctica

Los hallazgos del estudio entregan a los responsables de marketing de restaurantes de comida rápida en Cochabamba una base empírica para decidir en qué canales digitales invertir y con qué tipo de contenido. La identificación de los factores que efectivamente inciden en la decisión del consumidor joven permite optimizar la asignación de presupuesto y mejorar el retorno sobre la inversión publicitaria.

### 2.2. Justificación Económica

La asignación racional del presupuesto de marketing tiene impacto directo sobre la rentabilidad del negocio. La estimación de inversión publicitaria en el sector gastronómico local supera los Bs. 3.000 mensuales por restaurante mediano. Una orientación informada del gasto puede mejorar la eficiencia de esa inversión y reducir el costo de adquisición de cliente.

### 2.3. Justificación Social

El estudio caracteriza el comportamiento de un segmento poblacional relevante, la Generación Z, cuya participación en el consumo urbano crece año a año. Comprender sus motivaciones y sus canales de influencia contribuye a un marketing más respetuoso con sus preferencias, menos invasivo y más alineado con la conversación pública que ese segmento genera en plataformas digitales.

### 2.4. Justificación Legal

La investigación se enmarca en la normativa de protección de datos del consumidor (Ley N.° 453, 2013) y en las disposiciones del Servicio Nacional de Sanidad Agropecuaria e Inocuidad Alimentaria aplicables al sector. Los datos recolectados por encuesta se anonimizaron y se procesaron exclusivamente con fines académicos.

### 2.5. Justificación Teórica

El estudio amplía la evidencia empírica sobre la aplicación de los modelos de comportamiento del consumidor digital propuestos por kotler y armstrong (2017) y chaffey y ellis-chadwick (2019) a un contexto urbano de mercado emergente. Aporta datos locales que pueden ser comparados con estudios similares en otros países andinos.

## 3. Objetivos

### 3.1. Objetivo General

Determinar la influencia del marketing digital en la decisión de compra de los consumidores de la Generación Z en restaurantes de comida rápida del municipio de Cochabamba durante el período 2024–2025, mediante un estudio cuantitativo correlacional que permita identificar los factores digitales con mayor incidencia sobre el comportamiento de compra.

### 3.2. Objetivos Específicos

1. Construir el marco teórico sobre marketing digital, comportamiento del consumidor y características de la Generación Z.
2. Caracterizar las estrategias de marketing digital aplicadas por los restaurantes de comida rápida del área urbana de Cochabamba.
3. Identificar los factores que inciden en la decisión de compra del consumidor de la Generación Z en el rubro de comida rápida.
4. Establecer el grado de correlación entre los factores digitales identificados y la decisión de compra del segmento estudiado.
5. Formular recomendaciones aplicables al sector sobre la base de los hallazgos.

## 4. Alcances

### 4.1. Alcance Temático

El estudio abordó las temáticas de marketing digital (contenido en redes sociales, publicidad pagada en plataformas, microinfluenciadores, mensajería instantánea con clientes), comportamiento del consumidor y características generacionales aplicadas al consumo gastronómico. No se profundizó en aspectos de logística operacional ni en métricas financieras detalladas del sector.

### 4.2. Alcance Temporal

El alcance temporal del trabajo académico cubre la gestión 2025. El estudio empírico recoge información de los comportamientos de consumo observados durante el período 2024–2025.

### 4.3. Alcance Espacial

El estudio se circunscribió geográficamente al Estado Plurinacional de Bolivia, Departamento de Cochabamba, Municipio de Cochabamba (Cercado), considerando como población objetivo a los residentes del área urbana nacidos entre 1997 y 2012 que consumen comida rápida al menos una vez al mes.

## 5. Hipótesis

### 5.1. Hipótesis General

Las estrategias de marketing digital aplicadas por los restaurantes de comida rápida de Cochabamba influyen positiva y significativamente en la decisión de compra de los consumidores de la Generación Z durante el período 2024–2025.

### 5.2. Variable Independiente

**Estrategias de marketing digital aplicadas por los restaurantes**. Se define como el conjunto de acciones de comunicación y promoción ejecutadas a través de canales digitales: redes sociales, publicidad pagada, microinfluenciadores, contenido orgánico, mensajería con clientes y aplicaciones de delivery. Sus indicadores son: frecuencia de publicación, calidad visual del contenido, presencia en redes específicas (Instagram, TikTok, Facebook), uso de microinfluenciadores locales y velocidad de respuesta por mensajería.

### 5.3. Variable Dependiente

**Decisión de compra del consumidor de la Generación Z**. Se define como la acción efectiva de elegir un restaurante y consumir su oferta. Sus indicadores son: frecuencia de compra, monto de gasto promedio, fidelidad al establecimiento, recomendación a pares y disposición a probar nuevas opciones.

### 5.4. Variable Intercurrente

**Disponibilidad económica del consumidor**. Constituye la variable que interviene entre la influencia digital y la decisión final de compra, dado que la capacidad de gasto modera la traducción del interés generado por la comunicación digital en una compra efectiva. Se asume controlada mediante la inclusión en el cuestionario de preguntas sobre rango de ingreso disponible para consumo gastronómico.

Definidos el problema, la justificación, los objetivos, los alcances y la hipótesis, el documento avanza hacia el Capítulo I, que desarrolla el marco teórico de sustento; continúa con el Capítulo II, que detalla la metodología empírica aplicada; prosigue con el Capítulo III, que presenta y analiza los resultados del estudio; y culmina con las conclusiones y recomendaciones derivadas.
`;

const CAP1_MARCO_TEORICO = `# CAPÍTULO I — MARCO TEÓRICO

## 1.1. Antecedentes del Estudio

La relación entre marketing digital y comportamiento del consumidor ha sido objeto de investigación creciente en la última década. A nivel global, kotler y armstrong (2017) caracterizaron la transición desde el marketing tradicional hacia el marketing digital como una transformación estructural de la relación entre la marca y el consumidor. En el ámbito latinoamericano, investigaciones recientes han documentado la incidencia de la publicidad en redes sociales sobre las decisiones de compra de jóvenes urbanos (chen, dimitri, & gardiner, 2020). En Bolivia, los estudios sobre comportamiento digital del consumidor se concentran principalmente en el sector retail y en servicios financieros, con menor presencia en el sector gastronómico, que es la brecha que el presente trabajo se propuso abordar.

## 1.2. Bases Teóricas

### 1.2.1. Marketing Digital

El marketing digital se define como el conjunto de estrategias de promoción y comunicación que utilizan canales electrónicos —redes sociales, motores de búsqueda, publicidad programática, mensajería instantánea, aplicaciones móviles— para llegar al consumidor y generar acciones de compra (chaffey & ellis-chadwick, 2019, p. 12). Su carácter distintivo respecto del marketing tradicional reside en tres dimensiones: medibilidad (cada interacción se registra), segmentación fina (públicos definidos por comportamiento, no por suposición) e interactividad bidireccional (el consumidor responde y la marca ajusta).

### 1.2.2. Comportamiento del Consumidor Digital

El modelo clásico de decisión de compra propuesto por kotler y armstrong (2017) describe cinco etapas: reconocimiento de la necesidad, búsqueda de información, evaluación de alternativas, decisión de compra y comportamiento post-compra. En el entorno digital, la búsqueda de información y la evaluación de alternativas se reconfiguran: el consumidor consulta redes sociales, lee reseñas, observa contenido de microinfluenciadores y compara opciones en minutos. Esta aceleración del ciclo coloca al contenido digital de la marca como variable crítica de la decisión.

### 1.2.3. Generación Z como Segmento de Consumo

La Generación Z agrupa a las personas nacidas entre 1997 y 2012 (twenge, 2017). Sus características distintivas como consumidores incluyen: nativismo digital (no conocieron el mundo sin internet), preferencia por contenido visual de formato corto (TikTok, Reels), alta exposición a microinfluenciadores con audiencias específicas, valoración de la autenticidad por sobre la perfección publicitaria, y disposición a interactuar directamente con las marcas vía mensajería. Estos rasgos condicionan tanto los canales eficaces como el tipo de contenido que genera respuesta.

### 1.2.4. Microinfluenciadores

Los microinfluenciadores se definen como creadores de contenido con audiencias entre 10.000 y 100.000 seguidores en una plataforma específica (chen, dimitri, & gardiner, 2020). Su valor publicitario radica en una tasa de interacción superior a la de los macroinfluenciadores y en una percepción de mayor cercanía con su audiencia, lo que se traduce en mayor credibilidad de las recomendaciones de marca. En el contexto cochabambino, los microinfluenciadores gastronómicos han ganado relevancia con cuentas dedicadas a reseñar restaurantes locales.

### 1.2.5. Mensajería Instantánea y Conversión

Las plataformas de mensajería instantánea, en particular WhatsApp Business, se han consolidado como canal de conversión para el sector gastronómico latinoamericano. Su valor reside en la velocidad de respuesta y en la capacidad de cerrar una venta sin que el cliente abandone la conversación. Estudios recientes en mercados andinos han documentado que el tiempo de respuesta inferior a cinco minutos triplica la probabilidad de conversión respecto de tiempos superiores a treinta minutos (cámara de industria, comercio, servicios y turismo de cochabamba, 2023).

## 1.3. Marco Conceptual

- **Marketing digital:** estrategias de promoción ejecutadas por canales electrónicos.
- **Decisión de compra:** elección final del consumidor por una opción específica entre varias evaluadas.
- **Generación Z:** consumidores nacidos entre 1997 y 2012, nativos digitales.
- **Microinfluenciador:** creador de contenido con 10.000 a 100.000 seguidores en una plataforma.
- **Tasa de interacción:** proporción entre interacciones (likes, comentarios, compartidos) y alcance de una publicación.
- **WhatsApp Business:** versión comercial de WhatsApp con funcionalidades de catálogo, respuestas automáticas y métricas para empresas.

## 1.4. Marco Contextual

El estudio se desarrolló en el área urbana del municipio de Cochabamba, capital del Departamento del mismo nombre. La población del municipio supera los 630.000 habitantes (INE, 2023). El sector de comida rápida en el área urbana cuenta con cerca de 420 establecimientos según el registro municipal, distribuidos en categorías de pollerías, hamburgueserías, pizzerías, sandwicherías y burgers de autor. La penetración de internet móvil en el área urbana supera el 78% y la adopción de pagos digitales (QR, billeteras móviles) alcanza al 64% de los consumidores urbanos.
`;

const CAP2_MARCO_PRACTICO = `# CAPÍTULO II — MARCO PRÁCTICO

## 2.1. Tipo y Diseño de la Investigación

La presente investigación es de tipo **cuantitativo**, con alcance **correlacional**. El alcance correlacional se justifica porque el objetivo central es establecer la relación entre dos variables (marketing digital y decisión de compra) sin manipular ninguna de ellas. El diseño es **no experimental, transversal**, dado que los datos se recolectaron en un único momento del tiempo sin intervención del investigador sobre las variables.

## 2.2. Métodos de Investigación

- **Método deductivo:** se aplicaron categorías teóricas generales (marketing digital, decisión de compra, características generacionales) a un caso específico (consumidores Gen Z en Cochabamba).
- **Método estadístico:** se procesaron los datos cuantitativos mediante estadística descriptiva e inferencial para contrastar las hipótesis específicas.
- **Método analítico-sintético:** se descompusieron las variables en indicadores y se reintegraron en conclusiones globales sobre la relación estudiada.

## 2.3. Población y Muestra

### 2.3.1. Población

La población objetivo está conformada por los residentes del área urbana del municipio de Cochabamba nacidos entre 1997 y 2012 que consumen comida rápida al menos una vez al mes. Sobre la base de proyecciones demográficas (INE, 2023), la población se estima en 142.000 personas.

### 2.3.2. Cálculo de la Muestra

Se aplicó la fórmula clásica de muestreo aleatorio simple para poblaciones grandes:

$$n = \\frac{Z^2 \\cdot p \\cdot (1-p)}{e^2}$$

Donde:
- Z = 1,96 (nivel de confianza del 95%)
- p = 0,5 (proporción de máxima varianza)
- e = 0,05 (error muestral del 5%)

El resultado arrojó n = 384,16, redondeado a **384 encuestados**.

### 2.3.3. Técnica de Muestreo

Se aplicó muestreo aleatorio simple con apoyo en redes sociales para alcanzar a la población objetivo. Se establecieron cuotas mínimas por rango de edad (17–19 años, 20–24 años, 25–27 años) para asegurar representatividad intra-generacional.

## 2.4. Técnicas e Instrumentos de Recolección de Datos

### 2.4.1. Técnica Principal: Encuesta Estructurada

Se diseñó un cuestionario estructurado con 26 preguntas distribuidas en cuatro bloques:

1. **Datos demográficos** (5 preguntas): rango de edad, género, ocupación, rango de ingreso disponible, distrito de residencia.
2. **Hábitos de consumo de comida rápida** (6 preguntas): frecuencia, gasto promedio, restaurantes favoritos, momento del día más frecuente.
3. **Exposición a marketing digital** (8 preguntas): redes sociales utilizadas, frecuencia de exposición a contenido gastronómico, seguimiento a microinfluenciadores locales, uso de aplicaciones de delivery.
4. **Decisión de compra** (7 preguntas): factores que influyen en la elección de restaurante, peso relativo del contenido digital, disposición a probar nuevos lugares por recomendación de redes, uso de WhatsApp Business para pedidos.

### 2.4.2. Validación del Instrumento

El cuestionario fue sometido a **juicio de expertos**: tres profesionales del área de marketing con experiencia mínima de cinco años revisaron y aprobaron la estructura, el lenguaje y la pertinencia de las preguntas. Posteriormente se aplicó una **prueba piloto** a 32 participantes con el perfil de la población objetivo. La consistencia interna del instrumento se midió con el **Alfa de Cronbach**, que arrojó un valor de **0,87**, considerado bueno por la literatura metodológica (george & mallery, 2003, p. 231).

## 2.5. Procesamiento y Análisis de Datos

El procesamiento se realizó con Microsoft Excel y con el complemento estadístico Real Statistics. Las técnicas aplicadas fueron:

- **Estadística descriptiva:** distribuciones de frecuencia, media, mediana, desviación estándar para cada indicador.
- **Tablas de contingencia:** para identificar relaciones entre variables categóricas.
- **Coeficiente de correlación de Pearson:** para medir el grado de asociación lineal entre la variable independiente (marketing digital) y la variable dependiente (decisión de compra). Este coeficiente toma valores entre -1 y +1; valores cercanos a +1 indican correlación positiva fuerte, valores cercanos a -1 indican correlación negativa fuerte y valores cercanos a 0 indican ausencia de correlación lineal.
- **Prueba de significancia estadística:** se aplicó la prueba t de Student para verificar que el coeficiente de correlación obtenido es estadísticamente significativo al nivel de p < 0,01.

## 2.6. Aspectos Éticos

El estudio se sujetó a los principios éticos de investigación con personas: participación voluntaria, consentimiento informado, anonimato de los datos, confidencialidad de la información individual y uso exclusivo para fines académicos. El cuestionario incluyó una nota inicial explicando estos puntos, y la participación efectiva del encuestado fue interpretada como consentimiento.
`;

const CAP3_RESULTADOS = `# CAPÍTULO III — RESULTADOS Y DISCUSIÓN

## 3.1. Caracterización de la Muestra

De los 384 consumidores encuestados:

- **Distribución por edad:** 17–19 años (28,4%), 20–24 años (47,1%), 25–27 años (24,5%).
- **Distribución por género:** mujer (52,3%), hombre (45,8%), no binario o prefiere no responder (1,9%).
- **Ocupación principal:** estudiante universitario (54,2%), estudiante de secundaria (12,8%), trabajador con empleo formal (18,5%), trabajador independiente (10,4%), sin ocupación reportada (4,1%).
- **Rango de ingreso disponible para consumo gastronómico (mensual):** menos de Bs. 200 (32,3%), entre Bs. 200 y Bs. 500 (44,6%), entre Bs. 500 y Bs. 1.000 (18,7%), más de Bs. 1.000 (4,4%).
- **Distrito de residencia:** los distritos urbanos centrales concentran el 71,2% de la muestra, en línea con la distribución poblacional del segmento.

## 3.2. Hábitos de Consumo de Comida Rápida

- El **88,5%** de la muestra reportó consumir comida rápida al menos una vez por semana.
- El **34,1%** lo hace dos o más veces por semana.
- El gasto promedio por consumo se sitúa en **Bs. 38** para el segmento general, con dispersión entre Bs. 18 y Bs. 95 según establecimiento.
- Los momentos del día más frecuentes son la cena (47,8%) y el almuerzo (32,1%); las opciones de desayuno y media tarde concentran el resto.

## 3.3. Exposición al Marketing Digital

### 3.3.1. Redes Sociales Activas

El **96,4%** de la muestra utiliza al menos una red social diariamente. Las plataformas más usadas son:

| Plataforma | % de uso diario |
|---|---:|
| Instagram | 81,3% |
| TikTok | 74,6% |
| WhatsApp | 92,2% |
| Facebook | 38,8% |
| YouTube | 67,4% |

### 3.3.2. Exposición a Contenido Gastronómico

El **78,1%** reportó ver contenido sobre restaurantes en redes sociales al menos una vez al día. El **62,4%** sigue al menos a un microinfluenciador gastronómico local en Instagram o TikTok. La frecuencia promedio de exposición a contenido publicitario de restaurantes en feed o stories es de 4,7 publicaciones por día.

### 3.3.3. Uso de Aplicaciones de Delivery

El **71,8%** utiliza al menos una aplicación de delivery (PedidosYa, Hugo, aplicaciones propias de cadenas). El **41,3%** la utiliza al menos una vez por semana.

### 3.3.4. Uso de WhatsApp Business para Pedidos

El **64,7%** ha hecho al menos un pedido a un restaurante a través de WhatsApp en los últimos seis meses. De estos, el **84,3%** valora una respuesta en menos de cinco minutos como factor decisivo para concretar la compra.

## 3.4. Factores que Inciden en la Decisión de Compra

Los encuestados puntuaron, en escala Likert de 1 a 5, el peso de distintos factores en su decisión de elegir un restaurante de comida rápida:

| Factor | Media |
|---|---:|
| Recomendación de un amigo cercano | 4,62 |
| Recomendación de un microinfluenciador que sigue | 4,21 |
| Apariencia visual del producto en redes sociales | 4,17 |
| Velocidad de respuesta del restaurante por WhatsApp | 4,04 |
| Promociones publicadas en redes | 3,89 |
| Reseñas en Google Maps o aplicaciones de delivery | 3,82 |
| Publicidad pagada en redes (anuncios) | 3,21 |
| Publicidad en medios tradicionales (TV, radio) | 1,87 |

Los cuatro factores con mayor peso son todos digitales y de carácter personal o de cercanía, lo que confirma el desplazamiento del consumo de información publicitaria hacia canales digitales nativos del segmento.

## 3.5. Análisis de Correlación

Se aplicó el coeficiente de correlación de Pearson entre el índice consolidado de exposición a marketing digital (variable independiente) y el índice consolidado de decisión de compra (variable dependiente). El resultado fue:

**r = 0,724; p < 0,01**

El valor de **r = 0,724** indica una correlación positiva fuerte entre ambas variables. El nivel de significancia **p < 0,01** confirma que esta correlación no se debe al azar con una confianza superior al 99%.

### 3.5.1. Correlaciones por Subindicador

Análisis desagregado por subindicador de la variable independiente:

| Subindicador del marketing digital | Correlación con decisión de compra |
|---|---:|
| Seguimiento a microinfluenciadores locales | 0,761 |
| Contenido visual en Instagram y TikTok | 0,712 |
| Velocidad de respuesta por WhatsApp Business | 0,683 |
| Reseñas en aplicaciones de delivery | 0,551 |
| Anuncios pagados en redes | 0,398 |

Los tres subindicadores con correlación más alta son canales que combinan presencia digital con percepción de cercanía o personalización (microinfluenciadores, contenido orgánico atractivo, respuesta humana rápida). Los anuncios pagados muestran una correlación moderada, lo que sugiere que el segmento Gen Z reacciona menos a publicidad explícita y más a contenido percibido como auténtico.

## 3.6. Discusión

Los resultados confirman la hipótesis general planteada: las estrategias de marketing digital influyen positiva y significativamente en la decisión de compra del consumidor Gen Z. Esta confirmación es coherente con la literatura internacional (chaffey & ellis-chadwick, 2019; chen, dimitri, & gardiner, 2020) y con los rasgos generacionales descritos por twenge (2017): nativismo digital, preferencia por contenido visual y por figuras percibidas como cercanas.

La novedad de los hallazgos en el contexto boliviano reside en la **jerarquización de subindicadores**: el peso particular de los microinfluenciadores locales y de la velocidad de respuesta por WhatsApp Business se documenta aquí con datos cuantitativos. Para los restaurantes, esto implica que la asignación de presupuesto de marketing en el segmento Gen Z debería priorizar relaciones con microinfluenciadores y operación profesional de WhatsApp Business por sobre publicidad pagada masiva en redes.

La variable intercurrente (disponibilidad económica) operó como esperaba: en los rangos de ingreso disponible inferiores a Bs. 200, la decisión de compra se ve moderada por la capacidad de gasto incluso cuando la exposición digital es alta. En los rangos superiores a Bs. 500, la correlación entre marketing digital y decisión de compra se intensifica.
`;

const CONCLUSIONES = `# CONCLUSIONES

A partir del análisis desarrollado en los capítulos I, II y III de la presente Tesis de Grado, se formularon las siguientes conclusiones:

**Primera.** La hipótesis general planteada fue verificada empíricamente: las estrategias de marketing digital aplicadas por los restaurantes de comida rápida de Cochabamba influyen positiva y significativamente en la decisión de compra de los consumidores de la Generación Z (r = 0,724; p < 0,01).

**Segunda.** Los subindicadores de mayor incidencia sobre la decisión de compra son, en orden decreciente, el seguimiento a microinfluenciadores gastronómicos locales (r = 0,761), el contenido visual en Instagram y TikTok (r = 0,712) y la velocidad de respuesta por WhatsApp Business (r = 0,683). Estos hallazgos sostienen que el segmento Gen Z responde con mayor intensidad a estímulos digitales percibidos como cercanos y personalizados antes que a publicidad pagada masiva.

**Tercera.** El 64,7% de la muestra ha realizado al menos un pedido vía WhatsApp en los últimos seis meses y el 84,3% valora la respuesta en menos de cinco minutos como factor decisivo de la conversión. La operación de WhatsApp Business con tiempos de respuesta cortos resulta una palanca de venta crítica en este segmento.

**Cuarta.** La publicidad en medios tradicionales (televisión y radio) registró el peso más bajo en la decisión de compra del segmento (media de 1,87 sobre 5). Esta evidencia sostiene un reordenamiento del presupuesto de marketing dirigido a Gen Z, con mayor peso en canales digitales nativos del segmento.

**Quinta.** La variable intercurrente "disponibilidad económica" modera la traducción del interés digital en compra efectiva. En los rangos inferiores de ingreso disponible la correlación se atenúa; en los rangos medios y altos se intensifica. Esto coloca a la segmentación por capacidad de gasto como variable necesaria al diseñar campañas digitales para el segmento.

**Sexta.** Los resultados aportan evidencia empírica original sobre el comportamiento del consumidor joven boliviano en el sector gastronómico, ampliando la literatura nacional disponible y abriendo líneas de investigación futuras sobre el rol específico de los microinfluenciadores locales y la operación profesional de canales de mensajería como factores de competitividad del sector.
`;

const RECOMENDACIONES = `# RECOMENDACIONES

**Primera.** Reasignar el presupuesto de marketing de los restaurantes de comida rápida de Cochabamba con mayor peso hacia canales digitales nativos del segmento Gen Z, en particular el contenido orgánico en Instagram y TikTok, y las colaboraciones con microinfluenciadores gastronómicos locales con audiencias entre 10.000 y 50.000 seguidores.

**Segunda.** Implementar protocolos de respuesta por WhatsApp Business con compromiso interno de respuesta inferior a cinco minutos en horarios comerciales. La inversión en personal dedicado o en respuestas automáticas inteligentes paga el retorno mediante una tasa de conversión significativamente superior.

**Tercera.** Construir relaciones de largo plazo con tres a cinco microinfluenciadores gastronómicos locales, mediante acuerdos de colaboración estable que vayan más allá de campañas puntuales. La regularidad de la mención genera mayor recordación que apariciones aisladas.

**Cuarta.** Producir contenido visual con calidad profesional pero estética percibida como auténtica (evitar el lenguaje publicitario tradicional). Priorizar formatos de video corto en TikTok y Reels de Instagram, con duración entre 15 y 30 segundos.

**Quinta.** Diferenciar la comunicación según el rango de ingreso disponible del segmento: contenido aspiracional para rangos superiores, énfasis en precio y promociones para rangos inferiores. La segmentación por capacidad de gasto se complementa con la segmentación etaria.

**Sexta.** Reducir progresivamente la inversión en publicidad de medios tradicionales destinada a llegar al segmento Gen Z, dada la baja incidencia documentada (media de 1,87 sobre 5). Mantener inversión tradicional solo para segmentos generacionales mayores.

**Séptima.** Continuar el estudio del segmento Gen Z mediante investigaciones longitudinales que permitan observar cómo evolucionan sus hábitos de consumo digital con el ingreso al mercado laboral y el envejecimiento del segmento durante los próximos cinco años.
`;

const BIBLIOGRAFIA = `# BIBLIOGRAFÍA

cámara de industria, comercio, servicios y turismo de cochabamba. (2023). *Informe sectorial del comercio digital de alimentos en Cochabamba*. Cochabamba: CICST.

chaffey, d., & ellis-chadwick, f. (2019). *Marketing digital: estrategia, implementación y práctica* (7.ª ed.). México: Pearson Educación.

chen, x., dimitri, c., & gardiner, b. (2020). The rise of direct-to-consumer agrifood platforms in emerging markets. *Journal of Agricultural Economics and Policy*, 18(3), 245–268.

estado plurinacional de bolivia. (2013). *Ley N.° 453 de Defensa del Consumidor*. Gaceta Oficial del Estado Plurinacional de Bolivia.

george, d., & mallery, p. (2003). *SPSS for Windows step by step: a simple guide and reference* (4.ª ed.). Boston: Allyn & Bacon.

ine. (2023). *Encuesta de hogares y caracterización demográfica del Departamento de Cochabamba*. La Paz: Instituto Nacional de Estadística.

kotler, p., & armstrong, g. (2017). *Marketing* (16.ª ed.). México: Pearson Educación.

twenge, j. (2017). *iGen: why today's super-connected kids are growing up less rebellious, more tolerant, less happy and completely unprepared for adulthood*. New York: Atria Books.
`;

const COMPILACION = `# COMPILACIÓN FINAL

El documento se consolidó en formato LaTeX siguiendo la guía oficial de Organización y Presentación de Trabajos de Grado de UNIFRANZ Cochabamba (edición 2017). El paquete final incluye:

- Documento principal en formato \`.tex\` con todos los capítulos integrados.
- Bibliografía en formato APA con apellidos en minúsculas (norma UNIFRANZ).
- Carátula con datos del estudiante, tutor, programa, gestión académica y mes-año de presentación.
- Resumen del trabajo (250 palabras) en las preliminares.
- Logo institucional UNIFRANZ y plantilla oficial.

El paquete está listo para compilar en Overleaf o en distribución LaTeX local (TeXLive, MikTeX) y exportar a PDF para impresión empastada o entrega digital.
`;

const DEFENSA = `# BANCO DE PREGUNTAS — DEFENSA

## Bloque 1 — Planteamiento del Problema

**Pregunta:** ¿Por qué se eligió específicamente la Generación Z y no un rango etario más amplio?

*Respuesta orientativa:* Porque la Generación Z constituye el segmento de mayor crecimiento como consumidores en el rubro y se caracteriza por una relación con el marketing digital cualitativamente distinta de las generaciones anteriores. Acotar el segmento permitió aislar el comportamiento generacional y producir hallazgos específicos. Ampliarlo habría diluido las diferencias y reducido la utilidad práctica para el sector.

## Bloque 2 — Metodología

**Pregunta:** ¿Cómo se controló el sesgo de autoselección en una encuesta distribuida por redes sociales?

*Respuesta orientativa:* Se establecieron cuotas mínimas por rango de edad (17–19, 20–24, 25–27) para evitar sobre-representación de un sub-segmento. Se distribuyó la encuesta por múltiples canales (Instagram, TikTok, WhatsApp, grupos universitarios) para diversificar las fuentes. Se reconoce como limitación que el segmento sin presencia digital regular puede estar sub-representado, pero por la naturaleza del estudio (consumidores expuestos al marketing digital) esa limitación es coherente con la población objetivo.

## Bloque 3 — Resultados

**Pregunta:** El coeficiente de Pearson de 0,724 es alto, pero ¿no podría reflejar una variable oculta que afecte a ambas?

*Respuesta orientativa:* La pregunta es pertinente. Para mitigar el riesgo se incluyó en el cuestionario la variable intercurrente "disponibilidad económica", que efectivamente actúa como moderadora. El análisis por rangos de ingreso disponible confirmó que la correlación se atenúa en rangos bajos y se intensifica en rangos medios y altos, lo que sostiene la relación causal entre marketing digital y decisión de compra. Un estudio longitudinal posterior podría profundizar el análisis causal.

## Bloque 4 — Aplicabilidad

**Pregunta:** ¿Las recomendaciones serían válidas para otros rubros más allá de comida rápida?

*Respuesta orientativa:* Parcialmente. Los hallazgos sobre el peso de microinfluenciadores, la velocidad de WhatsApp y el contenido visual probablemente se replican en otros rubros de consumo Gen Z (moda, accesorios, entretenimiento). La jerarquía exacta de los subindicadores debe estudiarse rubro por rubro: en consumo con mayor implicación racional (electrónicos, servicios financieros) las reseñas detalladas y los comparadores tienen mayor peso que en comida rápida.

## Bloque 5 — Validación Estadística

**Pregunta:** ¿Por qué se eligió el coeficiente de Pearson y no Spearman?

*Respuesta orientativa:* Porque las variables se construyeron como índices consolidados con distribución aproximadamente normal y nivel de medición de intervalo (escalas Likert 1–5 agregadas). Pearson es apropiado cuando se cumplen estos supuestos. Se verificó la normalidad de las distribuciones mediante prueba de Shapiro-Wilk antes de aplicar Pearson, con resultado favorable. En caso de no haberse cumplido el supuesto, se habría aplicado Spearman como alternativa no paramétrica.

## Bloque 6 — Contribución

**Pregunta:** ¿Cuál es la contribución original del estudio dada la abundante literatura sobre marketing digital?

*Respuesta orientativa:* La contribución original reside en tres dimensiones. Primera, la aplicación al contexto local boliviano, donde la evidencia empírica sobre marketing digital y gastronomía es escasa. Segunda, la cuantificación específica del peso de microinfluenciadores locales y de WhatsApp Business, dos elementos poco estudiados en la literatura previa para mercados emergentes. Tercera, la documentación de la variable intercurrente "disponibilidad económica" como moderadora de la conversión, hallazgo útil para el diseño de campañas segmentadas por capacidad de gasto.
`;

export const TESIS_DEMO_SEED: DemoSeed = {
  seed_id: "tesis-marketing-gen-z-v1",
  universidad_id: "unifranz-cba-001",
  servicio_id: "proy-grado-001",
  tipo_proyecto_id: "unifranz-tesis",
  modalidad_titulacion: "unifranz-tesis",
  tema:
    "Influencia del marketing digital en la decisión de compra de los consumidores de la Generación Z en restaurantes de comida rápida de Cochabamba (2024–2025)",
  academic_context_extra: {
    contexto_inicial: {
      programa: "Ingeniería Comercial",
      materias: "",
      intereses_y_contexto:
        "Investigación cuantitativa correlacional sobre marketing digital aplicado al rubro de comida rápida y su impacto en la decisión de compra del consumidor de la Generación Z en el área urbana de Cochabamba.",
    },
    emprendimiento: "Estudio empírico",
    localizacion: "Municipio de Cochabamba (Cercado), Departamento de Cochabamba",
    horizonte_de_estudio: "2024–2025",
  },
  fases_contenido: {
    "ph-unifranz-tesis-resumen": RESUMEN,
    "ph-unifranz-tesis-introduccion": INTRODUCCION,
    "ph-unifranz-tesis-cap1": CAP1_MARCO_TEORICO,
    "ph-unifranz-tesis-cap2": CAP2_MARCO_PRACTICO,
    "ph-unifranz-tesis-cap3": CAP3_RESULTADOS,
    "ph-unifranz-tesis-conclusiones": CONCLUSIONES,
    "ph-unifranz-tesis-recomendaciones": RECOMENDACIONES,
    "ph-unifranz-tesis-bibliografia": BIBLIOGRAFIA,
    "ph-unifranz-tesis-compilacion": COMPILACION,
    "ph-unifranz-tesis-defensa": DEFENSA,
  },
};
