import { NextResponse } from "next/server";
import { getCitas } from "@/lib/memoryStore";

type Params = Promise<{ monografia_id: string }>;

// GET /api/citas/[monografia_id] — todas las citas de una monografía
export async function GET(_req: Request, { params }: { params: Params }) {
  const { monografia_id } = await params;

  const citas = getCitas(monografia_id);
  citas.sort((a, b) => a.autor.localeCompare(b.autor));

  // Group by chapter
  const porCapitulo: Record<string, typeof citas> = {};
  for (const cita of citas) {
    const key = cita.capitulo ? `cap${cita.capitulo}` : "sin_capitulo";
    if (!porCapitulo[key]) porCapitulo[key] = [];
    porCapitulo[key].push(cita);
  }

  return NextResponse.json({
    monografia_id,
    total: citas.length,
    citas_por_capitulo: porCapitulo,
    bibliografia_apa: citas
      .filter(c => c.formato_apa)
      .map(c => c.formato_apa),
  });
}
