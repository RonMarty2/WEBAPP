import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { getProyecto, updateProyecto, upsertProyectoSnapshot } from "@/lib/memoryStore";
import { normalizeRouteOptions } from "@/lib/academicProject.mjs";

type AcademicContext = Record<string, unknown> & {
  rutas_sugeridas?: Record<string, unknown>[];
  ruta_elegida?: Record<string, unknown>;
};

export async function POST(req: Request) {
  try {
    const { user } = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const proyectoId = typeof body.proyecto_id === "string" ? body.proyecto_id : "";
    if (!proyectoId) {
      return NextResponse.json({ error: "proyecto_id es requerido" }, { status: 400 });
    }

    let proyecto = getProyecto(proyectoId);
    if (!proyecto && isSupabaseConfigured()) {
      const db = createAdminClient();
      const { data } = await db
        .from("proyectos_fases")
        .select("*")
        .eq("id", proyectoId)
        .eq("usuario_id", user.id)
        .maybeSingle();

      if (data) {
        proyecto = upsertProyectoSnapshot({
          id: data.id,
          usuario_id: data.usuario_id,
          servicio_id: data.servicio_id,
          tema_aprobado: data.tema_aprobado,
          titulo_provisional: data.titulo_provisional,
          estado_fase: data.estado_fase ?? 0,
          completado: data.completado ?? false,
          modalidad_creacion: "directa",
          academic_context: {},
          academic_memory: {},
          final_document: null,
          final_document_validation: {},
          contenido_fase_0: null,
          contenido_fase_1: null,
          contenido_fase_2: null,
          contenido_fase_3: null,
          contenido_fase_4: null,
          contenido_fase_5: null,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      }
    }

    if (!proyecto || proyecto.usuario_id !== user.id) {
      return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
    }

    const academicContext = (proyecto.academic_context ?? {}) as AcademicContext;
    const rutas = normalizeRouteOptions(academicContext.rutas_sugeridas ?? []);
    const rutaId = typeof body.ruta_id === "string" ? body.ruta_id : "";
    const incomingRoute = body.ruta && typeof body.ruta === "object"
      ? normalizeRouteOptions([body.ruta])[0]
      : null;
    const rutaElegida = incomingRoute ?? rutas.find((ruta) => ruta.id === rutaId);

    if (!rutaElegida) {
      return NextResponse.json({ error: "Ruta no encontrada." }, { status: 404 });
    }

    const updated = updateProyecto(proyectoId, {
      academic_context: {
        ...academicContext,
        ruta_elegida: rutaElegida,
      },
      tema_aprobado: rutaElegida.titulo,
      titulo_provisional: rutaElegida.titulo,
      final_document: null,
      final_document_validation: {},
    });

    return NextResponse.json({ ok: true, ruta: rutaElegida, proyecto: updated });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
