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
import {
  llamarIA,
  llamarIAConGrounding,
  hydrateAIConfigAsync,
  type GroundingSource,
} from "@/lib/aiProvider";
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

    // Lista de fases del proyecto para que el analizador pueda detectar si
    // la observación pertenece a OTRA fase (decision='mover_a_otra_fase').
    const listaFases = phaseDefs.map((p) => ({
      id: p.id,
      label: p.label ?? p.id,
    }));

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
      listaFases,
    });

    console.log(`[analizador] llamando IA para proyecto=${proyectoId} fase=${phaseId} obs="${observacion.slice(0, 80)}"`);

    // 🌐 Usar Gemini con Grounding (búsqueda web real) si hay GEMINI_API_KEY.
    // Eso permite a la IA citar fuentes reales (papers, INE, BCB, sitios
    // oficiales, etc.) con URLs verificables, en lugar de quedarse limitada
    // a su conocimiento de entrenamiento.
    //
    // Si Grounding falla o no hay GEMINI_API_KEY, fallback a llamarIA normal
    // (cascada multi-proveedor sin búsqueda web).
    let aiResult: { text: string; provider: string; model: string };
    let groundingSources: GroundingSource[] = [];
    let groundingQueries: string[] = [];

    const useGrounding = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10);
    if (useGrounding) {
      try {
        const grounded = await llamarIAConGrounding(
          SISTEMA_ANALIZADOR_PERTINENCIA,
          userPrompt,
          10000, // margen amplio para devolver 4-6 estudios con análisis
        );
        aiResult = { text: grounded.text, provider: grounded.provider, model: grounded.model };
        groundingSources = grounded.sources;
        groundingQueries = grounded.searchQueries;
        console.log(`[analizador] Grounding: ${groundingQueries.length} búsquedas, ${groundingSources.length} fuentes`);
      } catch (groundingErr) {
        console.warn(`[analizador] Grounding falló (${(groundingErr as Error).message}), usando llamada normal sin búsqueda web`);
        aiResult = await llamarIA(
          SISTEMA_ANALIZADOR_PERTINENCIA,
          userPrompt,
          4000,
          proyecto.servicio_id ?? "mono-001",
        );
      }
    } else {
      aiResult = await llamarIA(
        SISTEMA_ANALIZADOR_PERTINENCIA,
        userPrompt,
        4000,
        proyecto.servicio_id ?? "mono-001",
      );
    }

    console.log(`[analizador] IA respondió: provider=${aiResult.provider} model=${aiResult.model} length=${aiResult.text.length} preview="${aiResult.text.slice(0, 200)}"`);

    // Parsear el JSON de la IA
    const analizado = parseAnalizadorOutput(aiResult.text);
    if (!analizado) {
      console.error(`[analizador] PARSER FALLÓ. Texto completo de la IA:\n${aiResult.text}`);
      return NextResponse.json(
        {
          error: `La IA (${aiResult.provider}/${aiResult.model}) devolvió un formato no parseable. Texto recibido: "${aiResult.text.slice(0, 300)}..."`,
          raw: aiResult.text.slice(0, 1000),
        },
        { status: 502 },
      );
    }

    console.log(`[analizador] decisión=${analizado.decision} patrón=${analizado.patron_detectado}`);

    const duracionMs = Date.now() - t0;

    // ── Aplicar la cirugía si decision='aplicar' o 'aplicar_con_reserva'
    //    El servidor hace find&replace usando bloque_original como llave.
    //    Si falla la coincidencia exacta, intenta normalizando espacios
    //    (regex tolerante). Si tampoco matchea, devuelve error claro al
    //    cliente SIN tocar el documento.
    let contenidoPropuesto: string | null = null;
    let errorCirugia: string | null = null;

    if (analizado.decision === "aplicar" || analizado.decision === "aplicar_con_reserva") {
      const accion = analizado.accion_cirugia ?? "reemplazar";
      if (accion === "agregar_al_final") {
        if (!analizado.bloque_nuevo?.trim()) {
          errorCirugia = "La IA indicó 'agregar_al_final' pero bloque_nuevo está vacío.";
        } else {
          contenidoPropuesto = `${contenidoActual.trimEnd()}\n\n${analizado.bloque_nuevo.trim()}\n`;
        }
      } else {
        // accion === 'reemplazar' (caso normal de cirugía)
        if (!analizado.bloque_original?.trim() || analizado.bloque_nuevo === null) {
          errorCirugia = "La IA decidió aplicar pero no devolvió bloque_original o bloque_nuevo.";
        } else if (contenidoActual.includes(analizado.bloque_original)) {
          // Match exacto byte-por-byte
          contenidoPropuesto = contenidoActual.replace(
            analizado.bloque_original,
            analizado.bloque_nuevo,
          );
        } else {
          // Intento con espacios normalizados (saltos de línea, tabs, espacios múltiples)
          const normOriginal = analizado.bloque_original.replace(/\s+/g, " ").trim();
          const escapado = normOriginal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(escapado.replace(/\s+/g, "\\s+"));
          if (regex.test(contenidoActual)) {
            contenidoPropuesto = contenidoActual.replace(regex, analizado.bloque_nuevo);
          } else {
            errorCirugia = "La IA devolvió un bloque_original que no se encuentra en el documento (ni con normalización de espacios). Reformulá la observación de forma más precisa o pegá el fragmento exacto del documento que querés cambiar.";
          }
        }
      }
    }

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
        analizado.decision === "rechazar" || analizado.decision === "mover_a_otra_fase"
          ? null
          : contenidoActual,
      contenido_despues: null, // se llena cuando el usuario aplica
      aplicado_at: null,
      modelo_ia_usado: `${aiResult.provider} / ${aiResult.model}`,
      duracion_analisis_ms: duracionMs,
    });

    // Si la cirugía falló pero la decisión era aplicar, lo reportamos al
    // cliente como aviso especial — el modal puede mostrar el error y NO
    // ofrecer el botón aplicar.
    return NextResponse.json({
      ok: true,
      observacion_id: bankRowId,
      decision: analizado.decision,
      patron_detectado: analizado.patron_detectado,
      analisis_ia: analizado.analisis_ia,
      justificacion_para_tutor: analizado.justificacion_para_tutor,
      contenido_actual: contenidoActual,
      contenido_propuesto: contenidoPropuesto,
      // Detalles de la cirugía (útiles para mostrar diff localizado en UI)
      bloque_original: analizado.bloque_original,
      bloque_nuevo: analizado.bloque_nuevo,
      accion_cirugia: analizado.accion_cirugia,
      // Error de cirugía si lo hubo (cuando bloque_original no matchea)
      error_cirugia: errorCirugia,
      // Si la decisión es 'mover_a_otra_fase', estos campos dicen a qué fase
      fase_destino_id: analizado.fase_destino_id,
      fase_destino_label: analizado.fase_destino_label,
      // Si el cambio afecta el título oficial del proyecto
      nuevo_titulo: analizado.nuevo_titulo,
      titulo_actual: proyecto.tema_aprobado ?? proyecto.titulo_provisional ?? null,
      fase_id: phaseId,
      fase_label: phase.label ?? phaseId,
      proveedor: `${aiResult.provider} / ${aiResult.model}`,
      // Fuentes citadas por Gemini Grounding (URLs verificables que la IA
      // consultó al construir la propuesta). Solo presente cuando Grounding
      // estuvo activo y devolvió citas.
      grounding_sources: groundingSources,
      grounding_queries: groundingQueries,
      duracion_ms: duracionMs,
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: (e as Error).message ?? "Error interno" }, { status: 500 });
  }
}
