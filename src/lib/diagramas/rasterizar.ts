/**
 * Rasteriza un SVG a PNG (data URI) usando Canvas del navegador.
 *
 * ¿Por qué? La descarga a Word es HTML; aunque Word moderno entiende SVG
 * inline, NO todas las versiones lo hacen. Un `<img>` PNG, en cambio, lo
 * abre cualquier Word (y Google Docs) sin fallar. Como el export ocurre en
 * el cliente, aquí sí hay Canvas disponible para convertir.
 *
 * Es el mismo patrón que ya usa el documento-web para las imágenes subidas
 * por el estudiante (`<img src="data:image/png...">`). Devuelve `null` si
 * algo falla (sin DOM, SVG inválido, etc.) y el llamador cae al SVG inline.
 */

/** Convierte un string SVG a un PNG data URI. `null` si no se puede. */
export async function svgAPng(svg: string, escala = 2): Promise<string | null> {
  if (typeof window === "undefined" || typeof document === "undefined") return null;

  // El SVG de pantalla usa width="100%"; para rasterizar necesitamos un
  // tamaño intrínseco fijo, que sacamos del viewBox.
  const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const W = vb ? parseFloat(vb[1]) : 640;
  const H = vb ? parseFloat(vb[2]) : 400;
  const svgFijo = svg.replace(/width="100%"/, `width="${W}" height="${H}"`);

  return new Promise<string | null>((resolve) => {
    try {
      const blob = new Blob([svgFijo], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(W * escala));
          canvas.height = Math.max(1, Math.round(H * escala));
          const ctx = canvas.getContext("2d");
          if (!ctx) { resolve(null); return; }
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/png"));
        } catch {
          resolve(null);
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    } catch {
      resolve(null);
    }
  });
}
