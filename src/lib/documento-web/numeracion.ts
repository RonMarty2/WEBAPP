/**
 * Numeración automática para el Documento Web.
 *
 * Procesa el markdown de cada fase y produce:
 *   - Capítulos numerados en romanos (I, II, III...).
 *   - Subsecciones decimales (1.1, 1.2, 1.2.1...).
 *   - Tablas y figuras numeradas secuencialmente a través de todo el doc.
 *   - Citas inline `(Autor, año)` o `[1]` detectadas y resaltadas.
 *
 * NO modifica el markdown original; produce una estructura nueva con la
 * numeración resuelta para renderizar.
 */

import type { CitaDetectada } from "./citas";

export interface NumeradorEstado {
  /** Capítulo actual (1-indexed). */
  capitulo: number;
  /** Pila de subsecciones: [seccion, subseccion, ...]. */
  secciones: number[];
  /** Contador global de tablas. */
  tablas: number;
  /** Contador global de figuras (incluye tikz/pgfplots/imágenes). */
  figuras: number;
}

export function nuevoNumerador(): NumeradorEstado {
  return { capitulo: 0, secciones: [], tablas: 0, figuras: 0 };
}

export function romano(n: number): string {
  if (n < 1) return "";
  const valores: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let r = "";
  let resto = n;
  for (const [v, s] of valores) {
    while (resto >= v) { r += s; resto -= v; }
  }
  return r;
}

export interface BloqueNumerado {
  tipo: "h1" | "h2" | "h3" | "h4" | "parrafo" | "lista" | "tabla" | "figura" | "code" | "cita_bloque";
  /** Texto plano del contenido. Para tablas/figuras es el caption. */
  texto: string;
  /** Numeración resuelta. Ej: "I", "1.1", "Tabla 3", "Figura 5". */
  numero?: string;
  /** Slug del id HTML para anclaje en el índice. */
  id?: string;
  /** Items para listas. */
  items?: string[];
  /** Filas para tablas (primera fila = header). */
  filas?: string[][];
  /** Texto markdown bruto para que el renderer maneje inline (negritas, etc.). */
  raw?: string;
  /** Lenguaje del bloque de código. */
  lang?: string;
  /** Indica si es un encabezado de capítulo (h1 al inicio de fase). */
  esCapitulo?: boolean;
}

/**
 * Genera un slug url-safe a partir de un título.
 */
export function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Parsea el markdown de una fase y devuelve los bloques con numeración resuelta.
 * El estado se mantiene entre llamadas (mismo objeto numerador) para que la
 * numeración de figuras/tablas sea continua a través de los capítulos.
 */
