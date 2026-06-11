/**
 * POST /api/projects/[id]/cuadernillo/[faseId]
 *   → genera (o regenera) el cuadernillo personal de UNA fase
 *
 * GET /api/projects/[id]/cuadernillo/[faseId]
 *   → devuelve el cuadernillo guardado (si existe)
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import { llamarIA, hydrateAIConfigAsync } from "@/lib/aiProvider";
import {
  SISTEMA_CUADERNILLO_ESTUDIANTE,
  buildCuadernilloUserPrompt,
  parseCuadernilloOutput,
} from "@/lib/prompts/cuadernillo-estudiante";
import { phaseDefinitionsForProject } from "@/lib/projectTypePhases";
import { dbGetCuadernillo, dbUpsertCuadernillo } from "@/lib/db/cuadernillos";

type Params = { params: Promise<{ id: string; faseId: string }> };

const SERVICIO_NOMBRES: Record<string, string> = {
  "mono-001": "Monografía Académica",
  "tesis-001": "Tesis de Grado",
  "proy-grado-001": "Proyecto de Grado",
  "proy-prod-001": "Proyecto de Grado (Producto)",
  "proy-serv-001": "Proyecto de Grado (Servicio)",
};

export async function GET(_req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id: proyectoId, faseId } = await params;
    const proyecto = await dbGetProyecto(proyectoId);
    if (!proyecto || (proyecto.usuario_id !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }
    const cuadernillo = await dbGetCuadernillo(proyectoId, faseId);
    return NextResponse.json({ ok: true, cuadernillo });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(_req: Request, { params }: Params) {
  const t0 = Date.now();
  try {
    const { user } = await requireAuth();
    const { id: proyectoId, faseId } = await params;

    const proyecto = await dbGetProyecto(proyectoId);
    if (!proyecto || (proyecto.usuario_id !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
    }

    // Resolver fase
    const phaseDefs = phaseDefinitionsForProject({
      servicioId: proyecto.servicio_id ?? "mono-001",
      tipoProyectoId: proyecto.tipo_proyecto_id ?? undefined,
      universidadId: (proyecto as { universidad_id?: string | null }).universidad_id ?? undefined,
      modalidadTitulacion: (proyecto as { modalidad_titulacion?: string | null }).modalidad_titulacion ?? undefined,
    });
    const phase = phaseDefs.find(p => p.id === faseId);
    if (!phase) {
      return NextResponse.json({ error: `Fase ${faseId} no encontrada en este proyecto` }, { status: 400 });
    }

    const phaseContents = (proyecto as unknown as { phase_contents?: Record<string, string | null> }).phase_contents ?? {};
    const contenidoCapitulo = phaseContents[faseId] ?? phaseContents[`${faseId}_borrador`] ?? "";
    if (!contenidoCapitulo.trim()) {
      return NextResponse.json({ error: "Esta fase aún no tiene contenido — generala primero." }, { status: 400 });
    }

    await hydrateAIConfigAsync();

    const tema = proyecto.tema_aprobado ?? proyecto.titulo_provisional ?? "Sin tema definido";
    const servicioNombre = SERVICIO_NOMBRES[proyecto.servicio_id ?? ""] ?? proyecto.servicio_id ?? "";

    const userPrompt = buildCuadernilloUserPrompt({
      proyectoId,
      faseId,
      faseLabel: phase.label ?? faseId,
      tema,
      servicioNombre,
      contenidoCapitulo,
    });

    console.log(`[cuadernillo] generando para proyecto=${proyectoId} fase=${faseId}`);

    const aiResult = await llamarIA(
      SISTEMA_CUADERNILLO_ESTUDIANTE,
      userPrompt,
      6000,
      proyecto.servicio_id ?? "mono-001",
    );

    console.log(`[cuadernillo] IA respondió: provider=${aiResult.provider} length=${aiResult.text.length}`);

    const cuadernillo = parseCuadernilloOutput(aiResult.text);
    if (!cuadernillo) {
      console.error(`[cuadernillo] parser falló. Texto: ${aiResult.text.slice(0, 500)}`);
      return NextResponse.json(
        {
          error: "La IA devolvió un cuadernillo en formato no parseable. Reintenta.",
          raw: aiResult.text.slice(0, 500),
        },
        { status: 502 },
      );
    }

    const duracionMs = Date.now() - t0;

    const saved = await dbUpsertCuadernillo({
      proyecto_id: proyectoId,
      fase_id: faseId,
      fase_label: phase.label ?? faseId,
      cuadernillo,
      modelo_ia_usado: `${aiResult.provider} / ${aiResult.model}`,
      duracion_ms: duracionMs,
    });

    return NextResponse.json({
      ok: true,
      cuadernillo,
      persisted: saved.ok,
      proveedor: `${aiResult.provider} / ${aiResult.model}`,
      duracion_ms: duracionMs,
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[cuadernillo] error:", e);
    return NextResponse.json({ error: (e as Error).message ?? "Error interno" }, { status: 500 });
  }
}
