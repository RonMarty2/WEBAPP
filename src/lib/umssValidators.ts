/**
 * Validadores específicos UMSS — monografías de Posgrado FCE.
 *
 * Cubre dos requisitos oficiales:
 *   1. Extensión de páginas (30-70 Guía 1, 50-70 Guía 2)
 *   2. Anti-duplicidad vía atlas.umss.edu.bo (Guía 1 exige ≥5 años de diferencia)
 *
 * Server-only — solo importar desde API routes en src/app/api/.
 */

export type FormatoUMSS = "guia_1_posgrado" | "guia_2_cespedes";

// ─── Extensión de páginas ────────────────────────────────────────────────────

/**
 * Rangos oficiales de páginas según la guía UMSS.
 *
 * - Guía 1 (Posgrado FCE Sept 2024): 30-70 páginas NUMERADAS
 *   (no incluye carátulas, índices ni anexos).
 * - Guía 2 (Céspedes Tapia): 50-70 páginas totales
 *   (incluye carátulas, índices, bibliografía y anexos).
 */
export const RANGOS_PAGINAS: Record<FormatoUMSS, { min: number; max: number; incluye_anexos: boolean }> = {
  guia_1_posgrado: { min: 30, max: 70, incluye_anexos: false },
  guia_2_cespedes: { min: 50, max: 70, incluye_anexos: true },
};

/**
 * Estimación de palabras por página académica según el interlineado.
 * Calibrado con muestras de monografías UMSS reales en TNR 12pt, márgenes 2.54cm.
 */
const PALABRAS_POR_PAGINA: Record<FormatoUMSS, number> = {
  guia_1_posgrado: 250, // doble espacio → ~250 palabras/pág
  guia_2_cespedes: 400, // interlineado 1.5 → ~400 palabras/pág
};

/**
 * Estima el número de páginas a partir del texto completo del documento.
 * Cuenta solo palabras (separadas por espacios), ignorando markdown y LaTeX.
 */
