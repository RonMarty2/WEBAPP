// Unified AI provider: tries Groq → Anthropic → OpenAI in order.
// Each stage is one call, max ~8K output tokens.

export interface AICallResult {
  text: string;
  provider: string;
}

async function callGroq(system: string, user: string, maxTokens: number): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY no configurada");

  // Intentar primero con el modelo grande; si supera el límite TPM, usar el modelo pequeño.
  const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
  let lastError = "";

  for (const model of models) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.35,
        max_tokens: maxTokens,
      }),
    });

    if (res.ok) {
      return (await res.json()).choices[0].message.content as string;
    }

    const err = await res.json();
    lastError = err.error?.message || `Groq error ${res.status}`;

    // Solo reintentar con modelo más pequeño si el error es por tamaño/límite de tokens
    const esLimiteTpm = lastError.toLowerCase().includes("too large") ||
                        lastError.toLowerCase().includes("rate_limit") ||
                        lastError.toLowerCase().includes("tokens per minute");
    if (!esLimiteTpm) break;
  }

  throw new Error(lastError);
}

async function callAnthropic(system: string, user: string, maxTokens: number): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY no configurada");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `Anthropic error ${res.status}`);
  }
  return (await res.json()).content[0].text as string;
}

async function callOpenAI(system: string, user: string, maxTokens: number): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY no configurada");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.35,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `OpenAI error ${res.status}`);
  }
  return (await res.json()).choices[0].message.content as string;
}

/**
 * Calls the available AI provider in priority order: Groq → Anthropic → OpenAI.
 * maxTokens defaults to 7000 (stays within 8192 Groq limit).
 */
export async function llamarIA(
  system: string,
  user: string,
  maxTokens = 7000
): Promise<AICallResult> {
  const providers: { name: string; fn: () => Promise<string> }[] = [
    { name: "groq", fn: () => callGroq(system, user, maxTokens) },
    { name: "anthropic", fn: () => callAnthropic(system, user, maxTokens) },
    { name: "openai", fn: () => callOpenAI(system, user, maxTokens) },
  ];

  const errors: string[] = [];
  for (const p of providers) {
    try {
      const text = await p.fn();
      return { text, provider: p.name };
    } catch (e) {
      errors.push(`${p.name}: ${(e as Error).message}`);
    }
  }
  throw new Error(
    `Ningún proveedor de IA disponible. Configura GROQ_API_KEY, ANTHROPIC_API_KEY u OPENAI_API_KEY.\n${errors.join(" | ")}`
  );
}

/**
 * Extracts the first JSON object or ```json block from an AI response.
 */
export function extraerJSON(texto: string): Record<string, unknown> | null {
  // Try ```json ... ``` block first
  const blockMatch = texto.match(/```json\s*([\s\S]*?)\s*```/);
  if (blockMatch) {
    try {
      return JSON.parse(blockMatch[1]);
    } catch {
      // fall through
    }
  }

  // Try first { ... } span
  const start = texto.indexOf("{");
  const end = texto.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(texto.slice(start, end + 1));
    } catch {
      // fall through
    }
  }

  return null;
}

/**
 * Extracts citations array from parsed AI output.
 */
export interface CitaExtraida {
  autor: string;
  ano?: number;
  titulo_obra: string;
  fuente?: string;
  tipo?: string;
  formato_apa?: string;
  capitulo?: number;
}

export function extraerCitas(json: Record<string, unknown>): CitaExtraida[] {
  const keys = ["citas_registradas", "citas_cap1", "citas_cap2", "citas_cap3", "bibliografia_final"];
  for (const key of keys) {
    const val = json[key];
    if (Array.isArray(val) && val.length > 0) return val as CitaExtraida[];
  }
  return [];
}
