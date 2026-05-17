/**
 * POST /api/projects/edit-phase-section
 * Applies a chat observation to an existing phase without regenerating it from zero.
 */

import { NextResponse } from "next/server";
import { requirePlan, AuthError } from "@/lib/api-auth";
import { getServiceAIStatus, llamarIA, hydrateAIConfigAsync } from "@/lib/aiProvider";
import { dbGetProyecto, dbUpdateProyecto } from "@/lib/db";
import { appendAITrace } from "@/lib/aiTrace.mjs";
import { loadFromDisk } from "@/lib/persistence";
import { phaseDefinitionsForProject } from "@/lib/projectTypePhases";
import { summarizePhaseForMemory } from "@/lib/academicProject.mjs";
import { DEFAULT_PHASES } from "@/app/api/admin/workspace-prompts/route";

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

function resolvePhase(proyecto: ProyectoLike, phaseId: string) {
  const phaseDefs = phaseDefinitionsForProject({
    servicioId: proyecto.servicio_id ?? "mono-001",
    tipoProyectoId: proyecto.tipo_proyecto_id ?? undefined,
  });
  const found = phaseDefs.find((phase) => phase.id === phaseId);
  return {
    key: phaseId,
    label: found?.label ?? phaseId,
  };
}

function currentContentFor(proyecto: ProyectoLike, key: string) {
  return proyecto.phase_contents?.[key] ?? null;
}

/**
 * Modos de edición soportados. Cada modo genera instrucciones específicas
 * para la IA y limita el alcance del cambio.
 */
export type TipoEdicion =
  /** Reformula el contenido completo del capítulo aplicando la observación.
   *  Modo por defecto, compatible con comportamiento anterior. */
  | "reformular"
  /** Solo AGREGA contenido nuevo (sección, párrafo, bullet). NO modifica lo existente.
   *  Útil para observaciones tipo "agregar Justificación Académica". */
  | "agregar"
  /** Reformula SOLO un bloque/sección específico identificado por marcador.
   *  El parámetro `bloque` indica qué buscar (ej. "1.3 Objetivos"). */
  | "reformular_bloque";

function buildEditInstructions(tipo: TipoEdicion, bloque?: string): string {
  switch (tipo) {
    case "agregar":
      return `MODO: AGREGAR contenido nuevo SIN modificar lo existente.

REGLAS ABSOLUTAS:
1. NO modifiques NINGUNA palabra del contenido actual.
2. Tu tarea es ÚNICAMENTE agregar lo que la observación pide (una nueva sección, párrafo, viñeta, etc.).
3. Insértalo en el lugar lógico (ej. si pide agregar una sub-sección 1.4.2, ponla entre 1.4.1 y 1.4.3 existentes).
4. Devuelve el documento COMPLETO con la adición incluida.
5. Si después de tu edición comparamos línea por línea con el original, TODAS las líneas originales deben aparecer intactas. Solo se agregan líneas nuevas.`;

    case "reformular_bloque":
      return `MODO: REFORMULAR SOLO el bloque "${bloque ?? "indicado"}".

REGLAS ABSOLUTAS:
1. Identifica en el contenido actual el bloque/sección titulado "${bloque ?? "indicado"}".
2. Reformula SOLO ese bloque aplicando la observación.
3. Todo lo demás del documento debe quedar EXACTAMENTE igual, palabra por palabra.
4. Devuelve el documento COMPLETO con el bloque reformulado en su lugar.
5. Si el bloque no se encuentra, devuelve el contenido sin cambios y añade un comentario al inicio: "[NOTA: bloque ${bloque} no encontrado]".`;

    case "reformular":
    default:
      return `MODO: REFORMULAR el documento aplicando la observación.

REGLAS:
1. Ajusta SOLO lo necesario para atender la observación.
2. Conserva el estilo y la voz del autor existente.
3. Si la observación afecta solo una sección, NO toques las demás.
4. Devuelve el documento COMPLETO con los cambios incluidos.`;
  }
}

