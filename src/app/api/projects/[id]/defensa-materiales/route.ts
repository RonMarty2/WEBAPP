/**
 * Estudiante Elite: ver estado y descargar materiales de defensa.
 *
 *   GET /api/projects/[id]/defensa-materiales            → estado actual
 *   GET /api/projects/[id]/defensa-materiales?slot=podcast → descarga binaria
 */

import { NextResponse } from "next/server";
import { requirePlan, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import {
  leerArchivoDefensa,
  defaultMateriales,
  type DefensaSlot,
  type DefensaMateriales,
} from "@/lib/defensaMateriales";

const SLOTS_VALIDOS: DefensaSlot[] = ["slides", "podcast", "guion"];

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requirePlan(["elite"]);
    const { id } = await params;
    const proyecto = await dbGetProyecto(id);
    if (!proyecto) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    const proyectoRec = proyecto as unknown as Record<string, unknown>;
    if (proyectoRec.usuario_id !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Sin acceso al proyecto" }, { status: 403 });
    }

    const ctx = (proyectoRec.academic_context ?? {}) as Record<string, unknown>;
    const materiales = (ctx.defensa_materiales as DefensaMateriales | undefined) ?? defaultMateriales();

    const url = new URL(req.url);
    const slot = url.searchParams.get("slot");

    // Sin slot: devolver metadata
    if (!slot) {
      return NextResponse.json({ materiales });
    }

    // Con slot: descargar archivo
    if (!SLOTS_VALIDOS.includes(slot as DefensaSlot)) {
      return NextResponse.json({ error: "slot inválido" }, { status: 400 });
    }
    if (materiales.estado !== "listo") {
      return NextResponse.json({ error: "Materiales aún no disponibles" }, { status: 425 });
    }
    const archivo = materiales[slot as DefensaSlot];
    if (!archivo) return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });

    const bytes = leerArchivoDefensa(archivo.ruta);
    if (!bytes) return NextResponse.json({ error: "Archivo no disponible en disco" }, { status: 404 });

    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": archivo.mime || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(archivo.nombre)}"`,
        "Content-Length": String(bytes.length),
      },
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