export function estimarPaginas(textoCompleto: string, formato: FormatoUMSS): number {
  const limpio = textoCompleto
    .replace(/\\[a-zA-Z]+(\{[^}]*\})?/g, " ") // comandos LaTeX
    .replace(/[#*_`~]/g, " ")                 // markdown
    .replace(/\s+/g, " ")
    .trim();
  const palabras = limpio.split(" ").filter(Boolean).length;
  return Math.ceil(palabras / PALABRAS_POR_PAGINA[formato]);
}

export interface ResultadoExtension {
  valido: boolean;
  paginas_estimadas: number;
  rango: { min: number; max: number };
  formato: FormatoUMSS;
  mensaje: string;
  nivel: "ok" | "advertencia" | "error";
}

/**
 * Valida que la monografía esté dentro del rango oficial UMSS.
 * El usuario puede llamar esto post-compilación para decidir si expandir/recortar.
 */
export function validarExtensionMonografia(
  textoCompleto: string,
  formato: FormatoUMSS = "guia_1_posgrado",
): ResultadoExtension {
  const paginas = estimarPaginas(textoCompleto, formato);
  const rango = RANGOS_PAGINAS[formato];

  if (paginas < rango.min) {
    return {
      valido: false,
      paginas_estimadas: paginas,
      rango,
      formato,
      nivel: "error",
      mensaje: `La monografía tiene ~${paginas} páginas. UMSS exige mínimo ${rango.min} para esta guía. Expandir desarrollo en capítulos II y IV.`,
    };
  }
  if (paginas > rango.max) {
    return {
      valido: false,
      paginas_estimadas: paginas,
      rango,
      formato,
      nivel: "advertencia",
      mensaje: `La monografía tiene ~${paginas} páginas. UMSS recomienda máximo ${rango.max}. Considerar condensar marco teórico o anexar parte como apéndice.`,
    };
  }
  return {
    valido: true,
    paginas_estimadas: paginas,
    rango,
    formato,
    nivel: "ok",
    mensaje: `Extensión correcta: ${paginas} páginas (rango UMSS: ${rango.min}-${rango.max}).`,
  };
}

// ─── Anti-duplicidad (atlas.umss.edu.bo) ─────────────────────────────────────

/**
 * URL base del repositorio digital UMSS donde se publican las monografías.
 * La Guía 1 (Sept 2024) exige verificar duplicidad aquí antes de proponer tema.
 */
export const ATLAS_UMSS_URL = "http://atlas.umss.edu.bo";

/**
 * Extrae términos relevantes del título de un tema para usar como query
 * de búsqueda en el atlas UMSS. Elimina stopwords castellanas comunes y
 * conserva sustantivos / nombres propios.
 */
export function extraerTerminosBusqueda(tema: string): string {
  const stopwords = new Set([
    "el", "la", "los", "las", "un", "una", "unos", "unas",
    "de", "del", "al", "a", "en", "para", "por", "con", "sin",
    "y", "o", "u", "e", "que", "es", "son", "ser",
    "como", "este", "esta", "esto", "estos", "estas",
    "su", "sus", "se", "si",
  ]);
  return tema
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((p) => p.length > 2 && !stopwords.has(p))
    .slice(0, 6) // máximo 6 términos para no diluir
    .join(" ");
}

/**
 * Genera una URL del atlas UMSS con la query precargada para que el
 * estudiante (o el sistema) pueda verificar si el tema ya existe.
 */
export function generarUrlAtlasUmss(tema: string): string {
  const query = extraerTerminosBusqueda(tema);
  const params = new URLSearchParams({ query });
  return `${ATLAS_UMSS_URL}/simple-search?${params.toString()}`;
}

export interface TrabajoExistente {
  titulo: string;
  autor?: string;
  /** Año de publicación. */
  anio: number;
  /** URL del trabajo en el atlas (opcional). */
  url?: string;
}

export interface ResultadoDuplicidad {
  duplicado: boolean;
  /** Años desde el más reciente trabajo similar. */
  anios_desde_ultimo: number | null;
  similares: Array<TrabajoExistente & { similitud: number }>;
  sugerencia: string;
  /** Año mínimo en el que se podría re-presentar el mismo tema (último + 5). */
  anio_minimo_repeticion: number | null;
}

/**
 * Calcula similitud Jaccard entre dos títulos a nivel de palabras significativas.
 * Útil para detectar trabajos con títulos parecidos en distintas formulaciones.
 */
function similitudJaccard(a: string, b: string): number {
  const tokA = new Set(extraerTerminosBusqueda(a).split(" "));
  const tokB = new Set(extraerTerminosBusqueda(b).split(" "));
  if (tokA.size === 0 || tokB.size === 0) return 0;
  const interseccion = [...tokA].filter((t) => tokB.has(t)).length;
  const union = new Set([...tokA, ...tokB]).size;
  return interseccion / union;
}

/**
 * Evalúa si el tema propuesto se considera duplicado según las normas UMSS:
 * la Guía 1 (Sept 2024) exige al menos 5 años de diferencia para repetir un tema similar.
 *
 * @param temaActual - título o descripción del tema que el estudiante quiere desarrollar
 * @param trabajosExistentes - lista de trabajos detectados en el atlas UMSS
 * @param anioActual - año en el que el estudiante presentaría su monografía
 * @param umbralSimilitud - 0.5 por defecto (la mitad de los términos significativos coinciden)
 */
export function evaluarDuplicidad(
  temaActual: string,
  trabajosExistentes: TrabajoExistente[],
  anioActual: number = new Date().getFullYear(),
  umbralSimilitud: number = 0.5,
): ResultadoDuplicidad {
  const similares = trabajosExistentes
    .map((t) => ({ ...t, similitud: similitudJaccard(temaActual, t.titulo) }))
    .filter((t) => t.similitud >= umbralSimilitud)
    .sort((a, b) => b.similitud - a.similitud);

  if (similares.length === 0) {
    return {
      duplicado: false,
      anios_desde_ultimo: null,
      similares: [],
      anio_minimo_repeticion: null,
      sugerencia: "Tema sin duplicidad detectada en atlas.umss.edu.bo. Continuar con la propuesta.",
    };
  }

  const masReciente = similares.reduce((a, b) => (a.anio > b.anio ? a : b));
  const aniosDesde = anioActual - masReciente.anio;
  const minimo = masReciente.anio + 5;
  const duplicado = aniosDesde < 5;

  return {
    duplicado,
    anios_desde_ultimo: aniosDesde,
    similares: similares.slice(0, 5),
    anio_minimo_repeticion: minimo,
    sugerencia: duplicado
      ? `Tema similar publicado en ${masReciente.anio} por ${masReciente.autor ?? "autor desconocido"}. UMSS requiere ≥5 años — el mismo tema solo podría re-presentarse desde ${minimo}. Recomendado: cambiar enfoque, periodo, sector o ubicación geográfica para diferenciar.`
      : `Trabajos similares en años anteriores (último: ${masReciente.anio}, ${aniosDesde} años atrás). Cumple la regla UMSS de ≥5 años. Continuar, citando antecedentes relevantes.`,
  };
}

// ─── Mapeo variante → guía UMSS (helper para UI) ────────────────────────────

/**
 * Diccionario público de guías UMSS oficiales. El cliente puede usarlo
 * para mostrar al estudiante con qué guía está alineada su monografía.
 */
export const GUIAS_UMSS_OFICIALES: Record<FormatoUMSS, {
  nombre: string;
  autor: string;
  fecha: string;
  url_referencia?: string;
  /** URL pública del PDF oficial (sirve desde /public/guias-umss/). */
  url_documento_pdf?: string;
  caracteristicas: string[];
}> = {
  guia_1_posgrado: {
    nombre: "Guía de Elaboración de Trabajos de Monografía",
    autor: "UMSS — Facultad de Ciencias Económicas, Departamento de Posgrado",
    fecha: "Septiembre 2024",
    // URL sin extension .pdf — evade extensiones tipo TeraBox que detectan
    // URLs .pdf y las interceptan respondiendo 204 vacio.
    url_documento_pdf: "/api/guias-umss/guia1",
    caracteristicas: [
      "Doble titulación (Diplomado + Monografía)",
      "30-70 páginas numeradas (sin carátula/índice/anexos)",
      "Doble interlineado, alineación izquierda sin justificar",
      "Estructura: 1.1 Antecedentes / 1.2 Planteamiento / 1.3 Objetivos / 1.4 Justificación / 1.5 Alcances",
      "Cap. III con sub-secciones 3.3.1-3.3.4 (población, diseño muestral, tamaño, muestreo)",
      "Verificación obligatoria de duplicidad en atlas.umss.edu.bo",
    ],
  },
  guia_2_cespedes: {
    nombre: "Guía de Estilo y Contenido para Realizar una Monografía Académica o de Investigación",
    autor: "Mgr. Lic. Álvaro Céspedes Tapia",
    fecha: "Variante extendida UMSS",
    // URL sin extension .pdf (ver comentario en guia_1_posgrado)
    url_documento_pdf: "/api/guias-umss/guia2",
    caracteristicas: [
      "50-70 páginas totales (incluye todo)",
      "Interlineado 1.5, texto justificado",
      "Hipótesis y operacionalización de variables OPCIONAL (solo descriptivas/proyectivas/correlacionales)",
      "Marco teórico con secciones opcionales: jurídico, institucional, histórico",
      "Cap. IV incluye PROPUESTA DE SOLUCIÓN",
      "7 ejemplos integrados por diplomado",
    ],
  },
};
