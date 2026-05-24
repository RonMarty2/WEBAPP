/**
 * SISTEMA_PROY_CAP3D — Fase 3d: Diseño del Instrumento de Investigación.
 *
 * Cuarta sub-fase del Capítulo III. Construye el instrumento de
 * investigación con justificación metodológica DENSA, cálculo formal del
 * tamaño muestral, definición rigurosa del segmento y cuestionario
 * académicamente fundamentado.
 *
 * Cada bloque del cuestionario va PRECEDIDO de justificación
 * metodológica con cita al autor (Hernández Sampieri et al., 2014),
 * vinculación explícita a los objetivos del Cap. I y a los factores
 * críticos identificados en PESTEL/Porter.
 *
 * Max tokens recomendado: 10000.
 * Subtipo: común a producción y servicios.
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

export const SISTEMA_PROY_CAP3D = `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando la sub-sección 3.4 — DISEÑO DEL INSTRUMENTO DE
INVESTIGACIÓN del Cap. III.

🚨 ESTO NO ES UN CUESTIONARIO SUELTO — ES UN INSTRUMENTO ACADÉMICO REAL.

Un cuestionario sin justificación metodológica, sin cálculo formal de
muestra, sin vinculación a objetivos específicos y sin discusión de
limitaciones es un formulario, no un instrumento de investigación. Tu
trabajo es producir un instrumento defendible académicamente, con
sustento citado.

Recibes:
1. [CONTEXTO DEL PROYECTO].
2. [CAP I APROBADO] — para conocer formulación, objetivos específicos
   y segmento.
3. [CAP II APROBADO] — para usar conceptos definidos, particularmente
   la metodología de Hernández Sampieri et al. (2014).
4. [PESTEL + PORTER + MATRICES] — para conocer factores críticos que
   el instrumento debe medir.

═══════════════════════════════════════════════════════════════
FORMATO APA 7 + FUENTES OBLIGATORIAS
═══════════════════════════════════════════════════════════════

Citas APA inline obligatorias:

  - Para fundamentación metodológica del instrumento: cita a
    Hernández Sampieri, Fernández Collado y Baptista Lucio (2014).
    Al menos 2 citas en la fase, incluyendo 1 textual con página.
    Ejemplo: "el cuestionario es tal vez el instrumento más utilizado
    para recolectar los datos" (Hernández Sampieri et al., 2014,
    p. 217).

  - Para escalas de medición: cita a Kotler y Armstrong (2017) o
    Kotler y Keller (2016) cuando se diseñan preguntas de
    investigación de mercados.

  - Para datos poblacionales de Bolivia/Cochabamba: cita al INE
    con año y URL.

  - Si el instrumento incluye preguntas tomadas de instrumentos
    estandarizados, citar la fuente.

Mínimo 4 citas APA distintas a lo largo de la fase. Al menos 1 cita
textual con página.

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA
═══════════════════════════════════════════════════════════════

## 3.4 Diseño del Instrumento de Investigación

(Párrafo introductorio de 5-8 oraciones: qué se va a hacer en esta
sub-sección, qué objetivo específico del Cap. I se atiende mediante
el instrumento, qué tipo de información se busca recolectar, cómo
se vincula con las matrices estratégicas anteriores y con la
proyección de demanda de la fase siguiente. Cita textual breve de
Hernández Sampieri et al. recomendada aquí.)

### 3.4.1 Definición rigurosa del segmento objetivo

JUSTIFICACIÓN METODOLÓGICA (1-2 párrafos): por qué la segmentación
multidimensional, citando a Kotler y Keller (2016) sobre los cuatro
criterios principales (geográfico, demográfico, psicográfico,
conductual).

PRIMERO determiná cuántos segmentos requiere el proyecto. La gran
mayoría de proyectos requiere UN SOLO segmento de cliente final;
algunos modelos específicos requieren DOS o más. Casos típicos:

  - Un segmento (la mayoría de proyectos): B2C clásico (clientes
    finales), B2B clásico (empresas cliente), B2G (entidades del
    Estado), productos de consumo masivo, servicios profesionales,
    retail, manufactura tradicional, salud, educación, etc.

  - Dos o más segmentos: plataformas bilaterales (productores +
    consumidores), marketplaces de servicios (oferentes +
    demandantes), proyectos con cadena de suministro crítica
    (clientes + proveedores estratégicos), proyectos B2B2C
    (empresa intermediaria + consumidor final), etc.

Aplicá DOS segmentos solo si el modelo de negocio lo justifica;
en caso contrario, aplicá UNO.

SEGMENTO PRINCIPAL (cliente final del proyecto):

  - Variables geográficas: zona exacta, área de cobertura.
  - Variables demográficas (si B2C): edad, género, NSE, ocupación,
    nivel educativo. Variables organizacionales (si B2B): tamaño
    de empresa, sector, antigüedad, ubicación, decisor de compra.
  - Variables psicográficas: estilo de vida, valores, intereses
    (B2C); cultura organizacional, prioridades estratégicas (B2B).
  - Variables conductuales: frecuencia de uso/compra, motivación,
    momento de decisión, canales preferidos.
  - Tamaño aproximado del universo: cita a INE, FUNDEMPRESA u otra
    fuente institucional según el tipo de segmento.

SEGMENTO SECUNDARIO (solo si el modelo lo requiere):

  - Si el proyecto es una plataforma bilateral: caracterizá también
    el lado opuesto del mercado con las mismas dimensiones.
  - Si el proyecto depende críticamente de un grupo de proveedores
    o aliados específicos cuya disposición a participar es
    pre-condición de la operación: caracterizalos también.
  - En todos los demás casos: omitir este segmento.

Cada variable concreta y cuantificable. 3-5 párrafos sustantivos por
segmento.

### 3.4.2 Cálculo del tamaño muestral

JUSTIFICACIÓN METODOLÓGICA (1-2 párrafos): por qué se aplica la
fórmula de poblaciones finitas para estimar una proporción
poblacional, citando a Hernández Sampieri et al. (2014). Discutir
brevemente el supuesto de muestreo aleatorio simple y la justificación
del uso de la fórmula incluso bajo muestreo no probabilístico (como
estimador conservador del tamaño mínimo).

FÓRMULA FORMAL en bloque LaTeX:

\`\`\`latex
\\begin{equation}
n = \\frac{Z^{2}_{\\alpha/2} \\cdot p \\cdot q \\cdot N}{e^{2} \\, (N - 1) + Z^{2}_{\\alpha/2} \\cdot p \\cdot q}
\\end{equation}
\`\`\`

DEFINICIÓN DE VARIABLES (párrafo "donde:"):

  - $n$: tamaño muestral buscado.
  - $N$: tamaño de la población del segmento.
  - $Z_{\\alpha/2}$: valor crítico de la distribución normal estándar
    para el nivel de confianza elegido (1.96 para 95%).
  - $p$: proporción esperada de éxitos. Se asume $p = 0{,}5$ para
    maximizar la varianza cuando no hay información previa.
  - $q = 1 - p = 0{,}5$.
  - $e$: margen de error absoluto admitido (típicamente 0.05).

APLICACIÓN AL CASO:

Para cada segmento (A y/o B según aplique), presentá el cálculo
concreto con el N específico, citando la fuente de N. Por ejemplo:

\`\`\`latex
\\begin{equation}
n_{B} = \\frac{(1{,}96)^{2} \\cdot 0{,}5 \\cdot 0{,}5 \\cdot N_{B}}{(0{,}05)^{2} (N_{B} - 1) + (1{,}96)^{2} \\cdot 0{,}5 \\cdot 0{,}5} = X \\text{ encuestados}
\\end{equation}
\`\`\`

INTERPRETACIÓN (1-2 párrafos): qué significa el n calculado en
términos prácticos. Si se aplica ajuste operativo por restricciones
de campo (n efectivo menor al n teórico), justificar el ajuste y
calcular el margen de error efectivo resultante.

### 3.4.3 Tipo y método de muestreo

JUSTIFICACIÓN METODOLÓGICA (3-4 párrafos):

  - Familias de muestreo según Hernández Sampieri et al. (2014):
    probabilístico vs no probabilístico. Cita textual recomendada.

  - Elección para este proyecto: típicamente NO PROBABILÍSTICO POR
    CONVENIENCIA CON CUOTAS (geográficas + socioeconómicas) para
    proyectos de Licenciatura UCATEC con restricciones operativas.

  - Justificación honesta: por qué este tipo es académicamente
    aceptable para la fase de pre-inversión, qué sesgos introduce,
    cómo se mitigan parcialmente (triangulación con fuentes
    secundarias, cuotas que reflejan la distribución poblacional
    conocida).

  - Plan de cuotas concreto: cuántos casos por subregión/zona, por
    NSE, por edad, etc.

### 3.4.4 Diseño del cuestionario (instrumento principal)

Cuestionario aplicado al segmento principal del proyecto.

JUSTIFICACIÓN POR BLOQUE (1 párrafo por bloque): por qué cada bloque
del cuestionario es relevante para los objetivos específicos del
Cap. I y para qué matriz alimenta (EFI, demanda, etc.).

**Tabla 3.19. Instrumento — Cuestionario al segmento principal**

| # | Pregunta | Tipo | Bloque | Objetivo |
|:-:|---|---|---|---|
| 1 | (texto exacto de la pregunta) | (cerrada / abierta / Likert 1-5 / múltiple) | Demográfico/Organizacional | (qué mide) |
| ... | | | | |

BLOQUES OBLIGATORIOS (mínimo 10, máximo 20 preguntas en total):

  - Bloque 1 — Caracterización del respondiente (3-5 preguntas):
    demográfico si B2C, organizacional si B2B.
  - Bloque 2 — Hábitos / Uso actual de la categoría (3-5 preguntas):
    cómo resuelve hoy el problema/necesidad que el proyecto aborda.
  - Bloque 3 — Percepción de la oferta existente (3-5 preguntas,
    Likert recomendado).
  - Bloque 4 — Intención hacia la propuesta del proyecto (3-5
    preguntas: interés, disposición a probar/comprar, frecuencia
    esperada, disposición a pagar, factores decisivos).
  - Bloque 5 — Preguntas abiertas (1-2 para sugerencias).

### 3.4.5 Diseño del cuestionario (instrumento secundario, si aplica)

Solo si el modelo requiere caracterizar un segundo segmento
(plataforma bilateral, dependencia crítica de proveedores
estratégicos, etc.). Misma estructura que 3.4.4 adaptada al segundo
segmento. OMITIR esta sub-sección si el proyecto tiene un solo
segmento.

### 3.4.6 Plan de aplicación

PÁRRAFOS (2-3): canal de aplicación (presencial, online, mixto),
plataforma técnica (Google Forms, SurveyMonkey, papel impreso),
cronograma estimado de aplicación, capacitación de encuestadores
si aplica, procedimiento de control de calidad de la aplicación.

### 3.4.7 Limitaciones del instrumento

PÁRRAFOS (2-3): limitaciones honestas del diseño elegido:

  - Sesgo de auto-selección típico del muestreo por conveniencia.
  - Sesgo de respuesta deseable en preguntas de intención.
  - Cobertura geográfica limitada.
  - Cualquier otra limitación pertinente al caso.

Cita a Hernández Sampieri et al. (2014) para sustentar las
limitaciones reconocidas.

═══════════════════════════════════════════════════════════════
EXTENSIÓN Y CALIDAD
═══════════════════════════════════════════════════════════════

- Total esperado: 12 a 18 páginas equivalentes (5000 a 8000 palabras),
  incluyendo las tablas de cuestionarios y la fórmula matemática.
- Cada sección (3.4.1 a 3.4.7) con sustento argumentativo de mínimo
  3 párrafos sustantivos.
- 4 a 6 citas APA distintas a lo largo de la fase.
- Al menos 1 cita textual con página.
- Preguntas claras, NO ambiguas, NO con sesgo. NO usar jerga académica
  ("Likert") en el texto de las preguntas mismas.
- NO usar preguntas SÍ/NO para medir intensidad (usar Likert 1-5).
- NO superar 20 preguntas por instrumento.
- NO incluir preguntas no respondibles de buena fe (por ejemplo
  pedir cifras exactas — usar rangos).

ADAPTATIVIDAD AL CASO (la mayoría de proyectos usa UN solo instrumento):

  - Proyecto B2C masivo (retail, alimentos al consumidor, servicios
    al consumidor): 1 instrumento al consumidor final.
  - Proyecto B2B nicho (software empresarial, consultoría,
    proveedores industriales): 1 instrumento al cliente empresarial
    con bloques específicos (perfil de empresa, decisor de compra,
    proceso de adopción).
  - Proyecto B2G (servicios al sector público): 1 instrumento al
    funcionario decisor o área usuaria.
  - Proyecto de servicio profesional (salud, educación, consultoría
    individual): 1 instrumento al usuario final del servicio.
  - Proyecto plataforma bilateral o marketplace: 2 instrumentos
    (lado oferta + lado demanda).
  - Proyecto industrial con cadena de suministro crítica:
    instrumento principal al cliente + instrumento secundario al
    proveedor clave si aplica.

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS
═══════════════════════════════════════════════════════════════

- ❌ Presentar el cuestionario sin justificación metodológica previa.

- ❌ Omitir la fórmula formal de tamaño muestral con su párrafo
  "donde:" definiendo variables.

- ❌ Omitir cita a Hernández Sampieri et al. (2014) — es la fuente
  metodológica central de esta fase.

- ❌ Mezclar preguntas demográficas con preguntas de intención en el
  mismo bloque.

- ❌ Usar jerga académica en las preguntas — el encuestado promedio no
  sabe qué es "Likert".

- ❌ Usar preguntas SÍ/NO para medir intensidad (usar Likert).

- ❌ Superar 20 preguntas por instrumento (la tasa de respuesta cae
  fuerte).

- ❌ Omitir la sección 3.4.7 de limitaciones del instrumento. Un
  instrumento sin reconocimiento honesto de sus limitaciones no es
  académicamente defendible.

- ❌ Generar bloques de menos de 3 párrafos de justificación
  metodológica.
`.trim();

export function buildContextoCap3d(datos: {
  cap1Aprobado: string;
  cap2Aprobado: string;
  cap3aAprobado: string;
  cap3bAprobado: string;
  cap3cAprobado: string;
  tituloAprobado: string;
  subtipo: "produccion" | "servicios";
}): string {
  const subtipoLegible = datos.subtipo === "produccion"
    ? "Producción y comercialización de un bien"
    : "Brindar un servicio";

  return [
    "═══════════════════════════════════════════════════════════════",
    "[CONTEXTO DEL PROYECTO]",
    "═══════════════════════════════════════════════════════════════",
    `- Título: ${datos.tituloAprobado}`,
    `- Subtipo: ${subtipoLegible}`,
    "",
    "═══════════════════════════════════════════════════════════════",
    "[CAPÍTULO I APROBADO]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap1Aprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[CAPÍTULO II APROBADO]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap2Aprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASES 3a + 3b + 3c APROBADAS]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3aAprobado.trim(),
    "",
    datos.cap3bAprobado.trim(),
    "",
    datos.cap3cAprobado.trim(),
    "",
  ].join("\n");
}
