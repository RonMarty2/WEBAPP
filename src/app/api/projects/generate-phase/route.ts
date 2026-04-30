/**
 * POST /api/projects/generate-phase
 *
 * Director de Orquesta — Ley Cero del Prompt Chaining:
 * Los prompts NUNCA están hardcoded. Todo texto de instrucción
 * a la IA proviene de las tablas `prompts_maestros` e `hilos_conductores`.
 *
 * Flujo:
 *  1. Verifica sesión del usuario
 *  2. Valida que el proyecto le pertenece
 *  3. Recupera Hilos Conductores + Prompt Maestro desde Supabase
 *  4. Construye contexto acumulado de fases anteriores aprobadas
 *  5. Envía a Groq 70B (con fallback via llamarIA)
 *  6. Guarda resultado en proyectos_fases.contenido_fase_N
 *  7. Registra en auditoria_chats
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase";
import { llamarIA } from "@/lib/aiProvider";
import { validarCoherencia } from "@/lib/ai/guardian";
import type { EstadoFase, UpdateTables } from "@/types/database";

// Mapeo de número de fase → nombre de columna en proyectos_fases
const FASE_A_COLUMNA: Record<number, string> = {
  0: "contenido_fase_0",
  1: "contenido_fase_1",
  2: "contenido_fase_2",
  3: "contenido_fase_3",
  4: "contenido_fase_4",
  5: "contenido_fase_5",
};

// Etiquetas legibles para incluir en el contexto de fases anteriores
const FASE_ETIQUETA: Record<number, string> = {
  0: "Fase 0 — Tema y Planteamiento",
  1: "Fase 1 — Capítulo I",
  2: "Fase 2 — Capítulo II",
  3: "Fase 3 — Capítulos III-V",
  4: "Fase 4 — Revisión y Compilación",
  5: "Fase 5 — Entrega Final",
};

export async function POST(req: Request) {
  const t0 = Date.now();

  try {

  // ── 1. Verificar sesión ───────────────────────────────────────
  const { user: sessionUser } = await requireAuth();

  // ── 2. Parsear body ───────────────────────────────────────────
  let proyecto_id: string;
  let fase_numero: number;
  let mensaje_usuario: string | undefined;

  try {
    const body = await req.json();
    proyecto_id = body.proyecto_id;
    fase_numero = Number(body.fase_numero);
    mensaje_usuario = body.mensaje_usuario ?? undefined;

    if (!proyecto_id || isNaN(fase_numero) || fase_numero < 0 || fase_numero > 5) {
      return NextResponse.json(
        { error: "proyecto_id y fase_numero (0-5) son requeridos" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const db = createAdminClient();

  // ── 3. Obtener proyecto y validar pertenencia ─────────────────
  const { data: proyecto, error: errProyecto } = await db
    .from("proyectos_fases")
    .select("*, servicios(id, nombre, audiencia_id)")
    .eq("id", proyecto_id)
    .eq("usuario_id", sessionUser.id)
    .single();

  if (errProyecto || !proyecto) {
    return NextResponse.json(
      { error: "Proyecto no encontrado o sin acceso" },
      { status: 404 }
    );
  }

  const servicio_id = proyecto.servicio_id;

  // ── 4. Obtener Hilos Conductores del servicio ─────────────────
  const { data: hilos } = await db
    .from("hilos_conductores")
    .select("regla_inmutable, orden")
    .eq("servicio_id", servicio_id)
    .order("orden");

  const bloqueHilos =
    hilos && hilos.length > 0
      ? `=== REGLAS INMUTABLES DE COHERENCIA (Hilo Conductor) ===\n${hilos
          .map((h, i) => `${i + 1}. ${h.regla_inmutable}`)
          .join("\n")}\n=== FIN DE REGLAS ===`
      : "";

  // ── 5. Obtener Prompt Maestro de la fase ─────────────────────
  const { data: promptMaestro, error: errPrompt } = await db
    .from("prompts_maestros")
    .select("contenido_prompt, nombre_fase, version")
    .eq("servicio_id", servicio_id)
    .eq("fase_numero", fase_numero as EstadoFase)
    .eq("activo", true)
    .single();

  if (errPrompt || !promptMaestro) {
    return NextResponse.json(
      {
        error: `No existe un Prompt Maestro activo para la fase ${fase_numero} de este servicio. Configúralo en Admin → Prompts Maestros.`,
      },
      { status: 422 }
    );
  }

  // ── 6. Construir contexto de fases anteriores aprobadas ───────
  const fasesAnteriores: string[] = [];

  for (let f = 0; f < fase_numero; f++) {
    const col = FASE_A_COLUMNA[f] as keyof typeof proyecto;
    const contenido = proyecto[col] as string | null;
    if (contenido) {
      fasesAnteriores.push(
        `=== ${FASE_ETIQUETA[f]} (ya aprobada) ===\n${contenido}\n=== FIN ===`
      );
    }
  }

  const bloqueContexto =
    fasesAnteriores.length > 0
      ? `\n\n--- CONTEXTO ACUMULADO DE FASES ANTERIORES ---\n\n${fasesAnteriores.join("\n\n")}`
      : "";

  // ── 7. Construir prompt final (Ley Cero: sin hardcoding) ──────
  //
  //  [Hilo Conductor] + [Prompt Maestro] + [Contexto fases anteriores]
  //
  const systemPrompt = [
    bloqueHilos,
    promptMaestro.contenido_prompt,
  ]
    .filter(Boolean)
    .join("\n\n");

  const userPrompt = [
    `TEMA APROBADO: "${proyecto.tema_aprobado ?? "Sin tema definido"}"`,
    proyecto.titulo_provisional
      ? `TÍTULO PROVISIONAL: "${proyecto.titulo_provisional}"`
      : null,
    bloqueContexto,
    mensaje_usuario ? `\nPETICIÓN ADICIONAL DEL USUARIO: ${mensaje_usuario}` : null,
    `\nGenera el contenido de la ${FASE_ETIQUETA[fase_numero]}.`,
  ]
    .filter(Boolean)
    .join("\n");

  // ── 8a. El Guardián — valida coherencia del mensaje antes de llamar a IA ──
  if (mensaje_usuario && proyecto.tema_aprobado) {
    const guardian = await validarCoherencia(mensaje_usuario, proyecto.tema_aprobado);
    if (!guardian.permitido) {
      return NextResponse.json(
        {
          error: "Tu petición no parece estar relacionada con el tema del proyecto.",
          razon: guardian.razon,
          guardian: true,
        },
        { status: 422 }
      );
    }
  }

  // ── 8b. Llamar a la IA (Groq 70B con fallback) ────────────────
  let textoGenerado: string;
  let proveedor: string;

  try {
    const resultado = await llamarIA(systemPrompt, userPrompt, 7000);
    textoGenerado = resultado.text;
    proveedor = resultado.provider;
  } catch (e) {
    return NextResponse.json(
      { error: `Error de IA: ${(e as Error).message}` },
      { status: 502 }
    );
  }

  const duracion_ms = Date.now() - t0;

  // ── 9. Guardar en proyectos_fases ─────────────────────────────
  const nuevaFase = Math.max(proyecto.estado_fase, fase_numero) as EstadoFase;

  // Switch tipado: Supabase rechaza Record<string, unknown> en update
  const updatePayload: UpdateTables<"proyectos_fases"> = { estado_fase: nuevaFase };
  switch (fase_numero) {
    case 0: updatePayload.contenido_fase_0 = textoGenerado; break;
    case 1: updatePayload.contenido_fase_1 = textoGenerado; break;
    case 2: updatePayload.contenido_fase_2 = textoGenerado; break;
    case 3: updatePayload.contenido_fase_3 = textoGenerado; break;
    case 4: updatePayload.contenido_fase_4 = textoGenerado; break;
    case 5: updatePayload.contenido_fase_5 = textoGenerado; break;
  }

  const { error: errUpdate } = await db
    .from("proyectos_fases")
    .update(updatePayload)
    .eq("id", proyecto_id);

  if (errUpdate) {
    console.error("[generate-phase] Error al guardar en Supabase:", errUpdate);
  }

  // ── 10. Registrar en auditoría ────────────────────────────────
  await db.from("auditoria_chats").insert({
    usuario_id: sessionUser.id,
    proyecto_id,
    servicio_id,
    fase_numero,
    mensaje_usuario: userPrompt.slice(0, 2000),  // cap para no almacenar prompts enormes
    respuesta_ia: textoGenerado.slice(0, 5000),
    modelo_usado: proveedor,
    duracion_ms,
  });

  // ── 11. Responder al cliente ──────────────────────────────────
  return NextResponse.json({
    ok: true,
    fase: fase_numero,
    fase_etiqueta: FASE_ETIQUETA[fase_numero],
    prompt_version: promptMaestro.version,
    proveedor,
    duracion_ms,
    contenido: textoGenerado,
  });

  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[generate-phase]", e);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
