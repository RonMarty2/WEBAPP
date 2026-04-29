import { NextResponse } from "next/server";
import {
  getMonografia,
  updateMonografia,
  getCapitulos,
  getCitas,
  getDocumentos,
} from "@/lib/memoryStore";

type Params = Promise<{ id: string }>;

// GET /api/monografias/[id] — detalle completo con capítulos, citas y documentos
export async function GET(_req: Request, { params }: { params: Params }) {
  const { id } = await params;
  const monografia = getMonografia(id);
  if (!monografia) {
    return NextResponse.json({ error: "Monografía no encontrada" }, { status: 404 });
  }
  const capitulos = getCapitulos(id);
  const citas = getCitas(id);
  const documentos = getDocumentos(id);

  return NextResponse.json({ monografia, capitulos, citas, documentos });
}

// PUT /api/monografias/[id] — actualizar campos de la monografía
export async function PUT(req: Request, { params }: { params: Params }) {
  const { id } = await params;
  const monografia = getMonografia(id);
  if (!monografia) {
    return NextResponse.json({ error: "Monografía no encontrada" }, { status: 404 });
  }

  try {
    const updates = await req.json();
    // Prevent overwriting id/created_at
    delete updates.id;
    delete updates.created_at;

    const updated = updateMonografia(id, updates);
    return NextResponse.json({ monografia: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
