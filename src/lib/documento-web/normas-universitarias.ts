/**
 * Normas universitarias bolivianas para el formato del documento web.
 *
 * Mapea cada universidad (por su id) a un set de reglas que controlan:
 *   - Tipografía (en pantalla y en HTML para Word).
 *   - Tamaño base de letra, interlineado, márgenes.
 *   - Alineación (justificado vs izquierda).
 *   - Estilo de citas (APA 7, ISO 690, Vancouver).
 *   - Color de marca para acentos discretos.
 *
 * Si la universidad del proyecto no está en este mapa, se usa el preset
 * "default" que sigue APA 7 + Times New Roman 12pt — el formato más
 * universalmente aceptado por tribunales bolivianos.
 *
 * Las reglas vienen extraídas de los `format` y `latex_prompt` de
 * src/lib/data.ts (DEFAULT_UNIVERSITIES), pero acá las representamos
 * en términos directamente aplicables a HTML/CSS para que el documento
 * web renderice fiel a la norma de cada universidad.
 */

export type EstiloCitas = "apa7" | "iso690" | "vancouver";
export type AlineacionTexto = "justify" | "left";

export interface NormaUniversitaria {
  /** ID de la universidad (mismo que en DEFAULT_UNIVERSITIES). */
  universidadId: string;
  /** Nombre corto para mostrar al alumno (ej. "UMSS", "UPB"). */
  nombreCorto: string;
  /** Tipografía CSS para mostrar en pantalla (web). */
  fuentePantalla: string;
  /** Tipografía CSS para exportar a Word (inline en el HTML). */
  fuenteWord: string;
  /** Tamaño base de letra en puntos (Word) / pixeles (web). */
  tamanoBasePt: number;
  /** Interlineado (1.0 / 1.5 / 2.0). */
  interlineado: number;
  /** Márgenes en cm para @page CSS. */
  margenes: { arriba: number; abajo: number; izquierda: number; derecha: number };
  /** Alineación del texto principal del cuerpo. */
  alineacion: AlineacionTexto;
  /** Estilo de citas que se debe usar al detectar referencias. */
  citas: EstiloCitas;
  /** Color hex para acentos (títulos de capítulo, badge, etc.). */
  colorAcento: string;
  /** Si la portada lleva color de fondo distinto. */
  portadaColorFondo?: string;
  /** Si el texto de la portada tiene color especial (ej. dorado UNIFRANZ). */
  portadaColorTexto?: string;
  /** Texto de la nota al pie del documento (atribución de norma). */
  notaNorma: string;
  /** Nivel de detalle de la sangría francesa en bibliografía (em). */
  sangriaFrancesaEm: number;
}

/**
 * Preset por defecto: el "least common denominator" — Times New Roman,
 * APA 7, interlineado doble, márgenes 2.54cm (1 pulgada). Cumple con la
 * mayoría de tribunales bolivianos cuando la universidad no es conocida.
 */
const NORMA_DEFAULT: NormaUniversitaria = {
  universidadId: "default",
  nombreCorto: "General (APA 7)",
  fuentePantalla: '"Georgia", "Times New Roman", serif',
  fuenteWord: '"Times New Roman", Times, serif',
  tamanoBasePt: 12,
  interlineado: 2.0,
  margenes: { arriba: 2.54, abajo: 2.54, izquierda: 2.54, derecha: 2.54 },
  alineacion: "justify",
  citas: "apa7",
  colorAcento: "#0c1e44",
  notaNorma: "Formato estándar académico boliviano: Times New Roman 12pt, interlineado doble, márgenes 2.54cm. Citas APA 7.",
  sangriaFrancesaEm: 1.5,
};

