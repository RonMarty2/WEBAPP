/**
 * Endpoint que sirve el contenido binario de una guía UNIFRANZ oficial.
 *
 * URL SIN extensión .pdf intencionalmente — extensiones del navegador
 * como TeraBox, IDM, etc. detectan URLs `.pdf` y las interceptan
 * (responden 204 vacío o las descargan automáticamente). Sirviendo
 * desde `/api/guias-unifranz/[id]` esquivamos completamente esa detección.
 *
 * GET /api/guias-unifranz/guia1  → PDF de la Guía UNIFRANZ Cochabamba 2017
 */

import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

const GUIAS: Record<string, { archivo: string; titulo: string }> = {
  guia1: {
    archivo: "unifranz-cba-guia-2017.pdf",
    titulo: "Guía de Organización y Presentación de Trabajos de Grado UNIFRANZ (Cochabamba, 2017)",
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
  const filePath = path.join(process.cwd(), "public", "guias-unifranz", guia.archivo);

  try {
    const buffer = await readFile(filePath);

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

    const base64 = buffer.toString("base64");
    return NextResponse.json(
      {
        titulo: guia.titulo,
        archivo: guia.archivo,
        bytes: buffer.length,
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
