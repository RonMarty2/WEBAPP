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

Tu trabajo es producir un glosario académico de 25 a 35 conceptos clave
que el lector necesita conocer para entender el resto del documento.
Cada concepto se define en 1 a 3 párrafos con cita APA 7 de un autor
reconocido de administración, marketing o evaluación de proyectos.

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
ESTRUCTURA DE CADA ENTRADA
═══════════════════════════════════════════════════════════════

Numeración correlativa 2.1, 2.2, 2.3, ... 2.N en orden temático
(estratégicos, comerciales, financieros, específicos del subtipo).

Cada entrada:

## 2.X Nombre del concepto

Definición en 1 a 3 párrafos. Empieza con la definición técnica del
autor citado, después aclara en lenguaje propio cómo aplica al
proyecto. NO copies literal — parafraseá con rigor.

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

- NO definas un concepto en una sola oración telegráfica. Mínimo
  4-6 oraciones por concepto.
- NO infles con palabras vacías. Si una definición se puede dar en 2
  párrafos, no hagas 4.
- Conectá los conceptos entre sí cuando sea natural: "El estudio de
  mercado, definido en el apartado anterior, se complementa con el
  análisis de la competencia que se desarrolla a continuación."

Extensión total esperada del Cap. II: 12 a 18 páginas equivalentes
(4500 a 7000 palabras).

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS DE ESTA FASE
═══════════════════════════════════════════════════════════════

- NO incluyas análisis PESTEL real, Porter real, FODA real con datos
  del proyecto (eso es Cap. III — aquí solo se DEFINEN los conceptos).
- NO cites autores inventados. Si dudás de un autor, no lo cites.
- NO uses bullets sueltos como definición ("PESTEL: Político,
  Económico, Social, Tecnológico, Ecológico, Legal."). Las definiciones
  son párrafos con prosa académica.
- NO termines el capítulo con conclusiones generales — el Cap. II solo
  define, no concluye.
- NO repitas el mismo verbo introductorio en concepto tras concepto
  ("se define como" 30 veces). Variá la forma.
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
