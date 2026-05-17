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

  const filePath = path.join(process.cwd(), "public", "guias-umss", guia.archivo);

  try {
    const buffer = await readFile(filePath);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(buffer.length),
        // Header genérico (no "attachment") para que PDF.js lo procese inline.
        // Usamos el nombre de archivo (ASCII) en filename + filename* RFC 5987
        // con el título humano UTF-8 encoded.
        "Content-Disposition": `inline; filename="${guia.archivo}"; filename*=UTF-8''${encodeURIComponent(guia.titulo + ".pdf")}`,
        // Cachear 1 día — el archivo es estático y rara vez cambia.
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: "No se pudo leer el archivo de la guía",
        detalle: e instanceof Error ? e.message : String(e),
        ruta_buscada: filePath,
      },
      { status: 500 },
    );
  }
}
