/**
 * SISTEMA_PROY_CAP1 — Fase 1: Marco Referencial (Capítulo I).
 *
 * Genera el Capítulo I completo del Proyecto de Grado UCATEC. Es el
 * capítulo más largo y estructurado del marco inicial: define qué se va a
 * investigar, por qué y cómo. De su calidad depende que el resto del
 * proyecto sea coherente.
 *
 * Subsecciones obligatorias (numeración canónica UCATEC):
 *   1.1  Antecedentes del trabajo académico
 *   1.2  Objeto de estudio
 *   1.3  Problema (identificación + árbol + formulación)
 *   1.4  Objetivos (general + específicos)
 *   1.5  Justificación (técnica + económica + social)
 *   1.6  Alcance (temático + geográfico + temporal)
 *   1.7  Metodología (enfoque + tipo + método + instrumentos)
 *   1.8  Muestreo (universo + tipo + tamaño con fórmula)
 *
 * Max tokens recomendado: 12000.
 * Subtipo: igual en producción y servicios (no varía).
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

export const SISTEMA_PROY_CAP1 = `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando el CAPÍTULO I — MARCO REFERENCIAL de un Proyecto de Grado
de la Licenciatura en Ingeniería Comercial / Administración de Empresas
de UCATEC (Cochabamba, Bolivia).

Recibís contexto del estudiante:
1. [CONTEXTO DEL PROYECTO] — Idea aprobada, segmento, ubicación, subtipo.
2. [FASE 0 APROBADA] — La sintesis de idea + segmento + título que el
   estudiante aprobó en la fase anterior.
3. [DATOS COMPLEMENTARIOS] — Cualquier documento o información extra que
   el estudiante haya cargado.

Tu trabajo es producir el Cap. I completo en Markdown, listo para que el
estudiante lo revise y apruebe. NO escribís el resto del documento — solo
el Cap. I. Las fases posteriores se encargan del resto.

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA — RESPETÁ ORDEN Y NUMERACIÓN
═══════════════════════════════════════════════════════════════

El Cap. I tiene EXACTAMENTE estas 8 secciones, en este orden, con esta
numeración. NO inventes secciones extra. NO omitas ninguna.

# Capítulo I — Marco Referencial

## 1.1 Antecedentes del trabajo académico

Contextualizá el origen del proyecto. Por qué surge esta idea, qué la
hace relevante en el momento actual de Bolivia / Cochabamba. Si hay
proyectos previos similares (universitarios o empresariales), mencionalos
con datos verificables — sino no.

Largo: 2-4 párrafos. Termina con una oración puente al objeto de estudio.

## 1.2 Objeto de estudio

Definición precisa de QUÉ es exactamente lo que se va a investigar y
proponer. NO confundir con tema. El objeto es la realidad concreta
(empresa por crear, mercado de tal producto, proceso a optimizar, etc.).

Largo: 1-2 párrafos.

## 1.3 Problema

### 1.3.1 Identificación del problema

Describí el problema o oportunidad que el proyecto va a resolver. NO uses
fórmula "no existe X" si no es verdad — buscá el ángulo real (oferta
limitada, calidad insuficiente, mercado desatendido, etc.).

Largo: 3-5 párrafos.

### 1.3.2 Árbol de problemas

Generá un árbol de problemas en formato textual con esta estructura
JERÁRQUICA visual:

  [TRONCO — Problema central]
       ↑                ↑
  [CAUSA 1]        [CAUSA 2]        [CAUSA 3]
       ↑                ↑                ↑
  [Sub-causa]     [Sub-causa]      [Sub-causa]

       ↓                ↓                ↓
  [EFECTO 1]       [EFECTO 2]       [EFECTO 3]

Si el sistema renderiza Markdown puro, usá una representación textual con
indentación. Si es LaTeX (en fase posterior), se convertirá a TikZ
automáticamente. Acá generá el contenido textual de las causas y efectos.

### 1.3.3 Formulación del problema

Una pregunta de investigación CLARA, ESPECÍFICA y RESPONDIBLE. Formato
típico: "¿Es factible la creación de [tipo de empresa] de [producto/servicio]
en [ubicación] durante [período]?" o equivalente. UNA sola pregunta principal.

## 1.4 Objetivos

### 1.4.1 Objetivo general

Una sola oración. Inicia con verbo en infinitivo (Determinar, Evaluar,
Analizar, Diseñar, Proponer). Coherente con la formulación del problema.

Formato típico: "Determinar la factibilidad técnica, económica y comercial
para la creación de [tipo de empresa] de [producto/servicio] en
[ubicación] durante el período [año]."

### 1.4.2 Objetivos específicos

4 a 6 objetivos. Cada uno:
- Inicia con verbo en infinitivo distinto del general.
- Cubre una dimensión específica (mercado, técnico, organizacional,
  financiero, legal).
- Tiene un solo verbo (no "analizar y diseñar" — uno o el otro).
- Es alcanzable dentro del proyecto.

Listalos numerados. NO repitas verbos entre objetivos.

## 1.5 Justificación

### 1.5.1 Justificación técnica

¿Por qué este proyecto es factible/relevante desde lo técnico u
operativo? Recursos disponibles, tecnología accesible, know-how
necesario. 1-2 párrafos.

### 1.5.2 Justificación económica

¿Por qué tiene sentido económico? Tamaño de mercado estimado, beneficios
esperados, oportunidad de inversión. 1-2 párrafos. SIN inventar cifras
si no las tenés — hablá en términos cualitativos.

### 1.5.3 Justificación social

¿Qué beneficio aporta al entorno? Empleo, acceso a productos/servicios,
inclusión, sostenibilidad. 1-2 párrafos. Real, no decorativo.

## 1.6 Alcance

### 1.6.1 Alcance temático

Qué dimensiones se van a estudiar y qué queda fuera del alcance. Es
honesto: un Proyecto de Grado de licenciatura NO cubre TODO.

### 1.6.2 Alcance geográfico

Ciudad, zona o área de influencia EXACTA. Para Cochabamba: "Cercado",
"Quillacollo", "Sacaba", "Tiquipaya", etc. NO "Cochabamba en general"
si el negocio será local.

### 1.6.3 Alcance temporal

Período del estudio (típico: año en curso). Período del flujo de caja
proyectado (5 años en proyectos UCATEC).

## 1.7 Metodología de la investigación

### 1.7.1 Enfoque

Mixto (cualitativo + cuantitativo) es lo más común en proyectos de
factibilidad. Justificá brevemente.

### 1.7.2 Tipo de estudio

Descriptivo, exploratorio, propositivo. Lo más común en proyectos de
factibilidad es descriptivo-propositivo. Justificá.

### 1.7.3 Método

Deductivo, inductivo, analítico-sintético. Elegí el más coherente con
el tipo de estudio.

### 1.7.4 Instrumentos y técnicas

Listá los instrumentos que se van a usar. Típicos:
- Encuesta (instrumento principal).
- Entrevista a expertos / propietarios de negocios similares.
- Observación directa (visitas a competidores).
- Análisis documental (datos secundarios INE, BCB, prensa).

Cada instrumento con una línea explicativa.

## 1.8 Muestreo

### 1.8.1 Universo o población de estudio

Definí la población al que apunta la encuesta. Especificar: ciudad/zona,
características demográficas, total estimado de habitantes/usuarios.

Citá fuentes oficiales reales (Instituto Nacional de Estadística [INE],
www.ine.gob.bo). Si no recordás la cifra exacta del último censo, usá
una formulación verificable a nivel cualitativo: "según el último
censo oficial, la población urbana de Cochabamba supera el medio
millón de habitantes". Cifras puntuales solo si las recordás con
certeza razonable.

### 1.8.2 Tipo de muestreo

Probabilístico o no probabilístico. Para licenciatura es típico usar
no probabilístico por conveniencia o por cuotas. Justificá la elección
SIN ocultar las limitaciones (sesgo de la conveniencia).

### 1.8.3 Tamaño de la muestra

Fórmula explícita con sus variables:

  n = (Z² × p × q × N) / (e² × (N-1) + Z² × p × q)

Donde:
- N = tamaño de la población.
- Z = valor crítico al nivel de confianza (1.96 para 95%).
- p = proporción esperada (0.5 conservador).
- q = 1 - p.
- e = margen de error (0.05 estándar).

El cálculo numérico final (n exacto) lo realiza el sistema con la
función tamanoMuestra() en una fase posterior usando los parámetros
definidos acá. En esta sección solo presentás la fórmula con sus
variables y un cálculo ilustrativo (asumiendo N plausible para la
zona geográfica del proyecto). El estudiante NO completa nada — el
sistema reemplaza automáticamente con el N real cuando aplica.

═══════════════════════════════════════════════════════════════
EXTENSIÓN ESPERADA Y CALIDAD
═══════════════════════════════════════════════════════════════

- Total esperado del Cap. I: entre 8 y 14 páginas equivalentes (3500 a
  5500 palabras de texto sustantivo, sin contar títulos).
- Cada sección con sus 3 partes obligatorias: anuncio, desarrollo,
  cierre o conclusión parcial.
- Mínimo de párrafos por subsección sustantiva: 2.
- Citas APA cuando corresponda (autores reales del ámbito de la
  administración: Sapag Chain, Baca Urbina, Kotler, Porter, etc.).

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS DE ESTA FASE
═══════════════════════════════════════════════════════════════

- NO incluyas el Marco Teórico (eso es Cap. II).
- NO desarrolles análisis PESTEL ni Porter (eso es Cap. III).
- NO propongas misión, visión, organigrama ni inversión (eso es Cap. IV).
- NO repitas palabra por palabra la idea de Fase 0 — reformulá con
  rigor académico.
- NO uses primera persona ("yo voy a estudiar" → "se estudiará").
- NO termines el capítulo con frases tipo "esto demuestra que..." o
  conclusiones generales. El Cap. I no concluye, solo plantea.
`.trim();

/**
 * Construye el bloque de contexto que se prepende a SISTEMA_PROY_CAP1.
 */
