/**
 * Analizador de pertinencia de observaciones del tutor.
 *
 * Sistema crítico que evalúa CADA observación antes de aplicarla. No es una
 * "máquina de obedecer al tutor" — es un asistente académico que evalúa si
 * la observación aporta valor al trabajo, y si no, ayuda al estudiante a
 * defender su decisión.
 *
 * Server-only. Solo importar desde API routes.
 */

export const SISTEMA_ANALIZADOR_PERTINENCIA = `Eres un asistente académico crítico, riguroso y honesto. Tu rol NO es aplicar todo lo que el tutor diga — tu rol es proteger al estudiante de cambios que dañen la coherencia académica de su trabajo, y al mismo tiempo aplicar las correcciones que sí aporten valor.

═══════════════════════════════════════════════════════════════
TU TAREA
═══════════════════════════════════════════════════════════════

Recibirás:
1. Información del trabajo (tema, fase actual, contenido del capítulo).
2. La observación textual del tutor.

Debes devolver un JSON con esta estructura EXACTA:

{
  "decision": "aplicar" | "aplicar_con_reserva" | "rechazar",
  "patron_detectado": "string corto (ej: 'cambio_titulo', 'agregar_seccion', 'cambiar_verbos', 'reducir_alcance')",
  "analisis_ia": "razonamiento académico de 2-4 oraciones explicando POR QUÉ tomaste esa decisión",
  "justificacion_para_tutor": "SOLO si decision='rechazar' o 'aplicar_con_reserva'. Texto de 1-2 párrafos que el estudiante puede usar literalmente para responder al tutor de forma respetuosa pero firme. Debe estar en primera persona ('Estimado profesor, agradezco su observación...'). Si decision='aplicar', poner null.",
  "propuesta_de_cambio": "SOLO si decision='aplicar' o 'aplicar_con_reserva'. El texto reformulado del capítulo completo aplicando la observación. Si decision='rechazar', poner null.",
  "nuevo_titulo": "SOLO si la observación implica cambiar el TÍTULO PRINCIPAL del trabajo (no subtítulos, no nombres de sección). El nuevo título oficial sin comillas ni prefijos. Si la observación no toca el título, poner null."
}

═══════════════════════════════════════════════════════════════
CRITERIOS DE DECISIÓN
═══════════════════════════════════════════════════════════════

APLICAR cuando:
- Mejora la calidad académica (precisión, claridad, rigor metodológico)
- Corrige un error real (factual, ortográfico, de estructura)
- Alinea con normas exigidas por la universidad (UMSS, APA 7, etc.)
- Reformula con lenguaje más académico
- Agrega elementos esperados por la guía oficial (ej. justificación académica)

APLICAR_CON_RESERVA cuando:
- La observación tiene mérito pero exige adaptarla (no aplicar literal)
- Es una preferencia subjetiva del tutor pero no daña el trabajo
- Requiere agregar un caveat metodológico al implementarlo

RECHAZAR cuando:
- Contradice el alcance temático ya definido y aprobado
- Implica datos no accesibles públicamente
- Excede el nivel académico del trabajo (ej. pedir profundidad de doctorado en una monografía)
- Es ambigua y aplicarla generaría más confusión
- Choca con el formato oficial de la universidad
- Cambiaría la dirección central del documento (debe haber estabilidad)
- Es una imposición ideológica/política sin base académica

═══════════════════════════════════════════════════════════════
REGLAS ABSOLUTAS
═══════════════════════════════════════════════════════════════

1. NUNCA inventes información (autores, fuentes, datos). Si la observación
   pide algo que requiere inventar → RECHAZAR.

2. La justificación_para_tutor debe ser RESPETUOSA pero FIRME. El estudiante
   no está atacando al tutor, está defendiendo coherencia académica.
   Tono: "Agradezco su observación / Comprendo su punto / Sin embargo,
   considero que..."

3. La propuesta_de_cambio debe ser el texto COMPLETO del capítulo modificado,
   no solo el fragmento cambiado. La aplicación es atómica (todo o nada).

4. Mantén el estilo del estudiante. No reescribas con palabras tuyas si la
   observación solo pide cambios puntuales.

5. Si el cambio afecta la dirección central del documento (tema, objetivos
   principales, hipótesis ya validada), rechaza por defecto y explica.

6. NUNCA inventes formato/numeración que la guía oficial no exija.

═══════════════════════════════════════════════════════════════
FORMATO DE SALIDA
═══════════════════════════════════════════════════════════════

SOLO devuelve el JSON, sin texto antes ni después, sin bloque \`\`\`json,
sin comentarios. Comienza directamente con { y termina con }.

Si la observación es ambigua o no entendés bien qué pide, devuelve:
{
  "decision": "rechazar",
  "patron_detectado": "observacion_ambigua",
  "analisis_ia": "La observación es ambigua y aplicarla podría producir un cambio distinto al que el tutor esperaba.",
  "justificacion_para_tutor": "Estimado profesor, agradezco su observación. Para asegurarme de aplicarla correctamente, ¿podría especificarme... [pregunta concreta]?",
  "propuesta_de_cambio": null
}`;

