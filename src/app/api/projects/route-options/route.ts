import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { llamarIA } from "@/lib/aiProvider";
import { getProyecto, updateProyecto } from "@/lib/memoryStore";
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

    const proyecto = getProyecto(proyectoId);
    if (!proyecto || proyecto.usuario_id !== user.id) {
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
    try {
      const result = await llamarIA(system, userPrompt, 1800, proyecto.servicio_id);
      proveedor = `${result.provider} / ${result.model}`;
      parsed = parseJsonFromAi(result.text);
    } catch (e) {
      return NextResponse.json({ error: `Error de IA: ${(e as Error).message}` }, { status: 502 });
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
    const updated = updateProyecto(proyectoId, {
      academic_context: updatedContext,
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
