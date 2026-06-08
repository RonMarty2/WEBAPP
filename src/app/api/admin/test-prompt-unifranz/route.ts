/**
 * ═══════════════════════════════════════════════════════════════════════════
 * /api/admin/test-prompt-unifranz
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Endpoint INTERNO de testing para validar la calidad del motor de prompts
 * UNIFRANZ Proyecto de Grado ANTES de enchufarlo al flujo real
 * (/api/projects/generate-phase).
 *
 * NO usar en producción cara al estudiante. Es para que el dueño del SaaS
 * dispare manualmente cada fase y revise el output.
 *
 * Flujo:
 *   1. Recibe { fase, contexto }.
 *   2. Toma el megaprompt UNIFRANZ correspondiente.
 *   3. Construye el bloque [CONTEXTO DEL PROYECTO] con los datos.
 *   4. Invoca la cascada IA (Groq → Anthropic → OpenAI).
 *   5. Devuelve el prompt enviado, el output, el proveedor, el modelo,
 *      el tiempo y los caracteres de salida.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import { llamarIA } from "@/lib/aiProvider";
import {
  getPromptUnifranzPG,
  type FaseUnifranzPG,
  type ModalidadUnifranzPG,
} from "@/lib/prompts/proyectoGrado/universidad/unifranz";

interface ContextoProyecto {
  tema: string;
  carrera: string;
  facultad?: string;
  ciudad?: string;
  sector?: string;
  modalidad?: ModalidadUnifranzPG;
  horizonte_anios?: number;
  notas_adicionales?: string;
}

interface TestRequest {
  fase: FaseUnifranzPG;
  contexto: ContextoProyecto;
}

/** Budget de tokens por fase. Las fases largas (caps completos) piden más. */
const TOKEN_BUDGET: Record<FaseUnifranzPG, number> = {
  "resumen-trabajo": 1500,
  "introduccion": 6000,
  "marco-teorico": 10000,
  "investigacion": 10000,
  "plan-estrategico": 10000,
  "conclusiones-recomendaciones": 4000,
  "bibliografia": 4000,
};

function construirContextoUsuario(contexto: ContextoProyecto): string {
  const lineas: string[] = [
    "═══════════════════════════════════════════════════════════════════════════",
    "[CONTEXTO DEL PROYECTO — provisto por el estudiante]",
    "═══════════════════════════════════════════════════════════════════════════",
    "",
    `Universidad: Universidad Privada Franz Tamayo (UNIFRANZ) — Cochabamba, Bolivia`,
    `Modalidad: Proyecto de Grado — ${contexto.modalidad ?? "pre-factibilidad"}`,
    `Carrera: ${contexto.carrera}`,
  ];
  if (contexto.facultad) {
    lineas.push(`Facultad: ${contexto.facultad}`);
  }
  lineas.push(`Tema confirmado del trabajo: ${contexto.tema}`);
  if (contexto.ciudad) {
    lineas.push(`Ciudad / región del proyecto: ${contexto.ciudad}`);
  }
  if (contexto.sector) {
    lineas.push(`Sector económico / industria: ${contexto.sector}`);
  }
  if (contexto.horizonte_anios) {
    lineas.push(
      `Horizonte de proyección financiera: ${contexto.horizonte_anios} años`
    );
  }
  if (contexto.notas_adicionales) {
    lineas.push("");
    lineas.push("Notas adicionales del estudiante:");
    lineas.push(contexto.notas_adicionales);
  }
  lineas.push("");
  lineas.push(
    "Material propio del estudiante: ninguno cargado en esta prueba " +
      "(generar con conocimiento general verificable y fuentes públicas)."
  );
  lineas.push("");
  return lineas.join("\n");
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const inicio = Date.now();

  try {
    const body = (await req.json()) as TestRequest;
    const { fase, contexto } = body;

    if (!fase || !contexto?.tema || !contexto?.carrera) {
      return NextResponse.json(
        {
          error:
            "Campos requeridos: fase, contexto.tema, contexto.carrera",
        },
        { status: 400 }
      );
    }

    // 1. Tomar el megaprompt UNIFRANZ
    let system: string;
    try {
      system = getPromptUnifranzPG(fase, contexto.modalidad);
    } catch (e) {
      return NextResponse.json(
        { error: `Fase no soportada: ${fase} (${(e as Error).message})` },
        { status: 400 }
      );
    }

    // 2. Construir el bloque de contexto del usuario
    const user = construirContextoUsuario(contexto);

    // 3. Disparar la cascada IA
    const maxTokens = TOKEN_BUDGET[fase] ?? 6000;
    const { text, provider, model } = await llamarIA(system, user, maxTokens);

    const transcurridoMs = Date.now() - inicio;

    return NextResponse.json({
      ok: true,
      fase,
      modalidad: contexto.modalidad ?? "pre-factibilidad",
      prompt_enviado: {
        system_caracteres: system.length,
        user_caracteres: user.length,
        max_tokens: maxTokens,
      },
      output: {
        texto: text,
        caracteres: text.length,
        palabras_aprox: text.split(/\s+/).filter(Boolean).length,
      },
      proveedor_ia: {
        provider,
        model,
      },
      tiempo_ms: transcurridoMs,
      // Para auditoría completa: incluir el system prompt si el caller lo pide
      // (no se manda por defecto porque son ~15k caracteres por fase)
      _system_completo:
        new URL(req.url).searchParams.get("incluir_prompt") === "1"
          ? system
          : undefined,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    console.error("[test-prompt-unifranz] error:", msg);
    return NextResponse.json(
      {
        ok: false,
        error: msg,
        tiempo_ms: Date.now() - inicio,
      },
      { status: 500 }
    );
  }
}
