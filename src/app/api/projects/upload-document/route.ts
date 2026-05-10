/**
 * POST /api/projects/upload-document
 *
 * Recibe un archivo (PDF/TXT/MD/CSV/TSV o audio mp3/m4a/wav/ogg/webm) y un
 * proyecto_id via multipart/form-data.
 *
 * - Documentos de texto: extrae el contenido con rag-processor y lo guarda
 *   en academic_context.documentos como material prioritario para las fases.
 * - Audio: transcribe con Gemini, estructura las observaciones por capítulo,
 *   guarda como documento + retorna la transcripción para que el estudiante
 *   pueda revisar/editar antes de aplicarla como feedback de fase.
 *
 * Límites: 1 archivo por petición, máx. 25 MB para audio, 10 MB para texto.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto, dbUpdateProyecto } from "@/lib/db";
import { procesarDocumento } from "@/lib/ai/rag-processor";
import { transcribirAudio, isAudioExtension, mimeTypeFromExtension } from "@/lib/ai/transcribeAudio";

const MAX_BYTES = 10 * 1024 * 1024;        // 10 MB para texto
const MAX_BYTES_AUDIO = 25 * 1024 * 1024;  // 25 MB para audio (~10 min mp3 calidad media)

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

    const isAudio = isAudioExtension(file.name);
    const limit = isAudio ? MAX_BYTES_AUDIO : MAX_BYTES;
    const limitMB = isAudio ? 25 : 10;

    if (file.size > limit) {
      return NextResponse.json(
        { error: `El archivo supera el límite de ${limitMB} MB (${(file.size / 1024 / 1024).toFixed(1)} MB)` },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    const accepted = ["pdf", "txt", "md", "csv", "tsv", "mp3", "m4a", "wav", "ogg", "webm", "flac", "aac", "mp4"];
    if (!accepted.includes(ext ?? "")) {
      return NextResponse.json(
        { error: "Formato no soportado. Aceptamos PDF, TXT, MD, CSV, TSV (texto) y MP3, M4A, WAV, OGG, WEBM (audio)." },
        { status: 400 }
      );
    }

    // ── Audio: transcribir con Gemini ─────────────────────────────────────
    if (isAudio) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const mimeType = file.type || mimeTypeFromExtension(file.name);
        const result = await transcribirAudio(buffer, mimeType);

        // Guardar la transcripción como documento dentro del proyecto
        const doc = {
          nombre: `[AUDIO] ${file.name}`,
          tipo: "audio_transcripcion",
          texto: `${result.textoEstructurado}\n\n--- Transcripción literal ---\n${result.textoPlano}`,
          palabras: (result.textoEstructurado + " " + result.textoPlano).split(/\s+/).filter(Boolean).length,
          truncado: false,
        };

        const updated = await storeDocument(proyecto_id, user.id, doc);
        if (!updated) {
          return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
        }

        return NextResponse.json({
          ok: true,
          esAudio: true,
          documento: {
            nombre: doc.nombre,
            tipo: doc.tipo,
            palabras: doc.palabras,
            truncado: false,
          },
          transcripcion: {
            estructurada: result.textoEstructurado,
            literal: result.textoPlano,
            modelo: result.modeloUsado,
          },
        });
      } catch (audioErr) {
        console.error("[upload-document/audio]", audioErr);
        return NextResponse.json(
          { error: `No se pudo transcribir el audio: ${(audioErr as Error).message}` },
          { status: 500 }
        );
      }
    }

    // ── Documento de texto: flujo original ─────────────────────────────────
    const doc = await procesarDocumento(file, file.name);

    const updated = await storeDocument(proyecto_id, user.id, doc);
    if (!updated) {
      return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      esAudio: false,
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
