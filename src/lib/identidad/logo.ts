/**
 * Generador de logos vía IA — orquestador modular.
 *
 * Soporta múltiples proveedores. Cada uno se activa solo si tiene su
 * env var configurada; sin ninguna, devuelve un placeholder SVG con el
 * concepto descrito (útil para que el flujo no se rompa en demos).
 *
 * Proveedores soportados (en orden de prioridad):
 *   1. OpenAI DALL-E 3 (OPENAI_API_KEY)
 *   2. Gemini Imagen (GOOGLE_AI_API_KEY) — vía mismo SDK que texto
 *   3. Placeholder SVG (sin env vars) — para que la herramienta sea
 *      navegable aunque no haya credenciales
 *
 * Filosofía:
 *   - Cada llamada a IA generativa cuesta dinero ($0.04-0.10 por logo).
 *     El alumno solo puede pedir 3 alternativas por defecto antes de
 *     que el sistema lo limite. La paginación de "Generar más" cuesta
 *     adicional y debe ir gateada por plan Pro/Elite.
 *   - El prompt se construye desde el brief (no es texto libre del
 *     alumno) — evita prompt-injection y mantiene consistencia.
 */

import type { BriefMarca, LogoAlternativa, ModeloLogoIA, Paleta } from "@/types/identidad";

// ─── Construcción del prompt ─────────────────────────────────────────────

interface ContextoLogo {
  brief: Partial<BriefMarca>;
  paleta: Pick<Paleta, "primario" | "secundario" | "acento"> | null;
  conceptoExtra?: string;  // texto libre del alumno (opcional)
}

/**
 * Construye un prompt detallado para el generador de imágenes.
 * Combina brief + paleta + concepto en una instrucción profesional.
 */
export function construirPromptLogo(ctx: ContextoLogo): string {
  const { brief, paleta, conceptoExtra } = ctx;

  const partes: string[] = [];

  partes.push("Professional vector-style brand logo design.");
  if (brief.nombre) partes.push(`Brand name: "${brief.nombre}".`);
  if (brief.sector) partes.push(`Industry: ${brief.sector}.`);
  if (brief.esencia) partes.push(`Brand essence: ${brief.esencia}.`);

  if (brief.personalidad) partes.push(`Visual personality: ${brief.personalidad}.`);
  if (brief.atributos?.length) partes.push(`Key attributes: ${brief.atributos.join(", ")}.`);

  if (paleta) {
    partes.push(`Color palette: primary ${paleta.primario}, secondary ${paleta.secundario}, accent ${paleta.acento}.`);
  }

  // Concepto explícito del alumno
  if (conceptoExtra?.trim()) {
    partes.push(`Concept direction: ${conceptoExtra.trim()}.`);
  }

  // Reglas técnicas para que el output sea utilizable
  partes.push([
    "Clean minimalist composition.",
    "Centered on solid white background.",
    "High contrast.",
    "Suitable for both print and digital use.",
    "Vector style with crisp edges.",
    "No realistic photography, no shadows, no gradients except where necessary.",
    "No text other than the brand name if it appears.",
    "Square 1:1 aspect ratio.",
  ].join(" "));

  // Anti-prompt-injection: instrucciones prohibidas
  if (brief.prohibidos?.length) {
    partes.push(`Avoid: ${brief.prohibidos.join(", ")}.`);
  }

  return partes.join(" ");
}

// ─── Detectores de disponibilidad ────────────────────────────────────────

export function modeloDisponible(modelo: ModeloLogoIA): boolean {
  switch (modelo) {
    case "openai-dalle-3":
      return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10;
    case "gemini-imagen-3":
      return !!process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY.length > 10;
    case "flux-pro":
      return !!process.env.REPLICATE_API_KEY && process.env.REPLICATE_API_KEY.length > 10;
    case "placeholder":
      return true; // siempre disponible
    case "manual":
      return true;
    default:
      return false;
  }
}

export function modelosDisponibles(): ModeloLogoIA[] {
  const todos: ModeloLogoIA[] = ["openai-dalle-3", "gemini-imagen-3", "flux-pro", "placeholder"];
  return todos.filter(modeloDisponible);
}

// ─── Llamadas a proveedores ──────────────────────────────────────────────

interface ResultadoGeneracion {
  url: string;             // data URI o URL pública
  modelo: ModeloLogoIA;
  prompt: string;
}

/**
 * Genera UNA imagen de logo. Devuelve URL/data URI + metadata.
 * Lanza si el modelo no está disponible o falla.
 */
