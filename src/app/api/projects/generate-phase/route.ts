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
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { llamarIA } from "@/lib/aiProvider";
import { getProyecto, updateProyecto } from "@/lib/memoryStore";
import { loadFromDisk } from "@/lib/persistence";
import type { EstadoFase, UpdateTables } from "@/types/database";

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
}: {
  phasePrompt: string;
  perfilEstilo?: string | null;
  hilos: string[];
}): string {
  const parts: string[] = [];

  parts.push(phasePrompt);

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
    let feedback_usuario: string | undefined;

    try {
      const body = await req.json();
      proyecto_id = body.proyecto_id;
      phase_id = body.phase_id ?? undefined;
      fase_numero = Number(body.fase_numero ?? 0);
      mensaje_usuario = body.mensaje_usuario ?? undefined;
      tipo = body.tipo === "borrador" ? "borrador" : "final";
      feedback_usuario = body.feedback_usuario ?? undefined;

      if (!proyecto_id || (!phase_id && (isNaN(fase_numero) || fase_numero < 0 || fase_numero > 5))) {
        return NextResponse.json(
          { error: "proyecto_id requerido, y también fase_numero (0-5) o phase_id" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return await generarSinSupabase({
        sessionUserId: sessionUser.id,
        proyecto_id, fase_numero, phase_id,
        mensaje_usuario, tipo, feedback_usuario,
        t0,
      });
    }

    return await generarConSupabase({
      sessionUserId: sessionUser.id,
      proyecto_id, fase_numero,
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
  sessionUserId: _sessionUserId, proyecto_id, fase_numero, phase_id,
  mensaje_usuario, tipo, feedback_usuario,
  t0,
}: {
  sessionUserId: string;
  proyecto_id: string;
  fase_numero: number;
  phase_id?: string;
  mensaje_usuario?: string;
  tipo: "borrador" | "final";
  feedback_usuario?: string;
  t0: number;
}) {
  const proyecto = getProyecto(proyecto_id);
  if (!proyecto) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  const hilos = loadHilosFromDisk();
  const perfilEstilo = proyecto.perfil_estilo_usuario;
  const esGuiado = proyecto.modalidad_creacion === "guiada";

  const MAX_CHARS_POR_FASE = 1800;

  // ── Modo dinámico: phase_id ───────────────────────────────────────────────
  if (phase_id) {
    const disk = loadFromDisk();
    const servicio_id = proyecto.servicio_id ?? "mono-001";
    const phaseDefs = disk.phaseDefinitions?.[servicio_id];

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

    const phasePromptBase = loadPhasePromptByIdFromDisk(phase_id, tipo, currentPhase.prompt || DEFAULT_PHASES["0"]);
    const systemPrompt = buildSystemPrompt({ phasePrompt: phasePromptBase, perfilEstilo, hilos });

    const borradorKey = `${phase_id}_borrador`;
    const borradorPrev = phaseContents[borradorKey] ?? null;

    const userPromptParts = [
      `TEMA APROBADO: "${proyecto.tema_aprobado ?? "Sin tema definido"}"`,
      proyecto.titulo_provisional ? `TÍTULO PROVISIONAL: "${proyecto.titulo_provisional}"` : null,
      bloqueContexto,
    ];

    if (tipo === "final" && esGuiado) {
      if (borradorPrev) {
        userPromptParts.push(`\n--- BORRADOR PREVIO ---\n${borradorPrev}\n--- FIN BORRADOR ---`);
      }
      if (feedback_usuario?.trim()) {
        userPromptParts.push(`\nFEEDBACK DEL ESTUDIANTE: ${feedback_usuario.trim()}`);
      }
      userPromptParts.push(`\nGenera la VERSIÓN FINAL de ${currentPhase.label} incorporando el feedback.`);
    } else {
      if (mensaje_usuario) userPromptParts.push(`\nPETICIÓN ADICIONAL DEL USUARIO: ${mensaje_usuario}`);
      userPromptParts.push(`\nGenera el contenido de ${currentPhase.label}.`);
    }

    const userPrompt = userPromptParts.filter(Boolean).join("\n");

    let textoGenerado: string;
    let proveedor: string;
    try {
      const resultado = await llamarIA(systemPrompt, userPrompt, 5000, proyecto.servicio_id);
      textoGenerado = resultado.text;
      proveedor = `${resultado.provider} / ${resultado.model}`;
    } catch (e) {
      return NextResponse.json({ error: `Error de IA: ${(e as Error).message}` }, { status: 502 });
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

    updateProyecto(proyecto_id, {
      phase_contents: newPhaseContents,
      requiere_actualizacion: requiereActualizacion,
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
  const borradorKey = `${phaseKey}_borrador`;
  const phaseContents = proyecto.phase_contents ?? {};
  const borradorPrev = phaseContents[borradorKey] ?? (proyecto[FASE_A_COLUMNA[fase_numero] as keyof typeof proyecto] as string | null);

  let phasePromptBase: string;
  if (esOnboarding) {
    phasePromptBase = loadOnboardingPrompt();
  } else {
    phasePromptBase = loadPhasePromptFromDisk(fase_numero, tipo);
  }

  const systemPrompt = esOnboarding
    ? phasePromptBase  // onboarding doesn't use style profile
    : buildSystemPrompt({ phasePrompt: phasePromptBase, perfilEstilo, hilos });

  const userPromptParts: (string | null)[] = [
    `TEMA APROBADO: "${proyecto.tema_aprobado ?? "Sin tema definido"}"`,
    proyecto.titulo_provisional ? `TÍTULO PROVISIONAL: "${proyecto.titulo_provisional}"` : null,
    bloqueContexto,
  ];

  if (tipo === "final" && esGuiado && !esOnboarding) {
    if (borradorPrev) {
      userPromptParts.push(`\n--- BORRADOR PREVIO ---\n${borradorPrev}\n--- FIN BORRADOR ---`);
    }
    if (feedback_usuario?.trim()) {
      userPromptParts.push(`\nFEEDBACK DEL ESTUDIANTE: ${feedback_usuario.trim()}`);
    }
    userPromptParts.push(`\nGenera la VERSIÓN FINAL de la ${FASE_ETIQUETA[fase_numero]} incorporando el feedback.`);
  } else {
    if (mensaje_usuario) userPromptParts.push(`\nPETICIÓN ADICIONAL DEL USUARIO: ${mensaje_usuario}`);
    userPromptParts.push(`\nGenera el contenido de la ${FASE_ETIQUETA[fase_numero]}.`);
  }

  const userPrompt = userPromptParts.filter(Boolean).join("\n");
  const maxTokens = fase_numero <= 1 ? 6000 : fase_numero <= 3 ? 4500 : 3000;

  let textoGenerado: string;
  let proveedor: string;
  try {
    const resultado = await llamarIA(systemPrompt, userPrompt, maxTokens, proyecto.servicio_id);
    textoGenerado = resultado.text;
    proveedor = `${resultado.provider} / ${resultado.model}`;
  } catch (e) {
    return NextResponse.json({ error: `Error de IA: ${(e as Error).message}` }, { status: 502 });
  }

  let requiereActualizacion = proyecto.requiere_actualizacion ?? {};
  let updates: Partial<typeof proyecto> = {};

  if (tipo === "borrador" && esGuiado) {
    // Store borrador in phase_contents, not in legacy columns
    updates.phase_contents = { ...phaseContents, [borradorKey]: textoGenerado };
  } else {
    // Final or directo: store in legacy columns + phase_contents
    const nuevaFase = Math.max(proyecto.estado_fase, fase_numero);
    const colKey = FASE_A_COLUMNA[fase_numero];
    updates = {
      estado_fase: nuevaFase,
      [colKey]: textoGenerado,
      phase_contents: { ...phaseContents, [phaseKey]: textoGenerado },
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
  }

  updateProyecto(proyecto_id, updates);

  return NextResponse.json({
    ok: true,
    fase: fase_numero,
    tipo,
    fase_etiqueta: FASE_ETIQUETA[fase_numero],
    proveedor,
    duracion_ms: Date.now() - t0,
    contenido: textoGenerado,
    requiere_actualizacion: requiereActualizacion,
  });
}

// ── Con Supabase ──────────────────────────────────────────────────────────────

async function generarConSupabase({
  sessionUserId, proyecto_id, fase_numero,
  mensaje_usuario, tipo, feedback_usuario,
  t0,
}: {
  sessionUserId: string;
  proyecto_id: string;
  fase_numero: number;
  mensaje_usuario?: string;
  tipo: "borrador" | "final";
  feedback_usuario?: string;
  t0: number;
}) {
  const db = createAdminClient();

  const { data: proyecto, error: errProyecto } = await db
    .from("proyectos_fases")
    .select("*, servicios(id, nombre, audiencia_id)")
    .eq("id", proyecto_id)
    .eq("usuario_id", sessionUserId)
    .single();

  if (errProyecto || !proyecto) {
    // Fallback to memory store
    return await generarSinSupabase({
      sessionUserId, proyecto_id, fase_numero,
      mensaje_usuario, tipo, feedback_usuario, t0,
    });
  }

  const servicio_id = proyecto.servicio_id;
  const esGuiado = (proyecto as unknown as { modalidad_creacion?: string }).modalidad_creacion === "guiada";
  const perfilEstilo = (proyecto as unknown as { perfil_estilo_usuario?: string }).perfil_estilo_usuario;

  const { data: hilosData } = await db
    .from("hilos_conductores")
    .select("regla_inmutable, orden")
    .eq("servicio_id", servicio_id)
    .order("orden");

  const hilos = hilosData?.map(h => h.regla_inmutable) ?? [];

  // Try to load dual prompts from DB, fall back to disk config
  const { data: promptBorradorData } = await db
    .from("prompts_maestros")
    .select("contenido_prompt, nombre_fase, version")
    .eq("servicio_id", servicio_id)
    .eq("fase_numero", fase_numero as EstadoFase)
    .eq("activo", true)
    .eq("tipo" as never, tipo === "borrador" ? "borrador" : "final")
    .maybeSingle();

  const phasePromptBase = promptBorradorData?.contenido_prompt
    ?? loadPhasePromptFromDisk(fase_numero, tipo);

  const systemPrompt = buildSystemPrompt({ phasePrompt: phasePromptBase, perfilEstilo, hilos });

  const MAX_CHARS = 1800;
  const fasesAnteriores: string[] = [];
  for (let f = 0; f < fase_numero; f++) {
    const col = FASE_A_COLUMNA[f] as keyof typeof proyecto;
    const contenido = proyecto[col] as string | null;
    if (contenido) {
      const truncated = contenido.length > MAX_CHARS
        ? contenido.slice(0, MAX_CHARS) + "\n[... truncado ...]"
        : contenido;
      fasesAnteriores.push(`=== ${FASE_ETIQUETA[f]} (ya aprobada) ===\n${truncated}\n=== FIN ===`);
    }
  }

  const bloqueContexto = fasesAnteriores.length > 0
    ? `\n\n--- CONTEXTO ACUMULADO ---\n\n${fasesAnteriores.join("\n\n")}`
    : "";

  const phaseKey = String(fase_numero);
  const borradorCol = `contenido_fase_${fase_numero}_borrador` as keyof typeof proyecto;
  const borradorPrev = (proyecto[borradorCol] as string | null) ?? null;

  const userPromptParts: (string | null)[] = [
    `TEMA APROBADO: "${proyecto.tema_aprobado ?? "Sin tema definido"}"`,
    proyecto.titulo_provisional ? `TÍTULO PROVISIONAL: "${proyecto.titulo_provisional}"` : null,
    bloqueContexto,
  ];

  if (tipo === "final" && esGuiado) {
    if (borradorPrev) {
      userPromptParts.push(`\n--- BORRADOR PREVIO ---\n${borradorPrev}\n--- FIN BORRADOR ---`);
    }
    if (feedback_usuario?.trim()) {
      userPromptParts.push(`\nFEEDBACK DEL ESTUDIANTE: ${feedback_usuario.trim()}`);
    }
    userPromptParts.push(`\nGenera la VERSIÓN FINAL de la ${FASE_ETIQUETA[fase_numero]} incorporando el feedback.`);
  } else {
    if (mensaje_usuario) userPromptParts.push(`\nPETICIÓN ADICIONAL DEL USUARIO: ${mensaje_usuario}`);
    userPromptParts.push(`\nGenera el contenido de la ${FASE_ETIQUETA[fase_numero]}.`);
  }

  const userPrompt = userPromptParts.filter(Boolean).join("\n");

  let textoGenerado: string;
  let proveedor: string;
  try {
    const resultado = await llamarIA(systemPrompt, userPrompt, 7000);
    textoGenerado = resultado.text;
    proveedor = resultado.provider;
  } catch (e) {
    return NextResponse.json({ error: `Error de IA: ${(e as Error).message}` }, { status: 502 });
  }

  const duracion_ms = Date.now() - t0;

  if (tipo === "borrador" && esGuiado) {
    // Store borrador in a separate column (use phase_contents JSON fallback in Supabase)
    await db.from("proyectos_fases").update({
      phase_contents: {
        ...(((proyecto as unknown as { phase_contents?: Record<string, unknown> }).phase_contents) ?? {}),
        [`${phaseKey}_borrador`]: textoGenerado,
      },
    } as never).eq("id", proyecto_id);
  } else {
    const nuevaFase = Math.max(proyecto.estado_fase, fase_numero) as EstadoFase;
    const updatePayload: UpdateTables<"proyectos_fases"> = { estado_fase: nuevaFase };
    switch (fase_numero) {
      case 0: updatePayload.contenido_fase_0 = textoGenerado; break;
      case 1: updatePayload.contenido_fase_1 = textoGenerado; break;
      case 2: updatePayload.contenido_fase_2 = textoGenerado; break;
      case 3: updatePayload.contenido_fase_3 = textoGenerado; break;
      case 4: updatePayload.contenido_fase_4 = textoGenerado; break;
      case 5: updatePayload.contenido_fase_5 = textoGenerado; break;
    }
    await db.from("proyectos_fases").update(updatePayload).eq("id", proyecto_id);
  }

  try {
    await db.from("auditoria_chats").insert({
      usuario_id: sessionUserId,
      proyecto_id,
      servicio_id,
      fase_numero,
      mensaje_usuario: userPrompt.slice(0, 2000),
      respuesta_ia: textoGenerado.slice(0, 5000),
      modelo_usado: proveedor,
      duracion_ms,
    });
  } catch { /* auditoría no crítica */ }

  return NextResponse.json({
    ok: true,
    fase: fase_numero,
    tipo,
    fase_etiqueta: FASE_ETIQUETA[fase_numero],
    prompt_version: promptBorradorData?.version ?? "fallback",
    proveedor,
    duracion_ms,
    contenido: textoGenerado,
  });
}
