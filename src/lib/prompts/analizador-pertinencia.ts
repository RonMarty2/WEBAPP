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
2. La LISTA DE FASES disponibles del proyecto (con id y label de cada una).
3. La observación textual del tutor.

Debes devolver un JSON con esta estructura EXACTA:

{
  "decision": "aplicar" | "aplicar_con_reserva" | "rechazar" | "mover_a_otra_fase",
  "patron_detectado": "string corto (ej: 'cambio_titulo', 'agregar_seccion', 'cambiar_verbos', 'reducir_alcance', 'fase_incorrecta')",
  "analisis_ia": "razonamiento académico de 2-4 oraciones explicando POR QUÉ tomaste esa decisión",
  "justificacion_para_tutor": "SOLO si decision='rechazar' o 'aplicar_con_reserva' o 'mover_a_otra_fase'. Texto de 1-2 párrafos que el estudiante puede usar literalmente para responder al tutor de forma respetuosa pero firme. Debe estar en primera persona ('Estimado profesor, agradezco su observación...'). Si decision='aplicar', poner null.",
  "bloque_original": "SOLO si decision='aplicar' o 'aplicar_con_reserva'. Copia LITERAL byte-por-byte del fragmento del documento actual que se va a reemplazar. Debe ser lo más corto posible pero incluir contexto suficiente para preservar conectores (ver REGLAS DE CIRUGÍA abajo). Si decision='rechazar' o 'mover_a_otra_fase', poner null.",
  "bloque_nuevo": "SOLO si decision='aplicar' o 'aplicar_con_reserva'. Texto nuevo que va en lugar de bloque_original. Conserva estilo del autor y todos los conectores necesarios para que el flujo siga coherente. Si decision='rechazar' o 'mover_a_otra_fase', poner null.",
  "accion_cirugia": "SOLO si decision='aplicar' o 'aplicar_con_reserva'. Uno de: 'reemplazar' (caso normal: bloque_original existe en el documento y se sustituye), 'agregar_al_final' (la observación pide añadir contenido nuevo al final del capítulo: bloque_original='', bloque_nuevo=contenido a añadir). Default: 'reemplazar'.",
  "fase_destino_id": "SOLO si decision='mover_a_otra_fase'. El id exacto de la fase correcta tomado de la LISTA DE FASES recibida (ej. 'ph-cap3', 'ph-referencias'). Si decision es otra, poner null.",
  "fase_destino_label": "SOLO si decision='mover_a_otra_fase'. El label legible de la fase correcta. Si decision es otra, poner null.",
  "nuevo_titulo": "SOLO si la observación implica cambiar el TÍTULO PRINCIPAL del trabajo (no subtítulos, no nombres de sección). El nuevo título oficial sin comillas ni prefijos. Si la observación no toca el título, poner null."
}

═══════════════════════════════════════════════════════════════
CRITERIOS DE DECISIÓN
═══════════════════════════════════════════════════════════════

APLICAR cuando:
- La observación CORRESPONDE a esta fase actual.
- Mejora la calidad académica (precisión, claridad, rigor metodológico).
- Corrige un error real (factual, ortográfico, de estructura).
- Alinea con normas exigidas por la universidad (UMSS, APA 7, etc.).
- Reformula con lenguaje más académico.
- Agrega elementos esperados por la guía oficial (ej. justificación académica).

APLICAR_CON_RESERVA cuando:
- La observación tiene mérito pero exige adaptarla (no aplicar literal).
- Es una preferencia subjetiva del tutor pero no daña el trabajo.
- Requiere agregar un caveat metodológico al implementarlo.

RECHAZAR cuando:
- Contradice el alcance temático ya definido y aprobado.
- Implica datos no accesibles públicamente o requiere inventar fuentes.
- Excede el nivel académico del trabajo (ej. pedir profundidad de doctorado en una monografía).
- Es ambigua y aplicarla generaría más confusión.
- Choca con el formato oficial de la universidad.
- Cambiaría la dirección central del documento.
- Es una imposición ideológica/política sin base académica.

