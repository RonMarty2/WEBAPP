/**
 * GET  /api/projects/[id]/observaciones  — Listar observaciones del proyecto
 * POST /api/projects/[id]/observaciones  — Crear nueva observación
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import {
  dbListObservaciones,
  dbCreateObservacion,
} from "@/lib/db/observaciones";

type Params = Promise<{ id: string }>;

export async function GET(_req: Request, { params }: { params: Params }) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const proyecto = await dbGetProyecto(id);
    if (!proyecto || (proyecto.usuario_id !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    const observaciones = dbListObservaciones(id);
    return NextResponse.json({ ok: true, observaciones });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Params }) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const proyecto = await dbGetProyecto(id);
    if (!proyecto || (proyecto.usuario_id !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({})) as {
      texto?: string;
      capitulo_afectado?: string;
      notas_usuario?: string;
    };

    if (!body.texto?.trim()) {
      return NextResponse.json({ error: "El texto de la observación es requerido" }, { status: 400 });
    }

    const obs = dbCreateObservacion({
      proyecto_id: id,
      texto: body.texto.trim(),
      capitulo_afectado: body.capitulo_afectado,
      notas_usuario: body.notas_usuario?.trim(),
      estado: "pendiente",
    });

    return NextResponse.json({ ok: true, observacion: obs }, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
