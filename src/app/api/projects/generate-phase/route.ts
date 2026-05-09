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
import { getServiceAIStatus, llamarIA } from "@/lib/aiProvider";
import { dbGetProyecto, dbUpdateProyecto } from "@/lib/db";
import { appendAITrace } from "@/lib/aiTrace.mjs";
import {
  extractCommitments,
  updateHiloConductor,
  buildHiloConstraintBlock,
} from "@/lib/hiloConductor";
import { loadFromDisk } from "@/lib/persistence";
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
import { buscarFuentesAcademicas, buildFuentesVerificadasBlock } from "@/lib/deepSearch";
import { SISTEMA_SCRIBE_CAP1, buildContextoCap1 } from "@/lib/prompts/scribe/cap1";

// Fases legacy que se benefician de búsqueda académica (Marco Teórico y Bibliografía)
const FASES_CON_DEEP_SEARCH = new Set([2, 3, 5]);

// Palabras clave en el label/prompt de una fase dinámica que activan deep search
const DEEP_SEARCH_KEYWORDS = /marco\s+te[oó]rico|bibliograf|referencias|fuentes|estado\s+del\s+arte|antecedente/i;

function faseNecesitaDeepSearch(phase: { label: string; prompt?: string }): boolean {
  return DEEP_SEARCH_KEYWORDS.test(phase.label) || DEEP_SEARCH_KEYWORDS.test(phase.prompt ?? "");
}

const FASE_ETIQUETA: Record<number, string> = {
  0: "Fase 0 — Planteamiento del Tema",
  1: "Fase 1 — Capítulo I: Marco Referencial",
  2: "Fase 2 — Capítulo II: Marco Teórico",
  3: "Fase 3 — Capítulos III-V: Desarrollo",
  4: "Fase 4 — Revisión y Compilación",
  5: "Fase 5 — Conclusiones y Bibliografía",
};

const FASE_A_COLUMNA: Record<number, string> = {
  0: "contenido_fase_0",
  1: "contenido_fase_1",
  2: "contenido_fase_2",
  3: "contenido_fase_3",
  4: "contenido_fase_4",
  5: "contenido_fase_5",
};

// ── Prompt loader ─────────────────────────────────────────────────────────────

import { DEFAULT_PHASES } from "@/app/api/admin/workspace-prompts/route";

/**
 * Builds the system prompt following the priority hierarchy:
 * 1. Phase-specific instructions (prompt_borrador or prompt_final)
 * 2. User style profile
 * 3. Hilo Conductor rules (lowest priority)
 */
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

