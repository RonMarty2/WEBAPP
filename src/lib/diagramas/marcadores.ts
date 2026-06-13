/**
 * Puente con el marcador heredado [[ARBOL_PROBLEMAS]] ... [[/ARBOL_PROBLEMAS]].
 *
 * El prompt de Cap. I ya instruye a la IA a emitir el árbol de problemas con
 * ese marcador. Hasta ahora dependía de que OTRA llamada a IA lo reconvirtiera
 * a TikZ (frágil) y en pantalla/Word salía como texto crudo.
 *
 * `normalizarMarcadores` lo convierte a un bloque ```diagrama JSON ANTES de
 * parsear, así pasa por el render/export determinista (pantalla = Word = PDF)
 * sin tocar el prompt. Si un marcador viene mal, se deja intacto (cae al
 * comportamiento anterior). Idempotente y seguro: nunca lanza.
 */

import { type ArbolProblemasSpec, LIMITES } from "./tipos";

function limpiarItem(s: string): string {
  return s
    .replace(/^\s*[-*]\s+/, "")
    .replace(/^\[|\]$/g, "") // corchetes de plantilla, por si quedan
    .replace(/\*\*/g, "")
    .trim();
}

/** Extrae un ArbolProblemasSpec del contenido interno de un marcador. */
function parseInner(inner: string): ArbolProblemasSpec | null {
  const lineas = inner.split("\n");
  let problema = "";
  const efectos: string[] = [];
  const causas: string[] = [];
  let modo: "efectos" | "causas" | null = null;

  for (const raw of lineas) {
    const l = raw.trim();
    if (!l) continue;
    const mCentral = l.match(/^central\s*:\s*(.*)$/i);
    if (mCentral) { problema = limpiarItem(mCentral[1]); modo = null; continue; }
    if (/^(consecuencias|efectos)\s*:/i.test(l)) { modo = "efectos"; continue; }
    if (/^causas\s*:/i.test(l)) { modo = "causas"; continue; }
    const mItem = l.match(/^[-*]\s+(.*)$/);
    if (mItem) {
      const item = limpiarItem(mItem[1]);
      if (!item) continue;
      if (modo === "efectos" && efectos.length < LIMITES.arbolNodos) efectos.push(item);
      else if (modo === "causas" && causas.length < LIMITES.arbolNodos) causas.push(item);
    }
  }

  if (!problema || (efectos.length === 0 && causas.length === 0)) return null;
  return { tipo: "arbol-problemas", titulo: "Árbol de problemas", problema, causas, efectos };
}

const RE_MARCADOR = /\[\[ARBOL_PROBLEMAS\]\]([\s\S]*?)\[\[\/ARBOL_PROBLEMAS\]\]/gi;

/**
 * Convierte los marcadores [[ARBOL_PROBLEMAS]] en bloques ```diagrama JSON.
 * Si no hay marcador, devuelve el markdown tal cual (barato).
 */
export function normalizarMarcadores(markdown: string): string {
  if (typeof markdown !== "string" || !markdown.includes("[[ARBOL_PROBLEMAS]]")) {
    return markdown;
  }
  return markdown.replace(RE_MARCADOR, (completo, inner: string) => {
    const spec = parseInner(inner);
    if (!spec) return completo;
    return `\n\`\`\`diagrama\n${JSON.stringify(spec)}\n\`\`\`\n`;
  });
}