export function parsearMarkdownNumerado(
  markdown: string,
  numerador: NumeradorEstado,
  opciones?: {
    /** Si true, el primer h1/h2 cuenta como inicio de capítulo nuevo. */
    iniciaCapitulo?: boolean;
    /** Prefijo para los ids HTML (ej. "fase-1"). */
    prefijoId?: string;
  },
): BloqueNumerado[] {
  const lineas = markdown.split("\n");
  const bloques: BloqueNumerado[] = [];
  const prefijoId = opciones?.prefijoId ?? "";
  let yaInicioCapitulo = !opciones?.iniciaCapitulo;

  function isTablaSep(l: string) {
    return /^\s*\|[\s\-:|]+\|\s*$/.test(l);
  }
  function isTablaRow(l: string) {
    return /^\s*\|.*\|\s*$/.test(l);
  }

  let i = 0;
  while (i < lineas.length) {
    const linea = lineas[i].trim();
    if (!linea) { i++; continue; }

    // Bloque de código ```lang ...
    const fence = linea.match(/^```(\w*)\s*$/);
    if (fence) {
      const lang = fence[1].toLowerCase();
      i++;
      const buf: string[] = [];
      while (i < lineas.length && !/^```\s*$/.test(lineas[i].trim())) {
        buf.push(lineas[i]);
        i++;
      }
      i++;
      const contenido = buf.join("\n");
      const esFigura = ["tikz", "pgfplots", "latex", "tex"].includes(lang);
      if (esFigura) {
        numerador.figuras++;
        const captionTexto = extraerCaptionFigura(contenido) || `${lang.toUpperCase()} (figura sin caption)`;
        bloques.push({
          tipo: "figura",
          texto: captionTexto,
          numero: `Figura ${numerador.figuras}`,
          raw: contenido,
          lang,
          id: `${prefijoId}-fig-${numerador.figuras}`,
        });
      } else {
        bloques.push({ tipo: "code", texto: contenido, raw: contenido, lang });
      }
      continue;
    }

    // Headers
    const h = linea.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const nivel = h[1].length;
      const titulo = h[2].trim().replace(/\*+$/, "").trim();

      if (nivel === 1 && !yaInicioCapitulo) {
        numerador.capitulo++;
        numerador.secciones = [];
        yaInicioCapitulo = true;
        bloques.push({
          tipo: "h1",
          texto: titulo,
          numero: romano(numerador.capitulo),
          id: `cap-${numerador.capitulo}`,
          esCapitulo: true,
        });
        i++;
        continue;
      }

      // Subsecciones
      const profundidad = nivel - 1;
      while (numerador.secciones.length > profundidad) numerador.secciones.pop();
      while (numerador.secciones.length < profundidad) numerador.secciones.push(0);
      if (numerador.secciones.length > 0) {
        numerador.secciones[profundidad - 1] = (numerador.secciones[profundidad - 1] ?? 0) + 1;
      }
      const numero = numerador.secciones.join(".");
      bloques.push({
        tipo: `h${nivel}` as BloqueNumerado["tipo"],
        texto: titulo,
        numero,
        id: `${prefijoId}-sec-${slugify(titulo)}`,
      });
      i++;
      continue;
    }

    // Tabla
    if (isTablaRow(linea)) {
      const filas: string[][] = [];
      let captionPrevio: string | undefined;
      // Caption previo en el bloque anterior?
      const prevBloque = bloques[bloques.length - 1];
      if (prevBloque?.tipo === "parrafo" && /^_?(Tabla|Cuadro)/i.test(prevBloque.texto.trim())) {
        captionPrevio = prevBloque.texto.replace(/^_?(Tabla|Cuadro)\s+\d*:?\s*/i, "").replace(/_$/, "").trim();
        bloques.pop();
      }
      let j = i;
      while (j < lineas.length && (isTablaRow(lineas[j].trim()) || isTablaSep(lineas[j].trim()))) {
        const tr = lineas[j].trim();
        if (!isTablaSep(tr)) {
          const celdas = tr.split("|").slice(1, -1).map((c) => c.trim());
          filas.push(celdas);
        }
        j++;
      }
      if (filas.length > 0) {
        numerador.tablas++;
        bloques.push({
          tipo: "tabla",
          texto: captionPrevio ?? "Datos del estudio",
          numero: `Tabla ${numerador.tablas}`,
          filas,
          id: `${prefijoId}-tabla-${numerador.tablas}`,
        });
      }
      i = j;
      continue;
    }

    // Lista
    if (/^[-*]\s+/.test(linea) || /^\d+\.\s+/.test(linea)) {
      const items: string[] = [];
      while (i < lineas.length) {
        const l = lineas[i].trim();
        if (/^[-*]\s+/.test(l)) { items.push(l.replace(/^[-*]\s+/, "")); i++; continue; }
        if (/^\d+\.\s+/.test(l)) { items.push(l.replace(/^\d+\.\s+/, "")); i++; continue; }
        if (!l) { i++; break; }
        break;
      }
      bloques.push({ tipo: "lista", texto: items.join("\n"), items });
      continue;
    }

    // Imagen markdown ![alt](url)
    const img = linea.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (img) {
      numerador.figuras++;
      bloques.push({
        tipo: "figura",
        texto: img[1] || "Imagen",
        numero: `Figura ${numerador.figuras}`,
        raw: img[2],
        lang: "imagen",
        id: `${prefijoId}-fig-${numerador.figuras}`,
      });
      i++;
      continue;
    }

    // Cita en bloque (> ...)
    if (linea.startsWith(">")) {
      const buf: string[] = [linea.replace(/^>\s?/, "")];
      i++;
      while (i < lineas.length && lineas[i].trim().startsWith(">")) {
        buf.push(lineas[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      bloques.push({ tipo: "cita_bloque", texto: buf.join(" ") });
      continue;
    }

    // Párrafo (acumula líneas hasta encontrar línea vacía o estructura nueva)
    const buf: string[] = [linea];
    i++;
    while (i < lineas.length) {
      const l = lineas[i].trim();
      if (!l) break;
      if (/^#{1,4}\s/.test(l)) break;
      if (/^```/.test(l)) break;
      if (isTablaRow(l)) break;
      if (/^[-*]\s/.test(l)) break;
      if (/^\d+\.\s/.test(l)) break;
      if (l.startsWith(">")) break;
      buf.push(l);
      i++;
    }
    bloques.push({ tipo: "parrafo", texto: buf.join(" ") });
  }

  return bloques;
}

function extraerCaptionFigura(contenido: string): string | undefined {
  // Buscar \caption{...} en LaTeX/TikZ
  const cap = contenido.match(/\\caption\s*\{([^}]+)\}/);
  if (cap) return cap[1].trim();
  // Buscar primer comentario como caption
  const com = contenido.match(/%\s*(.+)/);
  if (com) return com[1].trim();
  return undefined;
}

/**
 * Genera el índice de capítulos a partir de los bloques ya numerados.
 */
export interface EntradaIndice {
  numero: string;
  texto: string;
  id: string;
  nivel: number;        // 1=capítulo, 2=sección, 3=subsección
  faseId?: string;
}

export function generarIndice(
  bloques: BloqueNumerado[],
  faseId?: string,
): EntradaIndice[] {
  const entradas: EntradaIndice[] = [];
  for (const b of bloques) {
    if (b.tipo === "h1" || b.tipo === "h2" || b.tipo === "h3") {
      if (!b.numero || !b.id) continue;
      entradas.push({
        numero: b.numero,
        texto: b.texto,
        id: b.id,
        nivel: b.tipo === "h1" ? 1 : b.tipo === "h2" ? 2 : 3,
        faseId,
      });
    }
  }
  return entradas;
}

export type { CitaDetectada };