const NORMAS: NormaUniversitaria[] = [
  // UMSS — Posgrado FCE. Times 12pt, doble, márgenes 2.54cm, alineación izquierda.
  {
    universidadId: "umss-001",
    nombreCorto: "UMSS",
    fuentePantalla: '"Georgia", "Times New Roman", serif',
    fuenteWord: '"Times New Roman", Times, serif',
    tamanoBasePt: 12,
    interlineado: 2.0,
    margenes: { arriba: 2.54, abajo: 2.54, izquierda: 2.54, derecha: 2.54 },
    alineacion: "left",
    citas: "apa7",
    colorAcento: "#0c1e44",
    notaNorma: "Formato UMSS Posgrado: Times New Roman 12pt, interlineado doble, márgenes 2.54cm, alineación izquierda. Citas APA 7.",
    sangriaFrancesaEm: 1.5,
  },

  // UNIFRANZ Cochabamba — Verdana 10pt, 1.5, sangría 3.5cm izquierda. Color guindo + dorado en portada.
  {
    universidadId: "unifranz-cba-001",
    nombreCorto: "UNIFRANZ Cba",
    fuentePantalla: 'Verdana, "Segoe UI", Tahoma, sans-serif',
    fuenteWord: 'Verdana, Geneva, sans-serif',
    tamanoBasePt: 10,
    interlineado: 1.5,
    margenes: { arriba: 2.5, abajo: 2.5, izquierda: 3.5, derecha: 2.5 },
    alineacion: "justify",
    citas: "apa7",
    colorAcento: "#7a1a1a",
    portadaColorFondo: "#5c0e0e",
    portadaColorTexto: "#d4af37",
    notaNorma: "Formato UNIFRANZ Cochabamba (Guía 2017): Verdana 10pt, interlineado 1.5, márgenes 2.5cm (izquierdo 3.5cm). Portada color guindo con letras doradas. Citas APA 7 con cursiva en citas cortas (<40 palabras) y sangría en citas largas (>40 palabras).",
    sangriaFrancesaEm: 1.5,
  },

  // UMSA — La Paz. Times 12pt, doble, márgenes 3cm/3.5cm.
  {
    universidadId: "umsa-001",
    nombreCorto: "UMSA",
    fuentePantalla: '"Georgia", "Times New Roman", serif',
    fuenteWord: '"Times New Roman", Times, serif',
    tamanoBasePt: 12,
    interlineado: 2.0,
    margenes: { arriba: 3.0, abajo: 2.5, izquierda: 3.5, derecha: 2.5 },
    alineacion: "justify",
    citas: "apa7",
    colorAcento: "#003366",
    notaNorma: "Formato UMSA — La Paz: Times New Roman 12pt, interlineado doble, márgenes superior 3cm / izquierdo 3.5cm. Numeración inferior derecha. Citas APA 7.",
    sangriaFrancesaEm: 1.5,
  },

  // UAGRM — Santa Cruz. Arial 12pt, 1.5, márgenes 2.5cm.
  {
    universidadId: "uagrm-001",
    nombreCorto: "UAGRM",
    fuentePantalla: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    fuenteWord: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    tamanoBasePt: 12,
    interlineado: 1.5,
    margenes: { arriba: 2.5, abajo: 2.5, izquierda: 2.5, derecha: 2.5 },
    alineacion: "justify",
    citas: "apa7",
    colorAcento: "#006633",
    notaNorma: "Formato UAGRM — Santa Cruz: Arial 12pt, interlineado 1.5, márgenes uniformes 2.5cm. Numeración superior derecha. Citas APA 7.",
    sangriaFrancesaEm: 1.5,
  },

  // UTO — Oruro. Times 12pt, 1.5.
  {
    universidadId: "uto-001",
    nombreCorto: "UTO",
    fuentePantalla: '"Georgia", "Times New Roman", serif',
    fuenteWord: '"Times New Roman", Times, serif',
    tamanoBasePt: 12,
    interlineado: 1.5,
    margenes: { arriba: 2.5, abajo: 2.5, izquierda: 3.0, derecha: 2.5 },
    alineacion: "justify",
    citas: "apa7",
    colorAcento: "#003d7a",
    notaNorma: "Formato UTO — Oruro: Times New Roman 12pt, interlineado 1.5, márgenes superior/inferior/derecho 2.5cm, izquierdo 3cm. Citas APA 7.",
    sangriaFrancesaEm: 1.5,
  },

  // USFX — Chuquisaca. Times 12pt, doble.
  {
    universidadId: "usfx-001",
    nombreCorto: "USFX",
    fuentePantalla: '"Georgia", "Times New Roman", serif',
    fuenteWord: '"Times New Roman", Times, serif',
    tamanoBasePt: 12,
    interlineado: 2.0,
    margenes: { arriba: 3.0, abajo: 2.5, izquierda: 3.0, derecha: 2.5 },
    alineacion: "justify",
    citas: "apa7",
    colorAcento: "#7a1a1a",
    notaNorma: "Formato USFX — Sucre: Times New Roman 12pt, interlineado doble, márgenes superior/izquierdo 3cm. Citas APA 7.",
    sangriaFrancesaEm: 1.5,
  },

  // UCB — La Paz / Cochabamba / Santa Cruz / Tarija. Times 12pt, 1.5.
  {
    universidadId: "ucb-001",
    nombreCorto: "UCB",
    fuentePantalla: '"Georgia", "Times New Roman", serif',
    fuenteWord: '"Times New Roman", Times, serif',
    tamanoBasePt: 12,
    interlineado: 1.5,
    margenes: { arriba: 2.5, abajo: 2.5, izquierda: 3.0, derecha: 2.5 },
    alineacion: "justify",
    citas: "apa7",
    colorAcento: "#1e3a8a",
    notaNorma: "Formato UCB — Universidad Católica Boliviana: Times New Roman 12pt, interlineado 1.5, márgenes 2.5cm (izquierdo 3cm). Citas APA 7.",
    sangriaFrancesaEm: 1.5,
  },

  // UPB — Cochabamba/La Paz. Times 12pt, doble. Más ejecutivo que académico clásico.
  {
    universidadId: "upb-001",
    nombreCorto: "UPB",
    fuentePantalla: '"Georgia", "Times New Roman", serif',
    fuenteWord: '"Times New Roman", Times, serif',
    tamanoBasePt: 12,
    interlineado: 2.0,
    margenes: { arriba: 2.5, abajo: 2.5, izquierda: 3.0, derecha: 2.5 },
    alineacion: "justify",
    citas: "apa7",
    colorAcento: "#003366",
    notaNorma: "Formato UPB — Universidad Privada Boliviana: Times New Roman 12pt, interlineado doble, márgenes 2.5cm (izquierdo 3cm). Citas APA 7.",
    sangriaFrancesaEm: 1.5,
  },

  // EMI — Escuela Militar de Ingeniería. Arial 11pt, simple, márgenes 2.5cm. Estilo más técnico.
  {
    universidadId: "emi-001",
    nombreCorto: "EMI",
    fuentePantalla: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    fuenteWord: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    tamanoBasePt: 11,
    interlineado: 1.5,
    margenes: { arriba: 2.5, abajo: 2.5, izquierda: 3.0, derecha: 2.5 },
    alineacion: "justify",
    citas: "iso690",
    colorAcento: "#003d7a",
    notaNorma: "Formato EMI — Escuela Militar de Ingeniería: Arial 11pt, interlineado 1.5, márgenes 2.5cm (izquierdo 3cm). Citas ISO 690 (numéricas).",
    sangriaFrancesaEm: 1.2,
  },

  // UCATEC — Privada de Ciencias Administrativas y Tecnológicas. Times 12pt, 1.5.
  {
    universidadId: "ucatec-001",
    nombreCorto: "UCATEC",
    fuentePantalla: '"Georgia", "Times New Roman", serif',
    fuenteWord: '"Times New Roman", Times, serif',
    tamanoBasePt: 12,
    interlineado: 1.5,
    margenes: { arriba: 2.5, abajo: 2.5, izquierda: 3.0, derecha: 2.5 },
    alineacion: "justify",
    citas: "apa7",
    colorAcento: "#7a1a1a",
    notaNorma: "Formato UCATEC: Times New Roman 12pt, interlineado 1.5, márgenes 2.5cm (izquierdo 3cm). Citas APA 7.",
    sangriaFrancesaEm: 1.5,
  },
];

/**
 * Devuelve la norma de la universidad indicada, o la default si no se reconoce.
 */
export function obtenerNorma(universidadId?: string | null): NormaUniversitaria {
  if (!universidadId) return NORMA_DEFAULT;
  return NORMAS.find((n) => n.universidadId === universidadId) ?? NORMA_DEFAULT;
}

/**
 * Lista de todas las normas disponibles, útil para mostrar opciones al admin.
 */
export function listarNormas(): NormaUniversitaria[] {
  return [NORMA_DEFAULT, ...NORMAS];
}

export { NORMA_DEFAULT };
