/**
 * Helper para copiar HTML rico al portapapeles.
 *
 * Usa Clipboard API moderna (ClipboardItem con MIME text/html). Esto
 * permite que al pegar en Word/Google Docs se preserven negritas,
 * cursivas, tablas, listas, encabezados con jerarquía, etc. — todo el
 * formato visible.
 *
 * Si el navegador es viejo y no soporta ClipboardItem, cae a copiar
 * solo texto plano (mejor que nada).
 */

export interface ResultadoCopia {
  ok: boolean;
  modo: "html" | "texto" | "error";
  error?: string;
}

/**
 * Copia un fragmento HTML al portapapeles preservando formato.
 *
 * @param html  HTML completo con estilos inline.
 * @param textoPlano Versión texto plano como fallback (opcional).
 */
export async function copiarHTMLAlPortapapeles(
  html: string,
  textoPlano?: string,
): Promise<ResultadoCopia> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return { ok: false, modo: "error", error: "Tu navegador no soporta el portapapeles." };
  }

  const plano = textoPlano ?? htmlAPlano(html);

  // Vía moderna: ClipboardItem (mejor preservación de formato).
  if (typeof window !== "undefined" && "ClipboardItem" in window) {
    try {
      const items = {
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plano], { type: "text/plain" }),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ClipboardItemCtor = (window as any).ClipboardItem;
      await navigator.clipboard.write([new ClipboardItemCtor(items)]);
      return { ok: true, modo: "html" };
    } catch (e) {
      // Si falla (permisos, contexto inseguro, etc.), caemos al fallback.
      console.warn("[copiar-html] ClipboardItem falló, usando texto plano:", e);
    }
  }

  // Fallback: solo texto.
  try {
    await navigator.clipboard.writeText(plano);
    return { ok: true, modo: "texto" };
  } catch (e) {
    return {
      ok: false,
      modo: "error",
      error: e instanceof Error ? e.message : "Error desconocido al copiar.",
    };
  }
}

/**
 * Convierte HTML a texto plano legible (para fallback de copia).
 * Mantiene saltos de línea entre párrafos, listas y headers.
 */
export function htmlAPlano(html: string): string {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  }
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  // Reemplazar block elements con doble salto de línea.
  const blocks = tmp.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, tr");
  blocks.forEach((b) => {
    b.appendChild(document.createTextNode("\n"));
  });
  let texto = tmp.innerText || tmp.textContent || "";
  texto = texto.replace(/\n{3,}/g, "\n\n").trim();
  return texto;
}
