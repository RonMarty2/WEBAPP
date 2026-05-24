/**
 * POST /api/projects/generate-phase
 * Genera el contenido de una fase con IA.
 *
 * Modalidades:
 *  - tipo = "borrador"  → primera pasada (Modo Guiado)
 *  - tipo = "final"     → versión final con feedback (Modo Guiado) o generación directa (Modo Directo)
 *
 * Prompt hierarchy (descendente en prioridad):
 *   1. Instrucciones específicas de la fase (prompt_borrador o prompt_final)
 *   2. Perfil de estilo del usuario (si existe)
 *   3. Hilos Conductores (reglas inmutables — menor prioridad)
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { getServiceAIStatus, llamarIA, getServiceAIConfig, hydrateAIConfigAsync } from "@/lib/aiProvider";
import {
  llamarIAPorPlan,
  llamarCompiladorLaTeX,
  normalizePlan,
  type PlanTier,
  type PhaseIndex,
} from "@/lib/modelRouter";
import { dbGetProyecto, dbUpdateProyecto, dbListAllProyectos } from "@/lib/db";
import { appendAITrace } from "@/lib/aiTrace.mjs";
import {
  extractCommitments,
  updateHiloConductor,
  buildHiloConstraintBlock,
} from "@/lib/hiloConductor";
import { loadFromDisk, saveToDisk, type PhaseFeedback } from "@/lib/persistence";
import { getVariantById } from "@/lib/cap1Variants";
import { SISTEMA_SCRIBE_REFERENCIAS_UCB } from "@/lib/prompts/scribe/consolidar-referencias-ucb";

/**
 * Guarda feedback del estudiante para análisis posterior en /admin/dashboard.
 * Se usa para detectar patrones (ej: "muchos usuarios piden ampliar antecedentes
 * en Cap I") y sugerir mejoras al megaprompt maestro.
 */
function persistirFeedback(entry: Omit<PhaseFeedback, "id" | "created_at">): void {
  try {
    const disk = loadFromDisk();
    if (!disk.phaseFeedback) disk.phaseFeedback = [];
    disk.phaseFeedback.push({
      ...entry,
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      created_at: new Date().toISOString(),
    });
    // Limitamos a las últimas 5000 entradas para no inflar el archivo
    if (disk.phaseFeedback.length > 5000) {
      disk.phaseFeedback = disk.phaseFeedback.slice(-5000);
    }
    saveToDisk(disk);
  } catch (e) {
    console.warn("[feedback] No se pudo persistir:", (e as Error).message);
  }
}
import { phaseDefinitionsForProject } from "@/lib/projectTypePhases";
import { buildAcademicContextBlock, summarizePhaseForMemory } from "@/lib/academicProject.mjs";
import {
  buildContextualReferences,
  buildReferenceSupportBlock,
  collectReferencesFromPhaseContents,
  normalizeReferenceCatalog,
  readReferenceCatalog,
  withUpdatedReferenceCatalog,
} from "@/lib/projectReferences.mjs";
import { isReferencesPhase } from "@/lib/phaseClassification.mjs";
import { isPhaseAnalitica } from "@/lib/phaseCategories";
import { getFortalecimientoAnaliticoBlock } from "@/lib/prompts/fortalecimiento-analitico";
import { buscarFuentesAcademicas, buildFuentesVerificadasBlock } from "@/lib/deepSearch";
import { buildOrientacionExtensionBlock, buildOrientacionResumenBlock } from "@/lib/orientacionExtension";

// Palabras clave en el label/prompt de una fase dinámica que activan deep search
const DEEP_SEARCH_KEYWORDS = /marco\s+te[oó]rico|bibliograf|referencias|fuentes|estado\s+del\s+arte|antecedente/i;

function faseNecesitaDeepSearch(phase: { label: string; prompt?: string }): boolean {
  return DEEP_SEARCH_KEYWORDS.test(phase.label) || DEEP_SEARCH_KEYWORDS.test(phase.prompt ?? "");
}

// ── Prompt loader ─────────────────────────────────────────────────────────────

import { DEFAULT_PHASES } from "@/app/api/admin/workspace-prompts/route";

/**
 * Builds the system prompt following the priority hierarchy:
 * 1. Phase-specific instructions (prompt_borrador or prompt_final)
 * 2. User style profile
 * 3. Hilo Conductor rules (lowest priority)
 */
const REGLA_LONGITUD = `
=== REGLA DE COBERTURA Y LONGITUD (LEER ANTES DE EMPEZAR) ===
Prioridad #1: COBERTURA COMPLETA. TODAS las secciones, subsecciones, tablas
  y elementos pedidos en este prompt son OBLIGATORIOS y deben aparecer en el
  orden indicado. NUNCA omitas una sección por falta de espacio.

Prioridad #2: CONCISIÓN dentro de cada sección. Los rangos de páginas/palabras
  son TECHO, no objetivo. Si una sección se puede explicar bien en pocos
  párrafos, hazlo. NO infles con relleno, NO repitas ideas, NO agregues
  párrafos decorativos.

Conflicto entre #1 y #2: si te das cuenta de que vas a quedarte corto de
espacio, SACRIFICA profundidad de las secciones iniciales para asegurar que
LLEGUES A LA ÚLTIMA sección. Mejor 5 secciones con 70% de detalle que 3 con
100% y 2 ausentes.
=== FIN REGLA DE COBERTURA Y LONGITUD ===`;

function buildSystemPrompt({
  phasePrompt,
  perfilEstilo,
  hilos,
  hiloConstraints,
}: {
  phasePrompt: string;
  perfilEstilo?: string | null;
  hilos: string[];
  hiloConstraints?: string;
}): string {
  const parts: string[] = [];

  parts.push(phasePrompt);
  parts.push(REGLA_LONGITUD);

  // Compromisos sagrados de capítulos anteriores — máxima prioridad factual
  if (hiloConstraints?.trim()) {
    parts.push(`\n${hiloConstraints}`);
  }

  if (perfilEstilo?.trim()) {
    parts.push(
      `\nIMPORTANTE: Las instrucciones específicas de esta fase y el Perfil de Estilo TIENEN PRIORIDAD ABSOLUTA sobre las reglas de tono y formato del Hilo Conductor General.\n\n=== PERFIL DE ESTILO DEL USUARIO ===\n${perfilEstilo.trim()}\n=== FIN DEL PERFIL ===`
    );
  }

  if (hilos.length > 0) {
    parts.push(
      `\n=== REGLAS INMUTABLES (HILO CONDUCTOR) ===\n${hilos.map((h, i) => `${i + 1}. ${h}`).join("\n")}\n=== FIN ===`
    );
  }

  return parts.join("\n");
}