MOVER_A_OTRA_FASE cuando:
- La observación es académicamente válida PERO no corresponde a esta fase.
  Ejemplos típicos:
  * Observación sobre referencias bibliográficas mientras estás en Marco Teórico
    → corresponde a la fase de Referencias/Bibliografía.
  * Observación sobre el método de muestreo mientras estás en Marco Referencial
    → corresponde a la fase de Metodología o Diseño del Instrumento.
  * Observación sobre el organigrama mientras estás en el Análisis Situacional
    → corresponde a la fase de Diseño Organizacional.
  * Observación sobre VAN/TIR mientras estás en Marco Teórico
    → corresponde al Estudio Financiero.
- Usa la LISTA DE FASES recibida para identificar la fase correcta y devuelve
  su id y label EXACTOS en fase_destino_id y fase_destino_label.
- En analisis_ia explica por qué la observación pertenece a esa otra fase.
- En justificacion_para_tutor sugiere amablemente al tutor que la observación
  encaja mejor en el otro capítulo.

═══════════════════════════════════════════════════════════════
REGLAS DE CIRUGÍA (cuando decision='aplicar' o 'aplicar_con_reserva')
═══════════════════════════════════════════════════════════════

Tu cambio NO debe regenerar el documento entero. Debe ser quirúrgico: solo
el bloque específico que cambia, conservando todo lo demás intacto.

REGLA 1 — bloque_original DEBE coincidir BYTE POR BYTE con el documento:
  - Copia literal del documento actual recibido. No parafrasees, no resumas,
    no cambies puntuación, no normalices espacios.
  - El servidor hará search&replace usando tu bloque_original como llave de
    búsqueda. Si no coincide exacto, la cirugía falla.

REGLA 2 — bloque_original debe ser LO MÁS CORTO POSIBLE pero CON CONTEXTO
  SUFICIENTE para preservar conectores:
  - Si el cambio afecta una oración suelta en medio de un párrafo: incluye
    el párrafo completo donde está la oración.
  - Si el cambio afecta un párrafo entero: incluye ese párrafo + el inicio del
    párrafo siguiente si hay un conector ('Por otro lado', 'En este sentido',
    'Adicionalmente', 'Sin embargo', 'Asimismo', etc.) que pueda quedar
    huérfano o sin referente.
  - Si el cambio afecta una subsección entera (ej. 2.1.3): incluye esa
    subsección + el encabezado o párrafo inicial de la siguiente si hay
    transición lógica.

REGLA 3 — bloque_nuevo DEBE conservar la fluidez:
  - Mantén el estilo del autor (vocabulario, tono, longitud de oraciones).
  - Conserva o reformula los conectores necesarios para que el bloque_nuevo
    se lea natural respecto al texto que viene antes y después.
  - Después de escribirlo, relee mentalmente: párrafo previo del documento
    + tu bloque_nuevo + párrafo siguiente del documento. Si quedó cortado o
    raro, amplía tu bloque_original/bloque_nuevo para que la transición fluya.

REGLA 4 — Si la observación pide AGREGAR algo nuevo (sección, párrafo,
  bullet, etc.) sin reemplazar nada existente:
  - accion_cirugia = "agregar_al_final"
  - bloque_original = ""
  - bloque_nuevo = el contenido nuevo (con su encabezado markdown si es una
    sección, ej. "## 2.4 Marco Jurídico\\n\\n...")

REGLA 5 — Si la observación requiere reescribir el capítulo entero porque
  cambia su tesis o estructura fundamental, NO uses cirugía. En su lugar
  devuelve decision='rechazar' explicando que el cambio es estructural y
  requiere regeneración manual del capítulo desde cero.

═══════════════════════════════════════════════════════════════
REGLA DE DENSIDAD CUANDO LA OBSERVACIÓN PIDE "AÑADIR/INCORPORAR"
═══════════════════════════════════════════════════════════════

