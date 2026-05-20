import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/api-auth';
import { dbCreateProyecto } from '@/lib/db';
import { getPlantillaById } from '@/lib/adaptativo/templateCatalog';
import type { PlanAdaptativo } from '@/lib/adaptativo/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth();

    const body = (await req.json()) as { plan?: PlanAdaptativo };
    const plan = body.plan;

    if (!plan || typeof plan !== 'object') {
      return NextResponse.json(
        { error: 'Falta el plan adaptativo en el body.' },
        { status: 400 },
      );
    }

    const nombre = (plan.nombre_trabajo ?? '').trim();
    if (!nombre || nombre.length < 4) {
      return NextResponse.json(
        { error: 'El nombre del trabajo es obligatorio (mín. 4 caracteres).' },
        { status: 400 },
      );
    }

    if (!plan.matching?.plantilla_elegida) {
      return NextResponse.json(
        { error: 'El plan no incluye una plantilla elegida.' },
        { status: 400 },
      );
    }

    if (!Array.isArray(plan.fases) || plan.fases.length === 0) {
      return NextResponse.json(
        { error: 'El plan no incluye fases.' },
        { status: 400 },
      );
    }

    const plantilla = getPlantillaById(plan.matching.plantilla_elegida);
    if (!plantilla) {
      return NextResponse.json(
        { error: `Plantilla no reconocida: ${plan.matching.plantilla_elegida}` },
        { status: 400 },
      );
    }

    const proyecto = await dbCreateProyecto({
      usuario_id: user.id,
      servicio_id: plantilla.mapeo.servicio_id,
      tipo_proyecto_id: plantilla.mapeo.tipo_proyecto_id,
      universidad_id: undefined, // adaptativo no se asocia a una universidad fija
      tema_aprobado: nombre,
      titulo_provisional: nombre,
      estado_fase: 0,
      completado: false,
      modalidad_creacion: 'directa',
      perfil_estilo_usuario: null,
      requiere_actualizacion: {},
      phase_contents: {},
      academic_context: {
        plan_adaptativo: plan,
        es_adaptativo: true,
        plantilla_base: plan.matching.plantilla_elegida,
        cap1_variante_id: plantilla.mapeo.variante_id,
      },
      academic_memory: {},
      final_document: null,
      final_document_validation: {},
    });

    return NextResponse.json({
      ok: true,
      proyecto_id: proyecto.id,
      servicio_id: proyecto.servicio_id,
      tipo_proyecto_id: proyecto.tipo_proyecto_id,
      total_fases: plan.fases.length,
      plantilla_base: plantilla.nombre,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[adaptativo/create-project] Error:', err);
    return NextResponse.json(
      { error: `Error al crear el proyecto: ${msg}` },
      { status: 500 },
    );
  }
}
