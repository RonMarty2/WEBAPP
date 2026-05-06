import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { getServiceAIStatus, llamarIA } from "@/lib/aiProvider";
import { getProyecto, updateProyecto } from "@/lib/memoryStore";
import { phaseDefinitionsForProject } from "@/lib/projectTypePhases";
import { appendAITrace } from "@/lib/aiTrace.mjs";
import {
  buildDisplayFinalDocument,
  buildFinalConsolidationPrompt,
  validateFinalDocument,
} from "@/lib/academicProject.mjs";

type AcademicContext = Record<string, unknown> & {
  contexto_inicial?: Record<string, unknown>;
  documentos?: Record<string, unknown>[];
  ruta_elegida?: Record<string, unknown>;
};

type AcademicMemory = Record<string, unknown> & {
  phase_summaries?: Record<string, unknown>[];
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function getLegacyContent(proyecto: Record<string, unknown>, index: number): string | null {
  const value = proyecto[`contenido_fase_${index}`];
  return typeof value === "string" && value.trim() ? value : null;
}

function collectPhaseContents(proyecto: Record<string, unknown>) {
  const phaseContents = asRecord(proyecto.phase_contents);
  const servicioId = typeof proyecto.servicio_id === "string" ? proyecto.servicio_id : "mono-001";
  const tipoProyectoId = typeof proyecto.tipo_proyecto_id === "string" ? proyecto.tipo_proyecto_id : undefined;
  const phaseDefs = phaseDefinitionsForProject({ servicioId, tipoProyectoId });

  if (phaseDefs.length > 0) {
    return [...phaseDefs]
      .sort((a, b) => a.orden - b.orden)
      .map((phase, index) => {
        const raw = phaseContents[phase.id] ?? phaseContents[String(index)] ?? getLegacyContent(proyecto, index);
        return {
          label: phase.label,
          content: typeof raw === "string" ? raw : null,
        };
      })
      .filter((item) => item.content?.trim());
  }

  return Array.from({ length: 6 }, (_, index) => {
    const raw = phaseContents[String(index)] ?? getLegacyContent(proyecto, index);
    return {
      label: `Capitulo ${index + 1}`,
      content: typeof raw === "string" ? raw : null,
    };
  }).filter((item) => item.content?.trim());
}

function buildLocalFinalDocument(phaseContents: { label: string; content: string | null }[]) {
  return buildDisplayFinalDocument(phaseContents);
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
    const body = await req.json().catch(() => ({}));
    const proyectoId = typeof body.proyecto_id === "string" ? body.proyecto_id : "";
    if (!proyectoId) {
      return NextResponse.json({ error: "proyecto_id es requerido" }, { status: 400 });
    }

    const proyecto = getProyecto(proyectoId);
    if (!proyecto || proyecto.usuario_id !== user.id) {
      return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
    }

    const academicContext = (proyecto.academic_context ?? {}) as AcademicContext;
    const academicMemory = (proyecto.academic_memory ?? {}) as AcademicMemory;
    const phaseContents = collectPhaseContents(proyecto as unknown as Record<string, unknown>);
    const documents = Array.isArray(academicContext.documentos) ? academicContext.documentos : [];
    const phaseMemory = Array.isArray(academicMemory.phase_summaries) ? academicMemory.phase_summaries : [];
    const studentContext = {
      ...asRecord(academicContext.contexto_inicial),
      tema: academicContext.contexto_inicial?.tema ?? proyecto.tema_aprobado ?? proyecto.titulo_provisional ?? "",
    };

    const prompt = buildFinalConsolidationPrompt({
      contract: academicContext.ruta_elegida ?? {
        titulo: proyecto.titulo_provisional ?? proyecto.tema_aprobado,
        idea_central: proyecto.tema_aprobado ?? proyecto.titulo_provisional,
      },
      studentContext,
      documents,
      phaseMemory,
      phaseContents,
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
      finalText = buildDisplayFinalDocument([{ label: "Documento final", content: result.text }]);
    } catch (e) {
      traceStatus = "fallback";
      traceProviderId = "local";
      traceModel = "ensamblado-sin-ia";
      traceError = (e as Error).message;
      proveedor = "local / ensamblado sin IA";
      finalText = buildLocalFinalDocument(phaseContents);
      if (!finalText.trim()) {
        updateProyecto(proyectoId, {
          academic_memory: appendAITrace(academicMemory, buildFinalAITraceEntry({
            servicioId: proyecto.servicio_id,
            status: "error",
            durationMs: Date.now() - aiStart,
            error: (e as Error).message,
          })),
        });
        return NextResponse.json({ error: `Error de IA: ${(e as Error).message}` }, { status: 502 });
      }
    }

    let validation = validateFinalDocument(finalText);
    if (!validation.ok) {
      try {
        finalText = buildDisplayFinalDocument([{ label: "Documento final reparado", content: await repairFinalDocument({
          dirtyText: finalText,
          errors: validation.errors,
          servicioId: proyecto.servicio_id,
        }) }]);
        validation = validateFinalDocument(finalText);
      } catch {
        // Return the validation errors below; the first final text is still stored for inspection.
      }
    }

    const updatedPhaseContents = {
      ...(proyecto.phase_contents ?? {}),
      __final_document: finalText,
    };

    const traceEntry = buildFinalAITraceEntry({
      servicioId: proyecto.servicio_id,
      status: traceStatus,
      providerId: traceProviderId,
      model: traceModel,
      durationMs: Date.now() - aiStart,
      error: traceError,
    });

    const updated = updateProyecto(proyectoId, {
      phase_contents: updatedPhaseContents,
      final_document: finalText,
      final_document_validation: validation as unknown as Record<string, unknown>,
      completado: validation.ok,
      academic_memory: appendAITrace(academicMemory, traceEntry),
    });

    return NextResponse.json({
      ok: validation.ok,
      proveedor,
      final_document: finalText,
      validation,
      ai_trace_entry: traceEntry,
      proyecto: updated,
    }, { status: validation.ok ? 200 : 422 });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
