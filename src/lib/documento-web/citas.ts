/**
 * Detección y formato de citas dentro del cuerpo del documento.
 *
 * Soporta:
 *   - APA inline: (Pérez, 2023), (López & Mamani, 2022), (García et al., 2024)
 *   - APA en flujo: Pérez (2023) sostiene...
 *   - Numérica IEEE/ISO: [1], [2-4], [1, 3, 5]
 *
 * La detección genera una lista de citas únicas para construir la
 * bibliografía consolidada al final del documento.
 */

export interface CitaDetectada {
  /** Texto literal de la cita como aparece (ej. "(Pérez, 2023)"). */
  raw: string;
  /** Estilo detectado. */
  estilo: "apa_parentesis" | "apa_flujo" | "numerica";
  /** Autores (best-effort, para APA). */
  autores?: string;
  /** Año (para APA). */
  ano?: string;
  /** Números de referencia (para numérica). */
  numeros?: number[];
  /** Posición en el texto donde aparece. */
  inicio: number;
  fin: number;
}

const REGEX_APA_PARENTESIS = /\(([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s*(?:&|y)\s*[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?(?:\s+et\s+al\.)?)\s*,\s*(\d{4}[a-z]?)\)/g;
const REGEX_APA_FLUJO = /([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+et\s+al\.)?)\s*\((\d{4}[a-z]?)\)/g;
const REGEX_NUMERICA = /\[(\d+(?:\s*[,-]\s*\d+)*)\]/g;

/**
 * Encuentra todas las citas en un texto. NO modifica el texto, solo retorna
 * las coincidencias para que el render pueda destacarlas con styling.
 */
export function detectarCitas(texto: string): CitaDetectada[] {
  const citas: CitaDetectada[] = [];

  for (const m of texto.matchAll(REGEX_APA_PARENTESIS)) {
    citas.push({
      raw: m[0],
      estilo: "apa_parentesis",
      autores: m[1].trim(),
      ano: m[2].trim(),
      inicio: m.index ?? 0,
      fin: (m.index ?? 0) + m[0].length,
    });
  }
  for (const m of texto.matchAll(REGEX_APA_FLUJO)) {
    // Evitar dobles si ya capturó la versión parentesis (overlap)
    const inicio = m.index ?? 0;
    if (citas.some((c) => c.inicio <= inicio && c.fin >= inicio + m[0].length)) continue;
    citas.push({
      raw: m[0],
      estilo: "apa_flujo",
      autores: m[1].trim(),
      ano: m[2].trim(),
      inicio,
      fin: inicio + m[0].length,
    });
  }
  for (const m of texto.matchAll(REGEX_NUMERICA)) {
    const partes = m[1].split(/[,-]/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    if (partes.length === 0) continue;
    citas.push({
      raw: m[0],
      estilo: "numerica",
      numeros: partes,
      inicio: m.index ?? 0,
      fin: (m.index ?? 0) + m[0].length,
    });
  }

  return citas.sort((a, b) => a.inicio - b.inicio);
}

/**
 * Resume las citas únicas para construir la bibliografía. Para APA, agrupa
 * por (autor + año). Para numérica, agrupa por número.
 */
export interface CitaUnica {
  clave: string;          // ej. "Pérez_2023" o "ref-1"
  texto_display: string;  // texto a mostrar en bibliografía si no hay entrada formal
  estilo: CitaDetectada["estilo"];
  autores?: string;
  ano?: string;
  numero?: number;
  /** Cuántas veces aparece en el documento. */
  apariciones: number;
}

export function consolidarCitas(citas: CitaDetectada[]): CitaUnica[] {
  const mapa = new Map<string, CitaUnica>();
  for (const c of citas) {
    let clave: string;
    let display: string;
    if (c.estilo === "numerica") {
      for (const n of c.numeros ?? []) {
        clave = `ref-${n}`;
        if (!mapa.has(clave)) {
          mapa.set(clave, {
            clave,
            texto_display: `[${n}] Referencia ${n} (definir fuente bibliográfica)`,
            estilo: "numerica",
            numero: n,
            apariciones: 0,
          });
        }
        mapa.get(clave)!.apariciones++;
      }
      continue;
    }
    clave = `${c.autores}_${c.ano}`;
    display = `${c.autores} (${c.ano}). Título de la fuente. Editorial / Revista, volumen(número), páginas.`;
    if (!mapa.has(clave)) {
      mapa.set(clave, {
        clave,
        texto_display: display,
        estilo: c.estilo,
        autores: c.autores,
        ano: c.ano,
        apariciones: 0,
      });
    }
    mapa.get(clave)!.apariciones++;
  }
  return Array.from(mapa.values()).sort((a, b) => {
    if (a.numero !== undefined && b.numero !== undefined) return a.numero - b.numero;
    return (a.autores ?? a.clave).localeCompare(b.autores ?? b.clave, "es");
  });
}

/**
 * Inyecta HTML alrededor de las citas para resaltarlas visualmente.
 * Mantiene el texto original intacto, solo envuelve con <cite class="...">.
 */
export function resaltarCitasEnTexto(texto: string): string {
  const citas = detectarCitas(texto);
  if (citas.length === 0) return texto;
  // Reemplazar de atrás hacia adelante para no invalidar índices.
  const ordenadas = [...citas].sort((a, b) => b.inicio - a.inicio);
  let resultado = texto;
  for (const c of ordenadas) {
    const antes = resultado.slice(0, c.inicio);
    const despues = resultado.slice(c.fin);
    const envuelto = `<cite class="cita-doc" data-estilo="${c.estilo}">${escapeHtml(c.raw)}</cite>`;
    resultado = antes + envuelto + despues;
  }
  return resultado;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