/**
 * Construye un bloque "EVITA estos temas" para inyectar en el Cap 0,
 * evitando que la IA proponga temas duplicados/similares a los que ya
 * se generaron antes para estudiantes del mismo programa.
 *
 * Se usa solo en phase_id === "ph-cap0". Para otras fases, se omite.
 */
async function buildAntiDuplicacionBlock(
  proyectoActualId: string,
  programaActual: string,
): Promise<string> {
  if (!programaActual || programaActual.trim().length < 5) return "";

  try {
    const todos = await dbListAllProyectos();
    const normalizar = (s: string) =>
      s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
    const np = normalizar(programaActual);

    const temasSimilares: string[] = [];
    const seen = new Set<string>();

    for (const p of todos) {
      if (p.id === proyectoActualId) continue;
      const tema = (p as { tema_aprobado?: string; titulo_provisional?: string }).tema_aprobado
        ?? (p as { titulo_provisional?: string }).titulo_provisional ?? "";
      if (!tema || tema.length < 10 || tema.includes("(Por definir)")) continue;

      const ctx = ((p as { academic_context?: Record<string, unknown> }).academic_context ?? {}) as Record<string, unknown>;
      const ctxIni = (ctx.contexto_inicial ?? {}) as Record<string, unknown>;
      const progP = String(ctxIni.programa ?? "").trim();
      if (!progP) continue;

      const npp = normalizar(progP);
      // Match parcial entre programas (algun substring de 5+ chars)
      const matchPrograma = np === npp || np.includes(npp.slice(0, 12)) || npp.includes(np.slice(0, 12));
      if (!matchPrograma) continue;

      const key = normalizar(tema);
      if (seen.has(key)) continue;
      seen.add(key);
      temasSimilares.push(tema.length > 200 ? tema.slice(0, 200) + "..." : tema);
      if (temasSimilares.length >= 30) break;
    }

    if (temasSimilares.length === 0) return "";

    return `\n\n--- TEMAS YA GENERADOS PARA ESTUDIANTES DE PROGRAMAS SIMILARES ---
EVITA proponer temas demasiado similares a los siguientes (no repitas el mismo objeto de estudio
ni el mismo enfoque exacto). Variá la perspectiva, sector, periodo o alcance geográfico:

${temasSimilares.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Si tu propuesta es muy parecida a alguno de los anteriores, redirigila hacia un sector,
empresa, periodo, regulación o enfoque metodológico distinto.

--- FIN ANTI-DUPLICACIÓN ---\n`;
  } catch (e) {
    console.warn("[anti-duplicacion] error obteniendo temas previos:", (e as Error).message);
    return ""; // si falla, no bloqueamos la generación
  }
}

function loadPhasePromptByIdFromDisk(phase_id: string, tipo: "borrador" | "final", fallback: string): string {
  try {
    const disk = loadFromDisk();
    const wp = disk.workspacePrompts;
    const tipoKey = `${phase_id}_${tipo}`;
    return wp?.phases?.[tipoKey] ?? wp?.phases?.[phase_id] ?? fallback;
  } catch {
    return fallback;
  }
}

function loadHilosFromDisk(): string[] {
  try {
    return loadFromDisk().workspacePrompts?.hilos?.filter(Boolean) ?? [];
  } catch {
    return [];
  }
}

async function loadPhasePromptFromAdmin(servicioId: string, phaseId: string): Promise<string | null> {
  try {
    const disk = loadFromDisk();
    const phases = disk.phaseDefinitions?.[servicioId] ?? [];
    const phase = phases.find((p: { id?: string; prompt?: string }) => p.id === phaseId);
    return phase?.prompt ?? null;
  } catch {
    return null;
  }
}

type AcademicContext = Record<string, unknown> & {
  contexto_inicial?: Record<string, unknown>;
  documentos?: Record<string, unknown>[];
  ruta_elegida?: Record<string, unknown>;
};

type AcademicMemory = Record<string, unknown> & {
  phase_summaries?: Record<string, unknown>[];
  reference_catalog?: string[];
};

function firstNonEmptyString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function getAcademicContext(value: unknown): AcademicContext {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as AcademicContext
    : {};
}

function getContextDocuments(academicContext: AcademicContext): Record<string, unknown>[] {
  return Array.isArray(academicContext.documentos) ? academicContext.documentos : [];
}

function buildContextualReferenceInput(
  academicContext: AcademicContext,
  ...fallbackTopics: unknown[]
) {
  return {
    topic: firstNonEmptyString(
      academicContext.contexto_inicial?.tema,
      academicContext.ruta_elegida?.titulo,
      ...fallbackTopics
    ),
    route: academicContext.ruta_elegida ?? {},
    studentContext: academicContext.contexto_inicial ?? {},
    documents: getContextDocuments(academicContext),
  };
}

function academicBlockForProject(
  proyecto: {
    academic_context?: Record<string, unknown>;
    academic_memory?: Record<string, unknown>;
    tema_aprobado?: string | null;
    titulo_provisional?: string | null;
  },
  includeDocuments = true,
) {
  const academicContext = getAcademicContext(proyecto.academic_context);
  const academicMemory = (proyecto.academic_memory ?? {}) as AcademicMemory;
  const studentContext = {
    ...(academicContext.contexto_inicial ?? {}),
    tema: firstNonEmptyString(
      academicContext.contexto_inicial?.tema,
      proyecto.tema_aprobado,
      proyecto.titulo_provisional
    ),
  };
  return buildAcademicContextBlock({
    contract: academicContext.ruta_elegida ?? {
      titulo: proyecto.titulo_provisional ?? proyecto.tema_aprobado ?? "",
      idea_central: proyecto.tema_aprobado ?? proyecto.titulo_provisional ?? "",
    },
    studentContext,
    documents: includeDocuments ? getContextDocuments(academicContext) : [],
    phaseMemory: Array.isArray(academicMemory.phase_summaries) ? academicMemory.phase_summaries : [],
  });
}

