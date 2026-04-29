// Validation helpers for the monograph generation system.

export interface CitaRegistrada {
  autor: string;
  ano?: number;
  titulo_obra: string;
  formato_apa?: string;
  capitulo?: number;
}

// ─── Coherence ────────────────────────────────────────────────────────────────

/**
 * Checks that theories mentioned in Cap. I appear in Cap. II.
 */
export function validarCoherenciaCapitulos(caps: {
  cap1?: Record<string, unknown>;
  cap2?: Record<string, unknown>;
}): { valido: boolean; advertencias: string[] } {
  const advertencias: string[] = [];

  if (caps.cap1 && caps.cap2) {
    const teoriasCap1 = (caps.cap1?.teorias_identificadas as string[]) ?? [];
    const teoriasCap2 = (caps.cap2?.teorias_desarrolladas as string[]) ?? [];

    for (const t of teoriasCap1) {
      if (!teoriasCap2.some(t2 => t2.toLowerCase().includes(t.toLowerCase()))) {
        advertencias.push(`Teoría "${t}" del Cap. I no está desarrollada en Cap. II`);
      }
    }

    const objCap1 = (caps.cap1?.objetivos_especificos as string[]) ?? [];
    const secsCap4 = (caps.cap2?.secciones_cap4 as string[]) ?? [];
    if (objCap1.length > 0 && secsCap4.length > 0 && objCap1.length !== secsCap4.length) {
      advertencias.push(
        `Cap. I tiene ${objCap1.length} objetivos específicos pero Cap. IV tiene ${secsCap4.length} secciones`
      );
    }
  }

  return { valido: advertencias.length === 0, advertencias };
}

// ─── Anti-hallucination ───────────────────────────────────────────────────────

/**
 * Flags obvious signs of fabricated content.
 */
export function detectarAlucinaciones(texto: string): { limpio: boolean; alertas: string[] } {
  const alertas: string[] = [];

  // Example/placeholder URLs
  if (/https?:\/\/[^\s]*(ejemplo|fake|test|placeholder|lorem|example\.com)/i.test(texto)) {
    alertas.push("URL de ejemplo o falsa detectada en el texto");
  }

  // Suspiciously generic author names
  if (/\(Autor,?\s*\d{4}\)/i.test(texto) || /\(N\.A\.,?\s*\d{4}\)/i.test(texto)) {
    alertas.push("Cita con autor genérico ('Autor', 'N.A.') detectada");
  }

  // Future years beyond reasonable range
  const currentYear = new Date().getFullYear();
  const futureYears = texto.match(/\b(20[3-9]\d|2[1-9]\d{2})\b/g) ?? [];
  if (futureYears.some(y => parseInt(y) > currentYear + 1)) {
    alertas.push(`Año futuro detectado en citas: ${futureYears.join(", ")}`);
  }

  return { limpio: alertas.length === 0, alertas };
}

// ─── Citation validation ──────────────────────────────────────────────────────

/**
 * Ensures every citation used in the text is present in the bibliography,
 * and flags bibliography entries never cited.
 */
export function validarCitasEnBibliografia(
  citasUsadas: string[],
  bibliografiaFinal: CitaRegistrada[]
): { valido: boolean; faltantes: string[]; sobrantes: string[] } {
  const enBiblio = bibliografiaFinal.map(c => `${c.autor} ${c.ano ?? ""}`.toLowerCase());

  const faltantes = citasUsadas.filter(
    cu => !enBiblio.some(b => b.includes(cu.toLowerCase()))
  );
  const sobrantes = bibliografiaFinal
    .filter(b => !citasUsadas.some(cu => `${b.autor} ${b.ano ?? ""}`.toLowerCase().includes(cu.toLowerCase())))
    .map(b => `${b.autor} (${b.ano})`);

  return { valido: faltantes.length === 0, faltantes, sobrantes };
}

// ─── APA 7 formatting ────────────────────────────────────────────────────────

/**
 * Generates an APA 7 citation string from author components.
 */
export function formatoAPA7(
  autor: string,
  ano: number,
  titulo: string,
  fuente: string,
  tipo: string = "libro"
): string {
  const parts = autor.split(",");
  const apellido = parts[0]?.trim() ?? autor;
  const inicialNombre = parts[1]?.trim().charAt(0);
  const inicial = inicialNombre ? `${inicialNombre}.` : "";
  const autorFmt = inicial ? `${apellido}, ${inicial}` : apellido;

  switch (tipo) {
    case "paper":
    case "journal":
    case "articulo":
      return `${autorFmt} (${ano}). ${titulo}. *${fuente}*.`;
    case "tesis":
      return `${autorFmt} (${ano}). *${titulo}* [Tesis de grado]. ${fuente}.`;
    case "web":
      return `${autorFmt} (${ano}). ${titulo}. Recuperado de ${fuente}`;
    default:
      return `${autorFmt} (${ano}). *${titulo}*. ${fuente}.`;
  }
}
