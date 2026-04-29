import { NextResponse } from "next/server";
import { DEFAULT_PROMPTS, SECTION_STEPS } from "@/lib/data";

// In-memory store for API keys (admin configurable)
const apiKeysStore: Record<string, string> = {
  groq: process.env.GROQ_API_KEY || "",
  openai: process.env.OPENAI_API_KEY || "",
  anthropic: process.env.ANTHROPIC_API_KEY || "",
};

// In-memory user credits store (replace with Supabase in production)
const userCredits: Record<string, number> = {};

function getUserCredits(userId: string, plan: string): number {
  if (!(userId in userCredits)) {
    userCredits[userId] = plan === "demo" ? 10 : plan === "standard" ? 100 : 9999;
  }
  return userCredits[userId];
}

function deductCredit(userId: string): void {
  if (userCredits[userId] > 0) {
    userCredits[userId] -= 1;
  }
}

async function callGroq(prompt: string, userMessage: string, model: string): Promise<string> {
  const apiKey = apiKeysStore.groq;
  if (!apiKey) throw new Error("Groq API key no configurada.");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Error en Groq API");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callOpenAI(prompt: string, userMessage: string, model: string): Promise<string> {
  const apiKey = apiKeysStore.openai;
  if (!apiKey) throw new Error("OpenAI API key no configurada.");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Error en OpenAI API");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function interpolateTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value || "N/A");
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      section_key,
      plan = "demo",
      userId = "anonymous",
      programa,
      modulos,
      interes,
      universidad,
      modalidad,
      titulo,
      introduccion,
      justificacion,
      planteamiento,
      objetivos,
      marco_teorico,
      metodologia,
    } = body;

    // Validate section
    const stepInfo = SECTION_STEPS.find((s) => s.key === section_key);
    if (!stepInfo) {
      return NextResponse.json({ error: "Sección no válida." }, { status: 400 });
    }

    // Check credits (skip for unlimited/pro plan)
    if (plan !== "pro") {
      const credits = getUserCredits(userId, plan);
      if (credits < stepInfo.credits) {
        return NextResponse.json(
          { error: `Créditos insuficientes. Tienes ${credits} crédito(s). Esta sección requiere ${stepInfo.credits}.` },
          { status: 402 }
        );
      }
    }

    // Get prompt config
    const promptConfig = DEFAULT_PROMPTS[section_key];
    if (!promptConfig) {
      return NextResponse.json({ error: "Prompt no configurado para esta sección." }, { status: 500 });
    }

    // Select model based on plan
    const modelMap: Record<string, string> = {
      demo: promptConfig.model_demo,
      standard: promptConfig.model_standard,
      pro: promptConfig.model_pro,
    };
    const model = modelMap[plan] || promptConfig.model_demo;

    // Build prompts with variable interpolation
    const vars = {
      programa: programa || "",
      modulos: modulos || "",
      interes: interes || "",
      universidad: universidad || "la Universidad",
      modalidad: modalidad || "Tesis de Grado",
      titulo: titulo || "",
      introduccion: introduccion || "",
      justificacion: justificacion || "",
      planteamiento: planteamiento || "",
      objetivos: objetivos || "",
      marco_teorico: marco_teorico || "",
      metodologia: metodologia || "",
    };

    const systemPrompt = interpolateTemplate(promptConfig.system_prompt, vars);
    const userMessage = interpolateTemplate(promptConfig.user_template, vars);

    // Call AI provider (default: Groq)
    let generatedText: string;
    try {
      generatedText = await callGroq(systemPrompt, userMessage, model);
    } catch (groqError) {
      // Fallback to OpenAI if configured
      if (apiKeysStore.openai) {
        generatedText = await callOpenAI(systemPrompt, userMessage, "gpt-4o-mini");
      } else {
        throw groqError;
      }
    }

    // Deduct credits
    if (plan !== "pro") {
      for (let i = 0; i < stepInfo.credits; i++) {
        deductCredit(userId);
      }
    }

    const remainingCredits = plan === "pro" ? 999 : getUserCredits(userId, plan);

    return NextResponse.json({
      text: generatedText,
      section_key,
      credits_remaining: remainingCredits,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: `Error de generación: ${message}` }, { status: 500 });
  }
}

// Get user credits
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "anonymous";
  const plan = searchParams.get("plan") || "demo";
  const credits = getUserCredits(userId, plan);
  return NextResponse.json({ credits });
}

// Admin: update API keys
export async function PUT(req: Request) {
  try {
    const { provider, api_key } = await req.json();
    if (!["groq", "openai", "anthropic"].includes(provider)) {
      return NextResponse.json({ error: "Proveedor no válido." }, { status: 400 });
    }
    apiKeysStore[provider] = api_key;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al actualizar API key." }, { status: 500 });
  }
}