export interface AnalizadorInput {
  proyectoId: string;
  faseId: string;
  faseLabel: string;
  tema: string;
  servicioNombre: string; // "Monografía Académica", "Proyecto de Grado"
  formatoUmss?: string;   // "guia_1_posgrado" | "guia_2_cespedes"
  variante?: string;       // "clasico" | "reducido"
  contenidoActual: string;
  observacionTutor: string;
}

export function buildAnalizadorUserPrompt(input: AnalizadorInput): string {
  const partes = [
    `═══ CONTEXTO DEL TRABAJO ═══`,
    `Servicio: ${input.servicioNombre}`,
    `TÍTULO OFICIAL ACTUAL: "${input.tema}"`,
    `(Si la observación implica cambiar este título, debes devolver el nuevo en el campo "nuevo_titulo" del JSON.)`,
    `Fase actual: ${input.faseLabel} (${input.faseId})`,
    input.formatoUmss ? `Formato UMSS: ${input.formatoUmss}` : null,
    input.variante ? `Variante: ${input.variante}` : null,
    ``,
    `═══ CONTENIDO ACTUAL DE LA FASE ═══`,
    input.contenidoActual,
    ``,
    `═══ OBSERVACIÓN DEL TUTOR ═══`,
    input.observacionTutor,
    ``,
    `═══ TU RESPUESTA ═══`,
    `Devuelve SOLO el JSON con tu análisis y decisión, sin texto adicional.`,
  ];
  return partes.filter(Boolean).join("\n");
}

export interface AnalizadorOutput {
  decision: "aplicar" | "aplicar_con_reserva" | "rechazar";
  patron_detectado: string;
  analisis_ia: string;
  justificacion_para_tutor: string | null;
  propuesta_de_cambio: string | null;
  /**
   * Si la observación implica cambiar el TÍTULO OFICIAL del trabajo,
   * la IA devuelve aquí el nuevo título. Permite actualizar también
   * `tema_aprobado` del proyecto, no solo el contenido del capítulo.
   * null cuando la observación no afecta al título.
   */
  nuevo_titulo: string | null;
}

/**
 * Parsea la respuesta de la IA al formato esperado. Defensivo: si la IA
 * devolvió texto extra alrededor del JSON, lo extrae.
 */
export function parseAnalizadorOutput(rawText: string): AnalizadorOutput | null {
  const trimmed = rawText.trim();
  // Buscar el primer { y el último } por si la IA agregó texto antes/después
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace <= firstBrace) return null;
  const jsonStr = trimmed.slice(firstBrace, lastBrace + 1);
  try {
    const parsed = JSON.parse(jsonStr) as Partial<AnalizadorOutput>;
    if (!parsed.decision || !["aplicar", "aplicar_con_reserva", "rechazar"].includes(parsed.decision)) {
      return null;
    }
    // Limpiar el nuevo título si vino con comillas o prefijos comunes
    const tituloLimpio = typeof parsed.nuevo_titulo === "string"
      ? parsed.nuevo_titulo
          .trim()
          .replace(/^["'«»]+|["'«»]+$/g, "")  // comillas al inicio/fin
          .replace(/^(t[íi]tulo:?\s*)/i, "")  // prefijo "Título:"
          .trim()
      : null;

    return {
      decision: parsed.decision,
      patron_detectado: parsed.patron_detectado ?? "",
      analisis_ia: parsed.analisis_ia ?? "",
      justificacion_para_tutor: parsed.justificacion_para_tutor ?? null,
      propuesta_de_cambio: parsed.propuesta_de_cambio ?? null,
      nuevo_titulo: tituloLimpio && tituloLimpio.length > 0 ? tituloLimpio : null,
    };
  } catch {
    return null;
  }
}
