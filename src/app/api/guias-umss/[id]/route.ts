/**
 * Endpoint que sirve el contenido binario de una guía UMSS oficial.
 *
 * URL SIN extensión .pdf intencionalmente — extensiones del navegador
 * como TeraBox, IDM, etc. detectan URLs `.pdf` y las interceptan
 * (responden 204 vacío o las descargan automáticamente). Sirviendo
 * desde `/api/guias-umss/[id]` esquivamos completamente esa detección.
 *
 * GET /api/guias-umss/guia1  → PDF binario de la Guía 1 Posgrado FCE
 * GET /api/guias-umss/guia2  → PDF binario de la Guía 2 Céspedes Tapia
 */

import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

const GUIAS: Record<string, { archivo: string; titulo: string }> = {
  guia1: {
    archivo: "umss-guia1-posgrado-fce-2024.pdf",
    titulo: "Guía Posgrado FCE UMSS (Sept 2024) — Doble Titulación",
  },
  guia2: {
    archivo: "umss-guia2-cespedes-tapia.pdf",
    titulo: "Estilo Céspedes Tapia (Guía 2 UMSS — versión extendida)",
  },
};

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guia = GUIAS[id];

  if (!guia) {
    return NextResponse.json({ error: "Guía no encontrada" }, { status: 404 });
  }

  const url = new URL(_req.url);
  const formato = url.searchParams.get("formato") ?? "json";
  const filePath = path.join(process.cwd(), "public", "guias-umss", guia.archivo);

  try {
    const buffer = await readFile(filePath);

    // Modo "raw": devuelve el PDF binario (para botón de descarga).
    if (formato === "raw") {
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Length": String(buffer.length),
          "Content-Disposition": `attachment; filename="${guia.archivo}"`,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // Modo "json" (default): devuelve el PDF como base64 dentro de JSON.
    // Esto es CRITICO para esquivar extensiones como TeraBox que detectan
    // CUALQUIER response con Content-Type: application/pdf y la reemplazan
    // por 204 vacío. JSON pasa sin que TeraBox lo toque.
    const base64 = buffer.toString("base64");
    return NextResponse.json(
      {
        titulo: guia.titulo,
        archivo: guia.archivo,
        bytes: buffer.length,
        // El PDF entero como base64. El cliente lo decodifica a Uint8Array
        // y lo pasa a PDF.js como `{data: bytes}`.
        data_base64: base64,
      },
      {
        status: 200,
        headers: { "Cache-Control": "public, max-age=86400" },
      },
    );
  } catch (e) {
    return NextResponse.json(
      {
        error: "No se pudo leer el archivo de la guía",
        detalle: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}
