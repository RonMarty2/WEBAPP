import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { getServiceAIStatus, llamarIA, hydrateAIConfigAsync } from "@/lib/aiProvider";
import { dbGetProyecto, dbUpdateProyecto } from "@/lib/db";
import { phaseDefinitionsForProject } from "@/lib/projectTypePhases";
import { appendAITrace } from "@/lib/aiTrace.mjs";
import {
  buildDisplayFinalDocument,
  buildFinalConsolidationPrompt,
  validateFinalDocument,
} from "@/lib/academicProject.mjs";
import {
  buildContextualReferences,
  readReferenceCatalog,
  withUpdatedReferenceCatalog,
} from "@/lib/projectReferences.mjs";

type AcademicContext = Record<string, unknown> & {
  contexto_inicial?: Record<string, unknown>;
  documentos?: Record<string, unknown>[];
  ruta_elegida?: Record<string, unknown>;
};

type AcademicMemory = Record<string, unknown> & {
  phase_summaries?: Record<string, unknown>[];
  reference_catalog?: string[];
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function firstNonEmptyString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function collectPhaseContents(proyecto: Record<string, unknown>) {
  const phaseContents = asRecord(proyecto.phase_contents);
  const servicioId = typeof proyecto.servicio_id === "string" ? proyecto.servicio_id : "mono-001";
  const tipoProyectoId = typeof proyecto.tipo_proyecto_id === "string" ? proyecto.tipo_proyecto_id : undefined;
  const phaseDefs = phaseDefinitionsForProject({ servicioId, tipoProyectoId });

  if (phaseDefs.length > 0) {
    return [...phaseDefs]
      .sort((a, b) => a.orden - b.orden)
      .map((phase) => {
        const raw = phaseContents[phase.id];
        return {
          label: phase.label,
          content: typeof raw === "string" ? raw : null,
        };
      })
      .filter((item) => item.content?.trim());
  }

  // Fallback defensivo si el proyecto no tiene fases definidas (caso raro).
  return Object.entries(phaseContents)
    .filter(([key]) => !key.includes("_borrador") && !key.startsWith("__"))
    .map(([key, value]) => ({
      label: key,
      content: typeof value === "string" ? value : null,
    }))
    .filter((item) => item.content?.trim());
}

function buildLocalFinalDocument(
  phaseContents: { label: string; content: string | null }[],
  input: {
    referenceCatalog?: string[];
    annexes?: string[];
  } = {}
) {
  return buildDisplayFinalDocument(phaseContents, input);
}

function buildFinalAITraceEntry(input: {
  servicioId: string;
  status: "success" | "error" | "fallback";
  providerId?: string;
  providerName?: string;
  model?: string;
  durationMs: number;
  error?: string | null;
}) {
  const configured = getServiceAIStatus(input.servicioId);
  return {
    scope: "finalize",
    action: "generar documento final",
    phase_id: "__final_document",
    phase_label: "Documento final",
    provider_id: input.providerId ?? configured.provider_id,
    provider_name: input.providerName ?? (input.providerId === "local" ? "Local" : configured.provider_name),
    model: input.model ?? configured.model,
    status: input.status,
    duration_ms: input.durationMs,
    error: input.error ?? null,
  };
}

async function repairFinalDocument(input: {
  dirtyText: string;
  errors: string[];
  servicioId: string;
}) {
  const system = `
Eres un editor academico. Corrige el documento para que sea una monografia final entregable.
Elimina marcas internas, etiquetas de fase, placeholders y notas del sistema.
Mantén una estructura con capitulos I, II, III, IV, V y referencias bibliograficas.
Responde solo el documento corregido en Markdown.
`.trim();
  const user = `
Errores detectados:
${input.errors.map((error) => `- ${error}`).join("\n")}

Documento a corregir:
${input.dirtyText}
`.trim();
  const result = await llamarIA(system, user, 8000, input.servicioId);
  return result.text;
}

export async function POST(req: Request) {
  try {
    const { user } = await requireAuth();
    // Hidratar caches de IA desde Supabase
    await hydrateAIConfigAsync();
    const body = await req.json().catch(() => ({}));
    const proyectoId = typeof body.proyecto_id === "string" ? body.proyecto_id : "";
    if (!proyectoId) {
      return NextResponse.json({ error: "proyecto_id es requerido" }, { status: 400 });
    }

    const proyecto = await dbGetProyecto(proyectoId);
    if (!proyecto || (proyecto.usuario_id !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
    }

    const t0 = Date.now();
    const steps: Array<{ name: string; status: "pending" | "running" | "completed" | "error"; duration_ms: number }> = [
      { name: "Consolidación de Referencias", status: "running", duration_ms: 0 },
      { name: "Control Final de Calidad", status: "pending", duration_ms: 0 },
      { name: "Compilación LaTeX", status: "pending", duration_ms: 0 },
    ];

    // PASO 1: Consolidación de Referencias
    const step1Start = Date.now();
    const academicContext = (proyecto.academic_context ?? {}) as AcademicContext;
    const academicMemory = (proyecto.academic_memory ?? {}) as AcademicMemory;
    const phaseContents = collectPhaseContents(proyecto as unknown as Record<string, unknown>);
    const documents = Array.isArray(academicContext.documentos) ? academicContext.documentos : [];
    const phaseMemory = Array.isArray(academicMemory.phase_summaries) ? academicMemory.phase_summaries : [];
    const projectTopic = firstNonEmptyString(
      academicContext.contexto_inicial?.tema,
      proyecto.tema_aprobado,
      proyecto.titulo_provisional
    );
    const referenceCatalog = [
      ...readReferenceCatalog(academicMemory),
      ...buildContextualReferences({
        topic: projectTopic,
        route: academicContext.ruta_elegida ?? {},
        studentContext: academicContext.contexto_inicial ?? {},
        documents,
      }),
    ];
    const studentContext = {
      ...asRecord(academicContext.contexto_inicial),
      tema: projectTopic,
    };
    steps[0].duration_ms = Date.now() - step1Start;
    steps[0].status = "completed";
    steps[1].status = "running";

    // PASO 2: Control Final de Calidad
    const step2Start = Date.now();
    const prompt = buildFinalConsolidationPrompt({
      contract: academicContext.ruta_elegida ?? {
        titulo: proyecto.titulo_provisional ?? proyecto.tema_aprobado,
        idea_central: proyecto.tema_aprobado ?? proyecto.titulo_provisional,
      },
      studentContext,
      documents,
      phaseMemory,
      phaseContents,
      referenceCatalog,
      formatRules: "Documento en español academico, tono formal, capitulos numerados, referencias en estilo APA 7 cuando sea posible.",
    });

    let proveedor = "";
    let finalText = "";
    let traceStatus: "success" | "fallback" = "success";
    let traceProviderId = "";
    let traceModel = "";
    let traceError: string | null = null;
    const aiStart = Date.now();
    try {
      const result = await llamarIA(prompt.system, prompt.user, 9000, proyecto.servicio_id);
      traceProviderId = result.provider;
      traceModel = result.model;
      proveedor = `${result.provider} / ${result.model}`;
      finalText = buildDisplayFinalDocument(
        [{ label: "Documento final", content: result.text }],
        {
          referenceCatalog,
        }
      );
    } catch (e) {
      traceStatus = "fallback";
      traceProviderId = "local";
      traceModel = "ensamblado-sin-ia";
      traceError = (e as Error).message;
      proveedor = "local / ensamblado sin IA";
      finalText = buildLocalFinalDocument(phaseContents, {
        referenceCatalog,
      });
      if (!finalText.trim()) {
        steps[1].status = "error";
        steps[1].duration_ms = Date.now() - step2Start;
        void dbUpdateProyecto(proyectoId, {
          academic_memory: appendAITrace(academicMemory, buildFinalAITraceEntry({
            servicioId: proyecto.servicio_id,
            status: "error",
            durationMs: Date.now() - aiStart,
            error: (e as Error).message,
          })),
        });
        const errMsg = (e as Error).message;
        console.error(`[finalize] IA error: ${errMsg}`);
        return NextResponse.json({
          error: errMsg.includes("temporales") || errMsg.includes("intentá de nuevo")
            ? errMsg
            : "Estamos teniendo problemas temporales para finalizar el documento. Intentá de nuevo en unos minutos.",
          steps,
        }, { status: 502 });
      }
    }

    let validation = validateFinalDocument(finalText);
    if (!validation.ok) {
      try {
        finalText = buildDisplayFinalDocument(
          [{
            label: "Documento final reparado",
            content: await repairFinalDocument({
              dirtyText: finalText,
              errors: validation.errors,
              servicioId: proyecto.servicio_id,
            }),
          }],
          {
            referenceCatalog,
          }
        );
        validation = validateFinalDocument(finalText);
      } catch {
        // Continue with unrepaired text
      }
    }
    steps[1].duration_ms = Date.now() - step2Start;
    steps[1].status = "completed";
    steps[2].status = "running";

    // PASO 3: Compilación LaTeX (ensamblaje)
    const step3Start = Date.now();

    const updatedPhaseContents = {
      ...(proyecto.phase_contents ?? {}),
      __final_document: finalText,
    };

    const nextAcademicMemory = withUpdatedReferenceCatalog(
      academicMemory,
      finalText,
      buildContextualReferences({
        topic: projectTopic,
        route: academicContext.ruta_elegida ?? {},
        studentContext: academicContext.contexto_inicial ?? {},
        documents,
      })
    );
    const traceEntry = buildFinalAITraceEntry({
      servicioId: proyecto.servicio_id,
      status: traceStatus,
      providerId: traceProviderId,
      model: traceModel,
      durationMs: Date.now() - aiStart,
      error: traceError,
    });

    const updated = await dbUpdateProyecto(proyectoId, {
      phase_contents: updatedPhaseContents,
      final_document: finalText,
      final_document_validation: validation as unknown as Record<string, unknown>,
      completado: validation.ok,
      academic_memory: appendAITrace(nextAcademicMemory, traceEntry),
    });

    steps[2].duration_ms = Date.now() - step3Start;
    steps[2].status = "completed";

    return NextResponse.json({
      ok: validation.ok,
      proveedor,
      final_document: finalText,
      validation,
      ai_trace_entry: traceEntry,
      proyecto: updated,
      steps,
      total_duration_ms: Date.now() - t0,
    }, { status: validation.ok ? 200 : 422 });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno", steps: [] }, { status: 500 });
  }
}
