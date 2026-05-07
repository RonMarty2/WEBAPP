/**
 * POST /api/projects/upload-document
 *
 * Recibe un archivo (PDF o TXT) y un proyecto_id via multipart/form-data.
 * Extrae el texto con rag-processor y lo almacena en datos_fase_0.documentos
 * del proyecto (como contexto adicional para las fases de IA).
 *
 * Límites: 1 archivo por petición, máx. 10 MB.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto, dbUpdateProyecto } from "@/lib/db";
import { procesarDocumento } from "@/lib/ai/rag-processor";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

async function storeDocument(proyecto_id: string, userId: string, doc: {
  nombre: string;
  tipo: string;
  texto: string;
  palabras: number;
  truncado: boolean;
}) {
  const proyecto = await dbGetProyecto(proyecto_id);
  if (!proyecto || proyecto.usuario_id !== userId) return null;

  const academicContext = (proyecto.academic_context ?? {}) as Record<string, unknown>;
  const docsActuales = Array.isArray(academicContext.documentos)
    ? academicContext.documentos as unknown[]
    : [];
  const documento = {
    nombre: doc.nombre,
    tipo: doc.tipo,
    texto: doc.texto,
    palabras: doc.palabras,
    truncado: doc.truncado,
    subido_at: new Date().toISOString(),
  };

  return dbUpdateProyecto(proyecto_id, {
    academic_context: {
      ...academicContext,
      documentos: [...docsActuales, documento],
    },
  });
}

export async function POST(req: Request) {
  try {
    const { user } = await requireAuth();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const proyecto_id = formData.get("proyecto_id") as string | null;

    if (!file || !proyecto_id) {
      return NextResponse.json(
        { error: "Se requieren los campos 'file' y 'proyecto_id'" },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `El archivo supera el límite de 10 MB (${(file.size / 1024 / 1024).toFixed(1)} MB)` },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "txt", "md", "csv", "tsv"].includes(ext ?? "")) {
      return NextResponse.json(
        { error: "Solo se aceptan archivos PDF, TXT, Markdown, CSV o TSV por ahora." },
        { status: 400 }
      );
    }

    // Extraer texto del documento una sola vez y guardarlo como material prioritario.
    const doc = await procesarDocumento(file, file.name);

    const updated = await storeDocument(proyecto_id, user.id, doc);
    if (!updated) {
      return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      documento: {
        nombre: doc.nombre,
        tipo: doc.tipo,
        palabras: doc.palabras,
        truncado: doc.truncado,
      },
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[upload-document]", e);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
