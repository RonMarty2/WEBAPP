/**
 * POST /api/projects/[id]/analizar-observacion
 *
 * Analiza una observación del tutor ANTES de aplicarla. Llama al
 * "Analizador de Pertinencia" (un agente IA crítico) que decide:
 *   - aplicar              → cambio pertinente, devuelve diff propuesto
 *   - aplicar_con_reserva  → pertinente con caveat, devuelve diff + warning
 *   - rechazar             → no pertinente, devuelve justificación para tutor
 *
 * El resultado se guarda en la tabla observaciones_banco (acumulando
 * conocimiento del SaaS) y se devuelve al cliente para que muestre el
 * modal apropiado.
 *
 * Body: { phase_id: string, observacion: string }
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import { llamarIA, hydrateAIConfigAsync } from "@/lib/aiProvider";
import {
  SISTEMA_ANALIZADOR_PERTINENCIA,
  buildAnalizadorUserPrompt,
  parseAnalizadorOutput,
} from "@/lib/prompts/analizador-pertinencia";
import { phaseDefinitionsForProject } from "@/lib/projectTypePhases";
import { dbInsertObservacionBanco } from "@/lib/db/observacionesBanco";

type Params = { params: Promise<{ id: string }> };

const SERVICIO_NOMBRES: Record<string, string> = {
  "mono-001": "Monografía Académica",
  "tesis-001": "Tesis de Grado",
  "proy-grado-001": "Proyecto de Grado",
  "proy-prod-001": "Proyecto de Grado (Producto)",
  "proy-serv-001": "Proyecto de Grado (Servicio)",
};

export async function POST(req: Request, { params }: Params) {
  const t0 = Date.now();

  try {
    const { user } = await requireAuth();
    const { id: proyectoId } = await params;

    // Validar acceso al proyecto
    const proyecto = await dbGetProyecto(proyectoId);
    if (!proyecto || (proyecto.usuario_id !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
    }

    const body = (await req.json()) as { phase_id?: string; observacion?: string };
    const phaseId = body.phase_id?.trim();
    const observacion = body.observacion?.trim();

    if (!phaseId || !observacion) {
      return NextResponse.json(
        { error: "phase_id y observacion son requeridos" },
        { status: 400 },
      );
    }

    // Resolver fase y contenido actual
    const phaseDefs = phaseDefinitionsForProject({
      servicioId: proyecto.servicio_id ?? "mono-001",
      tipoProyectoId: proyecto.tipo_proyecto_id ?? undefined,
    });
    const phase = phaseDefs.find((p) => p.id === phaseId);
    if (!phase) {
      return NextResponse.json({ error: `Fase ${phaseId} no encontrada` }, { status: 400 });
    }

    const phaseContents = (proyecto as unknown as { phase_contents?: Record<string, string | null> })
      .phase_contents ?? {};
    const contenidoActual = phaseContents[phaseId] ?? "";
    if (!contenidoActual.trim()) {
      return NextResponse.json(
        { error: "Esta fase aún no tiene contenido para analizar" },
        { status: 400 },
      );
    }

    // Hidratar config IA desde Supabase
    await hydrateAIConfigAsync();

    // Extraer contexto académico
    const academicCtx = (proyecto.academic_context ?? {}) as Record<string, unknown>;
    const formatoUmss = typeof academicCtx.formato_umss === "string" ? academicCtx.formato_umss : undefined;
    const cap1Variante = typeof academicCtx.cap1_variante_id === "string"
      ? academicCtx.cap1_variante_id : undefined;

    const userPrompt = buildAnalizadorUserPrompt({
      proyectoId,
      faseId: phaseId,
      faseLabel: phase.label ?? phaseId,
      tema: proyecto.tema_aprobado ?? proyecto.titulo_provisional ?? "Sin tema definido",
      servicioNombre: SERVICIO_NOMBRES[proyecto.servicio_id ?? ""] ?? proyecto.servicio_id ?? "",
      formatoUmss,
      variante: cap1Variante,
      contenidoActual,
      observacionTutor: observacion,
    });

    // Llamar a la IA con budget generoso (puede devolver el documento completo
    // si decide aplicar, además de la justificación).
    const aiResult = await llamarIA(
      SISTEMA_ANALIZADOR_PERTINENCIA,
      userPrompt,
      8000,
      proyecto.servicio_id ?? "mono-001",
    );

    // Parsear el JSON de la IA
    const analizado = parseAnalizadorOutput(aiResult.text);
    if (!analizado) {
      return NextResponse.json(
        {
          error: "La IA devolvió un formato no parseable. Reintentar.",
          raw: aiResult.text.slice(0, 500),
        },
        { status: 502 },
      );
    }

    const duracionMs = Date.now() - t0;

    // Guardar en el banco (acumulando conocimiento)
    const { id: bankRowId } = await dbInsertObservacionBanco({
      proyecto_id: proyectoId,
      fase_id: phaseId,
      servicio_id: proyecto.servicio_id ?? null,
      observacion_textual: observacion,
      patron_detectado: analizado.patron_detectado,
      decision: analizado.decision,
      analisis_ia: analizado.analisis_ia,
      justificacion_para_tutor: analizado.justificacion_para_tutor,
      contenido_antes:
        analizado.decision === "rechazar" ? null : contenidoActual,
      contenido_despues: null, // se llena cuando el usuario aplica
      aplicado_at: null,
      modelo_ia_usado: `${aiResult.provider} / ${aiResult.model}`,
      duracion_analisis_ms: duracionMs,
    });

    return NextResponse.json({
      ok: true,
      observacion_id: bankRowId,
      decision: analizado.decision,
      patron_detectado: analizado.patron_detectado,
      analisis_ia: analizado.analisis_ia,
      justificacion_para_tutor: analizado.justificacion_para_tutor,
      contenido_actual: contenidoActual,
      contenido_propuesto: analizado.propuesta_de_cambio,
      fase_id: phaseId,
      fase_label: phase.label ?? phaseId,
      proveedor: `${aiResult.provider} / ${aiResult.model}`,
      duracion_ms: duracionMs,
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: (e as Error).message ?? "Error interno" }, { status: 500 });
  }
}
