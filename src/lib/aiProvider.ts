// Unified AI provider — supports all major providers.
// Per-service configuration: each service can use a different provider + model.

export interface AICallResult {
  text: string;
  provider: string;
  model: string;
}

// ── Provider catalog ──────────────────────────────────────────────────────────

export interface AIProviderInfo {
  id: string;
  name: string;
  color: string;
  website: string;
  apiDocsUrl: string;
  defaultModel: string;
  models: { id: string; label: string; contextK: number }[];
  authHeader: "Bearer" | "x-api-key";
  endpoint: string;
  format: "openai" | "anthropic" | "google";
}

export const AI_PROVIDERS: AIProviderInfo[] = [
  {
    id: "groq",
    name: "Groq",
    color: "#f97316",
    website: "https://groq.com",
    apiDocsUrl: "https://console.groq.com/keys",
    defaultModel: "llama-3.3-70b-versatile",
    models: [
      { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (recomendado)", contextK: 128 },
      { id: "llama-3.1-8b-instant",    label: "Llama 3.1 8B (rápido)",        contextK: 128 },
      { id: "mixtral-8x7b-32768",      label: "Mixtral 8x7B",                 contextK: 32  },
      { id: "gemma2-9b-it",            label: "Gemma 2 9B",                   contextK: 8   },
    ],
    authHeader: "Bearer",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    format: "openai",
  },
  {
    id: "openai",
    name: "OpenAI",
    color: "#4ade80",
    website: "https://openai.com",
    apiDocsUrl: "https://platform.openai.com/api-keys",
    defaultModel: "gpt-4o-mini",
    models: [
      { id: "gpt-4o-mini",   label: "GPT-4o Mini (económico)",  contextK: 128 },
      { id: "gpt-4o",        label: "GPT-4o (potente)",         contextK: 128 },
      { id: "gpt-4-turbo",   label: "GPT-4 Turbo",              contextK: 128 },
      { id: "o1-mini",       label: "o1-mini (razonamiento)",   contextK: 128 },
    ],
    authHeader: "Bearer",
    endpoint: "https://api.openai.com/v1/chat/completions",
    format: "openai",
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    color: "#a78bfa",
    website: "https://anthropic.com",
    apiDocsUrl: "https://console.anthropic.com/settings/keys",
    defaultModel: "claude-haiku-4-5-20251001",
    models: [
      { id: "claude-haiku-4-5-20251001",  label: "Claude Haiku 4.5 (rápido)",    contextK: 200 },
      { id: "claude-sonnet-4-6",          label: "Claude Sonnet 4.6 (balanceado)",contextK: 200 },
      { id: "claude-opus-4-7",            label: "Claude Opus 4.7 (máx calidad)", contextK: 200 },
    ],
    authHeader: "x-api-key",
    endpoint: "https://api.anthropic.com/v1/messages",
    format: "anthropic",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    color: "#60a5fa",
    website: "https://ai.google.dev",
    apiDocsUrl: "https://aistudio.google.com/app/apikey",
    defaultModel: "gemini-2.0-flash",
    models: [
      { id: "gemini-2.0-flash",     label: "Gemini 2.0 Flash (rápido)",    contextK: 1000 },
      { id: "gemini-1.5-pro",       label: "Gemini 1.5 Pro (avanzado)",    contextK: 2000 },
      { id: "gemini-1.5-flash",     label: "Gemini 1.5 Flash",             contextK: 1000 },
      { id: "gemini-2.5-pro-preview", label: "Gemini 2.5 Pro (preview)",  contextK: 2000 },
    ],
    authHeader: "Bearer",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
    format: "google",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    color: "#fb923c",
    website: "https://mistral.ai",
    apiDocsUrl: "https://console.mistral.ai/api-keys",
    defaultModel: "mistral-small-latest",
    models: [
      { id: "mistral-small-latest",  label: "Mistral Small (económico)", contextK: 32  },
      { id: "mistral-medium-latest", label: "Mistral Medium",            contextK: 32  },
      { id: "mistral-large-latest",  label: "Mistral Large (potente)",   contextK: 128 },
      { id: "open-mistral-nemo",     label: "Mistral Nemo (libre)",      contextK: 128 },
    ],
    authHeader: "Bearer",
    endpoint: "https://api.mistral.ai/v1/chat/completions",
    format: "openai",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    color: "#22d3ee",
    website: "https://deepseek.com",
    apiDocsUrl: "https://platform.deepseek.com/api_keys",
    defaultModel: "deepseek-chat",
    models: [
      { id: "deepseek-chat",      label: "DeepSeek V3 (general)",     contextK: 64 },
      { id: "deepseek-reasoner",  label: "DeepSeek R1 (razonamiento)", contextK: 64 },
    ],
    authHeader: "Bearer",
    endpoint: "https://api.deepseek.com/v1/chat/completions",
    format: "openai",
  },
  {
    id: "xai",
    name: "xAI (Grok)",
    color: "#e2e8f0",
    website: "https://x.ai",
    apiDocsUrl: "https://console.x.ai",
    defaultModel: "grok-2-latest",
    models: [
      { id: "grok-2-latest",    label: "Grok 2 (avanzado)",   contextK: 131 },
      { id: "grok-beta",        label: "Grok Beta",            contextK: 131 },
    ],
    authHeader: "Bearer",
    endpoint: "https://api.x.ai/v1/chat/completions",
    format: "openai",
  },
  {
    id: "cohere",
    name: "Cohere",
    color: "#34d399",
    website: "https://cohere.com",
    apiDocsUrl: "https://dashboard.cohere.com/api-keys",
    defaultModel: "command-r-plus",
    models: [
      { id: "command-r-plus",   label: "Command R+ (potente)",  contextK: 128 },
      { id: "command-r",        label: "Command R (balanceado)", contextK: 128 },
      { id: "command-light",    label: "Command Light (rápido)", contextK: 4   },
    ],
    authHeader: "Bearer",
    endpoint: "https://api.cohere.ai/v1/chat",
    format: "openai",
  },
  {
    id: "together",
    name: "Together AI",
    color: "#c084fc",
    website: "https://together.ai",
    apiDocsUrl: "https://api.together.xyz/settings/api-keys",
    defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    models: [
      { id: "meta-llama/Llama-3.3-70B-Instruct-Turbo", label: "Llama 3.3 70B Turbo",   contextK: 131 },
      { id: "mistralai/Mixtral-8x22B-Instruct-v0.1",   label: "Mixtral 8x22B",          contextK: 65  },
      { id: "Qwen/Qwen2.5-72B-Instruct-Turbo",         label: "Qwen 2.5 72B",           contextK: 32  },
    ],
    authHeader: "Bearer",
    endpoint: "https://api.together.xyz/v1/chat/completions",
    format: "openai",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    color: "#38bdf8",
    website: "https://perplexity.ai",
    apiDocsUrl: "https://www.perplexity.ai/settings/api",
    defaultModel: "llama-3.1-sonar-large-128k-online",
    models: [
      { id: "llama-3.1-sonar-large-128k-online",  label: "Sonar Large (con búsqueda web)", contextK: 128 },
      { id: "llama-3.1-sonar-small-128k-online",  label: "Sonar Small (rápido + web)",     contextK: 128 },
      { id: "llama-3.1-sonar-large-128k-chat",    label: "Sonar Large (sin web)",          contextK: 128 },
    ],
    authHeader: "Bearer",
    endpoint: "https://api.perplexity.ai/chat/completions",
    format: "openai",
  },
];

export function getProviderInfo(id: string): AIProviderInfo | undefined {
  return AI_PROVIDERS.find(p => p.id === id);
}

// ── Per-service config (in-memory, loaded from /api/admin/ai-config) ──────────

interface ServiceConfig {
  provider_id: string;
  model: string;
  api_key: string;
}

const serviceConfigCache = new Map<string, ServiceConfig>();

export function setServiceAIConfig(servicioId: string, cfg: ServiceConfig) {
  serviceConfigCache.set(servicioId, cfg);
}

export function getServiceAIConfig(servicioId: string): ServiceConfig | undefined {
  return serviceConfigCache.get(servicioId);
}

// ── Provider-level API keys (stored separately, loaded from env or admin) ─────

const providerKeyCache = new Map<string, string>([
  ["groq",      process.env.GROQ_API_KEY      ?? ""],
  ["anthropic", process.env.ANTHROPIC_API_KEY ?? ""],
  ["openai",    process.env.OPENAI_API_KEY    ?? ""],
  ["gemini",    process.env.GEMINI_API_KEY    ?? ""],
  ["mistral",   process.env.MISTRAL_API_KEY   ?? ""],
  ["deepseek",  process.env.DEEPSEEK_API_KEY  ?? ""],
  ["xai",       process.env.XAI_API_KEY       ?? ""],
  ["cohere",    process.env.COHERE_API_KEY     ?? ""],
  ["together",  process.env.TOGETHER_API_KEY  ?? ""],
  ["perplexity",process.env.PERPLEXITY_API_KEY?? ""],
]);

export function setProviderKey(providerId: string, key: string) {
  providerKeyCache.set(providerId, key);
}

export function getProviderKey(providerId: string): string {
  return providerKeyCache.get(providerId) ?? "";
}

export function hasProviderKey(providerId: string): boolean {
  return !!providerKeyCache.get(providerId);
}

// ── Low-level callers ─────────────────────────────────────────────────────────

async function callOpenAIFormat(
  endpoint: string, apiKey: string, authHeader: "Bearer" | "x-api-key",
  model: string, system: string, user: string, maxTokens: number
): Promise<string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authHeader === "Bearer") headers["Authorization"] = `Bearer ${apiKey}`;
  else headers["x-api-key"] = apiKey;

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      temperature: 0.35,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json() as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content;
}

