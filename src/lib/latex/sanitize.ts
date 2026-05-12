/**
 * Saneamiento defensivo del LaTeX generado por la IA antes de armar el ZIP.
 *
 * Problema que resuelve:
 *   La IA puede dejar referencias \includegraphics{archivo} apuntando a
 *   archivos que NO existen en el paquete (porque el estudiante no subió
 *   imágenes y la IA tampoco las genera). Al subir el ZIP a Overleaf, el
 *   compilador falla con "File not found".
 *
 * Estrategia:
 *   1. Listar todos los archivos disponibles en el ZIP (ej. logo-universidad.png).
 *   2. Escanear el .tex buscando \includegraphics[...]{nombre}.
 *   3. Para cada match cuyo `nombre` no existe entre los disponibles:
 *      - Si está dentro de un \begin{figure}...\end{figure}: eliminar el bloque
 *        completo y reemplazar por un comentario LaTeX explicativo.
 *      - Si está suelto: comentar la línea.
 *   4. Devolver el .tex limpio + la lista de huérfanos eliminados (para
 *      poder reportárselo al usuario en el README / response).
 *
 * NOTA: NO toca \listoffigures ni \addcontentsline{lof}{...}. Si quedan
 * entradas en la lista de figuras sin destino, Overleaf no falla — solo
 * mostrará una página de "Índice de Figuras" más corta o vacía.
 */

export interface SanitizeResult {
  /** El .tex limpio, sin includegraphics huérfanos. */
  tex: string;
  /** Lista de nombres de archivos a los que apuntaba el .tex pero no existen. */
  orphans: string[];
}

/** Escapa un string para usarlo dentro de una RegExp como literal. */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normaliza un nombre de archivo para comparación tolerante:
 * - lowercase
 * - quita extensión (Overleaf/LaTeX permite omitir la extensión)
 */
function normalizeName(name: string): { full: string; stem: string } {
  const lower = name.trim().toLowerCase();
  const stem = lower.replace(/\.[a-z0-9]+$/i, "");
  return { full: lower, stem };
}

/**
 * Sanea el .tex eliminando referencias \includegraphics a archivos que no
 * están disponibles en el paquete.
 *
 * @param tex            Código LaTeX completo.
 * @param availableFiles Lista de archivos (con extensión) que SÍ van al ZIP.
 *                       Ej: ["logo-universidad.png"].
 */
export function sanitizeOrphanIncludes(
  tex: string,
  availableFiles: readonly string[],
): SanitizeResult {
  if (!tex || !tex.includes("\\includegraphics")) {
    return { tex, orphans: [] };
  }

  // Set de nombres disponibles, con y sin extensión, en minúsculas.
  const available = new Set<string>();
  for (const f of availableFiles) {
    const { full, stem } = normalizeName(f);
    available.add(full);
    available.add(stem);
  }

  // 1) Detectar huérfanos.
  const includeRe = /\\includegraphics(?:\s*\[[^\]]*\])?\s*\{([^}]+)\}/g;
  const orphanSet = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = includeRe.exec(tex)) !== null) {
    const ref = m[1].trim();
    const { full, stem } = normalizeName(ref);
    if (!available.has(full) && !available.has(stem)) {
      orphanSet.add(ref);
    }
  }

  if (orphanSet.size === 0) {
    return { tex, orphans: [] };
  }

  // 2) Para cada huérfano: eliminar el bloque figure que lo contiene, o
  //    comentar la línea si está suelto.
  let result = tex;
  const orphans = Array.from(orphanSet);
  for (const name of orphans) {
    const escaped = escapeRegExp(name);
    const incToken = `\\\\includegraphics(?:\\s*\\[[^\\]]*\\])?\\s*\\{${escaped}\\}`;

    // Intentar eliminar el bloque \begin{figure}...\end{figure} completo.
    const figureBlockRe = new RegExp(
      `\\\\begin\\{figure\\}(?:\\[[^\\]]*\\])?[\\s\\S]*?${incToken}[\\s\\S]*?\\\\end\\{figure\\}`,
      "g",
    );
    const before = result;
    result = result.replace(
      figureBlockRe,
      `% [auto] Figura omitida: el archivo "${name}" no estaba incluido en el paquete.`,
    );

    // Si no estaba dentro de un figure (raro pero posible), comentar la línea suelta.
    if (result === before) {
      const looseRe = new RegExp(incToken, "g");
      result = result.replace(
        looseRe,
        `% [auto] \\includegraphics omitido — archivo "${name}" no disponible`,
      );
    }
  }

  return { tex: result, orphans };
}