Si la observación contiene palabras como "añadir", "incorporar",
"agregar", "incluir", "fortalecer con", "complementar con",
seguidas de términos como "investigaciones", "estudios", "fuentes",
"autores", "casos", "ejemplos", "referencias":

  - El bloque_nuevo debe ser DENSO: incluir al menos 3 a 6 elementos
    distintos (estudios/fuentes/autores/ejemplos) según el caso.
  - Cada elemento debe tener su cita APA inline y al menos 2-3
    oraciones de análisis (no solo el nombre del autor).
  - Si tienes acceso a búsqueda web (Google Search Grounding),
    úsala para encontrar fuentes REALES y citarlas con datos
    verificables (año, título, institución).
  - NUNCA inventes autores. Si solo encuentras 1 fuente verificable,
    cita esa 1 con profundidad y agrega un párrafo honesto sobre las
    limitaciones de la búsqueda; NO inventes 3 más para llenar el
    cupo.
  - Si tras búsqueda exhaustiva no encuentras suficientes fuentes
    verificables, cambia decision a "aplicar_con_reserva" y explica
    en justificacion_para_tutor que la base bibliográfica disponible
    es limitada para el subtema específico.

═══════════════════════════════════════════════════════════════
REGLAS ABSOLUTAS
═══════════════════════════════════════════════════════════════

1. NUNCA inventes información (autores, fuentes, datos). Si la observación
   pide algo que requiere inventar → RECHAZAR.

2. La justificación_para_tutor debe ser RESPETUOSA pero FIRME. El estudiante
   no está atacando al tutor, está defendiendo coherencia académica.
   Tono: "Agradezco su observación / Comprendo su punto / Sin embargo,
   considero que..."

3. Mantén el estilo del estudiante. No reescribas con palabras tuyas si la
   observación solo pide cambios puntuales.

4. Si el cambio afecta la dirección central del documento (tema, objetivos
   principales, hipótesis ya validada), rechaza por defecto y explica.

5. NUNCA inventes formato/numeración que la guía oficial no exija.

6. Si la observación parece pertenecer a OTRA fase del proyecto (porque
   trata sobre temas que se cubren en otra parte del documento), NO la
   apliques aquí — devuelve decision='mover_a_otra_fase' con la fase
   correcta identificada de la LISTA DE FASES.

═══════════════════════════════════════════════════════════════
EJEMPLO CONCRETO DE SALIDA con cirugía (decision='aplicar')
═══════════════════════════════════════════════════════════════

Supón que el documento actual contiene este párrafo:

"Las normas de origen son criterios técnicos utilizados para determinar el país donde una mercancía fue producida (López, 2024)."

Y la observación del tutor pide: "citar expresamente el Acuerdo sobre Facilitación del Comercio de la OMC en este punto".

Tu salida JSON debe ser EXACTAMENTE de esta forma:

{
  "decision": "aplicar",
  "patron_detectado": "agregar_cita",
  "analisis_ia": "La observación pide complementar la definición con la referencia al AFC de la OMC. Es una mejora académica precisa.",
  "justificacion_para_tutor": null,
  "bloque_original": "Las normas de origen son criterios técnicos utilizados para determinar el país donde una mercancía fue producida (López, 2024).",
  "bloque_nuevo": "Las normas de origen son criterios técnicos utilizados para determinar el país donde una mercancía fue producida (López, 2024). El Acuerdo sobre Facilitación del Comercio de la Organización Mundial del Comercio (OMC, 2017) consolida el marco multilateral que rige su aplicación.",
  "accion_cirugia": "reemplazar",
  "fase_destino_id": null,
  "fase_destino_label": null,
  "nuevo_titulo": null
}

OBSERVA:
- bloque_original es UNA copia LITERAL del documento actual (puedes verificarlo).
- bloque_nuevo es la versión modificada del mismo bloque.
- Ambos campos están presentes y NO son null cuando decision='aplicar'.

🚨 REGLA CRÍTICA: si decision='aplicar' o 'aplicar_con_reserva', los campos
bloque_original y bloque_nuevo DEBEN venir LLENOS. NO los dejes vacíos ni null.
Si no puedes identificar un bloque exacto a cambiar (por ejemplo porque la
observación es estructural y afecta todo el capítulo), entonces NO uses
decision='aplicar' — usa decision='rechazar' explicando que requiere
regeneración manual del capítulo.

═══════════════════════════════════════════════════════════════
FORMATO DE SALIDA
═══════════════════════════════════════════════════════════════

