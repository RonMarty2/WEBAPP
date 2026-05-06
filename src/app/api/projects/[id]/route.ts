/**
 * GET   /api/projects/[id]  — Detalle completo del proyecto
 * PATCH /api/projects/[id]  — Actualiza metadatos (tema, título, estado)
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { getProyecto, updateProyecto, deleteProyecto, upsertProyectoSnapshot } from "@/lib/memoryStore";
import { getServiceAIStatus } from "@/lib/aiProvider";
import type { UpdateTables, EstadoFase } from "@/types/database";

type Params = { params: Promise<{ id: string }> };

function buildSnapshotFromSupabaseRow({
  row,
  existing,
  overrides = {},
}: {
  row: Record<string, unknown>;
  existing?: ReturnType<typeof getProyecto>;
  overrides?: Record<string, unknown>;
}) {
  return {
    id: String(row.id),
    usuario_id: String(row.usuario_id),
    servicio_id: String(row.servicio_id),
    tipo_proyecto_id: typeof overrides.tipo_proyecto_id === "string"
      ? overrides.tipo_proyecto_id
      : existing?.tipo_proyecto_id,
    universidad_id: typeof overrides.universidad_id === "string"
      ? overrides.universidad_id
      : existing?.universidad_id,
    modalidad_creacion: typeof existing?.modalidad_creacion === "string" ? existing.modalidad_creacion : "directa",
    perfil_estilo_usuario: existing?.perfil_estilo_usuario ?? null,
    requiere_actualizacion: existing?.requiere_actualizacion ?? {},
    phase_contents: (overrides.phase_contents as Record<string, string | null>) ?? existing?.phase_contents ?? {},
    academic_context: (overrides.academic_context as Record<string, unknown>) ?? existing?.academic_context ?? {},
    academic_memory: (overrides.academic_memory as Record<string, unknown>) ?? existing?.academic_memory ?? {},
    final_document: overrides.final_document !== undefined
      ? (overrides.final_document as string | null)
      : existing?.final_document ?? null,
    final_document_validation: (overrides.final_document_validation as Record<string, unknown>) ?? existing?.final_document_validation ?? {},
    contenido_fase_0: (overrides.contenido_fase_0 as string | null) ?? existing?.contenido_fase_0 ?? null,
    contenido_fase_1: (overrides.contenido_fase_1 as string | null) ?? existing?.contenido_fase_1 ?? null,
    contenido_fase_2: (overrides.contenido_fase_2 as string | null) ?? existing?.contenido_fase_2 ?? null,
    contenido_fase_3: (overrides.contenido_fase_3 as string | null) ?? existing?.contenido_fase_3 ?? null,
    contenido_fase_4: (overrides.contenido_fase_4 as string | null) ?? existing?.contenido_fase_4 ?? null,
    contenido_fase_5: (overrides.contenido_fase_5 as string | null) ?? existing?.contenido_fase_5 ?? null,
    tema_aprobado: typeof row.tema_aprobado === "string" ? row.tema_aprobado : null,
    titulo_provisional: typeof row.titulo_provisional === "string" ? row.titulo_provisional : null,
    estado_fase: typeof row.estado_fase === "number" ? row.estado_fase : existing?.estado_fase ?? 0,
    completado: typeof row.completado === "boolean" ? row.completado : existing?.completado ?? false,
    oculto_por_usuario: existing?.oculto_por_usuario ?? false,
    created_at: String(row.created_at ?? existing?.created_at ?? new Date().toISOString()),
    updated_at: String(row.updated_at ?? new Date().toISOString()),
  };
}

// ── GET ───────────────────────────────────────────────────────

export async function GET(_req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    if (!isSupabaseConfigured()) {
      const p = getProyecto(id);
      if (!p) {
        return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
      }
      return NextResponse.json({
        proyecto: {
          ...p,
          active_ai_config: getServiceAIStatus(p.servicio_id),
          servicios: { id: p.servicio_id, nombre: "Monografía Académica" },
        },
      });
    }

    const db = createAdminClient();

    const { data, error } = await db
      .from("proyectos_fases")
      .select(`
        *,
        servicios ( id, nombre, descripcion, audiencia_id,
          perfiles_audiencia ( id, nombre )
        )
      `)
      .eq("id", id)
      .eq("usuario_id", user.id)
      .single();

    if (error || !data) {
      // Intentar en memoria como respaldo
      const p = getProyecto(id);
      if (p && p.usuario_id === user.id) {
        return NextResponse.json({
          proyecto: {
            ...p,
            active_ai_config: getServiceAIStatus(p.servicio_id),
            servicios: { id: p.servicio_id, nombre: "Monografía Académica" },
          },
        });
      }
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      proyecto: {
        ...data,
        active_ai_config: getServiceAIStatus(data.servicio_id),
      },
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ── PATCH ─────────────────────────────────────────────────────

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const body = await req.json();

    const allowed: Record<string, unknown> = {};
    if (typeof body.tema_aprobado === "string") allowed.tema_aprobado = body.tema_aprobado;
    if (typeof body.titulo_provisional === "string") allowed.titulo_provisional = body.titulo_provisional;
    if (typeof body.completado === "boolean") allowed.completado = body.completado;
    if (typeof body.tipo_proyecto_id === "string") allowed.tipo_proyecto_id = body.tipo_proyecto_id;
    if (typeof body.estado_fase === "number" && body.estado_fase >= 0) {
      allowed.estado_fase = body.estado_fase;
    }
    // Permitir actualización de contenido de fases (legacy 0-5)
    for (let i = 0; i <= 5; i++) {
      const key = `contenido_fase_${i}`;
      if (typeof body[key] === "string") allowed[key] = body[key];
    }
    // También permitir phase_contents para fases dinámicas
    if (body.phase_contents && typeof body.phase_contents === "object") {
      allowed.phase_contents = body.phase_contents;
    }
    if (body.academic_context && typeof body.academic_context === "object") {
      allowed.academic_context = body.academic_context;
    }
    if (body.academic_memory && typeof body.academic_memory === "object") {
      allowed.academic_memory = body.academic_memory;
    }
    if (typeof body.final_document === "string" || body.final_document === null) {
      allowed.final_document = body.final_document;
    }
    if (body.final_document_validation && typeof body.final_document_validation === "object") {
      allowed.final_document_validation = body.final_document_validation;
    }

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: "No hay campos válidos para actualizar" }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      const p = getProyecto(id);
      if (!p) {
        return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
      }
      const updated = updateProyecto(id, allowed);
      return NextResponse.json({ proyecto: updated });
    }

    const db = createAdminClient();

    const updates: UpdateTables<"proyectos_fases"> = {};
    if (typeof allowed.tema_aprobado === "string") updates.tema_aprobado = allowed.tema_aprobado;
    if (typeof allowed.titulo_provisional === "string") updates.titulo_provisional = allowed.titulo_provisional;
    if (typeof allowed.completado === "boolean") updates.completado = allowed.completado;
    if (typeof allowed.estado_fase === "number") updates.estado_fase = allowed.estado_fase as EstadoFase;

    if (Object.keys(updates).length === 0) {
      const p = getProyecto(id);
      if (p && p.usuario_id === user.id) {
        const updated = updateProyecto(id, allowed);
        return NextResponse.json({ proyecto: updated });
      }
      return NextResponse.json({ error: "No hay campos persistibles para Supabase" }, { status: 400 });
    }

    const { data, error } = await db
      .from("proyectos_fases")
      .update(updates)
      .eq("id", id)
      .eq("usuario_id", user.id)
      .select()
      .single();

    if (error || !data) {
      // Intentar en memoria como respaldo
      const p = getProyecto(id);
      if (p && p.usuario_id === user.id) {
        const updated = updateProyecto(id, allowed);
        return NextResponse.json({ proyecto: updated });
      }
      return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
    }

    upsertProyectoSnapshot(buildSnapshotFromSupabaseRow({
      row: data as unknown as Record<string, unknown>,
      existing: getProyecto(id),
      overrides: allowed,
    }));

    return NextResponse.json({ proyecto: data });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ── DELETE ────────────────────────────────────────────────────

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const memoryProject = getProyecto(id);

    if (!isSupabaseConfigured()) {
      if (!memoryProject || memoryProject.usuario_id !== user.id) {
        return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
      }
      const success = deleteProyecto(id);
      return NextResponse.json({ success });
    }

    const db = createAdminClient();

    const { data, error } = await db
      .from("proyectos_fases")
      .select("*")
      .eq("id", id)
      .eq("usuario_id", user.id)
      .maybeSingle();

    if (error) {
      if (memoryProject && memoryProject.usuario_id === user.id) {
        deleteProyecto(id);
        return NextResponse.json({ success: true, source: "memory" });
      }
      return NextResponse.json({ error: "Error al cargar el proyecto para archivarlo" }, { status: 500 });
    }

    if (!data) {
      if (memoryProject && memoryProject.usuario_id === user.id) {
        deleteProyecto(id);
        return NextResponse.json({ success: true, source: "memory" });
      }
      return NextResponse.json({ error: "Proyecto no encontrado o ya eliminado" }, { status: 404 });
    }

    const snapshot = {
      ...data,
      usuario_id: data.usuario_id,
      servicio_id: data.servicio_id,
      tipo_proyecto_id: memoryProject?.tipo_proyecto_id,
      universidad_id: memoryProject?.universidad_id,
      modalidad_creacion: memoryProject?.modalidad_creacion,
      perfil_estilo_usuario: memoryProject?.perfil_estilo_usuario ?? null,
      requiere_actualizacion: memoryProject?.requiere_actualizacion ?? {},
      phase_contents: memoryProject?.phase_contents ?? {},
      academic_context: memoryProject?.academic_context ?? {},
      academic_memory: memoryProject?.academic_memory ?? {},
      final_document: memoryProject?.final_document ?? null,
      final_document_validation: memoryProject?.final_document_validation ?? {},
      oculto_por_usuario: true,
    };
    upsertProyectoSnapshot(snapshot);

    return NextResponse.json({ success: true, source: "archived" });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
