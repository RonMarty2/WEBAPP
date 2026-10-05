import {
  getModelConfig,
  getModelConfigForSection,
  normalizePlan,
  type PlanTier,
  type PhaseIndex,
} from "../modelRouter";

describe("getModelConfig", () => {
  it("demo → siempre Groq", () => {
    const cfg = getModelConfig(1, "demo");
    expect(cfg.provider).toBe("groq");
    expect(cfg.model).toBe("llama-3.3-70b-versatile");
  });

  it("estandar → siempre Claude Sonnet", () => {
    const cfg = getModelConfig(2, "estandar");
    expect(cfg.provider).toBe("anthropic");
    expect(cfg.model).toBe("claude-sonnet-5-5");
  });

  it("pro fase 2 (Cap. II) → Claude Sonnet", () => {
    const cfg = getModelConfig(2, "pro");
    expect(cfg.provider).toBe("anthropic");
    expect(cfg.model).toBe("claude-sonnet-5-5");
  });

  it("pro fase 1 (Cap. I) → Claude Opus 4.7", () => {
    const cfg = getModelConfig(1, "pro");
    expect(cfg.provider).toBe("anthropic");
    expect(cfg.model).toBe("claude-opus-4-7");
  });

  it("elite tiene más maxTokens que pro en la misma fase", () => {
    const pro   = getModelConfig(1, "pro");
    const elite = getModelConfig(1, "elite");
    expect(elite.maxTokens).toBeGreaterThan(pro.maxTokens);
  });

  it("plan inválido cae a demo", () => {
    const cfg = getModelConfig(0, "inexistente" as PlanTier);
    expect(cfg.provider).toBe("groq");
  });
});

describe("getModelConfigForSection", () => {
  it("marco_teorico → fase 2 → Claude en plan pro", () => {
    const cfg = getModelConfigForSection("marco_teorico", "pro");
    expect(cfg.provider).toBe("anthropic");
  });

  it("titulo → fase 0 → Claude Sonnet en plan pro", () => {
    const cfg = getModelConfigForSection("titulo", "pro");
    expect(cfg.provider).toBe("anthropic");
    expect(cfg.model).toBe("claude-sonnet-5-5");
  });
});

describe("normalizePlan", () => {
  it("standard → estandar", () => {
    expect(normalizePlan("standard")).toBe("estandar");
  });

  it("estandar → estandar", () => {
    expect(normalizePlan("estandar")).toBe("estandar");
  });

  it("plan desconocido → demo", () => {
    expect(normalizePlan("vip" as PlanTier)).toBe("demo");
  });
});