function upsertPhaseSummary(
  memory: Record<string, unknown> | undefined,
  phaseKey: string,
  phaseLabel: string,
  content: string
) {
  const academicMemory = (memory ?? {}) as AcademicMemory;
  const existing = Array.isArray(academicMemory.phase_summaries) ? academicMemory.phase_summaries : [];
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

function buildLocalReferencesPhase({
  proyecto,
  previousPhases,
  phaseContents,
}: {
  proyecto: { academic_context?: Record<string, unknown>; academic_memory?: Record<string, unknown> };
  previousPhases: { id: string; label: string }[];
  phaseContents: Record<string, string | null | undefined>;
}) {
  const academicContext = getAcademicContext(proyecto.academic_context);
  const documents = getContextDocuments(academicContext);
  const references = normalizeReferenceCatalog([
    readReferenceCatalog(proyecto.academic_memory ?? {}),
    collectReferencesFromPhaseContents(
      previousPhases.map((phase) => ({
        content: phaseContents[phase.id] ?? phaseContents[`${phase.id}_borrador`] ?? null,
      }))
    ),
    buildContextualReferences(buildContextualReferenceInput(academicContext)),
  ]);
  const anexos = documents.length
    ? documents
        .map((doc, index) => {
          const name = String(doc.nombre || doc.name || `Documento ${index + 1}`);
          return `${index + 1}. ${name}`;
        })
        .join("\n")
    : "No se registraron documentos anexos independientes en el sistema.";

  return `
## REFERENCIAS BIBLIOGRAFICAS

${references.length ? references.join("\n\n") : "Las referencias bibliograficas se consolidan a partir de las fuentes citadas en los capitulos anteriores."}

## ANEXOS

**Anexo 1: Inventario de Fuentes Primarias y Documentos Base**

${anexos}
`.trim();
}

function buildAITraceEntry(input: {
  servicioId: string;
  scope: string;
  action: string;
  phaseId?: string | null;
  phaseLabel?: string | null;
  status: "success" | "error" | "fallback";
  providerId?: string;
  providerName?: string;
  model?: string;
  durationMs?: number;
  error?: string | null;
}) {
  const configured = getServiceAIStatus(input.servicioId);
  return {
    scope: input.scope,
    action: input.action,
    phase_id: input.phaseId ?? null,
    phase_label: input.phaseLabel ?? null,
    provider_id: input.providerId ?? configured.provider_id,
    provider_name: input.providerName ?? configured.provider_name,
    model: input.model ?? configured.model,
    status: input.status,
    duration_ms: input.durationMs ?? null,
    error: input.error ?? null,
  };
}

// ── Auto-continue: detecta y completa generaciones cortadas por max_tokens ───

/**
 * Heurística para detectar si el modelo cortó a mitad por límite de tokens.
 * Reglas (en orden):
 *   1. Si el texto es muy corto (<2000 chars) → otro problema, no corte.
 *   2. Si termina con cierre limpio (punto, signo, paréntesis cerrado, etc.) → terminó natural.
 *   3. Si última línea es fila de tabla markdown cerrada o fence ``` → terminó natural.
 *   4. En cualquier otro caso → ALTA sospecha de corte.
 *
 * Nota: ya NO usamos ratio de tokens. Antes lo hacíamos pero subestimaba en textos
 * académicos con palabras largas. La condición "no cierra limpio" sola es suficiente
 * porque un modelo que terminó naturalmente CASI SIEMPRE cierra con punto/signo.
 */
function parecieraTruncado(texto: string, _maxTokens: number): boolean {
  const tail = texto.trimEnd();
  if (tail.length < 2000) return false; // Muy corto: probablemente otro problema.

  // Cierres aceptables al final de una generación bien terminada.
  const cierresOk = /[.!?…)}\]:;"'»”’*—]\s*$/u;
  if (cierresOk.test(tail)) return false;

  // Última línea es fila de tabla markdown cerrada o fence de bloque de código.
  const ultimaLinea = tail.split("\n").slice(-1)[0]?.trim() ?? "";
  if (/^\|.*\|$/.test(ultimaLinea)) return false;
  if (ultimaLinea === "```") return false;

  return true; // Alta sospecha de corte: texto largo sin cierre limpio.
}

/**
 * Pide al modelo que continúe EXACTAMENTE desde donde se cortó la generación previa,
 * sin repetir nada. Usa la misma cascada de proveedores que la llamada original.
 * Devuelve "" si la continuación falla (no rompe la generación, mostramos lo parcial).
 */
async function continuarGeneracion(
  systemPrompt: string,
  textoParcial: string,
  maxTokensTope: number,
  servicioId?: string,
): Promise<string> {
  // Tomamos los últimos ~600 chars como pista de "dónde estábamos".
  const colaParcial = textoParcial.slice(-600);
  const userPrompt = `La generación anterior se cortó por límite de tokens. Tu tarea ahora es CONTINUAR.

REGLAS ESTRICTAS:
1. NO repitas nada de lo ya generado. NO empieces con un título nuevo ni con una introducción.
2. NO digas "continuando...", "como decía...", ni nada similar. Empieza DIRECTO con la palabra/oración exacta donde se cortó.
3. Mantén el mismo tono, formato (markdown), estructura y nivel de detalle.
4. Cierra lo que estaba pendiente y termina ordenadamente. NO inventes secciones nuevas si no estaban planificadas.

ÚLTIMOS ~600 CARACTERES YA GENERADOS (solo como referencia de dónde quedaste, NO los repitas):
"""
${colaParcial}
"""

CONTINUACIÓN (empieza exactamente donde se cortó):`;

  try {
    // Damos hasta 40% del techo original para completar; suele ser suficiente.
    const continuacionMaxTokens = Math.max(2000, Math.floor(maxTokensTope * 0.4));
    const resultado = await llamarIA(systemPrompt, userPrompt, continuacionMaxTokens, servicioId);
    return resultado.text?.trim() ?? "";
  } catch (e) {
    console.warn("[auto-continue] falló la continuación:", (e as Error).message);
    return "";
  }
}

/** Une la generación parcial con su continuación, evitando dobles espacios. */
function empalmarContinuacion(parcial: string, continuacion: string): string {
  const a = parcial.trimEnd();
  const b = continuacion.trimStart();
  // Si `a` termina a mitad de palabra (sin whitespace), pegamos directo.
  // Si termina con whitespace o signo, ponemos un espacio.
  const ultimoChar = a.slice(-1);
  const necesitaEspacio = /\s/.test(ultimoChar) ? false : /[.!?:;)\]}]/.test(ultimoChar);
  return necesitaEspacio ? `${a} ${b}` : `${a}${b}`;
}

