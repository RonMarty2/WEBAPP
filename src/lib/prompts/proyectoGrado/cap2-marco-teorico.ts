/**
 * SISTEMA_PROY_CAP2 — Fase 2: Marco Teórico Conceptual (Capítulo II).
 *
 * Genera el Capítulo II del Proyecto de Grado UCATEC: glosario de los
 * 25-35 conceptos clave que se van a usar en el resto del documento.
 * Cada concepto definido brevemente con cita APA 7 de un autor reconocido.
 *
 * Este Capítulo tiene VARIANTE POR SUBTIPO porque los conceptos
 * obligatorios cambian:
 *   - producción: enfoque en proceso productivo, mix 4P, capacidad
 *     instalada, costos variables de fabricación.
 *   - servicios: enfoque en marketing de servicios, mix 7P, calidad
 *     de servicio, evidencia física, servicescape.
 *
 * El sistema elige el prompt correcto en runtime según el `tipo_proyecto_id`
 * del proyecto.
 *
 * Max tokens recomendado: 9000.
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

// ─────────────────────────────────────────────────────────────────────────────
// Conceptos base — comunes a los dos subtipos
// ─────────────────────────────────────────────────────────────────────────────

const CONCEPTOS_BASE = `
Conceptos OBLIGATORIOS (comunes a producción y servicios):

  ESTRATÉGICOS:
  - Proyecto / Proyecto de inversión
  - Estudio de factibilidad
  - Pre-factibilidad
  - Viabilidad
  - Análisis PESTEL (con sus 6 factores)
  - 5 Fuerzas de Porter (con las 5 fuerzas individuales)
  - Matriz FODA
  - Matriz EFE (Evaluación de Factores Externos)
  - Matriz EFI (Evaluación de Factores Internos)
  - Matriz MPC (Perfil Competitivo)
  - Cadena de valor

  COMERCIALES Y DE MERCADO:
  - Estudio de mercado
  - Segmentación de mercado
  - Mercado objetivo / Mercado meta
  - Demanda
  - Oferta
  - Demanda potencial insatisfecha
  - Cuota de mercado
  - Posicionamiento

  FINANCIEROS:
  - Valor Actual Neto (VAN)
  - Tasa Interna de Retorno (TIR)
  - Costo Promedio Ponderado de Capital (WACC)
  - Punto de equilibrio
  - Flujo de caja
  - Costos fijos / Costos variables
  - Inversión inicial
  - Capital de trabajo
  - Depreciación
  - Amortización
`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// Variante PRODUCCIÓN
// ─────────────────────────────────────────────────────────────────────────────

const CONCEPTOS_PRODUCCION = `
Conceptos ESPECÍFICOS de proyectos de PRODUCCIÓN:

  - Mix de marketing — 4P (Producto, Precio, Plaza, Promoción)
  - Proceso productivo
  - Diagrama de flujo de producción
  - Capacidad instalada
  - Capacidad productiva mensual / anual
  - Materia prima
  - Insumos directos / indirectos
  - Mano de obra directa
  - Costos de producción
  - Línea de producción
  - Punto de pedido / Inventario mínimo
  - Layout de planta
`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// Variante SERVICIOS
// ─────────────────────────────────────────────────────────────────────────────

const CONCEPTOS_SERVICIOS = `
Conceptos ESPECÍFICOS de proyectos de SERVICIOS:

  - Marketing de servicios
  - Mix de marketing ampliado — 7P (4P + Personas, Procesos, Evidencia Física)
  - Calidad de servicio
  - Experiencia del cliente / Customer experience
  - Branding
  - Servicescape (entorno del servicio)
  - Momento de la verdad (Service encounter)
  - Capacidad de atención
  - Protocolo de atención
  - Ciclo del servicio
  - Intangibilidad / Inseparabilidad / Heterogeneidad / Caducidad (las 4 i)
  - Recuperación del servicio (Service recovery)
`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// Prompt builder común
// ─────────────────────────────────────────────────────────────────────────────

function buildPromptCap2(subtipo: "produccion" | "servicios"): string {
  const conceptosSubtipo = subtipo === "produccion"
    ? CONCEPTOS_PRODUCCION
    : CONCEPTOS_SERVICIOS;
  const subtipoLegible = subtipo === "produccion"
    ? "PRODUCCIÓN Y COMERCIALIZACIÓN DE UN BIEN"
    : "BRINDAR UN SERVICIO";

  return `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando el CAPÍTULO II — MARCO TEÓRICO CONCEPTUAL de un Proyecto
de Grado UCATEC del subtipo ${subtipoLegible}.

🚨 ESTO NO ES UN GLOSARIO DE DEFINICIONES — ES UN MARCO TEÓRICO REAL.

Un glosario es una lista alfabética de términos con UNA definición corta.
Un Marco Teórico es un CUERPO ARGUMENTATIVO organizado por bloques
conceptuales, donde cada bloque desarrolla el fundamento teórico que
sostendrá el análisis del resto del documento. La diferencia es enorme
en profundidad, organización y rigor académico esperado para un
trabajo de titulación.

Tu trabajo es construir 5 a 7 BLOQUES TEMÁTICOS donde cada bloque:

  1. Tiene una introducción al área conceptual.
  2. Desarrolla 4 a 8 conceptos relacionados de manera CONECTADA
     (no como lista plana — los conceptos se referencian entre sí).
  3. Discute cómo los autores principales del área dialogan entre sí
     (complementarios, en evolución, en debate).
  4. Aplica brevemente los conceptos al CASO ESPECÍFICO del proyecto.
  5. Cierra con una oración puente al siguiente bloque o al Cap. III.

Recibes:
1. [CONTEXTO DEL PROYECTO] — Idea aprobada, subtipo, título.
2. [CAPÍTULO I APROBADO] — El Cap. I completo (sirve para detectar qué
   conceptos extras hay que definir más allá de la lista obligatoria).

═══════════════════════════════════════════════════════════════
CONCEPTOS OBLIGATORIOS (NO SE PUEDEN OMITIR)
═══════════════════════════════════════════════════════════════

${CONCEPTOS_BASE}

${conceptosSubtipo}

Total mínimo de conceptos: 25.
Total máximo de conceptos: 35.

Si en el Cap. I aparecen otros conceptos importantes que no están en
estas listas (ej: "marketing digital", "inbound marketing", "lean
manufacturing"), AGREGALOS hasta llegar al máximo de 35.

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA — BLOQUES TEMÁTICOS (NO LISTAS)
═══════════════════════════════════════════════════════════════

Bloques sugeridos (adaptá los nombres al rubro del proyecto):

  ## 2.1 Fundamentos de la formulación y evaluación de proyectos
  ## 2.2 Análisis estratégico de industrias y entornos
  ## 2.3 Análisis del mercado y comportamiento del consumidor
  ## 2.4 Fundamentos de evaluación financiera
  ## 2.5 [BLOQUE ESPECÍFICO DEL SUBTIPO]
       (servicios → Marketing de servicios y experiencia del cliente)
       (producción → Gestión de operaciones y procesos productivos)
  ## 2.6 [BLOQUE OPCIONAL específico al rubro]
       (ej: Economía de plataformas digitales si el proyecto es marketplace)
  ## 2.7 Síntesis del marco teórico

ESTRUCTURA INTERNA DE CADA BLOQUE TEMÁTICO (no de cada concepto):

  ### Anuncio del bloque (1 párrafo)
  Qué área conceptual cubre y por qué es relevante para el proyecto.

  ### Desarrollo conceptual (4 a 8 párrafos)
  Desarrolla los conceptos del bloque de forma CONECTADA, no como
  bullets ni como entradas separadas tipo diccionario. Cada concepto
  aparece naturalmente en la prosa, definido en su contexto, con cita
  inline al autor del whitelist. Los conceptos del bloque se referencian
  entre sí ('el análisis PESTEL discutido más arriba complementa el
  modelo de cinco fuerzas de Porter...').

  Patrón aceptable de párrafo (NO el único, variá la forma):
  'Sapag Chain et al. (2014) definen el [concepto] como [...]. Esta
  definición se complementa con la perspectiva de [otro autor del
  bloque], quien añade que [...]. En el contexto del presente proyecto,
  el concepto se aplica de la siguiente manera: [...]'

  ### Cierre del bloque (1 párrafo)
  Síntesis breve + puente al siguiente bloque o al Cap. III.

NO uses ## 2.X NombreConcepto como subsección. Las subsecciones son
los BLOQUES TEMÁTICOS, no los conceptos individuales.

Cita UN autor reconocido por concepto. Autores legítimos para esta
materia (NO inventes otros):

- **Sapag Chain & Sapag Chain** (Preparación y evaluación de proyectos)
- **Baca Urbina** (Evaluación de proyectos)
- **Porter, M.** (Estrategia competitiva / Ventaja competitiva)
- **Kotler & Armstrong** (Fundamentos de marketing)
- **Kotler & Keller** (Dirección de marketing)
- **David, F.** (Conceptos de administración estratégica)
- **Hernández Sampieri** (Metodología de la investigación)
- **Brealey, Myers & Allen** (Principios de finanzas corporativas)
- **Lovelock & Wirtz** (Marketing de servicios) — solo subtipo servicios
- **Zeithaml, Bitner & Gremler** (Servicios: marketing y operación) — solo subtipo servicios
- **Heizer & Render** (Dirección de la producción y operaciones) — solo subtipo producción

Año de la cita: usar ediciones recientes (2017-2024). NO inventes años.
Formato APA: (Apellido, año).

═══════════════════════════════════════════════════════════════
TONO Y EXTENSIÓN
═══════════════════════════════════════════════════════════════

- Mínimo 4-8 párrafos POR BLOQUE TEMÁTICO (5-7 bloques en total).
- Cada párrafo: 4-8 oraciones de prosa académica conectada.
- Conectá los conceptos entre sí — el lector debe seguir un HILO
  argumentativo, no leer entradas separadas.
- Aplicá los conceptos al CASO ESPECÍFICO del proyecto (mencionar el
  rubro, el segmento, la naturaleza de la propuesta).

Extensión total esperada del Cap. II: 15 a 22 páginas equivalentes
(5500 a 8000 palabras). MÁS LARGO que la versión vieja porque la
estructura por bloques desarrolla más profundo cada área.

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS DE ESTA FASE
═══════════════════════════════════════════════════════════════

🚨 PROHIBIDO ABSOLUTAMENTE — estos son los errores que convierten
   un Marco Teórico en un glosario inservible:

- ❌ Listar conceptos uno tras otro como entradas de diccionario
  ('**Estudio de factibilidad.** Etapa de... (Cita).
    **Análisis PESTEL.** Herramienta de... (Cita).
    **Cinco fuerzas de Porter.** Modelo de... (Cita).')
  Esto NO es Marco Teórico. Es un GLOSARIO.

- ❌ Usar subsecciones tipo '## 2.X NombreDelConcepto' o '**Nombre.**
  Definición.' como estructura principal. Las subsecciones son los
  BLOQUES TEMÁTICOS (formulación de proyectos, análisis estratégico,
  etc.), no los conceptos individuales.

- ❌ Usar UNA sola oración o un párrafo telegráfico para definir un
  concepto importante. Cada concepto clave del bloque amerita
  desarrollo en su párrafo o pasaje, no en una línea.

- ❌ Incluir análisis PESTEL real, Porter real, FODA real con datos
  del proyecto (eso es Cap. III — aquí solo se desarrolla el MARCO
  TEÓRICO, no la aplicación).

- ❌ Citar autores fuera del whitelist autorizado de reglas-comunes.

- ❌ Terminar con conclusiones generales del documento — el cierre del
  Cap. II es una síntesis del marco teórico construido, no una
  evaluación del proyecto.

- ❌ Repetir el mismo verbo introductorio en concepto tras concepto
  ('se define como' 30 veces). Variá la forma.
`.trim();
}

/** Prompt para proyectos del subtipo PRODUCCIÓN. */
export const SISTEMA_PROY_CAP2_PRODUCCION = buildPromptCap2("produccion");

