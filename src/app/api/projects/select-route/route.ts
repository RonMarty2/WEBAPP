import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto, dbUpdateProyecto } from "@/lib/db";
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

    const proyecto = await dbGetProyecto(proyectoId);
    if (!proyecto || (proyecto.usuario_id !== user.id && user.role !== "admin")) {
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

    const updated = await dbUpdateProyecto(proyectoId, {
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
