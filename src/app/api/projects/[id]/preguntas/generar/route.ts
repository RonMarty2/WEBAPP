/**
 * POST /api/projects/[id]/preguntas/generar
 *
 * Genera el bloque de preguntas de defensa para UNA fase del proyecto.
 *
 * Body: { phase_id: string }
 *
 * El endpoint:
 *   1. Lee phase_contents[phase_id] (contenido APROBADO de esa fase).
 *   2. Llama a la IA con el prompt SISTEMA_BANCO_PREGUNTAS_FASE.
 *   3. Parsea el JSON devuelto. Si falla, guarda raw para diagnóstico.
 *   4. Persiste el resultado en phase_contents[`${phase_id}_preguntas`].
 *
 * Diseño "fire-and-forget":
 *   El cliente lo invoca tras aprobar el capítulo SIN esperar respuesta. Si
 *   falla, no rompe el flujo del estudiante — solo queda esa fase sin
 *   preguntas y se puede regenerar más tarde desde la vista del banco.
 *
 * Solo se generan preguntas para fases sustantivas: ph-cap0 a ph-cap5.
 * Resumen, referencias y latex NO aportan preguntas (son derivados/formato).
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto, dbUpdateProyecto } from "@/lib/db";
import { llamarIA } from "@/lib/aiProvider";
import {
  SISTEMA_BANCO_PREGUNTAS_FASE,
  buildContextoBancoPreguntas,
  parsePreguntasFase,
} from "@/lib/prompts/scribe/banco-preguntas";
import { phaseDefinitionsForProject } from "@/lib/projectTypePhases";

type Params = { params: Promise<{ id: string }> };

/** Fases que aportan preguntas al banco. */
const FASES_CON_PREGUNTAS = new Set([
  "ph-cap0",
  "ph-cap1",
  "ph-cap2",
  "ph-cap3",
  "ph-cap4",
  "ph-cap5",
]);

const MAX_TOKENS_PREGUNTAS = 2500; // ~6-10 preguntas con respuesta breve

export async function POST(req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const body = await req.json().catch(() => ({}));
    const phaseId = typeof body?.phase_id === "string" ? body.phase_id.trim() : "";
    if (!phaseId) {
      return NextResponse.json({ error: "Falta phase_id" }, { status: 400 });
    }
    if (!FASES_CON_PREGUNTAS.has(phaseId)) {
      // No es un error — simplemente no aplica para esta fase.
      return NextResponse.json({ skipped: true, reason: "fase sin preguntas" }, { status: 200 });
    }

    const proyectoRaw = await dbGetProyecto(id);
    if (!proyectoRaw) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }
    const proyecto = proyectoRaw as unknown as Record<string, unknown>;
    if (proyecto.usuario_id !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Sin acceso al proyecto" }, { status: 403 });
    }

    const phaseContents = (proyecto.phase_contents ?? {}) as Record<string, string | null | undefined>;
    const contenido = phaseContents[phaseId];
    if (!contenido || !contenido.trim() || contenido.trim().length < 200) {
      return NextResponse.json(
        { error: "La fase no tiene contenido aprobado suficiente para generar preguntas." },
        { status: 400 },
      );
    }

    // Metadatos para el prompt
    const servicioId = (proyecto.servicio_id as string) || "mono-001";
    const tipoProyectoId = proyecto.tipo_proyecto_id as string | undefined;
    const phaseDefs = phaseDefinitionsForProject({ servicioId, tipoProyectoId });
    const faseDef = phaseDefs.find(p => p.id === phaseId);
    const faseLabel = faseDef?.label || phaseId;

    const academicContext = (proyecto.academic_context ?? {}) as Record<string, unknown>;
    const ctxInicial = (academicContext.contexto_inicial ?? {}) as Record<string, unknown>;
    const titulo = String(proyecto.tema_aprobado ?? proyecto.titulo_provisional ?? "Monografía");
    const programa = String(ctxInicial.programa ?? "Diplomado");

    const contexto = buildContextoBancoPreguntas({
      faseId: phaseId,
      faseLabel,
      tituloProyecto: titulo,
      programa,
      contenidoAprobado: contenido,
    });

    // Llamada IA — usa la cascada del proyecto (Groq → Anthropic → OpenAI).
    let rawAI = "";
    let providerUsed = "";
    let modelUsed = "";
    try {
      const r = await llamarIA(SISTEMA_BANCO_PREGUNTAS_FASE, contexto, MAX_TOKENS_PREGUNTAS, servicioId);
      rawAI = r.text || "";
      providerUsed = r.provider;
      modelUsed = r.model;
    } catch (e) {
      console.error(`[preguntas] IA falló para ${phaseId}:`, (e as Error).message);
      return NextResponse.json({ error: "La IA no pudo generar preguntas en este momento." }, { status: 503 });
    }

    const parsed = parsePreguntasFase(rawAI);
    // Helper: copia phase_contents normalizando undefined → null para que sea
    // asignable al tipo del dbUpdateProyecto.
    const copyPhaseContents = (): Record<string, string | null> => {
      const out: Record<string, string | null> = {};
      for (const [k, v] of Object.entries(phaseContents)) {
        out[k] = v === undefined ? null : v;
      }
      return out;
    };

    if (!parsed) {
      console.warn(`[preguntas] JSON inválido para ${phaseId}. raw=${rawAI.slice(0, 200)}`);
      // Guardamos el raw para que el admin pueda diagnosticar. NO bloqueamos.
      const phaseContentsNuevo = copyPhaseContents();
      phaseContentsNuevo[`${phaseId}_preguntas_raw`] = rawAI;
      await dbUpdateProyecto(id, { phase_contents: phaseContentsNuevo });
      return NextResponse.json(
        { error: "La IA devolvió un formato inesperado. Probá regenerar." },
        { status: 502 },
      );
    }

    const totalPreguntas = parsed.conocimiento.length + parsed.autoria.length;
    if (totalPreguntas === 0) {
      return NextResponse.json(
        { error: "La IA no pudo extraer preguntas relevantes del contenido." },
        { status: 422 },
      );
    }

    // Persistir — el banco queda como string JSON dentro de phase_contents.
    // Convención: clave `${phase_id}_preguntas` siempre es JSON serializable.
    const payload = {
      generadas_at: new Date().toISOString(),
      provider: providerUsed,
      model: modelUsed,
      conocimiento: parsed.conocimiento,
      autoria: parsed.autoria,
    };
    const phaseContentsNuevo = copyPhaseContents();
    phaseContentsNuevo[`${phaseId}_preguntas`] = JSON.stringify(payload);
    // Limpiar el raw fallido de intentos anteriores si lo había.
    delete phaseContentsNuevo[`${phaseId}_preguntas_raw`];

    await dbUpdateProyecto(id, { phase_contents: phaseContentsNuevo });

    return NextResponse.json(
      {
        success: true,
        phase_id: phaseId,
        count_conocimiento: parsed.conocimiento.length,
        count_autoria: parsed.autoria.length,
        total: totalPreguntas,
      },
      { status: 200 },
    );
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[preguntas/generar]", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
