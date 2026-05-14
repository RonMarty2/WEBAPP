/**
 * Admin: subir / consultar / borrar materiales de defensa (slides, podcast, guion)
 * de un proyecto Elite específico.
 *
 *   POST   /api/admin/projects/[id]/defensa-materiales   formData con file + slot
 *   GET    /api/admin/projects/[id]/defensa-materiales   estado actual
 *   PATCH  /api/admin/projects/[id]/defensa-materiales   actualizar estado/mensaje
 *   DELETE /api/admin/projects/[id]/defensa-materiales?slot=podcast  borrar archivo
 */

import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import { dbGetProyecto, dbUpdateProyecto } from "@/lib/db";
import {
  guardarArchivoDefensa,
  eliminarArchivoDefensa,
  defaultMateriales,
  type DefensaSlot,
  type DefensaEstado,
  type DefensaMateriales,
} from "@/lib/defensaMateriales";

const SLOTS_VALIDOS: DefensaSlot[] = ["slides", "podcast", "guion"];
const ESTADOS_VALIDOS: DefensaEstado[] = ["pendiente", "en_proceso", "listo"];

function leerMateriales(proyecto: { academic_context?: Record<string, unknown> }): DefensaMateriales {
  const ctx = (proyecto.academic_context ?? {}) as Record<string, unknown>;
  const existing = ctx.defensa_materiales as DefensaMateriales | undefined;
  return existing ?? defaultMateriales();
}

async function persistirMateriales(
  proyectoId: string,
  proyecto: { academic_context?: Record<string, unknown> },
  nuevos: DefensaMateriales,
) {
  const ctx = { ...(proyecto.academic_context ?? {}), defensa_materiales: nuevos };
  await dbUpdateProyecto(proyectoId, { academic_context: ctx });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const proyecto = await dbGetProyecto(id);
    if (!proyecto) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    return NextResponse.json({ materiales: leerMateriales(proyecto) });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const proyecto = await dbGetProyecto(id);
    if (!proyecto) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });

    const form = await req.formData();
    const slot = form.get("slot");
    const file = form.get("file");
    if (typeof slot !== "string" || !SLOTS_VALIDOS.includes(slot as DefensaSlot)) {
      return NextResponse.json({ error: "slot inválido (slides | podcast | guion)" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "Archivo demasiado grande (máx 50 MB)" }, { status: 413 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const archivo = guardarArchivoDefensa(id, slot as DefensaSlot, file.name, file.type || "application/octet-stream", bytes);

    const actuales = leerMateriales(proyecto);
    const nuevos: DefensaMateriales = {
      ...actuales,
      estado: actuales.estado === "listo" ? "listo" : "en_proceso",
      [slot]: archivo,
    };
    await persistirMateriales(id, proyecto, nuevos);

    return NextResponse.json({ ok: true, materiales: nuevos });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const proyecto = await dbGetProyecto(id);
    if (!proyecto) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });

    const body = await req.json() as { estado?: DefensaEstado; mensaje?: string };
    const actuales = leerMateriales(proyecto);
    const nuevos: DefensaMateriales = { ...actuales };
    if (body.estado && ESTADOS_VALIDOS.includes(body.estado)) nuevos.estado = body.estado;
    if (typeof body.mensaje === "string") nuevos.mensaje = body.mensaje;
    if (body.estado === "listo" && !actuales.notificado_at) {
      nuevos.notificado_at = new Date().toISOString();
    }
    await persistirMateriales(id, proyecto, nuevos);
    return NextResponse.json({ ok: true, materiales: nuevos });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const proyecto = await dbGetProyecto(id);
    if (!proyecto) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });

    const url = new URL(req.url);
    const slot = url.searchParams.get("slot");
    if (!slot || !SLOTS_VALIDOS.includes(slot as DefensaSlot)) {
      return NextResponse.json({ error: "slot inválido" }, { status: 400 });
    }
    const actuales = leerMateriales(proyecto);
    const archivo = actuales[slot as DefensaSlot];
    if (archivo) eliminarArchivoDefensa(archivo.ruta);
    const nuevos: DefensaMateriales = { ...actuales };
    delete nuevos[slot as DefensaSlot];
    await persistirMateriales(id, proyecto, nuevos);
    return NextResponse.json({ ok: true, materiales: nuevos });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
