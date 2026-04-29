import { NextResponse } from "next/server";
import { addDocumento, getDocumentos } from "@/lib/memoryStore";
import { extraerTextoDocumento } from "@/lib/pdfUtils";

// POST /api/documentos — subir y procesar un documento
// Accepts multipart/form-data OR JSON with pre-extracted text
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await req.formData();
      const monografiaId = formData.get("monografia_id") as string;
      const capitulo = formData.get("capitulo_asignado");
      const file = formData.get("archivo") as File | null;

      if (!monografiaId || !file) {
        return NextResponse.json(
          { error: "monografia_id y archivo son requeridos" },
          { status: 400 }
        );
      }

      const buffer = await file.arrayBuffer();
      const { texto, advertencia } = await extraerTextoDocumento(
        buffer,
        file.name,
        file.type
      );

      const documento = addDocumento({
        monografia_id: monografiaId,
        nombre: file.name,
        tipo: file.type.includes("pdf") ? "pdf" : "txt",
        contenido_extraido: texto || undefined,
        capitulo_asignado: capitulo ? parseInt(String(capitulo), 10) : undefined,
        es_relevante: true,
      });

      return NextResponse.json({
        documento,
        advertencia: advertencia ?? null,
        texto_extraido: texto.slice(0, 500) || null,
      });

    } else {
      // Handle JSON with pre-pasted text
      const body = await req.json();
      const {
        monografia_id,
        nombre,
        tipo = "txt",
        contenido_extraido,
        capitulo_asignado,
        es_relevante = true,
      } = body;

      if (!monografia_id || !nombre || !contenido_extraido) {
        return NextResponse.json(
          { error: "monografia_id, nombre y contenido_extraido son requeridos" },
          { status: 400 }
        );
      }

      const documento = addDocumento({
        monografia_id,
        nombre,
        tipo,
        contenido_extraido,
        capitulo_asignado: capitulo_asignado ? parseInt(String(capitulo_asignado), 10) : undefined,
        es_relevante,
      });

      return NextResponse.json({ documento }, { status: 201 });
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/documentos?monografia_id=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const monografiaId = searchParams.get("monografia_id");

  if (!monografiaId) {
    return NextResponse.json({ error: "monografia_id requerido" }, { status: 400 });
  }

  const documentos = getDocumentos(monografiaId);
  return NextResponse.json({ documentos, total: documentos.length });
}
