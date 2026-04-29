import { NextResponse } from "next/server";
import { getDocumentos } from "@/lib/memoryStore";

type Params = Promise<{ monografia_id: string }>;

// GET /api/documentos/[monografia_id]
export async function GET(_req: Request, { params }: { params: Params }) {
  const { monografia_id } = await params;

  const documentos = getDocumentos(monografia_id);

  return NextResponse.json({
    monografia_id,
    total: documentos.length,
    documentos: documentos.map(d => ({
      id: d.id,
      nombre: d.nombre,
      tipo: d.tipo,
      capitulo_asignado: d.capitulo_asignado,
      es_relevante: d.es_relevante,
      tiene_texto: !!d.contenido_extraido,
      preview: d.contenido_extraido?.slice(0, 200) ?? null,
      created_at: d.created_at,
    })),
  });
}
