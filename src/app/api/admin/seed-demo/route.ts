/**
 * POST /api/admin/seed-demo
 *
 * Carga el proyecto de demostración AgroHub (UNIFRANZ · Proyecto de Grado ·
 * Pre-Factibilidad) en la cuenta del usuario autenticado, con el contenido de
 * cada fase ya poblado. Sirve para ver cómo se ve y se llena la plataforma
 * antes de conectar la API de IA de producción.
 *
 * Restringido a usuarios con rol admin. Se usa `requireAuth` (no `requireAdmin`)
 * para que el proyecto quede vinculado al usuario real de la sesión del
 * dashboard, no al usuario genérico del panel admin.
 *
 * Idempotente: si el usuario ya tiene cargado este seed, devuelve el proyecto
 * existente en lugar de duplicarlo.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbCreateProyecto, dbUpdateProyecto, dbListProyectos } from "@/lib/db";
import { phaseDefinitionsForProject } from "@/lib/projectTypePhases";
import { AGROHUB_DEMO_SEED } from "@/lib/seed/agrohubDemo";

export async function POST() {
  try {
    const { user } = await requireAuth();
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Solo administradores pueden cargar proyectos de demostración" },
        { status: 403 },
      );
    }

    const seed = AGROHUB_DEMO_SEED;

    // ── De-duplicación: ¿el usuario ya tiene este demo cargado? ──────────────
    const existentes = await dbListProyectos(user.id);
    const yaCargado = existentes.find(
      (p) => (p.academic_context as Record<string, unknown> | undefined)?.demo_seed_id === seed.seed_id,
    );
    if (yaCargado) {
      return NextResponse.json({
        ok: true,
        ya_existia: true,
        proyecto_id: yaCargado.id,
        url_workspace: `/projects/${yaCargado.id}/workspace`,
      });
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
