/**
 * POST /api/projects/analyze-style
 * Analyzes calibration answers and generates a style profile for the user.
 * Stores the profile in proyecto.perfil_estilo_usuario.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { llamarIA } from "@/lib/aiProvider";
import { getProyecto, updateProyecto } from "@/lib/memoryStore";
import { loadFromDisk } from "@/lib/persistence";
import { appendAITrace } from "@/lib/aiTrace.mjs";

const DEFAULT_ESTILO_PROMPT = `Eres un analista lingüístico experto. Tu tarea es crear un PERFIL DE ESTILO DE ESCRITURA conciso y accionable para un redactor de IA.

Analiza las respuestas de calibración del estudiante y genera un perfil que describa:
1. Tono predominante (formal, técnico, narrativo, descriptivo, etc.)
2. Estructura de oraciones preferida (cortas y directas, largas y elaboradas, mixtas)
3. Vocabulario característico (técnico, accesible, especializado)
4. Patrones discursivos observados (argumentativo, descriptivo, expositivo)
5. Fortalezas estilísticas del escritor
6. Instrucciones específicas para imitar este estilo

El perfil debe ser:
- Directo y en formato de instrucciones para una IA
- Máximo 200 palabras
- Comenzar con "PERFIL DE ESTILO: "
- Escrito en español formal

NO incluyas análisis de errores ni críticas. Solo describe el estilo para replicarlo.`;

interface RespuestasCalibracion {
  pregunta: string;
  respuesta: string;
}

export async function POST(req: Request) {
  try {
    const { user } = await requireAuth();
    const body = await req.json() as {
      proyecto_id: string;
      respuestas: RespuestasCalibracion[];
    };

    if (!body.proyecto_id || !Array.isArray(body.respuestas) || body.respuestas.length === 0) {
      return NextResponse.json({ error: "proyecto_id y respuestas son requeridos" }, { status: 400 });
    }

    // Build the user prompt from answers
    const userPrompt = [
      "RESPUESTAS DE CALIBRACIÓN DEL ESTUDIANTE:",
      "",
      ...body.respuestas.map((r, i) =>
        `Pregunta ${i + 1}: ${r.pregunta}\nRespuesta: ${r.respuesta}`
      ),
      "",
      "Genera el PERFIL DE ESTILO basándote en estas respuestas.",
    ].join("\n");

    // Load style analyzer prompt from admin config
    const disk = loadFromDisk();
    const systemPrompt = disk.estiloAnalizadorPrompt?.trim() || DEFAULT_ESTILO_PROMPT;
    const proyectoMemoria = getProyecto(body.proyecto_id);
    if (!isSupabaseConfigured() && !proyectoMemoria) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }
    let servicioIdForAI = proyectoMemoria?.servicio_id;
    if (isSupabaseConfigured() && !servicioIdForAI) {
      const db = createAdminClient();
      const { data: proyectoDb } = await db
        .from("proyectos_fases")
        .select("servicio_id")
        .eq("id", body.proyecto_id)
        .eq("usuario_id", user.id)
        .maybeSingle();
      servicioIdForAI = proyectoDb?.servicio_id;
      if (!servicioIdForAI) {
        return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
      }
    }

    let perfilEstilo: string;
    const aiStart = Date.now();
    let providerId = "";
    let providerModel = "";
    try {
      const resultado = await llamarIA(systemPrompt, userPrompt, 600, servicioIdForAI);
      providerId = resultado.provider;
      providerModel = resultado.model;
      perfilEstilo = resultado.text.trim();
    } catch (e) {
      if (proyectoMemoria) {
        updateProyecto(body.proyecto_id, {
          academic_memory: appendAITrace(proyectoMemoria.academic_memory, {
            scope: "analyze-style",
            action: "analizar estilo",
            phase_id: "calibracion",
            phase_label: "Calibracion de estilo",
            status: "error",
            provider_id: "",
            provider_name: "",
            model: "",
            duration_ms: Date.now() - aiStart,
            error: (e as Error).message,
          }),
        });
      }
      return NextResponse.json({ error: `Error de IA: ${(e as Error).message}` }, { status: 502 });
    }

    // Save to project
    if (!isSupabaseConfigured()) {
      const p = getProyecto(body.proyecto_id);
      if (!p) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
      updateProyecto(body.proyecto_id, {
        perfil_estilo_usuario: perfilEstilo,
        academic_memory: appendAITrace(p.academic_memory, {
          scope: "analyze-style",
          action: "analizar estilo",
          phase_id: "calibracion",
          phase_label: "Calibracion de estilo",
          status: "success",
          provider_id: providerId,
          provider_name: providerId,
          model: providerModel,
          duration_ms: Date.now() - aiStart,
        }),
      });
    } else {
      const db = createAdminClient();
      const { error } = await db
        .from("proyectos_fases")
        .update({ perfil_estilo_usuario: perfilEstilo } as never)
        .eq("id", body.proyecto_id)
        .eq("usuario_id", user.id);

      if (error) {
        // Supabase failed — save to memory store as fallback
        updateProyecto(body.proyecto_id, { perfil_estilo_usuario: perfilEstilo });
      }
    }

    return NextResponse.json({ ok: true, perfil_estilo_usuario: perfilEstilo });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