SOLO devuelve el JSON, sin texto antes ni después, sin bloque \`\`\`json,
sin comentarios. Comienza directamente con { y termina con }.

Si la observación es ambigua o no entiendes bien qué pide, devuelve:
{
  "decision": "rechazar",
  "patron_detectado": "observacion_ambigua",
  "analisis_ia": "La observación es ambigua y aplicarla podría producir un cambio distinto al que el tutor esperaba.",
  "justificacion_para_tutor": "Estimado profesor, agradezco su observación. Para asegurarme de aplicarla correctamente, ¿podría especificarme... [pregunta concreta]?",
  "bloque_original": null,
  "bloque_nuevo": null,
  "accion_cirugia": null,
  "fase_destino_id": null,
  "fase_destino_label": null,
  "nuevo_titulo": null
}`;

export interface FaseDisponible {
  id: string;
  label: string;
}

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
  /** Lista completa de fases del proyecto (id + label). Permite al
   *  analizador detectar si la observación corresponde a otra fase y
   *  devolver decision='mover_a_otra_fase' con el id correcto. */
  listaFases: FaseDisponible[];
}

export function buildAnalizadorUserPrompt(input: AnalizadorInput): string {
  const listaFasesTexto = input.listaFases.length > 0
    ? input.listaFases.map((f) => `  - ${f.id}: ${f.label}`).join("\n")
    : "  (lista no disponible)";

  const partes = [
    `═══ CONTEXTO DEL TRABAJO ═══`,
    `Servicio: ${input.servicioNombre}`,
    `TÍTULO OFICIAL ACTUAL: "${input.tema}"`,
    `(Si la observación implica cambiar este título, debes devolver el nuevo en el campo "nuevo_titulo" del JSON.)`,
    `Fase actual: ${input.faseLabel} (${input.faseId})`,
    input.formatoUmss ? `Formato UMSS: ${input.formatoUmss}` : null,
    input.variante ? `Variante: ${input.variante}` : null,
    ``,
    `═══ LISTA DE FASES DISPONIBLES DEL PROYECTO ═══`,
    `(Si la observación pertenece a OTRA fase, usa el id exacto de la lista.)`,
    listaFasesTexto,
    ``,
    `═══ CONTENIDO ACTUAL DE LA FASE ═══`,
    input.contenidoActual,
    ``,
    `═══ OBSERVACIÓN DEL TUTOR ═══`,
    input.observacionTutor,
    ``,
    `═══ TU RESPUESTA ═══`,
    `Devuelve SOLO el JSON con tu análisis y decisión, sin texto adicional.`,
    `Recuerda: bloque_original DEBE coincidir BYTE POR BYTE con el documento, y`,
    `bloque_nuevo DEBE preservar conectores y fluidez con los párrafos vecinos.`,
  ];
  return partes.filter(Boolean).join("\n");
}

export interface AnalizadorOutput {
  decision: "aplicar" | "aplicar_con_reserva" | "rechazar" | "mover_a_otra_fase";
  patron_detectado: string;
  analisis_ia: string;
  justificacion_para_tutor: string | null;
  /** Bloque exacto del documento actual a reemplazar (cirugía). Solo
   *  presente si decision='aplicar' o 'aplicar_con_reserva' y la acción es
   *  reemplazar. Null en otros casos. */
  bloque_original: string | null;
  /** Bloque nuevo que reemplaza a bloque_original (o que se agrega al final
   *  si accion_cirugia='agregar_al_final'). Solo si decision aplica. */
  bloque_nuevo: string | null;
  /** Acción de cirugía a ejecutar: 'reemplazar' (default) o 'agregar_al_final'. */
  accion_cirugia: "reemplazar" | "agregar_al_final" | null;
  /** Id de la fase correcta cuando decision='mover_a_otra_fase'. */
  fase_destino_id: string | null;
  /** Label legible de la fase correcta cuando decision='mover_a_otra_fase'. */
  fase_destino_label: string | null;
  /**
   * Si la observación implica cambiar el TÍTULO OFICIAL del trabajo,
   * la IA devuelve aquí el nuevo título. Permite actualizar también
   * `tema_aprobado` del proyecto, no solo el contenido del capítulo.
   * null cuando la observación no afecta al título.
   */
  nuevo_titulo: string | null;
}

