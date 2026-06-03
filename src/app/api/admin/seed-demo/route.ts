/**
 * POST /api/admin/seed-demo
 *
 * Carga un proyecto de demostración en la cuenta del admin con todas las
 * fases pobladas. Sirve para ver el aspecto y el flujo de un proyecto
 * terminado antes de conectar la API de IA real.
 *
 * Body opcional: { demo?: "agrohub" | "tesis-marketing" }
 *   - Si no se pasa demo, asume "agrohub" (Pre-Factibilidad) por compatibilidad
 *     con la versión anterior del endpoint.
 *
 * Restringido a usuarios con rol admin. El proyecto queda vinculado al
 * usuario real de la sesión, no al panel admin genérico.
 *
 * Si el usuario ya tiene cargado el mismo demo, hace UPDATE de las fases
 * (merge — los contenidos nuevos prevalecen) en lugar de crear duplicado.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbCreateProyecto, dbUpdateProyecto, dbListProyectos } from "@/lib/db";
import { phaseDefinitionsForProject } from "@/lib/projectTypePhases";
import { AGROHUB_DEMO_SEED, type DemoSeed } from "@/lib/seed/agrohubDemo";
import { TESIS_DEMO_SEED } from "@/lib/seed/tesisDemo";
import { MEJORA_ORG_DEMO_SEED } from "@/lib/seed/mejoraOrgDemo";
import { ARTEFACTO_DEMO_SEED } from "@/lib/seed/artefactoDemo";
import { TRABAJO_DIRIGIDO_DEMO_SEED } from "@/lib/seed/trabajoDirigidoDemo";

// Registro central de demos disponibles. Para agregar uno nuevo, importar
// su seed y mapearlo a una clave estable que el dashboard usa en el body.
const DEMOS: Record<string, DemoSeed> = {
  "agrohub": AGROHUB_DEMO_SEED,
  "tesis-marketing": TESIS_DEMO_SEED,
  "mejora-bolifarma": MEJORA_ORG_DEMO_SEED,
  "artefacto-iot": ARTEFACTO_DEMO_SEED,
  "td-sumaq": TRABAJO_DIRIGIDO_DEMO_SEED,
};
const DEFAULT_DEMO = "agrohub";

// Prefijo común que tienen todos los seed_id de un mismo demo (v1, v2…).
// Permite detectar el proyecto previo aunque haya cambiado de versión.
function seedFamilyPrefix(seedId: string): string {
  return seedId.replace(/-v\d+$/, "");
}

export async function POST(req: Request) {
  try {
    const { user } = await requireAuth();
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Solo administradores pueden cargar proyectos de demostración" },
        { status: 403 },
      );
    }

    // Body opcional: { demo?: string }. Si no se pasa, usar AgroHub por
    // compatibilidad con el botón viejo del dashboard.
    let demoKey: string = DEFAULT_DEMO;
    try {
      const body = await req.json().catch(() => ({}));
      if (typeof body?.demo === "string" && DEMOS[body.demo]) {
        demoKey = body.demo;
      }
    } catch { /* body vacío o inválido — usar default */ }

    const seed = DEMOS[demoKey];
    if (!seed) {
      return NextResponse.json(
        { error: `Demo desconocido: ${demoKey}. Disponibles: ${Object.keys(DEMOS).join(", ")}` },
        { status: 400 },
      );
    }

    // ── Resolver las fases UNIFRANZ para validar IDs y calcular estado_fase ──
    const phaseDefs = phaseDefinitionsForProject({
      servicioId: seed.servicio_id,
      tipoProyectoId: seed.tipo_proyecto_id,
      universidadId: seed.universidad_id,
      modalidadTitulacion: seed.modalidad_titulacion,
    });
    const validIds = new Set(phaseDefs.map((p) => p.id));

    const phaseContents: Record<string, string> = {};
    const ignoradas: string[] = [];
    for (const [phaseId, contenido] of Object.entries(seed.fases_contenido)) {
      if (!validIds.has(phaseId)) {
        ignoradas.push(phaseId);
        continue;
      }
      if (typeof contenido === "string" && contenido.trim().length > 0) {
        phaseContents[phaseId] = contenido;
      }
    }

    // estado_fase = índice de la última fase con contenido (en orden del sidebar)
    let estadoFase = 0;
    phaseDefs.forEach((p, idx) => {
      if (phaseContents[p.id]) estadoFase = Math.max(estadoFase, idx);
    });

    // ── Si el usuario ya tiene un demo AgroHub cargado, hacemos UPDATE de las
    //    fases en lugar de retornar early. Esto permite "re-cargar" el demo
    //    cuando se agregan nuevas fases generadas al seed (ej. al pasar de
    //    v1 con solo Introducción a v2 con las 20 fases). El seed_id se
    //    actualiza al nuevo valor para indicar la versión aplicada.
    const existentes = await dbListProyectos(user.id);
    const familyPrefix = seedFamilyPrefix(seed.seed_id);
    const previo = existentes.find((p) => {
      const ctx = p.academic_context as Record<string, unknown> | undefined;
      const sid = ctx?.demo_seed_id as string | undefined;
      // Match cualquier versión del mismo demo (sin importar -v1, -v2, etc.)
      return typeof sid === "string" && seedFamilyPrefix(sid) === familyPrefix;
    });

    if (previo) {
      // Mergeamos contenidos nuevos con los existentes (los nuevos prevalecen).
      const mergedPhaseContents = {
        ...(previo.phase_contents ?? {}),
        ...phaseContents,
      };
      const updatedCtx: Record<string, unknown> = {
        ...(previo.academic_context as Record<string, unknown> | undefined ?? {}),
        ...seed.academic_context_extra,
        demo_seed_id: seed.seed_id,
        importado: true,
        import_meta: {
          importado_at: new Date().toISOString(),
          importado_por: user.id,
          origen: "seed-demo AgroHub (update v" + seed.seed_id + ")",
        },
      };
      await dbUpdateProyecto(previo.id, {
        phase_contents: mergedPhaseContents,
        academic_context: updatedCtx,
        estado_fase: Math.max(previo.estado_fase ?? 0, estadoFase),
        tema_aprobado: seed.tema,
        titulo_provisional: seed.tema,
      });
      return NextResponse.json({
        ok: true,
        actualizado: true,
        proyecto_id: previo.id,
        fases_cargadas: Object.keys(phaseContents),
        fases_ignoradas: ignoradas,
        estado_fase: estadoFase,
        url_workspace: `/projects/${previo.id}/workspace`,
      });
    }

    const academic_context: Record<string, unknown> = {
      ...seed.academic_context_extra,
      demo_seed_id: seed.seed_id,
      importado: true,
      import_meta: {
        importado_at: new Date().toISOString(),
        importado_por: user.id,
        origen: "seed-demo AgroHub",
      },
    };

    const proyecto = await dbCreateProyecto({
      usuario_id: user.id,
      servicio_id: seed.servicio_id,
      tipo_proyecto_id: seed.tipo_proyecto_id,
      universidad_id: seed.universidad_id,
      modalidad_titulacion: seed.modalidad_titulacion,
      modalidad_creacion: "directa",
      tema_aprobado: seed.tema,
      titulo_provisional: seed.tema,
      estado_fase: estadoFase,
      completado: false,
      oculto_por_usuario: false,
      academic_context,
      academic_memory: {},
      final_document: null,
      final_document_validation: {},
    });

    if (Object.keys(phaseContents).length > 0) {
      await dbUpdateProyecto(proyecto.id, { phase_contents: phaseContents });
    }

    return NextResponse.json(
      {
        ok: true,
        proyecto_id: proyecto.id,
        fases_cargadas: Object.keys(phaseContents),
        fases_ignoradas: ignoradas,
        estado_fase: estadoFase,
        url_workspace: `/projects/${proyecto.id}/workspace`,
      },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: (e as Error).message ?? "Error interno" }, { status: 500 });
  }
}
