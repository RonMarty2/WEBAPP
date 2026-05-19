/**
 * Validadores y metadata de las guías oficiales UCB San Pablo Cochabamba.
 *
 * Paralelo a `umssValidators.ts`. Se mantiene separado para no contaminar
 * el motor UMSS (rangos de páginas, fechas, características son distintos).
 *
 * Estado actual: 1 sola guía registrada (6ª edición, Marzo 2020). Cuando
 * UCB publique una nueva edición, se agrega aquí sin tocar nada de UMSS.
 */

export type FormatoUCB = "ucb_2020";

/**
 * Rangos de páginas REFERENCIALES por modalidad UCB.
 *
 * La guía UCB (pág. 4) dice textualmente: "la extensión de los trabajos
 * de grado será definida por cada carrera o programa". Por tanto estos
 * rangos son referenciales (recomendación general), no normativos.
 */
export const RANGOS_PAGINAS_UCB: Record<string, { min: number; max: number; incluye_anexos: boolean }> = {
  monografia: { min: 30, max: 70, incluye_anexos: false },
  proyecto_grado_tecnico: { min: 40, max: 80, incluye_anexos: false },
  tesis_grado: { min: 80, max: 200, incluye_anexos: false },
  proyecto_grado: { min: 60, max: 150, incluye_anexos: false },
  trabajo_dirigido: { min: 50, max: 120, incluye_anexos: false },
};

const PALABRAS_POR_PAGINA_UCB = 280; // Times NR 12, interlineado 1.5, márgenes UCB.

export function estimarPaginasUcb(textoCompleto: string): number {
  const palabras = textoCompleto.trim().split(/\s+/).filter(Boolean).length;
  return Math.ceil(palabras / PALABRAS_POR_PAGINA_UCB);
}

/**
 * Metadata pública de la guía UCB para la UI (botón "Ver guía oficial",
 * panel descriptivo del wizard, etc.).
 */
export const GUIAS_UCB_OFICIALES: Record<FormatoUCB, {
  nombre: string;
  autor: string;
  fecha: string;
  url_referencia?: string;
  url_documento_pdf?: string;
  caracteristicas: string[];
}> = {
  ucb_2020: {
    nombre: "Guía para la presentación de trabajos académicos — UCB Cochabamba",
    autor: "Mgr. Véronique Magali Thomas — UCB San Pablo, Unidad Académica Regional Cochabamba",
    fecha: "6ª edición, Marzo 2020",
    url_documento_pdf: "/api/guias-ucb/guia1",
    caracteristicas: [
      "Sistema autor-fecha propio (APELLIDO, año: página) — NO APA 7",
      "Times New Roman 12, interlineado 1.5, sin sangría inicial",
      "Márgenes: izquierdo 3.5cm · derecho/superior/inferior 3cm",
      "Numeración correlativa en parte inferior derecha",
      "Tribunal Examinador + Resumen ≤200 palabras + Abstract + palabras clave",
      "Hoja separadora de color antes de anexos; anexos numerados desde 1",
      "Color empastado por grado: T.Sup. celeste / Lic. azul marino / Esp. verde / Maestría guindo / Doctorado negro",
      "Prohíbe primera persona singular, &, sangría, subrayado y mayúsculas decorativas",
      "Cita de cita prohibida — solo fuentes primarias",
    ],
  },
};

/**
 * Lista de validaciones rápidas que detectan violaciones a las reglas
 * estilísticas UCB en un texto candidato. Cada función retorna `true`
 * cuando encuentra una violación.
 */
export const VALIDACIONES_ESTILO_UCB = {
  contieneAmpersand: (texto: string): boolean => /[^\w@]&[^\w@]|^&|&$/.test(texto),
  contienePrimeraPersonaSingular: (texto: string): boolean => {
    // Detecta pronombres y verbos en primera persona singular más comunes.
    const patrones = [
      /\b(yo|mí|mío|míos|mía|mías|conmigo)\b/i,
      /\b(creo|considero|pienso|opino|sostengo|afirmo|concluyo|encontré|encontraré|analicé|propongo|sugiero|recomiendo)\b/i,
    ];
    return patrones.some((p) => p.test(texto));
  },
  contieneSubrayadoLatex: (texto: string): boolean => /\\underline\{[^}]+\}/.test(texto),
};
