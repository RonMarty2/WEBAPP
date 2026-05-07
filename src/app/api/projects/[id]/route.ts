/**
 * GET    /api/projects/[id]  — Detalle completo del proyecto
 * PATCH  /api/projects/[id]  — Actualiza metadatos y contenido
 * DELETE /api/projects/[id]  — Oculta el proyecto para el usuario
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto, dbUpdateProyecto, dbHideProyecto } from "@/lib/db";
import { getServiceAIStatus } from "@/lib/aiProvider";

type Params = { params: Promise<{ id: string }> };

// ── GET ───────────────────────────────────────────────────────

export async function GET(_req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const p = await dbGetProyecto(id);
    if (!p || p.usuario_id !== user.id) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      proyecto: {
        ...p,
        active_ai_config: getServiceAIStatus(p.servicio_id),
        servicios: { id: p.servicio_id, nombre: "Monografía Académica" },
      },
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ── PATCH ─────────────────────────────────────────────────────

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const p = await dbGetProyecto(id);
    if (!p || p.usuario_id !== user.id) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const allowed: Record<string, unknown> = {};

    if (typeof body.tema_aprobado === "string")       allowed.tema_aprobado = body.tema_aprobado;
    if (typeof body.titulo_provisional === "string")  allowed.titulo_provisional = body.titulo_provisional;
    if (typeof body.completado === "boolean")         allowed.completado = body.completado;
    if (typeof body.tipo_proyecto_id === "string")    allowed.tipo_proyecto_id = body.tipo_proyecto_id;
    if (typeof body.estado_fase === "number" && body.estado_fase >= 0) allowed.estado_fase = body.estado_fase;

    for (let i = 0; i <= 5; i++) {
      const key = `contenido_fase_${i}`;
      if (typeof body[key] === "string") allowed[key] = body[key];
    }
    if (body.phase_contents && typeof body.phase_contents === "object")
      allowed.phase_contents = body.phase_contents;
    if (body.academic_context && typeof body.academic_context === "object")
      allowed.academic_context = body.academic_context;
    if (body.academic_memory && typeof body.academic_memory === "object")
      allowed.academic_memory = body.academic_memory;
    if (typeof body.final_document === "string" || body.final_document === null)
      allowed.final_document = body.final_document;
    if (body.final_document_validation && typeof body.final_document_validation === "object")
      allowed.final_document_validation = body.final_document_validation;

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: "No hay campos válidos para actualizar" }, { status: 400 });
    }

    const updated = await dbUpdateProyecto(id, allowed);
    return NextResponse.json({ proyecto: updated });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ── DELETE ────────────────────────────────────────────────────

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const p = await dbGetProyecto(id);
    if (!p || p.usuario_id !== user.id) {
      return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
    }

    const success = await dbHideProyecto(id, user.id);
    return NextResponse.json({ success });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
