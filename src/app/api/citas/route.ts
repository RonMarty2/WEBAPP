import { NextResponse } from "next/server";
import { addCita, getCitas } from "@/lib/memoryStore";
import { formatoAPA7 } from "@/lib/validaciones";

// POST /api/citas — registrar una cita manualmente
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      monografia_id,
      autor,
      ano,
      titulo_obra,
      fuente,
      tipo = "libro",
      formato_apa,
      capitulo,
      usado_en_parrafo,
    } = body;

    if (!monografia_id || !autor || !titulo_obra) {
      return NextResponse.json(
        { error: "Campos requeridos: monografia_id, autor, titulo_obra" },
        { status: 400 }
      );
    }

    // Auto-generate APA 7 if not provided
    const apaFinal =
      formato_apa ??
      (ano && fuente ? formatoAPA7(autor, ano, titulo_obra, fuente, tipo) : undefined);

    const cita = addCita({
      monografia_id,
      autor,
      ano: ano ? parseInt(String(ano), 10) : undefined,
      titulo_obra,
      fuente,
      tipo,
      formato_apa: apaFinal,
      capitulo: capitulo ? parseInt(String(capitulo), 10) : undefined,
      usado_en_parrafo,
      es_consultado: true,
    });

    return NextResponse.json({ cita }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/citas?monografia_id=... — listar citas
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const monografiaId = searchParams.get("monografia_id");

  if (!monografiaId) {
    return NextResponse.json({ error: "monografia_id requerido" }, { status: 400 });
  }

  const capituloFilter = searchParams.get("capitulo");
  let citas = getCitas(monografiaId);

  if (capituloFilter) {
    const cap = parseInt(capituloFilter, 10);
    citas = citas.filter(c => c.capitulo === cap);
  }

  // Sort alphabetically by author
  citas.sort((a, b) => a.autor.localeCompare(b.autor));

  return NextResponse.json({ citas, total: citas.length });
}
