/**
 * POST /api/projects/generate-phase
 * Genera el contenido de una fase con IA.
 * Si Supabase no está configurado, usa prompts integrados + memoria local.
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

// ── Prompt loader — reads admin config from disk, falls back to API defaults ───

import { DEFAULT_PHASES } from "@/app/api/admin/workspace-prompts/route";

function loadPromptByKey(key: string): string {
  try {
    const disk = loadFromDisk();
    const wp = disk.workspacePrompts;
    const phasePrompt = wp?.phases?.[key] ?? DEFAULT_PHASES[key as keyof typeof DEFAULT_PHASES] ?? DEFAULT_PHASES["0"];
    const hilos = wp?.hilos?.filter(Boolean) ?? [];
    if (hilos.length === 0) return phasePrompt;
    const bloqueHilos = `=== REGLAS INMUTABLES ===\n${hilos.map((h, i) => `${i + 1}. ${h}`).join("\n")}\n=== FIN ===`;
    return `${bloqueHilos}\n\n${phasePrompt}`;
  } catch {
    return DEFAULT_PHASES[key as keyof typeof DEFAULT_PHASES] ?? DEFAULT_PHASES["0"];
  }
}

function loadWorkspacePrompt(fase: number): string {
  return loadPromptByKey(String(fase));
}

function loadOnboardingPrompt(): string {
  return loadPromptByKey("onboarding");
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

    try {
      const body = await req.json();
      proyecto_id = body.proyecto_id;
      phase_id = body.phase_id ?? undefined;
      fase_numero = Number(body.fase_numero ?? 0);
      mensaje_usuario = body.mensaje_usuario ?? undefined;

      if (!proyecto_id || (!phase_id && (isNaN(fase_numero) || fase_numero < 0 || fase_numero > 5))) {
        return NextResponse.json(
          { error: "proyecto_id requerido, y también fase_numero (0-5) o phase_id" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
    }

    // ── Ruta sin Supabase ──────────────────────────────────────────────────────
    if (!isSupabaseConfigured()) {
      return await generarSinSupabase({
        sessionUserId: sessionUser.id,
        proyecto_id,
        fase_numero,
        phase_id,
        mensaje_usuario,
        t0,
      });
    }

    // ── Ruta con Supabase ──────────────────────────────────────────────────────
    return await generarConSupabase({
      sessionUserId: sessionUser.id,
      proyecto_id,
      fase_numero,
      mensaje_usuario,
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

// ── Sin Supabase — usa memoryStore + prompts integrados ───────────────────────

async function generarSinSupabase({
  sessionUserId, proyecto_id, fase_numero, phase_id, mensaje_usuario, t0,
}: {
  sessionUserId: string;
  proyecto_id: string;
  fase_numero: number;
  phase_id?: string;
  mensaje_usuario?: string;
  t0: number;
}) {
  const proyecto = getProyecto(proyecto_id);
  if (!proyecto) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  const MAX_CHARS_POR_FASE = 1800;

  // ── Modo dinámico: phase_id proporcionado ─────────────────────────────────
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
      let contenido = phaseContents[prev.id] ?? null;
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

    // Sistema: prompt de la fase + hilos conductores
    const wp = disk.workspacePrompts;
    const hilos = wp?.hilos?.filter(Boolean) ?? [];
    const phasePrompt = currentPhase.prompt || DEFAULT_PHASES["0"];
    const systemPrompt = hilos.length > 0
      ? `=== REGLAS INMUTABLES ===\n${hilos.map((h, i) => `${i + 1}. ${h}`).join("\n")}\n=== FIN ===\n\n${phasePrompt}`
      : phasePrompt;

    const userPrompt = [
      `TEMA APROBADO: "${proyecto.tema_aprobado ?? "Sin tema definido"}"`,
      proyecto.titulo_provisional ? `TÍTULO PROVISIONAL: "${proyecto.titulo_provisional}"` : null,
      bloqueContexto,
      mensaje_usuario ? `\nPETICIÓN ADICIONAL DEL USUARIO: ${mensaje_usuario}` : null,
      `\nGenera el contenido de ${currentPhase.label}.`,
    ].filter(Boolean).join("\n");

    let textoGenerado: string;
    let proveedor: string;

    try {
      const resultado = await llamarIA(systemPrompt, userPrompt, 5000, proyecto.servicio_id);
      textoGenerado = resultado.text;
      proveedor = `${resultado.provider} / ${resultado.model}`;
    } catch (e) {
      return NextResponse.json({ error: `Error de IA: ${(e as Error).message}` }, { status: 502 });
    }

    updateProyecto(proyecto_id, {
      phase_contents: { ...phaseContents, [phase_id]: textoGenerado },
    });

    return NextResponse.json({
      ok: true,
      phase_id,
      fase_etiqueta: currentPhase.label,
      proveedor,
      duracion_ms: Date.now() - t0,
      contenido: textoGenerado,
    });
  }

  // ── Modo legacy: fase_numero ──────────────────────────────────────────────

  // Construir contexto acumulado — truncar cada fase a 1800 chars
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

  // Onboarding: fase 0 sin tema aprobado → prompt de propuesta de temas
  const systemPrompt = (fase_numero === 0 && !proyecto.tema_aprobado)
    ? loadOnboardingPrompt()
    : loadWorkspacePrompt(fase_numero);

  const userPrompt = [
    `TEMA APROBADO: "${proyecto.tema_aprobado ?? "Sin tema definido"}"`,
    proyecto.titulo_provisional ? `TÍTULO PROVISIONAL: "${proyecto.titulo_provisional}"` : null,
    bloqueContexto,
    mensaje_usuario ? `\nPETICIÓN ADICIONAL DEL USUARIO: ${mensaje_usuario}` : null,
    `\nGenera el contenido de la ${FASE_ETIQUETA[fase_numero]}.`,
  ].filter(Boolean).join("\n");

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

  const nuevaFase = Math.max(proyecto.estado_fase, fase_numero);
  const colKey = FASE_A_COLUMNA[fase_numero];
  updateProyecto(proyecto_id, {
    estado_fase: nuevaFase,
    [colKey]: textoGenerado,
  });

  return NextResponse.json({
    ok: true,
    fase: fase_numero,
    fase_etiqueta: FASE_ETIQUETA[fase_numero],
    proveedor,
    duracion_ms: Date.now() - t0,
    contenido: textoGenerado,
  });
}

// ── Con Supabase — flujo original ─────────────────────────────────────────────

async function generarConSupabase({
  sessionUserId, proyecto_id, fase_numero, mensaje_usuario, t0,
}: {
  sessionUserId: string;
  proyecto_id: string;
  fase_numero: number;
  mensaje_usuario?: string;
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
    // Intentar en memoria como respaldo
    return await generarSinSupabase({ sessionUserId, proyecto_id, fase_numero, mensaje_usuario, t0 });
  }

  const servicio_id = proyecto.servicio_id;

  const { data: hilos } = await db
    .from("hilos_conductores")
    .select("regla_inmutable, orden")
    .eq("servicio_id", servicio_id)
    .order("orden");

  const bloqueHilos = hilos?.length
    ? `=== REGLAS INMUTABLES ===\n${hilos.map((h, i) => `${i + 1}. ${h.regla_inmutable}`).join("\n")}\n=== FIN ===`
    : "";

  const { data: promptMaestro } = await db
    .from("prompts_maestros")
    .select("contenido_prompt, nombre_fase, version")
    .eq("servicio_id", servicio_id)
    .eq("fase_numero", fase_numero as EstadoFase)
    .eq("activo", true)
    .single();

  // Si no hay prompt en BD, usar el configurado en admin (o el hardcoded como último recurso)
  const systemPrompt = promptMaestro?.contenido_prompt
    ? [bloqueHilos, promptMaestro.contenido_prompt].filter(Boolean).join("\n\n")
    : loadWorkspacePrompt(fase_numero);

  const fasesAnteriores: string[] = [];
  for (let f = 0; f < fase_numero; f++) {
    const col = FASE_A_COLUMNA[f] as keyof typeof proyecto;
    const contenido = proyecto[col] as string | null;
    if (contenido) {
      fasesAnteriores.push(`=== ${FASE_ETIQUETA[f]} (ya aprobada) ===\n${contenido}\n=== FIN ===`);
    }
  }

  const bloqueContexto = fasesAnteriores.length > 0
    ? `\n\n--- CONTEXTO ACUMULADO ---\n\n${fasesAnteriores.join("\n\n")}`
    : "";

  const userPrompt = [
    `TEMA APROBADO: "${proyecto.tema_aprobado ?? "Sin tema definido"}"`,
    proyecto.titulo_provisional ? `TÍTULO PROVISIONAL: "${proyecto.titulo_provisional}"` : null,
    bloqueContexto,
    mensaje_usuario ? `\nPETICIÓN ADICIONAL DEL USUARIO: ${mensaje_usuario}` : null,
    `\nGenera el contenido de la ${FASE_ETIQUETA[fase_numero]}.`,
  ].filter(Boolean).join("\n");

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
  } catch { /* auditoría no es crítica */ }

  return NextResponse.json({
    ok: true,
    fase: fase_numero,
    fase_etiqueta: FASE_ETIQUETA[fase_numero],
    prompt_version: promptMaestro?.version ?? "fallback",
    proveedor,
    duracion_ms,
    contenido: textoGenerado,
  });
}
