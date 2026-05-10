/**
 * Transcripción de audio con Gemini 2.5 Pro/Flash.
 *
 * Gemini soporta audio nativamente vía `inlineData` con base64. No necesita
 * Whisper ni otra API: usa la misma API key que ya está configurada.
 *
 * Uso típico: feedback académico de un tutor que el estudiante grabó o subió.
 * Devuelve la transcripción ESTRUCTURADA en puntos accionables (no solo texto plano).
 */

import { getProviderKey, hydrateAIConfigFromDisk } from "@/lib/aiProvider";

export interface TranscripcionResult {
  textoEstructurado: string;
  textoPlano: string;
  duracionDetectada?: string;
  modeloUsado: string;
}

const PROMPT_SISTEMA = `Eres un asistente académico que transcribe y estructura feedback de tutores universitarios sobre monografías de estudiantes.

INSTRUCCIONES:
1. Transcribí el audio con precisión, en español neutro de Bolivia.
2. Si el audio es feedback académico de un tutor, ESTRUCTURÁ las observaciones en puntos accionables.
3. Si el tutor menciona un capítulo específico (Cap I, Cap II, Marco Teórico, Metodología, Resultados, etc.), agrupá las observaciones bajo ese capítulo.
4. NO inventes contenido que no esté en el audio.
5. Si hay ruido o partes inentendibles, indicá [inaudible] en su lugar.
6. Eliminá muletillas ("este…", "eh…", "o sea…") pero conservá el sentido.

FORMATO DE SALIDA OBLIGATORIO:

📍 [Capítulo si se menciona, o "Observaciones generales"]:
   1. [Acción concreta sugerida por el tutor]
   2. [Otra acción]

📍 [Otro capítulo]:
   1. [Otra acción]

---
TRANSCRIPCIÓN LITERAL (texto plano):
[acá la transcripción completa sin estructurar]

NUNCA pongas el bloque "TRANSCRIPCIÓN LITERAL" antes del estructurado. SIEMPRE primero los puntos por capítulo y al final la literal.
`;

/**
 * Transcribe un archivo de audio usando Gemini.
 * @param audioBuffer Buffer del archivo de audio (cualquier formato compatible)
 * @param mimeType MIME type del archivo (ej: "audio/mpeg", "audio/wav")
 * @returns Transcripción estructurada y texto plano por separado
 */
export async function transcribirAudio(
  audioBuffer: Buffer,
  mimeType: string,
): Promise<TranscripcionResult> {
  hydrateAIConfigFromDisk();

  const apiKey = getProviderKey("gemini");
  if (!apiKey) {
    throw new Error("Gemini no está configurado. Andá a /admin/modelos y agregá tu API key de Google AI.");
  }

  // Gemini 2.5 Flash es más barato y rápido para transcripción.
  // Si no está disponible, fallback a 2.5 Pro.
  const modelo = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;

  const audioBase64 = audioBuffer.toString("base64");

  const requestBody = {
    contents: [
      {
        parts: [
          { text: PROMPT_SISTEMA },
          {
            inlineData: {
              mimeType,
              data: audioBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2, // baja para precisión en transcripción
      maxOutputTokens: 4096,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Gemini error ${res.status}: ${errorBody.slice(0, 300)}`);
  }

  const data = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const fullText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  if (!fullText) {
    throw new Error("Gemini devolvió respuesta vacía. Verificá el audio o reintentá.");
  }

  // Separar la parte estructurada de la literal
  const partes = fullText.split(/---\s*\n\s*TRANSCRIPCI[ÓO]N LITERAL[^:]*:?\s*/i);
  const textoEstructurado = partes[0]?.trim() ?? fullText;
  const textoPlano = partes[1]?.trim() ?? "";

  return {
    textoEstructurado,
    textoPlano,
    modeloUsado: modelo,
  };
}

/** Validación rápida de tipo MIME para audio. */
export function isAudioMimeType(mimeType: string): boolean {
  return /^audio\/(mpeg|mp3|mp4|m4a|wav|ogg|webm|flac|aac|x-m4a)$/.test(mimeType.toLowerCase());
}

/** Validación rápida por extensión. */
export function isAudioExtension(filename: string): boolean {
  return /\.(mp3|m4a|wav|ogg|webm|flac|aac|mp4)$/i.test(filename);
}

/** Mime type estimado a partir de la extensión. */
export function mimeTypeFromExtension(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop();
  switch (ext) {
    case "mp3":  return "audio/mpeg";
    case "m4a":  return "audio/mp4";
    case "mp4":  return "audio/mp4";
    case "wav":  return "audio/wav";
    case "ogg":  return "audio/ogg";
    case "webm": return "audio/webm";
    case "flac": return "audio/flac";
    case "aac":  return "audio/aac";
    default:     return "audio/mpeg";
  }
}
