/**
 * Limpieza del markdown ANTES del parser de numeración, para el documento
 * consolidado que ve el estudiante ("Ver mi documento").
 *
 * El sistema emite marcadores internos legítimos durante la generación
 * (notas editoriales, separadores, advertencias). El workspace los muestra
 * en su sección dedicada (SpecialPhaseView). El .tex final los elimina
 * (compilar-latex.ts). Esta función hace lo mismo para el documento web
 * legible: el estudiante NO debe ver ruido editorial en su tesis.
 *
 * Replica las mismas reglas que compilar-latex.ts (REGLA #0-BIS) para que
 * el documento web y el PDF queden alineados.
 */

const SEPARADORES_RE = /^[\s]*[─━═\-_*]{3,}[\s]*$/;

/**
 * Lista de encabezados internos a EXCISAR junto con su sección completa
 * (todo lo que va desde el header hasta el próximo header del mismo nivel
 * o superior). Match case-insensitive.
 */
const HEADERS_INTERNOS: RegExp[] = [
  /^#{1,4}\s+Referencias observadas(\s+que requieren verificaci[oó]n)?\b/i,
  /^#{1,4}\s+Resumen editorial\b/i,
  /^#{1,4}\s+Sugerencias para enriquecer\b/i,
  /^#{1,4}\s+Notas? interna(s)?\b/i,
  /^#{1,4}\s+REFERENCIAS_ETAPA\b/i,
];

/**
 * Marcadores en línea que se quitan SIN borrar la línea (solo el marcador).
 * "[dato a completar]" se PRESERVA (es honesto: el estudiante lo verá y
 * sabrá qué cifra debe poner). El resto del listado son marcadores que la
 * IA dejó por error y NO deben llegar al documento legible.
 */
const MARCADORES_INLINE: Array<[RegExp, string]> = [
  [/\[VERIFICAR\]/gi, ""],
  [/\[REVISAR\]/gi, ""],
  [/\[FALTA\s+[^\]]*\]/gi, ""],
  [/\[INSERTAR\s+(GR[ÁA]FICO|FIGURA|IMAGEN)[^\]]*\]/gi, ""],
  [/REFERENCIAS_ETAPA/g, ""],
  // "Falta el título completo del reporte" + variantes son notas internas.
  [/\b—\s*Falta el t[ií]tulo completo[^.\n]*\.?/gi, ""],
];

/**
 * Quita las secciones internas (header + cuerpo hasta el próximo header
 * de igual o mayor jerarquía). Devuelve el markdown limpio.
 */
function quitarSeccionesInternas(markdown: string): string {
  const lineas = markdown.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lineas.length) {
    const linea = lineas[i];
    const match = linea.match(/^(#{1,6})\s+/);
    if (match) {
      const nivel = match[1].length;
      const esInterno = HEADERS_INTERNOS.some((re) => re.test(linea));
      if (esInterno) {
        // Saltar este header y todo su contenido hasta encontrar un header
        // del mismo nivel o superior (más #).
        i++;
        while (i < lineas.length) {
          const sig = lineas[i].match(/^(#{1,6})\s+/);
          if (sig && sig[1].length <= nivel) break;
          i++;
        }
        continue;
      }
    }
    out.push(linea);
    i++;
  }
  return out.join("\n");
}

/** Quita separadores de cajas (─── ════ ---- ____) que la IA deja a veces. */
function quitarSeparadores(markdown: string): string {
  return markdown
    .split("\n")
    .filter((l) => !SEPARADORES_RE.test(l))
    .join("\n");
}

/** Aplica todos los reemplazos inline. */
function limpiarMarcadoresInline(markdown: string): string {
  let out = markdown;
  for (const [re, rep] of MARCADORES_INLINE) out = out.replace(re, rep);
  // Colapsa espacios dobles dejados por los reemplazos.
  return out.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n");
}

/**
 * Punto de entrada: limpia el markdown crudo de una fase antes de que el
 * parser de numeración lo procese para "Ver mi documento".
 */
export function limpiarParaDocumentoFinal(markdown: string): string {
  if (typeof markdown !== "string" || markdown.length === 0) return markdown;
  let out = quitarSeccionesInternas(markdown);
  out = quitarSeparadores(out);
  out = limpiarMarcadoresInline(out);
  return out.trim();
}