async function callAnthropic(
  apiKey: string, model: string, system: string, user: string, maxTokens: number
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json() as { content: { text: string }[] };
  return data.content[0].text;
}

async function callGemini(
  apiKey: string, model: string, system: string, user: string, maxTokens: number
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.35 },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err) || `HTTP ${res.status}`);
  }
  const data = await res.json() as { candidates: { content: { parts: { text: string }[] } }[] };
  return data.candidates[0].content.parts[0].text;
}

// ── Main caller — uses provider config ───────────────────────────────────────

export async function llamarIAConConfig(
  providerId: string,
  model: string,
  apiKey: string,
  system: string,
  user: string,
  maxTokens: number
): Promise<string> {
  const info = getProviderInfo(providerId);
  if (!info) throw new Error(`Proveedor desconocido: ${providerId}`);
  if (!apiKey) throw new Error(`API key no configurada para ${info.name}`);

  if (info.format === "anthropic") {
    return callAnthropic(apiKey, model, system, user, maxTokens);
  }
  if (info.format === "google") {
    return callGemini(apiKey, model, system, user, maxTokens);
  }
  // openai-compatible (Groq, OpenAI, Mistral, DeepSeek, xAI, Cohere, Together, Perplexity)
  if (providerId === "groq") {
    // Groq: retry with smaller model on TPM error
    const models = [model, "llama-3.1-8b-instant"].filter((m, i, a) => a.indexOf(m) === i);
    let lastErr = "";
    for (const m of models) {
      try {
        return await callOpenAIFormat(info.endpoint, apiKey, info.authHeader, m, system, user, maxTokens);
      } catch (e) {
        lastErr = (e as Error).message;
        const isLimit = lastErr.toLowerCase().includes("too large") || lastErr.toLowerCase().includes("rate_limit") || lastErr.toLowerCase().includes("tokens per minute");
        if (!isLimit) throw e;
      }
    }
    throw new Error(lastErr);
  }
  return callOpenAIFormat(info.endpoint, apiKey, info.authHeader, model, system, user, maxTokens);
}