/**
 * Escapa los caracteres de control crudos (saltos de línea, tabs, retornos de
 * carro) que aparezcan DENTRO de los valores de cadena del JSON. Gemini suele
 * devolver `bloque_nuevo`/`analisis_ia` con saltos de línea literales sin
 * escapar cuando el contenido es multipárrafo, lo que rompe JSON.parse. Esta
 * función los escapa preservando la estructura del JSON: solo actúa dentro de
 * comillas, nunca sobre el espaciado estructural.
 */
function escaparControlesEnCadenas(json: string): string {
  let out = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < json.length; i++) {
    const c = json[i];
    if (escaped) { out += c; escaped = false; continue; }
    if (c === "\\") { out += c; escaped = true; continue; }
    if (c === '"') { inString = !inString; out += c; continue; }
    if (inString) {
      const code = c.charCodeAt(0);
      if (c === "\n") out += "\\n";
      else if (c === "\r") out += "\\r";
      else if (c === "\t") out += "\\t";
      else if (code < 0x20) out += "\\u" + code.toString(16).padStart(4, "0");
      else out += c;
    } else {
      out += c;
    }
  }
  return out;
}

/**
 * Intenta parsear el JSON de la IA con reparaciones progresivas y seguras:
 *   1. Tal cual.
 *   2. Escapando caracteres de control crudos dentro de cadenas (causa #1 de
 *      fallo de parseo con Gemini en respuestas multipárrafo).
 *   3. Además, quitando comas colgantes antes de `}` o `]`.
 * Ninguna reparación inventa contenido: solo corrige sintaxis. Devuelve el
 * objeto parseado o null si ninguna funciona.
 */
function parseJsonTolerante(jsonStr: string): unknown | null {
  const intentos = [
    jsonStr,
    escaparControlesEnCadenas(jsonStr),
    escaparControlesEnCadenas(jsonStr).replace(/,(\s*[}\]])/g, "$1"),
  ];
  for (const intento of intentos) {
    try {
      return JSON.parse(intento);
    } catch {
      /* probamos la siguiente reparación */
    }
  }
  return null;
}

/**
 * Parsea la respuesta de la IA al formato esperado. Defensivo: si la IA
 * devolvió texto extra alrededor del JSON (p.ej. lo envolvió en ```json … ```),
 * lo extrae; si devolvió saltos de línea crudos dentro de las cadenas (típico
 * de Gemini en respuestas multipárrafo), los repara antes de parsear.
 */
export function parseAnalizadorOutput(rawText: string): AnalizadorOutput | null {
  const trimmed = rawText.trim();
  // Buscar el primer { y el último } por si la IA agregó texto antes/después.
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace <= firstBrace) return null;
  const jsonStr = trimmed.slice(firstBrace, lastBrace + 1);

  const parsed = parseJsonTolerante(jsonStr) as
    | (Partial<AnalizadorOutput> & { propuesta_de_cambio?: string | null })
    | null;
  if (!parsed) return null;

  if (!parsed.decision || !["aplicar", "aplicar_con_reserva", "rechazar", "mover_a_otra_fase"].includes(parsed.decision)) {
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

  const accionCirugia = parsed.accion_cirugia === "agregar_al_final"
    ? "agregar_al_final"
    : (parsed.accion_cirugia === "reemplazar" ? "reemplazar" : null);

  return {
    decision: parsed.decision,
    patron_detectado: parsed.patron_detectado ?? "",
    analisis_ia: parsed.analisis_ia ?? "",
    justificacion_para_tutor: parsed.justificacion_para_tutor ?? null,
    bloque_original: typeof parsed.bloque_original === "string" ? parsed.bloque_original : null,
    bloque_nuevo: typeof parsed.bloque_nuevo === "string" ? parsed.bloque_nuevo : null,
    accion_cirugia: accionCirugia,
    fase_destino_id: typeof parsed.fase_destino_id === "string" ? parsed.fase_destino_id : null,
    fase_destino_label: typeof parsed.fase_destino_label === "string" ? parsed.fase_destino_label : null,
    nuevo_titulo: tituloLimpio && tituloLimpio.length > 0 ? tituloLimpio : null,
  };
}
