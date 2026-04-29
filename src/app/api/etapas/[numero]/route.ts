import { NextResponse } from "next/server";
import {
  getMonografia,
  getCapitulo,
  getCitas,
  upsertCapitulo,
} from "@/lib/memoryStore";

type Params = Promise<{ numero: string }>;

// GET /api/etapas/[numero]?monografia_id=...
// Returns current state of a stage (content + citations)
export async function GET(req: Request, { params }: { params: Params }) {
  const { numero } = await params;
  const { searchParams } = new URL(req.url);
  const monografiaId = searchParams.get("monografia_id");

  if (!monografiaId) {
    return NextResponse.json({ error: "monografia_id requerido como query param" }, { status: 400 });
  }

  const etapa = parseInt(numero, 10);
  if (isNaN(etapa) || etapa < 0 || etapa > 3) {
    return NextResponse.json({ error: "Etapa debe ser 0, 1, 2 o 3" }, { status: 400 });
  }

  const monografia = getMonografia(monografiaId);
  if (!monografia) {
    return NextResponse.json({ error: "Monografía no encontrada" }, { status: 404 });
  }

  const capitulo = getCapitulo(monografiaId, etapa);
  const citas = getCitas(monografiaId).filter(c => c.capitulo === etapa);

  if (!capitulo) {
    return NextResponse.json({
      etapa,
      status: "pendiente",
      mensaje: `La Etapa ${etapa} aún no ha sido generada`,
      citas: [],
    });
  }

  return NextResponse.json({
    etapa,
    status: capitulo.status,
    contenido: capitulo.contenido,
    output_json: capitulo.contenido_json,
    latex_source: capitulo.latex_source,
    observaciones: capitulo.observaciones,
    citas,
    updated_at: capitulo.updated_at,
  });
}

// PATCH /api/etapas/[numero] — aprobar o cambiar status de un capítulo
export async function PATCH(req: Request, { params }: { params: Params }) {
  const { numero } = await params;
  const etapa = parseInt(numero, 10);

  try {
    const body = await req.json();
    const { monografia_id, status, latex_source } = body;

    if (!monografia_id) {
      return NextResponse.json({ error: "monografia_id requerido" }, { status: 400 });
    }

    const capitulo = getCapitulo(monografia_id, etapa);
    if (!capitulo) {
      return NextResponse.json({ error: `Etapa ${etapa} no encontrada` }, { status: 404 });
    }

    const updated = upsertCapitulo({
      monografia_id,
      numero: etapa,
      contenido: capitulo.contenido,
      contenido_json: capitulo.contenido_json,
      status: status ?? capitulo.status,
      latex_source: latex_source ?? capitulo.latex_source,
      observaciones: capitulo.observaciones,
    });

    return NextResponse.json({ capitulo: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
