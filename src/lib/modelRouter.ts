// src/lib/modelRouter.ts
// Selección de proveedor + modelo según etapa académica y plan del usuario.
// Solo importar desde API routes (servidor). Nunca desde componentes cliente.

import { llamarIAConConfig, getProviderKey } from "@/lib/aiProvider";

export type PlanTier = "demo" | "standard" | "estandar" | "pro" | "elite";

export interface ModelConfig {
  provider: string;
  model: string;
  maxTokens: number;
}

export interface AIRouteResult {
  text: string;
  provider: string;
  model: string;
  /** True si la respuesta vino de un proveedor de fallback (NO el preferido). */
  isFallback?: boolean;
  /** Si isFallback=true, id del proveedor preferido que no se pudo usar. */
  preferredProviderFailed?: string;
  /** True si el proveedor usado es Groq como ÚLTIMO RECURSO. Frontend
   *  debe mostrar aviso de calidad limitada para generación académica densa. */
  isLastResortGroq?: boolean;
}

// Fases 0-5 corresponden a las etapas del documento académico:
// 0 = propuesta de tema, 1 = Cap.I, 2 = Cap.II, 3 = Cap.III, 4 = Cap.IV, 5 = Cap.V+Biblio
// Fase 6 = compilación final LaTeX (megaprompt SCRIBE_LATEX, requiere modelo premium
// con techo alto de tokens — 30-70 págs de transcripción sin resumir).
export type PhaseIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Fase especial: compilación final del documento .tex. */
export const PHASE_COMPILAR_LATEX: PhaseIndex = 6;

// Section keys del endpoint /api/generate (flujo monografia clásico)
export type SectionKey =
  | "titulo" | "resumen" | "introduccion" | "planteamiento" | "objetivos"
  | "marco_teorico" | "metodologia" | "resultados" | "conclusiones" | "bibliografia";

const SECTION_TO_PHASE: Record<SectionKey, PhaseIndex> = {
  titulo:        0,
  resumen:       0,
  introduccion:  1,
  planteamiento: 1,
  objetivos:     1,
  marco_teorico: 2,
  metodologia:   3,
  resultados:    4,
  conclusiones:  5,
  bibliografia:  5,
};

type PhaseMap = Record<PhaseIndex, ModelConfig>;

const DEMO: PhaseMap = {
  0: { provider: "groq", model: "llama-3.3-70b-versatile", maxTokens: 2048 },
  1: { provider: "groq", model: "llama-3.3-70b-versatile", maxTokens: 2048 },
  2: { provider: "groq", model: "llama-3.3-70b-versatile", maxTokens: 2048 },
  3: { provider: "groq", model: "llama-3.3-70b-versatile", maxTokens: 2048 },
  4: { provider: "groq", model: "llama-3.3-70b-versatile", maxTokens: 2048 },
  5: { provider: "groq", model: "llama-3.3-70b-versatile", maxTokens: 2048 },
  // Compilar LaTeX en DEMO: groq 70B con 7K (legacy fallback — suficiente
  // para demos cortas; usuarios de pago obtienen Opus 4.7 con 16K).
  6: { provider: "groq", model: "llama-3.3-70b-versatile", maxTokens: 7000 },
};

const ESTANDAR: PhaseMap = {
  0: { provider: "anthropic", model: "claude-sonnet-5-5", maxTokens: 3000 },
  1: { provider: "anthropic", model: "claude-sonnet-5-5", maxTokens: 4096 },
  2: { provider: "anthropic", model: "claude-sonnet-5-5", maxTokens: 4096 },
  3: { provider: "anthropic", model: "claude-sonnet-5-5", maxTokens: 4096 },
  4: { provider: "anthropic", model: "claude-sonnet-5-5", maxTokens: 4096 },
  5: { provider: "anthropic", model: "claude-sonnet-5-5", maxTokens: 4096 },
  // Compilar LaTeX en ESTANDAR: Claude Sonnet con 12K.
  6: { provider: "anthropic", model: "claude-sonnet-5-5", maxTokens: 12000 },
};

const PRO: PhaseMap = {
  0: { provider: "anthropic", model: "claude-sonnet-5-5", maxTokens: 3000  },
  1: { provider: "anthropic", model: "claude-opus-4-7",  maxTokens: 8192  },
  2: { provider: "anthropic", model: "claude-sonnet-5-5",   maxTokens: 8192  },
  3: { provider: "anthropic", model: "claude-opus-4-7",  maxTokens: 8192  },
  4: { provider: "anthropic", model: "claude-opus-4-7",  maxTokens: 8192  },
  5: { provider: "anthropic", model: "claude-opus-4-7",  maxTokens: 8192  },
  // Compilar LaTeX en PRO: Claude Opus 4.7 con 16K — necesario para
  // transcribir 30-70 páginas sin violar la regla "PROHIBIDO RESUMIR".
  6: { provider: "anthropic", model: "claude-opus-4-7",  maxTokens: 16384 },
};

const ELITE: PhaseMap = {
  0: { provider: "anthropic", model: "claude-sonnet-5-5", maxTokens: 4096  },
  1: { provider: "anthropic", model: "claude-opus-4-7",  maxTokens: 12000 },
  2: { provider: "anthropic", model: "claude-sonnet-5-5",   maxTokens: 12000 },
  3: { provider: "anthropic", model: "claude-opus-4-7",  maxTokens: 12000 },
  4: { provider: "anthropic", model: "claude-opus-4-7",  maxTokens: 12000 },
  5: { provider: "anthropic", model: "claude-opus-4-7",  maxTokens: 12000 },
  // Compilar LaTeX en ELITE: idem PRO — Claude Opus 4.7 con 16K.
  6: { provider: "anthropic", model: "claude-opus-4-7",  maxTokens: 16384 },
};

