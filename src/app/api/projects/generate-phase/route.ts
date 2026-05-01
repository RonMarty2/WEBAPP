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
import type { EstadoFase, UpdateTables } from "@/types/database";

const FASE_ETIQUETA: Record<number, string> = {
  0: "Fase 0 — Tema y Planteamiento",
  1: "Fase 1 — Capítulo I",
  2: "Fase 2 — Capítulo II",
  3: "Fase 3 — Capítulos III-V",
  4: "Fase 4 — Revisión y Compilación",
  5: "Fase 5 — Entrega Final",
};

const FASE_A_COLUMNA: Record<number, string> = {
  0: "contenido_fase_0",
  1: "contenido_fase_1",
  2: "contenido_fase_2",
  3: "contenido_fase_3",
  4: "contenido_fase_4",
  5: "contenido_fase_5",
};

// ── Prompts integrados (usados cuando Supabase no está configurado) ────────────

function getSystemPromptFallback(fase: number): string {
  const prompts: Record<number, string> = {
    0: `Eres un asesor académico experto en monografías para diplomados y postgrados en Bolivia.
Genera exactamente 3 propuestas de tema de investigación viables para una monografía académica.
Cada tema debe:
- Ser investigable con datos secundarios públicos (INE, IBCE, BCB, ministerios bolivianos)
- NO requerir entrevistas ni datos primarios propios
- Tener metodología cuantitativa o descriptiva clara
- Ser relevante para Bolivia o Latinoamérica

Formato de respuesta para cada opción:
## OPCIÓN [N]: [TÍTULO]
- **Problema central:** ...
- **Pregunta de investigación:** ...
- **Objetivo general:** ...
- **Fuentes de datos:** [entidades reales + períodos]
- **Viabilidad:** ✅ ALTA / ⚠️ MEDIA

Al final incluye una recomendación breve de cuál elegir y por qué.`,

    1: `Eres un redactor académico experto en monografías universitarias bolivianas.
Genera el CAPÍTULO I completo (Planteamiento del Problema) con las siguientes secciones:

## 1.1. Planteamiento y Formulación del Problema
(3-4 párrafos: contexto, problema específico, pregunta de investigación)

## 1.2. Objetivos de la Investigación
**Objetivo General:**
**Objetivos Específicos:**
(3-4 objetivos con verbo observable)

## 1.3. Justificación
**Justificación Teórica:**
**Justificación Práctica:**
**Justificación Social:**

## 1.4. Alcances y Delimitación
(temporal, espacial, temática)

## 1.5. Hipótesis (si aplica)
(planteamiento + variables)

Usa un tono académico formal. Extensión: 1200-1800 palabras. Sin inventar datos ni citas que no conozcas.`,

    2: `Eres un redactor académico experto. Basándote en el Capítulo I ya aprobado, genera el CAPÍTULO II completo:

## 2.1. Marco Teórico y Conceptual
(teorías principales que sustentan la investigación, definiciones clave)

## 2.2. Marco Referencial
(estudios previos relacionados, estado del arte en Bolivia/Latinoamérica)

## 2.3. Marco Legal e Institucional (si aplica)
(normativa relevante)

Extensión: 1500-2500 palabras. Coherencia total con el Capítulo I. Sin inventar autores ni citas.`,

    3: `Eres un redactor académico experto. Basándote en los capítulos anteriores, genera los CAPÍTULOS III, IV y V:

## CAPÍTULO III: DISEÑO METODOLÓGICO
(tipo de investigación, enfoque, población/muestra, técnicas de recolección, fuentes de datos)

## CAPÍTULO IV: ANÁLISIS DE RESULTADOS
(presentación y análisis de los hallazgos principales, tablas o datos relevantes si aplica)

## CAPÍTULO V: CONCLUSIONES Y RECOMENDACIONES
**Conclusiones:** (una por objetivo específico)
**Recomendaciones:** (prácticas y concretas)

## REFERENCIAS BIBLIOGRÁFICAS
(fuentes reales en formato APA 7, ordenadas alfabéticamente)

Extensión total: 2000-3500 palabras. Coherencia total con capítulos anteriores.`,

    4: `Eres un editor académico. Revisa el documento completo y proporciona:
1. Resumen ejecutivo del documento
2. Lista de aspectos a mejorar (si los hay)
3. Verificación de coherencia entre capítulos
4. Sugerencias finales antes de la entrega`,

    5: `Eres un asistente académico. Genera el resumen final del documento y las instrucciones para exportar a PDF usando Overleaf.`,
  };
  return prompts[fase] ?? prompts[0];
}

// ── Handler principal ─────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const t0 = Date.now();

  try {
    const { user: sessionUser } = await requireAuth();

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

    // ── Ruta sin Supabase ──────────────────────────────────────────────────────
    if (!isSupabaseConfigured()) {
      return await generarSinSupabase({
        sessionUserId: sessionUser.id,
        proyecto_id,
        fase_numero,
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
  sessionUserId, proyecto_id, fase_numero, mensaje_usuario, t0,
}: {
  sessionUserId: string;
  proyecto_id: string;
  fase_numero: number;
  mensaje_usuario?: string;
  t0: number;
}) {
  const proyecto = getProyecto(proyecto_id);
  if (!proyecto || proyecto.usuario_id !== sessionUserId) {
    return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
  }

  // Construir contexto acumulado — truncar cada fase a 1800 chars para no superar el límite de Groq (12K TPM)
  const MAX_CHARS_POR_FASE = 1800;
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

  const systemPrompt = getSystemPromptFallback(fase_numero);

  const userPrompt = [
    `TEMA APROBADO: "${proyecto.tema_aprobado ?? "Sin tema definido"}"`,
    proyecto.titulo_provisional ? `TÍTULO PROVISIONAL: "${proyecto.titulo_provisional}"` : null,
    bloqueContexto,
    mensaje_usuario ? `\nPETICIÓN ADICIONAL DEL USUARIO: ${mensaje_usuario}` : null,
    `\nGenera el contenido de la ${FASE_ETIQUETA[fase_numero]}.`,
  ].filter(Boolean).join("\n");

  // Reducir tokens de salida en fases con mucho contexto acumulado
  const maxTokens = fase_numero <= 1 ? 6000 : fase_numero <= 3 ? 4500 : 3000;

  let textoGenerado: string;
  let proveedor: string;

  try {
    const resultado = await llamarIA(systemPrompt, userPrompt, maxTokens);
    textoGenerado = resultado.text;
    proveedor = resultado.provider;
  } catch (e) {
    return NextResponse.json({ error: `Error de IA: ${(e as Error).message}` }, { status: 502 });
  }

  // Guardar en memoria
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

  // Si no hay prompt en BD, usar el integrado
  const systemPrompt = promptMaestro?.contenido_prompt
    ? [bloqueHilos, promptMaestro.contenido_prompt].filter(Boolean).join("\n\n")
    : getSystemPromptFallback(fase_numero);

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
