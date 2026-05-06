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
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { getProyecto, updateProyecto } from "@/lib/memoryStore";
import { procesarDocumento } from "@/lib/ai/rag-processor";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function storeDocumentInMemory(proyecto_id: string, userId: string, doc: {
  nombre: string;
  tipo: string;
  texto: string;
  palabras: number;
  truncado: boolean;
}) {
  const proyecto = getProyecto(proyecto_id);
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

  return updateProyecto(proyecto_id, {
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

    if (!isSupabaseConfigured()) {
      const updated = storeDocumentInMemory(proyecto_id, user.id, doc);
      if (!updated) {
        return NextResponse.json(
          { error: "Proyecto no encontrado o sin acceso" },
          { status: 404 }
        );
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
    }

    const db = createAdminClient();

    // Verificar que el proyecto pertenece al usuario
    const { data: proyecto, error: errP } = await db
      .from("proyectos_fases")
      .select("id, datos_fase_0")
      .eq("id", proyecto_id)
      .eq("usuario_id", user.id)
      .single();

    if (errP || !proyecto) {
      return NextResponse.json(
        { error: "Proyecto no encontrado o sin acceso" },
        { status: 404 }
      );
    }

    // Acumular en datos_fase_0.documentos (JSON)
    const datosActuales = (proyecto.datos_fase_0 as Record<string, unknown>) ?? {};
    const docsActuales  = (datosActuales.documentos as unknown[]) ?? [];

    const nuevosDatos = {
      ...datosActuales,
      documentos: [
        ...docsActuales,
        {
          nombre:   doc.nombre,
          tipo:     doc.tipo,
          texto:    doc.texto,
          palabras: doc.palabras,
          truncado: doc.truncado,
          subido_at: new Date().toISOString(),
        },
      ],
    };

    const { error: errUpdate } = await db
      .from("proyectos_fases")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ datos_fase_0: nuevosDatos as any })
      .eq("id", proyecto_id);

    if (errUpdate) {
      const updated = storeDocumentInMemory(proyecto_id, user.id, doc);
      if (!updated) {
        return NextResponse.json({ error: "Error al guardar el documento" }, { status: 500 });
      }
    }

    return NextResponse.json({
      ok: true,
      documento: {
        nombre:   doc.nombre,
        tipo:     doc.tipo,
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