// ── Public API: llamarIA (default chain for backward compat) ─────────────────

export async function llamarIA(
  system: string,
  user: string,
  maxTokens = 7000,
  servicioId?: string
): Promise<AICallResult> {
  // 1. Try service-specific config first
  if (servicioId) {
    const cfg = getServiceAIConfig(servicioId);
    if (cfg && cfg.api_key) {
      try {
        const text = await llamarIAConConfig(cfg.provider_id, cfg.model, cfg.api_key, system, user, maxTokens);
        return { text, provider: cfg.provider_id, model: cfg.model };
      } catch (e) {
        console.warn(`[AI] Service config failed (${cfg.provider_id}): ${(e as Error).message} — falling back`);
      }
    }
  }

  // 2. Fall back to env-based provider chain: Groq → Anthropic → OpenAI
  const chain: { id: string; model: string }[] = [
    { id: "groq",      model: "llama-3.3-70b-versatile" },
    { id: "anthropic", model: "claude-haiku-4-5-20251001" },
    { id: "openai",    model: "gpt-4o-mini" },
  ];

  const errors: string[] = [];
  for (const { id, model } of chain) {
    const key = getProviderKey(id);
    if (!key) continue;
    try {
      const text = await llamarIAConConfig(id, model, key, system, user, maxTokens);
      return { text, provider: id, model };
    } catch (e) {
      errors.push(`${id}: ${(e as Error).message}`);
    }
  }

  throw new Error(
    `Ningún proveedor de IA disponible. Configura al menos una API key en el panel Admin → Modelos & APIs.\n${errors.join(" | ")}`
  );
}

// ── Helpers (backward compat) ─────────────────────────────────────────────────

export function extraerJSON(texto: string): Record<string, unknown> | null {
  const blockMatch = texto.match(/```json\s*([\s\S]*?)\s*```/);
  if (blockMatch) {
    try { return JSON.parse(blockMatch[1]); } catch { /* fall */ }
  }
  const start = texto.indexOf("{");
  const end = texto.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try { return JSON.parse(texto.slice(start, end + 1)); } catch { /* fall */ }
  }
  return null;
}

export interface CitaExtraida {
  autor: string; ano?: number; titulo_obra: string;
  fuente?: string; tipo?: string; formato_apa?: string; capitulo?: number;
}

export function extraerCitas(json: Record<string, unknown>): CitaExtraida[] {
  const keys = ["citas_registradas", "citas_cap1", "citas_cap2", "citas_cap3", "bibliografia_final"];
  for (const key of keys) {
    const val = json[key];
    if (Array.isArray(val) && val.length > 0) return val as CitaExtraida[];
  }
  return [];
}