function loadPhasePromptFromDisk(fase: number, tipo: "borrador" | "final"): string {
  try {
    const disk = loadFromDisk();
    const wp = disk.workspacePrompts;
    // Try tipo-specific key first, then generic key, then default
    const key = String(fase);
    const tipoKey = `${key}_${tipo}`;
    return wp?.phases?.[tipoKey] ?? wp?.phases?.[key] ?? DEFAULT_PHASES[key as keyof typeof DEFAULT_PHASES] ?? DEFAULT_PHASES["0"];
  } catch {
    return DEFAULT_PHASES[String(fase) as keyof typeof DEFAULT_PHASES] ?? DEFAULT_PHASES["0"];
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

function loadOnboardingPrompt(): string {
  try {
    const disk = loadFromDisk();
    return disk.workspacePrompts?.phases?.["onboarding"] ?? DEFAULT_PHASES["onboarding"];
  } catch {
    return DEFAULT_PHASES["onboarding"];
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
    const phase = phases.find((p: any) => p.id === phaseId);
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

function academicBlockForProject(proyecto: {
  academic_context?: Record<string, unknown>;
  academic_memory?: Record<string, unknown>;
  tema_aprobado?: string | null;
  titulo_provisional?: string | null;
}) {
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
    documents: getContextDocuments(academicContext),
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

// ── Handler principal ─────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const t0 = Date.now();

  try {
    const { user: sessionUser } = await requireAuth();

    let proyecto_id: string;
    let fase_numero: number;
    let phase_id: string | undefined;
    let mensaje_usuario: string | undefined;
    let tipo: "borrador" | "final";

    try {
      const body = await req.json();
      proyecto_id = body.proyecto_id;
      phase_id = body.phase_id ?? undefined;
      fase_numero = Number(body.fase_numero ?? 0);
      mensaje_usuario = body.mensaje_usuario ?? undefined;
      tipo = "final";

      if (!proyecto_id || (!phase_id && (isNaN(fase_numero) || fase_numero < 0))) {
        return NextResponse.json(
          { error: "proyecto_id requerido, y también fase_numero (>=0) o phase_id" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
    }

    // Siempre usar el path principal (tabla 'proyectos' vía db layer)
    return await generarSinSupabase({
      sessionUserId: sessionUser.id,
      proyecto_id, fase_numero, phase_id,
      mensaje_usuario, tipo,
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
  sessionUserId, proyecto_id, fase_numero, phase_id,
  mensaje_usuario, tipo,
  t0,
}: {
  sessionUserId: string;
  proyecto_id: string;
  fase_numero: number;
  phase_id?: string;
  mensaje_usuario?: string;
  tipo: "borrador" | "final";
  t0: number;
}) {
  const proyecto = await dbGetProyecto(proyecto_id);
  if (!proyecto || proyecto.usuario_id !== sessionUserId) {
    return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
  }

  const hilos = loadHilosFromDisk();
  const hiloConstraints = buildHiloConstraintBlock(proyecto.academic_memory);
  const perfilEstilo = proyecto.perfil_estilo_usuario;

  const MAX_CHARS_POR_FASE = 1800;

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

    const typePrompt = tipo === "borrador"
      ? currentPhase.prompt_borrador?.trim()
      : currentPhase.prompt_final?.trim();

    // Intenta cargar el prompt de admin/phase-definitions primero
    const adminPrompt = await loadPhasePromptFromAdmin(servicio_id, phase_id);
    const phasePromptBase = typePrompt || adminPrompt || loadPhasePromptByIdFromDisk(phase_id, tipo, currentPhase.prompt || DEFAULT_PHASES["0"]);
    const systemPrompt = buildSystemPrompt({ phasePrompt: phasePromptBase, perfilEstilo, hilos, hiloConstraints });

    const academicBlock = academicBlockForProject(proyecto);
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

    const userPromptParts = [
      `--- EXPEDIENTE ACADEMICO ESTABLE DEL PROYECTO ---\n${academicBlock}\n--- FIN EXPEDIENTE ---`,
      `TEMA APROBADO: "${proyecto.tema_aprobado ?? "Sin tema definido"}"`,
      proyecto.titulo_provisional ? `TITULO PROVISIONAL: "${proyecto.titulo_provisional}"` : null,
      bloqueContexto,
      deepSearchBlock || null,
      referencesPhase
        ? `\n--- SOPORTE ESTRUCTURADO PARA REFERENCIAS ---\n${buildReferenceSupportBlock({
            referenceCatalog,
            documents: academicDocuments,
            contextualReferences: buildContextualReferences(buildContextualReferenceInput(academicContext)),
          })}\n--- FIN SOPORTE DE REFERENCIAS ---`
        : null,
    ];

    if (mensaje_usuario) userPromptParts.push(`\nPETICIÓN ADICIONAL DEL USUARIO: ${mensaje_usuario}`);
    userPromptParts.push(`\nGenera el contenido de ${currentPhase.label}.`);

    const userPrompt = userPromptParts.filter(Boolean).join("\n");

    let textoGenerado: string;
    let proveedor: string;
    let providerId = "";
    let providerModel = "";
    let traceStatus: "success" | "fallback" = "success";
    let traceError: string | null = null;
    try {
      const resultado = await llamarIA(systemPrompt, userPrompt, 5000, proyecto.servicio_id);
      textoGenerado = resultado.text;
      providerId = resultado.provider;
      providerModel = resultado.model;
      proveedor = `${resultado.provider} / ${resultado.model}`;
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
            action: "generar fase",
            phaseId: phase_id,
            phaseLabel: currentPhase.label,
            status: "error",
            durationMs: Date.now() - t0,
            error: errorMessage,
          })),
        });
        return NextResponse.json({ error: `Error de IA: ${(e as Error).message}` }, { status: 502 });
      }
    }

    // Store content as final (direct mode — no borrador)
    let newPhaseContents: Record<string, string | null>;
    let requiereActualizacion = proyecto.requiere_actualizacion ?? {};

    // Store final content and invalidate subsequent phases
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

    const nextMemoryBase = upsertPhaseSummary(proyecto.academic_memory, phase_id, currentPhase.label, textoGenerado);
    const nextMemory = withUpdatedReferenceCatalog(
      nextMemoryBase ?? {},
      textoGenerado,
      buildContextualReferences(buildContextualReferenceInput(academicContext))
    );

    const traceEntry = buildAITraceEntry({
      servicioId: proyecto.servicio_id,
      scope: "generate-phase",
      action: "generar fase",
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
    });
  }

  // ── Modo legacy: fase_numero ──────────────────────────────────────────────

  // Onboarding: fase 0 sin tema aprobado → prompt de propuesta de temas
  const esOnboarding = fase_numero === 0 && !proyecto.tema_aprobado;

  const fasesAnteriores: string[] = [];
  for (let f = 0; f < fase_numero; f++) {
    const key = FASE_A_COLUMNA[f] as keyof typeof proyecto;
    let contenido = proyecto[key] as string | null;
    if (contenido) {
      if (contenido.length > MAX_CHARS_POR_FASE) {
        contenido = contenido.slice(0, MAX_CHARS_POR_FASE) + "\n[... contenido truncado para optimizar tokens ...]";
      }
      fasesAnteriores.push(`=== ${FASE_ETIQUETA[f]} ===\n${contenido}\n=== FIN ===`);
    }
  }

  const bloqueContexto = fasesAnteriores.length > 0
    ? `\n\n--- RESUMEN DE FASES ANTERIORES ---\n\n${fasesAnteriores.join("\n\n")}`
    : "";

  const phaseKey = String(fase_numero);
  const phaseContents = proyecto.phase_contents ?? {};

  let phasePromptBase: string;
  if (esOnboarding) {
    phasePromptBase = loadOnboardingPrompt();
  } else {
    phasePromptBase = loadPhasePromptFromDisk(fase_numero, tipo);
  }

  const systemPrompt = esOnboarding
    ? phasePromptBase  // onboarding doesn't use style profile
    : buildSystemPrompt({ phasePrompt: phasePromptBase, perfilEstilo, hilos, hiloConstraints });

  // Deep search para fases legacy que lo necesitan (Marco Teórico, Desarrollo, Bibliografía)
  const legacySearchQuery = proyecto.tema_aprobado ?? proyecto.titulo_provisional ?? "";
  const legacyDeepSearchBlock = (FASES_CON_DEEP_SEARCH.has(fase_numero) && legacySearchQuery && !esOnboarding)
    ? await buscarFuentesAcademicas(legacySearchQuery).then(r => buildFuentesVerificadasBlock(r)).catch(() => "")
    : "";

  const userPromptParts: (string | null)[] = [
    `--- EXPEDIENTE ACADEMICO ESTABLE DEL PROYECTO ---\n${academicBlockForProject(proyecto)}\n--- FIN EXPEDIENTE ---`,
    `TEMA APROBADO: "${proyecto.tema_aprobado ?? "Sin tema definido"}"`,
    proyecto.titulo_provisional ? `TÍTULO PROVISIONAL: "${proyecto.titulo_provisional}"` : null,
    bloqueContexto,
    legacyDeepSearchBlock || null,
  ];

  if (mensaje_usuario) userPromptParts.push(`\nPETICIÓN ADICIONAL DEL USUARIO: ${mensaje_usuario}`);
  userPromptParts.push(`\nGenera el contenido de la ${FASE_ETIQUETA[fase_numero]}.`);

  const userPrompt = userPromptParts.filter(Boolean).join("\n");
  const maxTokens = fase_numero <= 1 ? 6000 : fase_numero <= 3 ? 4500 : 3000;

  let textoGenerado: string;
  let proveedor: string;
  let providerId = "";
  let providerModel = "";
  try {
    const resultado = await llamarIA(systemPrompt, userPrompt, maxTokens, proyecto.servicio_id);
    textoGenerado = resultado.text;
    providerId = resultado.provider;
    providerModel = resultado.model;
    proveedor = `${resultado.provider} / ${resultado.model}`;
  } catch (e) {
    const errorMessage = (e as Error).message;
    await dbUpdateProyecto(proyecto_id, {
      academic_memory: appendAITrace(proyecto.academic_memory, buildAITraceEntry({
        servicioId: proyecto.servicio_id,
        scope: "generate-phase",
        action: "generar fase",
        phaseId: phaseKey,
        phaseLabel: FASE_ETIQUETA[fase_numero],
        status: "error",
        durationMs: Date.now() - t0,
        error: errorMessage,
      })),
    });
    return NextResponse.json({ error: `Error de IA: ${(e as Error).message}` }, { status: 502 });
  }

  let requiereActualizacion = proyecto.requiere_actualizacion ?? {};
  let updates: Partial<typeof proyecto> = {};

  // Store final content in legacy columns + phase_contents (direct mode only)
  const nuevaFase = Math.max(proyecto.estado_fase, fase_numero);
  const colKey = FASE_A_COLUMNA[fase_numero];
  updates = {
    estado_fase: nuevaFase,
    [colKey]: textoGenerado,
    phase_contents: { ...phaseContents, [phaseKey]: textoGenerado },
    final_document: null,
    final_document_validation: {},
  };

  // Cache invalidation for subsequent phases
  for (let f = fase_numero + 1; f <= 5; f++) {
    const fKey = FASE_A_COLUMNA[f] as keyof typeof proyecto;
    const hasContent = !!(proyecto[fKey] as string | null) || !!phaseContents[String(f)];
    if (hasContent) {
      requiereActualizacion = { ...requiereActualizacion, [String(f)]: true };
    }
  }
  delete requiereActualizacion[phaseKey];
  updates.requiere_actualizacion = requiereActualizacion;
  const legacyAcademicContext = getAcademicContext(proyecto.academic_context);
  updates.academic_memory = withUpdatedReferenceCatalog(
    upsertPhaseSummary(
      proyecto.academic_memory,
      phaseKey,
      FASE_ETIQUETA[fase_numero],
      textoGenerado
    ) ?? {},
    textoGenerado,
    buildContextualReferences(buildContextualReferenceInput(legacyAcademicContext))
  );

  const traceEntry = buildAITraceEntry({
    servicioId: proyecto.servicio_id,
    scope: "generate-phase",
    action: tipo === "borrador" ? "generar borrador" : "generar fase",
    phaseId: phaseKey,
    phaseLabel: FASE_ETIQUETA[fase_numero],
    status: "success",
    providerId,
    model: providerModel,
    durationMs: Date.now() - t0,
  });
  updates.academic_memory = appendAITrace(updates.academic_memory ?? proyecto.academic_memory, traceEntry);

  const newCommitmentsLegacy = extractCommitments(textoGenerado, FASE_ETIQUETA[fase_numero]);
  updates.academic_memory = updateHiloConductor(updates.academic_memory ?? proyecto.academic_memory, newCommitmentsLegacy);

  await dbUpdateProyecto(proyecto_id, updates);

  return NextResponse.json({
    ok: true,
    fase: fase_numero,
    tipo,
    fase_etiqueta: FASE_ETIQUETA[fase_numero],
    proveedor,
    duracion_ms: Date.now() - t0,
    contenido: textoGenerado,
    requiere_actualizacion: requiereActualizacion,
    ai_trace_entry: traceEntry,
  });
}