// ── Handler principal ─────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const t0 = Date.now();

  try {
    const { user: sessionUser } = await requireAuth();

    // Hidratar caches de IA desde Supabase (Vercel serverless arranca con caches vacíos)
    await hydrateAIConfigAsync();

    let proyecto_id: string;
    let phase_id: string;
    let mensaje_usuario: string | undefined;
    let tipo: "borrador" | "final";
    let feedback_usuario: string | undefined;

    try {
      const body = await req.json();
      proyecto_id = body.proyecto_id;
      phase_id = body.phase_id;
      mensaje_usuario = body.mensaje_usuario ?? undefined;
      tipo = body.tipo === "borrador" ? "borrador" : "final";
      feedback_usuario = body.feedback_usuario ?? undefined;

      if (!proyecto_id || !phase_id) {
        return NextResponse.json(
          { error: "proyecto_id y phase_id son requeridos" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
    }

    const planTier = normalizePlan(sessionUser.plan ?? "demo");

    // Plan Estándar: no puede modificar ni regenerar con feedback/chat.
    // La IA genera y el estudiante acepta. Para correcciones → Pro/Elite.
    if (planTier === "estandar" || planTier === "standard") {
      if (feedback_usuario?.trim() || mensaje_usuario?.trim()) {
        return NextResponse.json(
          { error: "Las correcciones requieren Plan Pro o Elite." },
          { status: 403 },
        );
      }
    }

    return await generarSinSupabase({
      sessionUserId: sessionUser.id,
      planTier,
      proyecto_id, phase_id,
      mensaje_usuario, tipo, feedback_usuario,
      t0,
    });

  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[generate-phase]", e);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ── Sin Supabase ──────────────────────────────────────────────────────────────

async function generarSinSupabase({
  sessionUserId, planTier, proyecto_id, phase_id,
  mensaje_usuario, tipo, feedback_usuario,
  t0,
}: {
  sessionUserId: string;
  planTier: PlanTier;
  proyecto_id: string;
  phase_id: string;
  mensaje_usuario?: string;
  tipo: "borrador" | "final";
  feedback_usuario?: string;
  t0: number;
}) {
  const proyecto = await dbGetProyecto(proyecto_id);
  if (!proyecto || proyecto.usuario_id !== sessionUserId) {
    return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
  }

  const hilos = loadHilosFromDisk();
  const hiloConstraints = buildHiloConstraintBlock(proyecto.academic_memory);
  const perfilEstilo = proyecto.perfil_estilo_usuario;
  const esGuiado = proyecto.modalidad_creacion === "guiada";

  // 📚 Cuánto texto de las fases previas pasamos como contexto al generar
  // la fase actual. 6000 chars ≈ 1000 palabras ≈ 1.5 págs por capítulo previo.
  // Antes era 1800 (≈ medio párrafo): los capítulos quedaban desconectados
  // entre sí porque la IA solo "veía" el primer párrafo del cap anterior.
  // 6000 fortalece el hilo conductor sin saturar el contexto del modelo.
  const MAX_CHARS_POR_FASE = 6000;

  // ── Modo dinámico: phase_id ───────────────────────────────────────────────
  if (phase_id) {
    const servicio_id = proyecto.servicio_id ?? "mono-001";
    const phaseDefs = phaseDefinitionsForProject({
      servicioId: servicio_id,
      tipoProyectoId: (proyecto as { tipo_proyecto_id?: string }).tipo_proyecto_id,
    });

    if (!phaseDefs?.length) {
      return NextResponse.json({ error: "No hay fases personalizadas para este servicio" }, { status: 404 });
    }

    const currentPhase = phaseDefs.find((p) => p.id === phase_id);
    if (!currentPhase) {
      return NextResponse.json({ error: "Fase no encontrada" }, { status: 404 });
    }

    // 🛡️ Blindaje anti-gasto de tokens: la fase "ph-calidad" se reconvirtió
    // en Banco de Preguntas para defensa. Sus contenidos se generan en
    // background al aprobar cada capítulo (endpoint /preguntas/generar).
    // Si alguien intenta generar ph-calidad por el endpoint genérico estaría
    // disparando el prompt viejo de auditoría y gastando 6K tokens al pedo.
    if (phase_id === "ph-calidad") {
      return NextResponse.json({
        error: "Esta fase no se genera. Las preguntas de defensa se construyen automáticamente al aprobar cada capítulo. Si te faltan preguntas de alguna fase, regenera desde el panel del banco.",
      }, { status: 400 });
    }

    const sorted = [...phaseDefs].sort((a, b) => a.orden - b.orden);
    const previousPhases = sorted.filter((p) => p.orden < currentPhase.orden);
    const phaseContents = proyecto.phase_contents ?? {};

    const fasesAnteriores: string[] = [];
    for (const prev of previousPhases) {
      // Use final content if available, else borrador
      let contenido = phaseContents[prev.id] ?? phaseContents[`${prev.id}_borrador`] ?? null;
      if (contenido) {
        if (contenido.length > MAX_CHARS_POR_FASE) {
          contenido = contenido.slice(0, MAX_CHARS_POR_FASE) + "\n[... contenido truncado ...]";
        }
        fasesAnteriores.push(`=== ${prev.label} ===\n${contenido}\n=== FIN ===`);
      }
    }

    const bloqueContexto = fasesAnteriores.length > 0
      ? `\n\n--- RESUMEN DE FASES ANTERIORES ---\n\n${fasesAnteriores.join("\n\n")}`
      : "";

    // 🚫 ANTI-DUPLICACIÓN: solo en Cap 0, inyecta lista de temas ya generados
    // por estudiantes del mismo programa para que la IA evite proponerlos.
    let antiDuplicacionBlock = "";
    if (phase_id === "ph-cap0") {
      const ctx = (proyecto.academic_context ?? {}) as Record<string, unknown>;
      const ctxIni = (ctx.contexto_inicial ?? {}) as Record<string, unknown>;
      const programaActual = String(ctxIni.programa ?? "").trim();
      antiDuplicacionBlock = await buildAntiDuplicacionBlock(proyecto_id, programaActual);
    }

    const typePrompt = tipo === "borrador"
      ? currentPhase.prompt_borrador?.trim()
      : currentPhase.prompt_final?.trim();

    // Intenta cargar el prompt de admin/phase-definitions primero
    const adminPrompt = await loadPhasePromptFromAdmin(servicio_id, phase_id);

    // 🎯 Variante de Cap. I — si el estudiante eligió una variante específica
    // (ej. "reducido" para UMSS), resolverla y usarla como fallback antes del
    // default. typePrompt y adminPrompt siguen teniendo prioridad para no
    // romper overrides del admin.
    //
    // ⚠️ Solo afecta a ph-cap1. El resto de fases continúa usando el flujo
    // original sin modificación.
    //
    // 🔴 PENDIENTE (memory/pending_variante_reducida.md):
    //   Cap. II–V todavía usan un único prompt. Cuando se definan variantes
    //   para esos capítulos, replicar este patrón aquí.
    let variantePrompt: string | null = null;
    // Resolver la variante elegida por el estudiante (se persiste como
    // cap1_variante_id en academic_context al crear el proyecto).
    const ctxVar = (proyecto.academic_context ?? {}) as Record<string, unknown>;
    const varianteIdResuelta = typeof ctxVar.cap1_variante_id === "string"
      ? (ctxVar.cap1_variante_id as string)
      : "clasico";
    if (phase_id === "ph-cap1") {
      variantePrompt = getVariantById(varianteIdResuelta).prompt;
    }
    // 🎯 Override por universidad: UCB usa sistema autor-fecha propio para
    // la bibliografía, NO APA 7. Cuando el proyecto es UCB-001 y la fase
    // es "ph-referencias", reemplazamos el megaprompt por el de UCB.
    const esUniversidadUCB = proyecto.universidad_id === "ucb-001";
    if (esUniversidadUCB && phase_id === "ph-referencias") {
      variantePrompt = SISTEMA_SCRIBE_REFERENCIAS_UCB;
    }
    // 🎯 Propagación de variante a Cap II-V: el prompt maestro se mantiene
    // (alineado a Guía 1 UMSS), pero inyectamos un bloque al userPrompt que
    // instruye a la IA sobre las restricciones de la variante "reducido"
    // (no asumir hipótesis ni operacionalización porque el Cap I reducido
    // no las genera). Esto evita la incoherencia entre capítulos sin
    // requerir builders separados por variante.
    const necesitaAvisoVarianteReducido =
      varianteIdResuelta === "reducido" &&
      ["ph-cap2", "ph-cap3", "ph-cap4", "ph-cap5"].includes(phase_id);
    const bloqueVariante = necesitaAvisoVarianteReducido
      ? `\n--- VARIANTE DEL DOCUMENTO: REDUCIDO (Guía 2 Céspedes UMSS) ---
El Capítulo I de esta monografía NO contiene hipótesis ni operacionalización
de variables (la variante "reducido" las omite por diseño). Por lo tanto:
  • NO menciones ni "contrastes" hipótesis formales en este capítulo.
  • NO asumas que existe una tabla de operacionalización (Tabla 1.X).
  • Si necesitas referenciar el planteamiento del Cap I, hazlo sobre las
    SUBPREGUNTAS DE SISTEMATIZACIÓN y las CAUSAS/EFECTOS, no sobre hipótesis.
  • Las conclusiones (Cap V) se construyen por OBJETIVOS ESPECÍFICOS cumplidos,
    no por hipótesis aceptadas/rechazadas.
--- FIN AVISO VARIANTE ---\n`
      : null;

    // 🎯 Override de estilo para proyectos UCB: los megaprompts maestros de
    // Cap.II-V y resumen están alineados a UMSS/APA 7. Para proyectos UCB
    // inyectamos un bloque que IGNORA las reglas APA 7 del megaprompt y
    // aplica el sistema autor-fecha UCB. Esto evita citas APA 7 incorrectas
    // en Cap.II-V cuando la universidad es UCB.
    const necesitaOverrideEstiloUCB =
      esUniversidadUCB &&
      ["ph-cap2", "ph-cap3", "ph-cap4", "ph-cap5", "ph-resumen"].includes(phase_id);
    const bloqueUniversidadUCB = necesitaOverrideEstiloUCB
      ? `\n--- OVERRIDE DE ESTILO INSTITUCIONAL: UCB SAN PABLO ---
Este proyecto NO usa normas APA 7 ni convenciones UMSS. La universidad
del estudiante es la Universidad Católica Boliviana "San Pablo" (Guía
6ª ed., Marzo 2020). DESCARTA las reglas de citación APA 7 del megaprompt
maestro y APLICA ESTRICTAMENTE las siguientes reglas UCB:

REGLAS DE CITAS UCB (anulan APA 7):
  • Cita textual corta: "..." (APELLIDO, AÑO: PÁGINA)
    Apellido SIEMPRE en MAYÚSCULAS, dos puntos antes de la página.
    Ej.: (RODRÍGUEZ, 1988: 87)
  • Cita textual larga (>4 líneas): bloque sin comillas, margen izq +2 cm,
    interlineado simple, cierre con (APELLIDO, AÑO: PÁGINA).
  • Paráfrasis: prefijo "Cf." → (Cf. APELLIDO, AÑO) o (Cf. APELLIDO, AÑO: PÁGINA).
  • 2 autores: (APELLIDO1 y APELLIDO2, año: pág)
  • 3 autores: (APELLIDO1; APELLIDO2 y APELLIDO3, año: pág)
  • +3 autores: (APELLIDO1 et al, año: pág)  ← "et al" en cursiva
  • Autor institucional: (INE, 2023: 45) — sigla en mayúsculas.
  • CITA DE CITA prohibida.
  • Aporte propio del investigador: SIN cita.

REGLAS DE ESTILO UCB (anulan UMSS):
  • Prohibido PRIMERA PERSONA SINGULAR (yo, mi, mío, conjugaciones en -o
    como "concluyo", "analizo", "encontré"). Usar plural ("hemos",
    "concluimos") o impersonal.
  • Prohibido el símbolo "&" — reemplazar siempre por "y".
  • Prohibida la sangría inicial de párrafo (los párrafos se separan
    por espaciado doble).
  • Prohibido el subrayado en el cuerpo del texto.
  • Cursivas reservadas a extranjerismos y títulos de libros/revistas.
  • Mayúsculas solo en siglas reconocidas, apellidos de citas y títulos
    de sección.
  • Tablas y figuras: numeración correlativa GLOBAL ("Tabla 1", "Tabla 2"...
    "Figura 1", "Figura 2"...). NUNCA uses "Cuadro N".
  • Título de tabla/figura en parte SUPERIOR CENTRADA, Times NR 12 negrita,
    fuente al pie.

ESTAS REGLAS UCB TIENEN PRIORIDAD ABSOLUTA sobre cualquier instrucción
APA 7 / UMSS que aparezca en el resto del prompt.
--- FIN OVERRIDE UCB ---\n`
      : null;

    const phasePromptBase = typePrompt || adminPrompt || variantePrompt || loadPhasePromptByIdFromDisk(phase_id, tipo, currentPhase.prompt || DEFAULT_PHASES["0"]);
    const baseSystemPrompt = buildSystemPrompt({ phasePrompt: phasePromptBase, perfilEstilo, hilos, hiloConstraints });

    // 📘 El documento académico debe ser ENTREGABLE: limpio, profesional, sin
    //    sugerencias inline. Antes inyectábamos "💡 Sugerencias para enriquecer"
    //    al final de cada sección (plan estándar), pero eso contaminaba el PDF
    //    que el estudiante presenta al tutor. Ahora todas las sugerencias se
    //    generan SEPARADAS en el "Cuadernillo del Estudiante" (ver
    //    src/lib/prompts/cuadernillo-estudiante.ts) — un documento aparte que
    //    solo el estudiante ve y descarga por su lado.
    const systemPrompt = baseSystemPrompt;

    const borradorKey = `${phase_id}_borrador`;
    const borradorPrev = phaseContents[borradorKey] ?? null;
    const ragEnabled = planTier === "pro" || planTier === "elite";
    const academicBlock = academicBlockForProject(proyecto, ragEnabled);
    const academicContext = getAcademicContext(proyecto.academic_context);
    const academicDocuments = getContextDocuments(academicContext);
    const referenceCatalog = normalizeReferenceCatalog([
      readReferenceCatalog(proyecto.academic_memory ?? {}),
      collectReferencesFromPhaseContents(
        previousPhases.map((phase) => ({
          content: phaseContents[phase.id] ?? phaseContents[`${phase.id}_borrador`] ?? null,
        }))
      ),
      buildContextualReferences(buildContextualReferenceInput(academicContext)),
    ]);
    const referencesPhase = tipo !== "borrador" && isReferencesPhase(currentPhase);

    // Deep search: buscar fuentes reales para fases bibliográficas
    const necesitaSearch = faseNecesitaDeepSearch(currentPhase);
    const searchQuery = proyecto.tema_aprobado ?? proyecto.titulo_provisional ?? "";
    const deepSearchBlock = (necesitaSearch && searchQuery)
      ? await buscarFuentesAcademicas(searchQuery, { soloSemanticScholar: false })
          .then(r => buildFuentesVerificadasBlock(r))
          .catch(() => "")
      : "";

    // 📊 FORTALECIMIENTO ANALÍTICO — para fases que requieren tablas y gráficos
    //    (Cap IV monografía, PESTEL/Porter/matrices/financiero/evaluación de PG)
    //    Inyectamos un bloque que obliga a la IA a generar:
    //      - Tablas markdown estructuradas (Nivel 1)
    //      - Gráficos pgfplots/TikZ que se renderizan en LaTeX (Nivel 2)
    //      - Sugerencias visuales para el estudiante
    const bloqueFortalecimientoAnalitico = isPhaseAnalitica(phase_id)
      ? getFortalecimientoAnaliticoBlock(phase_id)
      : null;

    // 📏 OLA 1 — Orientación de extensión variable por universidad.
    //
    // Inyectamos una nota CORTA y AMABLE que le dice a la IA cuántas páginas
    // razonablemente apuntar para ESTE capítulo, según el reglamento de la
    // universidad del proyecto. Las reglas son orientativas, no obligatorias:
    //   - NO inflar para llegar al máximo.
    //   - NO cortar una idea para no pasarse del mínimo.
    //   - Prioridad: calidad de argumento > extensión cumplida.
    //
    // Para capítulos (ph-cap1..ph-cap5) usamos bloque por capítulo.
    // Para ph-resumen usamos bloque específico (se mide en palabras).
    // Otras fases (ph-referencias, ph-cap0, etc.) no reciben este bloque.
    const universidadIdProyecto = (proyecto.universidad_id as string | undefined) ?? null;
    const bloqueOrientacionExtension = phase_id === "ph-resumen"
      ? buildOrientacionResumenBlock(universidadIdProyecto)
      : buildOrientacionExtensionBlock(universidadIdProyecto, phase_id);

    const userPromptParts = [
      `--- EXPEDIENTE ACADEMICO ESTABLE DEL PROYECTO ---\n${academicBlock}\n--- FIN EXPEDIENTE ---`,
      `TEMA APROBADO: "${proyecto.tema_aprobado ?? "Sin tema definido"}"`,
      proyecto.titulo_provisional ? `TITULO PROVISIONAL: "${proyecto.titulo_provisional}"` : null,
      bloqueContexto,
      bloqueVariante,
      bloqueUniversidadUCB,
      bloqueFortalecimientoAnalitico,
      bloqueOrientacionExtension,
      antiDuplicacionBlock || null,
      deepSearchBlock || null,
      referencesPhase
        ? `\n--- SOPORTE ESTRUCTURADO PARA REFERENCIAS ---\n${buildReferenceSupportBlock({
            referenceCatalog,
            documents: academicDocuments,
            contextualReferences: buildContextualReferences(buildContextualReferenceInput(academicContext)),
          })}\n--- FIN SOPORTE DE REFERENCIAS ---`
        : null,
    ];

    if (tipo === "final" && esGuiado) {
      if (borradorPrev) {
        userPromptParts.push(`\n--- BORRADOR PREVIO ---\n${borradorPrev}\n--- FIN BORRADOR ---`);
      }
      if (feedback_usuario?.trim()) {
        userPromptParts.push(`\nFEEDBACK DEL ESTUDIANTE: ${feedback_usuario.trim()}`);
        // 📊 Persistir el feedback para análisis posterior en admin/dashboard
        const ctxIni = ((proyecto.academic_context ?? {}) as Record<string, unknown>).contexto_inicial as Record<string, unknown> | undefined;
        persistirFeedback({
          proyecto_id: proyecto.id,
          usuario_id: proyecto.usuario_id ?? "anonimo",
          phase_id,
          phase_label: currentPhase.label,
          programa: String(ctxIni?.programa ?? ""),
          feedback_text: feedback_usuario.trim(),
          tipo: "aplicar_cambios",
        });
      }
      userPromptParts.push(`\nGenera la VERSIÓN FINAL de ${currentPhase.label} incorporando el feedback.`);
    } else {
      if (mensaje_usuario) {
        userPromptParts.push(`\nPETICIÓN ADICIONAL DEL USUARIO: ${mensaje_usuario}`);
        // 📊 Persistir mensajes de chat (correcciones puntuales) para análisis
        const ctxIni = ((proyecto.academic_context ?? {}) as Record<string, unknown>).contexto_inicial as Record<string, unknown> | undefined;
        persistirFeedback({
          proyecto_id: proyecto.id,
          usuario_id: proyecto.usuario_id ?? "anonimo",
          phase_id,
          phase_label: currentPhase.label,
          programa: String(ctxIni?.programa ?? ""),
          feedback_text: mensaje_usuario,
          tipo: "chat_correccion",
        });
      }
      userPromptParts.push(`\nGenera el contenido de ${currentPhase.label}.`);
    }

    const userPrompt = userPromptParts.filter(Boolean).join("\n");

    // 📏 maxTokens es TECHO, no objetivo. La IA debe usar lo mínimo necesario
    // para cubrir el tema con calidad; estos números son margen de seguridad.
    // Suma proyectada al PDF si se llenara cada techo (Scribe):
    //   Cap1(16) + Cap2(14) + Cap3(12) + Cap4(18) + Cap5(10) + Resumen(1.5) + Biblio(5) ≈ 76 págs.
    // Encaja en UMSS-Posgrado (rango 50-70) sin inflar y deja aire para
    // universidades con techos más altos. El auto-continue reanuda si el
    // modelo pega contra el techo.
    const TOKENS_POR_FASE: Record<string, number> = {
      "ph-cap0":        6000,   // propuestas + JSON (no va al PDF)
      "ph-cap1":       11000,   // techo ~16 págs (5 secciones obligatorias, denso)
      "ph-cap2":        9500,   // techo ~14 págs (rango pedido 12-16)
      "ph-cap3":       10000,   // techo ~12 págs. Subido de 6K → 10K: el diseño metodológico
                                // es denso (enfoque, tipo, métodos, técnicas, instrumentos,
                                // fuentes, criterios) y a 6K se cortaba a mitad de tablas.
      "ph-cap4":       12000,   // techo ~18 págs (rango pedido 15-25). Subido de 10K → 12K:
                                // es el cap más exigido (datos + tablas + gráficos + propuesta).
      "ph-cap5":        8000,   // techo ~10 págs. Subido de 4K → 8K: conclusiones por objetivo
                                // específico + cierre integrador + recomendaciones por destinatario.
      "ph-resumen":     2000,   // 400-600 palabras (1.5 págs). Subido de 1K → 2K: el resumen
                                // ejecutivo de UMSS pide objetivo + métodos + resultados + conclusión.
      "ph-referencias": 3500,   // ~5 págs de bibliografía APA
      "ph-latex":        100,   // 🛡️ Fase NO-OP desde el refactor a chunking (commit 61859aa).
                                // El .tex final se arma en paquete-latex/route.ts llamando a la IA
                                // por capítulo. Aquí solo se devuelve un placeholder sin tocar IA
                                // (ver bloque "ph-latex || ph-proy-latex" más abajo). Antes el techo
                                // era 50K "por si acaso" — desperdicio puro. Lo dejamos en 100 como
                                // defensa en profundidad: si algo bypaseara el guard y llamara IA,
                                // el daño es ridículo.
      "ph-calidad":      100,   // 🛡️ Reconvertida en Banco de Preguntas para defensa.
                                // El endpoint genérico ya la rechaza (ver guard arriba), pero
                                // dejamos un techo simbólico de 100 tokens como defensa en
                                // profundidad — si algo bypasea el guard, el daño es ridículo.

      // ── Fases del nuevo servicio Proyecto de Grado (UCATEC) ──────────────
      "ph-proy-cap0":     3000,   // Idea de negocio (800-1500 palabras)
      "ph-proy-cap1":    15000,   // Marco Referencial (8-14 págs) — aumentado de 12k tras observar cortes con auto-continue
      "ph-proy-cap2":    11000,   // Marco Teórico (25-35 conceptos) — aumentado de 9k
      // Fases 3a-9 todavía con prompts placeholder — se irán completando
      // según el plan PATRON_PROYECTO_GRADO.md. Tope simbólico de 100 hasta
      // entonces para que un placeholder no gaste mucho si se ejecuta por error.
      "ph-proy-cap3a":    8000,   // PESTEL (12-18 págs, 4500-7000 palabras, 7 tablas)
      "ph-proy-cap3b":    6000,   // 5 Fuerzas Porter (10-15 págs, 3500-5500 palabras, 8 tablas)
      "ph-proy-cap3c":    5000,   // Matrices estratégicas (6-10 págs, 2500-4000 palabras, 4 matrices)
      "ph-proy-cap3d":    5000,   // Diseño de encuesta (5-8 págs, cuestionario completo)
      "ph-proy-cap3e":    7000,   // Análisis de encuesta (12-20 págs, 15-25 tablas)
      "ph-proy-cap3f":    4000,   // Demanda y cuota (4-6 págs, 3 tablas, proyección 5 años)
      "ph-proy-cap4a":    7000,   // Estudio organizacional (10-15 págs)
      "ph-proy-cap4abis": 6000,   // Propuesta administrativa RRHH (10-15 págs)
      "ph-proy-cap4b":    6000,   // Estudio legal (8-12 págs)
      "ph-proy-cap4c":    9000,   // Estudio técnico (12-18 págs, variante subtipo)
      "ph-proy-cap4d":    4000,   // Branding (6-10 págs + briefs para logos)
      "ph-proy-cap4e":    8000,   // Mix marketing (10-20 págs, variante 4P/7P)
      "ph-proy-cap4f":    8000,   // Estudio financiero (15-22 págs, 10+ tablas)
      "ph-proy-cap4g":    6000,   // Evaluación del proyecto (10-14 págs, VAN/TIR/WACC/PE)
      "ph-proy-resumen":   1500,   // Resumen ejecutivo (300-450 palabras, 1 página)
      "ph-proy-conclus":   4000,   // Conclusiones + recomendaciones (5-8 págs)
      "ph-proy-referencias": 4000, // Bibliografía consolidada APA 7
      "ph-proy-latex":      100,   // 🛡️ NO-OP (igual que ph-latex). El .tex final se arma en
                                   // paquete-latex/route.ts por chunking. Techo simbólico.
      "ph-proy-defensa":   2500,   // Banco de preguntas (fire-and-forget por capítulo)
    };
    const maxTokensForPhase = TOKENS_POR_FASE[phase_id] ?? 6000;

    // Determine numeric phase index for plan-aware routing
    const phaseIndex = Math.min(
      sorted.findIndex((p) => p.id === phase_id),
      5
    ) as PhaseIndex;

    let textoGenerado: string;
    let proveedor: string;
    let providerId = "";
    let providerModel = "";
    let traceStatus: "success" | "fallback" = "success";
    let traceError: string | null = null;
    let autoContinuado = false;
    try {
      // Admin override takes priority (set via Admin → Modelos & APIs panel)
      const adminCfg = getServiceAIConfig(proyecto.servicio_id);

      let aiResult: { text: string; provider: string; model: string };
      if (adminCfg?.api_key) {
        // Use admin-configured provider for this service
        const r = await llamarIA(systemPrompt, userPrompt, maxTokensForPhase, proyecto.servicio_id);
        aiResult = { text: r.text, provider: r.provider, model: r.model };
      } else if (phase_id === "ph-latex" || phase_id === "ph-proy-latex") {
        // 🚀 Fase de Compilación LaTeX — YA NO LLAMA IA AQUÍ.
        //
        // Desde el refactor a chunking (commit 61859aa), el .tex final se
        // arma EN EL MOMENTO de descargar el ZIP, llamando a la IA en paralelo
        // POR CAPÍTULO (1 call por cap) desde el endpoint paquete-latex.
        //
        // Generar un .tex monolítico aquí sería desperdicio: 1 llamada IA
        // grande que NO se usa para nada (paquete-latex re-genera todo).
        //
        // Por eso devolvemos un mensaje informativo SIN llamar IA. El campo
        // phase_contents['ph-latex'] queda como placeholder para que el UI
        // muestre la fase como "generada" y pueda mostrar el botón
        // "Paquete .tex + logo" que sí hace el trabajo real.
        aiResult = {
          text: "% Esta fase ya no requiere generación de IA directa.\n%\n% El documento .tex final se arma al momento de descargar el paquete,\n% llamando a la IA por capítulo (chunking). Esto preserva el contenido\n% completo y evita resumir.\n%\n% Click en \"Paquete .tex + logo\" abajo para generar y descargar el ZIP.",
          provider: "system",
          model: "no-ai-chunking",
        };
      } else {
        // Route by user's plan and academic phase
        aiResult = await llamarIAPorPlan(systemPrompt, userPrompt, phaseIndex, planTier);
      }

      textoGenerado = aiResult.text;
      providerId = aiResult.provider;
      providerModel = aiResult.model;
      proveedor = `${aiResult.provider} / ${aiResult.model}`;

      // 🔁 Auto-continue: si el texto pareciera cortado a mitad (no termina con cierre
      // limpio y tiene longitud sustancial), hacemos UNA segunda llamada para completar.
      const fueCortado = parecieraTruncado(textoGenerado, maxTokensForPhase);
      const ultimosCh = textoGenerado.trimEnd().slice(-60);
      console.log(`[auto-continue] phase=${phase_id} chars=${textoGenerado.length} maxTokens=${maxTokensForPhase} truncado=${fueCortado} cola="${ultimosCh.replace(/\n/g, "\\n")}"`);
      if (fueCortado) {
        const continuacion = await continuarGeneracion(
          systemPrompt,
          textoGenerado,
          maxTokensForPhase,
          proyecto.servicio_id,
        );
        if (continuacion) {
          textoGenerado = empalmarContinuacion(textoGenerado, continuacion);
          autoContinuado = true;
          console.log(`[auto-continue] ✓ completado. Nuevo total chars=${textoGenerado.length}`);
        } else {
          console.warn(`[auto-continue] ✗ continuación falló o vacía`);
        }
      }
    } catch (e) {
      const errorMessage = (e as Error).message;
      if (referencesPhase) {
        textoGenerado = buildLocalReferencesPhase({ proyecto, previousPhases, phaseContents });
        providerId = "local";
        providerModel = "referencias-respaldadas";
        proveedor = "local / referencias respaldadas";
        traceStatus = "fallback";
        traceError = errorMessage;
      } else {
        await dbUpdateProyecto(proyecto_id, {
          academic_memory: appendAITrace(proyecto.academic_memory, buildAITraceEntry({
            servicioId: proyecto.servicio_id,
            scope: "generate-phase",
            action: tipo === "borrador" ? "generar borrador" : "generar fase",
            phaseId: phase_id,
            phaseLabel: currentPhase.label,
            status: "error",
            durationMs: Date.now() - t0,
            error: errorMessage,
          })),
        });
        // Log técnico para admin, mensaje amigable para el usuario.
        console.error(`[generate-phase] IA error: ${(e as Error).message}`);
        const userMessage = (e as Error).message.includes("temporales") || (e as Error).message.includes("intentá de nuevo")
          ? (e as Error).message
          : "Estamos teniendo problemas temporales para generar tu contenido. Por favor intentá de nuevo en unos minutos.";
        return NextResponse.json({ error: userMessage }, { status: 502 });
      }
    }

    // Store content
    let newPhaseContents: Record<string, string | null>;
    let requiereActualizacion = proyecto.requiere_actualizacion ?? {};

    if (tipo === "borrador" && esGuiado) {
      // Store as borrador, don't invalidate others yet
      newPhaseContents = { ...phaseContents, [borradorKey]: textoGenerado };
    } else {
      // Final content — store in the main key and invalidate subsequent phases
      newPhaseContents = { ...phaseContents, [phase_id]: textoGenerado };

      // Invalidate all phases that come after this one
      const currentOrden = currentPhase.orden;
      const subsequentPhases = sorted.filter(p => p.orden > currentOrden);
      for (const sp of subsequentPhases) {
        if (phaseContents[sp.id] || phaseContents[`${sp.id}_borrador`]) {
          requiereActualizacion = { ...requiereActualizacion, [sp.id]: true };
        }
      }

      // Clear invalidation flag for this phase
      delete requiereActualizacion[phase_id];
    }

    const nextMemoryBase = tipo === "borrador" && esGuiado
      ? proyecto.academic_memory
      : upsertPhaseSummary(proyecto.academic_memory, phase_id, currentPhase.label, textoGenerado);
    const nextMemory = withUpdatedReferenceCatalog(
      nextMemoryBase ?? {},
      textoGenerado,
      buildContextualReferences(buildContextualReferenceInput(academicContext))
    );

    const traceEntry = buildAITraceEntry({
      servicioId: proyecto.servicio_id,
      scope: "generate-phase",
      action: tipo === "borrador" ? "generar borrador" : "generar fase",
      phaseId: phase_id,
      phaseLabel: currentPhase.label,
      status: traceStatus,
      providerId,
      model: providerModel,
      durationMs: Date.now() - t0,
      error: traceError,
    });

    const newCommitmentsPhase = extractCommitments(textoGenerado, currentPhase.label);
    const nextMemoryWithHilo = updateHiloConductor(nextMemory, newCommitmentsPhase);

    await dbUpdateProyecto(proyecto_id, {
      estado_fase: Math.max(proyecto.estado_fase, sorted.findIndex((phase) => phase.id === phase_id)),
      phase_contents: newPhaseContents,
      requiere_actualizacion: requiereActualizacion,
      final_document: null,
      final_document_validation: {},
      academic_memory: appendAITrace(nextMemoryWithHilo, traceEntry),
    });

    return NextResponse.json({
      ok: true,
      phase_id,
      tipo,
      fase_etiqueta: currentPhase.label,
      proveedor,
      duracion_ms: Date.now() - t0,
      contenido: textoGenerado,
      requiere_actualizacion: requiereActualizacion,
      ai_trace_entry: traceEntry,
      auto_continuado: autoContinuado,
    });
  }

  // Defensive fallback: phase_id es obligatorio (validado en POST), nunca debería llegar aquí.
  return NextResponse.json({ error: "phase_id requerido" }, { status: 400 });
}

