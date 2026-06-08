import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { llamarIA } from "@/lib/aiProvider";
import { dbGetProyecto, dbUpdateProyecto } from "@/lib/db";
import { appendAITrace } from "@/lib/aiTrace.mjs";
import { buildAcademicContextBlock, normalizeRouteOptions, parseJsonFromAi } from "@/lib/academicProject.mjs";

type AcademicContext = Record<string, unknown> & {
  documentos?: Record<string, unknown>[];
  rutas_sugeridas?: unknown[];
  contexto_inicial?: Record<string, unknown>;
};

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export async function POST(req: Request) {
  try {
    const { user } = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const proyectoId = typeof body.proyecto_id === "string" ? body.proyecto_id : "";
    if (!proyectoId) {
      return NextResponse.json({ error: "proyecto_id es requerido" }, { status: 400 });
    }

    const proyecto = await dbGetProyecto(proyectoId);
    if (!proyecto || (proyecto.usuario_id !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
    }

    const inputContext = asObject(body.contexto);
    const academicContext = (proyecto.academic_context ?? {}) as AcademicContext;
    const contextoInicial = {
      ...asObject(academicContext.contexto_inicial),
      ...inputContext,
      tema: inputContext.tema ?? proyecto.tema_aprobado ?? proyecto.titulo_provisional ?? "",
    };
    const documentos = Array.isArray(academicContext.documentos) ? academicContext.documentos : [];
    const contextBlock = buildAcademicContextBlock({
      contract: null,
      studentContext: contextoInicial,
      documents: documentos,
      phaseMemory: [],
    });

    const system = `
Eres un asesor academico para monografias bolivianas. Debes proponer rutas posibles, no estilos artificiales.
Cada ruta debe ser viable, entregable y coherente con el material disponible. Si varias rutas naturalmente se parecen, no fuerces diferencias falsas.
Responde SOLO JSON valido.
`.trim();

    const userPrompt = `
${contextBlock}

Genera exactamente 3 opciones de ruta academica para este proyecto.
Cada opcion debe tener estos campos:
id, titulo, idea_central, problema, objetivo_general, alcance, materiales_prioritarios, justificacion.

El titulo debe estar mejorado si el estudiante ya dio uno, o propuesto si no dio titulo suficiente.
La justificacion debe explicar en lenguaje simple por que esa ruta conviene.
Formato obligatorio:
{"rutas":[{"id":"ruta-1","titulo":"","idea_central":"","problema":"","objetivo_general":"","alcance":"","materiales_prioritarios":[],"justificacion":""}]}
`.trim();

    let parsed: unknown;
    let proveedor = "";
    const aiStart = Date.now();
    try {
      const result = await llamarIA(system, userPrompt, 1800, proyecto.servicio_id);
      proveedor = `${result.provider} / ${result.model}`;
      parsed = parseJsonFromAi(result.text);
    } catch (e) {
      void dbUpdateProyecto(proyectoId, {
        academic_memory: appendAITrace(proyecto.academic_memory, {
          scope: "route-options",
          action: "generar rutas academicas",
          phase_id: "route-options",
          phase_label: "Opciones de ruta",
          status: "error",
          provider_id: "",
          provider_name: "",
          model: "",
          duration_ms: Date.now() - aiStart,
          error: (e as Error).message,
        }),
      });
      console.error(`[route-options] IA error: ${(e as Error).message}`);
      const msg = (e as Error).message.includes("temporales") || (e as Error).message.includes("intenta de nuevo")
        ? (e as Error).message
        : "Estamos teniendo problemas temporales para sugerirte opciones. Intenta de nuevo en unos minutos.";
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const rutas = normalizeRouteOptions(parsed);
    if (rutas.length === 0) {
      return NextResponse.json({ error: "La IA no devolvio rutas validas." }, { status: 502 });
    }

    const updatedContext: AcademicContext = {
      ...academicContext,
      contexto_inicial: contextoInicial,
      rutas_sugeridas: rutas,
    };
    const updated = await dbUpdateProyecto(proyectoId, {
      academic_context: updatedContext,
      academic_memory: appendAITrace(proyecto.academic_memory, {
        scope: "route-options",
        action: "generar rutas academicas",
        phase_id: "route-options",
        phase_label: "Opciones de ruta",
        status: "success",
        provider_id: proveedor.split(" / ")[0] ?? "",
        provider_name: proveedor.split(" / ")[0] ?? "",
        model: proveedor.split(" / ")[1] ?? "",
        duration_ms: Date.now() - aiStart,
      }),
      tema_aprobado: typeof contextoInicial.tema === "string" && contextoInicial.tema.trim()
        ? contextoInicial.tema.trim()
        : proyecto.tema_aprobado,
    });

    return NextResponse.json({ ok: true, rutas, proveedor, proyecto: updated });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
