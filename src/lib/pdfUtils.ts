// Text extraction utilities for uploaded user documents.
// PDF parsing requires an external library (e.g. pdf-parse) not included by default.
// Currently supports .txt and .md files natively. For PDFs, the user must paste the text.

/**
 * Extracts readable text from an uploaded document buffer.
 * Returns the extracted text or a message asking the user to paste it manually.
 */
export async function extraerTextoDocumento(
  buffer: ArrayBuffer,
  nombre: string,
  tipoMime: string
): Promise<{ texto: string; advertencia?: string }> {
  const ext = nombre.split(".").pop()?.toLowerCase() ?? "";

  if (tipoMime === "text/plain" || ext === "txt" || ext === "md") {
    const texto = new TextDecoder("utf-8").decode(buffer);
    return { texto };
  }

  if (ext === "pdf" || tipoMime === "application/pdf") {
    // pdf-parse or pdfjs-dist would be needed here.
    // For now, return an instruction to paste the text manually.
    return {
      texto: "",
      advertencia:
        "Archivos PDF no pueden procesarse automáticamente sin la librería pdf-parse. " +
        "Por favor, copia y pega el texto del documento en el campo 'contenido_extraido'.",
    };
  }

  return {
    texto: "",
    advertencia: `Formato "${ext}" no soportado. Solo se aceptan .txt, .md o texto pegado directamente.`,
  };
}

/**
 * Splits a long text into chunks for sending to AI within token limits.
 * Roughly 1 token ≈ 4 characters for Spanish text.
 */
export function trocearTexto(texto: string, maxChars = 12000): string[] {
  if (texto.length <= maxChars) return [texto];

  const chunks: string[] = [];
  let i = 0;
  while (i < texto.length) {
    const end = Math.min(i + maxChars, texto.length);
    // Try to break at a paragraph boundary
    const slice = texto.slice(i, end);
    const lastBreak = slice.lastIndexOf("\n\n");
    const cutAt = lastBreak > maxChars * 0.5 ? lastBreak : slice.length;
    chunks.push(slice.slice(0, cutAt).trim());
    i += cutAt;
  }
  return chunks.filter(Boolean);
}
