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

// El Analizador hace UNA llamada IA densa que puede tardar 20-50s en
// observaciones que piden agregar varias fuentes o datos. Sin declarar
// maxDuration, Vercel mata la función con su default bajo (~10-15s) y devuelve
// 504 FUNCTION_INVOCATION_TIMEOUT. 60s es el máximo del plan Hobby; si se pasa
// a Pro puede subirse a 300.
export const maxDuration = 60;

// ── Helpers de cirugía (búsqueda y reemplazo del fragmento a corregir) ───────

/**
 * Reemplaza la PRIMERA aparición literal de `buscar` por `reemplazo` sin
 * interpretar patrones de reemplazo ($1, $&, etc.) que pudieran aparecer en el
 * texto nuevo. Más seguro que String.prototype.replace(string, string).
 */
function reemplazarUnaVez(texto: string, buscar: string, reemplazo: string): string {
  const idx = texto.indexOf(buscar);
  if (idx < 0) return texto;
  return texto.slice(0, idx) + reemplazo + texto.slice(idx + buscar.length);
}

/**
 * Construye un RegExp que localiza `bloque` dentro del documento tolerando las
 * diferencias tipográficas más comunes entre lo que devuelve la IA y el texto
 * real del capítulo: comillas rectas vs. curvas, guiones/rayas, y espacios o
 * saltos de línea múltiples. Es estricto en el contenido (no hace fuzzy match
 * de palabras): solo flexibiliza puntuación y espaciado. Devuelve null si el
 * bloque queda vacío.
 */
function construirRegexTolerante(bloque: string): RegExp | null {
  const dobles = '"“”«»';
  const simples = "'‘’`";
  const guiones = "-–—";
  let out = "";
  let i = 0;
  while (i < bloque.length) {
    const c = bloque[i];
    if (/\s/.test(c)) {
      out += "\\s+";
      while (i < bloque.length && /\s/.test(bloque[i])) i++;
      continue;
    }
    if (dobles.includes(c)) { out += '["“”«»]'; i++; continue; }
    if (simples.includes(c)) { out += "['‘’`]"; i++; continue; }
    if (guiones.includes(c)) { out += "[-–—]"; i++; continue; }
    if (/[.*+?^${}()|[\]\\]/.test(c)) { out += "\\" + c; i++; continue; }
    out += c;
    i++;
  }
  return out.length > 0 ? new RegExp(out) : null;
}

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
      universidadId: (proyecto as { universidad_id?: string | null }).universidad_id ?? undefined,
      modalidadTitulacion: (proyecto as { modalidad_titulacion?: string | null }).modalidad_titulacion ?? undefined,
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

    // 🧠 Usar Gemini normal (sin búsqueda web Grounding).
    //
    // Decisión arquitectural: Grounding (búsqueda web) tarda 1-3 minutos por
    // observación pesada, lo que excede el timeout de 60s de Vercel (plan
    // Hobby) y dispara FUNCTION_INVOCATION_TIMEOUT. Cuando eso pasa, el
    // estudiante no recibe nada — peor UX que tener una respuesta sin URLs
    // pero rápida.
    //
    // Gemini normal (sin Grounding) tarda 10-15s incluso para observaciones
    // densas. Sigue respetando la regla anti-alucinación del prompt: si la
    // IA no está segura de un autor/fuente, debe rechazar la observación
    // (decision='rechazar') en lugar de inventarlo.
    //
    // Las leyes bolivianas (Ley General de Aduanas, DS 25870, normativas
    // OMC/CAN, etc.) están en el conocimiento de entrenamiento de Gemini
    // 2.5 Pro, así que cita estas fuentes correctamente sin necesidad de
    // buscarlas en internet.
    //
    // Si en el futuro el usuario pasa a Vercel Pro (maxDuration=300s),
    // podemos reactivar Grounding sin riesgo de timeout.
    const aiResult = await llamarIA(
      SISTEMA_ANALIZADOR_PERTINENCIA,
      userPrompt,
      4000,
      proyecto.servicio_id ?? "mono-001",
    );
    const groundingSources: GroundingSource[] = [];
    const groundingQueries: string[] = [];

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
          contenidoPropuesto = reemplazarUnaVez(
            contenidoActual,
            analizado.bloque_original,
            analizado.bloque_nuevo,
          );
        } else {
          // Fallback tolerante: comillas rectas/curvas, guiones/rayas y
          // espacios/saltos de línea múltiples. Es la causa más común de que
          // el bloque_original de la IA no coincida byte-por-byte con el texto.
          const regex = construirRegexTolerante(analizado.bloque_original);
          if (regex && regex.test(contenidoActual)) {
            const nuevo = analizado.bloque_nuevo;
            // Reemplazo con función para no interpretar $1/$& si el texto
            // nuevo contiene el carácter '$'.
            contenidoPropuesto = contenidoActual.replace(regex, () => nuevo);
          } else {
            errorCirugia = "La IA devolvió un bloque_original que no coincide con el documento (ni tolerando comillas, guiones o espacios). Pega el fragmento exacto del documento que quieres cambiar, o divide la observación en un cambio más puntual.";
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