const PLAN_MAP: Partial<Record<PlanTier, PhaseMap>> = {
  demo:     DEMO,
  standard: ESTANDAR,
  estandar: ESTANDAR,
  pro:      PRO,
  elite:    ELITE,
};

/** Normaliza nombres de plan legacy ("standard") al canónico ("estandar"). Planes desconocidos → "demo". */
export function normalizePlan(plan: string): PlanTier {
  if (plan === "standard") return "estandar";
  if (plan in PLAN_MAP) return plan as PlanTier;
  return "demo";
}

/** Devuelve la configuración de modelo para una fase y plan dados. */
export function getModelConfig(phase: PhaseIndex, plan: PlanTier): ModelConfig {
  return PLAN_MAP[plan]?.[phase] ?? DEMO[0];
}

/** Devuelve la configuración de modelo para un section_key del flujo /api/generate. */
export function getModelConfigForSection(sectionKey: SectionKey, plan: PlanTier): ModelConfig {
  const phase = SECTION_TO_PHASE[sectionKey] ?? 0;
  return getModelConfig(phase, plan);
}

/**
 * Llama a la IA eligiendo proveedor y modelo según fase y plan.
 * Si el proveedor preferido no tiene API key configurada, hace fallback
 * a la cadena clásica (Groq → Anthropic → OpenAI).
 */
export async function llamarIAPorPlan(
  system: string,
  user: string,
  phase: PhaseIndex,
  plan: PlanTier,
): Promise<AIRouteResult> {
  // 🧪 MOCK MODE — antes de cualquier llamada a IA real, chequear si el
  // sistema debe operar en modo demostración. Esto cubre el caso de
  // endpoints que usan llamarIAPorPlan en lugar de llamarIA (donde el
  // mock estaba originalmente). Lectura defensiva del env var: si
  // MOCK_AI=true, devolvemos respuesta stub sin tocar APIs reales.
  if (process.env.MOCK_AI === "true") {
    const { generateMockResponse } = await import("@/lib/aiMockProvider");
    console.log("[modelRouter] 🧪 MOCK MODE activo (MOCK_AI=true) — devolviendo stub para plan", plan, "fase", phase);
    const text = generateMockResponse(system, user);
    return { text, provider: "mock", model: "mock-validator-v1" };
  }

  const cfg = getModelConfig(phase, normalizePlan(plan));
  const apiKey = getProviderKey(cfg.provider);

  const errors: string[] = [];
  if (apiKey) {
    try {
      const text = await llamarIAConConfig(cfg.provider, cfg.model, apiKey, system, user, cfg.maxTokens);
      return { text, provider: cfg.provider, model: cfg.model };
    } catch (e) {
      // Si el modelo preferido falla (cuota, timeout, modelo inválido) seguimos
      // con la cascada en vez de romperle la generación al estudiante.
      errors.push(`${cfg.provider}: ${(e as Error).message}`);
    }
  } else {
    errors.push(`${cfg.provider}: API key no configurada`);
  }

  // Fallback ordenado de MEJOR a ÚLTIMO RECURSO:
  //   1. Anthropic Claude (mejor razonamiento académico)
  //   2. Gemini 2.5 Flash (contexto largo, búsqueda web)
  //   3. OpenAI GPT-4o (sólido y confiable)
  //   4. Groq llama-3.3 (ÚLTIMO RECURSO — modelo gratuito,
  //      apto para chat liviano, NO recomendado para
  //      generación académica densa)
  // Si la respuesta termina viniendo de Groq, marcamos
  // isLastResortGroq=true para que el frontend muestre aviso.
  const fallback: { id: string; model: string }[] = [
    { id: "anthropic", model: "claude-haiku-4-5-20251001" },
    { id: "gemini",    model: "gemini-2.5-flash"          },
    { id: "openai",    model: "gpt-4o-mini"               },
    { id: "groq",      model: "llama-3.3-70b-versatile"   },
  ].filter((p) => p.id !== cfg.provider); // no reintentar el mismo

  for (const { id, model } of fallback) {
    const key = getProviderKey(id);
    if (!key) continue;
    try {
      const text = await llamarIAConConfig(id, model, key, system, user, cfg.maxTokens);
      return {
        text,
        provider: id,
        model,
        isFallback: true,
        preferredProviderFailed: cfg.provider,
        isLastResortGroq: id === "groq",
      };
    } catch (e) {
      errors.push(`${id}: ${(e as Error).message}`);
    }
  }
  throw new Error(`Ningún proveedor disponible para plan ${plan} fase ${phase}. ${errors.join(" | ")}`);
}

/**
 * Llama al compilador final de LaTeX (megaprompt SCRIBE_LATEX) con el routing
 * premium definido para la fase 6 del plan del usuario.
 *
 * - DEMO     → groq llama-3.3-70b (7K tokens, legacy fallback)
 * - ESTANDAR → claude-sonnet-5-5 (12K tokens)
 * - PRO      → claude-opus-4-7 (16K tokens)
 * - ELITE    → claude-opus-4-7 (16K tokens)
 *
 * Si el proveedor preferido no tiene API key, hace fallback a la cadena
 * clásica (Groq → Anthropic → OpenAI).
 */
export async function llamarCompiladorLaTeX(
  system: string,
  user: string,
  plan: PlanTier | string,
): Promise<AIRouteResult> {
  return llamarIAPorPlan(system, user, PHASE_COMPILAR_LATEX, normalizePlan(plan));
}
