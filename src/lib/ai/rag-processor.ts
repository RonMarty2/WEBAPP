/**
 * RAG Processor
 * Recibe documentos (PDF / TXT), extrae el texto y lo formatea
 * como contexto listo para inyectar en los prompts maestros.
 */

export interface DocumentoExtraido {
  nombre: string;
  tipo: "pdf" | "txt" | "otro";
  texto: string;
  palabras: number;
  truncado: boolean;
}

export interface ContextoRAG {
  documentos: DocumentoExtraido[];
  texto_combinado: string;
  total_palabras: number;
}

const MAX_PALABRAS_POR_DOC = 2_000;
const MAX_PALABRAS_TOTAL   = 6_000;

// ── Extractor TXT ─────────────────────────────────────────────

function extraerTXT(buffer: ArrayBuffer): string {
  return new TextDecoder("utf-8").decode(buffer);
}

// ── Extractor PDF ─────────────────────────────────────────────

async function extraerPDF(buffer: ArrayBuffer): Promise<string> {
  // Import dinámico para evitar bundling en el cliente
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = await import("pdf-parse") as any;
  const pdfParse = mod.default ?? mod;
  const data = await pdfParse(Buffer.from(buffer));
  return data.text ?? "";
}

// ── Limpieza de texto ─────────────────────────────────────────

function limpiar(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function truncarPalabras(texto: string, maxPalabras: number): [string, boolean] {
  const partes = texto.split(/\s+/).filter(Boolean);
  if (partes.length <= maxPalabras) return [texto, false];
  return [partes.slice(0, maxPalabras).join(" ") + " …", true];
}

// ── API pública ───────────────────────────────────────────────

/** Procesa un File y retorna el texto extraído listo para RAG. */
export async function procesarDocumento(file: File, nombre: string): Promise<DocumentoExtraido> {
  const buffer = await file.arrayBuffer();
  const ext = nombre.split(".").pop()?.toLowerCase() ?? "";

  let textoRaw = "";
  let tipo: DocumentoExtraido["tipo"] = "otro";

  try {
    if (ext === "pdf") {
      tipo = "pdf";
      textoRaw = await extraerPDF(buffer);
    } else if (ext === "txt") {
      tipo = "txt";
      textoRaw = extraerTXT(buffer);
    } else {
      // intento como texto plano
      textoRaw = extraerTXT(buffer);
    }
  } catch {
    textoRaw = `[No se pudo extraer el texto de "${nombre}"]`;
  }

  const limpio = limpiar(textoRaw);
  const [texto, truncado] = truncarPalabras(limpio, MAX_PALABRAS_POR_DOC);

  return {
    nombre,
    tipo,
    texto,
    palabras: texto.split(/\s+/).filter(Boolean).length,
    truncado,
  };
}

/** Combina varios archivos en un ContextoRAG listo para el prompt. */
export async function construirContextoRAG(archivos: File[]): Promise<ContextoRAG> {
  const documentos: DocumentoExtraido[] = [];
  let acumuladas = 0;

  for (const archivo of archivos) {
    if (acumuladas >= MAX_PALABRAS_TOTAL) break;
    const doc = await procesarDocumento(archivo, archivo.name);
    documentos.push(doc);
    acumuladas += doc.palabras;
  }

  const bloques = documentos.map(
    (d, i) => `[DOCUMENTO ${i + 1}: ${d.nombre}]\n${d.texto}`
  );

  const texto_combinado = bloques.length
    ? `=== CONTEXTO DE DOCUMENTOS ===\n\n${bloques.join("\n\n---\n\n")}\n\n=== FIN CONTEXTO ===`
    : "";

  return { documentos, texto_combinado, total_palabras: acumuladas };
}

/** Formatea el contexto RAG para insertar en un prompt string. */
export function formatearContextoParaPrompt(ctx: ContextoRAG): string {
  return ctx.texto_combinado ? `\n\n${ctx.texto_combinado}\n\n` : "";
}