async function editWithAI({
  proyecto,
  key,
  label,
  contenidoActual,
  observacion,
  tipo,
  bloque,
  t0,
}: {
  proyecto: ProyectoLike;
  key: string;
  label: string;
  contenidoActual: string;
  observacion: string;
  tipo: TipoEdicion;
  bloque?: string;
  t0: number;
}) {
  const servicioId = proyecto.servicio_id ?? "mono-001";
  const systemPrompt = buildSystemPrompt(
    loadEditPromptFromDisk(),
    proyecto.perfil_estilo_usuario,
    loadHilosFromDisk()
  );
  const instrucciones = buildEditInstructions(tipo, bloque);
  const userPrompt = `FASE A EDITAR: ${label}

${instrucciones}

--- CONTENIDO ACTUAL ---
${contenidoActual}

--- OBSERVACION A APLICAR ---
${observacion}

Devuelve el contenido completo de la fase con los cambios aplicados.`;

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
    const { user } = await requirePlan(["pro", "elite"]);
    // Hidratar caches de IA desde Supabase
    await hydrateAIConfigAsync();
    const body = await req.json() as {
      proyecto_id?: string;
      phase_id?: string;
      mensaje_usuario?: string;
      /** "preview" devuelve el resultado SIN persistir. "aplicar" persiste. Default: "aplicar". */
      modo?: "preview" | "aplicar";
      /** Estrategia de edición. Default: "reformular". */
      tipo_edicion?: TipoEdicion;
      /** Identificador del bloque a reformular (requerido si tipo_edicion="reformular_bloque"). */
      bloque?: string;
    };

    const proyectoId = body.proyecto_id?.trim();
    const phaseId = body.phase_id?.trim();
    const observacion = body.mensaje_usuario?.trim();
    const modo = body.modo === "preview" ? "preview" : "aplicar";
    const tipoEdicion: TipoEdicion = body.tipo_edicion ?? "reformular";
    const bloque = body.bloque?.trim();

    if (!proyectoId || !phaseId || !observacion) {
      return NextResponse.json({ error: "proyecto_id, phase_id y mensaje_usuario son obligatorios" }, { status: 400 });
    }
    if (tipoEdicion === "reformular_bloque" && !bloque) {
      return NextResponse.json({ error: "tipo_edicion='reformular_bloque' requiere el parámetro 'bloque'" }, { status: 400 });
    }

    const proyecto = await dbGetProyecto(proyectoId);
    if (!proyecto || (proyecto.usuario_id !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
    }

    const phase = resolvePhase(proyecto, phaseId);
    const contenidoActual = currentContentFor(proyecto, phase.key);
    if (!contenidoActual?.trim()) {
      return NextResponse.json({ error: "No hay contenido existente para ajustar en esta fase." }, { status: 400 });
    }

    const { contenido, proveedor, traceEntry } = await editWithAI({
      proyecto,
      key: phase.key,
      label: phase.label,
      contenidoActual,
      observacion,
      tipo: tipoEdicion,
      bloque,
      t0,
    });

    // En modo PREVIEW NO persistimos: devolvemos el contenido nuevo + el actual
    // para que el cliente pueda mostrar un diff y decidir si aplicar.
    if (modo === "preview") {
      return NextResponse.json({
        ok: true,
        modo: "preview",
        phase_id: phase.key,
        fase_etiqueta: phase.label,
        tipo_edicion: tipoEdicion,
        bloque: bloque ?? null,
        contenido_actual: contenidoActual,
        contenido_propuesto: contenido,
        proveedor,
        duracion_ms: Date.now() - t0,
      });
    }

    // Modo APLICAR: persistir cambios en el store.
    const phaseContents = { ...(proyecto.phase_contents ?? {}), [phase.key]: contenido };
    const updates: Record<string, unknown> = {
      phase_contents: phaseContents,
      academic_memory: appendAITrace(
        upsertPhaseSummary(proyecto.academic_memory, phase.key, phase.label, contenido),
        traceEntry
      ),
      final_document: null,
      final_document_validation: {},
    };
    await dbUpdateProyecto(proyectoId, updates);

    return NextResponse.json({
      ok: true,
      modo: "aplicar",
      phase_id: phase.key,
      fase_etiqueta: phase.label,
      tipo_edicion: tipoEdicion,
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
