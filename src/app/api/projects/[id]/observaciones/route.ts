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
  dbUpdateObservacion,
} from "@/lib/db/observaciones";
import { llamarIA } from "@/lib/aiProvider";

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
      tipo: undefined, // será asignado por IA
    });

    // Clasificar observación en tipo 1, 2 o 3 automáticamente
    const clasificacionPrompt = `Clasifica esta observación académica del tribunal en uno de 3 tipos:

TIPO 1 — TRIVIAL: ampliar, explicar mejor, aclarar un punto puntual. Cambios menores.
TIPO 2 — DE FORMA: redacción, estilo, ortografía, formato, presentación. Sin cambios de contenido.
TIPO 3 — DE FONDO: cambios en objetivos, argumentos, estructura lógica, conclusiones. Impacta coherencia.

Observación del tribunal: "${body.texto.trim()}"

Responde SOLO con el número: 1, 2, o 3`;

    try {
      const clasificacion = await llamarIA(
        "Eres un clasificador de observaciones académicas. Clasifica según los 3 tipos dados.",
        clasificacionPrompt,
        200,
        proyecto.servicio_id ?? "mono-001"
      );
      const tipoStr = clasificacion.text.trim().match(/[123]/)?.[0];
      const tipo = (tipoStr ? parseInt(tipoStr) : 1) as 1 | 2 | 3;

      // Actualizar observación con tipo
      const obsConTipo = {
        ...obs,
        tipo,
      };
      // Guardar tipo directamente en db actualizando
      const dbObs = dbUpdateObservacion(obs.id, { tipo });

      return NextResponse.json({ ok: true, observacion: dbObs || obsConTipo }, { status: 201 });
    } catch {
      // Si falla la clasificación, defaultear a tipo 1
      return NextResponse.json({ ok: true, observacion: { ...obs, tipo: 1 } }, { status: 201 });
    }
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