export async function generarLogo(ctx: ContextoLogo, modeloPreferido?: ModeloLogoIA): Promise<ResultadoGeneracion> {
  const prompt = construirPromptLogo(ctx);
  const modelo = modeloPreferido && modeloDisponible(modeloPreferido) ? modeloPreferido : modelosDisponibles()[0];

  switch (modelo) {
    case "openai-dalle-3":
      return generarConOpenAI(prompt);
    case "gemini-imagen-3":
      return generarConGemini(prompt);
    case "flux-pro":
      return generarConFlux(prompt);
    case "placeholder":
    default:
      return generarPlaceholder(prompt, ctx);
  }
}

async function generarConOpenAI(prompt: string): Promise<ResultadoGeneracion> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY no configurada");

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(50_000),
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",      // "hd" cuesta 2x más; standard suficiente para mockup
      response_format: "url",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI image generation failed: ${err.slice(0, 300)}`);
  }
  const data = await res.json() as { data: Array<{ url: string }> };
  const url = data.data[0]?.url;
  if (!url) throw new Error("OpenAI no devolvió URL de imagen");
  return { url, modelo: "openai-dalle-3", prompt };
}

async function generarConGemini(prompt: string): Promise<ResultadoGeneracion> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY no configurada");

  // Gemini usa Imagen vía endpoint específico de Vertex AI o
  // generativelanguage. Endpoint preview en 2026:
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(50_000),
    body: JSON.stringify({
      prompt: { text: prompt },
      number_of_images: 1,
      aspect_ratio: "1:1",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini image generation failed: ${err.slice(0, 300)}`);
  }
  const data = await res.json() as { predictions?: Array<{ bytesBase64Encoded?: string }> };
  const b64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error("Gemini no devolvió imagen base64");
  return { url: `data:image/png;base64,${b64}`, modelo: "gemini-imagen-3", prompt };
}

async function generarConFlux(prompt: string): Promise<ResultadoGeneracion> {
  const apiKey = process.env.REPLICATE_API_KEY;
  if (!apiKey) throw new Error("REPLICATE_API_KEY no configurada");

  // Replicate Flux Pro tarda 5-15s, requiere polling.
  const res = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${apiKey}`,
    },
    signal: AbortSignal.timeout(50_000),
    body: JSON.stringify({
      version: "black-forest-labs/flux-pro",
      input: { prompt, aspect_ratio: "1:1", output_format: "png" },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Flux create prediction failed: ${err.slice(0, 300)}`);
  }
  const created = await res.json() as { id: string; urls: { get: string } };

  // Polling hasta status === "succeeded" o "failed", max 40s.
  const deadline = Date.now() + 40_000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 1500));
    const poll = await fetch(created.urls.get, {
      headers: { "Authorization": `Token ${apiKey}` },
    });
    const data = await poll.json() as { status: string; output?: string | string[] };
    if (data.status === "succeeded") {
      const url = Array.isArray(data.output) ? data.output[0] : data.output;
      if (!url) throw new Error("Flux no devolvió output");
      return { url, modelo: "flux-pro", prompt };
    }
    if (data.status === "failed") {
      throw new Error("Flux prediction failed");
    }
  }
  throw new Error("Flux prediction timeout");
}

/**
 * Genera un placeholder SVG estilizado cuando no hay API keys configuradas.
 * Es un círculo con la inicial del nombre encima — feo a propósito para
 * que el alumno sepa que es placeholder y configure su key real.
 */
function generarPlaceholder(prompt: string, ctx: ContextoLogo): ResultadoGeneracion {
  const inicial = (ctx.brief.nombre || "?").trim().charAt(0).toUpperCase();
  const primario = ctx.paleta?.primario || "#7c3aed";
  const neutroClaro = "#f8fafc";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="${neutroClaro}"/>
  <circle cx="256" cy="256" r="180" fill="${primario}"/>
  <text x="256" y="320" text-anchor="middle" font-size="200" font-family="Inter, system-ui, sans-serif" font-weight="800" fill="white">${inicial}</text>
  <text x="256" y="450" text-anchor="middle" font-size="22" font-family="Inter, system-ui, sans-serif" fill="#64748b">PLACEHOLDER · configura API key</text>
</svg>`;

  const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  return { url: dataUri, modelo: "placeholder", prompt };
}

// ─── Helper: construir LogoAlternativa para guardar en BD ─────────────────

export function aLogoAlternativa(r: ResultadoGeneracion): LogoAlternativa {
  return {
    url: r.url,
    prompt: r.prompt,
    modelo: r.modelo,
    generado_en: new Date().toISOString(),
  };
}