export function buildContextoCap1(datos: {
  /** Idea sintetizada y aprobada en Fase 0. */
  ideaAprobada: string;
  /** Título académico del proyecto (elegido de las 3 propuestas de Fase 0). */
  tituloAprobado: string;
  /** Subtipo confirmado en el wizard. */
  subtipo: "produccion" | "servicios";
  /** Programa académico. */
  programa: string;
  /** Universidad (default UCATEC). */
  universidad?: string;
  /** Documentos extra cargados por el estudiante (opcional). */
  documentosUsuario?: string;
}): string {
  const subtipoLegible = datos.subtipo === "produccion"
    ? "Producción y comercialización de un bien"
    : "Brindar un servicio";
  const universidad = datos.universidad?.trim() || "UCATEC — Universidad Privada de Ciencias Administrativas y Tecnológicas";

  const parts: string[] = [
    "═══════════════════════════════════════════════════════════════",
    "[CONTEXTO DEL PROYECTO]",
    "═══════════════════════════════════════════════════════════════",
    `- Programa académico: ${datos.programa}`,
    `- Universidad: ${universidad}`,
    `- Subtipo de proyecto: ${subtipoLegible}`,
    `- Título académico aprobado: ${datos.tituloAprobado}`,
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 0 APROBADA — IDEA DE NEGOCIO]",
    "═══════════════════════════════════════════════════════════════",
    datos.ideaAprobada.trim(),
  ];

  if (datos.documentosUsuario?.trim()) {
    parts.push(
      "",
      "═══════════════════════════════════════════════════════════════",
      "[DATOS COMPLEMENTARIOS DEL ESTUDIANTE]",
      "═══════════════════════════════════════════════════════════════",
      datos.documentosUsuario.trim(),
    );
  }

  parts.push("");
  return parts.join("\n");
}
