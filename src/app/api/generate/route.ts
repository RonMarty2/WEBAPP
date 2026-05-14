import { NextResponse } from "next/server";
import { DEFAULT_PROMPTS, SECTION_STEPS } from "@/lib/data";
import {
  llamarIAPorPlan,
  normalizePlan,
  type PlanTier,
  type PhaseIndex,
  type SectionKey,
} from "@/lib/modelRouter";

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

    let systemPrompt = interpolateTemplate(promptConfig.system_prompt, vars);
    let userMessage = interpolateTemplate(promptConfig.user_template, vars);

    // --- CONTEXTO RODANTE ---
    if (section_key !== "titulo") {
      userMessage += `\n\n--- CONTEXTO APROBADO PREVIAMENTE ---\n`;
      if (titulo) userMessage += `Título: ${titulo}\n`;
      if (introduccion) userMessage += `Introducción: ${introduccion}\n`;
      if (planteamiento) userMessage += `Problema: ${planteamiento}\n`;
      if (objetivos) userMessage += `Objetivos: ${objetivos}\n`;
    }

    // --- CONTROL DE CALIDAD POR MODALIDAD ---
    if (modalidad === "Tesis de Grado") {
      if (section_key === "planteamiento") {
         systemPrompt += "\n\nREQUISITO OBLIGATORIO: Al ser Tesis de Grado, debes incluir obligatoriamente la Formulación de la Hipótesis de Investigación al final del planteamiento del problema.";
      }
      if (section_key === "metodologia") {
         systemPrompt += "\n\nREQUISITO OBLIGATORIO: Al ser Tesis de Grado, debes detallar la Operacionalización de Variables y la estructura de una Matriz de Consistencia.";
      }
    }

    // Enrutar proveedor y modelo según plan y sección académica
    const sectionPhaseMap: Record<string, PhaseIndex> = {
      titulo: 0, resumen: 0,
      introduccion: 1, planteamiento: 1, objetivos: 1,
      marco_teorico: 2,
      metodologia: 3,
      resultados: 4,
      conclusiones: 5, bibliografia: 5,
    };
    const phase = (sectionPhaseMap[section_key] ?? 0) as PhaseIndex;
    const planTier = normalizePlan(plan || "demo");

    const { text: generatedText, provider: usedProvider, model: usedModel } =
      await llamarIAPorPlan(systemPrompt, userMessage, phase, planTier);

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
      _meta: { provider: usedProvider, model: usedModel },
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