/**
 * POST /api/projects/import
 *
 * Importa un proyecto existente (generado con versiones anteriores del SaaS,
 * con otra herramienta, o redactado a mano) al store. Crea el proyecto con
 * el contenido de cada fase ya cargado, listo para continuar desde donde
 * quedó o para someter las fases existentes al flujo de observaciones.
 *
 * Body esperado:
 *   {
 *     servicio_id?: string;          // default según tipo_proyecto_id
 *     tipo_proyecto_id?: string;     // default "tipo-monografia"
 *     universidad_id?: string;       // default "umss-001"
 *     programa: string;              // OBLIGATORIO ("Diplomado en ...")
 *     materias?: string;             // módulos cursados
 *     tema: string;                  // título / tema de la monografía
 *     cap1_variante_id?: string;     // "clasico" | "reducido", default "clasico"
 *     formato_umss?: string;         // "guia_1_posgrado" | "guia_2_cespedes"
 *     fases_contenido: Record<string, string>;
 *                                    // ej. { "ph-cap1": "...", "ph-cap2": "..." }
 *     marcar_completadas?: boolean;  // si true, marca cada fase con contenido como completada
 *     notas_import?: string;         // texto libre para registrar origen del documento
 *   }
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbCreateProyecto, dbUpdateProyecto } from "@/lib/db";
import {
  serviceIdForProjectType,
  projectTypeIdForService,
  phaseDefinitionsForProject,
} from "@/lib/projectTypePhases";

interface BodyImport {
  servicio_id?: string;
  tipo_proyecto_id?: string;
  universidad_id?: string;
  programa: string;
  materias?: string;
  tema: string;
  cap1_variante_id?: string;
  formato_umss?: string;
  fases_contenido: Record<string, string>;
  marcar_completadas?: boolean;
  notas_import?: string;
}

export async function POST(req: Request) {
  try {
    const { user } = await requireAuth();
    const body = (await req.json()) as Partial<BodyImport>;

    // Validaciones mínimas
    if (!body.programa?.trim()) {
      return NextResponse.json({ error: "El campo 'programa' es obligatorio" }, { status: 400 });
    }
    if (!body.tema?.trim()) {
      return NextResponse.json({ error: "El campo 'tema' es obligatorio" }, { status: 400 });
    }
    if (!body.fases_contenido || typeof body.fases_contenido !== "object") {
      return NextResponse.json({ error: "fases_contenido debe ser un objeto { phase_id: contenido }" }, { status: 400 });
    }

    const tipoProyectoId = body.tipo_proyecto_id?.trim() || "tipo-monografia";
    const servicioId = body.servicio_id?.trim() || serviceIdForProjectType(tipoProyectoId);
    const resolvedTipoProyectoId = tipoProyectoId || projectTypeIdForService(servicioId);

    if (!servicioId) {
      return NextResponse.json({ error: "No se pudo resolver servicio_id" }, { status: 400 });
    }

    const universidadId = body.universidad_id?.trim() || "umss-001";
    const cap1VarianteId = body.cap1_variante_id?.trim() || "clasico";
    const formatoUmss = body.formato_umss?.trim() || (cap1VarianteId === "reducido" ? "guia_2_cespedes" : "guia_1_posgrado");

    // Construir academic_context con todo lo que el SaaS espera ver
    const academicContext: Record<string, unknown> = {
      contexto_inicial: {
        programa: body.programa.trim(),
        materias: body.materias?.trim() ?? "",
        intereses_y_contexto: "",
      },
      cap1_variante_id: cap1VarianteId,
      formato_umss: formatoUmss,
      importado: true,
      import_meta: {
        importado_at: new Date().toISOString(),
        importado_por: user.id,
        notas: body.notas_import?.trim() ?? "",
        fases_originales: Object.keys(body.fases_contenido),
      },
    };

    // Resolver fases válidas para este tipo de proyecto, ignorar phase_ids desconocidos.
    // 🎓 Si el import declara universidad UNIFRANZ + modalidad, se enrutará a
    // las fases UNIFRANZ por modalidad. Si no, fallback al motor clásico.
    const modalidadImport = (body as { modalidad_titulacion?: string }).modalidad_titulacion?.trim();
    const phaseDefs = phaseDefinitionsForProject({
      servicioId,
      tipoProyectoId: resolvedTipoProyectoId,
      universidadId,
      modalidadTitulacion: modalidadImport || undefined,
    });
    const validPhaseIds = new Set(phaseDefs.map((p) => p.id));

    const phaseContents: Record<string, string> = {};
    const ignoradas: string[] = [];
    for (const [phaseId, contenido] of Object.entries(body.fases_contenido)) {
      if (!validPhaseIds.has(phaseId)) {
        ignoradas.push(phaseId);
        continue;
      }
      if (typeof contenido === "string" && contenido.trim().length > 0) {
        phaseContents[phaseId] = contenido;
      }
    }

    // Calcular estado_fase como el índice máximo de fases con contenido
    let maxIndice = 0;
    phaseDefs.forEach((p, idx) => {
      if (phaseContents[p.id]) maxIndice = Math.max(maxIndice, idx);
    });
    const estadoFase = maxIndice;

    // Crear proyecto base
    const proyecto = await dbCreateProyecto({
      usuario_id: user.id,
      servicio_id: servicioId,
      tipo_proyecto_id: resolvedTipoProyectoId,
      universidad_id: universidadId,
      modalidad_creacion: "directa",
      tema_aprobado: body.tema.trim(),
      titulo_provisional: body.tema.trim(),
      estado_fase: estadoFase,
      completado: false,
      oculto_por_usuario: false,
      academic_context: academicContext,
      academic_memory: {},
      final_document: null,
      final_document_validation: {},
    });

    // Cargar fases con contenido (separadamente del create por simplicidad)
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
        siguiente_fase: phaseDefs[maxIndice + 1]?.id ?? null,
        url_workspace: `/projects/${proyecto.id}/workspace`,
      },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: (e as Error).message ?? "Error interno" }, { status: 500 });
  }
}
