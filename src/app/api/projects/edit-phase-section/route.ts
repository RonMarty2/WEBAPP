/**
 * POST /api/projects/edit-phase-section
 * Applies a chat observation to an existing phase without regenerating it from zero.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { getServiceAIStatus, llamarIA } from "@/lib/aiProvider";
import { getProyecto, updateProyecto } from "@/lib/memoryStore";
import { appendAITrace } from "@/lib/aiTrace.mjs";
import { loadFromDisk } from "@/lib/persistence";
import { phaseDefinitionsForProject } from "@/lib/projectTypePhases";
import { summarizePhaseForMemory } from "@/lib/academicProject.mjs";
import { DEFAULT_PHASES } from "@/app/api/admin/workspace-prompts/route";

const FASE_ETIQUETA: Record<number, string> = {
  0: "Fase 0 - Planteamiento del Tema",
  1: "Fase 1 - Capitulo I: Marco Referencial",
  2: "Fase 2 - Capitulo II: Marco Teorico",
  3: "Fase 3 - Capitulos III-V: Desarrollo",
  4: "Fase 4 - Revision y Compilacion",
  5: "Fase 5 - Conclusiones y Bibliografia",
};

const FASE_A_COLUMNA: Record<number, string> = {
  0: "contenido_fase_0",
  1: "contenido_fase_1",
  2: "contenido_fase_2",
  3: "contenido_fase_3",
  4: "contenido_fase_4",
  5: "contenido_fase_5",
};

type ProyectoLike = {
  id: string;
  usuario_id: string;
  servicio_id?: string | null;
  tipo_proyecto_id?: string | null;
  estado_fase?: number;
  phase_contents?: Record<string, string | null>;
  academic_memory?: Record<string, unknown>;
  perfil_estilo_usuario?: string | null;
  final_document?: string | null;
  final_document_validation?: Record<string, unknown>;
};

function loadHilosFromDisk(): string[] {
  try {
    return loadFromDisk().workspacePrompts?.hilos?.filter(Boolean) ?? [];
  } catch {
    return [];
  }
}

function loadEditPromptFromDisk(): string {
  try {
    return loadFromDisk().workspacePrompts?.phases?.["edicion-chat"]
      ?? DEFAULT_PHASES["edicion-chat"];
  } catch {
    return DEFAULT_PHASES["edicion-chat"];
  }
}

function buildSystemPrompt(prompt: string, perfilEstilo: string | null | undefined, hilos: string[]) {
  return [
    prompt,
    perfilEstilo?.trim()
      ? `\n=== PERFIL DE ESTILO DEL USUARIO ===\n${perfilEstilo.trim()}\n=== FIN DEL PERFIL ===`
      : "",
    hilos.length
      ? `\n=== REGLAS INMUTABLES (HILO CONDUCTOR) ===\n${hilos.map((h, i) => `${i + 1}. ${h}`).join("\n")}\n=== FIN ===`
      : "",
  ].filter(Boolean).join("\n");
}

function buildAITraceEntry(input: {
  servicioId: string;
  phaseId: string;
  phaseLabel: string;
  status: "success" | "error";
  providerId?: string;
  model?: string;
  durationMs: number;
  error?: string | null;
}) {
  const configured = getServiceAIStatus(input.servicioId);
  return {
    scope: "edit-phase-section",
    action: "edicion puntual por chat",
    phase_id: input.phaseId,
    phase_label: input.phaseLabel,
    provider_id: input.providerId ?? configured.provider_id,
    provider_name: configured.provider_name,
    model: input.model ?? configured.model,
    status: input.status,
    duration_ms: input.durationMs,
    error: input.error ?? null,
  };
}

function upsertPhaseSummary(
  memory: Record<string, unknown> | undefined,
  phaseKey: string,
  phaseLabel: string,
  content: string
) {
  const academicMemory = memory ?? {};
  const existing = Array.isArray(academicMemory.phase_summaries)
    ? academicMemory.phase_summaries as Record<string, unknown>[]
    : [];
  const summary = {
    phase_key: phaseKey,
    ...summarizePhaseForMemory(phaseLabel, content),
  };
  return {
    ...academicMemory,
    phase_summaries: [
      ...existing.filter((item) => item.phase_key !== phaseKey),
      summary,
    ],
  };
}

function resolvePhase(proyecto: ProyectoLike, phaseId?: string, faseNumero?: number) {
  if (phaseId) {
    const phaseDefs = phaseDefinitionsForProject({
      servicioId: proyecto.servicio_id ?? "mono-001",
      tipoProyectoId: proyecto.tipo_proyecto_id ?? undefined,
    });
    const found = phaseDefs.find((phase) => phase.id === phaseId);
    return {
      key: phaseId,
      label: found?.label ?? phaseId,
      legacyColumn: null as string | null,
    };
  }

  const key = String(faseNumero ?? 0);
  return {
    key,
    label: FASE_ETIQUETA[faseNumero ?? 0] ?? `Fase ${key}`,
    legacyColumn: FASE_A_COLUMNA[faseNumero ?? 0] ?? null,
  };
}

function currentContentFor(proyecto: ProyectoLike, key: string, legacyColumn: string | null) {
  return proyecto.phase_contents?.[key]
    ?? (legacyColumn ? (proyecto as Record<string, unknown>)[legacyColumn] as string | null : null)
    ?? null;
}

async function editWithAI({
  proyecto,
  key,
  label,
  contenidoActual,
  observacion,
  t0,
}: {
  proyecto: ProyectoLike;
  key: string;
  label: string;
  contenidoActual: string;
  observacion: string;
  t0: number;
}) {
  const servicioId = proyecto.servicio_id ?? "mono-001";
  const systemPrompt = buildSystemPrompt(
    loadEditPromptFromDisk(),
    proyecto.perfil_estilo_usuario,
    loadHilosFromDisk()
  );
  const userPrompt = `FASE A EDITAR: ${label}

--- CONTENIDO ACTUAL ---
${contenidoActual}

--- OBSERVACION APLICAR ---
${observacion}

Devuelve el contenido completo de la fase corregida.`;

  const result = await llamarIA(systemPrompt, userPrompt, 3500, servicioId);
  const traceEntry = buildAITraceEntry({
    servicioId,
    phaseId: key,
    phaseLabel: label,
    status: "success",
    providerId: result.provider,
    model: result.model,
    durationMs: Date.now() - t0,
  });

  return {
    contenido: result.text,
    proveedor: `${result.provider} / ${result.model}`,
    traceEntry,
  };
}

export async function POST(req: Request) {
  const t0 = Date.now();

  try {
    const { user } = await requireAuth();
    const body = await req.json() as {
      proyecto_id?: string;
      phase_id?: string;
      fase_numero?: number;
      mensaje_usuario?: string;
    };

    const proyectoId = body.proyecto_id?.trim();
    const observacion = body.mensaje_usuario?.trim();
    if (!proyectoId || !observacion) {
      return NextResponse.json({ error: "proyecto_id y mensaje_usuario son obligatorios" }, { status: 400 });
    }

    const memoryProject = getProyecto(proyectoId);
    if (memoryProject) {
      if (memoryProject.usuario_id !== user.id) {
        return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
      }

      const phase = resolvePhase(memoryProject, body.phase_id, body.fase_numero);
      const contenidoActual = currentContentFor(memoryProject, phase.key, phase.legacyColumn);
      if (!contenidoActual?.trim()) {
        return NextResponse.json({ error: "No hay contenido existente para ajustar en esta fase." }, { status: 400 });
      }

      const { contenido, proveedor, traceEntry } = await editWithAI({
        proyecto: memoryProject,
        key: phase.key,
        label: phase.label,
        contenidoActual,
        observacion,
        t0,
      });

      const phaseContents = { ...(memoryProject.phase_contents ?? {}), [phase.key]: contenido };
      const nextMemory = appendAITrace(
        upsertPhaseSummary(memoryProject.academic_memory, phase.key, phase.label, contenido),
        traceEntry
      );
      const updates: Partial<typeof memoryProject> & Record<string, unknown> = {
        phase_contents: phaseContents,
        academic_memory: nextMemory,
        final_document: null,
        final_document_validation: {},
      };
      if (phase.legacyColumn) updates[phase.legacyColumn] = contenido;
      updateProyecto(proyectoId, updates);

      return NextResponse.json({
        ok: true,
        phase_id: phase.key,
        fase_etiqueta: phase.label,
        proveedor,
        duracion_ms: Date.now() - t0,
        contenido,
        ai_trace_entry: traceEntry,
      });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
    }

    const db = createAdminClient();
    const { data: proyecto, error } = await db
      .from("proyectos_fases")
      .select("*")
      .eq("id", proyectoId)
      .eq("usuario_id", user.id)
      .maybeSingle();

    if (error || !proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
    }

    const supabaseProject = proyecto as ProyectoLike;
    const phase = resolvePhase(supabaseProject, body.phase_id, body.fase_numero);
    const contenidoActual = currentContentFor(supabaseProject, phase.key, phase.legacyColumn);
    if (!contenidoActual?.trim()) {
      return NextResponse.json({ error: "No hay contenido existente para ajustar en esta fase." }, { status: 400 });
    }

    const { contenido, proveedor, traceEntry } = await editWithAI({
      proyecto: supabaseProject,
      key: phase.key,
      label: phase.label,
      contenidoActual,
      observacion,
      t0,
    });

    const phaseContents = { ...(supabaseProject.phase_contents ?? {}), [phase.key]: contenido };
    const updatePayload: Record<string, unknown> = {
      phase_contents: phaseContents,
      academic_memory: appendAITrace(
        upsertPhaseSummary(supabaseProject.academic_memory, phase.key, phase.label, contenido),
        traceEntry
      ),
      final_document: null,
      final_document_validation: {},
    };
    if (phase.legacyColumn) updatePayload[phase.legacyColumn] = contenido;

    await db.from("proyectos_fases").update(updatePayload as never).eq("id", proyectoId);

    return NextResponse.json({
      ok: true,
      phase_id: phase.key,
      fase_etiqueta: phase.label,
      proveedor,
      duracion_ms: Date.now() - t0,
      contenido,
      ai_trace_entry: traceEntry,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
