import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  tema?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const tema = (body.tema || "").trim();

    if (!tema) {
      return NextResponse.json({ error: "Por favor, ingresa un tema de investigación." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Falta `GEMINI_API_KEY` en `.env.local`." },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `Actúa como un experto en metodología de investigación y redacción académica.
Tema propuesto: "${tema}"
Genera:
1. Tres títulos sugeridos para monografía o proyecto de grado.
2. Un breve planteamiento del problema para el título más relevante.
Usa un tono formal y académico.`;

    const preferredModel = process.env.GEMINI_MODEL?.trim();
    const candidates = [
      preferredModel,
      "gemini-2.0-flash",
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-3-flash",
      "gemini-3.1-pro",
    ].filter(Boolean) as string[];

    let lastErr: unknown;
    for (const modelName of candidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return NextResponse.json({ text, model: modelName });
      } catch (err) {
        lastErr = err;
        const msg = err instanceof Error ? err.message : String(err);
        const isModelNotFound = msg.includes("404") && msg.toLowerCase().includes("not found");
        const isNotSupported = msg.toLowerCase().includes("not supported");
        if (isModelNotFound || isNotSupported) continue;
        throw err;
      }
    }

    throw lastErr ?? new Error("No hay modelos compatibles disponibles.");
  } catch (err) {
    console.error("Gemini generate error:", err);

    const message = err instanceof Error ? err.message : String(err);
    const details = process.env.NODE_ENV !== "production" ? message : undefined;
    const lower = message.toLowerCase();
    const isQuota =
      message.includes("429") ||
      lower.includes("quota") ||
      lower.includes("rate limit") ||
      lower.includes("too many requests");

    return NextResponse.json(
      {
        error: isQuota
          ? "Cuota excedida (429). Revisa tu plan/billing y límites de la Gemini API."
          : "Error al generar contenido. Verifica tu API key o restricciones.",
        details,
      },
      { status: isQuota ? 429 : 500 },
    );
  }
}