/** Prompt para proyectos del subtipo SERVICIOS. */
export const SISTEMA_PROY_CAP2_SERVICIOS = buildPromptCap2("servicios");

/** Helper para elegir el prompt según el subtipo. */
export function getPromptCap2(subtipo: "produccion" | "servicios"): string {
  return subtipo === "produccion"
    ? SISTEMA_PROY_CAP2_PRODUCCION
    : SISTEMA_PROY_CAP2_SERVICIOS;
}

/**
 * Construye el bloque de contexto que se prepende al prompt Cap. II.
 */
export function buildContextoCap2(datos: {
  /** Cap. I aprobado completo. */
  cap1Aprobado: string;
  /** Título académico del proyecto. */
  tituloAprobado: string;
  /** Subtipo. */
  subtipo: "produccion" | "servicios";
}): string {
  const subtipoLegible = datos.subtipo === "produccion"
    ? "Producción y comercialización de un bien"
    : "Brindar un servicio";

  return [
    "═══════════════════════════════════════════════════════════════",
    "[CONTEXTO DEL PROYECTO]",
    "═══════════════════════════════════════════════════════════════",
    `- Subtipo: ${subtipoLegible}`,
    `- Título: ${datos.tituloAprobado}`,
    "",
    "═══════════════════════════════════════════════════════════════",
    "[CAPÍTULO I APROBADO — MARCO REFERENCIAL]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap1Aprobado.trim(),
    "",
  ].join("\n");
}
